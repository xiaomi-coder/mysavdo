import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Sheet, Txt, Btn, Icon, EmptyState, PhotoBox } from '../ui';
import { db } from '../lib/api';
import { money, dateShort, timeShort } from '../lib/format';
import { stockStatus, variantColor } from '../lib/stock';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Tovar harakati tarixi (sverka)

   "Bu telefon omborda 3 ta ko'rinyapti, lekin javonda 2 ta bor" —
   do'konda eng ko'p uchraydigan savol. Javob shu ekranda: har bir
   o'zgarish kim tomonidan, qachon va nima uchun qilingani yozilgan.

   Yozuvlarni ilova emas, baza o'zi qo'yadi. Shuning uchun bu ro'yxatni
   chetlab o'tib qoldiqni o'zgartirib bo'lmaydi — hatto to'g'ridan-
   to'g'ri SQL bilan ham.
   ══════════════════════════════════════════════════════════════════════ */

const TYPES = {
  kirim:        { label: 'Kirim',        icon: 'plus',        color: 'ok' },
  sotuv:        { label: 'Sotuv',        icon: 'storefront',  color: 'dim' },
  qaytarish:    { label: 'Qaytarish',    icon: 'undo',        color: 'warn' },
  kochirish:    { label: "Ko‘chirish",   icon: 'truck',       color: 'dim' },
  taftish:      { label: 'Taftish',      icon: 'check-circle', color: 'info' },
  boshlangich:  { label: "Boshlang‘ich", icon: 'package',     color: 'dim' },
  tuzatish:     { label: 'Qo‘lda tuzatilgan', icon: 'pencil', color: 'dang' },
};

export default function HistorySheet({ product, onClose }) {
  const { t } = useTheme();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!product) return undefined;
    let alive = true;
    db.from('stock_movements')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(60)
      .then(({ data }) => { if (alive) setRows(data || []); });
    return () => { alive = false; };
  }, [product?.id]);

  if (!product) return null;

  const st = stockStatus(product);

  return (
    <Sheet visible onClose={onClose} title={product.name}>
      {/* Tovar kartochkasi */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 12, borderRadius: R.lg, backgroundColor: t.inset, marginBottom: 14,
      }}>
        <PhotoBox uri={product.photo_url} emoji={product.image} size={56} />
        <View style={{ flex: 1 }}>
          <Txt size={16} weight="600">{money(product.price)} <Txt size={12} color={t.t4}>so‘m</Txt></Txt>
          <Txt size={12} color={variantColor(t, st.variant)} weight="500" style={{ marginTop: 2 }}>
            {st.label}{!product.phone_imei1 ? ` · ${product.stock} dona` : ''}
          </Txt>
          {product.cost_price > 0 ? (
            <Txt size={11} color={t.t4} style={{ marginTop: 2 }}>
              Tannarx {money(product.cost_price)} · foyda {money(product.price - product.cost_price)}
            </Txt>
          ) : null}
        </View>
      </View>

      <Txt size={13} weight="500" color={t.t2} style={{ marginBottom: 4 }}>
        Harakat tarixi
      </Txt>

      {rows === null ? (
        <ActivityIndicator color={t.acc} style={{ paddingVertical: 30 }} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="history"
          text="Hali harakat yozilmagan. Kirim yoki sotuvdan keyin shu yerda ko‘rinadi."
          style={{ paddingVertical: 30 }}
        />
      ) : rows.map((m) => {
        const meta = TYPES[m.type] || { label: m.type, icon: 'note', color: 'dim' };
        const color = meta.color === 'dim' ? t.t3 : variantColor(t, meta.color);
        const plus = m.qty > 0;
        return (
          <View key={m.id} style={{
            flexDirection: 'row', alignItems: 'center', gap: 11,
            paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line,
          }}>
            <Icon name={meta.icon} size={18} color={color} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt size={14} weight="500" color={color}>{meta.label}</Txt>
              <Txt size={11} color={t.t4} style={{ marginTop: 1 }}>
                {dateShort(m.created_at)} {timeShort(m.created_at)}
                {m.actor ? ` · ${m.actor}` : ''}
              </Txt>
              {m.note ? <Txt size={11} color={t.t4} style={{ marginTop: 1 }}>{m.note}</Txt> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Txt size={15} weight="600" color={plus ? t.ok : t.err}>
                {plus ? '+' : ''}{m.qty}
              </Txt>
              <Txt size={11} color={t.t4} mono>{m.stock_before} → {m.stock_after}</Txt>
            </View>
          </View>
        );
      })}

      <Btn title="Yopish" variant="secondary" full style={{ marginTop: 16 }} onPress={onClose} />
    </Sheet>
  );
}
