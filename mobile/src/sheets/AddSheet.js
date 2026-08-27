import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Btn, Input, Icon } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { db } from '../lib/api';
import { money } from '../lib/format';

/* Yangi tovar qo'shish.

   Skaner tugmasi tepada: barcode'i bor tovarni qo'lda kiritish uzoq
   va xato bo'ladi — 13 xonali raqamni terish oson emas. Skanerdan
   kelgan kod shu yerda tayyor turadi.

   Faqat to'rt maydon so'raladi. Qolgani (kategoriya, surat, tavsif)
   keyinroq tahrirlashda qo'shiladi — tovar qabul qilayotganda
   do'konchining vaqti yo'q. */

export default function AddSheet({ onClose, navigation, prefillBarcode }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const [f, setF] = useState(() => ({
    name: '', price: '', cost: '', stock: '1', barcode: prefillBarcode || '',
  }));
  const [busy, setBusy] = useState(false);

  const price = parseInt(f.price, 10) || 0;
  const cost = parseInt(f.cost, 10) || 0;
  const profit = price - cost;

  const save = async () => {
    if (!f.name.trim()) { notify('Tovar nomini kiriting', 'error'); return; }
    if (price <= 0) { notify('Narxini kiriting', 'error'); return; }

    setBusy(true);
    const { data: row, error } = await db.from('products').insert({
      store_id: user.store_id,
      name: f.name.trim(),
      price,
      cost_price: cost,
      stock: parseInt(f.stock, 10) || 0,
      minStock: 5,
      barcode: f.barcode.trim() || null,
      is_online: true,
    }).select().single();
    setBusy(false);

    if (error) { notify(error.message, 'error'); return; }

    d.addProduct(row);
    notify(`${row.name} qo‘shildi`, 'ok');
    onClose?.();
  };

  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const num = (k) => (v) => setF((s) => ({ ...s, [k]: v.replace(/\D/g, '').slice(0, 12) }));

  return (
    <Sheet visible onClose={onClose} title="Yangi tovar qo‘shish">
      <Btn
        title="Skaner bilan qo‘shish"
        icon="barcode"
        size="xl"
        full
        style={{ marginBottom: 12 }}
        onPress={() => { onClose?.(); navigation?.navigate('Scanner', { mode: 'add' }); }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: t.line }} />
        <Txt size={12} color={t.t4}>yoki qo‘lda</Txt>
        <View style={{ flex: 1, height: 1, backgroundColor: t.line }} />
      </View>

      <View style={{ gap: 10 }}>
        <Input placeholder="Tovar nomi" value={f.name} onChangeText={set('name')} autoFocus={!prefillBarcode} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Input
            placeholder="Narxi, so‘m"
            value={f.price}
            onChangeText={num('price')}
            keyboardType="number-pad"
            style={{ flex: 1 }}
          />
          <Input
            placeholder="Soni"
            value={f.stock}
            onChangeText={num('stock')}
            keyboardType="number-pad"
            style={{ width: 96 }}
          />
        </View>

        <Input
          placeholder="Tannarx (ixtiyoriy)"
          value={f.cost}
          onChangeText={num('cost')}
          keyboardType="number-pad"
          hint={cost > 0 && price > 0 ? `Foyda: ${money(profit)} so‘m` : undefined}
          hintColor={profit >= 0 ? t.ok : t.err}
        />

        {f.barcode ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="barcode" size={16} color={t.acc} />
            <Txt size={12} color={t.t3} mono>{f.barcode}</Txt>
          </View>
        ) : null}

        <Btn title="Qo‘shish" size="lg" full loading={busy} onPress={save} />
      </View>
    </Sheet>
  );
}
