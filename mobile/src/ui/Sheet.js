import React, { useState, useEffect } from 'react';
import {
  View, Modal, Animated, PanResponder, Dimensions, ScrollView, StyleSheet,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { R } from '../theme';
import { Txt } from './base';

/* ══════════════════════════════════════════════════════════════════════════
   Pastdan chiqadigan oyna

   Ilovadagi deyarli barcha amal shu oynada bajariladi: savat, kirim,
   tovar tahriri, nasiya to'lovi, kunni yopish. Sabab oddiy — telefon
   ekranining yuqori qismiga bosh barmoq yetmaydi, shuning uchun barcha
   tugma pastki yarmida turadi.

   Yopish uchun uchta yo'l: pastga surish, fondagi qorong'ilikni bosish,
   telefonning orqaga tugmasi.
   ══════════════════════════════════════════════════════════════════════ */

const { height: SCREEN_H } = Dimensions.get('window');

export default function Sheet({ visible, onClose, title, sub, children, maxHeight }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  const y = useState(() => new Animated.Value(SCREEN_H))[0];
  const fade = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      y.setValue(SCREEN_H);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
        // Ozgina sakrash — qog'oz varaq ko'tarilgandek tuyulsin
        Animated.spring(y, {
          toValue: 0, useNativeDriver: true,
          damping: 22, stiffness: 260, mass: 0.9,
        }),
      ]).start();
    }
  }, [visible, y, fade]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(y, { toValue: SCREEN_H, duration: 220, useNativeDriver: true }),
    ]).start(() => onClose?.());
  };

  /* Tutqichdan pastga surish */
  const [pan] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4,
      onPanResponderMove: (_, g) => { if (g.dy > 0) y.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        // Yetarlicha pastga surildi yoki tez itarildi — yopamiz
        if (g.dy > 110 || g.vy > 0.8) dismiss();
        else Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 240 }).start();
      },
    })
  );

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={dismiss} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: t.backdrop, opacity: fade }]}>
          <Animated.View
            style={{ flex: 1 }}
            onStartShouldSetResponder={() => true}
            onResponderRelease={dismiss}
          />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            transform: [{ translateY: y }],
            backgroundColor: t.card,
            borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1,
            borderColor: t.line,
            borderTopLeftRadius: R.sheet, borderTopRightRadius: R.sheet,
            maxHeight: maxHeight || SCREEN_H * 0.88,
          }}
        >
          {/* Tutqich */}
          <View {...pan.panHandlers} style={{ paddingTop: 11, paddingBottom: 6, alignItems: 'center' }}>
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: t.line2 }} />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingTop: 2,
              paddingBottom: 24 + Math.max(insets.bottom, 16),
            }}
          >
            {title ? (
              <Txt size={17} weight="500" style={{ marginBottom: sub ? 3 : 12 }}>{title}</Txt>
            ) : null}
            {sub ? (
              <Txt size={13} color={t.t3} style={{ marginBottom: 14 }}>{sub}</Txt>
            ) : null}
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
