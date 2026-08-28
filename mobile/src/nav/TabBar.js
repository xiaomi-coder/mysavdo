import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { Tap } from '../ui/base';
import { useTr } from '../i18n';
import Icon from '../ui/Icon';
import { buzz } from '../ui/Feedback';

/* Pastki navigatsiya.

   Beshta bo'lim: Asosiy, Sotuv, Ombor, Buyurtma, Yana. Ko'proq
   bo'lim sig'dirish mumkin edi, lekin bosh barmoq bilan aniq
   tegish uchun beshtadan ortiq bo'lmagani ma'qul — qolgani "Yana"
   ichida.

   Faol bo'lim uch belgidan bilinadi: to'ldirilgan belgi, akcent
   rang va belgining 2px yuqoriga ko'tarilishi. Faqat rang bilan
   ajratish yorug'da ko'rinmay qoladi. */

export default function TabBar({ state, descriptors, navigation, badges = {} }) {
  const { t } = useTheme();
  const tr = useTr();
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: t.nav,
      borderTopWidth: 1,
      borderTopColor: t.line,
      paddingTop: 6,
      paddingHorizontal: 6,
      paddingBottom: Math.max(insets.bottom, 10),
    }}>
      {state.routes.map((route, i) => {
        const { options } = descriptors[route.key];
        const active = state.index === i;
        const badge = badges[route.name];

        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (e.defaultPrevented) return;
          if (!active) buzz('tap');

          /* Bo'lim ichida ekranlar bo'lsa (masalan "Yana" → Sozlamalar),
             doim uning eng boshiga qaytamiz. Aks holda foydalanuvchi
             "Yana" ni bossa ro'yxat emas, oxirgi ochgan ekrani chiqadi. */
          const nested = route.state ?? navigation.getState().routes[i]?.state;
          if (nested && nested.routes?.length > 1) {
            navigation.navigate(route.name, { screen: nested.routeNames[0], merge: false });
            return;
          }
          navigation.navigate(route.name);
        };

        const color = active ? t.acc : t.t4;

        return (
          <Tap
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={active ? { selected: true } : {}}
            accessibilityLabel={options.title || route.name}
            activeStyle={{ opacity: 0.6 }}
            style={{ flex: 1, alignItems: 'center', paddingTop: 6, minHeight: 48 }}
          >
            <View style={{ transform: [{ translateY: active ? -2 : 0 }] }}>
              <Icon name={options.tabIcon} size={24} color={color} fill={active} />
            </View>

            <Text style={{ fontSize: 10.5, fontWeight: '500', color, marginTop: 2 }}>
              {tr(options.title || route.name)}
            </Text>

            {/* Faol bo'lim ostidagi nuqta */}
            <View style={{
              width: 4, height: 4, borderRadius: 2, marginTop: 2,
              backgroundColor: active ? t.acc : 'transparent',
            }} />

            {badge > 0 ? (
              <View style={{
                position: 'absolute', top: 1, right: '22%',
                minWidth: 17, height: 17, borderRadius: 9,
                backgroundColor: t.err, borderWidth: 2, borderColor: t.nav,
                alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
              }}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                  {badge > 99 ? '99+' : badge}
                </Text>
              </View>
            ) : null}
          </Tap>
        );
      })}
    </View>
  );
}
