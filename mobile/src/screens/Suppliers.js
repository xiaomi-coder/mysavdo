import React, { useState, useEffect, useCallback } from 'react';
import { View, Linking } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Btn, Icon, Header, Avatar, Sheet, Input,
  Chip, EmptyState, Skeleton, SectionLabel,
} from '../ui';
import { useFeedback } from '../ui/Feedback';
import { db } from '../lib/api';
import { money, initials, phoneFmt, dateShort } from '../lib/format';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Ta'minotchilar

   Ilgari faqat mijozning bizga qarzi yozilardi. Bu yerda teskarisi:
   kimdan tovar olamiz va kimga qancha qarzimiz bor.

   Qarz uch narsadan yig'iladi va uni baza o'zi hisoblaydi
   (`supplier_balances` ko'rinishi):
       olingan tovar − yuk kelganda to'langani − keyingi to'lovlar

   Shuning uchun ilova hech qachon qarzni o'zi hisoblamaydi — bu joyda
   xato qilish oson va oqibati og'ir.
   ══════════════════════════════════════════════════════════════════════ */

export default function Suppliers({ navigation }) {
  const { t } = useTheme();
  const d = useData();
  const { notify } = useFeedback();

  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(null);      // null | 'new' | ta'minotchi
  const [detail, setDetail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!d.storeId) return;
    const { data } = await db.from('supplier_balances').select('*')
      .eq('store_id', d.storeId).order('balance', { ascending: false });
    setRows(data || []);
  }, [d.storeId]);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const owing = (rows || []).filter((x) => Number(x.balance) > 0);
  const clear = (rows || []).filter((x) => Number(x.balance) <= 0);
  const totalDebt = owing.reduce((s, x) => s + Number(x.balance || 0), 0);

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <Header
        title="Ta’minotchilar"
        onBack={() => navigation.goBack()}
        right={<Btn title="Yangi" icon="plus" size="sm" onPress={() => setForm('new')} />}
      />

      {rows === null ? (
        <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={72} />)}</View>
      ) : rows.length === 0 ? (
        <EmptyState
          icon="truck"
          title="Ta’minotchi yo‘q"
          text="Kimdan tovar olsangiz shu yerga qo‘shing — keyin qarzingiz o‘zi hisoblanib boradi"
          action={<Btn title="Ta’minotchi qo‘shish" onPress={() => setForm('new')} />}
        />
      ) : (
        <>
          {totalDebt > 0 ? (
            <Card pad={16} border={t.warn} style={{ marginBottom: 14 }}>
              <Txt size={12} color={t.warn}>Ta’minotchilarga qarzimiz</Txt>
              <Txt size={28} weight="600" style={{ marginTop: 3 }}>
                {money(totalDebt)} <Txt size={14} color={t.t4}>so‘m</Txt>
              </Txt>
              <Txt size={12} color={t.t3} style={{ marginTop: 4 }}>
                {owing.length} ta ta’minotchiga
              </Txt>
            </Card>
          ) : null}

          {owing.length > 0 ? (
            <>
              <SectionLabel color={t.warn}>QARZIMIZ BOR</SectionLabel>
              <View style={{ gap: 8, marginBottom: 16 }}>
                {owing.map((s) => (
                  <Row key={s.id} s={s} t={t} onPress={() => setDetail(s)} />
                ))}
              </View>
            </>
          ) : null}

          {clear.length > 0 ? (
            <>
              <SectionLabel>QARZ YO‘Q · {clear.length}</SectionLabel>
              <View style={{ gap: 8 }}>
                {clear.map((s) => (
                  <Row key={s.id} s={s} t={t} onPress={() => setDetail(s)} />
                ))}
              </View>
            </>
          ) : null}
        </>
      )}

      {form && (
        <SupplierForm
          supplier={form === 'new' ? null : form}
          storeId={d.storeId}
          notify={notify}
          onClose={() => setForm(null)}
          onSaved={() => { load(); }}
        />
      )}

      {detail && (
        <SupplierDetail
          supplier={detail}
          onClose={() => setDetail(null)}
          onChanged={load}
          onEdit={() => { setForm(detail); setDetail(null); }}
          notify={notify}
        />
      )}
    </Screen>
  );
}

function Row({ s, t, onPress }) {
  const bal = Number(s.balance || 0);
  return (
    <Card
      pad={12}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <Avatar text={initials(s.name)} size={42} color={bal > 0 ? t.warn : t.t3} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt size={15} weight="500" numberOfLines={1}>{s.name}</Txt>
        <Txt size={12} color={t.t3} style={{ marginTop: 1 }}>
          {s.phone ? phoneFmt(s.phone) : 'telefon yo‘q'}
          {s.last_purchase ? ` · ${dateShort(s.last_purchase)}` : ''}
        </Txt>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Txt size={15} weight="600" color={bal > 0 ? t.warn : t.ok}>
          {bal > 0 ? money(bal) : '—'}
        </Txt>
        <Txt size={11} color={t.t4}>{bal > 0 ? 'qarz' : 'toza'}</Txt>
      </View>
    </Card>
  );
}

/* ── Qo'shish / tahrirlash ────────────────────────────────────────────── */
function SupplierForm({ supplier, storeId, onClose, onSaved, notify }) {
  const isNew = !supplier;
  const [f, setF] = useState(() => ({
    name: supplier?.name || '',
    phone: supplier?.phone || '',
    note: supplier?.note || '',
  }));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!f.name.trim()) { notify('Nomini kiriting', 'error'); return; }
    setBusy(true);
    const payload = {
      store_id: storeId,
      name: f.name.trim(),
      phone: f.phone.trim() || null,
      note: f.note.trim() || null,
    };
    const { error } = isNew
      ? await db.from('suppliers').insert(payload)
      : await db.from('suppliers').update(payload).eq('id', supplier.id);
    setBusy(false);
    if (error) { notify(error.message, 'error'); return; }
    notify(isNew ? 'Ta’minotchi qo‘shildi' : 'Saqlandi', 'ok');
    onSaved();
    onClose();
  };

  return (
    <Sheet visible onClose={onClose} title={isNew ? 'Yangi ta’minotchi' : 'Ta’minotchi'}>
      <View style={{ gap: 10 }}>
        <Input label="Nomi" value={f.name} onChangeText={(v) => setF((s) => ({ ...s, name: v }))}
          placeholder="Optom Baza" autoFocus={isNew} />
        <Input label="Telefon" value={f.phone} onChangeText={(v) => setF((s) => ({ ...s, phone: v }))}
          keyboardType="phone-pad" placeholder="+998 90 123 45 67" />
        <Input label="Izoh" value={f.note} onChangeText={(v) => setF((s) => ({ ...s, note: v }))}
          placeholder="Manzil, shartlar — ixtiyoriy" />
        <Btn title="Saqlash" size="lg" full loading={busy} onPress={save} style={{ marginTop: 4 }} />
      </View>
    </Sheet>
  );
}

/* ── Tafsilot: kirimlar, to'lovlar, qarz ──────────────────────────────── */
const METHODS = [
  { id: 'cash', label: 'Naqd' },
  { id: 'card', label: 'Karta' },
  { id: 'transfer', label: 'O‘tkazma' },
];

function SupplierDetail({ supplier, onClose, onChanged, onEdit, notify }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();

  const [history, setHistory] = useState(null);
  const [paying, setPaying] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [busy, setBusy] = useState(false);

  const bal = Number(supplier.balance || 0);
  const tel = String(supplier.phone || '').replace(/[^\d+]/g, '');

  useEffect(() => {
    let alive = true;
    Promise.all([
      db.from('purchases').select('*').eq('supplier_id', supplier.id)
        .order('date', { ascending: false }).limit(30),
      db.from('supplier_payments').select('*').eq('supplier_id', supplier.id)
        .order('date', { ascending: false }).limit(30),
    ]).then(([p, pay]) => {
      if (!alive) return;
      const rows = [
        ...(p.data || []).map((x) => ({ ...x, kind: 'purchase' })),
        ...(pay.data || []).map((x) => ({ ...x, kind: 'payment' })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(rows);
    });
    return () => { alive = false; };
  }, [supplier.id]);

  const pay = async () => {
    const v = parseInt(amount, 10) || 0;
    if (v <= 0) { notify('Summani kiriting', 'error'); return; }
    setBusy(true);
    const { error } = await db.from('supplier_payments').insert({
      store_id: d.storeId,
      supplier_id: supplier.id,
      amount: v,
      method,
      actor: user?.name,
    });
    setBusy(false);
    if (error) { notify(error.message, 'error'); return; }
    notify(`${money(v)} so‘m to‘landi`, 'ok');
    setAmount('');
    setPaying(false);
    onChanged();
    onClose();
  };

  return (
    <Sheet visible onClose={onClose}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Avatar text={initials(supplier.name)} size={52} color={bal > 0 ? t.warn : t.acc} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt size={17} weight="500" numberOfLines={1}>{supplier.name}</Txt>
          <Txt size={13} color={t.t3}>{phoneFmt(supplier.phone) || 'telefon yo‘q'}</Txt>
        </View>
        <Tap onPress={onEdit} hit={10} style={{ padding: 8 }}>
          <Icon name="pencil" size={19} color={t.t3} />
        </Tap>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        <Btn title="Qo‘ng‘iroq" icon="phone" variant="ok" size="lg" style={{ flex: 1 }}
          disabled={!tel} onPress={() => Linking.openURL(`tel:${tel}`)} />
        <Btn title="To‘lov qilish" icon="money" size="lg" style={{ flex: 1 }}
          onPress={() => setPaying((v) => !v)} />
      </View>

      {/* Qarz */}
      <View style={{
        borderWidth: 1, borderColor: bal > 0 ? t.warn : t.line,
        borderRadius: R.lg, padding: 14, marginBottom: 14,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={13} color={t.t3}>Olingan tovar</Txt>
          <Txt size={13.5} weight="500">{money(supplier.purchased)}</Txt>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 }}>
          <Txt size={13} color={t.t3}>To‘langan</Txt>
          <Txt size={13.5} weight="500" color={t.ok}>{money(supplier.paid)}</Txt>
        </View>
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
          marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: t.line,
        }}>
          <Txt size={14} color={bal > 0 ? t.warn : t.t3}>Qarzimiz</Txt>
          <Txt size={20} weight="600" color={bal > 0 ? t.warn : t.ok}>
            {money(Math.max(0, bal))} <Txt size={12} color={t.t4}>so‘m</Txt>
          </Txt>
        </View>
      </View>

      {/* To'lov shakli */}
      {paying ? (
        <View style={{
          borderWidth: 1, borderColor: t.accdim, borderRadius: R.lg,
          padding: 14, marginBottom: 14,
        }}>
          <Input
            label="To‘lov summasi"
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/\D/g, '').slice(0, 12))}
            keyboardType="number-pad"
            placeholder="0"
            big
          />
          {bal > 0 ? (
            <Tap onPress={() => setAmount(String(Math.round(bal)))} style={{ marginTop: 8 }}>
              <Txt size={12.5} color={t.acctext}>Butun qarzni to‘lash — {money(bal)}</Txt>
            </Tap>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {METHODS.map((m) => (
              <Chip key={m.id} label={m.label} active={method === m.id}
                onPress={() => setMethod(m.id)} style={{ flex: 1, justifyContent: 'center' }} />
            ))}
          </View>

          <Btn title="To‘lovni yozish" size="lg" full loading={busy}
            onPress={pay} style={{ marginTop: 12 }} />
        </View>
      ) : null}

      {/* Tarix */}
      <Txt size={13} weight="500" color={t.t2} style={{ marginBottom: 6 }}>Tarix</Txt>
      {history === null ? (
        <Skeleton height={60} />
      ) : history.length === 0 ? (
        <Txt size={13} color={t.t4} style={{ paddingVertical: 12 }}>
          Hali kirim ham, to‘lov ham yo‘q
        </Txt>
      ) : history.map((h) => {
        const isBuy = h.kind === 'purchase';
        return (
          <View key={h.kind + h.id} style={{
            flexDirection: 'row', alignItems: 'center', gap: 11,
            paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line,
          }}>
            <Icon name={isBuy ? 'truck' : 'money'} size={18} color={isBuy ? t.warn : t.ok} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt size={14}>{isBuy ? 'Yuk qabul qilindi' : 'To‘lov qilindi'}</Txt>
              <Txt size={11} color={t.t4} style={{ marginTop: 1 }}>
                {dateShort(h.date)}
                {isBuy && Array.isArray(h.items) ? ` · ${h.items.length} xil tovar` : ''}
                {h.actor ? ` · ${h.actor}` : ''}
              </Txt>
            </View>
            <Txt size={14} weight="500" color={isBuy ? t.warn : t.ok}>
              {isBuy ? '+' : '−'}{money(isBuy ? h.total : h.amount)}
            </Txt>
          </View>
        );
      })}
    </Sheet>
  );
}
