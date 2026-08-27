import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import {
  Screen, Card, Txt, Tap, Btn, Icon, Header, Avatar, SearchBar,
  SectionLabel, EmptyState, Skeleton, Sheet, Input,
} from '../ui';
import { useFeedback } from '../ui/Feedback';
import { db } from '../lib/api';
import { money, initials, phoneFmt } from '../lib/format';
import ClientSheet from '../sheets/ClientSheet';

/* Mijozlar.

   Qarzdorlar tepada alohida turadi — ular do'konchi uchun eng muhim
   ro'yxat. Muddati o'tganlari qizil, yaqinlashayotgani sariq. */

export default function Clients({ navigation }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState(false);

  /* Har mijozning qolgan qarzi */
  const debtBy = useMemo(() => {
    const m = new Map();
    d.debts.forEach((x) => {
      const left = Number(x.amount || 0) - Number(x.paid_amount || 0);
      if (left <= 0) return;
      const cur = m.get(x.customer_id) || { amount: 0, overdue: false };
      cur.amount += left;
      if (x.due_date && new Date(x.due_date).getTime() < Date.now()) cur.overdue = true;
      m.set(x.customer_id, cur);
    });
    return m;
  }, [d.debts]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = d.customers.filter((c) => c.type !== 'dealer');
    if (!s) return list;
    return list.filter((c) =>
      (c.name || '').toLowerCase().includes(s) || (c.phone || '').includes(s)
    );
  }, [d.customers, q]);

  const debtors = filtered.filter((c) => debtBy.has(c.id));
  const others = filtered.filter((c) => !debtBy.has(c.id));

  return (
    <Screen>
      <Header
        title="Mijozlar"
        onBack={() => navigation.goBack()}
        right={<Btn title="Yangi" icon="plus" size="sm" onPress={() => setAdding(true)} />}
      />

      <SearchBar value={q} onChangeText={setQ} placeholder="Ism yoki telefon" style={{ marginBottom: 14 }} />

      {d.loading ? (
        <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={66} />)}</View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="users"
          title={q ? 'Topilmadi' : 'Mijoz yo‘q'}
          text={q ? undefined : 'Nasiya berish uchun avval mijoz qo‘shing'}
          action={!q ? <Btn title="Mijoz qo‘shish" onPress={() => setAdding(true)} /> : null}
        />
      ) : (
        <>
          {debtors.length > 0 ? (
            <>
              <SectionLabel color={t.warn}>QARZDORLAR</SectionLabel>
              <View style={{ gap: 8, marginBottom: 16 }}>
                {debtors.map((c) => {
                  const info = debtBy.get(c.id);
                  const color = info.overdue ? t.err : t.warn;
                  return (
                    <Card
                      key={c.id}
                      pad={12}
                      border={t.line}
                      onPress={() => setOpen(c)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftColor: color, borderLeftWidth: 2 }}
                    >
                      <Avatar text={initials(c.name)} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Txt size={15} weight="500" numberOfLines={1}>{c.name}</Txt>
                        <Txt size={12} color={t.t3} style={{ marginTop: 1 }}>{phoneFmt(c.phone)}</Txt>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Txt size={15} weight="600" color={color}>{money(info.amount)}</Txt>
                        <Txt size={11} color={color} style={{ opacity: 0.8 }}>
                          {info.overdue ? 'muddati o‘tgan' : 'qarz'}
                        </Txt>
                      </View>
                    </Card>
                  );
                })}
              </View>
            </>
          ) : null}

          <SectionLabel>BARCHA MIJOZLAR · {others.length}</SectionLabel>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            {others.map((c, i) => (
              <Tap
                key={c.id}
                onPress={() => setOpen(c)}
                activeStyle={{ backgroundColor: t.line }}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingHorizontal: 14, paddingVertical: 11, minHeight: 52,
                  borderTopWidth: i === 0 ? 0 : 1, borderTopColor: t.line,
                }}
              >
                <Avatar text={initials(c.name)} size={38} color={t.t3} bordered={false} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt size={15} numberOfLines={1}>{c.name}</Txt>
                  <Txt size={12} color={t.t4}>{phoneFmt(c.phone)}</Txt>
                </View>
                <Icon name="caret-right" size={15} color={t.t4} />
              </Tap>
            ))}
          </Card>
        </>
      )}

      {open && <ClientSheet customer={open} onClose={() => setOpen(null)} />}

      {adding && <AddClientSheet
        onClose={() => setAdding(false)}
        onSaved={(row) => { d.addCustomer(row); notify(`${row.name} qo‘shildi`, 'ok'); }}
        storeId={user?.store_id}
        notify={notify}
      />}
    </Screen>
  );
}

function AddClientSheet({ onClose, onSaved, storeId, notify }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim()) { notify('Ismni kiriting', 'error'); return; }
    setBusy(true);
    const { data, error } = await db.from('customers').insert({
      store_id: storeId,
      name: name.trim(),
      phone: phone.trim() || null,
      type: 'regular',
    }).select().single();
    setBusy(false);
    if (error) { notify(error.message, 'error'); return; }
    onSaved(data);
    setName(''); setPhone('');
    onClose();
  };

  return (
    <Sheet visible onClose={onClose} title="Yangi mijoz">
      <View style={{ gap: 10 }}>
        <Input label="Ismi" value={name} onChangeText={setName} autoFocus placeholder="Alisher Karimov" />
        <Input
          label="Telefon"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+998 90 123 45 67"
        />
        <Btn title="Saqlash" size="lg" full loading={busy} onPress={save} style={{ marginTop: 4 }} />
      </View>
    </Sheet>
  );
}
