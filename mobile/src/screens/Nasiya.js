import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Btn, Chip, Header, EmptyState, Skeleton,
} from '../ui';
import { money, phoneFmt, dateShort } from '../lib/format';
import PaySheet from '../sheets/PaySheet';
import SmsSheet from '../sheets/SmsSheet';

/* Nasiya.

   Ro'yxat muddati bo'yicha tartiblangan: eng kechikkani tepada.
   Do'konchi kunini shu ro'yxatdan boshlaydi — kimga qo'ng'iroq
   qilish kerakligi darrov ko'rinsin. */

const FILTERS = [
  { key: 'open', label: 'To‘lanmagan' },
  { key: 'overdue', label: 'Muddati o‘tgan' },
  { key: 'paid', label: 'To‘langan' },
];

export default function Nasiya({ navigation }) {
  const { t } = useTheme();
  const d = useData();
  const [filter, setFilter] = useState('open');
  const [pay, setPay] = useState(null);
  const [sms, setSms] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const rows = useMemo(() => d.debts.map((x) => {
    const left = Number(x.amount || 0) - Number(x.paid_amount || 0);
    const due = x.due_date ? new Date(x.due_date) : null;
    const days = due ? Math.ceil((due.getTime() - Date.now()) / 86400000) : null;
    return { ...x, left, days, overdue: left > 0 && days != null && days < 0 };
  }), [d.debts]);

  const lists = useMemo(() => ({
    open: rows.filter((x) => x.left > 0).sort((a, b) => (a.days ?? 999) - (b.days ?? 999)),
    overdue: rows.filter((x) => x.overdue).sort((a, b) => (a.days ?? 0) - (b.days ?? 0)),
    paid: rows.filter((x) => x.left <= 0),
  }), [rows]);

  const list = lists[filter];
  const total = lists.open.reduce((s, x) => s + x.left, 0);

  const refresh = async () => {
    setRefreshing(true);
    await d.reload({ silent: true });
    setRefreshing(false);
  };

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <Header title="Nasiya" onBack={() => navigation.goBack()} />

      <Card pad={14} style={{ marginBottom: 12 }}>
        <Txt size={12} color={t.t3}>Jami qarz</Txt>
        <Txt size={28} weight="600" style={{ marginTop: 2 }}>
          {money(total)} <Txt size={14} color={t.t4}>so‘m</Txt>
        </Txt>
        {lists.overdue.length > 0 ? (
          <Txt size={13} color={t.err} style={{ marginTop: 6 }}>
            {lists.overdue.length} tasining muddati o‘tgan
          </Txt>
        ) : null}
      </Card>

      {/* Uchala filtr bitta ekranga sig'sin: har biri teng ulush oladi,
          shuning uchun "To'langan" chetga chiqib ketmaydi */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            count={lists[f.key].length}
            active={filter === f.key}
            color={f.key === 'overdue' ? t.err : undefined}
            onPress={() => setFilter(f.key)}
            style={{ flex: 1, paddingHorizontal: 8, justifyContent: 'center', gap: 4 }}
          />
        ))}
      </View>

      {d.loading ? (
        <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={140} />)}</View>
      ) : list.length === 0 ? (
        <EmptyState
          icon="check-circle"
          color={t.ok}
          title={filter === 'paid' ? 'Hali to‘langan nasiya yo‘q' : 'Qarzdor yo‘q'}
          text={filter !== 'paid' ? 'Barcha nasiyalar to‘langan' : undefined}
        />
      ) : (
        <View style={{ gap: 10 }}>
          {list.map((x) => {
            const color = x.left <= 0 ? t.ok : x.overdue ? t.err : t.warn;
            return (
              <Card key={x.id} border={x.overdue ? t.err : t.line} pad={13}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Txt size={15} weight="500" numberOfLines={1}>{x.client}</Txt>
                    <Txt size={12} color={t.t3} style={{ marginTop: 1 }}>{phoneFmt(x.phone)}</Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Txt size={17} weight="600">{money(x.left)}</Txt>
                    <Txt size={11} weight="500" color={color} style={{ marginTop: 1 }}>
                      {x.left <= 0 ? 'to‘langan'
                        : x.days == null ? 'muddatsiz'
                        : x.days < 0 ? `${-x.days} kun kechikdi`
                        : `${x.days} kun qoldi`}
                    </Txt>
                  </View>
                </View>

                {x.paid_amount > 0 && x.left > 0 ? (
                  <Txt size={11} color={t.t4} style={{ marginTop: 6 }}>
                    {money(x.paid_amount)} to‘langan · {dateShort(x.date)} dan
                  </Txt>
                ) : null}

                {x.left > 0 ? (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 11 }}>
                    <Btn title="To‘lov olish" size="lg" style={{ flex: 1 }} onPress={() => setPay(x)} />
                    <Btn
                      icon="chat-text"
                      variant="secondary"
                      size="lg"
                      style={{ width: 52, paddingHorizontal: 0 }}
                      onPress={() => setSms({
                        customer: d.customers.find((c) => c.id === x.customer_id)
                          || { name: x.client, phone: x.phone },
                        debt: x.left,
                      })}
                    />
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}

      {pay && <PaySheet debt={pay} onClose={() => setPay(null)} />}
      {sms && <SmsSheet data={sms} onClose={() => setSms(null)} />}
    </Screen>
  );
}
