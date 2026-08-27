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
   birinchi ko'zga tashlanadigan narsa bugun bo'lsin. */

export default function BarChart({ data, height = 96 }) {
  const { t } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, height }}>
      {data.map((d, i) => (
        <Bar
          key={d.label + i}
          pct={(d.value / max) * 100}
          label={d.label}
          active={d.active}
          delay={i * 40}
          t={t}
        />
      ))}
    </View>
  );
}

function Bar({ pct, label, active, delay, t }) {
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1, duration: 500, delay, useNativeDriver: false,
    }).start();
  }, [a, delay]);

  return (
    <View style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
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
        borderColor: active ? t.acc : t.line2,
      }} />
      <Txt size={10} color={active ? t.acctext : t.t4}>{label}</Txt>
    </View>
  );
}
