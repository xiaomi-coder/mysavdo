import React, { useMemo, useState } from 'react';
import { View, Linking } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Btn, Avatar } from '../ui';
import { money, initials, phoneFmt, dateShort } from '../lib/format';
import { R } from '../theme';
import PaySheet from './PaySheet';
import SmsSheet from './SmsSheet';

/* Mijoz kartochkasi.

   Qo'ng'iroq va SMS tugmalari tepada — do'konchi mijozga aynan shu
   ikki narsa uchun kiradi. Pastda xaridlar tarixi: "bu odam bizdan
   nima olgan edi" degan savolga javob. */

export default function ClientSheet({ customer, onClose }) {
  const { t } = useTheme();
  const d = useData();
  const [pay, setPay] = useState(null);
  const [sms, setSms] = useState(null);

  const debts = useMemo(
    () => d.debts.filter((x) => x.customer_id === customer?.id
      && Number(x.amount || 0) - Number(x.paid_amount || 0) > 0),
    [d.debts, customer]
  );

  const debtTotal = debts.reduce(
    (s, x) => s + Number(x.amount || 0) - Number(x.paid_amount || 0), 0
  );

  const history = useMemo(
    () => d.transactions.filter((x) => x.customer_id === customer?.id).slice(0, 12),
    [d.transactions, customer]
  );

  if (!customer) return null;

  const tel = String(customer.phone || '').replace(/[^\d+]/g, '');

  return (
    <>
      <Sheet visible={Boolean(customer)} onClose={onClose}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Avatar text={initials(customer.name)} size={52} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={17} weight="500" numberOfLines={1}>{customer.name}</Txt>
            <Txt size={13} color={t.t3}>{phoneFmt(customer.phone) || 'telefon yo‘q'}</Txt>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <Btn
            title="Qo‘ng‘iroq"
            icon="phone"
            variant="ok"
            size="lg"
            style={{ flex: 1 }}
            disabled={!tel}
            onPress={() => Linking.openURL(`tel:${tel}`)}
          />
          <Btn
            title="SMS"
            icon="chat-text"
            variant="secondary"
            size="lg"
            style={{ flex: 1 }}
            disabled={!tel}
            onPress={() => setSms({ customer, debt: debtTotal })}
          />
        </View>

        {debtTotal > 0 ? (
          <View style={{
            borderWidth: 1, borderColor: t.warn, borderRadius: R.lg,
            padding: 14, marginBottom: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <View>
              <Txt size={12} color={t.warn}>Qarz</Txt>
              <Txt size={20} weight="600" style={{ marginTop: 2 }}>{money(debtTotal)} so‘m</Txt>
            </View>
            <Btn title="To‘lov olish" size="md" onPress={() => setPay(debts[0])} />
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <Stat label="Jami xarid" value={`${money(customer.total_spent)} so‘m`} t={t} />
          <Stat label="Xaridlar soni" value={String(customer.purchases || history.length)} t={t} />
        </View>

        <Txt size={13} weight="500" color={t.t2} style={{ marginBottom: 8 }}>Xaridlar tarixi</Txt>

        {history.length === 0 ? (
          <Txt size={13} color={t.t4} style={{ paddingVertical: 12 }}>Hali xarid qilmagan</Txt>
        ) : history.map((h) => {
          const items = Array.isArray(h.items) ? h.items : [];
          const label = items.length === 0 ? h.receipt_no
            : items.length === 1 ? items[0].name
            : `${items[0].name} +${items.length - 1}`;
          return (
            <View key={h.id} style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              paddingVertical: 9, borderTopWidth: 1, borderTopColor: t.line,
            }}>
              <Txt size={12} color={t.t4} mono style={{ width: 44 }}>{dateShort(h.date)}</Txt>
              <Txt size={14} style={{ flex: 1 }} numberOfLines={1}>{label}</Txt>
              <Txt size={14} weight="500" color={h.total < 0 ? t.err : t.t1}>
                {money(h.total)}
              </Txt>
            </View>
          );
        })}
      </Sheet>

      {pay && <PaySheet debt={pay} onClose={() => setPay(null)} />}
      {sms && <SmsSheet data={sms} onClose={() => setSms(null)} />}
    </>
  );
}

function Stat({ label, value, t }) {
  return (
    <View style={{
      flex: 1, borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 12,
    }}>
      <Txt size={12} color={t.t3}>{label}</Txt>
      <Txt size={16} weight="600" style={{ marginTop: 3 }}>{value}</Txt>
    </View>
  );
}
