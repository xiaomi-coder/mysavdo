import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  Page, PageHeader, Card, SectionHeader, Icon, Btn, Tag, RankBadge,
  EmptyState, SkeletonRows,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { isLowStock } from '../utils/stock';
import { MOVE_TYPES } from '../components/StockHistory';

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const MONTHS_FULL = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

/* ══════════════════════════════════════════════════════════════════════════
   Hisobotlar
   ══════════════════════════════════════════════════════════════════════ */

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('products');   // products | finance
  const [txns, setTxns] = useState([]);
  const [monthTxns, setMonthTxns] = useState([]);
  const [extra, setExtra] = useState({ expenses: 0, debt: 0, products: 0, lowStock: 0 });
  const [staffKpi, setStaffKpi] = useState([]);

  /* Tovar harakati hisoboti alohida yuklanadi — sana oralig'i o'zgarganda
     butun sahifani qayta so'ramaslik uchun */
  const [moveFrom, setMoveFrom] = useState(() =>
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [moveTo, setMoveTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [moves, setMoves] = useState(null);
  const [productNames, setProductNames] = useState({});

  const now = new Date();
  const monthLabel = `${MONTHS_FULL[now.getMonth()]} ${now.getFullYear()}`;

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [txnRes, expRes, debtRes, prodRes] = await Promise.all([
      supabase.from('transactions').select('total, items, date, cashier')
        .eq('store_id', storeId).eq('status', 'completed').gte('date', yearStart),
      supabase.from('expenses').select('amount').eq('store_id', storeId).gte('date', monthStart),
      supabase.from('debts').select('amount, paid_amount').eq('store_id', storeId).eq('status', "To'lanmagan"),
      supabase.from('products').select('stock, minStock, phone_imei1, phone_serial').eq('store_id', storeId),
    ]);

    const all = txnRes.data || [];
    setTxns(all);

    // Harakat hisobotida tovar nomini ko'rsatish uchun
    const { data: names } = await supabase.from('products')
      .select('id, name').eq('store_id', storeId);
    setProductNames(Object.fromEntries((names || []).map(p => [p.id, p.name])));
    setMonthTxns(all.filter(t => new Date(t.date) >= new Date(monthStart)));

    const prods = prodRes.data || [];
    setExtra({
      expenses: (expRes.data || []).reduce((s, e) => s + (Number(e.amount) || 0), 0),
      debt: (debtRes.data || []).reduce((s, d) => s + (Number(d.amount) - Number(d.paid_amount || 0)), 0),
      products: prods.length,
      lowStock: prods.filter(isLowStock).length,
    });

    // Kassirlar bo'yicha oylik KPI
    const byCashier = {};
    all.filter(t => new Date(t.date) >= new Date(monthStart)).forEach(t => {
      const k = t.cashier;
      if (!k) return;
      if (!byCashier[k]) byCashier[k] = { name: k, sales: 0, txns: 0 };
      byCashier[k].sales += Number(t.total) || 0;
      byCashier[k].txns += 1;
    });
    setStaffKpi(Object.values(byCashier).sort((a, b) => b.sales - a.sales));

    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  useEffect(() => {
    if (!user?.store_id || view !== 'movement') return;
    let alive = true;
    setMoves(null);

    // Oxirgi kun to'liq kirsin uchun ertangi kungacha so'raymiz
    const to = new Date(moveTo);
    to.setDate(to.getDate() + 1);

    supabase.from('stock_movements')
      .select('id, product_id, type, qty, created_at, actor, note')
      .eq('store_id', user.store_id)
      .gte('created_at', new Date(moveFrom).toISOString())
      .lt('created_at', to.toISOString())
      .order('id', { ascending: false })
      .limit(2000)
      .then(({ data }) => { if (alive) setMoves(data || []); });

    return () => { alive = false; };
  }, [user, view, moveFrom, moveTo]);

  /* ── Oylik ko'rsatkichlar ── */
  const kpi = useMemo(() => {
    let sales = 0, profit = 0;
    monthTxns.forEach(t => {
      sales += Number(t.total) || 0;
      (Array.isArray(t.items) ? t.items : []).forEach(i => {
        const qty = i.qty || 1;
        profit += ((Number(i.price) || 0) - (Number(i.cost_price) || Number(i.cost) || 0)) * qty;
      });
    });
    const count = monthTxns.length;
    const daysPassed = new Date().getDate();
    return {
      sales, profit, count,
      avg: count ? Math.round(sales / count) : 0,
      margin: sales ? Math.round((profit / sales) * 100) : 0,
      perDay: Math.round(count / daysPassed),
    };
  }, [monthTxns]);

  /* ── Yil bo'yicha oylik grafik ── */
  const monthly = useMemo(() => {
    const thisMonth = new Date().getMonth();
    const arr = Array.from({ length: thisMonth + 1 }, (_, i) => ({
      label: MONTHS[i], sales: 0, current: i === thisMonth,
    }));
    txns.forEach(t => {
      const m = new Date(t.date).getMonth();
      if (arr[m]) arr[m].sales += Number(t.total) || 0;
    });
    return arr;
  }, [txns]);

  /* ── Mahsulotlar hisoboti ── */
  const products = useMemo(() => {
    const map = {};
    monthTxns.forEach(t => {
      (Array.isArray(t.items) ? t.items : []).forEach(i => {
        const name = i.name || 'Noma\'lum';
        const qty = i.qty || 1;
        const net = (Number(i.price) || 0) - (Number(i.itemDiscount) || 0);
        const cost = Number(i.cost_price) || Number(i.cost) || 0;
        if (!map[name]) map[name] = { name, qty: 0, revenue: 0, profit: 0 };
        map[name].qty += qty;
        map[name].revenue += net * qty;
        map[name].profit += (net - cost) * qty;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [monthTxns]);

  const REPORT_TYPES = [
    { id: 'products', label: 'Mahsulotlar', icon: 'package', available: products.length > 0 },
    { id: 'staff', label: 'Xodimlar KPI', icon: 'users-three', available: staffKpi.length > 0 },
    { id: 'movement', label: 'Tovar harakati', icon: 'arrows-left-right', available: true },
    { id: 'finance', label: 'Moliya', icon: 'wallet', available: true },
    { id: 'forecast', label: 'Prognoz', icon: 'trend-up', available: false, soon: true },
    { id: 'tax', label: 'Soliq 4%', icon: 'percent', available: false, soon: true },
  ];

  return (
    <Page>
      <PageHeader title="Hisobotlar" subtitle="Savdo, foyda va biznes ko‘rsatkichlari">
        <Btn variant="secondary" icon="calendar-blank" disabled title="Davr tanlash — tez orada">Davr</Btn>
        <Btn variant="secondary" icon="file-xls" disabled title="Excel — tez orada">Excel</Btn>
        <Btn variant="secondary" icon="file-pdf" disabled title="PDF — tez orada">PDF</Btn>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <Kpi icon="money" iconColor="var(--color-accent)" label="Jami sotuv"
          value={money(kpi.sales)} note={monthLabel} />
        <Kpi icon="chart-line-up" iconColor="var(--ok)" label="Jami foyda"
          value={money(kpi.profit)} valueColor="var(--ok)" note={`marja ${kpi.margin}%`} />
        <Kpi icon="receipt" iconColor="var(--color-accent)" label="Tranzaksiyalar"
          value={`${kpi.count} ta`} note={`kuniga ~${kpi.perDay}`} />
        <Kpi icon="shopping-cart" iconColor="var(--color-accent)" label="O‘rtacha chek"
          value={money(kpi.avg)} note="so‘m" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, alignItems: 'start' }}>
        <Card padding="var(--space-6)" gap={13}>
          <SectionHeader title="Oylik sotuv" hint={`${now.getFullYear()} · so‘m`} />
          {loading ? <SkeletonRows count={4} widths={['100%']} />
            : txns.length === 0 ? (
              <EmptyState icon="chart-bar" text="Sotuv ma’lumotlari yo‘q"
                sub="POS orqali birinchi sotuvni qilganingizda grafik paydo bo‘ladi" />
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={monthly} margin={{ top: 16, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-divider)" strokeDasharray="3 4" opacity={0.5} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false}
                    tick={{ fill: 'var(--color-neutral-600)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} width={54}
                    tick={{ fill: 'var(--color-neutral-600)', fontSize: 10 }}
                    tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(0)} mln` : v >= 1000 ? `${v / 1000}k` : v} />
                  <Tooltip
                    cursor={{ fill: 'color-mix(in srgb, var(--color-text) 4%, transparent)' }}
                    content={({ active, payload, label }) => active && payload?.length ? (
                      <div className="card elev-md" style={{ padding: '8px 12px', fontSize: 12, gap: 2 }}>
                        <div style={{ color: 'var(--color-neutral-500)' }}>{label}</div>
                        <div className="num" style={{ fontWeight: 500 }}>{money(payload[0].value)} so‘m</div>
                      </div>
                    ) : null}
                  />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]} maxBarSize={46}>
                    {monthly.map((m, i) => (
                      <Cell key={i} fill={m.current ? 'var(--color-accent-500)' : 'var(--color-accent-800)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            <MiniStat label="Jami xarajatlar" value={money(extra.expenses)} />
            <MiniStat label="Jami qarzdorlik" value={money(extra.debt)} color="var(--warn)" />
            <MiniStat label="Ombordagi tovarlar" value={`${extra.products} ta`} />
            <MiniStat label="Kam qoldiq" value={`${extra.lowStock} ta`} color={extra.lowStock ? 'var(--warn)' : undefined} />
          </div>
        </Card>

        <Card padding={14} gap={8}>
          <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>Hisobot turlari</div>
          {REPORT_TYPES.map(r => {
            const selected = view === r.id;
            const disabled = !r.available;
            return (
              <div
                key={r.id}
                onClick={() => !disabled && setView(r.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 8,
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                  background: selected ? 'var(--color-accent-900)'
                    : 'color-mix(in srgb, var(--color-text) 3%, transparent)',
                }}
              >
                <Icon name={r.icon} size={16}
                  color={selected ? 'var(--color-accent)' : 'var(--color-neutral-400)'} />
                <span style={{ flex: 1, fontSize: 13, color: disabled ? 'var(--color-neutral-400)' : undefined }}>
                  {r.label}
                </span>
                {r.soon ? <Tag variant="neutral">Tez orada</Tag>
                  : disabled ? <Tag variant="neutral">Ma’lumot yo‘q</Tag>
                    : <Icon name="caret-right" size={12} color="var(--color-neutral-600)" />}
              </div>
            );
          })}
        </Card>
      </div>

      {/* ── Tanlangan hisobot ── */}
      {view === 'products' && (
        <Card padding="var(--space-6)" gap={10}>
          <SectionHeader title={`Mahsulotlar hisoboti · ${monthLabel}`} hint={`${products.length} nomdagi tovar`} />
          {products.length === 0 ? (
            <EmptyState icon="package" text="Bu oyda sotuv bo‘lmagan" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th><th>Mahsulot</th>
                    <th style={{ textAlign: 'right' }}>Sotilgan</th>
                    <th style={{ textAlign: 'right' }}>Tushum</th>
                    <th style={{ textAlign: 'right' }}>Foyda</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 20).map((p, i) => (
                    <tr key={p.name}>
                      <td><RankBadge n={i + 1} size={20} /></td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td className="num" style={{ textAlign: 'right' }}>{p.qty} dona</td>
                      <td className="num" style={{ textAlign: 'right' }}>{money(p.revenue)}</td>
                      <td className="num" style={{
                        textAlign: 'right', color: p.profit >= 0 ? 'var(--ok)' : 'var(--dang)',
                      }}>
                        {money(p.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {view === 'staff' && (
        <Card padding="var(--space-6)" gap={10}>
          <SectionHeader title={`Xodimlar KPI · ${monthLabel}`} />
          {staffKpi.length === 0 ? (
            <EmptyState icon="chart-bar" text="Xodimlar KPI mavjud emas"
              sub="Xodimlar bo‘yicha sotuv ma’lumotlari hozircha yig‘ilmagan"
              action={<Btn variant="ghost" size="sm" onClick={() => load(user.store_id)}>Qayta tekshirish</Btn>} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {staffKpi.map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <RankBadge n={i + 1} />
                  <div style={{ width: 160, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{s.txns} tranzaksiya</div>
                  </div>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'color-mix(in srgb, var(--color-text) 6%, transparent)' }}>
                    <div style={{
                      width: `${Math.round((s.sales / staffKpi[0].sales) * 100)}%`, height: '100%', borderRadius: 4,
                      background: i === 0 ? 'var(--color-accent)' : 'var(--color-accent-700)',
                    }} />
                  </div>
                  <div className="num" style={{ width: 120, textAlign: 'right', fontSize: 14, fontWeight: 500 }}>
                    {money(s.sales)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {view === 'movement' && (
        <MovementReport
          moves={moves}
          products={productNames}
          from={moveFrom} to={moveTo}
          onFrom={setMoveFrom} onTo={setMoveTo}
        />
      )}

      {view === 'finance' && (
        <Card padding="var(--space-6)" gap={12}>
          <SectionHeader title={`Moliyaviy xulosa · ${monthLabel}`}>
            <Btn variant="ghost" size="sm" onClick={() => navigate('/finance')}>Moliya bo‘limi</Btn>
          </SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13 }}>
            <FlowRow label="Sotuvdan tushum" value={money(kpi.sales)} color="var(--ok)" sign="+" />
            <FlowRow label="Tovar tannarxi" value={money(kpi.sales - kpi.profit)} color="var(--color-neutral-400)" sign="−" />
            <FlowRow label="Do‘kon xarajatlari" value={money(extra.expenses)} color="var(--dang)" sign="−" />
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 15px', borderRadius: 9, marginTop: 4,
              background: kpi.profit - extra.expenses >= 0 ? 'var(--okbg)' : 'var(--dangbg)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: kpi.profit - extra.expenses >= 0 ? 'var(--ok)' : 'var(--dang)' }}>
                Sof foyda
              </span>
              <span className="num" style={{
                fontSize: 18, fontWeight: 600,
                color: kpi.profit - extra.expenses >= 0 ? 'var(--ok)' : 'var(--dang)',
              }}>
                {money(kpi.profit - extra.expenses)} so‘m
              </span>
            </div>
            <FlowRow label="Mijozlardan kutilayotgan nasiya" value={money(extra.debt)} color="var(--warn)" sign="" />
          </div>
        </Card>
      )}
    </Page>
  );
}

function Kpi({ icon, iconColor, label, value, valueColor, note }) {
  return (
    <Card padding={14} gap={5}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
        <Icon name={icon} size={15} color={iconColor} />
        {label}
      </div>
      <div className="num" style={{ fontSize: 20, fontWeight: 500, color: valueColor }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{note}</div>
    </Card>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <Card elev={null} padding={11} gap={3}>
      <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>{label}</div>
      <div className="num" style={{ fontSize: 15, fontWeight: 500, color }}>{value}</div>
    </Card>
  );
}

function FlowRow({ label, value, color, sign }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 13px', borderRadius: 8,
      background: 'color-mix(in srgb, var(--color-text) 3%, transparent)',
    }}>
      <span style={{ color: 'var(--color-neutral-400)' }}>{label}</span>
      <span className="num" style={{ fontWeight: 500, color }}>{sign}{value} so‘m</span>
    </div>
  );
}

/* ── Tovar harakati hisoboti ───────────────────────────────────────────── */
function MovementReport({ moves, products, from, to, onFrom, onTo }) {
  const typeOf = t => MOVE_TYPES[t] || { label: t, icon: 'dot', color: 'var(--color-neutral-400)' };

  /* Tur bo'yicha yig'indi */
  const byType = useMemo(() => {
    const map = {};
    (moves || []).forEach(m => {
      if (!map[m.type]) map[m.type] = { type: m.type, qty: 0, count: 0 };
      map[m.type].qty += Math.abs(m.qty);
      map[m.type].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [moves]);

  /* Tovar bo'yicha yig'indi — kirim, chiqim va sof o'zgarish */
  const byProduct = useMemo(() => {
    const map = {};
    (moves || []).forEach(m => {
      if (m.type === 'boshlangich') return;
      const key = m.product_id;
      if (!map[key]) map[key] = { id: key, in: 0, out: 0, net: 0, fixes: 0 };
      if (m.qty > 0) map[key].in += m.qty; else map[key].out += -m.qty;
      map[key].net += m.qty;
      if (m.type === 'tuzatish' || m.type === 'taftish') map[key].fixes += 1;
    });
    return Object.values(map).sort((a, b) => (b.in + b.out) - (a.in + a.out));
  }, [moves]);

  const totals = useMemo(() => {
    const t = { in: 0, out: 0, unexplained: 0 };
    (moves || []).forEach(m => {
      if (m.type === 'boshlangich') return;
      if (m.qty > 0) t.in += m.qty; else t.out += -m.qty;
      if (m.type === 'tuzatish') t.unexplained += 1;
    });
    return t;
  }, [moves]);

  return (
    <Card padding="var(--space-6)" gap={13}>
      <SectionHeader title="Tovar harakati">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input className="input num" type="date" value={from} max={to}
            onChange={e => onFrom(e.target.value)} style={{ width: 150 }} />
          <span style={{ color: 'var(--color-neutral-500)' }}>—</span>
          <input className="input num" type="date" value={to} min={from}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => onTo(e.target.value)} style={{ width: 150 }} />
        </div>
      </SectionHeader>

      {moves === null ? <SkeletonRows count={5} widths={['100%']} />
        : moves.length === 0 ? (
          <EmptyState icon="arrows-left-right" text="Bu davrda harakat bo‘lmagan"
            sub="Boshqa sanalarni tanlab ko‘ring" />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              <Card elev={null} padding={13} gap={4}>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Kirim</div>
                <div className="num" style={{ fontSize: 20, fontWeight: 500, color: 'var(--ok)' }}>
                  +{totals.in} dona
                </div>
              </Card>
              <Card elev={null} padding={13} gap={4}>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Chiqim</div>
                <div className="num" style={{ fontSize: 20, fontWeight: 500, color: 'var(--dang)' }}>
                  −{totals.out} dona
                </div>
              </Card>
              <Card elev={null} padding={13} gap={4}>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Sababsiz o‘zgarish</div>
                <div className="num" style={{
                  fontSize: 20, fontWeight: 500,
                  color: totals.unexplained ? 'var(--dang)' : 'var(--ok)',
                }}>
                  {totals.unexplained} ta
                </div>
              </Card>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {byType.map(t => {
                const info = typeOf(t.type);
                return (
                  <Tag key={t.type} variant="neutral" icon={info.icon}>
                    {info.label}: {t.count} marta · {t.qty} dona
                  </Tag>
                );
              })}
            </div>

            <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
              <table className="table" style={{ fontSize: 12.5 }}>
                <thead>
                  <tr>
                    <th>Tovar</th>
                    <th style={{ textAlign: 'right' }}>Kirim</th>
                    <th style={{ textAlign: 'right' }}>Chiqim</th>
                    <th style={{ textAlign: 'right' }}>Sof o‘zgarish</th>
                    <th style={{ textAlign: 'right' }}>Taftish/tuzatish</th>
                  </tr>
                </thead>
                <tbody>
                  {byProduct.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{products[r.id] || `#${r.id}`}</td>
                      <td className="num" style={{ textAlign: 'right', color: r.in ? 'var(--ok)' : 'var(--color-neutral-500)' }}>
                        {r.in ? `+${r.in}` : '—'}
                      </td>
                      <td className="num" style={{ textAlign: 'right', color: r.out ? 'var(--dang)' : 'var(--color-neutral-500)' }}>
                        {r.out ? `−${r.out}` : '—'}
                      </td>
                      <td className="num" style={{ textAlign: 'right', fontWeight: 600 }}>
                        {r.net > 0 ? `+${r.net}` : r.net}
                      </td>
                      <td className="num" style={{
                        textAlign: 'right',
                        color: r.fixes ? 'var(--warn)' : 'var(--color-neutral-500)',
                      }}>
                        {r.fixes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
    </Card>
  );
}
