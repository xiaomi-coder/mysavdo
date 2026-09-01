import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Page, PageHeader, Card, Icon, Btn, Tag, Modal, Field, StatCard,
  EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   Sotuvlar tarixi va qaytarish (vozvrat) — veb

   Mobil ilovada bu allaqachon bor edi, vebda yo'q edi. Mantiq AYNAN
   bir xil bo'lishi shart, aks holda ikki tomondan qaytarilgan tovar
   qoldig'i bir-biriga to'g'ri kelmaydi:

     · asl chek o'zgarmaydi (mijozdagi qog'oz bilan mos tursin)
     · qaytarish alohida manfiy yozuv: receipt_no = "<asl>-Q"
     · ombor `move_stock` bilan "qaytarish" turida tiklanadi
     · qisman qaytarish mumkin, ikki marta qaytarib bo'lmaydi
   ══════════════════════════════════════════════════════════════════════ */

const DAY = 86400000;
const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const timeShort = d => new Date(d).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
const dateShort = d => new Date(d).toLocaleDateString('uz-UZ');

const RANGES = [
  { key: 'today', label: 'Bugun' },
  { key: 'yesterday', label: 'Kecha' },
  { key: 'week', label: '7 kun' },
  { key: 'month', label: 'Oy' },
];

const PAY_LABEL = {
  cash: 'Naqd', card: 'Plastik', transfer: 'O‘tkazma',
  nasiya: 'Nasiya', online: 'Onlayn',
};

const todayStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };

export default function Sales() {
  const { user } = useAuth();
  const [range, setRange] = useState('today');
  const [q, setQ] = useState('');
  const [rows, setRows] = useState(null);
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const bounds = useMemo(() => {
    const t0 = todayStart();
    switch (range) {
      case 'yesterday': return { a: t0 - DAY, b: t0 };
      case 'week': return { a: t0 - 6 * DAY, b: t0 + DAY };
      case 'month': return { a: t0 - 29 * DAY, b: t0 + DAY };
      default: return { a: t0, b: t0 + DAY };
    }
  }, [range]);

  const load = useCallback(async () => {
    if (!user?.store_id) return;
    setRows(null);
    const { data } = await supabase.from('transactions').select('*')
      .eq('store_id', user.store_id)
      .gte('date', new Date(bounds.a).toISOString())
      .lt('date', new Date(bounds.b).toISOString())
      .order('date', { ascending: false }).limit(2000);
    setRows(data || []);
  }, [user?.store_id, bounds.a, bounds.b]);

  useEffect(() => { load(); }, [load]);

  /* Qidiruv: chek raqami, tovar nomi, sotuvchi, summa */
  const visible = useMemo(() => {
    const list = (rows || []).filter(x => x.status === 'completed' || x.status === 'returned');
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    const digits = needle.replace(/\D/g, '');
    return list.filter(x => {
      if (String(x.receipt_no || '').toLowerCase().includes(needle)) return true;
      if (String(x.cashier || '').toLowerCase().includes(needle)) return true;
      const items = Array.isArray(x.items) ? x.items : [];
      if (items.some(it => String(it.name || '').toLowerCase().includes(needle))) return true;
      if (digits && String(Math.abs(Math.round(Number(x.total) || 0))).includes(digits)) return true;
      return false;
    });
  }, [rows, q]);

  const sum = useMemo(() => {
    const total = visible.reduce((s, x) => s + Number(x.total || 0), 0);
    const returns = visible.filter(x => x.status === 'returned');
    return {
      total,
      count: visible.filter(x => x.status === 'completed').length,
      returns: returns.length,
      returnSum: Math.abs(returns.reduce((s, x) => s + Number(x.total || 0), 0)),
    };
  }, [visible]);

  return (
    <Page>
      <PageHeader title="Sotuvlar tarixi"
        subtitle="Chekni topib qaytarish (vozvrat) qilish shu yerdan" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <StatCard label="Tushum" value={money(sum.total)} unit="so‘m" icon="wallet" />
        <StatCard label="Cheklar" value={sum.count} unit="ta" icon="receipt" />
        <StatCard label="Qaytarish" value={sum.returns} unit="ta" icon="arrow-u-left-up"
          accent={sum.returns ? 'var(--dang)' : undefined} />
        <StatCard label="Qaytarilgan summa" value={money(sum.returnSum)} unit="so‘m"
          icon="arrow-counter-clockwise" accent={sum.returnSum ? 'var(--dang)' : undefined} />
      </div>

      {/* Davr + qidiruv */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)}
              style={{
                padding: '7px 14px', borderRadius: 16, cursor: 'pointer', font: 'inherit', fontSize: 12.5,
                border: `1px solid ${range === r.key ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                background: range === r.key ? 'var(--color-accent-900)' : 'transparent',
                color: range === r.key ? 'var(--color-accent)' : 'var(--color-neutral-400)',
              }}>{r.label}</button>
          ))}
        </div>
        <div style={{
          flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 9,
          padding: '0 12px', minHeight: 38, borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-divider)', background: 'var(--color-surface)',
        }}>
          <Icon name="magnifying-glass" size={15} color="var(--color-neutral-500)" />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Chek raqami, tovar, sotuvchi yoki summa"
            style={{ flex: 1, background: 'none', border: 0, outline: 'none', font: 'inherit', fontSize: 13.5, color: 'var(--color-text)' }} />
          {q && <Icon name="x-circle" size={16} color="var(--color-neutral-500)"
            style={{ cursor: 'pointer' }} onClick={() => setQ('')} />}
        </div>
      </div>

      {rows === null ? <SkeletonRows count={5} widths={['100%']} />
        : visible.length === 0 ? (
          <EmptyState icon="receipt" text="Bu davrda sotuv yo‘q"
            sub={q ? 'Qidiruvni o‘zgartiring yoki boshqa davrni tanlang' : 'Boshqa davrni tanlang'} />
        ) : (
          <Card padding={0}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Vaqt</th><th>Chek</th><th>Tovarlar</th><th>Sotuvchi</th>
                    <th>To‘lov</th><th style={{ textAlign: 'right' }}>Summa</th><th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map(x => {
                    const items = Array.isArray(x.items) ? x.items : [];
                    const back = x.status === 'returned';
                    const label = items.length === 0 ? '—'
                      : items.length === 1 ? items[0].name
                        : `${items[0].name} +${items.length - 1}`;
                    return (
                      <tr key={x.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(x)}>
                        <td className="num" style={{ color: 'var(--color-neutral-500)' }}>
                          {timeShort(x.date)}
                          <div style={{ fontSize: 11 }}>{dateShort(x.date)}</div>
                        </td>
                        <td className="num">{x.receipt_no}</td>
                        <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {label}
                        </td>
                        <td style={{ color: 'var(--color-neutral-400)' }}>
                          {String(x.cashier || '').split('·')[0].trim()}
                        </td>
                        <td>
                          {back ? <Tag variant="dang">Qaytarish</Tag>
                            : <span style={{ fontSize: 12.5, color: 'var(--color-neutral-400)' }}>
                              {PAY_LABEL[x.payment_method] || x.payment_method}
                            </span>}
                        </td>
                        <td className="num" style={{
                          textAlign: 'right', fontWeight: 500,
                          color: back ? 'var(--dang)' : 'inherit',
                        }}>{money(x.total)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Icon name="caret-right" size={15} color="var(--color-neutral-500)" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      {detail && (
        <ReceiptModal
          tx={detail}
          all={rows || []}
          user={user}
          onClose={() => setDetail(null)}
          onReturned={(msg) => { setDetail(null); setToast({ msg, variant: 'ok' }); load(); }}
          onError={(msg) => setToast({ msg, variant: 'dang' })}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

/* ── Chek va qaytarish ─────────────────────────────────────────────────── */
function ReceiptModal({ tx, all, user, onClose, onReturned, onError }) {
  const [picked, setPicked] = useState({});
  const [reason, setReason] = useState('Mijoz qaytardi');
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => (Array.isArray(tx.items) ? tx.items : []), [tx]);
  const isReturn = tx.status === 'returned';

  /* Shu chekdan avval nima qaytarilgan — ikki marta qaytarmaslik uchun */
  const alreadyReturned = useMemo(() => {
    const map = {};
    all.filter(x => x.status === 'returned' && x.receipt_no === `${tx.receipt_no}-Q`)
      .forEach(x => {
        (Array.isArray(x.items) ? x.items : []).forEach(it => {
          map[it.id] = (map[it.id] || 0) + (it.qty || 1);
        });
      });
    return map;
  }, [all, tx]);

  const refund = useMemo(
    () => items.reduce((s, it) => s + (picked[it.id] || 0) * Number(it.price || 0), 0),
    [items, picked]
  );

  const anyReturnable = items.some(it => (it.qty || 1) - (alreadyReturned[it.id] || 0) > 0);

  const toggle = (it) => {
    const left = (it.qty || 1) - (alreadyReturned[it.id] || 0);
    if (left <= 0) return;
    setPicked(p => {
      const next = { ...p };
      if (next[it.id]) delete next[it.id];
      else next[it.id] = left;
      return next;
    });
  };

  const doReturn = async () => {
    const chosen = items.filter(it => picked[it.id] > 0);
    if (chosen.length === 0) return;
    setBusy(true);

    /* Omborni tiklaymiz. move_stock — qisman qaytarish uchun;
       revert_sale butun chekni qaytaradi, bizga bu yaramaydi. */
    for (const it of chosen) {
      if (String(it.id).startsWith('custom-')) continue;   // omborda yo'q tovar
      const { error } = await supabase.rpc('move_stock', {
        p_product: it.id,
        p_qty: picked[it.id],
        p_type: 'qaytarish',
        p_note: reason,
        p_actor: user?.name,
        p_txn: tx.id,
      });
      if (error) { setBusy(false); onError(`Ombor yangilanmadi: ${error.message}`); return; }
    }

    /* Joriy ochiq smenaga bog'laymiz — naqd qaytarish kassadan chiqim */
    let shiftId = null;
    if (user?.store_id && user?.name) {
      const { data: sh } = await supabase.from('shifts').select('id')
        .eq('store_id', user.store_id).eq('cashier', user.name).eq('status', 'open')
        .order('opened_at', { ascending: false }).limit(1);
      shiftId = sh?.[0]?.id ?? null;
    }

    const { error } = await supabase.from('transactions').insert({
      store_id: tx.store_id,
      customer_id: tx.customer_id,
      receipt_no: `${tx.receipt_no}-Q`,
      cashier: `${user?.name} · qaytarish: ${reason}`,
      items: chosen.map(it => ({ ...it, qty: picked[it.id] })),
      total: -refund,
      discount: 0,
      payment_method: tx.payment_method,
      status: 'returned',
      shift_id: shiftId,
    });

    setBusy(false);
    if (error) { onError(`Qaytarish yozilmadi: ${error.message}`); return; }
    onReturned(`Qaytarildi · ${money(refund)} so‘m`);
  };

  return (
    <Modal title={`Chek ${tx.receipt_no}`} onClose={onClose} wide
      actions={
        isReturn || !anyReturnable ? (
          <Btn variant="secondary" onClick={onClose}>Yopish</Btn>
        ) : (
          <>
            <Btn variant="secondary" onClick={onClose}>Yopish</Btn>
            <Btn variant="danger" icon="arrow-u-left-up" onClick={doReturn}
              loading={busy} disabled={refund <= 0}>
              Qaytarish {refund > 0 ? `· ${money(refund)}` : ''}
            </Btn>
          </>
        )
      }>
      <div style={{ display: 'flex', gap: 18, fontSize: 12.5, color: 'var(--color-neutral-400)', marginBottom: 12 }}>
        <span>{dateShort(tx.date)} · {timeShort(tx.date)}</span>
        <span>{String(tx.cashier || '').split('·')[0].trim()}</span>
        <span>{PAY_LABEL[tx.payment_method] || tx.payment_method}</span>
      </div>

      {isReturn && (
        <div style={{
          padding: 11, borderRadius: 'var(--radius-md)', background: 'var(--dangbg)',
          color: 'var(--dang)', fontSize: 13, marginBottom: 12,
        }}>
          Bu qaytarish yozuvi — asl chek emas.
        </div>
      )}

      {!isReturn && anyReturnable && (
        <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', marginBottom: 10 }}>
          Qaytariladigan tovarni belgilang. Ombor qoldig‘i o‘zi tiklanadi.
        </div>
      )}

      <div style={{ border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {items.map((it, i) => {
          const done = alreadyReturned[it.id] || 0;
          const left = (it.qty || 1) - done;
          const on = picked[it.id] > 0;
          const can = !isReturn && left > 0;
          return (
            <div key={String(it.id) + i}
              onClick={can ? () => toggle(it) : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px',
                borderTop: i === 0 ? 0 : '1px solid var(--color-divider)',
                cursor: can ? 'pointer' : 'default',
                background: on ? 'var(--color-accent-900)' : 'transparent',
                opacity: left <= 0 && !isReturn ? 0.5 : 1,
              }}>
              {can && (
                <Icon name={on ? 'check-square' : 'square'} size={18}
                  color={on ? 'var(--color-accent)' : 'var(--color-neutral-600)'} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5 }}>{it.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                  {it.qty} × {money(it.price)}
                  {done > 0 ? ` · ${done} ta qaytarilgan` : ''}
                </div>
              </div>
              <span className="num" style={{ fontSize: 13.5, fontWeight: 500 }}>
                {money((it.qty || 1) * Number(it.price || 0))}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-divider)',
      }}>
        <span style={{ fontSize: 14 }}>Chek summasi</span>
        <span className="num" style={{ fontSize: 19, fontWeight: 600 }}>{money(tx.total)}</span>
      </div>

      {!isReturn && anyReturnable && (
        <Field label="Qaytarish sababi" style={{ marginTop: 12 }}>
          <input className="input" value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Masalan: nuqsonli, o‘lchami to‘g‘ri kelmadi" />
        </Field>
      )}
    </Modal>
  );
}
