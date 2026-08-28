import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Page, PageHeader, Card, Icon, Btn, Tag, Modal, Field, Avatar,
  EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { imageUrl } from '../utils/upload';
import { storeUrl } from '../utils/storeHost';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

function relativeTime(v) {
  const mins = Math.floor((Date.now() - new Date(v).getTime()) / 60000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kecha';
  if (days < 7) return `${days} kun oldin`;
  return new Date(v).toLocaleDateString('ru-RU');
}

const TABS = [
  { id: 'online_pending', label: 'Yangi', icon: 'bell' },
  { id: 'completed', label: 'Qabul qilingan', icon: 'check-circle' },
  { id: 'rejected', label: 'Rad etilgan', icon: 'x-circle' },
];

/* ══════════════════════════════════════════════════════════════════════════
   Onlayn buyurtmalar

   Mijoz katalogdan buyurtma berganda tranzaksiya `online_pending` holatida
   yoziladi va ombor tegilmaydi. Do'kon egasi shu yerda ko'radi:

     Qabul qilish  → ombordan yechiladi, sotuv sifatida yoziladi
     Rad etish     → holat `rejected` ga o'tadi, ombor o'zgarmaydi

   Ombor faqat qabul qilinganda kamayadi — mijoz telefonini ko'tarmasa
   yoki voz kechsa, tovar qamalib qolmasin.
   ══════════════════════════════════════════════════════════════════════ */

export default function Orders() {
  const { user, refreshAlerts } = useAuth();

  const [tab, setTab] = useState('online_pending');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState({});
  const [detail, setDetail] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const [txnRes, custRes] = await Promise.all([
      // Onlayn buyurtma — to'lov turi bo'yicha aniqlanadi. Qabul qilingani
      // 'completed' bo'ladi va oddiy sotuv kabi hisobotlarga tushadi.
      supabase.from('transactions').select('*').eq('store_id', storeId)
        .eq('payment_method', 'online')
        .gte('date', new Date(Date.now() - 180 * 86400000).toISOString())
        .order('date', { ascending: false }),
      supabase.from('customers').select('id, name, phone').eq('store_id', storeId),
    ]);
    setOrders(txnRes.data || []);
    setCustomers(Object.fromEntries((custRes.data || []).map(c => [c.id, c])));
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  const counts = useMemo(() => {
    const c = { online_pending: 0, completed: 0, rejected: 0 };
    orders.forEach(o => { if (c[o.status] !== undefined) c[o.status]++; });
    return c;
  }, [orders]);

  const shown = useMemo(() => orders.filter(o => o.status === tab), [orders, tab]);

  /* ── Qabul qilish: ombordan yechib, sotuvga aylantiramiz ── */
  const accept = async (order) => {
    setBusyId(order.id);

    // Ombordan yechish bazada: qoldiq yetmasa hech narsa o'zgarmaydi
    // va tushunarli xato qaytadi
    const { error: stockErr } = await supabase.rpc('apply_sale', {
      p_txn: order.id,
      p_actor: user?.name,
    });

    if (stockErr) {
      setBusyId(null);
      setToast({ msg: stockErr.message, variant: 'dang' });
      return;
    }

    const { error } = await supabase.from('transactions')
      .update({ status: 'completed' }).eq('id', order.id);

    if (order.customer_id) {
      await supabase.rpc('increment_customer_spent', { cid: order.customer_id, amnt: order.total });
    }

    setBusyId(null);
    if (error) {
      setToast({ msg: `Saqlanmadi: ${error.message}`, variant: 'dang' });
      return;
    }
    setDetail(null);
    load(user.store_id);
    refreshAlerts();
    setToast({ msg: `Buyurtma qabul qilindi · ${money(order.total)} so‘m`, variant: 'ok' });
  };

  /* ── Rad etish: ombor tegilmaydi ── */
  const reject = async (order, reason) => {
    setBusyId(order.id);
    const { error } = await supabase.from('transactions').update({
      status: 'rejected',
      cashier: `${order.cashier} · Rad etildi: ${reason}`,
    }).eq('id', order.id);
    setBusyId(null);
    setRejecting(null);
    setDetail(null);
    if (error) setToast({ msg: `Saqlanmadi: ${error.message}`, variant: 'dang' });
    else { load(user.store_id); setToast({ msg: 'Buyurtma rad etildi', variant: 'ok' }); }
  };

  const link = storeUrl(user?.storeSlug || user?.store_id);
  const copyLink = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Page>
      <PageHeader title="Buyurtmalar" subtitle="Onlayn do‘kondan kelgan buyurtmalar">
        <Btn variant="secondary" icon={copied ? 'check' : 'link'} onClick={copyLink}>
          {copied ? 'Nusxalandi' : 'Do‘kon havolasi'}
        </Btn>
      </PageHeader>

      {/* Tablar */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--color-divider)' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          const n = counts[t.id];
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 14px', border: 0, background: 'none', cursor: 'pointer',
              font: 'inherit', fontSize: 13, fontWeight: active ? 500 : 400,
              color: active ? 'var(--color-accent)' : 'var(--color-neutral-500)',
              boxShadow: active ? 'inset 0 -2px 0 var(--color-accent)' : 'none',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <Icon name={t.icon} size={15} />
              {t.label}
              {n > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 600, minWidth: 17, height: 17, padding: '0 5px',
                  borderRadius: 9, display: 'inline-grid', placeItems: 'center',
                  background: t.id === 'online_pending' ? 'var(--warnbg)' : 'color-mix(in srgb, var(--color-text) 8%, transparent)',
                  color: t.id === 'online_pending' ? 'var(--warn)' : 'var(--color-neutral-400)',
                }}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card padding="var(--space-6)"><SkeletonRows count={4} widths={['100%']} /></Card>
      ) : shown.length === 0 ? (
        <Card padding="var(--space-6)">
          {tab === 'online_pending' ? (
            <EmptyState
              icon="bell" text="Yangi buyurtma yo‘q"
              sub="Onlayn do‘kon havolasini mijozlarga yuboring — buyurtmalar shu yerda paydo bo‘ladi"
              action={<Btn variant="primary" size="sm" icon={copied ? 'check' : 'link'} onClick={copyLink}>
                {copied ? 'Nusxalandi' : 'Havolani nusxalash'}
              </Btn>}
            />
          ) : (
            <EmptyState icon={tab === 'completed' ? 'check-circle' : 'x-circle'}
              text={tab === 'completed' ? 'Qabul qilingan buyurtma yo‘q' : 'Rad etilgan buyurtma yo‘q'} />
          )}
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {shown.map(o => (
            <OrderCard
              key={o.id} order={o}
              customer={customers[o.customer_id]}
              busy={busyId === o.id}
              onOpen={() => setDetail(o)}
              onAccept={() => accept(o)}
              onReject={() => setRejecting(o)}
            />
          ))}
        </div>
      )}

      {detail && (
        <OrderDetail
          order={detail}
          customer={customers[detail.customer_id]}
          busy={busyId === detail.id}
          onClose={() => setDetail(null)}
          onAccept={() => accept(detail)}
          onReject={() => setRejecting(detail)}
        />
      )}

      {rejecting && (
        <RejectModal
          order={rejecting}
          busy={busyId === rejecting.id}
          onClose={() => setRejecting(null)}
          onConfirm={reason => reject(rejecting, reason)}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

/* ── Buyurtma kartochkasi ──────────────────────────────────────────────── */
function OrderCard({ order, customer, busy, onOpen, onAccept, onReject }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const name = customer?.name || order.cashier?.replace(/^Saytdan:\s*/, '') || 'Noma\'lum';
  const pending = order.status === 'online_pending';

  return (
    <Card padding="var(--space-6)" gap={11}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        <Avatar initials={initialsOf(name)} size={36} color="var(--color-neutral-800)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
          {customer?.phone && (
            <a href={`tel:${customer.phone.replace(/\s/g, '')}`} className="num"
              style={{ fontSize: 12, color: 'var(--color-accent)' }}>
              {customer.phone}
            </a>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontSize: 15, fontWeight: 600 }}>{money(order.total)}</div>
          <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>{relativeTime(order.date)}</div>
        </div>
      </div>

      <button onClick={onOpen} className="row-link" style={{ gap: 8 }}>
        <span style={{ flex: 1, fontSize: 12.5, color: 'var(--color-neutral-400)', textAlign: 'left' }}>
          {items.length} xil tovar · {items.reduce((s, i) => s + (i.qty || 0), 0)} dona
        </span>
        <Icon name="caret-right" size={13} color="var(--color-neutral-600)" />
      </button>

      {pending ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="primary" icon="check" onClick={onAccept} loading={busy} style={{ flex: 1, justifyContent: 'center' }}>
            Qabul qilish
          </Btn>
          <Btn variant="secondary" icon="x" onClick={onReject} disabled={busy}>Rad etish</Btn>
        </div>
      ) : (
        <div>
          <Tag variant={order.status === 'rejected' ? 'dang' : 'ok'}>
            {order.status === 'rejected' ? 'Rad etilgan' : 'Qabul qilingan'}
          </Tag>
        </div>
      )}
    </Card>
  );
}

/* ── Buyurtma tafsiloti ────────────────────────────────────────────────── */
function OrderDetail({ order, customer, busy, onClose, onAccept, onReject }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const name = customer?.name || order.cashier?.replace(/^Saytdan:\s*/, '') || 'Noma\'lum';
  const pending = order.status === 'online_pending';

  return (
    <Modal
      title={`Buyurtma ${order.receipt_no || ''}`}
      onClose={onClose}
      actions={pending ? (
        <>
          <Btn variant="secondary" icon="x" onClick={onReject} disabled={busy}>Rad etish</Btn>
          <Btn variant="primary" icon="check" onClick={onAccept} loading={busy}>Qabul qilish</Btn>
        </>
      ) : null}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <Avatar initials={initialsOf(name)} size={40} color="var(--color-neutral-800)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>{relativeTime(order.date)}</div>
          </div>
          {customer?.phone && (
            <Btn variant="secondary" size="sm" icon="phone"
              onClick={() => { window.location.href = `tel:${customer.phone.replace(/\s/g, '')}`; }}>
              Qo‘ng‘iroq
            </Btn>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < items.length - 1 ? '1px solid var(--color-divider)' : 'none',
            }}>
              {it.photo_url
                ? <img src={imageUrl(it.photo_url)} alt="" style={{
                    width: 40, height: 40, flex: 'none', objectFit: 'cover',
                    borderRadius: 6, border: '1px solid var(--color-divider)',
                  }} />
                : <span style={{
                    width: 40, height: 40, flex: 'none', display: 'grid', placeItems: 'center',
                    fontSize: 20, borderRadius: 6,
                    background: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                  }}>{it.image || '📦'}</span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{it.phone_model || it.name}</div>
                <div className="num" style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                  {it.qty} × {money(it.price)}
                </div>
              </div>
              <div className="num" style={{ fontSize: 13, fontWeight: 500 }}>
                {money((it.price || 0) * (it.qty || 0))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '11px 13px', borderRadius: 9,
          background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Jami</span>
          <span className="num" style={{ fontSize: 17, fontWeight: 600 }}>{money(order.total)} so‘m</span>
        </div>

        {pending && (
          <div style={{
            display: 'flex', gap: 9, alignItems: 'flex-start',
            padding: '10px 12px', borderRadius: 8, background: 'var(--warnbg)',
          }}>
            <Icon name="info" fill size={14} color="var(--warn)" style={{ marginTop: 1 }} />
            <span style={{ fontSize: 11.5, color: 'var(--warn)', lineHeight: 1.45 }}>
              Ombor hozircha kamaymagan. Qabul qilganingizda tovarlar yechiladi
              va bu sotuv sifatida hisobga olinadi.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ── Rad etish sababi ──────────────────────────────────────────────────── */
function RejectModal({ order, busy, onClose, onConfirm }) {
  const REASONS = ['Tovar qolmagan', 'Mijoz javob bermadi', 'Mijoz voz kechdi', 'Boshqa sabab'];
  const [reason, setReason] = useState(REASONS[0]);
  const [other, setOther] = useState('');
  const final = reason === 'Boshqa sabab' ? other.trim() : reason;

  return (
    <Modal onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="danger" icon="x" disabled={!final} loading={busy}
          onClick={() => onConfirm(final)}>Rad etish</Btn>
      </>
    }>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 12 }}>
        <Icon name="warning" fill size={20} color="var(--warn)" />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 500 }}>Buyurtmani rad etish?</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', marginTop: 3 }}>
            Ombor o‘zgarmaydi. Mijoz bilan o‘zingiz bog‘lanib xabar bering.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {REASONS.map(r => (
          <button key={r} onClick={() => setReason(r)} style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px',
            borderRadius: 8, cursor: 'pointer', font: 'inherit', fontSize: 13, textAlign: 'left',
            border: `1px solid ${reason === r ? 'var(--color-accent)' : 'var(--color-divider)'}`,
            background: reason === r ? 'var(--color-accent-900)' : 'transparent',
            color: reason === r ? 'var(--color-text)' : 'var(--color-neutral-400)',
          }}>
            <Icon name={reason === r ? 'radio-button' : 'circle'} fill={reason === r} size={15}
              color={reason === r ? 'var(--color-accent)' : 'currentColor'} />
            {r}
          </button>
        ))}
      </div>

      {reason === 'Boshqa sabab' && (
        <Field label="Sabab" style={{ marginTop: 10 }}>
          <input className="input" autoFocus value={other} onChange={e => setOther(e.target.value)}
            placeholder="Qisqacha yozing" />
        </Field>
      )}
    </Modal>
  );
}
