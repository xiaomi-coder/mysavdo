import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { StatCard, SectionHeader, Badge } from '../components/UI';

export default function DealerPortal() {
  const { user, logout } = useAuth();
  const [debts, setDebts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadDealerData();
    }
  }, [user]);

  const loadDealerData = async () => {
    setLoading(true);
    // 1. Dilerning qarzlari
    const { data: dData } = await supabase
      .from('debts')
      .select('*')
      .eq('customer_id', user.id)
      .order('date', { ascending: false });
    
    // 2. Dilerning xarid tarixi
    const { data: tData } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', user.id)
      .order('date', { ascending: false });

    if (dData) setDebts(dData);
    if (tData) setTransactions(tData);
    setLoading(false);
  };

  const totalDebt = debts.filter(d => d.status === "To'lanmagan").reduce((s, d) => s + (Number(d.amount) - Number(d.paid_amount || 0)), 0);
  const totalPurchases = transactions.reduce((s, t) => s + Number(t.total), 0);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(34,211,238,0.05))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.4))' }}>
            🤝
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{user.name}</div>
            <div style={{ fontSize: 14, color: '#F59E0B', fontWeight: 700 }}>{user.shop_name || "Diler"}</div>
            <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>{user.phone}</div>
          </div>
        </div>
        <button onClick={logout} style={{ padding: '10px 20px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 12, color: '#F43F5E', fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
          Tizimdan chiqish
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <StatCard icon="💰" value={`${(totalDebt / 1000000).toFixed(2)}M`} label="Mening joriy qarzim (so'm)" accent="#F43F5E" />
        <StatCard icon="🛍️" value={`${(totalPurchases / 1000000).toFixed(2)}M`} label="Jami xaridlarim (so'm)" accent="#10B981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        {/* So'nggi xaridlar */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Mening Xaridlarim (Tarix)" />
          {loading ? (
             <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)' }}>Yuklanmoqda...</div>
          ) : transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {transactions.map(t => (
                <div key={t.id} style={{ background: 'var(--s2)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>Xarid {t.receipt_no}</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)' }}>{new Date(t.date).toLocaleString('uz-UZ')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: t.payment_method === 'nasiya' ? '#F43F5E' : '#10B981' }}>{Number(t.total).toLocaleString()} so'm</div>
                      <Badge type={t.payment_method === 'nasiya' ? 'warning' : 'success'} style={{ fontSize: 10 }}>{t.payment_method === 'nasiya' ? 'Nasiya' : 'Naqd/Plastik'}</Badge>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12 }}>
                    {t.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: 'var(--t2)' }}>
                        <span>{item.qty}x {item.n || item.name} {item.phone_imei1 ? `(IMEI: ${item.phone_imei1})` : ''}</span>
                        <span style={{ fontWeight: 700, color: 'var(--t1)' }}>{(item.price * item.qty).toLocaleString()} so'm</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📦</div>
              <div>Hali hech qanday xarid amalga oshirmagansiz</div>
            </div>
          )}
        </div>

        {/* Nasiyalar */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22, height: 'max-content' }}>
          <SectionHeader title="Qarzlarim" />
          {loading ? (
             <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)' }}>Yuklanmoqda...</div>
          ) : debts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {debts.map(d => (
                <div key={d.id} style={{ background: 'var(--s2)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: d.status === "To'lanmagan" ? '#F43F5E' : '#10B981' }}>
                      {Number(d.amount).toLocaleString()} so'm
                    </div>
                    <Badge type={d.status === "To'lanmagan" ? 'danger' : 'success'}>{d.status}</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>
                    <span>Sana: {new Date(d.date).toLocaleDateString()}</span>
                    {d.paid_amount > 0 && <span style={{ color: '#10B981' }}>Boshlang'ich: {Number(d.paid_amount).toLocaleString()} so'm</span>}
                  </div>
                  {d.paid_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#F43F5E', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6, marginTop: 4 }}>
                      <span>Qolgan qarz:</span>
                      <span>{Math.max(0, Number(d.amount) - Number(d.paid_amount)).toLocaleString()} so'm</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--t3)' }}>
               <div style={{ fontSize: 30, marginBottom: 10 }}>💸</div>
               <div>Sizda qarzdorlik yo'q</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
