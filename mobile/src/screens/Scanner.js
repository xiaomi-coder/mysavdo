import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, Easing, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { useCart } from '../CartContext';
import { Txt, Tap, Btn, Icon, PhotoBox } from '../ui';
import { buzz, useFeedback } from '../ui/Feedback';
import { money } from '../lib/format';
import { stockStatus, variantColor } from '../lib/stock';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Barcode skaner

   Kamera bir marta o'qigach darhol to'xtaydi — aks holda bitta tovar
   ketma-ket o'nlab marta qo'shilib ketadi.

   Topilgan tovar pastdan chiqadi va "Savatga qo'shish" tugmasi bosh
   barmoq yetadigan joyda turadi. Topilmasa — darhol "yangi tovar
   qo'shish" taklif qilinadi, chunki bu odatda hali kiritilmagan
   tovar bo'ladi.
   ══════════════════════════════════════════════════════════════════════ */

const TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'itf14', 'codabar', 'qr'];

export default function Scanner({ navigation, route }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const d = useData();
  const cart = useCart();
  const { notify } = useFeedback();

  const mode = route?.params?.mode || 'sale';

  const [perm, requestPerm] = useCameraPermissions();
  const [found, setFound] = useState(null);
  const [missCode, setMissCode] = useState(null);
  const [torch, setTorch] = useState(false);
  const locked = useRef(false);

  const line = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [line]);

  useEffect(() => { if (!perm?.granted) requestPerm(); }, []);

  const onScan = ({ data: code }) => {
    if (locked.current) return;
    locked.current = true;

    /* "code" rejimi: tovarni izlamaymiz, kodni chaqirgan ekranga
       qaytaramiz. Tovar kartochkasidagi barcode va IMEI shu yo'l
       bilan to'ldiriladi. */
    if (mode === 'code') {
      buzz('ok');
      navigation.navigate(route?.params?.returnTo || 'Tovar', { scanned: code });
      return;
    }

    const p = d.products.find((x) =>
      x.barcode === code || x.phone_imei1 === code || x.phone_serial === code
    );

    if (p) {
      buzz('ok');
      setFound(p);
      setMissCode(null);
    } else {
      buzz('error');
      setMissCode(code);
      setFound(null);
    }
  };

  const rescan = () => {
    setFound(null);
    setMissCode(null);
    locked.current = false;
  };

  const addToCart = () => {
    if ((found.stock ?? 0) <= 0) { notify(`${found.name} tugagan`, 'error'); return; }
    cart.add(found);
    notify(`${found.name} savatga qo‘shildi`, 'ok');
    navigation.goBack();
  };

  /* Ruxsat berilmagan holat */
  if (perm && !perm.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: t.ring, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 14 }}>
        <StatusBar barStyle="light-content" />
        <Icon name="camera" size={44} color={t.t4} />
        <Txt size={17} weight="500">Kameraga ruxsat kerak</Txt>
        <Txt size={14} color={t.t3} style={{ textAlign: 'center', lineHeight: 21 }}>
          Barcode o‘qish uchun kamera ishlatiladi. Boshqa hech narsaga tegilmaydi.
        </Txt>
        <Btn title="Ruxsat berish" size="lg" onPress={requestPerm} />
        <Btn title="Orqaga" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.ring }}>
      <StatusBar barStyle="light-content" />

      <CameraView
        style={{ ...StyleAbsolute }}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: TYPES }}
        onBarcodeScanned={found || missCode ? undefined : onScan}
      />

      {/* Qorong'i qatlam — ramka ichi ochiq qoladi */}
      <View style={{ ...StyleAbsolute, backgroundColor: 'rgba(6,7,14,.55)' }} pointerEvents="none" />

      {/* Yuqori panel */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8,
      }}>
        <Txt size={16} weight="500" color="#fff">
          {mode === 'code' ? 'Kod skaneri' : 'Skaner'}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <RoundBtn icon={torch ? 'sun' : 'moon'} onPress={() => setTorch((v) => !v)} t={t} />
          <RoundBtn icon="x" onPress={() => navigation.goBack()} t={t} />
        </View>
      </View>

      {/* Ramka */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: 258, height: 174, borderRadius: R.lg,
          borderWidth: 2, borderColor: found ? t.ok : missCode ? t.err : t.acc,
          overflow: 'hidden', backgroundColor: 'transparent',
        }}>
          {!found && !missCode ? (
            <Animated.View style={{
              position: 'absolute', left: 8, right: 8, height: 2,
              backgroundColor: t.acc,
              shadowColor: t.acc, shadowOpacity: 0.9, shadowRadius: 12,
              transform: [{ translateY: line.interpolate({ inputRange: [0, 1], outputRange: [10, 160] }) }],
            }} />
          ) : null}
        </View>

        {!found && !missCode ? (
          <Txt size={13} color="#cfd3e5" style={{ marginTop: 16 }}>
            Barcode’ni ramka ichiga tuting
          </Txt>
        ) : null}
      </View>

      {/* Topilmadi */}
      {missCode ? (
        <View style={{
          backgroundColor: t.card, borderTopLeftRadius: R.sheet, borderTopRightRadius: R.sheet,
          borderWidth: 1, borderColor: t.line, borderBottomWidth: 0,
          padding: 18, paddingBottom: insets.bottom + 20, gap: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="warning-circle" size={22} color={t.err} />
            <View style={{ flex: 1 }}>
              <Txt size={16} weight="500">Tovar topilmadi</Txt>
              <Txt size={12} color={t.t4} mono style={{ marginTop: 2 }}>{missCode}</Txt>
            </View>
          </View>
          <Btn
            title="Shu kod bilan yangi tovar qo‘shish"
            icon="plus"
            size="lg"
            full
            onPress={() => {
              navigation.goBack();
              navigation.navigate('Tovar', { scanned: missCode });
            }}
          />
          <Btn title="Qayta skanerlash" variant="secondary" full onPress={rescan} />
        </View>
      ) : null}

      {/* Topildi */}
      {found ? (
        <View style={{
          backgroundColor: t.card, borderTopLeftRadius: R.sheet, borderTopRightRadius: R.sheet,
          borderWidth: 1, borderColor: t.line, borderBottomWidth: 0,
          padding: 18, paddingBottom: insets.bottom + 20,
        }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <PhotoBox uri={found.photo_url} emoji={found.image} size={56} radius={10} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt size={16} weight="500" numberOfLines={1}>{found.name}</Txt>
              <Txt size={15} weight="600" style={{ marginTop: 2 }}>
                {money(found.price)} <Txt size={12} color={t.t4}>so‘m</Txt>
              </Txt>
              <Txt size={12} color={variantColor(t, stockStatus(found).variant)} style={{ marginTop: 1 }}>
                {stockStatus(found).label}
                {!found.phone_imei1 ? ` · ${found.stock} dona` : ''}
              </Txt>
            </View>
          </View>

          {mode === 'sale' ? (
            <Btn title="Savatga qo‘shish" size="lg" full onPress={addToCart} />
          ) : (
            <Btn title="Ochish" size="lg" full onPress={() => navigation.goBack()} />
          )}
          <Btn title="Yana skanerlash" variant="secondary" full style={{ marginTop: 10 }} onPress={rescan} />
        </View>
      ) : null}

    </View>
  );
}

function RoundBtn({ icon, onPress, t }) {
  return (
    <Tap
      onPress={onPress}
      style={{
        width: 44, height: 44, borderRadius: R.lg,
        backgroundColor: t.card, borderWidth: 1, borderColor: t.line,
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={20} color={t.t2} />
    </Tap>
  );
}

const StyleAbsolute = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
