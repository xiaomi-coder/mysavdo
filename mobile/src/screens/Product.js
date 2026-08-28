import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Btn, Icon, Input, Header, Toggle, PhotoBox,
} from '../ui';
import { useFeedback, buzz } from '../ui/Feedback';
import { useTr } from '../i18n';
import { db } from '../lib/api';
import { uploadPhoto } from '../lib/upload';
import { money } from '../lib/format';
import { PHONE_BRANDS, MEMORIES, CONDITIONS, EMOJIS, isPhoneItem, phoneName, routeScannedCode }
  from '@shared/catalog';
import { R, alpha } from '../theme';
import KirimSheet from '../sheets/KirimSheet';
import StikerSheet from '../sheets/StikerSheet';
import HistorySheet from '../sheets/HistorySheet';

/* ══════════════════════════════════════════════════════════════════════════
   Tovar — to'liq ekran

   Veb ilovadagi tovar oynasi bilan bir xil tuzilgan (Inventory.js →
   ProductModal). Shuning uchun do'konchi kompyuterda o'rgangan tartibni
   telefonda ham topadi.

   Ikki rejim bor va ikkalasi ham to'liq:
     TELEFON  — brend, model, xotira, IMEI, S/N, rang, holat
     ODDIY    — nomi, belgi, barcode, kategoriya, qoldiq, minimal qoldiq

   Telefon do'konida ham chexol sotiladi, shuning uchun rejim qo'lda
   almashtiriladi. Tahrirlashda esa rejim tovarning o'zidan aniqlanadi.

   Skaner mobilning ustunligi: IMEI'ni 15 xonali qilib qo'lda terish
   o'rniga quti ustidagi kod o'qiladi.
   ══════════════════════════════════════════════════════════════════════ */

export default function Product({ navigation, route }) {
  const { t } = useTheme();
  const { store } = useAuth();
  const d = useData();
  const { notify } = useFeedback();
  const tr = useTr();

  const editingId = route?.params?.id ?? null;
  const product = editingId ? d.products.find((p) => p.id === editingId) : null;
  const editing = Boolean(product);

  const [mode, setMode] = useState(() => (
    editing ? (isPhoneItem(product) ? 'phone' : 'simple')
      : (store?.store_type === 'phone' ? 'phone' : 'simple')
  ));

  const [f, setF] = useState(() => ({
    // umumiy
    name: product?.name || '',
    emoji: product?.image && [...(product.image || '')].length <= 2 ? product.image : '📦',
    barcode: product?.barcode || '',
    category: product?.category || '',
    stock: String(product?.stock ?? (editing ? 0 : '')),
    minStock: product?.minStock ? String(product.minStock) : '',
    cost: String(product?.cost_price ?? ''),
    price: String(product?.price ?? ''),
    description: product?.description || '',
    photo: product?.photo_url || '',
    online: product ? product.is_online !== false : true,
    // telefon
    brand: product?.category || '',
    model: product?.phone_model || '',
    memory: product?.phone_memory || '',
    imei1: product?.phone_imei1 || '',
    imei2: product?.phone_imei2 || '',
    serial: product?.phone_serial || '',
    color: product?.phone_color || '',
    condition: product?.phone_condition || 'Yangi',
  }));

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sheet, setSheet] = useState(null);

  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const num = (k) => (v) => setF((s) => ({ ...s, [k]: v.replace(/\D/g, '').slice(0, 12) }));

  /* Skanerdan qaytgan kodni kerakli maydonga joylaymiz */
  useEffect(() => {
    const code = route?.params?.scanned;
    if (!code) return;
    navigation.setParams({ scanned: undefined });

    if (mode === 'phone') {
      const { field, value } = routeScannedCode(code, { imei1: f.imei1, imei2: f.imei2 });
      setF((s) => ({ ...s, [field]: value }));
      notify(field === 'serial' ? 'S/N yozildi' : `IMEI ${field === 'imei1' ? 1 : 2} yozildi`, 'ok');
    } else {
      setF((s) => ({ ...s, barcode: String(code) }));
      notify('Barcode yozildi', 'ok');
    }
  }, [route?.params?.scanned]);

  const isPhone = mode === 'phone';

  const price = parseInt(f.price, 10) || 0;
  const cost = parseInt(f.cost, 10) || 0;
  const profit = price - cost;
  const marja = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

  const title = isPhone ? phoneName(f.model, f.memory) : f.name.trim();
  const valid = isPhone ? Boolean(f.model.trim() && price > 0) : Boolean(f.name.trim() && price > 0);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { notify('Galereyaga ruxsat berilmadi', 'error'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1],
    });
    if (res.canceled) return;
    setUploading(true);
    const url = await uploadPhoto(res.assets[0].uri, res.assets[0].width);
    setUploading(false);
    if (!url) { notify('Surat yuklanmadi', 'error'); return; }
    setF((s) => ({ ...s, photo: url }));
  };

  const save = async () => {
    if (!valid) {
      notify(isPhone ? 'Model va narxni kiriting' : 'Nomi va narxni kiriting', 'error');
      return;
    }
    setBusy(true);

    const payload = {
      store_id: d.storeId,
      name: title,
      price,
      cost_price: cost,
      minStock: parseInt(f.minStock, 10) || 0,
      description: f.description.trim() || null,
      photo_url: f.photo || null,
      is_online: f.online,
      ...(isPhone ? {
        category: f.brand || 'Boshqa',
        image: '📱',
        barcode: null,
        phone_model: f.model.trim(),
        phone_memory: f.memory || null,
        phone_imei1: f.imei1.trim() || null,
        phone_imei2: f.imei2.trim() || null,
        phone_serial: f.serial.trim() || null,
        phone_color: f.color.trim() || null,
        phone_condition: f.condition,
      } : {
        category: f.category.trim() || 'Boshqa',
        image: f.emoji,
        barcode: f.barcode.trim() || null,
        phone_model: null, phone_memory: null, phone_imei1: null,
        phone_imei2: null, phone_serial: null, phone_color: null,
        phone_condition: null,
      }),
      /* Qoldiq faqat yangi tovarda shu yerdan qo'yiladi. Tahrirlashda
         unga tegilmaydi — o'zgartirish kerak bo'lsa "Kirim" orqali
         qilinadi va sverkada sababi bilan yoziladi. */
      ...(editing ? {} : { stock: isPhone ? 1 : (parseInt(f.stock, 10) || 0) }),
    };

    const q = editing
      ? db.from('products').update(payload).eq('id', product.id).select().single()
      : db.from('products').insert(payload).select().single();

    const { data, error } = await q;
    setBusy(false);

    if (error) { notify(error.message, 'error'); return; }

    if (editing) d.patchProduct(product.id, data);
    else d.addProduct(data);

    buzz('ok');
    notify(editing ? 'Saqlandi' : `${data.name} qo‘shildi`, 'ok');
    navigation.goBack();
  };

  const remove = () => {
    Alert.alert(
      tr('Tovarni o‘chirish'),
      tr(`${product.name} butunlay o‘chiriladi. Sotuvlar tarixi saqlanib qoladi.`),
      [
        { text: tr('Bekor qilish'), style: 'cancel' },
        {
          text: tr('O‘chirish'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await db.from('products').delete().eq('id', product.id);
            if (error) { notify(error.message, 'error'); return; }
            d.dropProduct(product.id);
            notify('Tovar o‘chirildi');
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (editingId && !product) {
    return (
      <Screen>
        <Header title="Tovar" onBack={() => navigation.goBack()} />
        <Txt size={14} color={t.t3}>Tovar topilmadi</Txt>
      </Screen>
    );
  }

  let step = 0;
  const nextStep = () => ++step;

  return (
    <>
      <Screen bottomPad={40}>
        <Header
          title={editing ? (product.name || 'Tovar') : 'Yangi tovar'}
          sub={editing ? (isPhone ? 'Telefon' : 'Oddiy tovar') : undefined}
          onBack={() => navigation.goBack()}
        />

        {/* Rejim tanlash — faqat yangi tovarda */}
        {!editing ? (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[
              { id: 'phone', label: '📱 Telefon' },
              { id: 'simple', label: '📦 Oddiy · Aksessuar' },
            ].map((x) => {
              const on = mode === x.id;
              return (
                <Tap
                  key={x.id}
                  onPress={() => setMode(x.id)}
                  style={{
                    flex: 1, height: 46, borderRadius: R.md,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: on ? t.acc : t.line2,
                    backgroundColor: on ? t.line : 'transparent',
                  }}
                >
                  <Txt size={13.5} weight="500" color={on ? t.acctext : t.t3}>{x.label}</Txt>
                </Tap>
              );
            })}
          </View>
        ) : null}

        {isPhone ? (
          <>
            {/* ① Brend va model */}
            <Step n={nextStep()} title="Brend va model" t={t}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                {PHONE_BRANDS.map((b) => {
                  const on = f.brand === b;
                  return (
                    <Tap
                      key={b}
                      onPress={() => set('brand')(b)}
                      style={{
                        height: 36, paddingHorizontal: 12, borderRadius: R.pill,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: on ? t.acc : t.line2,
                        backgroundColor: on ? t.line : 'transparent',
                      }}
                    >
                      <Txt size={12.5} weight="500" color={on ? t.acctext : t.t3}>{b}</Txt>
                    </Tap>
                  );
                })}
              </View>

              <Input label="Model" value={f.model} onChangeText={set('model')}
                placeholder="Galaxy S24 Ultra" />

              <Txt size={12} color={t.t3} style={{ marginTop: 10, marginBottom: 6 }}>Xotira</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
                {MEMORIES.map((m) => {
                  const on = f.memory === m;
                  return (
                    <Tap
                      key={m}
                      onPress={() => set('memory')(on ? '' : m)}
                      style={{
                        height: 38, paddingHorizontal: 14, borderRadius: R.pill,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: on ? t.acc : t.line2,
                        backgroundColor: on ? t.line : 'transparent',
                      }}
                    >
                      <Txt size={13} weight="500" color={on ? t.acctext : t.t3}>{m}</Txt>
                    </Tap>
                  );
                })}
              </View>

              {title ? (
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  marginTop: 12, padding: 11, borderRadius: R.md,
                  backgroundColor: alpha(t.accRgb, 0.1),
                }}>
                  <Icon name="check" size={15} color={t.acc} />
                  <Txt size={13} color={t.acctext}>Nomi: {title}</Txt>
                </View>
              ) : null}
            </Step>

            {/* ② Texnik ma'lumot */}
            <Step n={nextStep()} title="Texnik ma’lumot" t={t}>
              <Btn
                title="Raqamni skanerlash"
                icon="barcode"
                size="lg"
                full
                onPress={() => navigation.navigate('Scanner', { mode: 'code', returnTo: 'Tovar' })}
              />
              <Txt size={11.5} color={t.t4} style={{ marginTop: 7, lineHeight: 16 }}>
                15 xonali raqam IMEI ga, boshqasi seriya raqamiga tushadi.
                Qutidagi kodni skanerlang — qo‘lda terish shart emas.
              </Txt>

              <View style={{ gap: 10, marginTop: 12 }}>
                <Input label="IMEI 1" value={f.imei1} onChangeText={num('imei1')}
                  keyboardType="number-pad" placeholder="15 xonali" />
                <Input label="IMEI 2" value={f.imei2} onChangeText={num('imei2')}
                  keyboardType="number-pad" placeholder="ixtiyoriy" />
                <Input label="S/N" value={f.serial} onChangeText={set('serial')}
                  placeholder="Seriya raqami" autoCapitalize="characters" />
                <Input label="Rang" value={f.color} onChangeText={set('color')}
                  placeholder="Black" />
              </View>
            </Step>

            {/* ③ Holati */}
            <Step n={nextStep()} title="Holati" t={t}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CONDITIONS.map((c) => {
                  const on = f.condition === c.value;
                  return (
                    <Tap
                      key={c.value}
                      onPress={() => set('condition')(c.value)}
                      style={{
                        flex: 1, height: 46, borderRadius: R.md,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: on ? t.acc : t.line2,
                        backgroundColor: on ? t.line : 'transparent',
                      }}
                    >
                      <Txt size={13} weight="500" color={on ? t.acctext : t.t3}>{c.label}</Txt>
                    </Tap>
                  );
                })}
              </View>
            </Step>
          </>
        ) : (
          /* ① Tovar ma'lumoti */
          <Step n={nextStep()} title="Tovar ma’lumoti" t={t}>
            <Input label="Nomi" value={f.name} onChangeText={set('name')}
              placeholder="USB-C kabel 1m" />

            <Txt size={12} color={t.t3} style={{ marginTop: 10, marginBottom: 6 }}>Belgi</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 7 }}>
              {EMOJIS.map((e) => {
                const on = f.emoji === e;
                return (
                  <Tap
                    key={e}
                    onPress={() => set('emoji')(e)}
                    style={{
                      width: 46, height: 46, borderRadius: R.md,
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: on ? t.acc : t.line2,
                      backgroundColor: on ? t.line : 'transparent',
                    }}
                  >
                    <Txt size={22}>{e}</Txt>
                  </Tap>
                );
              })}
            </ScrollView>

            <View style={{ gap: 10, marginTop: 12 }}>
              <Input
                label="Barcode"
                value={f.barcode}
                onChangeText={set('barcode')}
                keyboardType="number-pad"
                right={
                  <Tap
                    onPress={() => navigation.navigate('Scanner', { mode: 'code', returnTo: 'Tovar' })}
                    style={{
                      width: 50, height: 50, borderRadius: R.md,
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: t.accdim,
                    }}
                  >
                    <Icon name="barcode" size={20} color={t.acctext} />
                  </Tap>
                }
              />
              <Input label="Kategoriya" value={f.category} onChangeText={set('category')}
                placeholder="Aksesuar" />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {!editing ? (
                  <Input label="Boshlang‘ich qoldiq" value={f.stock} onChangeText={num('stock')}
                    keyboardType="number-pad" placeholder="0" style={{ flex: 1 }} />
                ) : null}
                <Input
                  label="Minimal qoldiq"
                  value={f.minStock}
                  onChangeText={num('minStock')}
                  keyboardType="number-pad"
                  placeholder="5"
                  style={{ flex: 1 }}
                  hint="Shu darajaga tushganda ogohlantiradi"
                />
              </View>
            </View>
          </Step>
        )}

        {/* Narxlar */}
        <Step n={nextStep()} title="Narxlar" t={t}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Input label="Tan narxi" value={f.cost} onChangeText={num('cost')}
              keyboardType="number-pad" placeholder="0" style={{ flex: 1 }}
              inputStyle={{ fontWeight: '600' }} />
            <Input label="Sotuv narxi" value={f.price} onChangeText={num('price')}
              keyboardType="number-pad" placeholder="0" style={{ flex: 1 }}
              inputStyle={{ fontWeight: '600' }} />
          </View>
          {cost > 0 && price > 0 ? (
            <Txt size={12.5} weight="500" color={profit >= 0 ? t.ok : t.err} style={{ marginTop: 9 }}>
              Foyda: {money(profit)} so‘m ({marja}%)
            </Txt>
          ) : null}
        </Step>

        {/* Onlayn katalog */}
        <Step n={nextStep()} title="Onlayn katalog" t={t}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            padding: 13, borderRadius: R.md, backgroundColor: t.inset,
          }}>
            <Icon name="globe" size={21} color={t.acc} />
            <View style={{ flex: 1 }}>
              <Txt size={14}>Onlayn do‘konda ko‘rsatilsin</Txt>
              <Txt size={11.5} color={t.t4} style={{ marginTop: 2, lineHeight: 16 }}>
                Mijozlarga yuboriladigan havolada shu tovar ko‘rinadi
              </Txt>
            </View>
            <Toggle on={f.online} onPress={() => setF((s) => ({ ...s, online: !s.online }))} />
          </View>

          <Txt size={12} color={t.t3} style={{ marginTop: 14, marginBottom: 7 }}>Rasm</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <PhotoBox uri={f.photo} emoji={f.emoji} size={84} radius={R.md} />
            <View style={{ flex: 1, gap: 8 }}>
              <Btn
                title={f.photo ? 'Suratni almashtirish' : 'Rasm tanlash'}
                icon="camera"
                variant="secondary"
                size="sm"
                loading={uploading}
                onPress={pickPhoto}
              />
              {f.photo ? (
                <Tap onPress={() => setF((s) => ({ ...s, photo: '' }))}>
                  <Txt size={12} color={t.err}>Suratni olib tashlash</Txt>
                </Tap>
              ) : null}
            </View>
          </View>
          <Txt size={11.5} color={t.t4} style={{ marginTop: 8, lineHeight: 16 }}>
            Rasmsiz tovar katalogda emoji bilan chiqadi — mijozga yaxshi ko‘rinmaydi
          </Txt>

          <Input
            label="Tavsif"
            value={f.description}
            onChangeText={set('description')}
            multiline
            style={{ marginTop: 12 }}
            inputStyle={{ height: 96, paddingTop: 12, textAlignVertical: 'top' }}
            hint="Mijoz katalogda ko‘radi — ixtiyoriy"
          />
        </Step>

        <Btn title="Saqlash" icon="check" size="xl" full loading={busy}
          disabled={!valid} onPress={save} style={{ marginTop: 6 }} />

        {/* Mavjud tovar uchun qo'shimcha amallar */}
        {editing ? (
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <Btn title="Kirim" icon="plus" variant="soft" style={{ flex: 1 }}
                onPress={() => setSheet('kirim')} />
              <Btn title="Stiker" icon="printer" variant="secondary" style={{ flex: 1 }}
                onPress={() => setSheet('stiker')} />
            </View>
            <Btn title="Harakat tarixi" icon="history" variant="secondary" full
              style={{ marginTop: 8 }} onPress={() => setSheet('history')} />
            <Btn title="Tovarni o‘chirish" variant="danger" full
              style={{ marginTop: 14 }} onPress={remove} />
          </>
        ) : null}
      </Screen>

      {sheet === 'kirim' && (
        <KirimSheet product={product} onClose={() => setSheet(null)} />
      )}
      {sheet === 'stiker' && (
        <StikerSheet products={[product]} onClose={() => setSheet(null)} />
      )}
      {sheet === 'history' && (
        <HistorySheet product={product} onClose={() => setSheet(null)} />
      )}
    </>
  );
}

/* Raqamlangan bo'lim — vebdagi shakl bilan bir xil ko'rinish */
function Step({ n, title, children, t }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <View style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center',
        }}>
          <Txt size={12.5} weight="600" color={t.onAcc}>{n}</Txt>
        </View>
        <Txt size={15} weight="500">{title}</Txt>
      </View>
      <Card pad={14}>{children}</Card>
    </View>
  );
}
