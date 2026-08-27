import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Sheet, Txt, Btn, Icon, Stepper } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { printLabels, codeOf } from '../lib/labels';
import { Barcode } from '../lib/barcode';
import { isUnique } from '../lib/stock';
import { money } from '../lib/format';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Narx yorliqlarini chop etish — 40 × 30 mm

   Bir yo'la o'nlab tovarga yorliq chiqarish uchun. Har tovarga nusxa
   soni alohida beriladi: chexoldan 20 ta kerak bo'lishi mumkin,
   telefondan esa bitta — u baribir noyob.

   Shu sababli IMEI'li tovarga avtomatik 1 ta qo'yiladi, qolganiga
   qoldiq bo'yicha taklif qilinadi.
   ══════════════════════════════════════════════════════════════════════ */

export default function StikerSheet({ products, onClose }) {
  const { t } = useTheme();
  const { notify } = useFeedback();

  /* Nusxa soni qoldiq bo'yicha taklif qilinadi. Noyob tovarga
     (IMEI'li telefon) bittadan — u baribir bitta dona. */
  const [copies, setCopies] = useState(() => Object.fromEntries(
    (products || []).map((p) => [
      p.id,
      isUnique(p) ? 1 : Math.min(Math.max(1, p.stock || 1), 30),
    ])
  ));
  const [busy, setBusy] = useState(false);

  const total = useMemo(
    () => products.reduce((s, p) => s + (copies[p.id] || 0), 0),
    [products, copies]
  );

  const single = products.length === 1;

  const print = async () => {
    const items = products
      .filter((p) => (copies[p.id] || 0) > 0)
      .map((p) => ({
        name: p.name, price: p.price, code: codeOf(p), copies: copies[p.id],
      }));
    if (items.length === 0) return;

    setBusy(true);
    try {
      await printLabels(items);
    } catch {
      notify('Chop etib bo‘lmadi', 'error');
      setBusy(false);
      return;
    }
    setBusy(false);
    onClose?.();
  };

  if (!products?.length) return null;

  return (
    <Sheet
      visible
      onClose={onClose}
      title={single ? 'Barcode chop etish' : `Stiker chop etish — ${products.length} ta tovar`}
      sub="40 × 30 mm · barcode + nomi + narx"
    >
      {/* Bitta tovar bo'lsa yorliqning haqiqiy ko'rinishi ko'rsatiladi */}
      {single ? (
        <View style={{
          alignSelf: 'center', width: 240, backgroundColor: '#fdfdfb',
          borderRadius: 6, padding: 14, alignItems: 'center', gap: 6, marginBottom: 14,
        }}>
          <Txt size={12} weight="700" color="#1a1a1a" style={{ textAlign: 'center' }}>
            {products[0].name}
          </Txt>
          <Barcode value={codeOf(products[0])} height={46} />
          <Txt size={13} weight="700" color="#1a1a1a">{money(products[0].price)} so‘m</Txt>
        </View>
      ) : (
        <>
          <View style={{
            flexDirection: 'row', gap: 9, alignItems: 'flex-start',
            padding: 12, borderRadius: R.sm, marginBottom: 12,
            backgroundColor: t.inset,
          }}>
            <Icon name="info" size={15} color={t.t4} />
            <Txt size={11.5} color={t.t3} style={{ flex: 1, lineHeight: 17 }}>
              Nusxa soni qoldiq bo‘yicha taklif qilindi. IMEI’li tovarlarga bittadan
              qo‘yilgan. Kerakmas tovarga 0 qo‘ysangiz chop etilmaydi.
            </Txt>
          </View>

          <View style={{ maxHeight: 300 }}>
            {products.map((p) => (
              <View key={p.id} style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 9, borderTopWidth: 1, borderTopColor: t.line,
              }}>
                <Icon name="barcode" size={18} color={t.acc} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt size={14} numberOfLines={1}>{p.name}</Txt>
                  <Txt size={11} color={t.t4} mono>{codeOf(p)}</Txt>
                </View>
                <Stepper
                  value={copies[p.id] ?? 0}
                  onChange={(v) => setCopies((c) => ({ ...c, [p.id]: parseInt(v, 10) || 0 }))}
                  min={0}
                  max={200}
                  size={36}
                />
              </View>
            ))}
          </View>
        </>
      )}

      {single ? (
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 12,
        }}>
          <Txt size={14} color={t.t3}>Nusxa soni</Txt>
          <Stepper
            value={copies[products[0].id] ?? 1}
            onChange={(v) => setCopies({ [products[0].id]: parseInt(v, 10) || 0 })}
            min={0}
            max={200}
            size={42}
          />
        </View>
      ) : null}

      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
        paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line,
      }}>
        <Txt size={14} color={t.t3}>Jami stiker</Txt>
        <Txt size={22} weight="600">{total} <Txt size={13} color={t.t4}>dona</Txt></Txt>
      </View>

      <Btn
        title="Chop etish"
        icon="printer"
        size="lg"
        full
        disabled={total === 0}
        loading={busy}
        onPress={print}
      />
    </Sheet>
  );
}
