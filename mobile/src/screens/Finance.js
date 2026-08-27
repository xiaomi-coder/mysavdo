import React, { useState, useMemo, useEffect } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Btn, Chip, Icon, Header, Sheet, Input,
  EmptyState, Skeleton, SectionLabel,
} from '../ui';
import { useFeedback } from '../ui/Feedback';
import { db } from '../lib/api';
import { money, dateShort, todayStart } from '../lib/format';
import { R } from '../theme';

/* Moliya.

   Sotuvchi bu ekranni ko'rmasligi kerak — foyda, tannarx va xarajat
   do'kon egasining ishi. Ruxsat yo'q bo'lsa tushuntirish bilan
   qulflangan ekran chiqadi, tugma butunlay yo'qolib ketmaydi.

   Sof foyda = sotuv − tannarx − xarajat. Qaytarishlar minus summa
   bo'lgani uchun o'zi ayiriladi. */

const RANGES = [
  { key: 'today', label: 'Bugun', days: 0 },
  { key: 'week', label: 'Hafta', days: 7 },
  { key: 'month', label: 'Oy', days: 30 },
];

const CATEGORIES = ['Ijara', 'Ish haqi', 'Kommunal', 'Tovar', 'Transport', 'Boshqa'];

export default function Finance({ navigation }) {
  const { t } = useTheme();
  const { can, user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const [range, setRange] = useState('today');
  const [expenses, setExpenses] = useState(null);
  const [adding, setAdding] = useState(false);

  const allowed = can('finance');

  useEffect(() => {
    if (!allowed || !d.storeId) return;
    db.from('expenses').select('*').eq('store_id', d.storeId)
      .order('date', { ascending: false }).limit(100)
      .then(({ data }) => setExpenses(data || []));
  }, [allowed, d.storeId]);

  const from = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)?.days ?? 0;
    const base = todayStart().getTime();
    return days === 0 ? base : base - (days - 1) * 86400000;
  }, [range]);

  const stats = useMemo(() => {
    const tx = d.transactions.filter((x) =>
      (x.status === 'completed' || x.status === 'returned')
      && new Date(x.date).getTime() >= from);

    const revenue = tx.reduce((s, x) => s + Number(x.total || 0), 0);
    const cost = tx.reduce((s, x) => {
      const items = Array.isArray(x.items) ? x.items : [];
      const c = items.reduce((a, it) => a + Number(it.cost_price || 0) * (it.qty || 1), 0);
      return s + (x.total < 0 ? -c : c);
    }, 0);

    const spent = (expenses || [])
      .filter((e) => new Date(e.date).getTime() >= from)
      .reduce((s, e) => s + Number(e.amount || 0), 0);

    return { revenue, cost, spent, gross: revenue - cost, net: revenue - cost - spent };
  }, [d.transactions, expenses, from]);

  if (!allowed) {
    return (
      <Screen scroll={false}>
        <Header title="Moliya" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 }}>
          <View style={{
            width: 76, height: 76, borderRadius: 38,
            backgroundColor: t.card, borderWidth: 1, borderColor: t.line2,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="lock" size={34} color={t.warn} />
          </View>
          <Txt size={18} weight="500">Ruxsat yo‘q</Txt>
          <Txt size={14} color={t.t3} style={{ textAlign: 'center', lineHeight: 21, maxWidth: 260 }}>
            Moliya bo‘limiga faqat do‘kon egasi kira oladi.
            Kirish uchun egadan ruxsat so‘rang.
          </Txt>
          <Btn title="Orqaga qaytish" variant="secondary" size="lg" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        title="Moliya"
        onBack={() => navigation.goBack()}
        right={<Btn title="Xarajat" icon="plus" size="sm" onPress={() => setAdding(true)} />}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {RANGES.map((r) => (
          <Chip key={r.key} label={r.label} active={range === r.key} onPress={() => setRange(r.key)} />
        ))}
      </View>

      <Card pad={16} style={{ marginBottom: 12 }}>
        <Txt size={12} color={t.t3}>Sof foyda</Txt>
        <Txt size={32} weight="600" color={stats.net >= 0 ? t.t1 : t.err} style={{ marginTop: 2 }}>
          {money(stats.net)} <Txt size={15} color={t.t4}>so‘m</Txt>
        </Txt>
        <Txt size={12} color={t.t4} style={{ marginTop: 6, lineHeight: 17 }}>
          Sotuv − tannarx − xarajat
        </Txt>
      </Card>

      <View style={{ gap: 10, marginBottom: 16 }}>
        <Line label="Sotuv tushumi" value={stats.revenue} color={t.t1} t={t} />
        <Line label="Tovar tannarxi" value={-stats.cost} color={t.t3} t={t} />
        <Line label="Yalpi foyda" value={stats.gross} color={t.ok} t={t} bold />
        <Line label="Xarajatlar" value={-stats.spent} color={t.err} t={t} />
      </View>

      <SectionLabel>XARAJATLAR</SectionLabel>
      {expenses === null ? (
        <View style={{ gap: 10 }}>{[0, 1].map((i) => <Skeleton key={i} height={56} />)}</View>
      ) : expenses.filter((e) => new Date(e.date).getTime() >= from).length === 0 ? (
        <EmptyState icon="coin" text="Bu davrda xarajat yozilmagan" style={{ paddingVertical: 30 }} />
      ) : (
        <Card pad={0} style={{ overflow: 'hidden' }}>
          {expenses.filter((e) => new Date(e.date).getTime() >= from).map((e, i) => (
            <View key={e.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 14, paddingVertical: 12,
              borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
            }}>
              <Txt size={12} color={t.t4} mono style={{ width: 44 }}>{dateShort(e.date)}</Txt>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt size={14}>{e.category || 'Xarajat'}</Txt>
                {e.note ? <Txt size={11} color={t.t4} numberOfLines={1}>{e.note}</Txt> : null}
              </View>
              <Txt size={14} weight="500" color={t.err}>−{money(e.amount)}</Txt>
            </View>
          ))}
        </Card>
      )}

      {adding && <ExpenseSheet
        onClose={() => setAdding(false)}
        storeId={d.storeId}
        cashier={user?.name}
        notify={notify}
        onSaved={(row) => setExpenses((l) => [row, ...(l || [])])}
      />}
    </Screen>
  );
}

function Line({ label, value, color, t, bold }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 11, paddingHorizontal: 14,
      borderWidth: 1, borderColor: t.line, borderRadius: R.md,
      backgroundColor: bold ? t.card : 'transparent',
    }}>
      <Txt size={14} color={t.t3}>{label}</Txt>
      <Txt size={16} weight={bold ? '600' : '500'} color={color}>{money(value)}</Txt>
    </View>
  );
}

function ExpenseSheet({ onClose, storeId, cashier, notify, onSaved }) {
  const { t } = useTheme();
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const v = parseInt(amount, 10) || 0;
    if (v <= 0) { notify('Summani kiriting', 'error'); return; }
    setBusy(true);
    const { data, error } = await db.from('expenses').insert({
      store_id: storeId, category: cat, amount: v,
      note: note.trim() || null, cashier,
    }).select().single();
    setBusy(false);
    if (error) { notify(error.message, 'error'); return; }
    onSaved(data);
    setAmount(''); setNote('');
    notify('Xarajat yozildi', 'ok');
    onClose();
  };

  return (
    <Sheet visible onClose={onClose} title="Xarajat qo‘shish">
      <Txt size={12} color={t.t3} style={{ marginBottom: 8 }}>Turi</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />
        ))}
      </View>

      <Input
        label="Summa, so‘m"
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/\D/g, '').slice(0, 12))}
        keyboardType="number-pad"
        big
        style={{ marginBottom: 10 }}
      />
      <Input label="Izoh (ixtiyoriy)" value={note} onChangeText={setNote} />

      <Btn title="Saqlash" size="lg" full loading={busy} onPress={save} style={{ marginTop: 14 }} />
    </Sheet>
  );
}
