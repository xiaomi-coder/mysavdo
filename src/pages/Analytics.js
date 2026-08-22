import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  Page, PageHeader, Card, SectionHeader, Icon, Btn, Tag, EmptyState, SkeletonRows,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/* AI Analitika — dizayn maketida bu sahifa yo'q va sidebar'dan olib
   tashlangan, lekin marshrut ishlaydi. Shuning uchun u ham Nocturne
   tokenlariga o'tkazildi: eski ko'rinishda qolib ketmasin. */

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const short = n => n >= 1000000 ? `${(n / 1000000).toFixed(1)} mln` : money(n);

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [monthly, setMonthly] = useState([]);

  const analyze = useCallback(async (storeId) => {
    setLoading(true);
    const [prodRes, txnRes, expRes] = await Promise.all([
      supabase.from('products').select('name, stock, minStock').eq('store_id', storeId),
      supabase.from('transactions').select('total, items, date').eq('store_id', storeId).eq('status', 'completed'),
      supabase.from('expenses').select('amount').eq('store_id', storeId),
    ]);

    const products = prodRes.data || [];
    const txns = txnRes.data || [];
    const totalSales = txns.reduce((s, t) => s + (Number(t.total) || 0), 0);
    const totalExpenses = (expRes.data || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);

    // Mahsulot bo'yicha sotuv miqdori
    const sold = {};
    txns.forEach(t => (Array.isArray(t.items) ? t.items : []).forEach(i => {
      const n = i.name || 'Noma\'lum';
      sold[n] = (sold[n] || 0) + (i.qty || 1);
    }));
    const ranked = Object.entries(sold).sort((a, b) => b[1] - a[1]);

    const low = products.filter(p => (p.stock ?? 0) > 0 && p.stock <= (p.minStock || 5));
    const out = products.filter(p => (p.stock ?? 0) <= 0);

    const list = [];

    list.push(ranked.length ? {
      icon: 'rocket-launch', color: 'var(--ok)', title: 'Eng ko‘p sotilganlar',
      desc: ranked.slice(0, 3).map(([n, q]) => `${n} (${q} dona)`).join(', '),
      tag: `${Math.min(3, ranked.length)} ta mahsulot`, variant: 'ok',
    } : {
      icon: 'rocket-launch', color: 'var(--color-neutral-500)', title: 'Ma’lumot yig‘ilmagan',
      desc: 'POS orqali sotuv qilganingizda eng ko‘p sotilgan mahsulotlar shu yerda chiqadi.',
      tag: 'Sotuv kutilmoqda', variant: 'neutral',
    });

    if (ranked.length >= 3) {
      list.push({
        icon: 'snail', color: 'var(--dang)', title: 'Kam sotilayotganlar',
        desc: `${ranked.slice(-3).reverse().map(([n, q]) => `${n} (${q} dona)`).join(', ')} — chegirma yoki aksiya o‘tkazishni o‘ylab ko‘ring.`,
        tag: '3 ta mahsulot', variant: 'dang',
      });
    }

    list.push(low.length || out.length ? {
      icon: 'package', color: 'var(--warn)', title: 'Ombor ogohlantirishlari',
      desc: `${low.length} ta mahsulot kam qoldiqda${out.length ? `, ${out.length} ta tugagan` : ''}. `
        + (low.length ? `Jumladan: ${low.slice(0, 3).map(p => `${p.name} (${p.stock} dona)`).join(', ')}` : ''),
      tag: `${low.length + out.length} ta ogohlantirish`, variant: 'warn',
    } : {
      icon: 'package', color: 'var(--ok)', title: 'Ombor holati',
      desc: products.length ? 'Barcha mahsulotlar normal qoldiqda.' : 'Omborga tovar qo‘shing.',
      tag: products.length ? 'Yaxshi' : 'Ombor bo‘sh', variant: products.length ? 'ok' : 'neutral',
    });

    list.push({
      icon: 'wallet', color: 'var(--color-accent)', title: 'Foyda tahlili',
      desc: totalSales > 0
        ? `Jami sotuv: ${short(totalSales)} so‘m. Xarajatlar: ${short(totalExpenses)} so‘m. Sof foyda: ${short(totalSales - totalExpenses)} so‘m.`
        : 'Hali sotuv amalga oshirilmagan.',
      tag: totalSales > 0 ? `Foyda: ${short(totalSales - totalExpenses)} so‘m` : 'Hisoblash kutilmoqda',
      variant: totalSales - totalExpenses > 0 ? 'ok' : totalSales ? 'dang' : 'neutral',
    });

    setInsights(list);

    // Oxirgi 6 oy
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const sum = txns
        .filter(t => { const d = new Date(t.date); return d >= from && d < to; })
        .reduce((s, t) => s + (Number(t.total) || 0), 0);
      data.push({ label: MONTHS[from.getMonth()], sales: sum, current: i === 0 });
    }
    setMonthly(data);
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) analyze(user.store_id); }, [user, analyze]);

  return (
    <Page>
      <PageHeader title="AI Analitika" subtitle="Do‘kon ma’lumotlari asosidagi tahlil va tavsiyalar">
        <Btn variant="secondary" icon="arrows-clockwise" loading={loading}
          onClick={() => analyze(user?.store_id)}>
          Qayta tahlil
        </Btn>
      </PageHeader>

      {loading ? (
        <Card padding="var(--space-6)"><SkeletonRows count={6} widths={['100%']} /></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {insights.map((ins, i) => (
            <Card key={i} padding="var(--space-6)" gap={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name={ins.icon} size={22} color={ins.color} />
                <div style={{ fontSize: 15, fontWeight: 500 }}>{ins.title}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', lineHeight: 1.6, flex: 1 }}>
                {ins.desc}
              </div>
              <div><Tag variant={ins.variant}>{ins.tag}</Tag></div>
            </Card>
          ))}
        </div>
      )}

      <Card padding="var(--space-6)" gap={14}>
        <SectionHeader title="Oylik sotuv trendi" hint="oxirgi 6 oy · so‘m" />
        {monthly.some(m => m.sales > 0) ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly} margin={{ top: 10, right: 4, left: -12, bottom: 0 }}>
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
              <Bar dataKey="sales" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {monthly.map((m, i) => (
                  <Cell key={i} fill={m.current ? 'var(--color-accent-500)' : 'var(--color-accent-800)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon="chart-bar" text="Hozircha sotuv ma’lumotlari yo‘q" />
        )}
      </Card>
    </Page>
  );
}
