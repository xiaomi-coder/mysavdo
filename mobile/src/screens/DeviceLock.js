import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Linking } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Btn, Icon, Header, Avatar, Chip, Sheet, Input,
  EmptyState, Skeleton, SectionLabel,
} from '../ui';
import { useFeedback, buzz } from '../ui/Feedback';
import { db } from '../lib/api';
import { money, dateShort, phoneFmt, initials } from '../lib/format';
import { R, alpha } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Kredit telefonlar — masofadan qulflash

   Nasiyaga sotilgan telefon to'lov kechiksa qulflanadi. MyBazzar
   boshqaruvni yuritadi: kim, qaysi telefonni, qancha to'laganini va
   qulf holatini. Haqiqiy qulflashni tashqi provayder (Android
   Management API) bajaradi — do'konchi bu yerdan buyruq beradi.

   Holatlar rangi bilan ajraladi:
     yashil  — ochiq, to'lovlar ketyapti
     sariq   — muddat o'tdi, ogohlantirilgan
     qizil   — qulflangan
     kulrang — to'liq to'landi, chiqarildi
   ══════════════════════════════════════════════════════════════════════ */

const STATUS = {
  pending:  { label: 'Ro‘yxatga olinmagan', color: 'blue',  icon: 'warning-circle' },
  active:   { label: 'Ochiq',               color: 'ok',    icon: 'check-circle' },
  warned:   { label: 'Ogohlantirilgan',     color: 'warn',  icon: 'warning' },
  locked:   { label: 'Qulflangan',          color: 'dang',  icon: 'lock' },
  released: { label: 'To‘langan',           color: 'dim',   icon: 'check' },
};

export default function DeviceLock({ navigation }) {
  const { t } = useTheme();
  const d = useData();

  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('open');
  const [detail, setDetail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!d.storeId) return;
    const { data } = await db.from('credit_device_view').select('*')
      .eq('store_id', d.storeId).order('created_at', { ascending: false }).limit(500);
    setRows(data || []);
  }, [d.storeId]);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const lists = useMemo(() => {
    const all = rows || [];
    return {
      open: all.filter((x) => ['pending', 'active', 'warned'].includes(x.status)),
      locked: all.filter((x) => x.status === 'locked'),
      released: all.filter((x) => x.status === 'released'),
    };
  }, [rows]);

  const list = lists[filter] || [];
  const lockedCount = lists.locked.length;
  const warnedCount = (rows || []).filter((x) => x.status === 'warned').length;

  const totals = useMemo(() => {
    const managed = (rows || []).filter((x) => x.status !== 'released');
    const sum = (k) => managed.reduce((s, x) => s + Number(x[k] || 0), 0);
    const now = new Date();
    const dueThisMonth = managed.reduce((s, x) => {
      if (!x.next_due_date) return s;
      const dt = new Date(x.next_due_date);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
        ? s + Number(x.next_due_amount || 0) : s;
    }, 0);
    return { outstanding: sum('sched_left'), overdue: sum('overdue_amount'), dueThisMonth };
  }, [rows]);

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <Header
        title="Kredit telefonlar"
        onBack={() => navigation.goBack()}
        right={<Btn title="Yangi" icon="plus" size="sm"
          onPress={() => navigation.navigate('KreditYangi')} />}
      />

      {/* Moliyaviy xulosa */}
      {rows && rows.length > 0 ? (
        <Card pad={14} style={{ marginBottom: 12, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Txt size={11} color={t.t4}>Qolgan qarz</Txt>
            <Txt size={16} weight="700" mono style={{ marginTop: 2 }}>{money(totals.outstanding)}</Txt>
          </View>
          <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: t.line, paddingLeft: 12 }}>
            <Txt size={11} color={t.t4}>Bu oy</Txt>
            <Txt size={16} weight="700" mono style={{ marginTop: 2 }}>{money(totals.dueThisMonth)}</Txt>
          </View>
          <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: t.line, paddingLeft: 12 }}>
            <Txt size={11} color={t.t4}>Muddati o‘tgan</Txt>
            <Txt size={16} weight="700" mono color={totals.overdue ? t.err : t.t2}
              style={{ marginTop: 2 }}>{money(totals.overdue)}</Txt>
          </View>
        </Card>
      ) : null}

      {/* Ogohlantirish */}
      {(lockedCount > 0 || warnedCount > 0) ? (
        <Card pad={14} border={lockedCount ? t.err : t.warn} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name={lockedCount ? 'lock' : 'warning'} size={20}
              color={lockedCount ? t.err : t.warn} />
            <Txt size={13.5} color={lockedCount ? t.err : t.warn} style={{ flex: 1 }}>
              {lockedCount > 0 ? `${lockedCount} telefon qulflangan` : ''}
              {lockedCount > 0 && warnedCount > 0 ? ' · ' : ''}
              {warnedCount > 0 ? `${warnedCount} ta ogohlantirilgan` : ''}
            </Txt>
          </View>
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        <Chip label="Faol" count={lists.open.length} active={filter === 'open'}
          onPress={() => setFilter('open')} />
        <Chip label="Qulflangan" count={lists.locked.length} active={filter === 'locked'}
          color={t.err} onPress={() => setFilter('locked')} />
        <Chip label="To‘langan" count={lists.released.length} active={filter === 'released'}
          onPress={() => setFilter('released')} />
      </View>

      {rows === null ? (
        <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={78} />)}</View>
      ) : list.length === 0 ? (
        <EmptyState
          icon="lock"
          title={filter === 'open' ? 'Kredit telefon yo‘q' : 'Bo‘sh'}
          text={filter === 'open'
            ? 'Nasiyaga telefon sotganda shu yerga qo‘shiladi'
            : undefined}
          action={filter === 'open'
            ? <Btn title="Kredit telefon qo‘shish" onPress={() => navigation.navigate('KreditYangi')} />
            : null}
        />
      ) : (
        <View style={{ gap: 10 }}>
          {list.map((x) => (
            <DeviceRow key={x.id} device={x} t={t} onPress={() => setDetail(x)} />
          ))}
        </View>
      )}

      {detail && (
        <DeviceSheet
          device={detail}
          onClose={() => setDetail(null)}
          onChanged={() => { load(); }}
        />
      )}
    </Screen>
  );
}

function DeviceRow({ device, t, onPress }) {
  const st = STATUS[device.status] || STATUS.active;
  const color = st.color === 'dim' ? t.t4 : ({ ok: t.ok, warn: t.warn, dang: t.err, blue: t.blue }[st.color]);
  const od = Number(device.overdue_count || 0) > 0;
  const left = Number(device.sched_left || 0);
  const mp = Number(device.months_paid || 0);
  const mt = Number(device.months_total || 0);
  const released = device.status === 'released';

  return (
    <Card pad={12} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: alpha(t.shimRgb, 0.06),
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={st.icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt size={14.5} weight="500" numberOfLines={1}>{device.model || 'Telefon'}</Txt>
        <Txt size={12} color={t.t3} numberOfLines={1} style={{ marginTop: 1 }}>
          {device.client_name || '—'} · {phoneFmt(device.client_phone)}
        </Txt>
        {/* Moliyaviy holat */}
        {released ? (
          <Txt size={11.5} color={t.ok} style={{ marginTop: 3 }}>To‘liq to‘landi</Txt>
        ) : od ? (
          <Txt size={11.5} color={t.err} weight="500" style={{ marginTop: 3 }}>
            {device.overdue_days} kun kechikdi · {money(device.overdue_amount)}
          </Txt>
        ) : device.next_due_date ? (
          <Txt size={11.5} color={t.t4} style={{ marginTop: 3 }}>
            Keyingi: {money(device.next_due_amount)} · {dateShort(device.next_due_date)}
          </Txt>
        ) : (
          <Txt size={11} color={t.t4} mono style={{ marginTop: 3 }}>IMEI {device.imei}</Txt>
        )}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        {!released && (
          <Txt size={14} weight="600" mono>{money(left)}</Txt>
        )}
        <Txt size={11} color={t.t4}>{mp}/{mt} oy</Txt>
        <Txt size={11.5} weight="500" color={color}>{st.label}</Txt>
      </View>
    </Card>
  );
}

/* ── Tafsilot: jadval, qulf boshqaruvi, to'lov ────────────────────────── */
function DeviceSheet({ device, onClose, onChanged }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const { notify } = useFeedback();

  const [schedule, setSchedule] = useState(null);
  const [busy, setBusy] = useState(false);
  const [payFor, setPayFor] = useState(null);

  const load = useCallback(async () => {
    const { data } = await db.from('credit_schedule').select('*')
      .eq('device_id', device.id).order('n');
    setSchedule(data || []);
  }, [device.id]);

  useEffect(() => { load(); }, [load]);

  const st = STATUS[device.status] || STATUS.active;
  const color = st.color === 'dim' ? t.t4 : ({ ok: t.ok, warn: t.warn, dang: t.err, blue: t.blue }[st.color]);
  const tel = String(device.client_phone || '').replace(/[^\d+]/g, '');

  const paid = (schedule || []).reduce((s, x) => s + Number(x.paid_amount || 0), 0);
  const total = (schedule || []).reduce((s, x) => s + Number(x.amount || 0), 0);
  const left = total - paid;
  // Eng eski to'lanmagan oy — "To'lov qabul qilish" shu oyni ochadi
  const nextUnpaid = (schedule || []).find(s => Number(s.paid_amount || 0) < Number(s.amount || 0));

  /* Qo'lda qulflash/ochish — buyruq navbatga tushadi, ijrochi
     provayderga uzatadi */
  const command = async (action, reason) => {
    setBusy(true);
    const newStatus = action === 'lock' ? 'locked' : 'active';
    const patch = { status: newStatus };
    if (action === 'lock') patch.locked_at = new Date().toISOString();
    else patch.locked_at = null;

    const { error: e1 } = await db.from('credit_devices').update(patch).eq('id', device.id);
    if (e1) { setBusy(false); notify(e1.message, 'error'); return; }

    const { error: e2 } = await db.from('lock_commands').insert({
      device_id: device.id, action, reason, actor: user?.name,
    });
    setBusy(false);
    if (e2) { notify(e2.message, 'error'); return; }

    buzz(action === 'lock' ? 'warn' : 'ok');
    notify(action === 'lock' ? 'Qulflash buyrug‘i yuborildi' : 'Ochish buyrug‘i yuborildi',
      action === 'lock' ? 'info' : 'ok');
    onChanged();
    onClose();
  };

  const isOpen = ['pending', 'active', 'warned'].includes(device.status);

  return (
    <>
      <Sheet visible onClose={onClose}>
        {/* Sarlavha */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <View style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: alpha(t.shimRgb, 0.06),
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={st.icon} size={24} color={color} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={17} weight="500" numberOfLines={1}>{device.model || 'Telefon'}</Txt>
            <Txt size={12.5} weight="500" color={color}>{st.label}</Txt>
          </View>
        </View>

        {/* Mijoz */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          padding: 12, borderRadius: R.lg, backgroundColor: t.inset, marginBottom: 12,
        }}>
          <Avatar text={initials(device.client_name)} size={40} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={14} weight="500" numberOfLines={1}>{device.client_name || 'Mijoz'}</Txt>
            <Txt size={12} color={t.t3}>{phoneFmt(device.client_phone)}</Txt>
          </View>
          {tel ? (
            <Tap onPress={() => Linking.openURL(`tel:${tel}`)} hit={10}
              style={{
                width: 40, height: 40, borderRadius: 20,
                borderWidth: 1, borderColor: t.ok,
                alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name="phone" size={19} color={t.ok} />
            </Tap>
          ) : null}
        </View>

        <Txt size={11} color={t.t4} mono style={{ marginBottom: 12 }}>IMEI {device.imei}</Txt>

        {/* Qarz holati */}
        <View style={{
          flexDirection: 'row', gap: 10, marginBottom: 14,
        }}>
          <Stat label="To‘langan" value={money(paid)} color={t.ok} t={t} />
          <Stat label="Qolgan" value={money(left)} color={left > 0 ? t.warn : t.ok} t={t} />
        </View>

        {/* To'lov va qulf boshqaruvi */}
        {device.status !== 'released' ? (
          <View style={{ gap: 10, marginBottom: 16 }}>
            {nextUnpaid ? (
              <Btn title="To‘lov qabul qilish" icon="hand-coins" size="xl" full
                onPress={() => setPayFor(nextUnpaid)} />
            ) : null}
            {device.status === 'locked' ? (
              <Btn title="Telefonni ochish" icon="lock-simple-open" variant="secondary" size="lg"
                full loading={busy} onPress={() => command('unlock', 'Qo‘lda ochildi')} />
            ) : (
              <Btn title="Telefonni qulflash" icon="lock" variant="danger" size="lg"
                full loading={busy} onPress={() => command('lock', 'Qo‘lda qulflandi')} />
            )}
          </View>
        ) : null}

        {device.provider === 'amapi' && !device.enrollment_id && isOpen ? (
          <View style={{
            flexDirection: 'row', gap: 9, alignItems: 'flex-start',
            padding: 12, borderRadius: R.md, backgroundColor: alpha(t.warnRgb, 0.1),
            marginBottom: 14,
          }}>
            <Icon name="warning" size={16} color={t.warn} />
            <Txt size={11.5} color={t.t3} style={{ flex: 1, lineHeight: 17 }}>
              Telefon hali ro‘yxatga olinmagan. Zavod holatida QR skanerlanmaguncha
              qulflash ishlamaydi — buyruq navbatda kutadi.
            </Txt>
          </View>
        ) : null}

        {/* To'lov jadvali */}
        <SectionLabel>TO‘LOV JADVALI</SectionLabel>
        {schedule === null ? (
          <Skeleton height={50} />
        ) : schedule.map((s) => {
          const full = Number(s.paid_amount) >= Number(s.amount);
          const overdue = !full && new Date(s.due_date) < new Date();
          // Qisman to'langan oy uchun QOLGAN summa ko'rsatiladi.
          // Ilgari to'liq oylik turaverardi va to'lovdan keyin ham
          // o'zgarmasdi — do'konchi qancha qolganini bilmasdi.
          const partial = Number(s.paid_amount) > 0 && !full;
          const left = Number(s.amount) - Number(s.paid_amount || 0);
          return (
            <Tap
              key={s.id}
              onPress={full ? undefined : () => setPayFor(s)}
              disabled={full || device.status === 'released'}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 11,
                paddingVertical: 11, borderTopWidth: 1, borderTopColor: t.line,
              }}
            >
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: full ? alpha(t.okRgb, 0.15) : overdue ? alpha(t.errRgb, 0.12) : t.inset,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {full
                  ? <Icon name="check" size={15} color={t.ok} weight="bold" />
                  : <Txt size={12} weight="600" color={overdue ? t.err : t.t3}>{s.n}</Txt>}
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={13.5} color={full ? t.t3 : t.t1}>{s.n}-oy · {dateShort(s.due_date)}</Txt>
                {overdue ? <Txt size={11} color={t.err}>muddati o‘tgan</Txt> : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Txt size={13.5} weight="500" color={full ? t.t4 : t.t1}>
                  {money(full ? s.amount : left)}
                </Txt>
                {partial ? (
                  <Txt size={11} color={t.ok} mono>{money(s.paid_amount)} to‘landi</Txt>
                ) : null}
              </View>
              {!full && device.status !== 'released'
                ? <Icon name="caret-right" size={15} color={t.t4} />
                : null}
            </Tap>
          );
        })}
      </Sheet>

      {payFor && (
        <PaySheet
          device={device}
          item={payFor}
          onClose={() => setPayFor(null)}
          onPaid={() => { load(); onChanged(); }}
        />
      )}
    </>
  );
}

function Stat({ label, value, color, t }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 12 }}>
      <Txt size={12} color={t.t3}>{label}</Txt>
      <Txt size={17} weight="600" color={color} style={{ marginTop: 2 }}>{value}</Txt>
    </View>
  );
}

/* To'lov — credit_pay RPC eng eski oydan boshlab yopadi va kerak
   bo'lsa telefonni avtomatik ochadi */
function PaySheet({ device, item, onClose, onPaid }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const { notify } = useFeedback();
  const left = Number(item.amount) - Number(item.paid_amount);
  const [amount, setAmount] = useState(String(Math.round(left)));
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const v = parseInt(amount, 10) || 0;
    if (v <= 0) { notify('Summani kiriting', 'error'); return; }
    setBusy(true);
    const { data, error } = await db.rpc('credit_pay', {
      p_device: device.id, p_amount: v, p_actor: user?.name,
    });
    setBusy(false);
    if (error) { notify(error.message, 'error'); return; }
    buzz('ok');
    notify(
      data?.released ? 'To‘liq to‘landi — telefon ochildi'
        : data?.unlocked ? 'To‘lov qabul qilindi — telefon ochildi'
          : `${money(v)} so‘m qabul qilindi`,
      'ok');
    onPaid();
    onClose();
  };

  return (
    <Sheet visible onClose={onClose} title="To‘lov qabul qilish"
      sub={`${item.n}-oy · ${money(left)} so‘m qoldi`}>
      <Input
        label="To‘lov summasi"
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/\D/g, '').slice(0, 12))}
        keyboardType="number-pad"
        big
      />
      <Btn title="To‘lovni qabul qilish" size="xl" full loading={busy}
        onPress={submit} style={{ marginTop: 14 }} />
    </Sheet>
  );
}
