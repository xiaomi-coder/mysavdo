import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Animated, Modal, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useTr } from '../i18n';
import { R } from '../theme';
import { Txt, Tap } from './base';
import Icon from './Icon';

/* ══════════════════════════════════════════════════════════════════════════
   Bildirishlar: toast, muvaffaqiyat ekrani, offline banneri

   Do'konda telefon ekraniga har doim ham qarab turilmaydi — sotuvchi
   mijoz bilan gaplashadi. Shuning uchun muhim harakatlar tebranish
   bilan ham bildiriladi.
   ══════════════════════════════════════════════════════════════════════ */

const Ctx = createContext(null);

export function FeedbackProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [success, setSuccess] = useState(null);
  const timer = useRef(null);

  const notify = useCallback((text, kind = 'info') => {
    clearTimeout(timer.current);
    setToast({ text, kind, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2600);
    if (kind === 'error') buzz('error');
    else if (kind === 'ok') buzz('ok');
  }, []);

  const showSuccess = useCallback((payload) => {
    buzz('ok');
    setSuccess(payload);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Ctx.Provider value={{ notify, showSuccess, closeSuccess: () => setSuccess(null) }}>
      {children}
      <Toast data={toast} />
      {success ? <SuccessOverlay {...success} onClose={() => setSuccess(null)} /> : null}
    </Ctx.Provider>
  );
}

export const useFeedback = () => useContext(Ctx);

/* Tebranish. Sotuv yakunlanganda va xatoda — boshqa joyda emas,
   aks holda ilova bezovta qiladi. */
export function buzz(kind = 'tap') {
  try {
    if (kind === 'ok') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (kind === 'warn') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

/* ── Toast ────────────────────────────────────────────────────────────── */
function Toast({ data }) {
  const { t } = useTheme();
  const tr = useTr();
  const insets = useSafeAreaInsets();
  const a = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(a, {
      toValue: data ? 1 : 0,
      duration: data ? 200 : 160,
      useNativeDriver: true,
    }).start();
  }, [data, a]);

  if (!data) return null;

  const border = data.kind === 'error' ? t.err : data.kind === 'ok' ? t.ok : t.accdim;
  const fg = data.kind === 'error' ? t.err : data.kind === 'ok' ? t.ok : t.acctext;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: 0, right: 0,
        bottom: 96 + insets.bottom,
        alignItems: 'center',
        opacity: a,
        transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      <View style={{
        maxWidth: '88%',
        backgroundColor: t.inset,
        borderWidth: 1, borderColor: border,
        borderRadius: R.md,
        paddingVertical: 10, paddingHorizontal: 18,
        shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 }, elevation: 8,
      }}>
        <Txt size={13} weight="500" color={fg} style={{ textAlign: 'center' }}>{tr(data.text)}</Txt>
      </View>
    </Animated.View>
  );
}

/* ── Muvaffaqiyat ekrani ──────────────────────────────────────────────────
   Sotuv yakunlangach chiqadi. Belgining chizilishi 0,6 soniya davom
   etadi — sotuvchi ko'z qiri bilan ko'rib, "bo'ldi" deb tushunadi.    */
const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);

export function SuccessOverlay({ title, amount, actions, onClose, autoClose }) {
  const { t } = useTheme();
  const ring = useState(() => new Animated.Value(264))[0];
  const tick = useState(() => new Animated.Value(48))[0];
  const fade = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(ring, { toValue: 0, duration: 400, useNativeDriver: false }),
      Animated.timing(tick, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start();
    if (autoClose) {
      const id = setTimeout(() => onClose?.(), autoClose);
      return () => clearTimeout(id);
    }
  }, [ring, tick, fade, autoClose, onClose]);

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: t.succBg,
        alignItems: 'center', justifyContent: 'center',
        padding: 30, opacity: fade,
      }}>
        <Svg width={92} height={92} viewBox="0 0 92 92" style={{ marginBottom: 6 }}>
          <ACircle
            cx={46} cy={46} r={42} fill="none" stroke={t.ok} strokeWidth={2.5}
            strokeDasharray="264" strokeDashoffset={ring}
          />
          <APath
            d="M30 47 L42 59 L63 36" fill="none" stroke={t.ok} strokeWidth={4}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="48" strokeDashoffset={tick}
          />
        </Svg>

        <Txt size={19} weight="500" style={{ marginTop: 8 }}>{title}</Txt>
        {amount != null ? (
          <Txt size={26} weight="600" style={{ marginTop: 4 }}>
            {amount} <Txt size={14} color={t.t3}>so‘m</Txt>
          </Txt>
        ) : null}

        {actions ? (
          <View style={{ width: '100%', maxWidth: 280, gap: 10, marginTop: 18 }}>{actions}</View>
        ) : null}
      </Animated.View>
    </Modal>
  );
}

/* ── Yuqoridagi banner (offline / sinxron) ────────────────────────────── */
export function Banner({ kind = 'offline', text, onPress }) {
  const { t } = useTheme();
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.spring(a, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 220 }).start();
  }, [a]);

  const bg = kind === 'offline' ? t.warn : kind === 'error' ? t.err : t.ok;
  const icon = kind === 'offline' ? 'wifi-slash' : kind === 'error' ? 'warning' : 'cloud';

  return (
    <Animated.View style={{
      transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
    }}>
      <Tap onPress={onPress} disabled={!onPress} style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 9, paddingHorizontal: 16, backgroundColor: bg,
      }}>
        <Icon name={icon} size={16} color={t.shell} />
        <Txt size={13} weight="500" color={t.shell}>{text}</Txt>
      </Tap>
    </Animated.View>
  );
}

/* ── Ekran o'zgarganda kirish animatsiyasi ────────────────────────────────
   Dizayndagi kIn: o'ngdan sirg'alib chiqadi.                             */
export function FadeIn({ children, style, from = 24, duration = 280 }) {
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration, useNativeDriver: true }).start();
  }, [a, duration]);
  return (
    <Animated.View style={[{
      flex: 1,
      opacity: a,
      transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
    }, style]}>
      {children}
    </Animated.View>
  );
}
