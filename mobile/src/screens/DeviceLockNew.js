import React, { useState, useMemo, useEffect } from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Btn, Icon, Input, Header, Chip, SectionLabel,
} from '../ui';
import { useFeedback, buzz } from '../ui/Feedback';
import { db } from '../lib/api';
import { money } from '../lib/format';
import { R, alpha } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Kredit telefon qo'shish

   Uch qadam:
     1. Telefon va mijoz — IMEI, model, kim oldi
     2. Nasiya sharti — narx, boshlang'ich, necha oy → jadval o'zi tuziladi
     3. Ro'yxatga olish — telefonni zavod holatida QR bilan boshqaruvga
        qo'shish (Android Management API)

   IMEI'ni skanerdan olish mumkin — quti ustidagi barcode. Bu qo'lda
   15 xonali raqam terishdan tez va xatosiz.
   ══════════════════════════════════════════════════════════════════════ */

const MONTHS = [3, 6, 9, 12, 18, 24];

export default function DeviceLockNew({ navigation, route }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const pre = route?.params || {};
  const [f, setF] = useState({
    imei: pre.prefillImei || '',
    model: pre.prefillModel || '',
    clientName: pre.prefillCustomer?.name || '',
    clientPhone: pre.prefillCustomer?.phone || '',
    price: '', down: '', months: 6,
  });
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);   // yaratilgandan keyin QR

  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const num = (k) => (v) => setF((s) => ({ ...s, [k]: v.replace(/\D/g, '').slice(0, 12) }));

  /* Skanerdan qaytgan IMEI */
  useEffect(() => {
    const code = route?.params?.scanned;
    if (!code) return;
    navigation.setParams({ scanned: undefined });
    const digits = String(code).replace(/\D/g, '');
    if (digits.length >= 14) {
      setF((s) => ({ ...s, imei: digits.slice(0, 15) }));
      notify('IMEI yozildi', 'ok');
    }
  }, [route?.params?.scanned]);

  const plan = useMemo(() => {
    const price = parseInt(f.price, 10) || 0;
    const down = parseInt(f.down, 10) || 0;
    const financed = Math.max(0, price - down);
    const monthly = f.months > 0 ? Math.ceil(financed / f.months / 1000) * 1000 : 0;
    return { price, down, financed, monthly };
  }, [f.price, f.down, f.months]);

  const valid = f.imei.length >= 14 && f.model.trim() && f.clientName.trim()
    && plan.price > 0 && plan.financed > 0;

  const save = async () => {
    if (!valid) { notify('Barcha maydonlarni to‘ldiring', 'error'); return; }
    setBusy(true);

    // 1. Kredit qurilma
    const { data: dev, error } = await db.from('credit_devices').insert({
      store_id: d.storeId,
      imei: f.imei.trim(),
      model: f.model.trim(),
      client_name: f.clientName.trim(),
      client_phone: f.clientPhone.trim() || null,
      price: plan.price,
      down_payment: plan.down,
      months: f.months,
      provider: 'amapi',
      status: 'pending',
    }).select().single();

    if (error) {
      setBusy(false);
      notify(error.code === '23505' ? 'Bu IMEI allaqachon kredit ro‘yxatida' : error.message, 'error');
      return;
    }

    // 2. To'lov jadvali — har oyga bitta qator
    const now = new Date();
    const rows = [];
    let remaining = plan.financed;
    for (let n = 1; n <= f.months; n++) {
      const due = new Date(now.getFullYear(), now.getMonth() + n, now.getDate());
      const amount = n === f.months ? remaining : plan.monthly;
      remaining -= amount;
      rows.push({
        device_id: dev.id, n, due_date: due.toISOString().slice(0, 10), amount,
      });
    }
    await db.from('credit_schedule').insert(rows);

    setBusy(false);
    buzz('ok');
    setCreated(dev);
  };

  /* ── Yaratilgandan keyin: ro'yxatga olish QR ── */
  if (created) {
    /* QR ichida qurilma ID va IMEI. Haqiqiy enrollment token Google
       Cloud sozlangach amapi.makeEnrollmentToken'dan keladi — u yerda
       Google'ning tayyor QR JSON'i bo'ladi. Shu paytgacha QR do'kon
       ichki ro'yxatga olish uchun. */
    const payload = JSON.stringify({
      mb: 'device-enroll', id: created.id, imei: created.imei, store: d.storeId,
    });

    return (
      <Screen>
        <Header title="Ro‘yxatga olish" onBack={() => navigation.navigate('KreditQulf')} />

        <Card pad={18} style={{ alignItems: 'center' }}>
          <Icon name="check-circle" size={40} color={t.ok} fill />
          <Txt size={17} weight="600" style={{ marginTop: 10 }}>Kredit telefon qo‘shildi</Txt>
          <Txt size={13} color={t.t3} style={{ marginTop: 4, textAlign: 'center' }}>
            {created.model} · {money(plan.monthly)} so‘m/oy
          </Txt>
        </Card>

        <SectionLabel style={{ marginTop: 16 }}>TELEFONNI RO‘YXATGA OLISH</SectionLabel>

        <Card pad={18} style={{ alignItems: 'center' }}>
          <View style={{ padding: 14, backgroundColor: '#fff', borderRadius: R.md }}>
            <QRCode value={payload} size={200} />
          </View>
          <Txt size={13} color={t.t2} style={{ marginTop: 14, textAlign: 'center', lineHeight: 20 }}>
            1. Telefonni <Txt weight="600">zavod holatida</Txt> yoqing{'\n'}
            2. Salomlashuv ekranida <Txt weight="600">6 marta bosing</Txt>{'\n'}
            3. Shu QR kodni skanerlang
          </Txt>
        </Card>

        <Card pad={13} border={t.accdim} style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
          <Icon name="info" size={17} color={t.acc} />
          <Txt size={11.5} color={t.t3} style={{ flex: 1, lineHeight: 17 }}>
            Google Cloud ulanmaguncha bu QR do‘kon ichki hisobi uchun. Ulangach
            u telefonni to‘g‘ridan-to‘g‘ri MyBazzar boshqaruviga qo‘shadi va
            masofadan qulflash ishlaydi.
          </Txt>
        </Card>

        <Btn title="Keyinroq ro‘yxatga olaman" variant="secondary" full
          style={{ marginTop: 16 }} onPress={() => navigation.navigate('KreditQulf')} />
      </Screen>
    );
  }

  return (
    <Screen bottomPad={40}>
      <Header title="Yangi kredit telefon" onBack={() => navigation.goBack()} />

      {/* 1. Telefon va mijoz */}
      <SectionLabel>TELEFON VA MIJOZ</SectionLabel>
      <Card pad={14} gap={10}>
        <Input
          label="IMEI"
          value={f.imei}
          onChangeText={num('imei')}
          keyboardType="number-pad"
          placeholder="15 xonali"
          right={
            <Tap
              onPress={() => navigation.navigate('Scanner', { mode: 'code', returnTo: 'KreditYangi' })}
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
        <Input label="Model" value={f.model} onChangeText={set('model')}
          placeholder="Samsung Galaxy A55" />
        <Input label="Mijoz ismi" value={f.clientName} onChangeText={set('clientName')}
          placeholder="Alisher Karimov" />
        <Input label="Mijoz telefoni" value={f.clientPhone} onChangeText={set('clientPhone')}
          keyboardType="phone-pad" placeholder="+998 90 123 45 67" />
      </Card>

      {/* 2. Nasiya sharti */}
      <SectionLabel style={{ marginTop: 16 }}>NASIYA SHARTI</SectionLabel>
      <Card pad={14} gap={10}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Input label="To‘liq narx" value={f.price} onChangeText={num('price')}
            keyboardType="number-pad" placeholder="0" style={{ flex: 1 }}
            inputStyle={{ fontWeight: '600' }} />
          <Input label="Boshlang‘ich" value={f.down} onChangeText={num('down')}
            keyboardType="number-pad" placeholder="0" style={{ flex: 1 }}
            inputStyle={{ fontWeight: '600' }} />
        </View>

        <Txt size={12} color={t.t3} style={{ marginTop: 4 }}>Muddat</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MONTHS.map((m) => (
            <Chip key={m} label={`${m} oy`} active={f.months === m}
              onPress={() => setF((s) => ({ ...s, months: m }))} />
          ))}
        </View>

        {plan.financed > 0 ? (
          <View style={{
            marginTop: 8, padding: 13, borderRadius: R.md,
            backgroundColor: alpha(t.accRgb, 0.1),
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt size={13} color={t.t3}>Nasiyaga</Txt>
              <Txt size={13.5} weight="500">{money(plan.financed)} so‘m</Txt>
            </View>
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
              marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: t.line,
            }}>
              <Txt size={13} color={t.acctext}>Oylik to‘lov</Txt>
              <Txt size={19} weight="600" color={t.acctext}>
                {money(plan.monthly)} <Txt size={12} color={t.t4}>so‘m</Txt>
              </Txt>
            </View>
            <Txt size={11.5} color={t.t4} style={{ marginTop: 6 }}>
              {f.months} oy · har oy {money(plan.monthly)} so‘m
            </Txt>
          </View>
        ) : null}
      </Card>

      <Btn title="Qo‘shish va ro‘yxatga olish" icon="qr-code" size="xl" full
        disabled={!valid} loading={busy} onPress={save} style={{ marginTop: 16 }} />

      <Txt size={11.5} color={t.t4} style={{ textAlign: 'center', marginTop: 10, lineHeight: 17 }}>
        Qo‘shilgach telefonni zavod holatida QR bilan ro‘yxatga olasiz —
        shundan keyin to‘lov kechiksa masofadan qulflanadi.
      </Txt>
    </Screen>
  );
}
