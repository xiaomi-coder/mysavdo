import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Icon, Btn, Tag, EmptyState, SkeletonRows } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const dateTime = v => new Date(v).toLocaleString('ru-RU', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

/* ══════════════════════════════════════════════════════════════════════════
   Diler portali — faqat o'qish uchun.
   Diler o'z qarzini, xaridlarini va to'lovlar tarixini ko'radi.
   ══════════════════════════════════════════════════════════════════════ */

export default function DealerPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('purchases');
  const [loading, setLoading] = useState(true);
  const [txns, setTxns] = useState([]);
  const [debts, setDebts] = useState([]);

  const load = useCallback(async (dealerId, storeId) => {
    setLoading(true);
    const [txnRes, debtRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('store_id', storeId)
        .eq('customer_id', dealerId).order('date', { ascending: false }).limit(500),
      supabase.from('debts').select('*').eq('store_id', storeId)
        .eq('customer_id', dealerId).order('due_date', { ascending: true }),
    ]);
    setTxns(txnRes.data || []);
    setDebts(debtRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.id && user?.store_id) load(user.id, user.store_id);
  }, [user, load]);

  /* Qarz holati — barcha ochiq qarzlar yig'indisi */
  const debt = useMemo(() => {
    const open = debts.filter(d => Number(d.amount) - Number(d.paid_amount || 0) > 0);
    const total = open.reduce((s, d) => s + Number(d.amount), 0);
    const paid = open.reduce((s, d) => s + Number(d.paid_amount || 0), 0);
    const rest = total - paid;
    const nearest = open
      .map(d => d.due_date && new Date(d.due_date))
      .filter(Boolean)
      .sort((a, b) => a - b)[0];
    return {
      total, paid, rest,
      pct: total > 0 ? Math.round((paid / total) * 100) : 0,
      due: nearest,
      overdue: nearest ? nearest.getTime() < Date.now() : false,
    };
  }, [debts]);

  /* Xarid va to'lovlarni bitta vaqt chizig'iga birlashtiramiz */
  const timeline = useMemo(() => {
    const events = txns.map(t => ({
      key: `t${t.id}`,
      kind: t.payment_method === 'nasiya' ? 'debt' : 'paid',
      title: `${t.payment_method === 'nasiya' ? 'Nasiya xarid' : 'Xarid'} — ${labelOf(t)}`,
      at: t.date,
      amount: Number(t.total) || 0,
    }));
    debts.filter(d => Number(d.paid_amount) > 0).forEach(d => {
      events.push({
        key: `d${d.id}`, kind: 'payment',
        title: 'To‘lov qabul qilindi',
        at: d.date, amount: Number(d.paid_amount),
      });
    });
    return events.sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [txns, debts]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sarlavha */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
        borderBottom: '1px solid var(--color-divider)',
      }}>
        <div style={{
          width: 34, height: 34, flex: 'none', borderRadius: 8,
          border: '1px solid var(--color-accent)', color: 'var(--color-accent)',
          display: 'grid', placeItems: 'center',
        }}>
          <Icon name="storefront" fill size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>
            {user?.shop_name ? `"${user.shop_name}" — ${user.name}` : user?.name}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>
            Diler{user?.storeName ? ` · ${user.storeName} hamkori` : ''}
          </div>
        </div>
        <Btn variant="secondary" iconOnly icon="sign-out" title="Chiqish"
          onClick={handleLogout} style={{ width: 44, height: 44 }} />
      </div>

      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {/* Qarz — sahifaning markazi */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          padding: 22, borderRadius: 13,
          background: debt.rest > 0 ? 'var(--warnbg)' : 'var(--okbg)',
        }}>
          {debt.rest > 0 ? (
            <>
              <span style={{ fontSize: 12, color: 'var(--warn)' }}>Qolgan qarzim</span>
              <span className="num" style={{ fontSize: 32, fontWeight: 600, color: 'var(--warn)', letterSpacing: '-0.01em' }}>
                {money(debt.rest)}
              </span>
              <span style={{ fontSize: 12, color: debt.overdue ? 'var(--dang)' : 'var(--warn)' }}>
                so‘m{debt.due ? ` · ${debt.overdue ? 'muddati o‘tgan' : 'muddat'}: ${debt.due.toLocaleDateString('ru-RU')}` : ''}
              </span>
              <div style={{
                width: '100%', height: 7, borderRadius: 4, marginTop: 8,
                background: 'oklch(0.34 0.06 80 / 0.5)',
              }}>
                <div style={{ width: `${debt.pct}%`, height: '100%', borderRadius: 4, background: 'var(--warn)' }} />
              </div>
              <span style={{ fontSize: 10.5, color: 'var(--warn)' }}>
                {money(debt.total)} dan {money(debt.paid)} to‘landi ({debt.pct}%)
              </span>
            </>
          ) : (
            <>
              <Icon name="check-circle" fill size={28} color="var(--ok)" />
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ok)' }}>Qarzingiz yo‘q</span>
              <span style={{ fontSize: 12, color: 'var(--ok)' }}>Barcha to‘lovlar amalga oshirilgan</span>
            </>
          )}
        </div>

        {/* Tablar */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--color-divider)' }}>
          {[{ id: 'purchases', label: 'Xaridlarim' }, { id: 'history', label: 'Tarix' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 13px', border: 0, background: 'none', cursor: 'pointer', font: 'inherit',
              fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
              color: tab === t.id ? 'var(--color-accent)' : 'var(--color-neutral-500)',
              boxShadow: tab === t.id ? 'inset 0 -2px 0 var(--color-accent)' : 'none',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <SkeletonRows count={4} widths={['100%']} />
          : tab === 'purchases' ? (
            txns.length === 0
              ? <EmptyState icon="shopping-bag" text="Xaridlar yo‘q" sub="Do‘kondan tovar olganingizda shu yerda ko‘rinadi" />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {txns.map(t => {
                    const nasiya = t.payment_method === 'nasiya';
                    return (
                      <Card key={t.id} padding={13} gap={6}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{labelOf(t)}</div>
                          <Tag variant={nasiya ? 'warn' : 'ok'}>{nasiya ? 'Nasiya' : 'To‘langan'}</Tag>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                          <span>{new Date(t.date).toLocaleDateString('ru-RU')}</span>
                          <span className="num" style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                            {money(t.total)} so‘m
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )
          ) : (
            timeline.length === 0
              ? <EmptyState icon="clock-counter-clockwise" text="Tarix bo‘sh" />
              : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {timeline.map((e, i) => {
                    const isPayment = e.kind === 'payment';
                    const isDebt = e.kind === 'debt';
                    return (
                      <div key={e.key} style={{
                        display: 'flex', gap: 12, padding: '11px 0', alignItems: 'center',
                        borderBottom: i < timeline.length - 1 ? '1px solid var(--color-divider)' : 'none',
                      }}>
                        <div style={{
                          width: 30, height: 30, flex: 'none', borderRadius: '50%',
                          display: 'grid', placeItems: 'center',
                          background: isDebt ? 'var(--warnbg)' : 'var(--okbg)',
                        }}>
                          <Icon name={isPayment ? 'arrow-down' : isDebt ? 'hand-coins' : 'check'} size={14}
                            color={isDebt ? 'var(--warn)' : 'var(--ok)'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13 }}>{e.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{dateTime(e.at)}</div>
                        </div>
                        <span className="num" style={{
                          fontSize: 12.5,
                          color: isDebt ? 'var(--warn)' : isPayment ? 'var(--ok)' : 'var(--color-neutral-400)',
                        }}>
                          {isDebt ? '+' : isPayment ? '−' : ''}{money(e.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )
          )}

        <div style={{
          fontSize: 11, color: 'var(--color-neutral-500)',
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 12,
        }}>
          <Icon name="lock-simple" size={13} />
          Portal faqat o‘qish uchun — faqat o‘z ma’lumotlaringiz ko‘rinadi.
        </div>
      </div>
    </div>
  );
}

/** Tranzaksiya tarkibidan qisqa nom: "iPhone 15 × 10" yoki "3 xil tovar" */
function labelOf(t) {
  const items = Array.isArray(t.items) ? t.items : [];
  if (items.length === 0) return t.receipt_no || 'Xarid';
  const first = items[0];
  const name = first.phone_model || first.name;
  if (items.length === 1) return `${name} × ${first.qty || 1}`;
  return `${name} va yana ${items.length - 1} xil`;
}
