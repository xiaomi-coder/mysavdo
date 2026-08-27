import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import {
  Screen, Card, Txt, Tap, Header, Row, Toggle, SectionLabel, Icon,
} from '../ui';
import { useFeedback } from '../ui/Feedback';
import { ACCENT_LIST, R } from '../theme';
import { LANGS, useI18n } from '../i18n';

/* Sozlamalar.

   Bu yerda faqat foydalanuvchi haqiqatan o'zgartira oladigan narsa
   turadi. Ishlamaydigan o'chirgich qo'yilmagan — u ilovaga bo'lgan
   ishonchni yo'qotadi. */

const PREFS_KEY = 'mb.prefs';

export default function Settings({ navigation }) {
  const { t, mode, accent, toggleMode, setAccent } = useTheme();
  const { lang, setLang } = useI18n();
  const { user } = useAuth();
  const { notify } = useFeedback();

  const [prefs, setPrefs] = useState({ notif: true, sound: true });

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then((raw) => {
      if (raw) { try { setPrefs((p) => ({ ...p, ...JSON.parse(raw) })); } catch {} }
    });
  }, []);

  const set = (k, v) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
  };

  const toggleNotif = async () => {
    if (prefs.notif) { set('notif', false); return; }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      notify('Telefon sozlamalaridan bildirishnomaga ruxsat bering', 'error');
      return;
    }
    set('notif', true);
  };

  return (
    <Screen>
      <Header title="Sozlamalar" onBack={() => navigation.goBack()} />

      <SectionLabel icon="palette">KO‘RINISH</SectionLabel>
      <Card pad={0} style={{ overflow: 'hidden', marginBottom: 16 }}>
        <Row
          first
          icon={mode === 'dark' ? 'moon' : 'sun'}
          label="Tungi rejim"
          sub="Qorong‘i mavzu — kechqurun ko‘zga yengil"
          chevron={false}
          right={<Toggle on={mode === 'dark'} onPress={toggleMode} />}
        />

        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: t.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <Icon name="palette" size={22} color={t.acc} />
            <View style={{ flex: 1 }}>
              <Txt size={15}>Asosiy rang</Txt>
              <Txt size={12} color={t.t3} style={{ marginTop: 2 }}>Ilova ohangi</Txt>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, marginLeft: 35 }}>
            {ACCENT_LIST.map((a) => (
              <Tap
                key={a.key}
                onPress={() => setAccent(a.key)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  height: 40, paddingHorizontal: 13, borderRadius: R.md,
                  borderWidth: 1,
                  borderColor: accent === a.key ? t.acc : t.line2,
                  backgroundColor: accent === a.key ? t.line : 'transparent',
                }}
              >
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: a.swatch }} />
                <Txt size={13} weight="500" color={accent === a.key ? t.acctext : t.t3}>
                  {a.label}
                </Txt>
              </Tap>
            ))}
          </View>
        </View>
      </Card>

      <SectionLabel icon="translate">TIL</SectionLabel>
      <Card pad={16} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
          <Icon name="translate" size={22} color={t.acc} />
          <View style={{ flex: 1 }}>
            <Txt size={15}>Interfeys tili</Txt>
            <Txt size={12} color={t.t3} style={{ marginTop: 2 }}>
              {LANGS.find((l) => l.key === lang)?.label}
            </Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginLeft: 35 }}>
          {LANGS.map((l) => (
            <Tap
              key={l.key}
              onPress={() => setLang(l.key)}
              style={{
                flex: 1, height: 44, borderRadius: R.md,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1,
                borderColor: lang === l.key ? t.acc : t.line2,
                backgroundColor: lang === l.key ? t.line : 'transparent',
              }}
            >
              <Txt size={13} weight="500" color={lang === l.key ? t.acctext : t.t3}>
                {l.label}
              </Txt>
            </Tap>
          ))}
        </View>
      </Card>

      <SectionLabel icon="gear">TIZIM</SectionLabel>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <Row
          first
          icon="bell"
          label="Bildirishnomalar"
          sub="Yangi buyurtma, kam qoldiq va muddati o‘tgan nasiya haqida"
          chevron={false}
          right={<Toggle on={prefs.notif} onPress={toggleNotif} />}
        />
        <Row
          icon="chat-text"
          label="Tebranish"
          sub="Sotuv yakunlanganda telefon qisqa tebranadi"
          chevron={false}
          right={<Toggle on={prefs.sound} onPress={() => set('sound', !prefs.sound)} />}
        />
        <Row
          icon="printer"
          label="Chek printer"
          sub="Chek ko‘rinishi va do‘kon ma’lumotlari"
          onPress={() => navigation.navigate('Chek')}
        />
      </Card>

      <SectionLabel icon="user" style={{ marginTop: 16 }}>HISOB</SectionLabel>
      <Card pad={14}>
        <Txt size={13} color={t.t3}>Email</Txt>
        <Txt size={15} style={{ marginTop: 2 }}>{user?.email}</Txt>
        <Txt size={13} color={t.t3} style={{ marginTop: 12 }}>Parolni o‘zgartirish</Txt>
        <Txt size={12} color={t.t4} style={{ marginTop: 2, lineHeight: 17 }}>
          Parolni do‘kon egasi kompyuterdagi Xodimlar bo‘limidan o‘zgartiradi
        </Txt>
      </Card>
    </Screen>
  );
}
