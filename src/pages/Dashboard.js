import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { StatCard, Badge, SectionHeader, Btn } from '../components/UI';
import { WEEKLY_DATA } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const fmt = (n) => n >= 1000000
  ? (n / 1000000).toFixed(1) + ' mln'
  : n.toLocaleString() + ' so\'m';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()} so'm
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user, sendTgAlert, expenses } = useAuth();
  const [loadingTg, setLoadingTg] = React.useState(false);
  const [recentSales, setRecentSales] = React.useState([]);

  React.useEffect(() => {
    if (user?.store_id) {
      loadRecentSales(user.store_id);
    }
  }, [user]);

  const loadRecentSales = async (storeId) => {
    const { data } = await supabase.from('transactions')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(6);
    if (data) setRecentSales(data);
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const calculatedFoyda = 3262500 - totalExpenses; // Basic mock static sub-profit minus dynamic expenses

  const handleSendTgReport = () => {
    setLoadingTg(true);
    setTimeout(() => {
      setLoadingTg(false);
      sendTgAlert(`📊 KUNLIK HISOBOT (Asosiy Do'kon)\n\n💸 UMUMIY SAVDO\n💰 Jami Savdo: 12,450,000 so'm\n📈 Sof Foyda: ${calculatedFoyda.toLocaleString()} so'm\n📉 Xarajatlar: ${totalExpenses.toLocaleString()} so'm\n\n💳 KASSA HOLATI\n💵 Naqd: 8,400,000 so'm\n💳 Plastik (Karta): 3,050,000 so'm\n📝 Nasiya: 1,000,000 so'm\n\n📦 STATISTIKA\n🧾 Cheklar soni: 124 ta\n🔝 Top 5 Mahsulotlar:\n1. Coca Cola 0.5L (284 ta)\n2. Lipton Choy (196 ta)\n3. Xurmo Shokolad (154 ta)\n4. Lays Chips (128 ta)\n5. Red Bull (95 ta)\n\n⚠️ DIQQAT! Ombor qoldig'i kam:\nCoca Cola, Lipton, Oreo`);
    }, 1200);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</div>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>Xush kelibsiz! Bugungi savdo statistikasi.</div>
        </div>
        <Btn variant="primary" onClick={handleSendTgReport} disabled={loadingTg} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2AABEE', borderColor: '#2AABEE' }}>
          <span>✈️</span> {loadingTg ? 'Yuborilmoqda...' : 'Telegram hisobot'}
        </Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard icon="💰" value="12,450,000" label={<>Bugungi sotuv <span style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 6 }}>Foyda: {calculatedFoyda.toLocaleString()}</span></>} change="+14.2% kecha bilan" changeType="up" accent="#3B82F6" />
        <StatCard icon="📦" value="847" label="Sotilgan mahsulotlar" change="+8.7% o'tgan hafta" changeType="up" accent="#10B981" />
        <StatCard icon="🧾" value="124" label="Cheklar soni" change="+5 ta bugun" changeType="up" accent="#F59E0B" />
        <StatCard icon="👤" value="3" label="Aktiv kassirlar" change="1 ta offline" changeType="down" accent="#A78BFA" />
      </div>

      {/* Alert */}
      <div style={{
        background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 12, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#F59E0B',
      }}>
        ⚠️ <strong>Diqqat:</strong>&nbsp;3 ta mahsulot minimal qoldiqdan past — Coca Cola (4 ta), Lipton (15 ta), Oreo (0 ta)
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>

        {/* Bar chart */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Haftalik Sotuv">
            <select style={{
              background: 'var(--s2)', border: '1px solid var(--border)',
              color: 'var(--t2)', borderRadius: 8, padding: '5px 10px',
              fontSize: 12, fontFamily: 'Outfit,sans-serif', outline: 'none',
            }}>
              <option>Bu hafta</option>
              <option>O'tgan hafta</option>
            </select>
          </SectionHeader>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_DATA} barGap={4}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fill: 'var(--t2)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="sotuv" name="Sotuv" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="foyda" name="Foyda" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <LegendDot color="#3B82F6" label="Sotuv" />
            <LegendDot color="#10B981" label="Foyda" />
          </div>
        </div>

        {/* Top products */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Top Mahsulotlar" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { rank: 1, name: 'Coca Cola 0.5L', pct: 95, sales: '284 ta', rankColor: '#F59E0B' },
              { rank: 2, name: 'Lipton Choy', pct: 78, sales: '196 ta', rankColor: '#94A3B8' },
              { rank: 3, name: 'Xurmo Shokolad', pct: 62, sales: '154 ta', rankColor: '#94A3B8' },
              { rank: 4, name: 'Lays Chips', pct: 51, sales: '128 ta', rankColor: '#94A3B8' },
              { rank: 5, name: 'Red Bull', pct: 38, sales: '95 ta', rankColor: '#94A3B8' },
            ].map(p => (
              <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(30,45,61,0.5)' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 7,
                  background: p.rank === 1 ? 'rgba(245,158,11,0.15)' : 'var(--s2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: p.rankColor, flexShrink: 0,
                }}>{p.rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.pct}%`, background: 'linear-gradient(90deg,#3B82F6,#22D3EE)', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--t2)', flexShrink: 0 }}>{p.sales}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent sales table */}
      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <SectionHeader title="So'nggi Sotuvlar">
          <span className="fast-transition" style={{ fontSize: 13, color: '#3B82F6', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#60A5FA'} onMouseLeave={e => e.currentTarget.style.color = '#3B82F6'}>Barchasini ko'rish →</span>
        </SectionHeader>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Chek #', 'Kassir', 'Mahsulotlar', "To'lov turi", 'Summa', 'Vaqt', 'Status'].map(h => (
                  <th key={h} style={{
                    fontSize: 11, fontWeight: 700, color: 'var(--t3)',
                    textTransform: 'uppercase', letterSpacing: .8,
                    padding: '0 12px 12px 0', textAlign: 'left',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map(s => (
                <tr key={s.id} className="fast-transition" style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{s.receipt_no}</td>
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{s.cashier}</td>
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{s.items?.length || 0} ta</td>
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {s.payment_method === 'card' ? '💳' : s.payment_method === 'cash' ? '💵' : '📱'} {s.payment_method}
                  </td>
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 13, fontWeight: 700, color: s.status === 'cancelled' ? '#F43F5E' : '#10B981', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: s.status === 'cancelled' ? 'line-through' : 'none' }}>
                    {s.total?.toLocaleString() || 0} so'm
                  </td>
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 12, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{new Date(s.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td style={{ padding: '12px 0 12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Badge type={s.status === 'completed' ? 'success' : 'danger'}>
                      {s.status === 'completed' ? '✓ Yakunlandi' : '✗ Bekor qilindi'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--t3)' }}>Hozircha sotuvlar yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        <SummaryCard icon="🎯" title="Oylik maqsad" val="68%" sub="340 mln / 500 mln so'm" color="#3B82F6" />
        <SummaryCard icon="📦" title="Ombordagi tovarlar" val="1,247" sub="33 ta tugagan, 86 ta kam" color="#F59E0B" />
        <SummaryCard icon="⭐" title="Eng yaxshi xodim" val="Aziz K." sub="4,250,000 so'm · 312 sotuv" color="#10B981" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--t2)' }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      {label}
    </div>
  );
}

function SummaryCard({ icon, title, val, sub, color }) {
  return (
    <div className="glass-card" style={{ borderRadius: 14, padding: '18px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{icon}</span>
        <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, background: `linear-gradient(135deg, ${color}, #22D3EE)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
        {val}
      </div>
      <div style={{ fontSize: 11, color: 'var(--t2)' }}>{sub}</div>
    </div>
  );
}
