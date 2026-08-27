import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Chip, Header, BarChart, SectionLabel, EmptyState, Icon,
} from '../ui';
import { money, dateShort, todayStart } from '../lib/format';

/* Hisobotlar.

   Uchta savolga javob beradi: qancha sotildi, nima ko'p ketdi, kim
   sotdi. Boshqa hamma narsa kompyuterdagi to'liq hisobotda —
   telefonda ko'p jadval o'qib bo'lmaydi. */

const RANGES = [
  { key: 'week', label: '7 kun', days: 7 },
  { key: 'month', label: '30 kun', days: 30 },
  { key: 'quarter', label: '90 kun', days: 90 },
];

const PAY = [
  { id: 'cash', label: 'Naqd', icon: 'money' },
  { id: 'card', label: 'Karta', icon: 'card' },
  { id: 'transfer', label: "O‘tkazma", icon: 'transfer' },
  { id: 'nasiya', label: 'Nasiya', icon: 'handshake' },
  { id: 'online', label: 'Onlayn', icon: 'globe' },
];

export default function Reports({ navigation }) {
  const { t } = useTheme();
  const d = useData();
  const [range, setRange] = useState('week');

  const days = RANGES.find((r) => r.key === range).days;

  const r = useMemo(() => {
    const from = todayStart().getTime() - (days - 1) * 86400000;
    const tx = d.transactions.filter((x) =>
      (x.status === 'completed' || x.status === 'returned')
      && new Date(x.date).getTime() >= from);

    const total = tx.reduce((s, x) => s + Number(x.total || 0), 0);
    const cost = tx.reduce((s, x) => {
      const items = Array.isArray(x.items) ? x.items : [];
      const c = items.reduce((a, it) => a + Number(it.cost_price || 0) * (it.qty || 1), 0);
      return s + (x.total < 0 ? -c : c);
    }, 0);

    /* Kunlar bo'yicha — grafik uchun. 30 va 90 kunda ustunlar
       juda ingichka bo'lib ketmasligi uchun hafta bo'yicha
       guruhlanadi. */
    const bucket = days <= 7 ? 1 : days <= 30 ? 3 : 9;
    const chart = [];
    for (let i = days - bucket; i >= 0; i -= bucket) {
      const a = todayStart().getTime() - i * 86400000;
      const b = a + bucket * 86400000;
      const v = tx.filter((x) => {
        const ts = new Date(x.date).getTime();
        return ts >= a - (bucket - 1) * 86400000 && ts < b;
      }).reduce((s, x) => s + Number(x.total || 0), 0);
      chart.unshift({ label: dateShort(a), value: Math.max(0, v), active: i === 0 });
    }

    const byPay = PAY.map((p) => ({
      ...p,
      value: tx.filter((x) => x.payment_method === p.id)
        .reduce((s, x) => s + Number(x.total || 0), 0),
    })).filter((p) => p.value !== 0);

    const prodBag = new Map();
    tx.forEach((x) => {
      const sign = x.total < 0 ? -1 : 1;
      (Array.isArray(x.items) ? x.items : []).forEach((it) => {
        const cur = prodBag.get(it.name) || { qty: 0, sum: 0 };
        cur.qty += sign * (it.qty || 1);
        cur.sum += sign * Number(it.price || 0) * (it.qty || 1);
        prodBag.set(it.name, cur);
      });
    });
    const tops = [...prodBag.entries()]
      .sort((a, b) => b[1].sum - a[1].sum).slice(0, 8)
      .map(([name, v]) => ({ name, ...v }));

    const cashierBag = new Map();
    tx.forEach((x) => {
      const who = String(x.cashier || 'Noma’lum').split('·')[0].trim();
      const cur = cashierBag.get(who) || { count: 0, sum: 0 };
      cur.count++;
      cur.sum += Number(x.total || 0);
      cashierBag.set(who, cur);
    });
    const cashiers = [...cashierBag.entries()]
      .sort((a, b) => b[1].sum - a[1].sum)
      .map(([name, v]) => ({ name, ...v }));

    return {
      total, profit: total - cost, count: tx.length, chart, byPay, tops, cashiers,
      avg: tx.length ? Math.round(total / tx.length) : 0,
    };
  }, [d.transactions, days]);

  const maxPay = Math.max(1, ...r.byPay.map((p) => Math.abs(p.value)));

  return (
    <Screen>
      <Header title="Hisobotlar" onBack={() => navigation.goBack()} />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {RANGES.map((x) => (
          <Chip key={x.key} label={x.label} active={range === x.key} onPress={() => setRange(x.key)} />
        ))}
      </View>

      {r.count === 0 ? (
        <EmptyState icon="file-text" title="Bu davrda sotuv yo‘q" />
      ) : (
        <>
          <Card pad={16} style={{ marginBottom: 12 }}>
            <Txt size={12} color={t.t3}>Jami sotuv</Txt>
            <Txt size={32} weight="600" style={{ marginTop: 2 }}>
              {money(r.total)} <Txt size={15} color={t.t4}>so‘m</Txt>
            </Txt>
            <View style={{ flexDirection: 'row', gap: 18, marginTop: 10 }}>
              <Small label="Foyda" value={money(r.profit)} color={t.ok} t={t} />
              <Small label="Cheklar" value={String(r.count)} t={t} />
              <Small label="O‘rtacha" value={money(r.avg)} t={t} />
            </View>
          </Card>

          <Card pad={16} style={{ marginBottom: 12 }}>
            <Txt size={13} weight="500" color={t.t2} style={{ marginBottom: 12 }}>
              Sotuv dinamikasi
            </Txt>
            <BarChart data={r.chart} height={110} />
          </Card>

          <SectionLabel>TO‘LOV TURLARI</SectionLabel>
          <Card pad={14} style={{ marginBottom: 16 }}>
            {r.byPay.map((p, i) => (
              <View key={p.id} style={{
                paddingVertical: 9,
                borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                  <Icon name={p.icon} size={17} color={t.acc} />
                  <Txt size={14} style={{ flex: 1 }}>{p.label}</Txt>
                  <Txt size={14} weight="600">{money(p.value)}</Txt>
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: t.line, overflow: 'hidden' }}>
                  <View style={{
                    width: `${(Math.abs(p.value) / maxPay) * 100}%`,
                    height: '100%', borderRadius: 2, backgroundColor: t.acc,
                  }} />
                </View>
              </View>
            ))}
          </Card>

          <SectionLabel>ENG KO‘P SOTILGAN</SectionLabel>
          <Card pad={14} style={{ marginBottom: 16 }}>
            {r.tops.map((p, i) => (
              <View key={p.name} style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 8,
                borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
              }}>
                <Txt size={13} weight="600" color={t.acc} style={{ width: 22 }}>{i + 1}</Txt>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt size={14} numberOfLines={1}>{p.name}</Txt>
                  <Txt size={11} color={t.t4}>{p.qty} dona</Txt>
                </View>
                <Txt size={14} weight="500">{money(p.sum)}</Txt>
              </View>
            ))}
          </Card>

          {r.cashiers.length > 1 ? (
            <>
              <SectionLabel>SOTUVCHILAR</SectionLabel>
              <Card pad={14}>
                {r.cashiers.map((c, i) => (
                  <View key={c.name} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    paddingVertical: 9,
                    borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
                  }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Txt size={14} numberOfLines={1}>{c.name}</Txt>
                      <Txt size={11} color={t.t4}>{c.count} ta chek</Txt>
                    </View>
                    <Txt size={14} weight="600">{money(c.sum)}</Txt>
                  </View>
                ))}
              </Card>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function Small({ label, value, color, t }) {
  return (
    <View>
      <Txt size={11} color={t.t4}>{label}</Txt>
      <Txt size={15} weight="600" color={color} style={{ marginTop: 2 }}>{value}</Txt>
    </View>
  );
}
