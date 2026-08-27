import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Tap, PhotoBox, SearchBar, EmptyState } from '../ui';
import { money } from '../lib/format';

/* Tez sotuv tugmasiga qaysi tovar qo'yilishini tanlash.

   Sotuvchi tugmani uzoq bosganda ochiladi — alohida sozlamalar
   bo'limiga borish shart emas. */

export default function QuickPickSheet({ slot, current, onClose, onPick }) {
  const { t } = useTheme();
  const d = useData();
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const src = d.products;
    if (!s) return src.slice(0, 40);
    return src.filter((p) =>
      (p.name || '').toLowerCase().includes(s) || (p.barcode || '').includes(s)
    ).slice(0, 40);
  }, [d.products, q]);

  return (
    <Sheet
      visible
      onClose={onClose}
      title="Tez tugmani almashtirish"
      sub={`${slot + 1}-o‘rin uchun tovar tanlang`}
    >
      <SearchBar value={q} onChangeText={setQ} placeholder="Tovar qidirish" style={{ marginBottom: 6 }} />

      {list.length === 0 ? (
        <EmptyState icon="search" text="Tovar topilmadi" />
      ) : list.map((p) => (
        <Tap
          key={p.id}
          onPress={() => onPick(p)}
          activeStyle={{ opacity: 0.65 }}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 11,
            paddingVertical: 10, minHeight: 48,
            borderBottomWidth: 1, borderBottomColor: t.line,
          }}
        >
          <PhotoBox uri={p.photo_url} emoji={p.image} size={38} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={14} weight="500" numberOfLines={1}>{p.name}</Txt>
            <Txt size={12} color={t.t3}>{money(p.price)} so‘m</Txt>
          </View>
          {current?.id === p.id ? (
            <View style={{
              borderWidth: 1, borderColor: t.accdim, borderRadius: 8,
              paddingHorizontal: 8, paddingVertical: 3,
            }}>
              <Txt size={11} color={t.acc}>hozirgi</Txt>
            </View>
          ) : null}
        </Tap>
      ))}
    </Sheet>
  );
}
