import React from 'react';
import { View, ScrollView, RefreshControl, StatusBar } from 'react-native';
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

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
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
    </ScrollView>
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
