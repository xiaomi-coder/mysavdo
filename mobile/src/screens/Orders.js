import React, { useState, useMemo } from 'react';
import { View, Linking } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Btn, Chip, Icon, EmptyState, Skeleton, PhotoBox,
} from '../ui';
import { useFeedback } from '../ui/Feedback';
import { db } from '../lib/api';
import { money, ago, phoneFmt } from '../lib/format';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Onlayn buyurtmalar

   Mijoz do'konning onlayn katalogidan buyurtma bersa shu yerga tushadi.
   Ikki tugma: qabul qilish yoki rad etish.

   Qabul qilinganda ombor darhol yechiladi — aks holda o'sha tovarni
   do'konda ham sotib yuborish mumkin. Rad etilganda ombor tegilmaydi,
   chunki u hali yechilmagan edi.
   ══════════════════════════════════════════════════════════════════════ */

const TABS = [
  { key: 'new', label: 'Yangi' },
  { key: 'done', label: 'Qabul qilingan' },
  { key: 'rejected', label: 'Rad etilgan' },
];

export default function Orders() {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const [tab, setTab] = useState('new');
  const [busyId, setBusyId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const online = useMemo(
    () => d.transactions.filter((x) => x.payment_method === 'online'),
    [d.transactions]
  );

  const lists = useMemo(() => ({
    new: online.filter((x) => x.status === 'online_pending'),
    done: online.filter((x) => x.status === 'completed'),
    rejected: online.filter((x) => x.status === 'rejected'),
  }), [online]);

  const list = lists[tab];

  const accept = async (o) => {
    setBusyId(o.id);
    /* Avval omborni yechamiz. Yechilmasa (tovar tugab qolgan bo'lsa)
       buyurtma yangiligicha qoladi — sotuvchi mijozga qo'ng'iroq
       qilib tushuntiradi. */
    const { error: stockErr } = await db.rpc('apply_sale', { p_txn: o.id, p_actor: user?.name });
    if (stockErr) {
      setBusyId(null);
      notify(stockErr.message, 'error');
      return;
    }

    const { error } = await db.from('transactions')
      .update({ status: 'completed' }).eq('id', o.id);
    setBusyId(null);

    if (error) { notify(error.message, 'error'); return; }

    d.setTransactions((l) => l.map((x) => (x.id === o.id ? { ...x, status: 'completed' } : x)));
    (Array.isArray(o.items) ? o.items : []).forEach((it) => {
      const p = d.products.find((x) => x.id === it.id);
      if (p) d.patchProduct(p.id, { stock: Math.max(0, (p.stock || 0) - (it.qty || 1)) });
    });
    notify('Buyurtma qabul qilindi', 'ok');
  };

  const reject = async (o) => {
    setBusyId(o.id);
    const { error } = await db.from('transactions')
      .update({ status: 'rejected' }).eq('id', o.id);
    setBusyId(null);
    if (error) { notify(error.message, 'error'); return; }
    d.setTransactions((l) => l.map((x) => (x.id === o.id ? { ...x, status: 'rejected' } : x)));
    notify('Buyurtma rad etildi');
  };

  const refresh = async () => {
    setRefreshing(true);
    await d.reload({ silent: true });
    setRefreshing(false);
  };

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Txt size={17} weight="500">Buyurtmalar</Txt>
        {lists.new.length > 0 ? (
          <Txt size={17} weight="500" color={t.acc}>{lists.new.length}</Txt>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {TABS.map((x) => (
          <Chip
            key={x.key}
            label={x.label}
            count={lists[x.key].length}
            active={tab === x.key}
            onPress={() => setTab(x.key)}
          />
        ))}
      </View>

      {d.loading ? (
        <View style={{ gap: 12 }}>
          <Skeleton height={190} />
          <Skeleton height={190} />
        </View>
      ) : list.length === 0 ? (
        <EmptyState
          icon="tray"
          title={tab === 'new' ? 'Yangi buyurtma yo‘q' : 'Bo‘sh'}
          text={tab === 'new'
            ? 'Onlayn buyurtmalar shu yerda paydo bo‘ladi va bildirishnoma keladi'
            : undefined}
        />
      ) : (
        <View style={{ gap: 12 }}>
          {list.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              busy={busyId === o.id}
              onAccept={() => accept(o)}
              onReject={() => reject(o)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function OrderCard({ order: o, busy, onAccept, onReject }) {
  const { t } = useTheme();
  const items = Array.isArray(o.items) ? o.items : [];
  const isNew = o.status === 'online_pending';

  /* Onlayn buyurtmada mijoz ismi va telefoni cashier maydoniga
     "Saytdan: Ism · +998…" ko'rinishida yoziladi */
  const raw = String(o.cashier || '').replace(/^Saytdan:\s*/, '');
  const [name, phone] = raw.split('·').map((s) => s.trim());

  const border = isNew ? t.accdim : o.status === 'rejected' ? t.line : t.ok;

  return (
    <Card border={border} pad={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt size={15} weight="500">{name || 'Mijoz'}</Txt>
        <Txt size={12} color={t.t4}>{ago(o.date)}</Txt>
      </View>

      {phone ? (
        <Tap
          onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
        >
          <Icon name="phone" size={16} color={t.acc} />
          <Txt size={14} color={t.acc}>{phoneFmt(phone) || phone}</Txt>
        </Tap>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 }}>
        {items.map((it, i) => (
          <View key={i} style={{
            flexDirection: 'row', alignItems: 'center', gap: 7,
            backgroundColor: t.inset, borderRadius: R.sm,
            paddingVertical: 6, paddingRight: 9, paddingLeft: 6,
          }}>
            <PhotoBox uri={it.photo_url} emoji={it.image} size={26} radius={6} />
            <Txt size={12} color={t.t2}>{it.name}{it.qty > 1 ? ` ×${it.qty}` : ''}</Txt>
          </View>
        ))}
      </View>

      <Txt size={18} weight="600" style={{ marginBottom: isNew ? 12 : 0 }}>
        {money(o.total)} <Txt size={13} color={t.t4}>so‘m</Txt>
      </Txt>

      {isNew ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn title="Qabul qilish" variant="ok" size="lg" style={{ flex: 1 }} loading={busy} onPress={onAccept} />
          <Btn title="Rad etish" variant="danger" size="lg" style={{ flex: 1 }} disabled={busy} onPress={onReject} />
        </View>
      ) : (
        <Txt size={12} color={o.status === 'rejected' ? t.err : t.ok} style={{ marginTop: 6 }}>
          {o.status === 'rejected' ? 'Rad etilgan' : 'Qabul qilingan'}
        </Txt>
      )}
    </Card>
  );
}
