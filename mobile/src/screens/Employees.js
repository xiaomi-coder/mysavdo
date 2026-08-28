import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth, MODULES } from '../AuthContext';
import { useData } from '../DataContext';
import {
  Screen, Card, Txt, Tap, Btn, Icon, Header, Avatar, Sheet, Input,
  Toggle, EmptyState, Skeleton, SectionLabel,
} from '../ui';
import { useFeedback } from '../ui/Feedback';
import { useTr } from '../i18n';
import { db } from '../lib/api';
import { initials } from '../lib/format';
import { R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Xodimlar

   Do'kon egasi sotuvchi qo'shadi, unga parol beradi va qaysi bo'limlarga
   kira olishini belgilaydi.

   Ruxsat kalitlari veb ilova bilan bir xil (AuthContext → MODULES).
   Shuning uchun kompyuterdan berilgan ruxsat telefonda ham, telefondan
   berilgani kompyuterda ham ishlaydi.

   Xodimni o'chirish o'rniga "to'xtatish" bor: o'chirilsa uning sotuvlari
   kimga tegishli ekani yo'qoladi. To'xtatilgan xodim tizimga kira
   olmaydi, lekin tarixi joyida qoladi.
   ══════════════════════════════════════════════════════════════════════ */

export default function Employees({ navigation }) {
  const { t } = useTheme();
  const { user } = useAuth();
  const d = useData();
  const { notify } = useFeedback();

  const [staff, setStaff] = useState(null);
  const [form, setForm] = useState(null);     // null | 'new' | xodim
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    if (!d.storeId) return;
    const { data } = await db.from('users').select('*')
      .eq('store_id', d.storeId).order('id');
    setStaff(data || []);
  }, [d.storeId]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (e) => {
    const next = e.is_active === false;
    setBusyId(e.id);
    const { error } = await db.from('users').update({ is_active: next }).eq('id', e.id);
    setBusyId(null);
    if (error) { notify(error.message, 'error'); return; }
    setStaff((l) => l.map((x) => (x.id === e.id ? { ...x, is_active: next } : x)));
    notify(next ? 'Xodim faollashtirildi' : 'Xodim to‘xtatildi', next ? 'ok' : 'info');
  };

  const owners = (staff || []).filter((x) => x.role === 'owner' || x.role === 'creator' || x.role === 'admin');
  const workers = (staff || []).filter((x) => !owners.includes(x));

  return (
    <Screen>
      <Header
        title="Xodimlar"
        onBack={() => navigation.goBack()}
        right={<Btn title="Yangi" icon="plus" size="sm" onPress={() => setForm('new')} />}
      />

      {staff === null ? (
        <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={72} />)}</View>
      ) : (
        <>
          {owners.length ? (
            <>
              <SectionLabel>DO‘KON EGASI</SectionLabel>
              <View style={{ gap: 10, marginBottom: 16 }}>
                {owners.map((e) => (
                  <StaffCard key={e.id} e={e} t={t} onPress={() => setForm(e)} me={e.id === user?.id} />
                ))}
              </View>
            </>
          ) : null}

          <SectionLabel>SOTUVCHILAR · {workers.length}</SectionLabel>
          {workers.length === 0 ? (
            <EmptyState
              icon="user-gear"
              title="Sotuvchi yo‘q"
              text="Xodim qo‘shsangiz, u o‘z emaili bilan kirib sotuv qila oladi"
              action={<Btn title="Xodim qo‘shish" onPress={() => setForm('new')} />}
            />
          ) : (
            <View style={{ gap: 10 }}>
              {workers.map((e) => (
                <StaffCard
                  key={e.id}
                  e={e}
                  t={t}
                  onPress={() => setForm(e)}
                  right={
                    <Toggle on={e.is_active !== false} onPress={() => toggleActive(e)} />
                  }
                  busy={busyId === e.id}
                />
              ))}
            </View>
          )}
        </>
      )}

      {form && (
        <StaffForm
          employee={form === 'new' ? null : form}
          storeId={d.storeId}
          onClose={() => setForm(null)}
          onSaved={(row, isNew) => {
            setStaff((l) => (isNew ? [...(l || []), row] : l.map((x) => (x.id === row.id ? row : x))));
            notify(isNew ? 'Xodim qo‘shildi' : 'Saqlandi', 'ok');
          }}
          onDeleted={(id) => setStaff((l) => l.filter((x) => x.id !== id))}
          notify={notify}
          isMe={form !== 'new' && form.id === user?.id}
        />
      )}
    </Screen>
  );
}

/* ── Ro'yxatdagi xodim ────────────────────────────────────────────────── */
function StaffCard({ e, t, onPress, right, me, busy }) {
  const off = e.is_active === false;
  const perms = Array.isArray(e.permissions) ? e.permissions : [];
  const roleLabel = { owner: 'Do‘kon egasi', creator: 'Administrator', admin: 'Administrator',
    manager: 'Menejer' }[e.role] || 'Sotuvchi';

  return (
    <Card
      pad={13}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: busy ? 0.5 : 1 }}
    >
      <Avatar text={initials(e.name)} size={44} color={off ? t.t4 : t.acc} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Txt size={15} weight="500" numberOfLines={1} color={off ? t.t3 : t.t1}>
            {e.name || e.email}
          </Txt>
          {me ? (
            <View style={{
              borderWidth: 1, borderColor: t.accdim, borderRadius: 7,
              paddingHorizontal: 6, paddingVertical: 1,
            }}>
              <Txt size={10} color={t.acctext}>siz</Txt>
            </View>
          ) : null}
        </View>
        <Txt size={12} color={t.t3} style={{ marginTop: 2 }} numberOfLines={1}>
          {roleLabel}
          {off ? ' · to‘xtatilgan' : ''}
          {perms.length ? ` · ${perms.length} bo‘lim` : ''}
        </Txt>
      </View>
      {right}
    </Card>
  );
}

/* ── Qo'shish / tahrirlash ────────────────────────────────────────────── */
function StaffForm({ employee, storeId, onClose, onSaved, onDeleted, notify, isMe }) {
  const { t } = useTheme();
  const tr = useTr();
  const isNew = !employee;
  const isOwnerRow = employee && ['owner', 'creator', 'admin'].includes(employee.role);

  const [f, setF] = useState(() => ({
    name: employee?.name || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    password: employee?.password || '',
  }));
  const [perms, setPerms] = useState(() => new Set(
    Array.isArray(employee?.permissions) && employee.permissions.length
      ? employee.permissions
      : ['pos', 'inventory', 'crm', 'nasiya', 'chek']
  ));
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));

  const toggle = (p) => setPerms((s) => {
    const n = new Set(s);
    if (n.has(p)) n.delete(p);
    else n.add(p);
    return n;
  });

  const save = async () => {
    if (!f.name.trim()) { notify('Ismni kiriting', 'error'); return; }
    if (!f.email.trim()) { notify('Emailni kiriting', 'error'); return; }
    if (!f.password.trim()) { notify('Parolni kiriting', 'error'); return; }
    if (!isOwnerRow && perms.size === 0) {
      notify('Kamida bitta bo‘limga ruxsat bering', 'error'); return;
    }

    setBusy(true);
    const permissions = [...perms];
    /* Sozlamalar yoki Xodimlarga kirsa — bu oddiy sotuvchi emas.
       Veb ilova ham shu qoidani ishlatadi. */
    const role = isOwnerRow ? employee.role
      : (permissions.includes('settings') || permissions.includes('employees')
        ? 'manager' : 'cashier');

    const payload = {
      store_id: storeId,
      name: f.name.trim(),
      phone: f.phone.trim() || null,
      email: f.email.trim().toLowerCase(),
      password: f.password,
      role,
      permissions: isOwnerRow ? employee.permissions : permissions,
    };

    const q = isNew
      ? db.from('users').insert(payload).select().single()
      : db.from('users').update(payload).eq('id', employee.id).select().single();

    const { data, error } = await q;
    setBusy(false);

    if (error) {
      notify(error.code === '23505' ? 'Bu email band' : error.message, 'error');
      return;
    }
    onSaved(data, isNew);
    onClose();
  };

  const remove = () => {
    Alert.alert(
      tr('Xodimni o‘chirish'),
      tr(`${employee.name} o‘chiriladi. Uning sotuvlari tarixda qoladi, lekin kim sotgani ko‘rinmay qoladi. To‘xtatib qo‘yish xavfsizroq.`),
      [
        { text: tr('Bekor qilish'), style: 'cancel' },
        {
          text: tr('O‘chirish'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await db.from('users').delete().eq('id', employee.id);
            if (error) { notify(error.message, 'error'); return; }
            onDeleted(employee.id);
            notify('Xodim o‘chirildi');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Sheet visible onClose={onClose} title={isNew ? 'Yangi xodim' : 'Xodim'}>
      <View style={{ gap: 10 }}>
        <Input label="Ism" value={f.name} onChangeText={set('name')} placeholder="Dilnoza Karimova" />
        <Input label="Telefon" value={f.phone} onChangeText={set('phone')}
          keyboardType="phone-pad" placeholder="+998 90 123 45 67" />
        <Input label="Email" value={f.email} onChangeText={set('email')}
          keyboardType="email-address" autoCapitalize="none"
          hint="Tizimga shu email bilan kiradi" />

        <Input
          label="Parol"
          value={f.password}
          onChangeText={set('password')}
          secureTextEntry={!reveal}
          autoCapitalize="none"
          right={
            <Tap onPress={() => setReveal((v) => !v)} hit={10} style={{ padding: 6 }}>
              <Icon name={reveal ? 'moon' : 'sun'} size={19} color={t.t3} />
            </Tap>
          }
        />

        {isOwnerRow ? (
          <View style={{
            flexDirection: 'row', gap: 10, alignItems: 'flex-start',
            padding: 12, borderRadius: R.md, backgroundColor: t.inset, marginTop: 4,
          }}>
            <Icon name="info" size={16} color={t.t4} />
            <Txt size={12} color={t.t3} style={{ flex: 1, lineHeight: 17 }}>
              Do‘kon egasiga barcha bo‘limlar ochiq — ruxsat belgilash kerak emas.
            </Txt>
          </View>
        ) : (
          <>
            <Txt size={12} color={t.t3} style={{ marginTop: 8 }}>
              Qaysi bo‘limlarga kira oladi
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MODULES.map((m) => {
                const on = perms.has(m.perm);
                return (
                  <Tap
                    key={m.perm}
                    onPress={() => toggle(m.perm)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 7,
                      height: 40, paddingHorizontal: 12, borderRadius: R.pill,
                      borderWidth: 1,
                      borderColor: on ? t.acc : t.line2,
                      backgroundColor: on ? t.line : 'transparent',
                    }}
                  >
                    {on ? <Icon name="check" size={14} color={t.acc} weight="bold" /> : null}
                    <Txt size={13} weight="500" color={on ? t.acctext : t.t3}>{m.label}</Txt>
                  </Tap>
                );
              })}
            </View>
            <Txt size={11.5} color={t.t4} style={{ lineHeight: 16, marginTop: 2 }}>
              Moliya berilmasa xodim foyda va tannarxni ko‘rmaydi.
            </Txt>
          </>
        )}

        <Btn title="Saqlash" size="lg" full loading={busy} onPress={save} style={{ marginTop: 6 }} />

        {!isNew && !isMe && !isOwnerRow ? (
          <Btn title="Xodimni o‘chirish" variant="danger" full onPress={remove} />
        ) : null}
      </View>
    </Sheet>
  );
}
