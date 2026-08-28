import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Icon, Skeleton, ErrorState, BarChart, EmptyState,
} from '../ui';
import { money, dateLong, timeShort, todayStart, weekdayShort } from '../lib/format';
import { alpha, R } from '../theme';
import ReceiptSheet from '../sheets/ReceiptSheet';
import AlertsSheet from '../sheets/AlertsSheet';

/* ══════════════════════════════════════════════════════════════════════════
   Asosiy ekran

   Do'kon egasi ertalab ilovani ochganda birinchi ko'radigan narsa —
   "bugun qancha sotildi". Shuning uchun u eng tepada va eng katta
   shrift bilan turadi.

   Undan keyin darhol e'tibor talab qiladigan narsalar: kam qolgan
   tovar, tugagan tovar, muddati o'tgan nasiya, yangi buyurtma. Ular
   bosiladigan — bosilsa to'g'ridan-to'g'ri kerakli ekranga olib boradi.
   ══════════════════════════════════════════════════════════════════════ */

export default function Dashboard({ navigation }) {
  const { t, mode, toggleMode } = useTheme();
  const { store } = useAuth();
  const d = useData();
  const [receipt, setReceipt] = useState(null);
  const [alerts, setAlerts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => compute(d.transactions), [d.transactions]);

  const refresh = async () => {
    setRefreshing(true);
    await d.reload({ silent: true });
    setRefreshing(false);
  };

  const chips = [];
  if (d.alerts.low.length) {
    chips.push({
      key: 'low', icon: 'warning', color: t.warn,
      text: `${d.alerts.low.length} tovar kam qoldi`,
      go: () => navigation.navigate('Ombor', { filter: 'low' }),
    });
  }
  if (d.alerts.out.length) {
    chips.push({
      key: 'out', icon: 'x-circle', color: t.err,
      text: d.alerts.out.length === 1
        ? `${d.alerts.out[0].name} tugadi`
        : `${d.alerts.out.length} tovar tugagan`,
      go: () => navigation.navigate('Ombor', { filter: 'out' }),
    });
  }
  if (d.alerts.overdue.length) {
    chips.push({
      key: 'debt', icon: 'clock', color: t.err,
      text: `${d.alerts.overdue.length} nasiya muddati o‘tgan`,
      go: () => navigation.navigate('Yana', { screen: 'Nasiya' }),
    });
  }
  if (d.pendingOrders.length) {
    chips.push({
      key: 'ord', icon: 'tray', color: t.blue,
      text: `${d.pendingOrders.length} yangi buyurtma`,
      go: () => navigation.navigate('Buyurtma'),
    });
  }

  const alertCount = d.alerts.low.length + d.alerts.out.length
    + d.alerts.overdue.length + d.pendingOrders.length;

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      {/* Sarlavha */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 14,
      }}>
        <View style={{ flex: 1 }}>
          <Txt size={17} weight="500" numberOfLines={1}>
            {store?.name || 'MyBazzar'}
          </Txt>
          <Txt size={12} color={t.t3} style={{ marginTop: 2 }}>{dateLong()}</Txt>
        </View>
        {/* Dizayndagi ikki tugma: mavzu almashtirish va ogohlantirishlar.
            Qo'ng'irog'dagi qizil nuqta faqat haqiqatan e'tibor talab
            qiladigan narsa bo'lganda yonadi. */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tap onPress={toggleMode} style={headBtn(t)}>
            <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={22} color={t.t2} />
          </Tap>
          <Tap onPress={() => setAlerts(true)} style={headBtn(t)}>
            <Icon name="bell" size={22} color={t.t2} />
            {alertCount > 0 ? (
              <View style={{
                position: 'absolute', top: 10, right: 11,
                width: 7, height: 7, borderRadius: 4, backgroundColor: t.err,
              }} />
            ) : null}
          </Tap>
        </View>
      </View>

      {d.loading ? (
        <View style={{ gap: 12 }}>
          <Skeleton height={128} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton height={76} style={{ flex: 1 }} />
            <Skeleton height={76} style={{ flex: 1 }} />
          </View>
          <Skeleton height={170} />
          <Skeleton height={120} />
        </View>
      ) : d.error ? (
        <ErrorState text={d.error} offline={d.offline} onRetry={() => d.reload()} />
      ) : (
        <View style={{ gap: 12 }}>
          {/* Bugungi sotuv */}
          <Card pad={16}>
            <Txt size={12} color={t.t3} style={{ marginBottom: 4 }}>Bugungi sotuv</Txt>
            <Txt size={36} weight="600" style={{ letterSpacing: -0.5 }}>
              {money(stats.today)} <Txt size={16} color={t.t4}>so‘m</Txt>
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <Txt size={14} color={t.t2}>Foyda: {money(stats.profit)} so‘m</Txt>
              {stats.delta != null ? (
                <View style={{
                  borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
                  borderColor: alpha(stats.delta >= 0 ? t.okRgb : t.errRgb, 0.4),
                }}>
                  <Txt size={12} weight="600" color={stats.delta >= 0 ? t.ok : t.err}>
                    {stats.delta >= 0 ? '▲' : '▼'} {stats.delta >= 0 ? '+' : ''}{stats.delta}%
                  </Txt>
                </View>
              ) : null}
            </View>
          </Card>

          {/* Tranzaksiya va o'rtacha chek */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MiniStat label="Tranzaksiyalar" value={String(stats.count)} />
            <MiniStat label="O‘rtacha chek" value={stats.count ? money(Math.round(stats.today / stats.count)) : '0'} />
          </View>

          {/* Ogohlantirishlar */}
          {chips.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {chips.map((c) => (
                <Tap
                  key={c.key}
                  onPress={c.go}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 7,
                    height: 38, paddingHorizontal: 13, borderRadius: R.pill,
                    backgroundColor: t.inset, borderWidth: 1,
                    borderColor: alpha(rgbOf(t, c.color), 0.4),
                  }}
                >
                  <Icon name={c.icon} size={16} color={c.color} />
                  <Txt size={13} weight="500" color={c.color}>{c.text}</Txt>
                </Tap>
              ))}
            </ScrollView>
          ) : null}

          {/* Haftalik grafik */}
          <Card pad={16}>
            <Txt size={13} weight="500" color={t.t2} style={{ marginBottom: 12 }}>
              Haftalik sotuv <Txt size={13} color={t.t4}>· so‘m</Txt>
            </Txt>
            <BarChart data={stats.week} />
          </Card>

          {/* Top mahsulotlar */}
          <Card pad={16}>
            <Txt size={13} weight="500" color={t.t2} style={{ marginBottom: 10 }}>
              Top mahsulotlar <Txt size={13} color={t.t4}>· bu hafta</Txt>
            </Txt>
            {stats.tops.length === 0 ? (
              <Txt size={13} color={t.t4} style={{ paddingVertical: 10 }}>
                Bu hafta hali sotuv bo‘lmadi
              </Txt>
            ) : stats.tops.map((p, i) => (
              <View key={p.name} style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 7, borderTopWidth: 1, borderTopColor: t.line,
              }}>
                <Txt size={13} weight="600" color={t.acc} style={{ width: 26 }}>{i + 1}</Txt>
                <Txt size={14} style={{ flex: 1 }} numberOfLines={1}>{p.name}</Txt>
                <Txt size={13} color={t.t3}>{p.qty} dona</Txt>
              </View>
            ))}
          </Card>

          {/* So'nggi sotuvlar */}
          <Card pad={16}>
            <Txt size={13} weight="500" color={t.t2} style={{ marginBottom: 10 }}>
              So‘nggi sotuvlar <Txt size={13} color={t.t4}>· qaytarish uchun chekni bosing</Txt>
            </Txt>
            {stats.recents.length === 0 ? (
              <EmptyState icon="receipt" text="Hali sotuv yo‘q" style={{ paddingVertical: 24 }} />
            ) : stats.recents.map((r) => (
              <Tap
                key={r.id}
                onPress={() => setReceipt(r)}
                activeStyle={{ opacity: 0.6 }}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  paddingVertical: 9, borderTopWidth: 1, borderTopColor: t.line,
                }}
              >
                <Txt size={12} color={t.t4} mono style={{ width: 42 }}>{timeShort(r.date)}</Txt>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt size={14} numberOfLines={1}>{titleOf(r)}</Txt>
                  {r.status === 'returned' ? (
                    <Txt size={11} weight="500" color={t.err} style={{ marginTop: 1 }}>qaytarilgan</Txt>
                  ) : null}
                </View>
                <Icon name={payIcon(r.payment_method)} size={16} color={t.t4} />
                <Txt size={14} weight="500">{money(r.total)}</Txt>
              </Tap>
            ))}
          </Card>
        </View>
      )}

      {receipt && <ReceiptSheet transaction={receipt} onClose={() => setReceipt(null)} />}
      {alerts && (
        <AlertsSheet visible onClose={() => setAlerts(false)} navigation={navigation} />
      )}
    </Screen>
  );
}

/* Sarlavhadagi 44px tugma — dizaynda ikkalasi bir xil */
const headBtn = (t) => ({
  width: 44, height: 44, borderRadius: R.lg,
  backgroundColor: t.card, borderWidth: 1, borderColor: t.line,
  alignItems: 'center', justifyContent: 'center',
});

function MiniStat({ label, value }) {
  const { t } = useTheme();
  return (
    <Card pad={13} style={{ flex: 1 }}>
      <Txt size={12} color={t.t3}>{label}</Txt>
      <Txt size={22} weight="600" style={{ marginTop: 2 }}>{value}</Txt>
    </Card>
  );
}

/* ── Hisob-kitob ──────────────────────────────────────────────────────── */

const DONE = (tx) => tx.status === 'completed' || tx.status === 'returned';

export function titleOf(tx) {
  const items = Array.isArray(tx.items) ? tx.items : [];
  if (items.length === 0) return tx.receipt_no || 'Sotuv';
  if (items.length === 1) return items[0].name;
  return `${items[0].name} +${items.length - 1}`;
}

export const payIcon = (m) => ({
  cash: 'money', card: 'card', transfer: 'transfer',
  nasiya: 'handshake', online: 'globe',
}[m] || 'receipt');

function compute(transactions) {
  const sold = transactions.filter(DONE);
  const t0 = todayStart().getTime();
  const dayMs = 86400000;

  const today = sold.filter((x) => new Date(x.date).getTime() >= t0);
  const yesterday = sold.filter((x) => {
    const ts = new Date(x.date).getTime();
    return ts >= t0 - dayMs && ts < t0;
  });

  const sum = (list) => list.reduce((s, x) => s + Number(x.total || 0), 0);

  const todaySum = sum(today);
  const yestSum = sum(yesterday);
  const delta = yestSum > 0 ? Math.round(((todaySum - yestSum) / yestSum) * 100) : null;

  // Foyda: har tovarning sotuv narxidan tannarxi ayiriladi
  const profit = today.reduce((s, tx) => {
    const items = Array.isArray(tx.items) ? tx.items : [];
    const gross = items.reduce(
      (a, it) => a + (Number(it.price || 0) - Number(it.cost_price || 0)) * (it.qty || 1), 0
    );
    return s + gross - Number(tx.discount || 0);
  }, 0);

  // So'nggi 7 kun
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const from = t0 - i * dayMs;
    const to = from + dayMs;
    const v = sum(sold.filter((x) => {
      const ts = new Date(x.date).getTime();
      return ts >= from && ts < to;
    }));
    week.push({ label: weekdayShort(from), value: v, active: i === 0 });
  }

  // Bu haftaning eng ko'p sotilgan tovarlari
  const bag = new Map();
  sold.filter((x) => new Date(x.date).getTime() >= t0 - 6 * dayMs).forEach((tx) => {
    (Array.isArray(tx.items) ? tx.items : []).forEach((it) => {
      bag.set(it.name, (bag.get(it.name) || 0) + (it.qty || 1));
    });
  });
  const tops = [...bag.entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([name, qty]) => ({ name, qty }));

  return {
    today: todaySum,
    profit: Math.max(0, profit),
    count: today.length,
    delta,
    week,
    tops,
    recents: sold.slice(0, 5),
  };
}

/* Rangdan rgb qatorini topamiz — chip ramkasi uchun */
function rgbOf(t, color) {
  if (color === t.warn) return t.warnRgb;
  if (color === t.err) return t.errRgb;
  if (color === t.ok) return t.okRgb;
  if (color === t.blue) return t.blueRgb;
  return t.accRgb;
}
