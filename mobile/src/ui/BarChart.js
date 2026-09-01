import React, { useState, useEffect } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Txt } from './base';
import { alpha } from '../theme';

/* Haftalik sotuv ustunlari.

   Har ustun navbat bilan pastdan ko'tariladi — bir vaqtda emas.
   Shu 40 millisekundlik kechikish grafikni jonli ko'rsatadi va ko'z
   qaysi kun balandligini payqab olishga ulguradi.

   Bugungi kun akcent rangda, qolganlari xira — ekranga qaraganda
   birinchi ko'zga tashlanadigan narsa bugun bo'lsin.

   Har ustun tepasida SUMMA yoziladi: ilgari faqat balandlik ko'rinardi
   va do'konchi "bu kun qancha edi?" degan savolga javob ololmasdi.
   Telefon ekrani tor bo'lgani uchun summa qisqartiriladi (1.2mln, 450m).
   Eng baland kun alohida belgilanadi — hafta cho'qqisi darrov ko'rinsin. */

/* 1 250 000 -> "1.2mln" | 450 000 -> "450m" | 0 -> "—" */
function compact(n) {
  const v = Number(n) || 0;
  if (v <= 0) return '—';
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}mlrd`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}mln`;
  if (v >= 1e3) return `${Math.round(v / 1e3)}m`;
  return String(Math.round(v));
}

export default function BarChart({ data, height = 118 }) {
  const { t } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const best = data.reduce((b, d) => (d.value > (b?.value ?? -1) ? d : b), null);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 6, height }}>
      {data.map((d, i) => (
        <Bar
          key={d.label + i}
          pct={(d.value / max) * 100}
          value={d.value}
          label={d.label}
          active={d.active}
          top={best && d.value > 0 && d.value === best.value}
          delay={i * 40}
          t={t}
        />
      ))}
    </View>
  );
}

function Bar({ pct, value, label, active, top, delay, t }) {
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1, duration: 500, delay, useNativeDriver: false,
    }).start();
  }, [a, delay]);

  // Bugun > hafta cho'qqisi > oddiy kun
  const fg = active ? t.acctext : top ? t.t2 : t.t4;

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {/* Summa — ustun tepasida */}
      <Txt size={9.5} weight={active || top ? '600' : '400'} color={fg}
        numberOfLines={1} style={{ marginBottom: 3 }}>
        {compact(value)}
      </Txt>

      {/* Ustun maydoni: balandlik shu maydonning foizi */}
      <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
        <Animated.View style={{
          width: '100%',
          height: a.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', `${Math.max(3, pct)}%`],
          }),
          borderTopLeftRadius: 6, borderTopRightRadius: 6,
          borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
          backgroundColor: active ? alpha(t.accRgb, 0.28) : t.line,
          borderWidth: 1,
          borderColor: active ? t.acc : top ? t.t4 : t.line2,
        }} />
      </View>

      <Txt size={10} color={active ? t.acctext : t.t4} style={{ marginTop: 5 }}>{label}</Txt>
    </View>
  );
}
