import React, { useState, useMemo, useEffect } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Btn, Icon, Header, SearchBar, PhotoBox,
  Stepper, EmptyState, Chip, Input,
} from '../ui';
import { useFeedback, buzz } from '../ui/Feedback';
import { db } from '../lib/api';
import { money } from '../lib/format';

/* ══════════════════════════════════════════════════════════════════════════
   Ommaviy kirim

   Yuk kelganda 30 ta tovarni bittalab ochib "Kirim" qilish uzoq. Bu
   yerda: skanerla → sonini yoz → keyingisi. Oxirida bir tugma bilan
   hammasi saqlanadi.

   Saqlashda har tovar alohida `move_stock` orqali o'tadi — ya'ni
   sverkada har biri o'z yozuviga ega bo'ladi va keyin "bu qoldiq
   qayerdan keldi" degan savolga javob bor.

   Bittasi xato bo'lsa qolganlari saqlanaveradi: yuk qabul qilishning
   yarmida to'xtab qolish eng yomon holat.
   ══════════════════════════════════════════════════════════════════════ */

export default function BulkReceive({ navigation, route }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();
  const insets = useSafeAreaInsets();

  const [lines, setLines] = useState([]);      // [{ id, qty }]
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);      // { ok, failed }

  /* Ta'minotchi — ixtiyoriy. Tanlansa yuk hujjati yoziladi va
     to'lanmagan qismi o'sha ta'minotchiga qarz bo'lib qoladi. */
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState(null);
  const [paid, setPaid] = useState('');

  useEffect(() => {
    if (!d.storeId) return;
    db.from('suppliers').select('id,name').eq('store_id', d.storeId)
      .eq('is_active', true).order('name')
      .then(({ data }) => setSuppliers(data || []));
  }, [d.storeId]);

  const byId = useMemo(() => new Map(d.products.map((p) => [p.id, p])), [d.products]);

  const addLine = (id) => {
    buzz('ok');
    setLines((l) => {
      const i = l.findIndex((x) => x.id === id);
      if (i >= 0) {
        const next = [...l];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [{ id, qty: 1 }, ...l];
    });
    setQ('');
  };

  /* Skanerdan qaytgan kod */
  useEffect(() => {
    const code = route?.params?.scanned;
    if (!code) return;
    navigation.setParams({ scanned: undefined });

    const p = d.products.find((x) =>
      x.barcode === code || x.phone_imei1 === code || x.phone_serial === code);

    if (!p) {
      buzz('error');
      notify('Bu kod bo‘yicha tovar topilmadi', 'error');
      return;
    }
    addLine(p.id);
  }, [route?.params?.scanned]);

  const setQty = (id, qty) => setLines((l) => (qty <= 0
    ? l.filter((x) => x.id !== id)
    : l.map((x) => (x.id === id ? { ...x, qty } : x))));

  const found = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return d.products.filter((p) =>
      (p.name || '').toLowerCase().includes(s) ||
      (p.barcode || '').includes(s) ||
      (p.phone_imei1 || '').includes(s)
    ).slice(0, 8);
  }, [q, d.products]);

  const totalQty = lines.reduce((s, x) => s + x.qty, 0);
  const totalCost = lines.reduce(
    (s, x) => s + (Number(byId.get(x.id)?.cost_price) || 0) * x.qty, 0
  );

  const save = async () => {
    if (lines.length === 0) return;
    setBusy(true);

    let ok = 0;
    const failed = [];

    for (const line of lines) {
      const p = byId.get(line.id);
      if (!p) continue;
      const { error } = await db.rpc('move_stock', {
        p_product: p.id,
        p_qty: line.qty,
        p_type: 'kirim',
        p_note: 'Ommaviy kirim',
        p_actor: user?.name,
        p_txn: null,
      });
      if (error) {
        failed.push({ name: p.name, message: error.message });
        continue;
      }
      d.patchProduct(p.id, { stock: (p.stock || 0) + line.qty });
      ok++;
    }

    /* Ta'minotchi tanlangan bo'lsa yuk hujjatini yozamiz. Qarz
       hisobini baza o'zi qiladi (supplier_balances). */
    if (supplierId && ok > 0) {
      await db.from('purchases').insert({
        store_id: d.storeId,
        supplier_id: supplierId,
        items: lines.map((l) => {
          const p = byId.get(l.id);
          return { id: l.id, name: p?.name, qty: l.qty, cost: Number(p?.cost_price) || 0 };
        }),
        total: totalCost,
        paid: parseInt(paid, 10) || 0,
        actor: user?.name,
      });
    }

    setBusy(false);
    setDone({ ok, failed });
    if (failed.length === 0) buzz('ok');
  };

  /* Saqlangandan keyingi hisobot */
  if (done) {
    return (
      <Screen>
        <Header title="Kirim yakunlandi" onBack={() => navigation.goBack()} />
        <Card pad={18} style={{ alignItems: 'center' }}>
          <Icon name={done.failed.length ? 'warning' : 'check-circle'}
            size={44} color={done.failed.length ? t.warn : t.ok} fill />
          <Txt size={20} weight="600" style={{ marginTop: 10 }}>
            {done.ok} ta tovar kirim qilindi
          </Txt>
          <Txt size={13} color={t.t3} style={{ marginTop: 4 }}>
            Jami {totalQty} dona
          </Txt>
        </Card>

        {done.failed.length ? (
          <Card pad={14} border={t.err} style={{ marginTop: 12 }}>
            <Txt size={13.5} weight="500" color={t.err}>
              {done.failed.length} tasida xato bo‘ldi
            </Txt>
            {done.failed.map((x, i) => (
              <Txt key={i} size={12} color={t.t3} style={{ marginTop: 6, lineHeight: 17 }}>
                {x.name} — {x.message}
              </Txt>
            ))}
            <Txt size={11.5} color={t.t4} style={{ marginTop: 8, lineHeight: 16 }}>
              Qolganlari saqlandi. Bularni alohida kirim qilib ko‘ring.
            </Txt>
          </Card>
        ) : null}

        <Btn title="Yana kirim qilish" size="lg" full style={{ marginTop: 16 }}
          onPress={() => { setLines([]); setDone(null); }} />
        <Btn title="Omborga qaytish" variant="secondary" full style={{ marginTop: 10 }}
          onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <>
      <Screen bottomPad={lines.length ? 120 : 24}>
        <Header title="Ommaviy kirim" onBack={() => navigation.goBack()} />

        <Btn
          title="Barcode skanerlash"
          icon="barcode"
          size="xl"
          full
          onPress={() => navigation.navigate('Scanner', { mode: 'code', returnTo: 'Kirim' })}
        />
        <Txt size={11.5} color={t.t4} style={{ marginTop: 8, lineHeight: 16, textAlign: 'center' }}>
          Har skanerlashda tovar ro‘yxatga tushadi. Bir xil tovar ikki marta
          skanerlansa soni oshadi.
        </Txt>

        <SearchBar
          value={q}
          onChangeText={setQ}
          placeholder="Yoki nom bo‘yicha qidiring"
          style={{ marginTop: 14 }}
        />

        {/* Qidiruv natijalari */}
        {found.length > 0 ? (
          <Card pad={0} style={{ overflow: 'hidden', marginTop: 10 }}>
            {found.map((p, i) => (
              <Tap
                key={p.id}
                onPress={() => addLine(p.id)}
                activeStyle={{ backgroundColor: t.line }}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 11,
                  paddingHorizontal: 13, paddingVertical: 10,
                  borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
                }}
              >
                <PhotoBox uri={p.photo_url} emoji={p.image} size={38} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt size={14} numberOfLines={1}>{p.name}</Txt>
                  <Txt size={11.5} color={t.t4}>hozir {p.stock} dona</Txt>
                </View>
                <Icon name="plus" size={19} color={t.acc} />
              </Tap>
            ))}
          </Card>
        ) : null}

        {/* Ta'minotchi */}
        {suppliers.length > 0 && lines.length > 0 ? (
          <View style={{ marginTop: 16 }}>
            <Txt size={12} weight="500" color={t.t4} style={{ marginBottom: 8 }}>
              KIMDAN KELDI · ixtiyoriy
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {suppliers.map((s) => (
                <Chip
                  key={s.id}
                  label={s.name}
                  active={supplierId === s.id}
                  onPress={() => setSupplierId(supplierId === s.id ? null : s.id)}
                />
              ))}
            </View>
            {supplierId ? (
              <Input
                label="Shu zahoti to‘langani"
                value={paid}
                onChangeText={(v) => setPaid(v.replace(/\D/g, '').slice(0, 12))}
                keyboardType="number-pad"
                placeholder="0"
                style={{ marginTop: 10 }}
                hint={`To‘lanmagani ta’minotchiga qarz bo‘lib qoladi`}
              />
            ) : null}
          </View>
        ) : null}

        {/* Ro'yxat */}
        {lines.length === 0 ? (
          <EmptyState
            icon="package"
            title="Ro‘yxat bo‘sh"
            text="Kelgan tovarlarni skanerlang yoki qidirib qo‘shing"
          />
        ) : (
          <View style={{ marginTop: 16 }}>
            <Txt size={12} weight="500" color={t.t4} style={{ marginBottom: 8 }}>
              QABUL QILINADI · {lines.length} xil
            </Txt>
            <Card pad={0} style={{ overflow: 'hidden' }}>
              {lines.map((line, i) => {
                const p = byId.get(line.id);
                if (!p) return null;
                return (
                  <View
                    key={line.id}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 11,
                      paddingHorizontal: 13, paddingVertical: 11,
                      borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
                    }}
                  >
                    <PhotoBox uri={p.photo_url} emoji={p.image} size={42} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Txt size={14} weight="500" numberOfLines={1}>{p.name}</Txt>
                      <Txt size={11.5} color={t.t4} style={{ marginTop: 1 }}>
                        {p.stock} → {p.stock + line.qty} dona
                      </Txt>
                    </View>
                    <Stepper
                      value={line.qty}
                      onChange={(v) => setQty(line.id, parseInt(v, 10) || 0)}
                      min={0}
                      max={9999}
                      size={36}
                    />
                  </View>
                );
              })}
            </Card>
          </View>
        )}
      </Screen>

      {/* Pastdagi yakunlash paneli */}
      {lines.length > 0 ? (
        <View style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          backgroundColor: t.inset,
          borderTopWidth: 1, borderTopColor: t.accdim,
          paddingHorizontal: 16, paddingTop: 12,
          paddingBottom: 14 + insets.bottom,
        }}>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 10,
          }}>
            <Txt size={13} color={t.t3}>{totalQty} dona</Txt>
            {totalCost > 0 ? (
              <Txt size={13} color={t.t3}>
                tannarxda {money(totalCost)} so‘m
              </Txt>
            ) : null}
          </View>
          <Btn
            title={`Kirim qilish — ${totalQty} dona`}
            size="xl"
            full
            loading={busy}
            onPress={save}
          />
        </View>
      ) : null}
    </>
  );
}
