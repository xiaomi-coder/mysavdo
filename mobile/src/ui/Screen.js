import React from 'react';
import { View, RefreshControl, StatusBar } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { Banner, FadeIn } from './Feedback';
import { useData } from '../DataContext';

/* Ekran ramkasi — yuqoridagi soat/batareya joyini bo'sh qoldiradi,
   pastda esa navigatsiya paneliga o'rin ajratadi.

   Internet uzilganda yuqorida sariq chiziq chiqadi va aloqa tiklanishi
   bilan o'zi yo'qoladi. */

export default function Screen({
  children, scroll = true, pad = 16, bottomPad = 20,
  onRefresh, refreshing, style, contentStyle, animate = true,
}) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const data = useData();

  /* KeyboardAwareScrollView — oddiy ScrollView emas. Sabab: maydonga
     bosilganda ekran o'zi kerakli joyga suriladi. Android'da edge-to-edge
     rejimida tizimning o'zi buni qilmaydi. */
  const body = scroll ? (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{
        paddingHorizontal: pad,
        paddingTop: 8,
        paddingBottom: bottomPad,
      }, contentStyle]}
      refreshControl={onRefresh ? (
        <RefreshControl
          refreshing={Boolean(refreshing)}
          onRefresh={onRefresh}
          tintColor={t.acc}
          colors={[t.acc]}
          progressBackgroundColor={t.card}
        />
      ) : undefined}
    >
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View style={[{ flex: 1, paddingHorizontal: pad, paddingTop: 8 }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[{ flex: 1, backgroundColor: t.page, paddingTop: insets.top }, style]}>
      <StatusBar
        barStyle={t.mode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      {data?.offline ? <Banner kind="offline" text="Internet yo‘q — qayta ulanmoqda" /> : null}
      {animate ? <FadeIn>{body}</FadeIn> : body}
    </View>
  );
}
