import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  Page, PageHeader, Card, SectionHeader, StatCard, Btn, Tag, Seg,
  RankBadge, RowLink, Icon, EmptyState, SkeletonRows,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/* ── yordamchilar ──────────────────────────────────────────────────────── */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

// Foyda tranzaksiya ichidagi tan narxlardan hisoblanadi
function calcTotals(txns) {
  let sotuv = 0, foyda = 0;
  (txns || []).forEach(t => {
    sotuv += Number(t.total) || 0;
    (Array.isArray(t.items) ? t.items : []).forEach(item => {
      const qty = item.qty || item.q || 1;
      const price = Number(item.price) || 0;
      const cost = Number(item.cost_price) || Number(item.cost) || 0;
      foyda += (price - cost) * qty;
    });
  });
  return { sotuv, foyda, count: (txns || []).length };
}

function trendOf(current, previous, suffix = '%') {
  if (!previous) {
    if (!current) return null;
    return { value: `+100${suffix}`, dir: 'up' };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return { value: `${pct >= 0 ? '+' : '−'}${Math.abs(pct)}${suffix}`, dir: pct >= 0 ? 'up' : 'down' };
}

const PAY_TAGS = {
  cash: { label: 'Naqd', icon: 'money' },
  card: { label: 'Plastik', icon: 'credit-card' },
  transfer: { label: 'Transfer', icon: 'device-mobile' },
  nasiya: { label: 'Nasiya', icon: 'hand-coins' },
};

const WEEK_LABELS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

const PERIODS = [
  { value: 'today', label: 'Bugun' },
  { value: 'week', label: 'Hafta' },
  { value: 'month', label: 'Oy' },
];

/* Tanlangan davr va u bilan solishtiriladigan oldingi davr chegaralari */
function rangeFor(period) {
  const now = new Date();
  const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);

  if (period === 'today') {
    const prev = new Date(dayStart); prev.setDate(prev.getDate() - 1);
    return { from: dayStart, to: now, prevFrom: prev, prevTo: dayStart, hint: 'kechaga nisbatan' };
  }
  if (period === 'week') {
    const from = new Date(dayStart); from.setDate(from.getDate() - 6);
    const prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
    return { from, to: now, prevFrom, prevTo: from, hint: 'oldingi haftaga nisbatan' };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { from, to: now, prevFrom, prevTo: from, hint: 'oldingi oyga nisbatan' };
}

/* ── sahifa ────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { user, sendTgAlert, alerts, refreshAlerts, pendingTxns } = useAuth();
  const navigate = useNavigate();

  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [sendingTg, setSendingTg] = useState(false);
  const [txns, setTxns] = useState([]);
  const [customers, setCustomers] = useState({});
  const [expenses, setExpenses] = useState(0);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const now = new Date();
    // Oldingi oy boshidan beri — bu bitta so'rov bugun/hafta/oy va ularning
    // solishtirish davrlarini ham qoplaydi.
    const since = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [txnRes, custRes, expRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('store_id', storeId)
        .gte('date', since.toISOString()).order('date', { ascending: false }),
      supabase.from('customers').select('id, name').eq('store_id', storeId),
      supabase.from('expenses').select('amount').eq('store_id', storeId)
        .gte('date', monthStart.toISOString()),
    ]);

    setTxns(txnRes.data || []);
    setCustomers(Object.fromEntries((custRes.data || []).map(c => [c.id, c.name])));
    setExpenses((expRes.data || []).reduce((s, e) => s + (Number(e.amount) || 0), 0));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.store_id) { load(user.store_id); refreshAlerts(); }
  }, [user, load, refreshAlerts]);

  const completed = useMemo(() => txns.filter(t => t.status === 'completed'), [txns]);

  /* ── KPI ── */
  const kpi = useMemo(() => {
    const { from, to, prevFrom, prevTo, hint } = rangeFor(period);
    const inRange = (a, b) => completed.filter(t => {
      const d = new Date(t.date);
      return d >= a && d < b;
    });

    const cur = calcTotals(inRange(from, new Date(to.getTime() + 1000)));
    const prev = calcTotals(inRange(prevFrom, prevTo));

    const avg = cur.count ? Math.round(cur.sotuv / cur.count) : 0;
    const prevAvg = prev.count ? Math.round(prev.sotuv / prev.count) : 0;

    return { cur, prev, avg, prevAvg, hint };
  }, [completed, period]);

  /* ── Haftalik grafik: oxirgi 7 kun ── */
  const weekly = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const day = completed.filter(t => {
        const td = new Date(t.date);
        return td >= d && td < next;
      });
      const { sotuv } = calcTotals(day);
      out.push({ label: i === 0 ? 'Bugun' : WEEK_LABELS[d.getDay()], sotuv, today: i === 0 });
    }
    return out;
  }, [completed]);

  const weekRangeLabel = useMemo(() => {
    const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const to = new Date();
    const from = new Date(); from.setDate(from.getDate() - 6);
    return `${from.getDate()}–${to.getDate()} ${MONTHS[to.getMonth()]}`;
  }, []);

  /* ── Top mahsulotlar ── */
  const topProducts = useMemo(() => {
    const map = {};
    completed.forEach(t => {
      (Array.isArray(t.items) ? t.items : []).forEach(item => {
        const name = item.name || item.n || 'Noma\'lum';
        const qty = item.qty || item.q || 1;
        const price = Number(item.price) || 0;
        const disc = Number(item.itemDiscount) || 0;
        if (!map[name]) map[name] = { name, qty: 0, sum: 0 };
        map[name].qty += qty;
        map[name].sum += (price - disc) * qty;
      });
    });
    return Object.values(map).sort((a, b) => b.sum - a.sum).slice(0, 5);
  }, [completed]);

  /* ── So'nggi sotuvlar ── */
  const recent = useMemo(() => txns.slice(0, 5).map(t => {
    const items = Array.isArray(t.items) ? t.items : [];
    const first = items[0];
    const productLabel = !first ? '—'
      : items.length > 1
        ? `${first.phone_model || first.name} +${items.length - 1}`
        : (first.phone_model || first.name);
    const d = new Date(t.date);
    const isToday = d.toDateString() === new Date().toDateString();
    return {
      id: t.id,
      customer: customers[t.customer_id] || t.cashier || '—',
      product: productLabel,
      total: t.total,
      pay: PAY_TAGS[t.payment_method] || PAY_TAGS.cash,
      time: `${isToday ? 'Bugun' : d.toLocaleDateString('ru-RU')}, ${d.toTimeString().slice(0, 5)}`,
      state: t.status !== 'completed'
        ? { variant: 'info', label: 'Oflayn' }
        : t.payment_method === 'nasiya'
          ? { variant: 'warn', label: 'Nasiya' }
          : { variant: 'ok', label: 'To‘landi' },
    };
  }), [txns, customers]);

  /* ── Telegram hisobot ── */
  const sendReport = () => {
    setSendingTg(true);
    const top = topProducts.map((p, i) => `${i + 1}. ${p.name} (${p.qty} ta)`).join('\n') || 'Yo‘q';
    const low = [...alerts.outOfStockNames, ...alerts.lowStockNames].join(', ') || 'Yo‘q';
    const periodLabel = PERIODS.find(p => p.value === period)?.label;
    setTimeout(() => {
      setSendingTg(false);
      sendTgAlert(
        `📊 HISOBOT — ${periodLabel}\n\n` +
        `💰 Sotuv: ${money(kpi.cur.sotuv)} so'm\n` +
        `📈 Foyda: ${money(kpi.cur.foyda)} so'm\n` +
        `🧾 Tranzaksiyalar: ${kpi.cur.count} ta\n` +
        `🛒 O'rtacha chek: ${money(kpi.avg)} so'm\n\n` +
        `📉 Bu oy xarajat: ${money(expenses)} so'm\n\n` +
        `🔝 Top mahsulotlar:\n${top}\n\n` +
        `⚠️ Kam qoldiq: ${low}`
      );
    }, 700);
  };

  const hasData = completed.length > 0;

  return (
    <Page>
      <PageHeader title="Dashboard" subtitle="Bugungi biznes faoliyatingiz">
        <Seg options={PERIODS} value={period} onChange={setPeriod} style={{ fontSize: 12 }} />
        <Btn variant="secondary" icon="paper-plane-tilt" onClick={sendReport} loading={sendingTg}>
          Telegram hisobot
        </Btn>
      </PageHeader>

      {/* ── KPI ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard
          icon="money" label="Jami sotuv" value={money(kpi.cur.sotuv)} unit="so‘m"
          trend={trendOf(kpi.cur.sotuv, kpi.prev.sotuv)} hint={kpi.hint}
        />
        <StatCard
          icon="chart-line-up" label="Jami foyda" value={money(kpi.cur.foyda)} unit="so‘m"
          trend={trendOf(kpi.cur.foyda, kpi.prev.foyda)} hint={kpi.hint}
        />
        <StatCard
          icon="receipt" label="Tranzaksiyalar" value={kpi.cur.count} unit="ta"
          trend={kpi.prev.count ? { value: `${kpi.cur.count - kpi.prev.count >= 0 ? '+' : '−'}${Math.abs(kpi.cur.count - kpi.prev.count)} ta`, dir: kpi.cur.count >= kpi.prev.count ? 'up' : 'down' } : null}
          hint={kpi.hint}
        />
        <StatCard
          icon="shopping-cart" label="O‘rtacha chek" value={money(kpi.avg)} unit="so‘m"
          trend={trendOf(kpi.avg, kpi.prevAvg)} hint={kpi.hint}
        />
      </div>

      {/* ── Grafik + Top mahsulotlar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 14, alignItems: 'stretch' }}>
        <Card padding="var(--space-6)" gap={14}>
          <SectionHeader title="Haftalik sotuvlar" hint={`${weekRangeLabel} · so‘m`} />
          {loading ? (
            <div style={{ padding: 'var(--space-6) 0' }}><SkeletonRows count={4} widths={['100%']} /></div>
          ) : !hasData ? (
            <EmptyState icon="chart-bar" text="Hozircha sotuvlar yo‘q" sub="Birinchi sotuvni POS orqali qiling" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekly} margin={{ top: 16, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-divider)" strokeDasharray="3 4" opacity={0.5} />
                <XAxis
                  dataKey="label" axisLine={false} tickLine={false}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x} y={y + 14} textAnchor="middle" fontSize={11}
                      fill={payload.value === 'Bugun' ? 'var(--color-accent-300)' : 'var(--color-neutral-600)'}
                      fontWeight={payload.value === 'Bugun' ? 500 : 400}
                    >
                      {payload.value}
                    </text>
                  )}
                />
                <YAxis
                  axisLine={false} tickLine={false} width={54}
                  tick={{ fill: 'var(--color-neutral-600)', fontSize: 10 }}
                  tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(0)} mln` : v >= 1000 ? `${v / 1000}k` : v}
                />
                <Tooltip
                  cursor={{ fill: 'color-mix(in srgb, var(--color-text) 4%, transparent)' }}
                  content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="card elev-md" style={{ padding: '8px 12px', fontSize: 12, gap: 2 }}>
                      <div style={{ color: 'var(--color-neutral-500)' }}>{label}</div>
                      <div className="num" style={{ fontWeight: 500 }}>{money(payload[0].value)} so‘m</div>
                    </div>
                  ) : null}
                />
                <Bar dataKey="sotuv" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {weekly.map((d, i) => (
                    <Cell key={i} fill={d.today ? 'var(--color-accent-500)' : 'var(--color-accent-800)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card padding="var(--space-6)" gap={6}>
          <SectionHeader title="Top mahsulotlar" style={{ marginBottom: 6 }}>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/reports')}>Barchasi</Btn>
          </SectionHeader>
          {loading ? <SkeletonRows count={5} />
            : topProducts.length === 0
              ? <EmptyState icon="package" text="Sotilgan mahsulot yo‘q" />
              : topProducts.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0' }}>
                  <RankBadge n={i + 1} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{p.qty} dona</div>
                  </div>
                  <div className="num" style={{ fontSize: 13 }}>{money(p.sum)}</div>
                </div>
              ))}
        </Card>
      </div>

      {/* ── So'nggi sotuvlar + E'tibor talab qiladi ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 14, alignItems: 'start' }}>
        <Card padding="var(--space-6)" gap={10}>
          <SectionHeader title="So‘nggi sotuvlar">
            <Btn variant="ghost" size="sm" onClick={() => navigate('/reports')}>Barchasi</Btn>
          </SectionHeader>
          {loading ? <SkeletonRows count={5} widths={['100%']} />
            : recent.length === 0
              ? <EmptyState
                  icon="receipt" text="Hozircha sotuvlar yo‘q" sub="Birinchi sotuvni qo‘shing"
                  action={<Btn variant="primary" size="sm" icon="plus" onClick={() => navigate('/pos')}>Yangi sotuv</Btn>}
                />
              : (
                <table className="table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Mijoz</th><th>Mahsulot</th>
                      <th style={{ textAlign: 'right' }}>Summa</th>
                      <th>To‘lov</th><th>Vaqt</th><th>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.id}>
                        <td>{r.customer}</td>
                        <td>{r.product}</td>
                        <td className="num" style={{ textAlign: 'right' }}>{money(r.total)}</td>
                        <td><Tag variant="neutral" icon={r.pay.icon}>{r.pay.label}</Tag></td>
                        <td style={{ color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>{r.time}</td>
                        <td><Tag variant={r.state.variant}>{r.state.label}</Tag></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
        </Card>

        <Card padding="var(--space-6)" gap={10}>
          <SectionHeader title="E’tibor talab qiladi" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.lowStock > 0 && (
              <RowLink
                icon="warning" iconFill iconColor="var(--warn)"
                title="Kam qoldiq" sub={`${alerts.lowStock} ta mahsulot minimumdan kam`}
                onClick={() => navigate('/inventory')}
              />
            )}
            {alerts.outOfStock > 0 && (
              <RowLink
                icon="warning-circle" iconFill iconColor="var(--dang)"
                title="Tugagan mahsulot" sub={`${alerts.outOfStock} ta mahsulot omborda yo‘q`}
                onClick={() => navigate('/inventory')}
              />
            )}
            {alerts.overdueDebts > 0 && (
              <RowLink
                icon="clock-countdown" iconFill iconColor="var(--dang)"
                title="Muddati o‘tgan nasiya"
                sub={`${alerts.overdueDebts} mijoz · ${money(alerts.overdueAmount)} so‘m`}
                onClick={() => navigate('/nasiya')}
              />
            )}
            {pendingTxns?.length > 0 && (
              <RowLink
                icon="arrows-clockwise" iconColor="var(--info)"
                title="Oflayn sinxronlash"
                sub={`${pendingTxns.length} ta sotuv sinxronlashni kutmoqda`}
              />
            )}
            {alerts.lowStock === 0 && alerts.outOfStock === 0 && alerts.overdueDebts === 0 && !pendingTxns?.length && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', fontSize: 13, color: 'var(--color-neutral-500)' }}>
                <Icon name="check-circle" fill size={17} color="var(--ok)" />
                Hammasi joyida — e’tibor talab qiladigan narsa yo‘q
              </div>
            )}
          </div>
        </Card>
      </div>
    </Page>
  );
}
