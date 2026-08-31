import React, { useState } from 'react';
import { View, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { useCart } from '../CartContext';
import { Screen, Card, Txt, Row, Icon, Avatar, Btn } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { useTr } from '../i18n';
import { API_URL } from '../lib/api';
import { initials } from '../lib/format';
import DaySheet from '../sheets/DaySheet';

/* "Yana" bo'limi — pastki panelga sig'magan hamma narsa.

   Ro'yxat rolga qarab qisqaradi: sotuvchi moliyani ko'rmasligi kerak,
   lekin tugma butunlay yo'qolib ketsa "menda nega yo'q" degan savol
   tug'iladi. Shuning uchun ko'rinadi, lekin qulf belgisi bilan. */

export default function More({ navigation }) {
  const { t } = useTheme();
  const { user, store, signOut, isOwner, can } = useAuth();
  const d = useData();
  const cart = useCart();
  const { notify } = useFeedback();
  const tr = useTr();
  const [daySheet, setDaySheet] = useState(false);

  const version = Constants.expoConfig?.version || '1.0.0';
  // IMEI/qulflash bo'limlari faqat telefon do'konida ma'noga ega
  const isPhoneStore = store?.store_type === 'phone';

  const logout = () => {
    Alert.alert(tr('Chiqish'), tr('Hisobdan chiqasizmi?'), [
      { text: tr('Bekor qilish'), style: 'cancel' },
      { text: tr('Chiqish'), style: 'destructive', onPress: signOut },
    ]);
  };

  const items = [
    isOwner && { icon: 'cash-register', label: 'Kunni yopish', onPress: () => setDaySheet(true) },
    { icon: 'users', label: 'Mijozlar (CRM)', onPress: () => navigation.navigate('Mijozlar') },
    { icon: 'handshake', label: 'Nasiya', onPress: () => navigation.navigate('Nasiya'),
      badge: d.alerts.overdue.length },
    isOwner && isPhoneStore && {
      icon: 'lock',
      label: 'Kredit telefonlar',
      sub: 'Nasiya telefonni masofadan qulflash',
      onPress: () => navigation.navigate('KreditQulf'),
    },
    { icon: 'chart', label: 'Moliya', lock: !can('finance'),
      onPress: () => navigation.navigate('Moliya') },
    isOwner && { icon: 'file-text', label: 'Hisobotlar', onPress: () => navigation.navigate('Hisobot') },
    isOwner && {
      icon: 'sparkle',
      label: 'AI Analitika',
      sub: 'Prognoz, tugash xavfi, foyda tahlili',
      onPress: () => navigation.navigate('Analitika'),
    },
    isOwner && {
      icon: 'truck',
      label: 'Ta’minotchilar',
      sub: 'Kimdan olamiz, kimga qarzimiz bor',
      onPress: () => navigation.navigate('Taminotchilar'),
    },
    isOwner && {
      icon: 'user-gear',
      label: 'Xodimlar',
      sub: 'Sotuvchilar va ularning ruxsatlari',
      onPress: () => navigation.navigate('Xodimlar'),
    },
    { icon: 'printer', label: 'Chek printer', onPress: () => navigation.navigate('Chek') },
    isOwner && store?.slug && {
      icon: 'globe',
      label: 'Onlayn do‘kon',
      sub: `${store.slug}.mybazzar.uz`,
      onPress: () => Linking.openURL(`https://${store.slug}.mybazzar.uz`),
    },
    { icon: 'gear', label: 'Sozlamalar', onPress: () => navigation.navigate('Sozlamalar') },
  ].filter(Boolean);

  return (
    <Screen>
      <Txt size={17} weight="500" style={{ marginBottom: 12 }}>Yana</Txt>

      {/* Kim kirgan */}
      <Card pad={14} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Avatar text={initials(user?.name)} size={46} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt size={15} weight="500" numberOfLines={1}>{user?.name || 'Foydalanuvchi'}</Txt>
          <Txt size={12} color={t.t3} numberOfLines={1}>
            {roleLabel(user?.role)}{store?.name ? ` · ${store.name}` : ''}
          </Txt>
        </View>
      </Card>

      {/* Yuborilmagan sotuvlar */}
      {cart.queue.length > 0 ? (
        <Card border={t.warn} pad={13} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="cloud" size={20} color={t.warn} />
            <View style={{ flex: 1 }}>
              <Txt size={14} weight="500" color={t.warn}>
                {cart.queue.length} ta sotuv yuborilmagan
              </Txt>
              <Txt size={11} color={t.t3} style={{ marginTop: 2, lineHeight: 16 }}>
                Internet kelganda o‘zi yuboriladi
              </Txt>
            </View>
            <Btn
              title="Hozir yubor"
              size="sm"
              onPress={async () => {
                const r = await cart.flushQueue();
                notify(r.sent > 0 ? `${r.sent} ta sotuv yuborildi` : 'Internet yo‘q',
                  r.sent > 0 ? 'ok' : 'error');
              }}
            />
          </View>
        </Card>
      ) : null}

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {items.map((it, i) => (
          <Row
            key={it.label}
            first={i === 0}
            icon={it.icon}
            label={it.label}
            sub={it.sub}
            lock={it.lock}
            onPress={it.onPress}
            right={it.badge > 0 ? (
              <View style={{
                minWidth: 20, height: 20, borderRadius: 10, backgroundColor: t.err,
                alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
              }}>
                <Txt size={11} weight="600" color="#fff">{it.badge}</Txt>
              </View>
            ) : null}
          />
        ))}
        <Row
          icon="sign-out"
          iconColor={t.err}
          label="Chiqish"
          onPress={logout}
          chevron={false}
        />
      </Card>

      <Txt size={12} color={t.t4} style={{ textAlign: 'center', marginTop: 18 }}>
        MyBazzar v{version}{store?.name ? ` · ${store.name}` : ''}
      </Txt>
      <Txt size={11} color={t.t4} style={{ textAlign: 'center', marginTop: 3 }}>
        {API_URL.replace('https://', '')}
      </Txt>

      {daySheet && <DaySheet onClose={() => setDaySheet(false)} />}
    </Screen>
  );
}

const roleLabel = (r) => ({
  owner: 'Do‘kon egasi', creator: 'Administrator', admin: 'Administrator',
  cashier: 'Sotuvchi', manager: 'Menejer',
}[r] || 'Xodim');
