import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, TextInput, Animated, Easing, ActivityIndicator,
  StyleSheet, Platform, Image,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { alpha, R, TAP, FS } from '../theme';
import { useTr } from '../i18n';
import Icon from './Icon';

/* ══════════════════════════════════════════════════════════════════════════
   Asosiy komponentlar

   Dizayn qoidasi: birlamchi tugma HECH QACHON to'liq bo'yalmaydi.
   U doim akcent rangdagi ramka va yumshoq nur bilan chiziladi. Bu
   butun ilova bo'ylab bir xil.

   Ikkinchi qoida: bosiladigan har bir narsa kamida 44px bo'ladi —
   sotuvchi telefonni bir qo'lda ushlab, ikkinchi qo'lida tovar bilan
   ishlaydi.
   ══════════════════════════════════════════════════════════════════════ */

/* ── Matn ────────────────────────────────────────────────────────────────
   Ekranlardagi matn shu yerda tarjima qilinadi. Shu sababli ekran
   fayllarida birorta t('...') chaqiruvi yo'q — kod o'zbekcha
   o'qilishda qoladi, lekin ilova uch tilda gapiradi.

   JSX ichida "{count} dona · {sum} so'm" ko'rinishida yozilganda
   children massiv bo'ladi; matn bo'laklarini alohida tarjima qilamiz
   va atrofidagi bo'shliqni saqlab qolamiz.                            */
export function Txt({ children, size = FS.body, weight = '400', color, dim, mono, style, ...rest }) {
  const { t } = useTheme();
  const tr = useTr();
  const body = typeof children === 'string'
    ? tr(children)
    : Array.isArray(children)
      ? children.map((c, i) => (typeof c === 'string'
          ? <React.Fragment key={i}>{tr(c, true)}</React.Fragment> : c))
      : children;
  return (
    <Text
      {...rest}
      style={[
        {
          color: color || (dim ? t.t3 : t.t1),
          fontSize: size,
          fontWeight: weight,
          ...(mono ? { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) } : null),
        },
        style,
      ]}
    >
      {body}
    </Text>
  );
}

/* ── Bosiladigan yuza ─────────────────────────────────────────────────── */
export function Tap({ children, onPress, onLongPress, style, activeStyle, disabled, hit = 6, ...rest }) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hit}
      style={({ pressed }) => [
        style,
        pressed && (activeStyle || { opacity: 0.65 }),
        disabled && { opacity: 0.45 },
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

/* Akcent nuri. Android'da rangli soya yo'q, u yerda ramka o'zi yetarli. */
export function glow(t, opacity = 0.25, radius = 20) {
  return Platform.select({
    ios: {
      shadowColor: t.acc,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: 0 },
    },
    default: {},
  });
}

/* ── Karta ────────────────────────────────────────────────────────────── */
export function Card({ children, style, pad = 14, border, onPress, ...rest }) {
  const { t } = useTheme();
  const box = {
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: border || t.line,
    borderRadius: R.lg,
    padding: pad,
  };
  if (onPress) {
    return (
      <Tap onPress={onPress} style={[box, style]} activeStyle={{ backgroundColor: t.line }} {...rest}>
        {children}
      </Tap>
    );
  }
  return <View style={[box, style]} {...rest}>{children}</View>;
}

/* ── Tugma ────────────────────────────────────────────────────────────────
   variant:
     primary   — akcent ramka + nur (asosiy harakat)
     secondary — kulrang ramka
     soft      — xira akcent ramka (ikkinchi darajali)
     ok        — yashil (tasdiqlash)
     danger    — qizil matn (rad etish, o'chirish)
     ghost     — ramkasiz                                                  */
export function Btn({
  title, children, onPress, variant = 'primary', icon, iconRight,
  size = 'md', full, disabled, loading, style, textStyle,
}) {
  const { t } = useTheme();
  const tr = useTr();
  const H = { sm: 38, md: 46, lg: 54, xl: 56 }[size] || 46;
  const FSZ = { sm: 13, md: 14, lg: 15, xl: 16 }[size] || 14;
  const ISZ = { sm: 16, md: 19, lg: 20, xl: 22 }[size] || 19;

  const V = {
    primary:   { bg: t.line, bc: t.acc, fg: t.acctext, glow: true },
    secondary: { bg: 'transparent', bc: t.line2, fg: t.t2 },
    soft:      { bg: 'transparent', bc: t.accdim, fg: t.acctext },
    ok:        { bg: t.line, bc: t.ok, fg: t.ok },
    danger:    { bg: 'transparent', bc: t.line2, fg: t.err },
    ghost:     { bg: 'transparent', bc: 'transparent', fg: t.t2 },
  }[variant] || {};

  return (
    <Tap
      onPress={onPress}
      disabled={disabled || loading}
      activeStyle={{ opacity: 0.72, transform: [{ scale: 0.98 }] }}
      style={[
        {
          height: H,
          paddingHorizontal: size === 'sm' ? 13 : 18,
          borderRadius: size === 'sm' ? R.md : R.lg,
          backgroundColor: V.bg,
          borderWidth: 1,
          borderColor: V.bc,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          ...(V.glow && !disabled ? glow(t, 0.25) : null),
        },
        full && { alignSelf: 'stretch' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={V.fg} size="small" />
      ) : (
        <>
          {icon ? <Icon name={icon} size={ISZ} color={V.fg} /> : null}
          {(title || children) ? (
            <Text style={[{ color: V.fg, fontSize: FSZ, fontWeight: '500' }, textStyle]}>
              {tr(title || children)}
            </Text>
          ) : null}
          {iconRight ? <Icon name={iconRight} size={ISZ} color={V.fg} /> : null}
        </>
      )}
    </Tap>
  );
}

/* ── Chip (filtr / tanlov) ────────────────────────────────────────────── */
export function Chip({ label, count, active, onPress, icon, color, style }) {
  const { t } = useTheme();
  const tr = useTr();
  const fg = active ? (color || t.acctext) : t.t3;
  return (
    <Tap
      onPress={onPress}
      style={[{
        height: 38,
        paddingHorizontal: 14,
        borderRadius: R.pill,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: active ? t.line : 'transparent',
        borderWidth: 1,
        borderColor: active ? (color || t.acc) : t.line2,
      }, style]}
    >
      {icon ? <Icon name={icon} size={15} color={fg} /> : null}
      <Text style={{ fontSize: 13, fontWeight: '500', color: fg }}>{tr(label)}</Text>
      {count != null ? (
        <Text style={{ fontSize: 13, fontWeight: '500', color: fg, opacity: 0.65 }}>{count}</Text>
      ) : null}
    </Tap>
  );
}

/* ── Kiritish maydoni ─────────────────────────────────────────────────── */
export const Input = React.forwardRef(function Input(
  { label, hint, hintColor, style, inputStyle, big, right, placeholder, ...rest }, ref
) {
  const { t } = useTheme();
  const tr = useTr();
  return (
    <View style={style}>
      {label ? <Txt size={12} color={t.t3} style={{ marginBottom: 5 }}>{label}</Txt> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput
          ref={ref}
          placeholder={tr(placeholder)}
          placeholderTextColor={t.t4}
          {...rest}
          style={[{
            flex: 1,
            height: big ? 54 : 50,
            borderRadius: R.md,
            backgroundColor: t.inset,
            borderWidth: 1,
            borderColor: t.line2,
            color: t.t1,
            paddingHorizontal: 14,
            fontSize: big ? 20 : 15,
            fontWeight: big ? '600' : '400',
          }, inputStyle]}
        />
        {right}
      </View>
      {hint ? <Txt size={12} color={hintColor || t.t3} style={{ marginTop: 6 }}>{hint}</Txt> : null}
    </View>
  );
});

/* ── Qidiruv qatori ───────────────────────────────────────────────────── */
export function SearchBar({ value, onChangeText, placeholder = 'Qidirish', style, onClear }) {
  const { t } = useTheme();
  const tr = useTr();
  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center', gap: 8,
      height: 46, borderRadius: R.md, backgroundColor: t.card,
      borderWidth: 1, borderColor: t.line2, paddingHorizontal: 12,
    }, style]}>
      <Icon name="search" size={18} color={t.t4} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={tr(placeholder)}
        placeholderTextColor={t.t4}
        style={{ flex: 1, color: t.t1, fontSize: 15, padding: 0 }}
        returnKeyType="search"
      />
      {value ? (
        <Tap onPress={() => (onClear ? onClear() : onChangeText(''))} hit={10}>
          <Icon name="x" size={17} color={t.t4} />
        </Tap>
      ) : null}
    </View>
  );
}

/* ── Miqdor tanlagich (−  12  +) ──────────────────────────────────────── */
export function Stepper({ value, onChange, min = 0, max = 99999, size = 38 }) {
  const { t } = useTheme();
  const n = parseInt(value, 10) || 0;
  const btn = (label, next, disabled) => (
    <Tap
      onPress={() => onChange(String(next))}
      disabled={disabled}
      style={{
        width: size, height: size, borderRadius: 10,
        backgroundColor: t.inset, borderWidth: 1, borderColor: t.line2,
        alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={{ color: t.t2, fontSize: size * 0.47 }}>{label}</Text>
    </Tap>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {btn('−', Math.max(min, n - 1), n <= min)}
      <Text style={{ width: 34, textAlign: 'center', fontSize: 15, fontWeight: '600', color: t.t1 }}>
        {n}
      </Text>
      {btn('+', Math.min(max, n + 1), n >= max)}
    </View>
  );
}

/* ── O'chirgich (sozlamalar) ──────────────────────────────────────────── */
export function Toggle({ on, onPress }) {
  const { t } = useTheme();
  const x = useState(() => new Animated.Value(on ? 18 : 0))[0];
  useEffect(() => {
    Animated.timing(x, { toValue: on ? 18 : 0, duration: 180, useNativeDriver: true }).start();
  }, [on, x]);
  return (
    <Tap onPress={onPress} hit={10}>
      <View style={{
        width: 46, height: 28, borderRadius: 14,
        backgroundColor: on ? t.acc : t.line2, justifyContent: 'center',
      }}>
        <Animated.View style={{
          width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
          marginLeft: 3, transform: [{ translateX: x }],
          shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 }, elevation: 2,
        }} />
      </View>
    </Tap>
  );
}

/* ── Katakcha (ko'p tanlash) ──────────────────────────────────────────── */
export function Checkbox({ on, onPress, size = 24 }) {
  const { t } = useTheme();
  const box = (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.5, borderColor: on ? t.acc : t.line2,
      backgroundColor: on ? t.acc : 'transparent',
      alignItems: 'center', justifyContent: 'center',
    }}>
      {on ? <Icon name="check" size={size * 0.58} color={t.shell} weight="bold" /> : null}
    </View>
  );
  return onPress ? <Tap onPress={onPress} hit={10}>{box}</Tap> : box;
}

/* ── Doiracha (mijoz bosh harflari) ───────────────────────────────────── */
export function Avatar({ text, size = 42, color, bordered = true }) {
  const { t } = useTheme();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: t.line,
      borderWidth: bordered ? 1 : 0, borderColor: t.line2,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.33, fontWeight: '600', color: color || t.acc }}>
        {text}
      </Text>
    </View>
  );
}

/* ── Tovar surati ─────────────────────────────────────────────────────── */
export function PhotoBox({ uri, emoji, size = 56, width, height, radius = 8, style }) {
  const { t } = useTheme();
  const w = width ?? size;
  const h = height ?? size;
  // Emoji va belgi o'lchami eng kichik tomonga qarab olinadi
  const unit = typeof h === 'number' ? h : (typeof w === 'number' ? w : 56);
  const box = [{
    width: w, height: h, borderRadius: radius,
    backgroundColor: t.line, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  }, style];

  if (uri) return <Image source={{ uri }} style={box} resizeMode="cover" />;

  // Ba'zi tovarlarda surat o'rniga emoji turadi — eski ma'lumotlar shunday
  if (emoji && !/^https?:/.test(emoji) && [...emoji].length <= 2) {
    return <View style={box}><Text style={{ fontSize: unit * 0.45 }}>{emoji}</Text></View>;
  }
  return (
    <View style={box}>
      <Icon name="image" size={unit * 0.34} color={t.t4} />
    </View>
  );
}

/* ── Bo'sh holat ──────────────────────────────────────────────────────── */
export function EmptyState({ icon = 'package', title, text, action, style, color }) {
  const { t } = useTheme();
  return (
    <View style={[{ alignItems: 'center', paddingVertical: 56, paddingHorizontal: 30 }, style]}>
      <Icon name={icon} size={42} color={color || t.line2} />
      {title ? <Txt size={16} weight="500" color={t.t2} style={{ marginTop: 12 }}>{title}</Txt> : null}
      {text ? (
        <Txt size={13} color={t.t3} style={{ marginTop: 5, textAlign: 'center', lineHeight: 19 }}>
          {text}
        </Txt>
      ) : null}
      {action ? <View style={{ marginTop: 14 }}>{action}</View> : null}
    </View>
  );
}

/* ── Xato holati ──────────────────────────────────────────────────────── */
export function ErrorState({ text, onRetry, offline }) {
  const { t } = useTheme();
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 28, marginTop: 40 }}>
      <Icon name={offline ? 'wifi-slash' : 'cloud-slash'} size={40} color={t.err} />
      <Txt size={16} weight="500" style={{ marginTop: 10 }}>
        {offline ? 'Internet yo‘q' : 'Ma’lumot yuklanmadi'}
      </Txt>
      <Txt size={13} color={t.t3} style={{ marginTop: 4, textAlign: 'center', lineHeight: 19 }}>
        {text || 'Server bilan aloqa uzildi. Qayta urinib ko‘ring.'}
      </Txt>
      {onRetry ? <Btn title="Qayta urinish" onPress={onRetry} style={{ marginTop: 14 }} /> : null}
    </Card>
  );
}

/* ── Yuklanish skeleti ────────────────────────────────────────────────────
   Bo'sh ekran o'rniga kartalar shakli ko'rinib turadi — kutish
   qisqaroq tuyuladi.                                                      */
export function Skeleton({ height = 76, style }) {
  const { t } = useTheme();
  const a = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(a, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  return (
    <View style={[{ height, borderRadius: R.lg, backgroundColor: t.card, overflow: 'hidden' }, style]}>
      <Animated.View style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: alpha(t.shimRgb, 0.06),
        opacity: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
      }} />
    </View>
  );
}

/* ── Bo'lim sarlavhasi ────────────────────────────────────────────────── */
export function SectionLabel({ children, color, icon, style }) {
  const { t } = useTheme();
  const tr = useTr();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 8 }, style]}>
      {icon ? <Icon name={icon} size={15} color={color || t.t4} /> : null}
      <Text style={{ fontSize: 12, fontWeight: '500', letterSpacing: 0.4, color: color || t.t4 }}>
        {typeof children === 'string' ? tr(children) : children}
      </Text>
    </View>
  );
}

/* ── Ro'yxat qatori ───────────────────────────────────────────────────── */
export function Row({ icon, iconColor, label, sub, right, onPress, lock, first, chevron = true, style }) {
  const { t } = useTheme();
  return (
    <Tap
      onPress={onPress}
      activeStyle={{ backgroundColor: t.line }}
      style={[{
        flexDirection: 'row', alignItems: 'center', gap: 13,
        paddingHorizontal: 16, paddingVertical: 14, minHeight: TAP + 8,
        borderTopWidth: first ? 0 : 1, borderTopColor: t.line,
      }, style]}
    >
      {icon ? <Icon name={icon} size={22} color={iconColor || t.acc} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt size={15}>{label}</Txt>
        {sub ? <Txt size={12} color={t.t3} style={{ marginTop: 2, lineHeight: 17 }}>{sub}</Txt> : null}
      </View>
      {right}
      {lock ? <Icon name="lock" size={15} color={t.t4} /> : null}
      {onPress && chevron ? <Icon name="caret-right" size={16} color={t.t4} /> : null}
    </Tap>
  );
}

/* ── Ekran sarlavhasi ─────────────────────────────────────────────────── */
export function Header({ title, onBack, right, sub }) {
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      {onBack ? (
        <Tap onPress={onBack} style={{
          width: TAP, height: TAP, marginLeft: -8,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="caret-left" size={22} color={t.t2} />
        </Tap>
      ) : null}
      <View style={{ flex: 1 }}>
        <Txt size={17} weight="500">{title}</Txt>
        {sub ? <Txt size={12} color={t.t3} style={{ marginTop: 2 }}>{sub}</Txt> : null}
      </View>
      {right}
    </View>
  );
}
