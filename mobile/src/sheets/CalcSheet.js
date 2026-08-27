import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useCart } from '../CartContext';
import { Sheet, Txt, Tap, Btn } from '../ui';
import { buzz } from '../ui/Feedback';
import { money } from '../lib/format';
import { R } from '../theme';

/* Narxsiz tovar uchun summa kiritish.

   Bozorda hamma narsaning barcode'i yo'q: bir dona vint, bitta paket,
   ta'mirlash haqi. Shunday holatda sotuvchi shunchaki summani teradi.

   Klaviatura o'rniga o'z tugmalari — telefon klaviaturasi kichkina va
   raqam terganda xato bosiladi. Bu yerdagi tugma 56px. */

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'];

export default function CalcSheet({ onClose }) {
  const { t } = useTheme();
  const cart = useCart();
  const [val, setVal] = useState('');

  const press = (k) => {
    buzz('tap');
    if (k === 'del') setVal((v) => v.slice(0, -1));
    else setVal((v) => (v + k).replace(/^0+(?=\d)/, '').slice(0, 12));
  };

  const amount = parseInt(val, 10) || 0;

  const submit = () => {
    if (amount <= 0) return;
    cart.addCustom(amount);
    setVal('');
    onClose?.();
  };

  return (
    <Sheet
      visible
      onClose={onClose}
      title="Summa kiritish"
      sub="Narxsiz tovar — summani tering"
    >
      <View style={{
        borderWidth: 1, borderColor: t.line2, borderRadius: R.lg,
        paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12,
        alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 6,
      }}>
        <Txt size={32} weight="600" color={amount ? t.t1 : t.t4}>{money(amount)}</Txt>
        <Txt size={14} color={t.t4} style={{ paddingBottom: 4 }}>so‘m</Txt>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {KEYS.map((k) => (
          <Tap
            key={k}
            onPress={() => press(k)}
            activeStyle={{ backgroundColor: t.line }}
            style={{
              width: '31.5%', height: 56, borderRadius: R.md,
              backgroundColor: t.inset, borderWidth: 1, borderColor: t.line2,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Txt size={21} weight="500">{k === 'del' ? '⌫' : k}</Txt>
          </Tap>
        ))}
      </View>

      <Btn
        title="Savatga qo‘shish"
        size="lg"
        full
        disabled={amount <= 0}
        onPress={submit}
      />
    </Sheet>
  );
}
