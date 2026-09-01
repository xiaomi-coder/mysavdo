import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Btn, Input, Icon, Card } from '../ui';
import { useFeedback, buzz } from '../ui/Feedback';
import { money, timeShort } from '../lib/format';
import { R, alpha } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Kassa smenasi

   Do'kon egasining eng katta og'rig'i — kassadan pul yo'qolishi.
   Smena shuni yopadi:

     ochish  — sotuvchi kassadagi boshlang'ich pulni kiritadi
     ishlash — har sotuv shu smenaga yoziladi
     yopish  — tizim "kassada qancha bo'lishi kerak"ini aytadi,
               sotuvchi sanagan summani kiritadi, FARQ ko'rinadi

   Faqat NAQD hisoblanadi — plastik va o'tkazma kassaga tushmaydi.
   Qaytarish manfiy summa bo'lgani uchun o'zi ayiriladi.
   ══════════════════════════════════════════════════════════════════════ */

export default function ShiftSheet({ onClose }) {
  const { t } = useTheme();
  const d = useData();
  const { notify } = useFeedback();

  const [cash, setCash] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);   // yopilgandan keyingi xulosa

  const num = (v) => v.replace(/\D/g, '').slice(0, 12);

  const open = async () => {
    setBusy(true);
    const r = await d.openShift(cash);
    setBusy(false);
    if (r.error) { notify(r.error, 'error'); return; }
    buzz('ok');
    notify('Smena ochildi', 'ok');
    onClose();
  };

  const close = async () => {
    setBusy(true);
    const r = await d.closeShift(cash, note);
    setBusy(false);
    if (r.error) { notify(r.error, 'error'); return; }
    buzz('ok');
    setResult(r.closed);
  };

  /* ── Yopilgandan keyingi xulosa ── */
  if (result) {
    const diff = Number(result.difference || 0);
    const col = diff === 0 ? t.ok : diff > 0 ? t.warn : t.err;
    return (
      <Sheet visible onClose={onClose} title="Smena yopildi">
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Icon name={diff === 0 ? 'check-circle' : 'warning'} size={44} color={col} fill />
          <Txt size={26} weight="700" mono color={col} style={{ marginTop: 10 }}>
            {diff > 0 ? '+' : ''}{money(diff)}
          </Txt>
          <Txt size={13} color={t.t3} style={{ marginTop: 4 }}>
            {diff === 0 ? 'Kassa to‘g‘ri keldi'
              : diff > 0 ? 'Kassada ortiqcha pul' : 'Kassada yetishmayapti'}
          </Txt>
        </View>

        <Card pad={14} style={{ marginTop: 14, gap: 9 }}>
          <Row t={t} label="Boshlang‘ich" value={money(result.opening_cash)} />
          <Row t={t} label="Naqd savdo" value={money(result.cash_net)} />
          <Row t={t} label="Bo‘lishi kerak" value={money(result.expected_cash)} bold />
          <Row t={t} label="Sanaldi" value={money(result.counted_cash)} bold />
          <View style={{ height: 1, backgroundColor: t.line }} />
          <Row t={t} label="Cheklar" value={`${result.txn_count} ta`} />
          {Number(result.return_count) > 0 ? (
            <Row t={t} label="Qaytarish" value={`${result.return_count} ta`} />
          ) : null}
        </Card>

        <Btn title="Yopish" size="xl" full style={{ marginTop: 16 }} onPress={onClose} />
      </Sheet>
    );
  }

  /* ── Ochiq smena bor: yopish ── */
  if (d.shift) {
    const expected = Number(d.shift.expected_cash || 0);
    const counted = parseInt(cash, 10);
    const preview = Number.isFinite(counted) ? counted - expected : null;

    return (
      <Sheet visible onClose={onClose} title="Smenani yopish"
        sub={`Ochilgan: ${timeShort(d.shift.opened_at)}`}>
        <Card pad={14} style={{ gap: 9, marginBottom: 14 }}>
          <Row t={t} label="Boshlang‘ich" value={money(d.shift.opening_cash)} />
          <Row t={t} label="Naqd savdo" value={money(d.shift.cash_net)} />
          <Row t={t} label="Cheklar" value={`${d.shift.txn_count} ta`} />
          <View style={{ height: 1, backgroundColor: t.line }} />
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Txt size={14} color={t.t2} style={{ flex: 1 }}>Kassada bo‘lishi kerak</Txt>
            <Txt size={19} weight="700" mono color={t.acctext}>{money(expected)}</Txt>
          </View>
        </Card>

        <Input
          label="Kassadagi haqiqiy summa"
          value={cash}
          onChangeText={(v) => setCash(num(v))}
          keyboardType="number-pad"
          placeholder="Sanab kiriting"
          big
          autoFocus
        />

        {preview != null ? (
          <View style={{
            marginTop: 10, padding: 12, borderRadius: R.md,
            backgroundColor: alpha(preview === 0 ? t.okRgb : preview > 0 ? t.warnRgb : t.errRgb, 0.12),
          }}>
            <Txt size={13} weight="600"
              color={preview === 0 ? t.ok : preview > 0 ? t.warn : t.err}>
              {preview === 0 ? 'To‘g‘ri keladi'
                : preview > 0 ? `Ortiqcha: ${money(preview)} so‘m`
                  : `Yetishmayapti: ${money(Math.abs(preview))} so‘m`}
            </Txt>
          </View>
        ) : null}

        <Input
          label="Izoh (ixtiyoriy)"
          value={note}
          onChangeText={setNote}
          placeholder="Masalan: 20 000 chaqa berildi"
          style={{ marginTop: 12 }}
        />

        <Btn title="Smenani yopish" icon="lock-closed" size="xl" full
          disabled={cash === ''} loading={busy} onPress={close}
          style={{ marginTop: 16 }} />
      </Sheet>
    );
  }

  /* ── Smena yo'q: ochish ── */
  return (
    <Sheet visible onClose={onClose} title="Smena ochish"
      sub="Kassadagi boshlang‘ich pulni kiriting">
      <Input
        label="Boshlang‘ich summa"
        value={cash}
        onChangeText={(v) => setCash(num(v))}
        keyboardType="number-pad"
        placeholder="0"
        big
        autoFocus
      />
      <Txt size={12} color={t.t4} style={{ marginTop: 8, lineHeight: 18 }}>
        Smena yopilganda tizim naqd savdoni qo‘shib, kassada qancha
        bo‘lishi kerakligini hisoblaydi va siz sanagan summa bilan
        solishtiradi.
      </Txt>
      <Btn title="Smenani ochish" icon="cash-register" size="xl" full
        loading={busy} onPress={open} style={{ marginTop: 16 }} />
    </Sheet>
  );
}

function Row({ t, label, value, bold }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Txt size={13} color={t.t3} style={{ flex: 1 }}>{label}</Txt>
      <Txt size={14} weight={bold ? '600' : '400'} mono>{value}</Txt>
    </View>
  );
}
