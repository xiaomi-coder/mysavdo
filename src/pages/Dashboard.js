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

// Calculate real profit from transaction items
function calcProfit(txns) {
  let sotuv = 0, foyda = 0;
  (txns || []).forEach(t => {
    sotuv += Number(t.total) || 0;
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach(item => {
        const qty = item.qty || item.q || 1;
        const price = Number(item.price) || 0;
        const cost = Number(item.cost_price) || Number(item.cost) || 0;
        foyda += (price - cost) * qty;
      });
    }
  });
  return { sotuv, foyda };
}

function pctChange(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default function Dashboard() {
  const { user, sendTgAlert } = useAuth();
  const [loadingTg, setLoadingTg] = React.useState(false);
  const [recentSales, setRecentSales] = React.useState([]);
  // Today
  const [todaySales, setTodaySales] = React.useState(0);
  const [todayProfit, setTodayProfit] = React.useState(0);
  const [todayItems, setTodayItems] = React.useState(0);
  const [todayReceipts, setTodayReceipts] = React.useState(0);
  const [activeCashiers, setActiveCashiers] = React.useState(0);
  // Yesterday (for comparison)
  const [yesterdaySales, setYesterdaySales] = React.useState(0);
  const [yesterdayProfit, setYesterdayProfit] = React.useState(0);
  const [yesterdayReceipts, setYesterdayReceipts] = React.useState(0);
  // Monthly
  const [monthSales, setMonthSales] = React.useState(0);
  const [monthProfit, setMonthProfit] = React.useState(0);
  const [lastMonthSales, setLastMonthSales] = React.useState(0);
  const [lastMonthProfit, setLastMonthProfit] = React.useState(0);
  // Other
  const [totalExpenses, setTotalExpenses] = React.useState(0);
  const [lowStockProducts, setLowStockProducts] = React.useState([]);
  const [topProducts, setTopProducts] = React.useState([]);
  const [weeklyData, setWeeklyData] = React.useState([]);
  const [productCount, setProductCount] = React.useState(0);
  const [outOfStock, setOutOfStock] = React.useState(0);
  const [lowCount, setLowCount] = React.useState(0);

  React.useEffect(() => {
    if (user?.store_id) loadAll(user.store_id);
  }, [user]);

  const loadAll = async (storeId) => {
    // === Dates ===
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. Recent transactions
    const { data: txns } = await supabase.from('transactions')
      .select('*').eq('store_id', storeId).order('date', { ascending: false }).limit(6);
    if (txns) setRecentSales(txns);

    // 2. Today's stats (real profit from items)
    const { data: todayTxns } = await supabase.from('transactions')
      .select('total, items, cashier').eq('store_id', storeId).eq('status', 'completed')
      .gte('date', todayStart.toISOString());

    if (todayTxns) {
      const { sotuv, foyda } = calcProfit(todayTxns);
      const items = todayTxns.reduce((s, t) => s + (t.items?.length || 0), 0);
      setTodaySales(sotuv);
      setTodayProfit(foyda);
      setTodayItems(items);
      setTodayReceipts(todayTxns.length);
      setActiveCashiers(new Set(todayTxns.map(t => t.cashier)).size);
    }

    // 3. Yesterday's stats (for comparison)
    const { data: yTxns } = await supabase.from('transactions')
      .select('total, items').eq('store_id', storeId).eq('status', 'completed')
      .gte('date', yesterdayStart.toISOString()).lt('date', todayStart.toISOString());

    if (yTxns) {
      const { sotuv, foyda } = calcProfit(yTxns);
      setYesterdaySales(sotuv);
      setYesterdayProfit(foyda);
      setYesterdayReceipts(yTxns.length);
    }

    // 4. This month stats
    const { data: mTxns } = await supabase.from('transactions')
      .select('total, items').eq('store_id', storeId).eq('status', 'completed')
      .gte('date', monthStart.toISOString());
    if (mTxns) {
      const { sotuv, foyda } = calcProfit(mTxns);
      setMonthSales(sotuv);
      setMonthProfit(foyda);
    }

    // 5. Last month stats
    const { data: lmTxns } = await supabase.from('transactions')
      .select('total, items').eq('store_id', storeId).eq('status', 'completed')
      .gte('date', lastMonthStart.toISOString()).lt('date', monthStart.toISOString());
    if (lmTxns) {
      const { sotuv, foyda } = calcProfit(lmTxns);
      setLastMonthSales(sotuv);
      setLastMonthProfit(foyda);
    }

    // 6. Expenses (this month)
    const { data: expData } = await supabase.from('expenses').select('amount, date').eq('store_id', storeId)
      .gte('date', monthStart.toISOString());
    if (expData) setTotalExpenses(expData.reduce((s, e) => s + (Number(e.amount) || 0), 0));

    // 7. Products — low stock
    const { data: prods } = await supabase.from('products').select('name, stock, price').eq('store_id', storeId);
    if (prods) {
      setProductCount(prods.length);
      const low = prods.filter(p => p.stock > 0 && p.stock <= 10);
      const out = prods.filter(p => p.stock <= 0);
      setLowStockProducts([...out.map(p => `${p.name} (0 ta)`), ...low.map(p => `${p.name} (${p.stock} ta)`)]);
      setOutOfStock(out.length);
      setLowCount(low.length);
    }

    // 8. Top products
    const { data: allTxns } = await supabase.from('transactions')
      .select('items').eq('store_id', storeId).eq('status', 'completed');
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
        rank: i + 1, name, qty, pct: Math.round((qty / maxQty) * 100),
        rankColor: i === 0 ? '#F59E0B' : '#94A3B8'
      })));
    }

    // 9. Weekly chart — real profit
    const days = ['Yak', 'Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha'];
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1);

      const { data: dayTxns } = await supabase.from('transactions')
        .select('total, items').eq('store_id', storeId).eq('status', 'completed')
        .gte('date', d.toISOString()).lt('date', nextD.toISOString());

      const { sotuv, foyda } = calcProfit(dayTxns);
      weekData.push({ day: days[d.getDay()], sotuv, foyda });
    }
    setWeeklyData(weekData);
  };

  const sofFoyda = monthProfit - totalExpenses;
  const salesChange = pctChange(todaySales, yesterdaySales);
  const profitChange = pctChange(todayProfit, yesterdayProfit);
  const receiptsChange = pctChange(todayReceipts, yesterdayReceipts);
  const monthSalesChange = pctChange(monthSales, lastMonthSales);
  const monthProfitChange = pctChange(monthProfit, lastMonthProfit);

  const handleSendTgReport = () => {
    setLoadingTg(true);
    const topList = topProducts.map((p, i) => `${i + 1}. ${p.name} (${p.qty} ta)`).join('\n');
    const lowList = lowStockProducts.join(', ') || 'Yo\'q';
    setTimeout(() => {
      setLoadingTg(false);
      sendTgAlert(`📊 KUNLIK HISOBOT\n\n💸 BUGUNGI SAVDO\n💰 Sotuv: ${todaySales.toLocaleString()} so'm ${salesChange >= 0 ? '▲' : '▼'}${Math.abs(salesChange)}%\n📈 Foyda: ${todayProfit.toLocaleString()} so'm\n🧾 Cheklar: ${todayReceipts} ta\n\n📅 BU OY\n💰 Sotuv: ${monthSales.toLocaleString()} so'm\n📈 Foyda: ${monthProfit.toLocaleString()} so'm\n📉 Xarajat: ${totalExpenses.toLocaleString()} so'm\n💎 Sof foyda: ${sofFoyda.toLocaleString()} so'm\n\n🔝 Top ${topProducts.length}:\n${topList}\n\n⚠️ Kam qoldiq:\n${lowList}`);
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

      {/* Today Stats with comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard icon="💰" value={todaySales.toLocaleString()} label={<>Bugungi sotuv <ChangeBadge value={salesChange} /></>} accent="#3B82F6" />
        <StatCard icon="📈" value={todayProfit.toLocaleString()} label={<>Bugungi foyda <ChangeBadge value={profitChange} /></>} accent="#10B981" />
        <StatCard icon="🧾" value={todayReceipts} label={<>Cheklar soni <ChangeBadge value={receiptsChange} /></>} accent="#F59E0B" />
        <StatCard icon="👤" value={activeCashiers} label="Aktiv kassirlar" accent="#A78BFA" />
      </div>

      {/* Alert */}
      {lowStockProducts.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#F59E0B' }}>
          ⚠️ <strong>Diqqat:</strong>&nbsp;{lowStockProducts.length} ta mahsulot kam yoki tugagan — {lowStockProducts.slice(0, 5).join(', ')}
        </div>
      )}

      {/* Monthly comparison cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        <CompareCard icon="💰" title="Oylik sotuv" current={monthSales} previous={lastMonthSales} change={monthSalesChange} color="#3B82F6" />
        <CompareCard icon="📈" title="Oylik foyda" current={monthProfit} previous={lastMonthProfit} change={monthProfitChange} color="#10B981" />
        <CompareCard icon="💎" title="Sof foyda (bu oy)" current={sofFoyda} previous={null} change={null} color="#A78BFA" sub={`Foyda ${monthProfit.toLocaleString()} - Xarajat ${totalExpenses.toLocaleString()}`} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        {/* Bar chart */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Haftalik Sotuv va Foyda" />
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
                <div style={{ width: 24, height: 24, borderRadius: 7, background: p.rank === 1 ? 'rgba(245,158,11,0.15)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: p.rankColor, flexShrink: 0 }}>{p.rank}</div>
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
                {['Chek #', 'Kassir', 'Mahsulotlar', "To'lov turi", 'Summa', 'Foyda', 'Vaqt', 'Status'].map(h => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: .8, padding: '0 12px 12px 0', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map(s => {
                // Calculate per-transaction profit
                let txProfit = 0;
                if (s.items && Array.isArray(s.items)) {
                  s.items.forEach(item => {
                    const qty = item.qty || item.q || 1;
                    const price = Number(item.price) || 0;
                    const cost = Number(item.cost_price) || Number(item.cost) || 0;
                    txProfit += (price - cost) * qty;
                  });
                }
                return (
                  <tr key={s.id} className="fast-transition" style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{s.receipt_no}</td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{s.cashier}</td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{s.items?.length || 0} ta</td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {s.payment_method === 'card' ? '💳' : s.payment_method === 'cash' ? '💵' : '📱'} {s.payment_method}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, fontWeight: 700, color: s.status === 'cancelled' ? '#F43F5E' : '#3B82F6', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: s.status === 'cancelled' ? 'line-through' : 'none' }}>
                      {s.total?.toLocaleString() || 0} so'm
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 13, fontWeight: 700, color: '#10B981', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {txProfit.toLocaleString()} so'm
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', fontSize: 12, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{new Date(s.date || s.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ padding: '12px 0 12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Badge type={s.status === 'completed' ? 'success' : 'danger'}>
                        {s.status === 'completed' ? '✓ Yakunlandi' : '✗ Bekor'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {recentSales.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--t3)' }}>Hozircha sotuvlar yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        <SummaryCard icon="📦" title="Ombordagi tovarlar" val={productCount.toLocaleString()} sub={`${outOfStock} ta tugagan, ${lowCount} ta kam`} color="#F59E0B" />
        <SummaryCard icon="💸" title="Oylik xarajatlar" val={totalExpenses.toLocaleString()} sub="Bu oydagi xarajatlar" color="#F43F5E" />
        <SummaryCard icon="📊" title="Kechagi sotuv" val={yesterdaySales.toLocaleString()} sub={`Foyda: ${yesterdayProfit.toLocaleString()} so'm · ${yesterdayReceipts} ta chek`} color="#94A3B8" />
      </div>
    </div>
  );
}

// ── Change badge (▲ +12% / ▼ -5%) ──
function ChangeBadge({ value }) {
  if (value === null || value === undefined) return null;
  const isUp = value >= 0;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, marginLeft: 6,
      background: isUp ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
      color: isUp ? '#10B981' : '#F43F5E',
    }}>
      {isUp ? '▲' : '▼'} {Math.abs(value)}%
    </span>
  );
}

// ── Monthly comparison card ──
function CompareCard({ icon, title, current, previous, change, color, sub }) {
  return (
    <div className="glass-card" style={{ borderRadius: 14, padding: '18px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>{title}</span>
        </div>
        {change !== null && <ChangeBadge value={change} />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, background: `linear-gradient(135deg, ${color}, #22D3EE)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
        {(current || 0).toLocaleString()} so'm
      </div>
      <div style={{ fontSize: 11, color: 'var(--t2)' }}>
        {sub || (previous !== null ? `O'tgan oy: ${(previous || 0).toLocaleString()} so'm` : '')}
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
