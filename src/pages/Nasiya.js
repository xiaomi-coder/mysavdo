import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Page, PageHeader, Card, Icon, Btn, Tag, Modal, Field, Avatar,
  EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const formatInput = v => {
  const d = String(v ?? '').replace(/\D/g, '');
  return d ? Number(d).toLocaleString('ru-RU') : '';
};
const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

const PAY_TYPES = [
  { id: 'cash', label: 'Naqd', icon: 'money' },
  { id: 'card', label: 'Plastik', icon: 'credit-card' },
  { id: 'transfer', label: 'Transfer', icon: 'arrows-left-right' },
];

/** Qarz holati — muddat va to'langan summaga qarab */
function stateOf(d) {
  if (d.rest <= 0) return { key: 'paid', label: "To‘langan", variant: 'ok', icon: 'check' };
  if (d.overdue) return { key: 'overdue', label: "Muddati o‘tgan", variant: 'dang', icon: 'warning' };
  if (d.paid > 0) return { key: 'partial', label: "Qisman to‘langan", variant: 'warn', icon: 'circle-half' };
  return { key: 'active', label: 'Aktiv', variant: 'info', icon: 'clock' };
}

/** Bazadagi qatorni ekran uchun tayyorlaydi */
function normalize(row) {
  const amount = Number(row.amount) || 0;
  const paid = Number(row.paid_amount) || 0;
  const due = row.due_date
    ? new Date(row.due_date)
    : new Date(new Date(row.date).getTime() + 30 * 86400000);
  return {
    id: row.id, client: row.client, phone: row.phone,
    amount, paid, rest: amount - paid,
    due, overdue: due.getTime() < Date.now() && amount - paid > 0,
    status: row.status,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   Nasiya
   ══════════════════════════════════════════════════════════════════════ */

export default function Nasiya() {
  const { user, refreshAlerts } = useAuth();
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState([]);
  const [payFor, setPayFor] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const { data } = await supabase.from('debts').select('*')
      .eq('store_id', storeId).order('due_date', { ascending: true });
    setDebts((data || []).map(normalize));
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  const stats = useMemo(() => {
    const open = debts.filter(d => d.rest > 0);
    const overdue = open.filter(d => d.overdue);
    return {
      totalRest: open.reduce((s, d) => s + d.rest, 0),
      active: open.length,
      overdueCount: overdue.length,
      overdueSum: overdue.reduce((s, d) => s + d.rest, 0),
    };
  }, [debts]);

  return (
    <Page>
      <PageHeader title="Nasiya" subtitle="Qarzlar va bo‘lib to‘lashlar">
        <Btn variant="secondary" icon="file-xls" disabled title="Excel eksport — tez orada">Excel</Btn>
        <Btn variant="secondary" icon="chat-circle-text" disabled title="SMS yuborish — tez orada">SMS Yuborish</Btn>
        <Btn variant="primary" icon="plus" onClick={() => setShowAdd(true)}>Yangi Nasiya</Btn>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <Tile label="Jami qolgan qarz" value={`${money(stats.totalRest)} so‘m`} color="var(--warn)" />
        <Tile label="Aktiv nasiyalar" value={`${stats.active} ta`} />
        <Tile
          label="Muddati o‘tgan"
          value={stats.overdueCount ? `${stats.overdueCount} ta · ${money(stats.overdueSum)}` : '0 ta'}
          color={stats.overdueCount ? 'var(--dang)' : undefined}
        />
      </div>

      <Card padding="var(--space-6)">
        {loading ? <SkeletonRows count={6} widths={['100%']} />
          : debts.length === 0 ? (
            <EmptyState
              icon="hand-coins" text="Nasiyalar yo‘q"
              sub="POS orqali nasiyaga sotilganda shu yerda paydo bo‘ladi"
              action={<Btn variant="primary" size="sm" icon="plus" onClick={() => setShowAdd(true)}>Yangi Nasiya</Btn>}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Mijoz</th>
                    <th style={{ textAlign: 'right' }}>Asl qarz</th>
                    <th style={{ textAlign: 'right' }}>To‘langan</th>
                    <th style={{ textAlign: 'right' }}>Qolgan qarz</th>
                    <th>Muddat</th><th>Holat</th><th />
                  </tr>
                </thead>
                <tbody>
                  {debts.map(d => {
                    const st = stateOf(d);
                    return (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 500 }}>{d.client}</td>
                        <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-400)' }}>{money(d.amount)}</td>
                        <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-400)' }}>{money(d.paid)}</td>
                        <td className="num" style={{
                          textAlign: 'right', fontWeight: 600,
                          color: st.key === 'paid' ? 'var(--ok)' : st.key === 'overdue' ? 'var(--dang)' : undefined,
                        }}>
                          {money(d.rest)}
                        </td>
                        <td style={{ color: d.overdue ? 'var(--dang)' : 'var(--color-neutral-500)', fontWeight: d.overdue ? 500 : 400 }}>
                          {d.due.toLocaleDateString('ru-RU')}
                        </td>
                        <td><Tag variant={st.variant} icon={st.icon}>{st.label}</Tag></td>
                        <td style={{ textAlign: 'right' }}>
                          {d.rest > 0
                            ? <Btn variant={st.key === 'overdue' ? 'primary' : 'secondary'} size="sm"
                                onClick={() => setPayFor(d)}>To‘lov qabul qilish</Btn>
                            : <Btn variant="ghost" size="sm" disabled>Yopilgan</Btn>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="info" size={13} />
        SMS eslatma hozircha faqat bildiruv ko‘rsatadi — haqiqiy SMS yuborilmaydi.
      </div>

      {payFor && (
        <PaymentModal
          debt={payFor}
          onClose={() => setPayFor(null)}
          onSaved={(amount) => {
            setPayFor(null);
            load(user.store_id);
            refreshAlerts();
            setToast({ msg: `${money(amount)} so‘m to‘lov qabul qilindi`, variant: 'ok' });
          }}
          onError={m => setToast({ msg: m, variant: 'dang' })}
        />
      )}

      {showAdd && (
        <AddDebtModal
          storeId={user?.store_id}
          onClose={() => setShowAdd(false)}
          onSaved={(name) => {
            setShowAdd(false);
            load(user.store_id);
            refreshAlerts();
            setToast({ msg: `${name} uchun nasiya ochildi`, variant: 'ok' });
          }}
          onError={m => setToast({ msg: m, variant: 'dang' })}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

function Tile({ label, value, color }) {
  return (
    <Card padding={13} gap={4}>
      <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{label}</div>
      <div className="num" style={{ fontSize: 20, fontWeight: 500, color }}>{value}</div>
    </Card>
  );
}

/* ── To'lov qabul qilish ───────────────────────────────────────────────── */
function PaymentModal({ debt, onClose, onSaved, onError }) {
  const [amount, setAmount] = useState('');
  const [payType, setPayType] = useState('cash');
  const [saving, setSaving] = useState(false);

  const n = Number(amount) || 0;
  const valid = n > 0 && n <= debt.rest;
  const after = Math.max(0, debt.rest - n);

  const save = async () => {
    setSaving(true);
    const newPaid = debt.paid + n;
    const { error } = await supabase.from('debts').update({
      paid_amount: newPaid,
      status: newPaid >= debt.amount ? "To'landi" : "To'lanmagan",
    }).eq('id', debt.id);
    setSaving(false);
    if (error) onError(`To‘lov saqlanmadi: ${error.message}`);
    else onSaved(n);
  };

  return (
    <Modal title="To‘lov qabul qilish" onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" icon="check" onClick={save} disabled={!valid} loading={saving}>
          To‘lovni saqlash
        </Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={initialsOf(debt.client)} size={34} color="var(--color-neutral-800)" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{debt.client}</div>
            <div style={{ fontSize: 11, color: debt.overdue ? 'var(--dang)' : 'var(--color-neutral-500)' }}>
              {debt.overdue ? 'Muddati o‘tgan · ' : 'Muddat · '}{debt.due.toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>

        <div className="num" style={{
          display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5,
          padding: 11, borderRadius: 9, background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
        }}>
          <SumRow label="Jami qarz" value={money(debt.amount)} />
          <SumRow label="To‘langan" value={money(debt.paid)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--dang)', fontSize: 14 }}>
            <span>Qolgan qarz</span><span>{money(debt.rest)} so‘m</span>
          </div>
        </div>

        <Field label="To‘lov summasi" error={n > debt.rest ? 'Qolgan qarzdan ko‘p bo‘lishi mumkin emas' : null}>
          <div className="input" style={{
            display: 'flex', alignItems: 'center', padding: 0, paddingInline: 10,
            borderColor: valid ? 'var(--color-accent)' : n > debt.rest ? 'var(--dang)' : undefined,
          }}>
            <input
              className="num" autoFocus inputMode="numeric" value={formatInput(amount)}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0"
              style={{ flex: 1, background: 'none', border: 0, outline: 'none', color: 'inherit', font: 'inherit', padding: '6px 0' }}
            />
            <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>so‘m</span>
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
          {[25, 50, 75, 100].map(pct => {
            const v = Math.round(debt.rest * pct / 100);
            return (
              <Btn key={pct} variant={n === v ? 'primary' : 'secondary'}
                onClick={() => setAmount(String(v))}
                style={{ minHeight: 40, justifyContent: 'center' }}>
                {pct}%
              </Btn>
            );
          })}
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--color-neutral-400)', display: 'block', marginBottom: 6 }}>
            To‘lov turi
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
            {PAY_TYPES.map(p => {
              const sel = payType === p.id;
              return (
                <button key={p.id} onClick={() => setPayType(p.id)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '8px 2px', borderRadius: 8, cursor: 'pointer', font: 'inherit',
                  border: `1px solid ${sel ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                  background: sel ? 'var(--color-accent-900)' : 'transparent',
                }}>
                  <Icon name={p.icon} size={15} color={sel ? 'var(--color-accent)' : 'var(--color-neutral-400)'} />
                  <span style={{ fontSize: 10.5, color: sel ? 'var(--color-text)' : 'var(--color-neutral-400)' }}>
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {n > 0 && (
          <div className="num" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-neutral-400)' }}>
            <span>To‘lovdan keyin qoladi</span>
            <span style={{ fontWeight: 600, color: after === 0 ? 'var(--ok)' : 'var(--color-text)' }}>
              {money(after)} so‘m
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

function SumRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-neutral-400)' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

/* ── Yangi nasiya ──────────────────────────────────────────────────────── */
function AddDebtModal({ storeId, onClose, onSaved, onError }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('30');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('customers').select('id, name, phone').eq('store_id', storeId)
      .then(({ data }) => setCustomers(data || []));
  }, [storeId]);

  const customer = customers.find(c => String(c.id) === customerId);
  const valid = customer && Number(amount) > 0;

  const save = async () => {
    setSaving(true);
    const due = new Date();
    due.setDate(due.getDate() + (parseInt(days, 10) || 30));
    const { error } = await supabase.from('debts').insert({
      store_id: storeId,
      customer_id: customer.id,
      client: customer.name,
      phone: customer.phone || '',
      amount: Number(amount),
      paid_amount: 0,
      due_date: due.toISOString(),
      status: "To'lanmagan",
    });
    setSaving(false);
    if (error) onError(`Saqlanmadi: ${error.message}`);
    else onSaved(customer.name);
  };

  return (
    <Modal title="Yangi Nasiya" onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" onClick={save} disabled={!valid} loading={saving}>Saqlash</Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Mijoz" hint={customers.length === 0 ? 'Avval CRM bo‘limidan mijoz qo‘shing' : null}>
          <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Mijozni tanlang…</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
          </select>
        </Field>

        <Field label="Qarz summasi">
          <div className="input" style={{ display: 'flex', alignItems: 'center', padding: 0, paddingInline: 10 }}>
            <input className="num" inputMode="numeric" value={formatInput(amount)}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0"
              style={{ flex: 1, background: 'none', border: 0, outline: 'none', color: 'inherit', font: 'inherit', padding: '6px 0' }} />
            <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>so‘m</span>
          </div>
        </Field>

        <Field label="Muddat (kun)">
          <input className="input num" inputMode="numeric" value={days}
            onChange={e => setDays(e.target.value.replace(/\D/g, ''))} placeholder="30" />
        </Field>
      </div>
    </Modal>
  );
}
