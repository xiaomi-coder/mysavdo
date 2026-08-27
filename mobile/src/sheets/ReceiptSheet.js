import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Tap, Btn, Chip, Checkbox, Stepper, Icon } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { db } from '../lib/api';
import { money, timeShort, dateShort } from '../lib/format';
import { printReceipt } from '../lib/receipt';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Chek va qaytarish

   Mijoz tovarni qaytarganda uch narsa birdan bo'lishi kerak: ombor
   ortadi, kassadan pul chiqadi, hisobotda minus ko'rinadi. Uchtasi
   bittasidan ajralib qolsa — kechqurun sverka chiqmaydi.

   Shuning uchun qaytarish alohida yozuv sifatida kiritiladi: asl chek
   o'zgarmaydi (mijozdagi qog'oz bilan mos turadi), qaytarish esa
   manfiy summali yangi yozuv bo'lib tushadi.

   Qisman qaytarish ham mumkin — mijoz uchta olib, bittasini qaytarishi
   oddiy hol.
   ══════════════════════════════════════════════════════════════════════ */

const REASONS = ['Nuqsonli', 'Yoqmadi', 'Noto‘g‘ri tovar', 'Boshqa sabab'];

export default function ReceiptSheet({ transaction, onClose }) {
  const { t } = useTheme();
  const { user, store } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const [picked, setPicked] = useState({});   // { itemId: qty }
  const [reason, setReason] = useState(REASONS[0]);
  const [busy, setBusy] = useState(false);

  const tx = transaction;
  const items = useMemo(() => (Array.isArray(tx?.items) ? tx.items : []), [tx]);

  /* Shu chekdan avval nima qaytarilgan — ikki marta qaytarib
     yubormaslik uchun. */
  const alreadyReturned = useMemo(() => {
    if (!tx) return {};
    const map = {};
    d.transactions
      .filter((x) => x.status === 'returned' && x.receipt_no === `${tx.receipt_no}-Q`)
      .forEach((x) => {
        (Array.isArray(x.items) ? x.items : []).forEach((it) => {
          map[it.id] = (map[it.id] || 0) + (it.qty || 1);
        });
      });
    return map;
  }, [d.transactions, tx]);

  const refund = useMemo(
    () => items.reduce((s, it) => s + (picked[it.id] || 0) * Number(it.price || 0), 0),
    [items, picked]
  );

  const anyReturnable = items.some((it) => (it.qty || 1) - (alreadyReturned[it.id] || 0) > 0);

  const toggle = (it) => {
    const left = (it.qty || 1) - (alreadyReturned[it.id] || 0);
    if (left <= 0) return;
    setPicked((p) => {
      const next = { ...p };
      if (next[it.id]) delete next[it.id];
      else next[it.id] = left;
      return next;
    });
  };

  const doReturn = async () => {
    const chosen = items.filter((it) => picked[it.id] > 0);
    if (chosen.length === 0) return;
    setBusy(true);

    /* Har tovarni ombor tarixiga "qaytarish" turi bilan qaytaramiz.
       Bu yerda move_stock ishlatiladi, chunki revert_sale butun chekni
       qaytaradi — bizga qisman kerak. */
    for (const it of chosen) {
      if (String(it.id).startsWith('custom-')) continue;   // narxsiz tovar omborda yo'q
      const { error } = await db.rpc('move_stock', {
        p_product: it.id,
        p_qty: picked[it.id],
        p_type: 'qaytarish',
        p_note: reason,
        p_actor: user?.name,
        p_txn: tx.id,
      });
      if (error) {
        setBusy(false);
        notify(`Ombor yangilanmadi: ${error.message}`, 'error');
        return;
      }
    }

    /* Manfiy summali yozuv — hisobotda minus bo'lib chiqadi */
    const { data: row, error } = await db.from('transactions').insert({
      store_id: tx.store_id,
      customer_id: tx.customer_id,
      receipt_no: `${tx.receipt_no}-Q`,
      cashier: `${user?.name} · qaytarish: ${reason}`,
      items: chosen.map((it) => ({ ...it, qty: picked[it.id] })),
      total: -refund,
      discount: 0,
      payment_method: tx.payment_method,
      status: 'returned',
    }).select().single();

    setBusy(false);

    if (error) { notify(`Qaytarish yozilmadi: ${error.message}`, 'error'); return; }

    d.addTransaction(row);
    chosen.forEach((it) => {
      const p = d.products.find((x) => x.id === it.id);
      if (p) d.patchProduct(p.id, { stock: (p.stock || 0) + picked[it.id] });
    });

    notify(`Qaytarildi · ${money(refund)} so‘m`, 'ok');
    onClose?.();
  };

  if (!tx) return null;

  const isReturn = tx.status === 'returned';

  return (
    <Sheet
      visible
      onClose={onClose}
      title={`Chek ${tx.receipt_no || ''} · ${timeShort(tx.date)}`}
      sub={`${dateShort(tx.date)} · ${money(Math.abs(tx.total))} so‘m · ${payLabel(tx.payment_method)}`}
    >
      {isReturn ? (
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 9,
          borderWidth: 1, borderColor: t.err, borderRadius: R.md,
          padding: 12, marginBottom: 12,
        }}>
          <Icon name="undo" size={18} color={t.err} />
          <Txt size={13} color={t.err} style={{ flex: 1 }}>
            Bu qaytarish yozuvi. {tx.cashier}
          </Txt>
        </View>
      ) : null}

      {/* Tovarlar */}
      {!isReturn ? (
        <Txt size={12} color={t.t4} style={{ marginBottom: 2 }}>
          Qaytariladigan tovarlarni belgilang
        </Txt>
      ) : null}

      {items.map((it) => {
        const done = alreadyReturned[it.id] || 0;
        const left = (it.qty || 1) - done;
        const on = Boolean(picked[it.id]);
        return (
          <Tap
            key={String(it.id)}
            onPress={isReturn ? undefined : () => toggle(it)}
            disabled={isReturn || left <= 0}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 11,
              paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.line,
              opacity: left <= 0 ? 0.45 : 1,
            }}
          >
            {!isReturn ? <Checkbox on={on} /> : null}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt size={14} weight="500" numberOfLines={1}>{it.name}</Txt>
              <Txt size={12} color={t.t3}>
                {money(it.price)} so‘m · chekda {it.qty} dona
                {done > 0 ? ` · ${done} ta qaytarilgan` : ''}
              </Txt>
            </View>
            {on && left > 1 ? (
              <Stepper
                value={picked[it.id]}
                onChange={(v) => setPicked((p) => ({ ...p, [it.id]: Math.min(left, Math.max(1, parseInt(v, 10) || 1)) }))}
                min={1}
                max={left}
                size={36}
              />
            ) : null}
          </Tap>
        );
      })}

      {!isReturn && anyReturnable ? (
        <>
          <Txt size={12} color={t.t4} style={{ marginTop: 12, marginBottom: 6 }}>Sabab</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {REASONS.map((r) => (
              <Chip key={r} label={r} active={reason === r} onPress={() => setReason(r)} />
            ))}
          </View>

          <Btn
            title={refund > 0 ? `Qaytarish — ${money(refund)} so‘m` : 'Tovarni belgilang'}
            variant={refund > 0 ? 'primary' : 'secondary'}
            size="lg"
            full
            disabled={refund <= 0}
            loading={busy}
            onPress={doReturn}
          />
          <Txt size={12} color={t.t4} style={{ textAlign: 'center', marginTop: 8, lineHeight: 17 }}>
            Tasdiqlansa: ombor ortadi, kassadan pul chiqadi, hisobotda minus bo‘ladi
          </Txt>
        </>
      ) : null}

      {!isReturn && !anyReturnable ? (
        <Txt size={13} color={t.t3} style={{ textAlign: 'center', marginVertical: 16 }}>
          Bu chekdagi hamma tovar qaytarilgan
        </Txt>
      ) : null}

      <Btn
        title="Chekni chop etish"
        icon="printer"
        variant="secondary"
        full
        style={{ marginTop: 12 }}
        onPress={() => printReceipt({
          items,
          subtotal: Math.abs(tx.total) + Number(tx.discount || 0),
          discount: Number(tx.discount || 0),
          total: Math.abs(tx.total),
          payMethod: tx.payment_method,
          receiptNo: String(tx.receipt_no || '').replace('#', ''),
          cashier: tx.cashier,
          customer: d.customers.find((c) => c.id === tx.customer_id),
          storeName: store?.name,
          isPhone: store?.store_type === 'phone',
        }).catch(() => notify('Chop etib bo‘lmadi', 'error'))}
      />
    </Sheet>
  );
}

const payLabel = (m) => ({
  cash: 'Naqd', card: 'Karta', transfer: 'O‘tkazma',
  nasiya: 'Nasiya', online: 'Onlayn',
}[m] || 'Naqd');
