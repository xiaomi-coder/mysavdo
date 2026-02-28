import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatCard, Badge, SectionHeader, Btn } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

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
  const { user, sendTgAlert } = useAuth();
  const [loadingTg, setLoadingTg] = React.useState(false);
  const [recentSales, setRecentSales] = React.useState([]);
  const [totalSales, setTotalSales] = React.useState(0);
  const [totalItems, setTotalItems] = React.useState(0);
  const [totalReceipts, setTotalReceipts] = React.useState(0);
  const [activeCashiers, setActiveCashiers] = React.useState(0);
  const [totalExpenses, setTotalExpenses] = React.useState(0);
  const [lowStockProducts, setLowStockProducts] = React.useState([]);
  const [topProducts, setTopProducts] = React.useState([]);
  const [weeklyData, setWeeklyData] = React.useState([]);
  const [productCount, setProductCount] = React.useState(0);
  const [outOfStock, setOutOfStock] = React.useState(0);
  const [lowCount, setLowCount] = React.useState(0);

  React.useEffect(() => {
    if (user?.store_id) {
      loadAll(user.store_id);
    }
  }, [user]);

  const loadAll = async (storeId) => {
    // 1. Recent transactions
    const { data: txns } = await supabase.from('transactions')
      .select('*')
      .eq('store_id', storeId)
      .order('date', { ascending: false })
      .limit(6);
    if (txns) setRecentSales(txns);

    // 2. Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data: todayTxns } = await supabase.from('transactions')
      .select('total, items, cashier')
      .eq('store_id', storeId)
      .eq('status', 'completed')
      .gte('date', todayISO);

    if (todayTxns) {
      const sales = todayTxns.reduce((s, t) => s + (Number(t.total) || 0), 0);
      const items = todayTxns.reduce((s, t) => s + (t.items?.length || 0), 0);
      const cashiers = new Set(todayTxns.map(t => t.cashier)).size;
      setTotalSales(sales);
      setTotalItems(items);
      setTotalReceipts(todayTxns.length);
      setActiveCashiers(cashiers);
    }

    // 3. Expenses
    const { data: expData } = await supabase.from('expenses').select('amount').eq('store_id', storeId);
    if (expData) {
      setTotalExpenses(expData.reduce((s, e) => s + (Number(e.amount) || 0), 0));
    }

    // 4. Products — low stock & top products from transactions
    const { data: prods } = await supabase.from('products').select('name, stock, price').eq('store_id', storeId);
    if (prods) {
      setProductCount(prods.length);
      const low = prods.filter(p => p.stock > 0 && p.stock <= 10);
      const out = prods.filter(p => p.stock <= 0);
      setLowStockProducts([...out.map(p => `${p.name} (0 ta)`), ...low.map(p => `${p.name} (${p.stock} ta)`)]);
      setOutOfStock(out.length);
      setLowCount(low.length);
    }

    // 5. Top products from all transactions
    const { data: allTxns } = await supabase.from('transactions')
      .select('items')
      .eq('store_id', storeId)
      .eq('status', 'completed');

    if (allTxns) {
      const productMap = {};
      allTxns.forEach(t => {
        if (t.items && Array.isArray(t.items)) {
          t.items.forEach(item => {
            const name = item.name || item.n || 'Noma\'lum';
            const qty = item.qty || item.q || 1;
            productMap[name] = (productMap[name] || 0) + qty;
          });
        }
      });
      const sorted = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const maxQty = sorted[0]?.[1] || 1;
      setTopProducts(sorted.map(([name, qty], i) => ({
        rank: i + 1,
        name,
        qty,
        pct: Math.round((qty / maxQty) * 100),
        rankColor: i === 0 ? '#F59E0B' : '#94A3B8'
      })));
    }

    // 6. Weekly chart data — last 7 days
    const days = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha'];
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const { data: dayTxns } = await supabase.from('transactions')
        .select('total')
        .eq('store_id', storeId)
        .eq('status', 'completed')
        .gte('date', d.toISOString())
        .lt('date', nextD.toISOString());

      const sotuv = dayTxns ? dayTxns.reduce((s, t) => s + (Number(t.total) || 0), 0) : 0;
      weekData.push({ day: days[d.getDay()], sotuv, foyda: Math.round(sotuv * 0.25) });
    }
    setWeeklyData(weekData);
  };

  const foyda = totalSales - totalExpenses;

  const handleSendTgReport = () => {
    setLoadingTg(true);
    const topList = topProducts.map((p, i) => `${i + 1}. ${p.name} (${p.qty} ta)`).join('\n');
    const lowList = lowStockProducts.join(', ') || 'Yo\'q';
    setTimeout(() => {
      setLoadingTg(false);
      sendTgAlert(`📊 KUNLIK HISOBOT\n\n💸 UMUMIY SAVDO\n💰 Jami Savdo: ${totalSales.toLocaleString()} so'm\n📈 Sof Foyda: ${foyda.toLocaleString()} so'm\n📉 Xarajatlar: ${totalExpenses.toLocaleString()} so'm\n\n📦 STATISTIKA\n🧾 Cheklar soni: ${totalReceipts} ta\n🔝 Top ${topProducts.length} Mahsulotlar:\n${topList}\n\n⚠️ Ombor qoldig'i kam:\n${lowList}`);
    }, 800);
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
        <StatCard icon="💰" value={totalSales.toLocaleString()} label={<>Bugungi sotuv <span style={{ color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 6 }}>Foyda: {foyda.toLocaleString()}</span></>} accent="#3B82F6" />
        <StatCard icon="📦" value={totalItems.toLocaleString()} label="Sotilgan mahsulotlar" accent="#10B981" />
        <StatCard icon="🧾" value={totalReceipts} label="Cheklar soni" accent="#F59E0B" />
        <StatCard icon="👤" value={activeCashiers} label="Aktiv kassirlar" accent="#A78BFA" />
      </div>

      {/* Alert */}
      {lowStockProducts.length > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 12, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#F59E0B',
        }}>
          ⚠️ <strong>Diqqat:</strong>&nbsp;{lowStockProducts.length} ta mahsulot kam yoki tugagan — {lowStockProducts.slice(0, 5).join(', ')}
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>

        {/* Bar chart */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Haftalik Sotuv" />
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: 'var(--t2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="sotuv" name="Sotuv" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="foyda" name="Foyda" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>Hozircha sotuvlar yo'q</div>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <LegendDot color="#3B82F6" label="Sotuv" />
            <LegendDot color="#10B981" label="Foyda" />
          </div>
        </div>

        {/* Top products */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Top Mahsulotlar" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {topProducts.length > 0 ? topProducts.map(p => (
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
                <div style={{ fontSize: 11, color: 'var(--t2)', flexShrink: 0 }}>{p.qty} ta</div>
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)', fontSize: 12 }}>Hozircha sotuvlar yo'q</div>
            )}
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
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 12, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{new Date(s.date || s.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</td>
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
        <SummaryCard icon="📦" title="Ombordagi tovarlar" val={productCount.toLocaleString()} sub={`${outOfStock} ta tugagan, ${lowCount} ta kam`} color="#F59E0B" />
        <SummaryCard icon="💸" title="Umumiy xarajatlar" val={totalExpenses.toLocaleString()} sub="Umumiy xarajatlar yig'indisi" color="#F43F5E" />
        <SummaryCard icon="📈" title="Sof foyda" val={foyda.toLocaleString()} sub="Sotuv — Xarajatlar" color="#10B981" />
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
