import React, { useState, useEffect, useCallback } from 'react';
import { Icon, Btn, Modal, Field } from './UI';
import { supabase } from '../utils/supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   Kassa smenasi — veb

   Mobil ilovadagi bilan bir xil mantiq (`shifts` jadvali va `shift_view`):
     ochish  — kassadagi boshlang'ich pul kiritiladi
     ishlash — har sotuv shu smenaga yoziladi (transactions.shift_id)
     yopish  — tizim kutilayotgan summani hisoblaydi, sotuvchi sanagan
               summani kiritadi va FARQ ko'rinadi

   Faqat NAQD hisoblanadi. Qaytarish manfiy summa bo'lgani uchun o'zi
   ayiriladi.
   ══════════════════════════════════════════════════════════════════════ */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

export function useShift(user) {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.store_id || !user?.name) { setShift(null); setLoading(false); return null; }
    const { data } = await supabase.from('shift_view').select('*')
      .eq('store_id', user.store_id).eq('cashier', user.name).eq('status', 'open')
      .order('opened_at', { ascending: false }).limit(1);
    const row = (data && data[0]) || null;
    setShift(row);
    setLoading(false);
    return row;
  }, [user?.store_id, user?.name]);

  useEffect(() => { load(); }, [load]);

  return { shift, loading, reload: load };
}

export default function ShiftBar({ user, shift, onChanged }) {
  const [modal, setModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setModal(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          padding: '9px 13px', borderRadius: 'var(--radius-md)',
          border: `1px solid ${shift ? 'var(--color-divider)' : 'var(--warn)'}`,
          background: shift ? 'transparent' : 'var(--warnbg)',
        }}
      >
        <Icon name={shift ? 'cash-register' : 'warning'} size={16}
          color={shift ? 'var(--ok)' : 'var(--warn)'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {shift ? 'Smena ochiq' : 'Smena ochilmagan'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
            {shift
              ? `Kassada: ${money(shift.expected_cash)} so‘m · ${shift.txn_count} chek`
              : 'Kassa hisobi uchun smenani oching'}
          </div>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-accent)' }}>
          {shift ? 'Yopish' : 'Ochish'}
        </span>
      </div>

      {modal && (
        <ShiftModal
          user={user}
          shift={shift}
          onClose={() => setModal(false)}
          onDone={() => { setModal(false); onChanged?.(); }}
        />
      )}
    </>
  );
}

function ShiftModal({ user, shift, onClose, onDone }) {
  const [cash, setCash] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null);

  const num = v => v.replace(/\D/g, '').slice(0, 12);

  const open = async () => {
    setBusy(true); setErr(null);
    const { error } = await supabase.from('shifts').insert({
      store_id: user.store_id, cashier: user.name,
      opening_cash: parseInt(cash, 10) || 0, status: 'open',
    });
    setBusy(false);
    if (error && error.code !== '23505') { setErr(error.message); return; }
    onDone();
  };

  const close = async () => {
    setBusy(true); setErr(null);
    const { error } = await supabase.from('shifts').update({
      counted_cash: parseInt(cash, 10) || 0,
      note: note || null,
      closed_at: new Date().toISOString(),
      status: 'closed',
    }).eq('id', shift.id);
    if (error) { setBusy(false); setErr(error.message); return; }
    const { data } = await supabase.from('shift_view').select('*').eq('id', shift.id).limit(1);
    setBusy(false);
    setResult((data && data[0]) || null);
  };

  /* Yopilgandan keyingi xulosa */
  if (result) {
    const diff = Number(result.difference || 0);
    const col = diff === 0 ? 'var(--ok)' : diff > 0 ? 'var(--warn)' : 'var(--dang)';
    return (
      <Modal title="Smena yopildi" onClose={onDone}
        actions={<Btn variant="primary" onClick={onDone}>Tayyor</Btn>}>
        <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
          <Icon name={diff === 0 ? 'check-circle' : 'warning'} size={40} color={col} fill />
          <div className="num" style={{ fontSize: 26, fontWeight: 700, color: col, marginTop: 8 }}>
            {diff > 0 ? '+' : ''}{money(diff)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginTop: 3 }}>
            {diff === 0 ? 'Kassa to‘g‘ri keldi'
              : diff > 0 ? 'Kassada ortiqcha pul' : 'Kassada yetishmayapti'}
          </div>
        </div>
        <Line label="Boshlang‘ich" value={money(result.opening_cash)} />
        <Line label="Naqd savdo" value={money(result.cash_net)} />
        <Line label="Bo‘lishi kerak" value={money(result.expected_cash)} bold />
        <Line label="Sanaldi" value={money(result.counted_cash)} bold />
        <Line label="Cheklar" value={`${result.txn_count} ta`} />
      </Modal>
    );
  }

  /* Ochiq smena — yopish */
  if (shift) {
    const expected = Number(shift.expected_cash || 0);
    const counted = parseInt(cash, 10);
    const preview = Number.isFinite(counted) ? counted - expected : null;
    return (
      <Modal title="Smenani yopish" onClose={onClose}
        actions={
          <>
            <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
            <Btn variant="primary" icon="check" onClick={close} loading={busy} disabled={cash === ''}>
              Smenani yopish
            </Btn>
          </>
        }>
        <Line label="Boshlang‘ich" value={money(shift.opening_cash)} />
        <Line label="Naqd savdo" value={money(shift.cash_net)} />
        <Line label="Cheklar" value={`${shift.txn_count} ta`} />
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-divider)',
        }}>
          <span style={{ fontSize: 14 }}>Kassada bo‘lishi kerak</span>
          <span className="num" style={{ fontSize: 19, fontWeight: 700, color: 'var(--color-accent)' }}>
            {money(expected)}
          </span>
        </div>

        <Field label="Kassadagi haqiqiy summa" style={{ marginTop: 14 }}>
          <input className="input num" inputMode="numeric" autoFocus value={cash}
            onChange={e => setCash(num(e.target.value))} placeholder="Sanab kiriting" />
        </Field>

        {preview != null && (
          <div style={{
            marginTop: 10, padding: 11, borderRadius: 'var(--radius-md)',
            background: preview === 0 ? 'var(--okbg)' : preview > 0 ? 'var(--warnbg)' : 'var(--dangbg)',
            color: preview === 0 ? 'var(--ok)' : preview > 0 ? 'var(--warn)' : 'var(--dang)',
            fontSize: 13, fontWeight: 500,
          }}>
            {preview === 0 ? 'To‘g‘ri keladi'
              : preview > 0 ? `Ortiqcha: ${money(preview)} so‘m`
                : `Yetishmayapti: ${money(Math.abs(preview))} so‘m`}
          </div>
        )}

        <Field label="Izoh (ixtiyoriy)" style={{ marginTop: 12 }}>
          <input className="input" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Masalan: 20 000 chaqa berildi" />
        </Field>

        {err && <div style={{ color: 'var(--dang)', fontSize: 12.5, marginTop: 10 }}>{err}</div>}
      </Modal>
    );
  }

  /* Smena yo'q — ochish */
  return (
    <Modal title="Smena ochish" onClose={onClose}
      actions={
        <>
          <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
          <Btn variant="primary" icon="cash-register" onClick={open} loading={busy}>
            Smenani ochish
          </Btn>
        </>
      }>
      <Field label="Kassadagi boshlang‘ich summa">
        <input className="input num" inputMode="numeric" autoFocus value={cash}
          onChange={e => setCash(num(e.target.value))} placeholder="0" />
      </Field>
      <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 10, lineHeight: 1.6 }}>
        Smena yopilganda tizim naqd savdoni qo‘shib, kassada qancha bo‘lishi
        kerakligini hisoblaydi va siz sanagan summa bilan solishtiradi.
      </div>
      {err && <div style={{ color: 'var(--dang)', fontSize: 12.5, marginTop: 10 }}>{err}</div>}
    </Modal>
  );
}

function Line({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13.5 }}>
      <span style={{ color: 'var(--color-neutral-400)' }}>{label}</span>
      <span className="num" style={{ fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );
}
