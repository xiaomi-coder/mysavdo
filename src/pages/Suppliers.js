import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Page, PageHeader, Card, SectionHeader, Icon, Btn, Tag, Modal, Field,
  Avatar, StatCard, EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   Ta'minotchilar

   Nasiya bo'limi mijozning BIZGA qarzini yuritadi. Bu sahifa esa
   teskarisini: biz KIMGA qancha qarzdormiz.

   Qarzni ilova hisoblamaydi — baza hisoblaydi (`supplier_balances`):
       olingan tovar − yuk kelganda to'langani − keyingi to'lovlar
   Bu joyda qo'lda hisoblash xato qilishga juda qulay va oqibati og'ir,
   shuning uchun bitta manbadan olinadi.
   ══════════════════════════════════════════════════════════════════════ */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const dateFmt = d => (d ? new Date(d).toLocaleDateString('uz-UZ') : '—');
const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

const METHODS = [
  { value: 'cash', label: 'Naqd' },
  { value: 'card', label: 'Karta' },
  { value: 'transfer', label: "O'tkazma" },
];

export default function Suppliers() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);      // null | 'new' | ta'minotchi
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const { data } = await supabase.from('supplier_balances').select('*')
      .eq('store_id', storeId).order('balance', { ascending: false });
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.store_id) load(user.store_id);
  }, [user, load]);

  const stats = useMemo(() => {
    const owing = rows.filter(x => Number(x.balance) > 0);
    return {
      total: rows.length,
      owing: owing.length,
      debt: owing.reduce((s, x) => s + Number(x.balance || 0), 0),
      purchased: rows.reduce((s, x) => s + Number(x.purchased || 0), 0),
    };
  }, [rows]);

  const owing = rows.filter(x => Number(x.balance) > 0);
  const clear = rows.filter(x => Number(x.balance) <= 0);

  return (
    <Page>
      <PageHeader title="Ta’minotchilar" subtitle="Kimdan tovar olamiz va kimga qancha qarzdormiz">
        <Btn variant="primary" icon="plus" onClick={() => setForm('new')}>Yangi ta’minotchi</Btn>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <StatCard label="Ta’minotchilar" value={stats.total} unit="ta" icon="truck" />
        <StatCard label="Qarzimiz bor" value={stats.owing} unit="ta" icon="warning"
          accent={stats.owing ? 'var(--warn)' : 'var(--ok)'} />
        <StatCard label="Umumiy qarz" value={money(stats.debt)} unit="so‘m" icon="hand-coins"
          accent={stats.debt > 0 ? 'var(--warn)' : 'var(--ok)'} />
        <StatCard label="Jami olingan" value={money(stats.purchased)} unit="so‘m" icon="package" />
      </div>

      {loading ? (
        <SkeletonRows count={4} widths={['100%']} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="truck"
          text="Ta’minotchi yo‘q"
          sub="Kimdan tovar olsangiz shu yerga qo‘shing — keyin qarzingiz o‘zi hisoblanib boradi"
          action={<Btn variant="primary" icon="plus" onClick={() => setForm('new')}>Ta’minotchi qo‘shish</Btn>}
        />
      ) : (
        <>
          {owing.length > 0 && (
            <>
              <SectionHeader title="Qarzimiz bor" hint={`${owing.length} ta`} />
              <Card padding={0}>
                <SupplierTable rows={owing} onOpen={setDetail} />
              </Card>
            </>
          )}

          {clear.length > 0 && (
            <>
              <SectionHeader title="Qarz yo‘q" hint={`${clear.length} ta`} />
              <Card padding={0}>
                <SupplierTable rows={clear} onOpen={setDetail} />
              </Card>
            </>
          )}
        </>
      )}

      {form && (
        <SupplierForm
          supplier={form === 'new' ? null : form}
          storeId={user.store_id}
          onClose={() => setForm(null)}
          onSaved={(msg) => { setToast({ msg, variant: 'ok' }); load(user.store_id); }}
          onError={(msg) => setToast({ msg, variant: 'dang' })}
        />
      )}

      {detail && (
        <SupplierDetail
          supplier={detail}
          user={user}
          onClose={() => setDetail(null)}
          onEdit={() => { setForm(detail); setDetail(null); }}
          onChanged={(msg) => { setToast({ msg, variant: 'ok' }); load(user.store_id); }}
          onError={(msg) => setToast({ msg, variant: 'dang' })}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

function SupplierTable({ rows, onOpen }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Ta’minotchi</th>
            <th>Telefon</th>
            <th style={{ textAlign: 'right' }}>Olingan</th>
            <th style={{ textAlign: 'right' }}>To‘langan</th>
            <th style={{ textAlign: 'right' }}>Qarzimiz</th>
            <th>Oxirgi yuk</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map(s => {
            const bal = Number(s.balance || 0);
            return (
              <tr key={s.id} onClick={() => onOpen(s)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Avatar initials={initialsOf(s.name)} size={28}
                      color={bal > 0 ? 'var(--warn)' : undefined} />
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                  </div>
                </td>
                <td className="num" style={{ color: 'var(--color-neutral-500)' }}>{s.phone || '—'}</td>
                <td className="num" style={{ textAlign: 'right' }}>{money(s.purchased)}</td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--ok)' }}>{money(s.paid)}</td>
                <td className="num" style={{
                  textAlign: 'right', fontWeight: 600,
                  color: bal > 0 ? 'var(--warn)' : 'var(--color-neutral-500)',
                }}>
                  {bal > 0 ? money(bal) : '—'}
                </td>
                <td style={{ color: 'var(--color-neutral-500)' }}>{dateFmt(s.last_purchase)}</td>
                <td style={{ textAlign: 'right' }}>
                  <Icon name="caret-right" size={15} color="var(--color-neutral-500)" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Qo'shish / tahrirlash ────────────────────────────────────────────── */
function SupplierForm({ supplier, storeId, onClose, onSaved, onError }) {
  const isNew = !supplier;
  const [f, setF] = useState({
    name: supplier?.name || '',
    phone: supplier?.phone || '',
    note: supplier?.note || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  const save = async () => {
    if (!f.name.trim()) { onError('Nomini kiriting'); return; }
    setSaving(true);
    const payload = {
      store_id: storeId,
      name: f.name.trim(),
      phone: f.phone.trim() || null,
      note: f.note.trim() || null,
    };
    const { error } = isNew
      ? await supabase.from('suppliers').insert(payload)
      : await supabase.from('suppliers').update(payload).eq('id', supplier.id);
    setSaving(false);
    if (error) { onError(error.message); return; }
    onSaved(isNew ? 'Ta’minotchi qo‘shildi' : 'Saqlandi');
    onClose();
  };

  return (
    <Modal
      title={isNew ? 'Yangi ta’minotchi' : 'Ta’minotchini tahrirlash'}
      onClose={onClose}
      actions={
        <>
          <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
          <Btn variant="primary" icon="check" onClick={save} loading={saving}
            disabled={!f.name.trim()}>Saqlash</Btn>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Nomi">
          <input className="input" value={f.name} autoFocus
            onChange={e => set('name', e.target.value)} placeholder="Optom Baza" />
        </Field>
        <Field label="Telefon">
          <input className="input num" value={f.phone}
            onChange={e => set('phone', e.target.value)} placeholder="+998 90 123 45 67" />
        </Field>
        <Field label="Izoh" hint="Manzil, yetkazish shartlari — ixtiyoriy">
          <input className="input" value={f.note}
            onChange={e => set('note', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

/* ── Tafsilot: yuklar, to'lovlar, qarz ────────────────────────────────── */
function SupplierDetail({ supplier, user, onClose, onEdit, onChanged, onError }) {
  const [history, setHistory] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [saving, setSaving] = useState(false);

  const bal = Number(supplier.balance || 0);

  useEffect(() => {
    let alive = true;
    Promise.all([
      supabase.from('purchases').select('*').eq('supplier_id', supplier.id)
        .order('date', { ascending: false }).limit(40),
      supabase.from('supplier_payments').select('*').eq('supplier_id', supplier.id)
        .order('date', { ascending: false }).limit(40),
    ]).then(([p, pay]) => {
      if (!alive) return;
      setHistory([
        ...(p.data || []).map(x => ({ ...x, kind: 'purchase' })),
        ...(pay.data || []).map(x => ({ ...x, kind: 'payment' })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)));
    });
    return () => { alive = false; };
  }, [supplier.id]);

  const pay = async () => {
    const v = parseInt(amount, 10) || 0;
    if (v <= 0) { onError('Summani kiriting'); return; }
    setSaving(true);
    const { error } = await supabase.from('supplier_payments').insert({
      store_id: user.store_id,
      supplier_id: supplier.id,
      amount: v,
      method,
      actor: user.name,
    });
    setSaving(false);
    if (error) { onError(error.message); return; }
    onChanged(`${money(v)} so‘m to‘landi`);
    onClose();
  };

  return (
    <Modal
      title={supplier.name}
      onClose={onClose}
      wide
      actions={
        <>
          <Btn variant="secondary" icon="pencil-simple" onClick={onEdit}>Tahrirlash</Btn>
          <Btn variant="primary" icon="hand-coins" onClick={pay} loading={saving}
            disabled={!amount}>To‘lovni yozish</Btn>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Chap: qarz va to'lov */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card padding="var(--space-6)" gap={9}
            style={{ borderColor: bal > 0 ? 'var(--warn)' : 'var(--color-divider)' }}>
            <Row label="Olingan tovar" value={money(supplier.purchased)} />
            <Row label="To‘langan" value={money(supplier.paid)} color="var(--ok)" />
            <div style={{ height: 1, background: 'var(--color-divider)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13.5, color: bal > 0 ? 'var(--warn)' : 'var(--color-neutral-400)' }}>
                Qarzimiz
              </span>
              <span className="num" style={{
                fontSize: 22, fontWeight: 600,
                color: bal > 0 ? 'var(--warn)' : 'var(--ok)',
              }}>
                {money(Math.max(0, bal))}
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-neutral-500)' }}> so‘m</span>
              </span>
            </div>
          </Card>

          <Field label="To‘lov summasi"
            hint={bal > 0 ? `Butun qarz — ${money(bal)} so‘m` : 'Qarz yo‘q'}>
            <input className="input num" inputMode="numeric" value={amount}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0" />
          </Field>

          {bal > 0 && (
            <Btn variant="secondary" size="sm" onClick={() => setAmount(String(Math.round(bal)))}>
              Butun qarzni qo‘yish
            </Btn>
          )}

          <Field label="To‘lov turi">
            <div style={{ display: 'flex', gap: 8 }}>
              {METHODS.map(m => (
                <button key={m.value} onClick={() => setMethod(m.value)}
                  style={{
                    flex: 1, minHeight: 38, borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    font: 'inherit', fontSize: 13,
                    border: `1px solid ${method === m.value ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                    background: method === m.value ? 'var(--color-accent-900)' : 'transparent',
                    color: method === m.value ? 'var(--color-accent)' : 'var(--color-neutral-400)',
                  }}>
                  {m.label}
                </button>
              ))}
            </div>
          </Field>

          {supplier.phone && (
            <a href={`tel:${String(supplier.phone).replace(/\s/g, '')}`} className="row-link"
              style={{ textDecoration: 'none' }}>
              <Icon name="phone" size={17} color="var(--color-accent)" />
              <span style={{ flex: 1, fontSize: 13 }}>Qo‘ng‘iroq qilish</span>
              <span className="num" style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                {supplier.phone}
              </span>
            </a>
          )}
        </div>

        {/* O'ng: tarix */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Tarix</div>
          {history === null ? (
            <SkeletonRows count={3} widths={['100%']} />
          ) : history.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', padding: '14px 0' }}>
              Hali yuk ham, to‘lov ham yo‘q
            </div>
          ) : (
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {history.map(h => {
                const isBuy = h.kind === 'purchase';
                return (
                  <div key={h.kind + h.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                    borderBottom: '1px solid var(--color-divider)',
                  }}>
                    <Icon name={isBuy ? 'truck' : 'hand-coins'} size={17}
                      color={isBuy ? 'var(--warn)' : 'var(--ok)'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13 }}>
                        {isBuy ? 'Yuk qabul qilindi' : 'To‘lov qilindi'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                        {dateFmt(h.date)}
                        {isBuy && Array.isArray(h.items) ? ` · ${h.items.length} xil tovar` : ''}
                        {h.actor ? ` · ${h.actor}` : ''}
                      </div>
                    </div>
                    <span className="num" style={{
                      fontSize: 13, fontWeight: 500,
                      color: isBuy ? 'var(--warn)' : 'var(--ok)',
                    }}>
                      {isBuy ? '+' : '−'}{money(isBuy ? h.total : h.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>{label}</span>
      <span className="num" style={{ fontSize: 13.5, fontWeight: 500, color }}>{value}</span>
    </div>
  );
}
