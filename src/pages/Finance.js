import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Page, PageHeader, Card, SectionHeader, Icon, Btn, Tag, Modal, Field,
  EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const CATEGORIES = ['Ijara', 'Oylik Maosh', 'Kommunal', 'Soliqlar',
  'Kantselyariya', 'Transport', 'Marketing', 'Boshqa'];

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const formatInput = v => {
  const d = String(v ?? '').replace(/\D/g, '');
  return d ? Number(d).toLocaleString('ru-RU') : '';
};

/* ══════════════════════════════════════════════════════════════════════════
   Moliya — xarajatlar va oylik ko'rsatkichlar
   ══════════════════════════════════════════════════════════════════════ */

export default function Finance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [debtTotal, setDebtTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);

  const now = new Date();
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [expRes, txnRes, debtRes] = await Promise.all([
      supabase.from('expenses').select('*').eq('store_id', storeId)
        .gte('date', monthStart).order('date', { ascending: false }),
      supabase.from('transactions').select('total, items, date').eq('store_id', storeId)
        .gte('date', new Date(Date.now() - 400 * 86400000).toISOString())
        .eq('status', 'completed').gte('date', monthStart),
      supabase.from('debts').select('amount, paid_amount').eq('store_id', storeId)
        .eq('status', "To'lanmagan"),
    ]);

    setExpenses(expRes.data || []);

    // Daromad va tovar foydasi — sotuvlar ichidagi tan narxlardan
    let sales = 0, gross = 0;
    (txnRes.data || []).forEach(t => {
      sales += Number(t.total) || 0;
      (Array.isArray(t.items) ? t.items : []).forEach(i => {
        const qty = i.qty || 1;
        gross += ((Number(i.price) || 0) - (Number(i.cost_price) || Number(i.cost) || 0)) * qty;
      });
    });
    setRevenue(sales);
    setProfit(gross - (expRes.data || []).reduce((s, e) => s + (Number(e.amount) || 0), 0));
    setDebtTotal((debtRes.data || []).reduce((s, d) => s + (Number(d.amount) - Number(d.paid_amount || 0)), 0));
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0),
    [expenses]
  );

  /* Kategoriya bo'yicha taqsimot — kamayish tartibida */
  const byCategory = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      const k = e.category || e.cat || 'Boshqa';
      map[k] = (map[k] || 0) + (Number(e.amount) || 0);
    });
    const rows = Object.entries(map).map(([name, sum]) => ({ name, sum }))
      .sort((a, b) => b.sum - a.sum);
    const max = rows[0]?.sum || 1;
    return rows.map((r, i) => ({
      ...r,
      pct: Math.round((r.sum / max) * 100),
      // Eng katta xarajat to'liq akcentda, qolganlari pasayib boradi
      color: i === 0 ? 'var(--color-accent)' : i < 3 ? 'var(--color-accent-700)' : 'var(--color-accent-800)',
    }));
  }, [expenses]);

  return (
    <Page>
      <PageHeader title="Moliya" subtitle={`Do‘kon xarajatlari va moliyaviy ko‘rsatkichlar · ${monthLabel}`}>
        <Btn variant="primary" icon="plus" onClick={() => setShowAdd(true)}>Yangi Xarajat</Btn>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <Tile icon="trend-up" iconColor="var(--color-accent)" label="Daromad (sotuvlar)" value={money(revenue)} />
        <Tile icon="arrow-circle-down" iconColor="var(--dang)" label="Xarajatlar" value={money(totalExpenses)} />
        <Tile icon="chart-line-up" iconColor="var(--ok)" label="Sof foyda" value={money(profit)}
          valueColor={profit >= 0 ? 'var(--ok)' : 'var(--dang)'} />
        <Tile icon="hand-coins" iconColor="var(--warn)" label="Nasiya qarzlari" value={money(debtTotal)}
          valueColor="var(--warn)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 14, alignItems: 'start' }}>
        <Card padding="var(--space-6)" gap={11}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Xarajat kategoriyalari · {MONTHS[now.getMonth()]}</div>
          {loading ? <SkeletonRows count={5} />
            : byCategory.length === 0 ? <EmptyState icon="wallet" text="Bu oyda xarajat yo‘q" />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12 }}>
                  {byCategory.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 86, color: 'var(--color-neutral-400)', flex: 'none' }}>{c.name}</span>
                      <div style={{
                        flex: 1, height: 9, borderRadius: 5,
                        background: 'color-mix(in srgb, var(--color-text) 6%, transparent)',
                      }}>
                        <div style={{ width: `${c.pct}%`, height: '100%', borderRadius: 5, background: c.color }} />
                      </div>
                      <span className="num" style={{ width: 82, textAlign: 'right', flex: 'none' }}>{money(c.sum)}</span>
                    </div>
                  ))}
                </div>
              )}
        </Card>

        <Card padding="var(--space-6)" gap={10}>
          <SectionHeader title="So‘nggi xarajatlar" hint={`${expenses.length} ta yozuv`} />
          {loading ? <SkeletonRows count={5} widths={['100%']} />
            : expenses.length === 0 ? (
              <EmptyState
                icon="receipt" text="Xarajatlar yo‘q" sub="Birinchi xarajatni qo‘shing"
                action={<Btn variant="primary" size="sm" icon="plus" onClick={() => setShowAdd(true)}>Yangi Xarajat</Btn>}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      <th>Sana</th><th>Kategoriya</th><th>Izoh</th>
                      <th>Kim</th><th style={{ textAlign: 'right' }}>Summa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => {
                      const d = new Date(e.date);
                      return (
                        <tr key={e.id}>
                          <td className="num" style={{ color: 'var(--color-neutral-500)' }}>
                            {String(d.getDate()).padStart(2, '0')}.{String(d.getMonth() + 1).padStart(2, '0')}
                          </td>
                          <td><Tag variant="neutral">{e.category || e.cat}</Tag></td>
                          <td>{e.note || e.desc || '—'}</td>
                          <td style={{ color: 'var(--color-neutral-500)' }}>{e.cashier || '—'}</td>
                          <td className="num" style={{ textAlign: 'right' }}>{money(e.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </Card>
      </div>

      {showAdd && (
        <AddExpenseModal
          storeId={user?.store_id}
          cashier={user?.name}
          onClose={() => setShowAdd(false)}
          onSaved={(amount) => {
            setShowAdd(false);
            load(user.store_id);
            setToast({ msg: `Xarajat saqlandi: ${money(amount)} so‘m`, variant: 'ok' });
          }}
          onError={m => setToast({ msg: m, variant: 'dang' })}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

function Tile({ icon, iconColor, label, value, valueColor }) {
  return (
    <Card padding={14} gap={5}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
        <Icon name={icon} size={15} color={iconColor} />
        {label}
      </div>
      <div className="num" style={{ fontSize: 19, fontWeight: 500, color: valueColor }}>{value}</div>
    </Card>
  );
}

/* ── Yangi xarajat ─────────────────────────────────────────────────────── */
function AddExpenseModal({ storeId, cashier, onClose, onSaved, onError }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Boshqa');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const n = Number(amount) || 0;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('expenses').insert({
      store_id: storeId,
      date,
      category,
      note: note.trim() || category,
      amount: n,
      cashier: cashier || 'Noma\'lum',
    });
    setSaving(false);
    if (error) onError(`Saqlanmadi: ${error.message}`);
    else onSaved(n);
  };

  return (
    <Modal title="Yangi Xarajat" onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" onClick={save} disabled={n <= 0} loading={saving}>Saqlash</Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Summa">
          <div className="input" style={{
            display: 'flex', alignItems: 'center', padding: 0, paddingInline: 10,
            borderColor: n > 0 ? 'var(--color-accent)' : undefined,
          }}>
            <input className="num" autoFocus inputMode="numeric" value={formatInput(amount)}
              onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0"
              style={{ flex: 1, background: 'none', border: 0, outline: 'none', color: 'inherit', font: 'inherit', padding: '6px 0' }} />
            <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>so‘m</span>
          </div>
        </Field>

        <div>
          <label style={{ fontSize: 12, color: 'var(--color-neutral-400)', display: 'block', marginBottom: 6 }}>
            Kategoriya
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {CATEGORIES.map(c => {
              const active = category === c;
              return (
                <button key={c} onClick={() => setCategory(c)} style={{
                  padding: '6px 12px', borderRadius: 14, border: 0, cursor: 'pointer', font: 'inherit',
                  fontSize: 12, fontWeight: active ? 500 : 400,
                  background: active ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 6%, transparent)',
                  color: active ? 'var(--color-bg)' : 'var(--color-neutral-300)',
                }}>{c}</button>
              );
            })}
          </div>
        </div>

        <Field label="Izoh">
          <input className="input" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Masalan: Instagram reklama" />
        </Field>

        <Field label="Sana">
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
