import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import { Sheet, Txt, Btn, Input, Tap, PhotoBox, Icon, Toggle } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { db } from '../lib/api';
import { uploadPhoto } from '../lib/upload';
import { money } from '../lib/format';
import { R } from '../theme';

/* Tovarni tahrirlash.

   Tannarx kiritilganda foyda va marja darrov ko'rinadi — do'konchi
   narxni qo'yayotib "bu menga necha foiz beradi" deb hisoblab
   o'tirmasin.

   Onlayn do'kon o'chirgichi shu yerda: do'kon egasi qaysi tovar
   mijozlarga ko'rinishini shu joyda hal qiladi. */

export default function EditSheet({ product, onClose }) {
  const { t } = useTheme();
  const d = useData();
  const { can } = useAuth();
  const { notify } = useFeedback();

  // Maydonlar oyna ochilganda bir marta to'ldiriladi
  const [f, setF] = useState(() => ({
    name: product?.name || '',
    price: String(product?.price ?? ''),
    cost_price: String(product?.cost_price ?? ''),
    stock: String(product?.stock ?? ''),
    barcode: product?.barcode || '',
    category: product?.category || '',
    description: product?.description || '',
    photo_url: product?.photo_url || '',
    is_online: product?.is_online !== false,
  }));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!product) return null;

  const price = parseInt(f.price, 10) || 0;
  const cost = parseInt(f.cost_price, 10) || 0;
  const profit = price - cost;
  const marja = price > 0 ? Math.round((profit / price) * 100) : 0;

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { notify('Galereyaga ruxsat berilmadi', 'error'); return; }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (res.canceled) return;

    setUploading(true);
    const url = await uploadPhoto(res.assets[0].uri, res.assets[0].width);
    setUploading(false);

    if (!url) { notify('Surat yuklanmadi', 'error'); return; }
    setF((s) => ({ ...s, photo_url: url }));
  };

  const save = async () => {
    if (!f.name.trim()) { notify('Tovar nomini kiriting', 'error'); return; }
    setBusy(true);

    const patch = {
      name: f.name.trim(),
      price,
      cost_price: cost,
      stock: parseInt(f.stock, 10) || 0,
      barcode: f.barcode.trim() || null,
      category: f.category.trim() || null,
      description: f.description.trim() || null,
      photo_url: f.photo_url || null,
      is_online: f.is_online,
    };

    const { error } = await db.from('products').update(patch).eq('id', product.id);
    setBusy(false);

    if (error) { notify(error.message, 'error'); return; }

    /* Qoldiq qo'lda o'zgartirilgan bo'lsa, bazadagi tetik uni
       "tuzatish" turi bilan tarixga yozadi — sverkada ko'rinadi. */
    d.patchProduct(product.id, patch);
    notify('Saqlandi', 'ok');
    onClose?.();
  };

  const del = () => {
    Alert.alert(
      'Tovarni o‘chirish',
      `${product.name} butunlay o‘chiriladi. Sotuvlar tarixi saqlanib qoladi.`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O‘chirish',
          style: 'destructive',
          onPress: async () => {
            const { error } = await db.from('products').delete().eq('id', product.id);
            if (error) { notify(error.message, 'error'); return; }
            d.dropProduct(product.id);
            notify('Tovar o‘chirildi');
            onClose?.();
          },
        },
      ]
    );
  };

  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const num = (k) => (v) => setF((s) => ({ ...s, [k]: v.replace(/\D/g, '').slice(0, 12) }));

  return (
    <Sheet visible onClose={onClose} title="Tovarni tahrirlash">
      <View style={{ gap: 10 }}>
        {/* Surat */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <PhotoBox uri={f.photo_url} emoji={product.image} size={72} radius={R.md} />
          <View style={{ flex: 1, gap: 8 }}>
            <Btn
              title={f.photo_url ? 'Suratni almashtirish' : 'Surat qo‘shish'}
              icon="camera"
              variant="secondary"
              size="sm"
              loading={uploading}
              onPress={pickPhoto}
            />
            {f.photo_url ? (
              <Tap onPress={() => setF((s) => ({ ...s, photo_url: '' }))}>
                <Txt size={12} color={t.err}>Suratni olib tashlash</Txt>
              </Tap>
            ) : (
              <Txt size={11} color={t.t4} style={{ lineHeight: 15 }}>
                Surat onlayn do‘konda ko‘rinadi
              </Txt>
            )}
          </View>
        </View>

        <Input label="Nomi" value={f.name} onChangeText={set('name')} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Input
            label="Narxi, so‘m"
            value={f.price}
            onChangeText={num('price')}
            keyboardType="number-pad"
            style={{ flex: 1 }}
            inputStyle={{ fontWeight: '600' }}
          />
          <Input
            label="Qoldiq"
            value={f.stock}
            onChangeText={num('stock')}
            keyboardType="number-pad"
            style={{ width: 110 }}
            inputStyle={{ fontWeight: '600' }}
          />
        </View>

        <Input
          label="Tannarx (kirim narxi), so‘m"
          value={f.cost_price}
          onChangeText={num('cost_price')}
          keyboardType="number-pad"
          inputStyle={{ fontWeight: '600' }}
          hint={cost > 0 ? `Foyda: ${money(profit)} so‘m · marja ${marja}%` : undefined}
          hintColor={profit >= 0 ? t.ok : t.err}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Input label="Barcode" value={f.barcode} onChangeText={set('barcode')} style={{ flex: 1 }} />
          <Input label="Kategoriya" value={f.category} onChangeText={set('category')} style={{ flex: 1 }} />
        </View>

        {can('storefront') ? (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            borderWidth: 1, borderColor: t.line, borderRadius: R.md,
            padding: 12, marginTop: 2,
          }}>
            <Icon name="globe" size={20} color={t.acc} />
            <View style={{ flex: 1 }}>
              <Txt size={14}>Onlayn do‘konda</Txt>
              <Txt size={11} color={t.t4} style={{ marginTop: 2 }}>
                Mijozlar havola orqali ko‘radi
              </Txt>
            </View>
            <Toggle on={f.is_online} onPress={() => setF((s) => ({ ...s, is_online: !s.is_online }))} />
          </View>
        ) : null}

        <Btn title="Saqlash" size="lg" full loading={busy} onPress={save} style={{ marginTop: 4 }} />
        <Btn title="Tovarni o‘chirish" variant="danger" full onPress={del} />
      </View>
    </Sheet>
  );
}
