import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Btn, Input } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { money, dateLong, todayStart } from '../lib/format';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Kunni yopish

   Kechqurun do'kon yopilganda kassadagi pul hisobdagi bilan mos
   kelishi kerak. Bu ekran ikkalasini yonma-yon qo'yadi.

   Faqat NAQD pul sanaladi — karta va o'tkazma bankka ketadi, ular
   kassada yo'q. Bu joyda ko'p adashiladi, shuning uchun alohida
   ajratib ko'rsatilgan.
   ══════════════════════════════════════════════════════════════════════ */

export default function DaySheet({ onClose }) {
  const { t } = useTheme();
  const d = useData();
  const { notify } = useFeedback();
  const [counted, setCounted] = useState('');

  const day = useMemo(() => {
    const from = todayStart().getTime();
    const tx = d.transactions.filter((x) =>
      (x.status === 'completed' || x.status === 'returned')
      && new Date(x.date).getTime() >= from);

    const by = (m) => tx.filter((x) => x.payment_method === m)
      .reduce((s, x) => s + Number(x.total || 0), 0);

    return {
      cash: by('cash'),
      card: by('card'),
      transfer: by('transfer'),
      nasiya: by('nasiya'),
      count: tx.length,
      total: tx.reduce((s, x) => s + Number(x.total || 0), 0),
    };
  }, [d.transactions]);

  const countedNum = parseInt(counted, 10) || 0;
  const diff = counted === '' ? null : countedNum - day.cash;

  const close = () => {
    if (diff === null) { notify('Sanagan summangizni kiriting', 'error'); return; }
    if (diff === 0) notify('Kassa to‘g‘ri keldi', 'ok');
    else notify(
      diff > 0 ? `Kassada ${money(diff)} so‘m ortiqcha` : `Kassada ${money(-diff)} so‘m yetishmayapti`,
      'error'
    );
    setCounted('');
    onClose?.();
  };

  return (
    <Sheet
      visible
      onClose={onClose}
      title="Kunni yopish"
      sub={`${dateLong()} · ${day.count} tranzaksiya`}
    >
      <View style={{
        borderWidth: 1, borderColor: t.line, borderRadius: R.lg,
        paddingHorizontal: 14, marginBottom: 12,
      }}>
        <Line label="Naqd" value={day.cash} t={t} />
        <Line label="Plastik karta" value={day.card} t={t} />
        <Line label="O‘tkazma" value={day.transfer} t={t} />
        <Line label="Nasiya" value={day.nasiya} t={t} last />
      </View>

      <View style={{
        borderWidth: 1, borderColor: t.accdim, borderRadius: R.lg,
        padding: 14, marginBottom: 12,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <Txt size={14} color={t.acctext}>Kassada bo‘lishi kerak</Txt>
        <Txt size={20} weight="600">
          {money(day.cash)} <Txt size={12} color={t.t4}>so‘m</Txt>
        </Txt>
      </View>

      <Input
        label="Sanagan summangiz"
        value={counted}
        onChangeText={(v) => setCounted(v.replace(/\D/g, '').slice(0, 12))}
        keyboardType="number-pad"
        placeholder="0"
        big
        style={{ marginBottom: 10 }}
      />

      {diff !== null ? (
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
          paddingHorizontal: 2, paddingBottom: 12,
        }}>
          <Txt size={13} color={t.t3}>Farq</Txt>
          <Txt size={18} weight="600" color={diff === 0 ? t.ok : t.err}>
            {diff > 0 ? '+' : ''}{money(diff)}
          </Txt>
        </View>
      ) : null}

      <Btn title="Kunni yopish" size="lg" full onPress={close} />
    </Sheet>
  );
}

function Line({ label, value, t, last }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between',
      paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: t.line,
    }}>
      <Txt size={14} color={t.t3}>{label}</Txt>
      <Txt size={15} weight="600">{money(value)}</Txt>
    </View>
  );
}
