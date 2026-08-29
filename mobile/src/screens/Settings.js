import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import {
  Screen, Card, Txt, Tap, Btn, Header, Row, Toggle, SectionLabel, Icon,
} from '../ui';
import { useFeedback } from '../ui/Feedback';
import { ACCENT_LIST, R, alpha } from '../theme';
import { LANGS, useI18n } from '../i18n';
import { db } from '../lib/api';
import { Linking } from 'react-native';

/* Sozlamalar.

   Bu yerda faqat foydalanuvchi haqiqatan o'zgartira oladigan narsa
   turadi. Ishlamaydigan o'chirgich qo'yilmagan — u ilovaga bo'lgan
   ishonchni yo'qotadi. */

const PREFS_KEY = 'mb.prefs';

/* Do'kon odatda kunduzi yopilmaydi — ro'yxatni shu oraliq bilan
   cheklaymiz, 24 ta tugma orasidan tanlash noqulay. */
const HOURS = [15, 16, 17, 18, 19, 20, 21, 22, 23];

export default function Settings({ navigation }) {
  const { t, mode, accent, toggleMode, setAccent } = useTheme();
  const { lang, setLang } = useI18n();
  const { user } = useAuth();
  const { notify } = useFeedback();

  const [prefs, setPrefs] = useState({ notif: true, sound: true });
  const [tgChats, setTgChats] = useState([]);
  const [tgCode, setTgCode] = useState('');
  const [tgBusy, setTgBusy] = useState(false);

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

  /* Telegram bot — ilovada push yo'q, xabar Telegram orqali keladi */
  const loadTg = React.useCallback(async () => {
    if (!user?.store_id) return;
    const { data } = await db.from('telegram_chats').select('*').eq('store_id', user.store_id);
    setTgChats(data || []);
  }, [user?.store_id]);

  useEffect(() => { loadTg(); }, [loadTg]);

  const makeTgCode = async () => {
    setTgBusy(true);
    const { data, error } = await db.rpc('make_telegram_code', {
      p_store: user.store_id, p_user: user.id, p_role: 'owner',
    });
    setTgBusy(false);
    if (error) { notify(error.message, 'error'); return; }
    setTgCode(String(data));
  };

  const setTgHour = async (chatId, hour) => {
    setTgChats((l) => l.map((c) => (c.chat_id === chatId ? { ...c, digest_hour: hour } : c)));
    const { error } = await db.from('telegram_chats')
      .update({ digest_hour: hour }).eq('chat_id', chatId);
    if (error) { notify(error.message, 'error'); loadTg(); return; }
    notify(`Kun yakuni ${String(hour).padStart(2, '0')}:00 da keladi`, 'ok');
  };

  const unlinkTg = async (chatId) => {
    const { error } = await db.from('telegram_chats').delete().eq('chat_id', chatId);
    if (error) { notify(error.message, 'error'); return; }
    notify('Uzildi');
    loadTg();
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

      <SectionLabel icon="chat-text">TELEGRAM BOT</SectionLabel>
      <Card pad={16} style={{ marginBottom: 16 }}>
        <Txt size={12.5} color={t.t3} style={{ lineHeight: 18 }}>
          Yangi buyurtma tushganda darhol xabar keladi. Har kuni kechqurun
          kunlik xulosa yuboriladi. Botdan hisobot ham so‘rash mumkin.
        </Txt>

        {tgChats.map((c) => (
          <View key={c.chat_id} style={{
            marginTop: 12, padding: 11, borderRadius: R.md,
            backgroundColor: alpha(t.okRgb, 0.12),
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon name="check-circle" size={18} color={t.ok} fill />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt size={13.5}>{c.name || 'Telegram'}</Txt>
                {c.username ? <Txt size={11.5} color={t.t4}>@{c.username}</Txt> : null}
              </View>
              <Tap onPress={() => unlinkTg(c.chat_id)} hit={10}>
                <Txt size={12} color={t.err}>Uzish</Txt>
              </Tap>
            </View>

            {/* Kun yakuni qachon kelsin. Do'konlar har xil yopiladi —
                yopilmasdan kelgan xulosa noto'g'ri raqam beradi. */}
            <View style={{
              marginTop: 10, paddingTop: 10,
              borderTopWidth: 1, borderTopColor: t.line,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                <Icon name="clock" size={16} color={t.t4} />
                <View style={{ flex: 1 }}>
                  <Txt size={12.5} color={t.t2}>Kun yakuni qachon kelsin</Txt>
                  <Txt size={11} color={t.t4} style={{ marginTop: 1 }}>
                    Do‘kon yopilgandan keyingi vaqt
                  </Txt>
                </View>
                <Txt size={16} weight="600" color={t.acctext}>
                  {String(c.digest_hour ?? 21).padStart(2, '0')}:00
                </Txt>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
                contentContainerStyle={{ gap: 6 }}
              >
                {HOURS.map((h) => {
                  const on = (c.digest_hour ?? 21) === h;
                  return (
                    <Tap
                      key={h}
                      onPress={() => setTgHour(c.chat_id, h)}
                      style={{
                        width: 52, height: 38, borderRadius: R.sm,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: on ? t.acc : t.line2,
                        backgroundColor: on ? t.line : 'transparent',
                      }}
                    >
                      <Txt size={13} weight={on ? '600' : '400'}
                        color={on ? t.acctext : t.t3}>
                        {String(h).padStart(2, '0')}:00
                      </Txt>
                    </Tap>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        ))}

        {tgCode ? (
          <View style={{
            marginTop: 12, padding: 14, borderRadius: R.md,
            borderWidth: 1, borderColor: t.acc, backgroundColor: alpha(t.accRgb, 0.1),
          }}>
            <Txt size={12} color={t.t3}>Bog‘lash kodi</Txt>
            <Txt size={34} weight="700" color={t.acctext}
              style={{ letterSpacing: 6, marginTop: 2 }}>{tgCode}</Txt>
            <Txt size={12.5} color={t.t3} style={{ marginTop: 8, lineHeight: 18 }}>
              1. Telegramda @MyBazzaruzbot ni oching
            </Txt>
            <Txt size={12.5} color={t.t3} style={{ lineHeight: 18 }}>
              2. Start tugmasini bosing
            </Txt>
            <Txt size={12.5} color={t.t3} style={{ lineHeight: 18 }}>
              3. Shu kodni yuboring
            </Txt>
            <Btn
              title="Botni ochish"
              icon="arrow-right"
              variant="soft"
              size="sm"
              style={{ marginTop: 10, alignSelf: 'flex-start' }}
              onPress={() => Linking.openURL('https://t.me/MyBazzaruzbot')}
            />
            <Txt size={11} color={t.t4} style={{ marginTop: 8 }}>
              Kod 15 daqiqa amal qiladi va bir marta ishlaydi.
            </Txt>
          </View>
        ) : (
          <Btn
            title={tgChats.length ? 'Yana bir hisob bog‘lash' : 'Telegramga bog‘lash'}
            icon="chat-text"
            full
            loading={tgBusy}
            style={{ marginTop: 12 }}
            onPress={makeTgCode}
          />
        )}
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
