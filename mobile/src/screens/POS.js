import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { useCart } from '../CartContext';
import {
  Screen, Txt, Tap, Btn, Icon, SearchBar, PhotoBox, EmptyState, Skeleton,
} from '../ui';
import { useFeedback, buzz } from '../ui/Feedback';
import { money } from '../lib/format';
import { stockStatus, variantColor } from '../lib/stock';
import { R } from '../theme';
import CartSheet from '../sheets/CartSheet';
import CalcSheet from '../sheets/CalcSheet';
import QuickPickSheet from '../sheets/QuickPickSheet';

/* ══════════════════════════════════════════════════════════════════════════
   Sotuv ekrani

   Tartib sotuvchining tezligiga qarab tuzilgan:

   1. TEZ SOTUV — kuniga o'nlab marta sotiladigan 6 ta tovar. Bitta
      tegish bilan savatga tushadi. Uzoq bosilsa boshqasiga almashadi.
   2. SKANER — barcode bor tovar uchun eng tez yo'l.
   3. QIDIRUV va ro'yxat — qolgan hamma narsa uchun.

   Savat pastda yopishib turadi va butun ekranni egallamaydi — sotuvchi
   savatga qarab turib yana tovar qo'sha oladi.
   ══════════════════════════════════════════════════════════════════════ */

const QUICK_KEY = 'mb.quickSlots';
const QUICK_COUNT = 6;

export default function POS({ navigation }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const d = useData();
  const cart = useCart();
  const { notify } = useFeedback();

  const [q, setQ] = useState('');
  const [sheet, setSheet] = useState(null);       // 'cart' | 'calc' | 'quick'
  const [quickSlot, setQuickSlot] = useState(0);
  const [quickIds, setQuickIds] = useState([]);

  /* Tez sotuv tugmalari qurilmada saqlanadi — har do'konda boshqa
     tovar tez sotiladi, buni server bilishi shart emas. */
  useEffect(() => {
    AsyncStorage.getItem(QUICK_KEY).then((raw) => {
      if (raw) { try { setQuickIds(JSON.parse(raw)); } catch {} }
    });
  }, []);

  const saveQuick = useCallback((ids) => {
    setQuickIds(ids);
    AsyncStorage.setItem(QUICK_KEY, JSON.stringify(ids)).catch(() => {});
  }, []);

  /* Tanlanmagan o'rinlar eng ko'p sotilgan tovarlar bilan to'ldiriladi —
     ilova birinchi kundan foydali bo'lsin. */
  const quick = useMemo(() => {
    const byId = new Map(d.products.map((p) => [p.id, p]));
    const chosen = quickIds.map((id) => byId.get(id)).filter(Boolean);
    if (chosen.length >= QUICK_COUNT) return chosen.slice(0, QUICK_COUNT);

    const counts = new Map();
    d.transactions.slice(0, 120).forEach((tx) => {
      (Array.isArray(tx.items) ? tx.items : []).forEach((it) => {
        counts.set(it.id, (counts.get(it.id) || 0) + (it.qty || 1));
      });
    });
    const used = new Set(chosen.map((p) => p.id));
    const rest = d.products
      .filter((p) => !used.has(p.id) && (p.stock ?? 0) > 0)
      .sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0));

    return [...chosen, ...rest].slice(0, QUICK_COUNT);
  }, [quickIds, d.products, d.transactions]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return d.products;
    return d.products.filter((p) =>
      (p.name || '').toLowerCase().includes(s) ||
      (p.barcode || '').includes(s) ||
      (p.phone_imei1 || '').includes(s) ||
      (p.category || '').toLowerCase().includes(s)
    );
  }, [q, d.products]);

  const addToCart = (p) => {
    if ((p.stock ?? 0) <= 0) {
      notify(`${p.name} tugagan`, 'error');
      return;
    }
    const inCart = cart.items.find((x) => x.id === p.id)?.qty || 0;
    if (inCart >= p.stock) {
      notify(`Omborda faqat ${p.stock} dona bor`, 'error');
      return;
    }
    buzz('tap');
    cart.add(p);
  };

  return (
    <>
      <Screen scroll bottomPad={cart.items.length ? 110 : 24}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 10,
        }}>
          <Txt size={17} weight="500">Sotuv</Txt>
          <Btn
            title="Tarix"
            icon="history"
            size="sm"
            variant="secondary"
            onPress={() => navigation.navigate('Tarix')}
          />
        </View>

        {/* ── Tez sotuv ── */}
        {quick.length > 0 ? (
          <>
            <View style={{
              flexDirection: 'row', alignItems: 'baseline',
              justifyContent: 'space-between', marginBottom: 8,
            }}>
              <Txt size={13} weight="500" color={t.t2}>Tez sotuv</Txt>
              <Txt size={11} color={t.t4}>uzoq bosib almashtiring</Txt>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16, marginBottom: 12 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
              {quick.map((p, i) => (
                <Tap
                  key={p.id}
                  onPress={() => addToCart(p)}
                  onLongPress={() => { buzz('warn'); setQuickSlot(i); setSheet('quick'); }}
                  activeStyle={{ borderColor: t.accdim, transform: [{ scale: 0.96 }] }}
                  style={{
                    width: 106, backgroundColor: t.card,
                    borderWidth: 1, borderColor: t.line, borderRadius: R.md,
                    paddingVertical: 9, paddingHorizontal: 10,
                  }}
                >
                  <Txt size={12.5} weight="500" numberOfLines={2} style={{ height: 32, lineHeight: 16 }}>
                    {p.name}
                  </Txt>
                  <Txt size={13} weight="600" color={t.acctext} style={{ marginTop: 4 }}>
                    {money(p.price)}
                  </Txt>
                </Tap>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* ── Skaner / qidiruv / kalkulyator ── */}
        <View style={{
          borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.accdim,
          borderRadius: R.lg, padding: 14, gap: 10, marginBottom: 12,
        }}>
          <Btn
            title="Barcode skanerlash"
            icon="barcode"
            size="lg"
            full
            onPress={() => navigation.navigate('Scanner', { mode: 'sale' })}
          />
          <SearchBar
            value={q}
            onChangeText={setQ}
            placeholder="Tovar nomi bo‘yicha qidirish"
          />
          <Btn
            title="Summa kiritish — narxsiz tovar"
            icon="calculator"
            variant="secondary"
            onPress={() => setSheet('calc')}
            full
          />
        </View>

        {/* ── Tovar ro'yxati ── */}
        {d.loading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={170} style={{ width: '48%' }} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="Hech narsa topilmadi"
            text={q ? 'Boshqa so‘z bilan qidirib ko‘ring' : 'Omborda hali tovar yo‘q'}
            action={q ? <Btn title="Qidiruvni tozalash" variant="secondary" onPress={() => setQ('')} /> : null}
          />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {filtered.map((p) => {
              const st = stockStatus(p);
              const out = (p.stock ?? 0) <= 0;
              return (
                <Tap
                  key={p.id}
                  onPress={() => addToCart(p)}
                  activeStyle={{ transform: [{ scale: 0.97 }] }}
                  style={{
                    width: '48.4%', backgroundColor: t.card,
                    borderWidth: 1, borderColor: t.line, borderRadius: R.lg,
                    padding: 10, opacity: out ? 0.5 : 1,
                  }}
                >
                  <PhotoBox uri={p.photo_url} emoji={p.image} width="100%" height={84} radius={8} />
                  <Txt size={14} weight="500" numberOfLines={2}
                    style={{ minHeight: 36, lineHeight: 18, marginTop: 8 }}>
                    {p.name}
                  </Txt>
                  <Txt size={15} weight="600" style={{ marginTop: 4 }}>{money(p.price)}</Txt>
                  <Txt size={11} weight="500" color={variantColor(t, st.variant)} style={{ marginTop: 3 }}>
                    {st.label}{st.key !== 'out' && !p.phone_imei1 ? ` · ${p.stock} dona` : ''}
                  </Txt>
                </Tap>
              );
            })}
          </View>
        )}
      </Screen>

      {/* ── Savat paneli ── */}
      {cart.items.length > 0 ? (
        <CartBar
          count={cart.totals.count}
          total={cart.totals.total}
          onPress={() => setSheet('cart')}
          bottom={insets.bottom}
        />
      ) : null}

      <CartSheet visible={sheet === 'cart'} onClose={() => setSheet(null)} navigation={navigation} />
      {sheet === 'calc' && <CalcSheet onClose={() => setSheet(null)} />}
      {sheet === 'quick' && <QuickPickSheet
        slot={quickSlot}
        current={quick[quickSlot]}
        onClose={() => setSheet(null)}
        onPick={(p) => {
          const ids = [...quick.map((x) => x.id)];
          ids[quickSlot] = p.id;
          saveQuick(ids);
          setSheet(null);
          notify(`${p.name} — ${quickSlot + 1}-o‘ringa qo‘yildi`);
        }}
      />}
    </>
  );
}

/* Savat paneli — pastda yopishib turadi. Tovar qo'shilganda soni
   sakraydi, shunda sotuvchi qo'shilganini ko'radi. */
function CartBar({ count, total, onPress, bottom }) {
  const { t } = useTheme();
  const pop = React.useState(() => new Animated.Value(1))[0];
  const up = React.useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    Animated.spring(up, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 220 }).start();
  }, [up]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pop, { toValue: 1.25, duration: 120, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, damping: 10, stiffness: 300 }),
    ]).start();
  }, [count, pop]);

  return (
    <Animated.View style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      transform: [{ translateY: up.interpolate({ inputRange: [0, 1], outputRange: [90, 0] }) }],
    }}>
      <Tap
        onPress={onPress}
        activeStyle={{ opacity: 0.85 }}
        style={{
          backgroundColor: t.inset,
          borderTopWidth: 1, borderTopColor: t.accdim,
          paddingTop: 6, paddingHorizontal: 18,
          paddingBottom: 14 + bottom,
          shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 30,
          shadowOffset: { width: 0, height: -8 }, elevation: 12,
        }}
      >
        <View style={{ alignItems: 'center', paddingVertical: 4 }}>
          <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: t.line2 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View>
              <Icon name="shopping-cart" size={24} color={t.acc} fill />
              <Animated.View style={{
                position: 'absolute', top: -7, right: -9,
                minWidth: 17, height: 17, borderRadius: 9,
                backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center',
                paddingHorizontal: 4, transform: [{ scale: pop }],
              }}>
                <Txt size={11} weight="600" color={t.shell}>{count}</Txt>
              </Animated.View>
            </View>
            <Txt size={15} weight="500">{count} dona · {money(total)} so‘m</Txt>
          </View>
          <Icon name="caret-up" size={20} color={t.t3} />
        </View>
      </Tap>
    </Animated.View>
  );
}
