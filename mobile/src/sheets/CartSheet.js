import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { useCart, PAY_METHODS } from '../CartContext';
import { useAuth } from '../AuthContext';
import { Sheet, Txt, Tap, Btn, Chip, Icon, Stepper, PhotoBox, Input } from '../ui';
import { useFeedback } from '../ui/Feedback';
import { money } from '../lib/format';
import { R } from '../theme';
import { printReceipt } from '../lib/receipt';

/* ══════════════════════════════════════════════════════════════════════════
   Savat va to'lov

   Bitta oynada butun sotuv yakunlanadi: tovar soni, chegirma, to'lov
   turi va yakunlash. Sotuvchi mijoz oldida uch-to'rt ekran aylanib
   yurmasligi kerak.

   Naqd to'lovda qaytim avtomatik hisoblanadi — bu do'konda eng ko'p
   xato bo'ladigan joy.
   ══════════════════════════════════════════════════════════════════════ */

const DISCOUNTS = [0, 5, 10, 15];
const TERMS = [7, 14, 30, 60];

export default function CartSheet({ visible, onClose, navigation }) {
  const { t } = useTheme();
  const { user, store } = useAuth();
  const d = useData();
  const cart = useCart();
  const { notify, showSuccess, closeSuccess } = useFeedback();
  const [clientQ, setClientQ] = useState('');

  const { items, totals } = cart;

  /* Naqd to'lovda taklif qilinadigan summalar. Mijoz odatda yaxlit pul
     beradi — 500 000 lik yoki 1 mln lik. Shularni tayyor tugma qilib
     qo'yamiz, kassir raqam terib o'tirmasin. */
  const cashChips = useMemo(() => {
    const tot = totals.total;
    if (tot <= 0) return [];
    const round = (step) => Math.ceil(tot / step) * step;
    const opts = new Set([tot, round(10000), round(50000), round(100000), round(500000)]);
    return [...opts].filter((v) => v >= tot).sort((a, b) => a - b).slice(0, 4);
  }, [totals.total]);

  const clients = useMemo(() => {
    const s = clientQ.trim().toLowerCase();
    const list = d.customers.filter((c) => c.type !== 'dealer');
    if (!s) return list.slice(0, 12);
    return list.filter((c) =>
      (c.name || '').toLowerCase().includes(s) || (c.phone || '').includes(s)
    ).slice(0, 12);
  }, [d.customers, clientQ]);

  /* Nasiyaga IMEI'li telefon sotilsa — kredit qulf taklif qilamiz.
     Faqat noyob (IMEI bor) tovar: chexol yoki kabelni qulflab
     bo'lmaydi. */
  const creditPhone = cart.payMethod === 'nasiya'
    && items.find((x) => x.phone_imei1);

  const finish = async () => {
    const res = await cart.checkout();
    if (res.error) { notify(res.error, 'error'); return; }

    const phone = creditPhone;   // clear() dan oldin eslab qolamiz

    const payLabel = PAY_METHODS.find((m) => m.id === cart.payMethod)?.label;
    const snapshot = {
      items: items.map((x) => ({ ...x })),
      subtotal: totals.subtotal,
      discount: totals.discountTotal,
      total: totals.total,
      cashGiven: cart.cashGiven,
      change: totals.change,
      payLabel,
      payMethod: cart.payMethod,
      paidAmount: parseInt(cart.paidAmount, 10) || 0,
      receiptNo: res.receiptNo,
      cashier: user?.name,
      customer: cart.customer,
      storeName: store?.name,
    };

    cart.clear();
    onClose?.();

    showSuccess({
      title: res.offline ? 'Saqlandi — internet kelganda yuboriladi' : 'Sotuv yakunlandi',
      amount: money(res.total),
      actions: (
        <>
          {phone ? (
            <Btn
              title="Masofadan qulflashga qo‘shish"
              icon="lock"
              variant="secondary"
              onPress={() => {
                closeSuccess();
                navigation.navigate('Yana', {
                  screen: 'KreditYangi',
                  params: {
                    prefillImei: phone.phone_imei1,
                    prefillModel: phone.name,
                    prefillCustomer: cart.customer,
                  },
                });
              }}
            />
          ) : (
            <Btn
              title="Chek chop etish"
              icon="printer"
              variant="secondary"
              onPress={() => printReceipt(snapshot).catch(() => notify('Printer topilmadi', 'error'))}
            />
          )}
          <Btn title="Yangi sotuv" size="lg" onPress={closeSuccess} />
        </>
      ),
    });
  };

  const nasiya = cart.payMethod === 'nasiya';
  const cash = cart.payMethod === 'cash';

  return (
    <Sheet visible={visible} onClose={onClose} title="Savat">
      {items.length === 0 ? (
        <Txt size={14} color={t.t3} style={{ textAlign: 'center', paddingVertical: 26 }}>
          Savat bo‘sh — tovar tanlang yoki skanerlang
        </Txt>
      ) : (
        <>
          {/* ── Tovarlar ── */}
          {items.map((it) => (
            <View key={it.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.line,
            }}>
              <PhotoBox uri={it.photo_url} emoji={it.image} size={44} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt size={14} weight="500" numberOfLines={1}>{it.name}</Txt>
                <Txt size={13} color={t.t3}>{money(it.price * it.qty)} so‘m</Txt>
              </View>
              <Stepper
                value={it.qty}
                onChange={(v) => cart.setQty(it.id, parseInt(v, 10) || 0)}
                min={0}
                max={it.custom ? 99 : (it.stock ?? 99)}
              />
            </View>
          ))}

          {/* ── Chegirma ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 14 }}>
            <Txt size={13} color={t.t3} style={{ marginRight: 2 }}>Chegirma:</Txt>
            {DISCOUNTS.map((p) => (
              <Chip
                key={p}
                label={`${p}%`}
                active={cart.discount === p}
                onPress={() => cart.setDiscount(p)}
              />
            ))}
          </View>

          {/* ── To'lov turi ── */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
            {PAY_METHODS.map((m) => {
              const on = cart.payMethod === m.id;
              return (
                <Tap
                  key={m.id}
                  onPress={() => cart.setPayMethod(m.id)}
                  style={{
                    flex: 1, height: 56, borderRadius: R.md,
                    alignItems: 'center', justifyContent: 'center', gap: 3,
                    backgroundColor: on ? t.line : 'transparent',
                    borderWidth: 1, borderColor: on ? t.acc : t.line2,
                  }}
                >
                  <Icon name={m.icon} size={19} color={on ? t.acctext : t.t3} />
                  <Txt size={12} weight="500" color={on ? t.acctext : t.t3}>{m.label}</Txt>
                </Tap>
              );
            })}
          </View>

          {/* ── Nasiya ── */}
          {nasiya ? (
            <View style={{
              borderWidth: 1, borderColor: t.accdim, borderRadius: R.lg,
              padding: 14, marginBottom: 14,
            }}>
              <Txt size={12} color={t.t3} style={{ marginBottom: 7 }}>Mijoz</Txt>

              {d.customers.length > 8 ? (
                <Input
                  value={clientQ}
                  onChangeText={setClientQ}
                  placeholder="Mijozni qidirish"
                  style={{ marginBottom: 10 }}
                  inputStyle={{ height: 44 }}
                />
              ) : null}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -14, marginBottom: 12 }}
                contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
              >
                {clients.length === 0 ? (
                  <Txt size={13} color={t.t4}>Mijoz topilmadi</Txt>
                ) : clients.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.name}
                    active={cart.customer?.id === c.id}
                    onPress={() => cart.setCustomer(c)}
                  />
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <Input
                  label="Boshlang‘ich to‘lov"
                  value={cart.paidAmount}
                  onChangeText={(v) => cart.setPaidAmount(v.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  placeholder="0"
                  style={{ flex: 1 }}
                  inputStyle={{ height: 48, fontWeight: '600' }}
                />
                <View>
                  <Txt size={12} color={t.t3} style={{ marginBottom: 5 }}>Muddat</Txt>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {TERMS.map((n) => (
                      <Tap
                        key={n}
                        onPress={() => cart.setDueDays(n)}
                        style={{
                          height: 48, paddingHorizontal: 11, borderRadius: R.md,
                          alignItems: 'center', justifyContent: 'center',
                          backgroundColor: cart.dueDays === n ? t.line : 'transparent',
                          borderWidth: 1, borderColor: cart.dueDays === n ? t.acc : t.line2,
                        }}
                      >
                        <Txt size={12.5} weight="500" color={cart.dueDays === n ? t.acctext : t.t3}>
                          {n} kun
                        </Txt>
                      </Tap>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
                paddingTop: 8, borderTopWidth: 1, borderTopColor: t.line,
              }}>
                <Txt size={13} color={t.warn}>Qolgan qarz</Txt>
                <Txt size={20} weight="600" color={t.warn}>
                  {money(totals.nasiyaRest)} <Txt size={12} color={t.t4}>so‘m</Txt>
                </Txt>
              </View>
            </View>
          ) : null}

          {/* ── Naqd: qaytim ── */}
          {cash ? (
            <View style={{
              borderWidth: 1, borderColor: t.line, borderRadius: R.lg,
              padding: 14, marginBottom: 12,
            }}>
              <Txt size={13} color={t.t3} style={{ marginBottom: 8 }}>Mijoz berdi</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                {cashChips.map((v) => (
                  <Chip
                    key={v}
                    label={money(v)}
                    active={cart.cashGiven === v}
                    onPress={() => cart.setCashGiven(cart.cashGiven === v ? 0 : v)}
                    style={{ height: 40 }}
                  />
                ))}
              </View>
              {cart.cashGiven > 0 ? (
                <View style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
                  paddingTop: 8, borderTopWidth: 1, borderTopColor: t.line,
                }}>
                  <Txt size={13} color={t.t3}>Qaytim</Txt>
                  <Txt size={24} weight="600" color={totals.change >= 0 ? t.ok : t.err}>
                    {money(totals.change)} <Txt size={13} color={t.t4}>so‘m</Txt>
                  </Txt>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ── Jami ── */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
            paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line,
          }}>
            <Txt size={14} color={t.t3}>Jami to‘lov</Txt>
            <Txt size={24} weight="600">
              {money(totals.total)} <Txt size={14} color={t.t4}>so‘m</Txt>
            </Txt>
          </View>

          <Btn
            title="Sotuvni yakunlash"
            size="xl"
            full
            loading={cart.saving}
            onPress={finish}
          />
        </>
      )}
    </Sheet>
  );
}
