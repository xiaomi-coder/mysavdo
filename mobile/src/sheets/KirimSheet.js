import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Tap, Btn } from '../ui';
import { useFeedback, buzz } from '../ui/Feedback';
import { db } from '../lib/api';
import { R } from '../theme';

/* Omborga tovar kiritish.

   Kirim move_stock orqali bajariladi — shunda harakat tarixiga
   "kirim" turi bilan yoziladi va sverkada qoldiq qayerdan
   ko'payganini ko'rsatish mumkin bo'ladi. To'g'ridan-to'g'ri
   qoldiqni o'zgartirsak, tarixda sababsiz sakrash paydo bo'ladi. */

export default function KirimSheet({ product, onClose }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const [qty, setQty] = useState('1');
  const [busy, setBusy] = useState(false);

  if (!product) return null;

  const n = parseInt(qty, 10) || 0;

  const submit = async () => {
    if (n <= 0) { notify('Sonini kiriting', 'error'); return; }
    setBusy(true);
    const { error } = await db.rpc('move_stock', {
      p_product: product.id,
      p_qty: n,
      p_type: 'kirim',
      p_note: null,
      p_actor: user?.name,
      p_txn: null,
    });
    setBusy(false);

    if (error) { notify(error.message, 'error'); return; }

    d.patchProduct(product.id, { stock: (product.stock || 0) + n });
    buzz('ok');
    notify(`Kirim qilindi · +${n} dona`, 'ok');
    onClose?.();
  };

  const step = (delta) => setQty(String(Math.max(1, n + delta)));

  return (
    <Sheet
      visible
      onClose={onClose}
      title="Kirim qilish"
      sub={`${product.name} · hozir ${product.stock} dona`}
    >
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 14, marginBottom: 18,
      }}>
        <BigBtn label="−" onPress={() => step(-1)} t={t} />
        <TextInput
          value={qty}
          onChangeText={(v) => setQty(v.replace(/\D/g, '').slice(0, 5))}
          keyboardType="number-pad"
          selectTextOnFocus
          style={{
            width: 110, height: 60, textAlign: 'center',
            fontSize: 32, fontWeight: '600', color: t.t1,
            borderRadius: R.lg, backgroundColor: t.inset,
            borderWidth: 1, borderColor: t.accdim,
          }}
        />
        <BigBtn label="+" onPress={() => step(1)} t={t} />
      </View>

      <Txt size={12} color={t.t3} style={{ textAlign: 'center', marginBottom: 14 }}>
        Kirimdan keyin qoldiq: {(product.stock || 0) + n} dona
      </Txt>

      <Btn title="Kirim qilish" size="lg" full loading={busy} onPress={submit} />
    </Sheet>
  );
}

function BigBtn({ label, onPress, t }) {
  return (
    <Tap
      onPress={onPress}
      activeStyle={{ backgroundColor: t.line }}
      style={{
        width: 54, height: 54, borderRadius: R.lg,
        backgroundColor: t.inset, borderWidth: 1, borderColor: t.line2,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Txt size={24} color={t.t2}>{label}</Txt>
    </Tap>
  );
}
