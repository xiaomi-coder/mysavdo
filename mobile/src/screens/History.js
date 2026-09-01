import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Chip, Icon, Header, EmptyState, Skeleton, Sheet, Input,
} from '../ui';
import { db } from '../lib/api';
import { money, timeShort, dateShort, dateLong, todayStart } from '../lib/format';
import { R } from '../theme';
import ReceiptSheet from '../sheets/ReceiptSheet';

/* ══════════════════════════════════════════════════════════════════════════
   Sotuvlar tarixi

   Sotuv ekranidagi "Tarix" tugmasidan ochiladi. Ochilganda avtomatik
   BUGUN turadi — kassirga eng ko'p kerak bo'ladigan narsa shu.

   Sotuvchi faqat o'z sotuvini ko'radi, do'kon egasi hammasini. Sabab:
   sotuvchiga boshqa smenaning tushumi kerak emas, egaga esa kerak.
   Egada "Hammasi / Meniki" almashtirgichi bor.

   Chek ustiga bosilsa qaytarish oynasi ochiladi — u allaqachon bor.
   ══════════════════════════════════════════════════════════════════════ */

const DAY = 86400000;

const RANGES = [
  { key: 'today', label: 'Bugun' },
  { key: 'yesterday', label: 'Kecha' },
  { key: 'week', label: '7 kun' },
  { key: 'month', label: 'Oy' },
  { key: 'custom', label: 'Oraliq' },
];

const PAY_LABEL = {
  cash: 'Naqd', card: 'Karta', transfer: 'O‘tkazma',
  nasiya: 'Nasiya', online: 'Onlayn',
};
const PAY_ICON = {
  cash: 'money', card: 'card', transfer: 'transfer',
  nasiya: 'handshake', online: 'globe',
};

export default function History({ navigation }) {
  const { t } = useTheme();
  const { user, isOwner } = useAuth();
  const d = useData();

  const [range, setRange] = useState('today');
  const [from, setFrom] = useState(() => todayStart());
  const [to, setTo] = useState(() => new Date());
  const [picking, setPicking] = useState(null);      // null | 'from' | 'to'
  const [rangeSheet, setRangeSheet] = useState(false); // davr tanlash oynasi
  const [q, setQ] = useState('');                    // qidiruv
  const [mine, setMine] = useState(!isOwner);
  const [rows, setRows] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /* Tanlangan davrni sanaga aylantiramiz */
  const bounds = useMemo(() => {
    const t0 = todayStart().getTime();
    switch (range) {
      case 'today': return { a: t0, b: t0 + DAY };
      case 'yesterday': return { a: t0 - DAY, b: t0 };
      case 'week': return { a: t0 - 6 * DAY, b: t0 + DAY };
      case 'month': return { a: t0 - 29 * DAY, b: t0 + DAY };
      default: {
        const a = new Date(from); a.setHours(0, 0, 0, 0);
        const b = new Date(to); b.setHours(23, 59, 59, 999);
        return { a: a.getTime(), b: b.getTime() };
      }
    }
  }, [range, from, to]);

  const load = useCallback(async () => {
    if (!d.storeId) return;
    const { data } = await db.from('transactions').select('*')
      .eq('store_id', d.storeId)
      .gte('date', new Date(bounds.a).toISOString())
      .lt('date', new Date(bounds.b).toISOString())
      .order('date', { ascending: false })
      .limit(1000);
    setRows(data || []);
  }, [d.storeId, bounds.a, bounds.b]);

  useEffect(() => { setRows(null); load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  /* Ko'rinadigan cheklar */
  const visible = useMemo(() => {
    let list = (rows || []).filter((x) => x.status === 'completed' || x.status === 'returned');
    if (mine) {
      const me = String(user?.name || '').trim();
      list = list.filter((x) => String(x.cashier || '').split('·')[0].trim() === me);
    }
    /* Qidiruv: chek raqami, tovar nomi, sotuvchi va summa bo'yicha.
       Summani raqam sifatida ham qidiramiz — "450000" deb yozilsa
       o'sha summadagi chek topiladi. */
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    const digits = needle.replace(/\D/g, '');
    return list.filter((x) => {
      if (String(x.receipt_no || '').toLowerCase().includes(needle)) return true;
      if (String(x.cashier || '').toLowerCase().includes(needle)) return true;
      const items = Array.isArray(x.items) ? x.items : [];
      if (items.some((it) => String(it.name || '').toLowerCase().includes(needle))) return true;
      if (digits && String(Math.abs(Math.round(Number(x.total) || 0))).includes(digits)) return true;
      return false;
    });
  }, [rows, mine, user, q]);

  const sum = useMemo(() => {
    const total = visible.reduce((s, x) => s + Number(x.total || 0), 0);
    const by = {};
    visible.forEach((x) => {
      const k = x.payment_method || 'cash';
      by[k] = (by[k] || 0) + Number(x.total || 0);
    });
    const returns = visible.filter((x) => Number(x.total) < 0);
    return { total, by, count: visible.length, returns: returns.length };
  }, [visible]);

  /* Kunlarga bo'lamiz — bir kundan uzoq davrda sarlavha chiqadi */
  const groups = useMemo(() => {
    const map = new Map();
    visible.forEach((x) => {
      const day = new Date(x.date); day.setHours(0, 0, 0, 0);
      const k = day.getTime();
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(x);
    });
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [visible]);

  /* Tugmada ko'rinadigan matn */
  const rangeLabel = RANGES.find((r) => r.key === range)?.label || 'Davr';
  const rangeSub = range === 'today' ? dateLong()
    : range === 'yesterday' ? dateLong(bounds.a)
    : `${dateShort(bounds.a)} — ${dateShort(bounds.b - DAY)}`;

  const multiDay = groups.length > 1;

  return (
    <>
      <Screen onRefresh={refresh} refreshing={refreshing} bottomPad={40}>
        <Header title="Sotuvlar tarixi" onBack={() => navigation.goBack()} />

        {/* Davr — bitta keng tugma, bosilganda ro'yxat ochiladi.
            Ilgari 5 ta chip yonma-yon turardi va ekranga sig'masdi. */}
        <Tap
          onPress={() => setRangeSheet(true)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            borderWidth: 1, borderColor: t.line2, borderRadius: R.md,
            paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10,
          }}
        >
          <Icon name="calendar" size={17} color={t.acc} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={14.5} weight="500" numberOfLines={1}>{rangeLabel}</Txt>
            <Txt size={11.5} color={t.t4} numberOfLines={1} style={{ marginTop: 1 }}>
              {rangeSub}
            </Txt>
          </View>
          <Icon name="caret-down" size={15} color={t.t4} />
        </Tap>

        {/* Qidiruv — 2-3 kun oldingi chekni tez topib qaytarish uchun */}
        <Input
          value={q}
          onChangeText={setQ}
          placeholder="Chek raqami, tovar, sotuvchi yoki summa"
          style={{ marginBottom: 12 }}
          right={q ? (
            <Tap onPress={() => setQ('')} style={{ paddingHorizontal: 12 }}>
              <Icon name="x-circle" size={18} color={t.t4} />
            </Tap>
          ) : null}
        />

        {isOwner ? (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            <Chip label="Hammasi" active={!mine} onPress={() => setMine(false)} />
            <Chip label="Meniki" active={mine} onPress={() => setMine(true)} />
          </View>
        ) : null}

        {/* Yig'indi */}
        <Card pad={16} style={{ marginBottom: 14 }}>
          <Txt size={12} color={t.t3}>
            {range === 'today' ? dateLong() : `${dateShort(bounds.a)} — ${dateShort(bounds.b - DAY)}`}
          </Txt>
          <Txt size={30} weight="600" style={{ marginTop: 3 }}>
            {money(sum.total)} <Txt size={14} color={t.t4}>so‘m</Txt>
          </Txt>
          <Txt size={13} color={t.t3} style={{ marginTop: 5 }}>
            {sum.count} ta chek{sum.returns > 0 ? ` · ${sum.returns} qaytarish` : ''}
          </Txt>

          {Object.keys(sum.by).length > 0 ? (
            <View style={{ marginTop: 12, gap: 7 }}>
              {Object.entries(sum.by).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                  <Icon name={PAY_ICON[k] || 'receipt'} size={16} color={t.t4} />
                  <Txt size={13} color={t.t3} style={{ flex: 1 }}>{PAY_LABEL[k] || k}</Txt>
                  <Txt size={13.5} weight="500">{money(v)}</Txt>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        {/* Ro'yxat */}
        {rows === null ? (
          <View style={{ gap: 10 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={58} />)}</View>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="receipt"
            title="Bu davrda sotuv yo‘q"
            text={mine ? 'Boshqa davrni tanlang yoki "Hammasi" ga o‘ting' : 'Boshqa davrni tanlang'}
          />
        ) : groups.map(([day, list]) => (
          <View key={day} style={{ marginBottom: 16 }}>
            {multiDay ? (
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 7, paddingHorizontal: 2,
              }}>
                <Txt size={12} weight="500" color={t.t4}>{dateLong(day)}</Txt>
                <Txt size={12} weight="500" color={t.t3}>
                  {money(list.reduce((s, x) => s + Number(x.total || 0), 0))}
                </Txt>
              </View>
            ) : null}

            <Card pad={0} style={{ overflow: 'hidden' }}>
              {list.map((x, i) => {
                const items = Array.isArray(x.items) ? x.items : [];
                const back = Number(x.total) < 0;
                const label = items.length === 0 ? (x.receipt_no || 'Sotuv')
                  : items.length === 1 ? items[0].name
                  : `${items[0].name} +${items.length - 1}`;
                return (
                  <Tap
                    key={x.id}
                    onPress={() => setReceipt(x)}
                    activeStyle={{ backgroundColor: t.line }}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 10,
                      paddingHorizontal: 14, paddingVertical: 12,
                      borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
                    }}
                  >
                    <Txt size={12} color={t.t4} mono style={{ width: 42 }}>{timeShort(x.date)}</Txt>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Txt size={14} numberOfLines={1} color={back ? t.err : t.t1}>{label}</Txt>
                      <Txt size={11} color={t.t4} style={{ marginTop: 1 }} numberOfLines={1}>
                        {back ? 'qaytarish' : PAY_LABEL[x.payment_method] || ''}
                        {!mine && x.cashier ? ` · ${String(x.cashier).split('·')[0].trim()}` : ''}
                      </Txt>
                    </View>
                    <Icon name={PAY_ICON[x.payment_method] || 'receipt'} size={15} color={t.t4} />
                    <Txt size={14} weight="500" color={back ? t.err : t.t1}>
                      {money(x.total)}
                    </Txt>
                  </Tap>
                );
              })}
            </Card>
          </View>
        ))}
      </Screen>

      {/* Davr tanlash oynasi */}
      {rangeSheet ? (
        <Sheet visible onClose={() => setRangeSheet(false)} title="Davrni tanlang">
          <View style={{ gap: 2 }}>
            {RANGES.map((r) => {
              const on = range === r.key;
              return (
                <Tap
                  key={r.key}
                  onPress={() => {
                    setRange(r.key);
                    // "Oraliq" tanlansa darhol sana tanlashga o'tamiz
                    if (r.key === 'custom') setPicking('from');
                    setRangeSheet(false);
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    paddingVertical: 14, paddingHorizontal: 14, borderRadius: R.md,
                    backgroundColor: on ? t.line : 'transparent',
                  }}
                >
                  <Icon name={r.key === 'custom' ? 'clock' : 'calendar'} size={18}
                    color={on ? t.acc : t.t4} />
                  <Txt size={15} weight={on ? '600' : '400'}
                    color={on ? t.acctext : t.t1} style={{ flex: 1 }}>
                    {r.label}
                  </Txt>
                  {on ? <Icon name="check" size={17} color={t.acc} /> : null}
                </Tap>
              );
            })}
          </View>

          {/* Oraliq tanlangan bo'lsa sanalarni shu yerdan o'zgartiriladi */}
          {range === 'custom' ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <DateBox label="Boshi" value={from} onPress={() => setPicking('from')} t={t} />
              <DateBox label="Oxiri" value={to} onPress={() => setPicking('to')} t={t} />
            </View>
          ) : null}
        </Sheet>
      ) : null}

      {picking ? (
        <DateTimePicker
          value={picking === 'from' ? from : to}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={(e, date) => {
            setPicking(null);
            if (e.type === 'dismissed' || !date) return;
            if (picking === 'from') setFrom(date);
            else setTo(date);
          }}
        />
      ) : null}

      {receipt && <ReceiptSheet transaction={receipt} onClose={() => setReceipt(null)} />}
    </>
  );
}

function DateBox({ label, value, onPress, t }) {
  return (
    <Tap
      onPress={onPress}
      style={{
        flex: 1, borderWidth: 1, borderColor: t.line2, borderRadius: R.md,
        paddingHorizontal: 13, paddingVertical: 10,
      }}
    >
      <Txt size={11.5} color={t.t4}>{label}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 3 }}>
        <Icon name="clock" size={15} color={t.acc} />
        <Txt size={14.5} weight="500">{dateShort(value)}</Txt>
      </View>
    </Tap>
  );
}
