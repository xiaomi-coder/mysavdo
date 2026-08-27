import React, { useState } from 'react';
import { View, TextInput, Linking, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { Sheet, Txt, Btn, Icon } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { money } from '../lib/format';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Qarz eslatmasi

   Xabar telefonning o'z SMS ilovasi orqali yuboriladi. Sabab: bu
   do'konchining o'z raqamidan ketadi — mijoz kimdan kelganini biladi
   va javob bera oladi. Ustiga hech qanday qo'shimcha to'lov yo'q.

   Kelajakda eskiz.uz orqali ommaviy yuborish qo'shilsa, o'sha bir
   yo'la yuzta mijozga ketadi. Hozircha bittalab — lekin ishlaydi.
   ══════════════════════════════════════════════════════════════════════ */

export default function SmsSheet({ data, onClose }) {
  const { t } = useTheme();
  const { store } = useAuth();
  const { notify } = useFeedback();
  /* Tayyor matn — do'konchi kerak bo'lsa tahrirlaydi */
  const [text, setText] = useState(() => {
    const name = data?.customer?.name || 'Hurmatli mijoz';
    return `${name}, ${store?.name || 'do‘konimiz'}dan eslatma: sizda ${money(data?.debt)} so‘m `
      + 'qarz bor. Iltimos, imkoniyat bo‘lganda to‘lab ketishingizni so‘raymiz. Rahmat!';
  });

  if (!data) return null;

  const phone = String(data.customer?.phone || '').replace(/[^\d+]/g, '');
  const len = text.length;
  const parts = Math.max(1, Math.ceil(len / 70));   // kirilcha/lotin aralash → 70 belgi

  const send = async () => {
    if (!phone) { notify('Mijozning telefoni yo‘q', 'error'); return; }
    const sep = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${phone}${sep}body=${encodeURIComponent(text)}`;
    const ok = await Linking.canOpenURL(url);
    if (!ok) { notify('SMS ilovasi ochilmadi', 'error'); return; }
    await Linking.openURL(url);
    onClose?.();
  };

  return (
    <Sheet
      visible
      onClose={onClose}
      title="Qarz eslatmasi"
      sub={`${data.customer?.name} · ${money(data.debt)} so‘m`}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        style={{
          height: 130, borderRadius: R.md,
          backgroundColor: t.inset, borderWidth: 1, borderColor: t.line2,
          color: t.t1, padding: 14, fontSize: 14, lineHeight: 21,
          textAlignVertical: 'top',
        }}
      />

      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        marginTop: 8, marginBottom: 14, paddingHorizontal: 2,
      }}>
        <Txt size={12} color={t.t4}>{len} belgi · {parts} SMS</Txt>
        <Txt size={12} color={t.t4}>o‘z raqamingizdan ketadi</Txt>
      </View>

      <View style={{
        flexDirection: 'row', gap: 9, alignItems: 'flex-start',
        padding: 12, borderRadius: R.sm, backgroundColor: t.inset, marginBottom: 14,
      }}>
        <Icon name="info" size={15} color={t.t4} />
        <Txt size={11.5} color={t.t3} style={{ flex: 1, lineHeight: 17 }}>
          Xabar telefoningizning SMS ilovasida ochiladi — u yerdan yuborasiz.
          Shunda mijoz kimdan kelganini ko‘radi va javob bera oladi.
        </Txt>
      </View>

      <Btn title="SMS ilovasida ochish" icon="chat-text" size="lg" full onPress={send} />
    </Sheet>
  );
}
