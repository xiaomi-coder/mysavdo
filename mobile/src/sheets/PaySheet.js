import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import { Sheet, Txt, Tap, Btn, Icon } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { db } from '../lib/api';
import { money } from '../lib/format';
import { R } from '../theme';

/* Nasiya to'lovini qabul qilish.

   Foiz tugmalari (25/50/75/100%) qo'yilgan, chunki mijoz ko'pincha
   "yarmini beray" deydi va kassir qo'lda hisoblab o'tirmasligi kerak.

   To'lov kassaga ham tushishi shart — shuning uchun bir vaqtda
   nasiya yozuvi yangilanadi va kirim tranzaksiyasi yoziladi. */

const PCTS = [25, 50, 75, 100];
const METHODS = [
  { id: 'cash', label: 'Naqd', icon: 'money' },
  { id: 'card', label: 'Karta', icon: 'card' },
];

export default function PaySheet({ debt, onClose }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const left = debt ? Number(debt.amount || 0) - Number(debt.paid_amount || 0) : 0;

  // Boshida to'liq summa turadi — ko'pincha qarz to'liq yopiladi
  const [amount, setAmount] = useState(left);
  const [method, setMethod] = useState('cash');
  const [busy, setBusy] = useState(false);

  if (!debt) return null;

  const submit = async () => {
    if (amount <= 0) { notify('Summani kiriting', 'error'); return; }
    setBusy(true);

    const paid = Number(debt.paid_amount || 0) + amount;
    const done = paid >= Number(debt.amount || 0);

    const { error } = await db.from('debts').update({
      paid_amount: paid,
      status: done ? "To'landi" : "To'lanmagan",
    }).eq('id', debt.id);

    if (error) { setBusy(false); notify(error.message, 'error'); return; }

    /* To'lov kassaga kirim bo'lib tushadi — kunlik hisobotda
       ko'rinishi uchun alohida yozuv qilinadi. */
    const { data: row } = await db.from('transactions').insert({
      store_id: debt.store_id,
      customer_id: debt.customer_id,
      receipt_no: `#N${debt.id}`,
      cashier: `${user?.name} · nasiya to‘lovi`,
      items: [],
      total: amount,
      discount: 0,
      payment_method: method,
      status: 'completed',
    }).select().single();

    setBusy(false);

    d.patchDebt(debt.id, { paid_amount: paid, status: done ? "To'landi" : "To'lanmagan" });
    if (row) d.addTransaction(row);

    notify(done ? 'Qarz to‘liq yopildi' : `${money(amount)} so‘m qabul qilindi`, 'ok');
    onClose?.();
  };

  return (
    <Sheet
      visible
      onClose={onClose}
      title="To‘lov qabul qilish"
      sub={`${debt.client} · qarz ${money(left)} so‘m`}
    >
      <View style={{
        borderWidth: 1, borderColor: t.line2, borderRadius: R.lg,
        paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12,
      }}>
        <Txt size={12} color={t.t3}>Summa</Txt>
        <Txt size={30} weight="600" style={{ marginTop: 2 }}>
          {money(amount)} <Txt size={15} color={t.t4}>so‘m</Txt>
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {PCTS.map((p) => {
          const v = Math.round((left * p) / 100);
          return (
            <Tap
              key={p}
              onPress={() => setAmount(v)}
              style={{
                flex: 1, height: 44, borderRadius: R.md,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: amount === v ? t.line : 'transparent',
                borderWidth: 1, borderColor: amount === v ? t.acc : t.line2,
              }}
            >
              <Txt size={14} weight="500" color={amount === v ? t.acctext : t.t3}>{p}%</Txt>
            </Tap>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {METHODS.map((m) => {
          const on = method === m.id;
          return (
            <Tap
              key={m.id}
              onPress={() => setMethod(m.id)}
              style={{
                flex: 1, height: 46, borderRadius: R.md,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
                backgroundColor: on ? t.line : 'transparent',
                borderWidth: 1, borderColor: on ? t.acc : t.line2,
              }}
            >
              <Icon name={m.icon} size={18} color={on ? t.acctext : t.t3} />
              <Txt size={14} weight="500" color={on ? t.acctext : t.t3}>{m.label}</Txt>
            </Tap>
          );
        })}
      </View>

      <Btn title="To‘lovni qabul qilish" size="xl" full loading={busy} onPress={submit} />
    </Sheet>
  );
}
