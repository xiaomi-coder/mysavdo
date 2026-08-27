import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import {
  Screen, Txt, Tap, Btn, Input, Header, SectionLabel, Icon,
} from '../ui';
import { useFeedback } from '../ui/Feedback';
import { getReceiptSettings, saveReceiptSettings, printReceipt } from '../lib/receipt';
import { R } from '../theme';

/* Chek printer sozlamalari.

   Termal printer telefonga Bluetooth orqali ulanadi va tizimning
   o'z chop etish oynasida ko'rinadi — ilova tomonidan alohida
   ulanish shart emas. Shuning uchun bu yerda faqat chekning
   KO'RINISHI sozlanadi.

   Sinov cheki tugmasi bor: do'konchi rostdan chiqishini bir marta
   ko'rib olsin, birinchi mijoz oldida emas. */

const TEMPLATES = [
  { id: 'compact', label: 'Ixcham · 58 mm', sub: 'Kichik termal printer' },
  { id: 'detailed', label: 'Jadvalli · 80 mm', sub: 'Keng printer, batafsil chek' },
];

const SIZES = [
  { id: 'kichik', label: 'Kichik' },
  { id: 'normal', label: 'O‘rtacha' },
  { id: 'katta', label: 'Katta' },
];

export default function ChekPrinter({ navigation }) {
  const { t } = useTheme();
  const { store, user } = useAuth();
  const { notify } = useFeedback();

  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getReceiptSettings().then((cfg) => setS({
      ...cfg,
      storeName: cfg.storeName || store?.name || '',
      phone: cfg.phone || store?.phone || '',
      address: cfg.address || store?.address || '',
    }));
  }, [store]);

  if (!s) return <Screen><Header title="Chek printer" onBack={() => navigation.goBack()} /></Screen>;

  const set = (k) => (v) => setS((x) => ({ ...x, [k]: v }));

  const save = async () => {
    await saveReceiptSettings(s);
    notify('Saqlandi', 'ok');
  };

  const test = async () => {
    setBusy(true);
    try {
      await printReceipt({
        items: [
          { id: 1, name: 'Sinov tovari', qty: 2, price: 45000, cost_price: 30000 },
          { id: 2, name: 'Ikkinchi tovar', qty: 1, price: 120000, cost_price: 90000 },
        ],
        subtotal: 210000,
        discount: 10000,
        total: 200000,
        payMethod: 'cash',
        receiptNo: '000001',
        cashier: user?.name || 'Kassir',
        storeName: s.storeName,
        settings: s,
      });
    } catch {
      notify('Chop etib bo‘lmadi', 'error');
    }
    setBusy(false);
  };

  return (
    <Screen>
      <Header title="Chek printer" onBack={() => navigation.goBack()} />

      <View style={{
        flexDirection: 'row', gap: 10, alignItems: 'flex-start',
        padding: 13, borderRadius: R.md, backgroundColor: t.inset, marginBottom: 16,
      }}>
        <Icon name="info" size={17} color={t.t4} />
        <Txt size={12} color={t.t3} style={{ flex: 1, lineHeight: 18 }}>
          Chekni chop etishda telefonning o‘z oynasi ochiladi. Bluetooth
          termal printeringiz shu ro‘yxatda ko‘rinadi — bir marta tanlasangiz
          keyingi safar eslab qoladi.
        </Txt>
      </View>

      <SectionLabel>CHEK KO‘RINISHI</SectionLabel>
      <View style={{ gap: 10, marginBottom: 16 }}>
        {TEMPLATES.map((x) => {
          const on = s.template === x.id;
          return (
            <Tap
              key={x.id}
              onPress={() => set('template')(x.id)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                padding: 14, borderRadius: R.lg,
                backgroundColor: on ? t.line : t.card,
                borderWidth: 1, borderColor: on ? t.acc : t.line,
              }}
            >
              <Icon name="receipt" size={22} color={on ? t.acc : t.t3} />
              <View style={{ flex: 1 }}>
                <Txt size={15} weight="500" color={on ? t.acctext : t.t1}>{x.label}</Txt>
                <Txt size={12} color={t.t3} style={{ marginTop: 2 }}>{x.sub}</Txt>
              </View>
              {on ? <Icon name="check-circle" size={20} color={t.acc} fill /> : null}
            </Tap>
          );
        })}
      </View>

      <SectionLabel>SHRIFT O‘LCHAMI</SectionLabel>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {SIZES.map((x) => {
          const on = s.fontSize === x.id;
          return (
            <Tap
              key={x.id}
              onPress={() => set('fontSize')(x.id)}
              style={{
                flex: 1, height: 44, borderRadius: R.md,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: on ? t.line : 'transparent',
                borderWidth: 1, borderColor: on ? t.acc : t.line2,
              }}
            >
              <Txt size={14} weight="500" color={on ? t.acctext : t.t3}>{x.label}</Txt>
            </Tap>
          );
        })}
      </View>

      <SectionLabel>CHEKDAGI MA’LUMOT</SectionLabel>
      <View style={{ gap: 10, marginBottom: 16 }}>
        <Input label="Do‘kon nomi" value={s.storeName} onChangeText={set('storeName')} />
        <Input label="Telefon" value={s.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
        <Input label="Manzil" value={s.address} onChangeText={set('address')} />
        <Input label="Pastdagi yozuv" value={s.footer} onChangeText={set('footer')} />
      </View>

      <View style={{ gap: 10, marginBottom: 20 }}>
        <Btn title="Sinov chekini chop etish" icon="printer" variant="secondary" size="lg" full
          loading={busy} onPress={test} />
        <Btn title="Saqlash" size="lg" full onPress={save} />
      </View>
    </Screen>
  );
}
