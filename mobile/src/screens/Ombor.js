import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, ScrollView, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import {
  Screen, Txt, Tap, Btn, Chip, Icon, SearchBar, PhotoBox,
  EmptyState, Skeleton, Checkbox,
} from '../ui';
import { buzz } from '../ui/Feedback';
import { money } from '../lib/format';
import { stockStatus, variantColor, isLowStock, isOutOfStock } from '../lib/stock';
import { R } from '../theme';
import KirimSheet from '../sheets/KirimSheet';
import EditSheet from '../sheets/EditSheet';
import AddSheet from '../sheets/AddSheet';
import StikerSheet from '../sheets/StikerSheet';
import HistorySheet from '../sheets/HistorySheet';

/* ══════════════════════════════════════════════════════════════════════════
   Ombor

   Qatorni chapga surtsangiz ostidan ikki tugma chiqadi — tahrirlash va
   barcode. Ular qatorda doim turgan bo'lsa ekran to'lib ketardi, chunki
   asosiy tugma "Kirim" — u eng ko'p bosiladi.

   "Stiker" rejimida qatorlar belgilanadigan bo'lib qoladi va bir yo'la
   o'nlab tovarga narx yorlig'i chop etiladi.
   ══════════════════════════════════════════════════════════════════════ */

export default function Ombor({ navigation, route }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const d = useData();
  const { can } = useAuth();

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [selMode, setSelMode] = useState(false);
  const [sel, setSel] = useState({});
  const [sheet, setSheet] = useState(null);      // {type, product}
  const [refreshing, setRefreshing] = useState(false);

  /* Bosh ekrandagi ogohlantirishdan kelinsa — o'sha filtr bilan ochamiz */
  useEffect(() => {
    const f = route?.params?.filter;
    if (f) { setFilter(f); navigation.setParams({ filter: undefined }); }
  }, [route?.params?.filter]);

  const categories = useMemo(() => {
    const set = new Map();
    d.products.forEach((p) => {
      if (p.category) set.set(p.category, (set.get(p.category) || 0) + 1);
    });
    return [...set.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [d.products]);

  const chips = useMemo(() => ([
    { key: 'all', label: 'Hammasi', count: d.products.length },
    { key: 'low', label: 'Kam qoldiq', count: d.products.filter(isLowStock).length, color: t.warn },
    { key: 'out', label: 'Tugagan', count: d.products.filter(isOutOfStock).length, color: t.err },
    ...categories.map(([name, n]) => ({ key: `cat:${name}`, label: name, count: n })),
  ]), [d.products, categories, t]);

  const filtered = useMemo(() => {
    let list = d.products;
    if (filter === 'low') list = list.filter(isLowStock);
    else if (filter === 'out') list = list.filter(isOutOfStock);
    else if (filter.startsWith('cat:')) {
      const c = filter.slice(4);
      list = list.filter((p) => p.category === c);
    }
    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(s) ||
        (p.barcode || '').includes(s) ||
        (p.phone_imei1 || '').includes(s)
      );
    }
    return list;
  }, [d.products, filter, q]);

  const selCount = Object.values(sel).filter(Boolean).length;
  const selected = filtered.filter((p) => sel[p.id]);

  const toggleSel = (id) => setSel((s) => ({ ...s, [id]: !s[id] }));

  const exitSel = () => { setSelMode(false); setSel({}); };

  const refresh = async () => {
    setRefreshing(true);
    await d.reload({ silent: true });
    setRefreshing(false);
  };

  return (
    <>
      <Screen
        onRefresh={refresh}
        refreshing={refreshing}
        bottomPad={selMode ? 90 : 90}
      >
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 12,
        }}>
          <Txt size={17} weight="500">Ombor</Txt>
          <Btn
            title={selMode ? 'Bekor qilish' : 'Stiker'}
            icon={selMode ? 'x' : 'barcode'}
            size="sm"
            variant={selMode ? 'primary' : 'secondary'}
            onPress={() => (selMode ? exitSel() : setSelMode(true))}
          />
        </View>

        <SearchBar value={q} onChangeText={setQ} style={{ marginBottom: 10 }} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -16, marginBottom: 12 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {chips.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              count={c.count}
              color={c.color}
              active={filter === c.key}
              onPress={() => setFilter(c.key)}
            />
          ))}
        </ScrollView>

        {d.loading ? (
          <View style={{ gap: 10 }}>
            {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={78} />)}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="package"
            title="Hech narsa topilmadi"
            text="Qidiruv yoki filtrni o‘zgartiring"
            action={(q || filter !== 'all') ? (
              <Btn title="Tozalash" variant="secondary" onPress={() => { setQ(''); setFilter('all'); }} />
            ) : null}
          />
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                selMode={selMode}
                selected={Boolean(sel[p.id])}
                onSelect={() => toggleSel(p.id)}
                onKirim={() => setSheet({ type: 'kirim', product: p })}
                onEdit={() => setSheet({ type: 'edit', product: p })}
                onBarcode={() => setSheet({ type: 'stiker', products: [p] })}
                onOpen={() => setSheet({ type: 'history', product: p })}
              />
            ))}
          </View>
        )}
      </Screen>

      {/* Yangi tovar tugmasi */}
      {!selMode && can('inventory') ? (
        <Tap
          onPress={() => setSheet({ type: 'add' })}
          activeStyle={{ transform: [{ scale: 0.94 }] }}
          style={{
            position: 'absolute', right: 16, bottom: insets.bottom + 18,
            width: 58, height: 58, borderRadius: 29,
            backgroundColor: t.line, borderWidth: 1, borderColor: t.acc,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 }, elevation: 8,
          }}
        >
          <Icon name="plus" size={26} color={t.acctext} />
        </Tap>
      ) : null}

      {/* Stiker rejimi paneli */}
      {selMode ? (
        <View style={{
          position: 'absolute', left: 12, right: 12, bottom: insets.bottom + 14,
          backgroundColor: t.nav, borderWidth: 1, borderColor: t.accdim,
          borderRadius: R.xl, padding: 10,
          flexDirection: 'row', alignItems: 'center', gap: 8,
          shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 }, elevation: 10,
        }}>
          <Txt size={14} weight="500" style={{ flex: 1 }}>{selCount} tovar</Txt>
          <Btn
            title="Hammasi"
            size="sm"
            variant="secondary"
            onPress={() => {
              const all = selCount === filtered.length;
              setSel(all ? {} : Object.fromEntries(filtered.map((p) => [p.id, true])));
            }}
          />
          <Btn
            title="Chop etish"
            icon="printer"
            size="sm"
            disabled={selCount === 0}
            onPress={() => setSheet({ type: 'stiker', products: selected })}
          />
        </View>
      ) : null}

      {/* Oynalar faqat ochilganda quriladi — shunda ichidagi maydonlar
          har safar tozalanadi va oldingi tovarning qiymati ko'rinib
          ketmaydi. */}
      {sheet?.type === 'kirim' && (
        <KirimSheet product={sheet.product} onClose={() => setSheet(null)} />
      )}
      {sheet?.type === 'edit' && (
        <EditSheet product={sheet.product} onClose={() => setSheet(null)} />
      )}
      {sheet?.type === 'add' && (
        <AddSheet onClose={() => setSheet(null)} navigation={navigation} />
      )}
      {sheet?.type === 'stiker' && (
        <StikerSheet
          products={sheet.products || []}
          onClose={() => { setSheet(null); exitSel(); }}
        />
      )}
      {sheet?.type === 'history' && (
        <HistorySheet product={sheet.product} onClose={() => setSheet(null)} />
      )}
    </>
  );
}

/* ── Qator: chapga surtilsa tugmalar chiqadi ──────────────────────────── */
const REVEAL = 132;

function ProductRow({ product: p, selMode, selected, onSelect, onKirim, onEdit, onBarcode, onOpen }) {
  const { t } = useTheme();
  const x = useState(() => new Animated.Value(0))[0];
  const open = useRef(false);

  const settle = (to) => {
    open.current = to !== 0;
    Animated.spring(x, { toValue: to, useNativeDriver: true, damping: 22, stiffness: 260 }).start();
  };

  useEffect(() => { if (selMode) settle(0); }, [selMode]);

  const [pan] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !selMode && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
      onPanResponderMove: (_, g) => {
        const base = open.current ? -REVEAL : 0;
        const next = Math.min(0, Math.max(-REVEAL, base + g.dx));
        x.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const base = open.current ? -REVEAL : 0;
        const end = base + g.dx;
        settle(end < -REVEAL / 2 ? -REVEAL : 0);
      },
    })
  );

  const st = stockStatus(p);

  return (
    <View style={{ borderRadius: R.lg, overflow: 'hidden' }}>
      {/* Ostidagi tugmalar */}
      <View style={{
        ...StyleSheetAbsolute, flexDirection: 'row', justifyContent: 'flex-end',
        backgroundColor: t.inset,
      }}>
        <Tap
          onPress={() => { settle(0); onEdit(); }}
          style={{ width: 66, alignItems: 'center', justifyContent: 'center', gap: 3 }}
        >
          <Icon name="pencil" size={20} color={t.blue} />
          <Txt size={10} color={t.blue}>Tahrir</Txt>
        </Tap>
        <Tap
          onPress={() => { settle(0); onBarcode(); }}
          style={{ width: 66, alignItems: 'center', justifyContent: 'center', gap: 3 }}
        >
          <Icon name="barcode" size={20} color={t.acc} />
          <Txt size={10} color={t.acc}>Barcode</Txt>
        </Tap>
      </View>

      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }] }}>
        <Tap
          onPress={selMode ? onSelect : onOpen}
          activeStyle={{ opacity: 0.85 }}
          style={{
            backgroundColor: t.card, borderWidth: 1,
            borderColor: selected ? t.acc : t.line,
            borderRadius: R.lg, padding: 10,
            flexDirection: 'row', alignItems: 'center', gap: 10,
          }}
        >
          {selMode ? <Checkbox on={selected} /> : null}
          <PhotoBox uri={p.photo_url} emoji={p.image} size={56} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={14} weight="500" numberOfLines={1}>{p.name}</Txt>
            <Txt size={14} weight="600" style={{ marginTop: 2 }}>
              {money(p.price)} <Txt size={12} color={t.t4}>so‘m</Txt>
            </Txt>
            <Txt size={12} weight="500" color={variantColor(t, st.variant)} style={{ marginTop: 2 }}>
              {st.label}{!p.phone_imei1 ? ` · ${p.stock} dona` : ''}
            </Txt>
          </View>
          {!selMode ? (
            <Btn title="Kirim" size="md" variant="soft" onPress={() => { buzz('tap'); onKirim(); }} />
          ) : null}
        </Tap>
      </Animated.View>
    </View>
  );
}

const StyleSheetAbsolute = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 };
