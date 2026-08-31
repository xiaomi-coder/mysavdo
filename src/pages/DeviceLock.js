import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Page, PageHeader, Card, SectionHeader, Icon, Btn, Tag, Modal, Field,
  Avatar, StatCard, Seg, EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   Kredit telefonlar — masofadan qulflash

   Nasiyaga sotilgan telefonni to'lov kechiksa qulflash. MyBazzar
   boshqaruvni yuritadi, haqiqiy qulflashni tashqi provayder (Android
   Management API) bajaradi. To'lov RPC (credit_pay) eng eski oydan
   yopadi va to'liq to'langanda telefonni avtomatik ochadi.
   ══════════════════════════════════════════════════════════════════════ */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const dateFmt = d => (d ? new Date(d).toLocaleDateString('uz-UZ') : '—');
const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

const STATUS = {
  pending:  { label: 'Ro‘yxatga olinmagan', color: 'var(--color-accent)', icon: 'warning-circle' },
  active:   { label: 'Ochiq',               color: 'var(--ok)',   icon: 'check-circle' },
  warned:   { label: 'Ogohlantirilgan',     color: 'var(--warn)', icon: 'warning' },
  locked:   { label: 'Qulflangan',          color: 'var(--dang)', icon: 'lock-simple' },
  released: { label: 'To‘langan',           color: 'var(--color-neutral-500)', icon: 'check' },
};

const MONTHS = [3, 6, 9, 12, 18, 24];

export default function DeviceLock() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('open');
  const [form, setForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const { data } = await supabase.from('credit_device_view').select('*')
      .eq('store_id', storeId).order('created_at', { ascending: false }).limit(1000);
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.store_id) load(user.store_id);
  }, [user, load]);

  const lists = useMemo(() => ({
    open: rows.filter(x => ['pending', 'active', 'warned'].includes(x.status)),
    locked: rows.filter(x => x.status === 'locked'),
    released: rows.filter(x => x.status === 'released'),
  }), [rows]);

  const stats = useMemo(() => {
    const managed = rows.filter(x => x.status !== 'released');
    const sum = (arr, k) => arr.reduce((s, x) => s + Number(x[k] || 0), 0);
    const now = new Date();
    const dueThisMonth = managed.reduce((s, x) => {
      if (!x.next_due_date) return s;
      const dt = new Date(x.next_due_date);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
        ? s + Number(x.next_due_amount || 0) : s;
    }, 0);
    return {
      open: lists.open.length,
      locked: lists.locked.length,
      warned: rows.filter(x => x.status === 'warned').length,
      outstanding: sum(managed, 'sched_left'),
      overdue: sum(managed, 'overdue_amount'),
      dueThisMonth,
    };
  }, [rows, lists]);

  const list = lists[tab] || [];

  return (
    <Page>
      <PageHeader title="Kredit telefonlar"
        subtitle="Nasiyaga sotilgan telefonni to‘lov kechiksa masofadan qulflash">
        <Btn variant="primary" icon="plus" onClick={() => setForm(true)}>Yangi kredit telefon</Btn>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <StatCard label="Qolgan qarz" value={money(stats.outstanding)} unit="so‘m" icon="wallet" />
        <StatCard label="Bu oy kutilmoqda" value={money(stats.dueThisMonth)} unit="so‘m" icon="calendar" />
        <StatCard label="Muddati o‘tgan" value={money(stats.overdue)} unit="so‘m" icon="warning"
          accent={stats.overdue ? 'var(--dang)' : undefined} />
        <StatCard label="Qulflangan" value={stats.locked} unit="ta" icon="lock-simple"
          accent={stats.locked ? 'var(--dang)' : undefined} />
      </div>

      <Seg
        options={[
          { value: 'open', label: `Faol · ${lists.open.length}` },
          { value: 'locked', label: `Qulflangan · ${lists.locked.length}` },
          { value: 'released', label: `To‘langan · ${lists.released.length}` },
        ]}
        value={tab}
        onChange={setTab}
      />

      {loading ? (
        <SkeletonRows count={4} widths={['100%']} />
      ) : list.length === 0 ? (
        <EmptyState icon="lock-simple"
          text={tab === 'open' ? 'Kredit telefon yo‘q' : 'Bo‘sh'}
          sub={tab === 'open' ? 'Nasiyaga telefon sotganda shu yerga qo‘shiladi' : undefined}
          action={tab === 'open'
            ? <Btn variant="primary" icon="plus" onClick={() => setForm(true)}>Kredit telefon qo‘shish</Btn>
            : null} />
      ) : (
        <Card padding={0}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Telefon</th>
                  <th>Mijoz</th>
                  <th style={{ textAlign: 'right' }}>Qolgan qarz</th>
                  <th>Keyingi to‘lov</th>
                  <th>Muddat</th>
                  <th>Holat</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map(x => {
                  const st = STATUS[x.status] || STATUS.active;
                  const od = Number(x.overdue_count || 0) > 0;
                  return (
                    <tr key={x.id} onClick={() => setDetail(x)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{x.model || 'Telefon'}</div>
                        <div className="num" style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                          {x.imei}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{x.client_name || '—'}</div>
                        {x.client_phone && (
                          <div className="num" style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                            {x.client_phone}
                          </div>
                        )}
                      </td>
                      <td className="num" style={{ textAlign: 'right', fontWeight: 500 }}>
                        {money(x.sched_left)}
                        <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', fontWeight: 400 }}>
                          / {money(x.sched_total)}
                        </div>
                      </td>
                      <td>
                        {x.status === 'released' ? (
                          <span style={{ color: 'var(--ok)', fontSize: 12.5 }}>Yakunlangan</span>
                        ) : od ? (
                          <div>
                            <div className="num" style={{ color: 'var(--dang)', fontWeight: 500 }}>
                              {money(x.overdue_amount)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--dang)' }}>
                              {x.overdue_days} kun kechikdi
                            </div>
                          </div>
                        ) : x.next_due_date ? (
                          <div>
                            <div className="num" style={{ fontWeight: 500 }}>{money(x.next_due_amount)}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                              {dateFmt(x.next_due_date)}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-neutral-500)', fontSize: 12.5 }}>—</span>
                        )}
                      </td>
                      <td>
                        <MonthsBar paid={x.months_paid} total={x.months_total} />
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: st.color }}>
                          <Icon name={st.icon} size={15} color={st.color} />
                          <span style={{ fontSize: 12.5 }}>{st.label}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Icon name="caret-right" size={15} color="var(--color-neutral-500)" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {form && (
        <DeviceForm
          user={user}
          onClose={() => setForm(false)}
          onSaved={(msg) => { setToast({ msg, variant: 'ok' }); load(user.store_id); }}
          onError={(msg) => setToast({ msg, variant: 'dang' })}
        />
      )}

      {detail && (
        <DeviceDetail
          device={detail}
          user={user}
          onClose={() => setDetail(null)}
          onChanged={(msg) => { setToast({ msg, variant: 'ok' }); load(user.store_id); }}
          onError={(msg) => setToast({ msg, variant: 'dang' })}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

/* ── Qo'shish ─────────────────────────────────────────────────────────── */
function DeviceForm({ user, onClose, onSaved, onError }) {
  const [f, setF] = useState({
    imei: '', model: '', clientName: '', clientPhone: '', price: '', down: '', months: 6,
  });
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState(null);
  const [enrollQr, setEnrollQr] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  /* QR ekrani ochilgach worker AMAPI'dan haqiqiy QR tayyorlaydi va
     telefon skanerlab ro'yxatdan o'tishini kutamiz */
  useEffect(() => {
    if (!qr) return undefined;
    let alive = true;
    const tick = async () => {
      const { data } = await supabase.from('credit_devices')
        .select('enroll_qr, enrollment_id, status').eq('id', qr.id).single();
      if (!alive || !data) return;
      if (data.enroll_qr) setEnrollQr(data.enroll_qr);
      if (data.status === 'active' || data.enrollment_id) { setEnrolled(true); alive = false; }
    };
    tick();
    const iv = setInterval(tick, 3000);
    return () => { alive = false; clearInterval(iv); };
  }, [qr]);

  const plan = useMemo(() => {
    const price = parseInt(f.price, 10) || 0;
    const down = parseInt(f.down, 10) || 0;
    const financed = Math.max(0, price - down);
    const monthly = f.months > 0 ? Math.ceil(financed / f.months / 1000) * 1000 : 0;
    return { price, down, financed, monthly };
  }, [f.price, f.down, f.months]);

  const valid = f.imei.replace(/\D/g, '').length >= 14 && f.model.trim()
    && f.clientName.trim() && plan.price > 0 && plan.financed > 0;

  const save = async () => {
    if (!valid) { onError('Barcha maydonlarni to‘ldiring'); return; }
    setSaving(true);

    const { data: dev, error } = await supabase.from('credit_devices').insert({
      store_id: user.store_id,
      imei: f.imei.replace(/\D/g, ''),
      model: f.model.trim(),
      client_name: f.clientName.trim(),
      client_phone: f.clientPhone.trim() || null,
      price: plan.price,
      down_payment: plan.down,
      months: f.months,
      provider: 'amapi',
      status: 'pending',
    }).select().single();

    if (error) {
      setSaving(false);
      onError(error.code === '23505' ? 'Bu IMEI allaqachon kredit ro‘yxatida' : error.message);
      return;
    }

    const now = new Date();
    const rows = [];
    let remaining = plan.financed;
    for (let n = 1; n <= f.months; n++) {
      const due = new Date(now.getFullYear(), now.getMonth() + n, now.getDate());
      const amount = n === f.months ? remaining : plan.monthly;
      remaining -= amount;
      rows.push({ device_id: dev.id, n, due_date: due.toISOString().slice(0, 10), amount });
    }
    await supabase.from('credit_schedule').insert(rows);

    setSaving(false);
    setQr({ ...dev, monthly: plan.monthly, store: user.store_id });
  };

  if (qr) {
    const done = () => { onSaved('Kredit telefon qo‘shildi'); onClose(); };

    if (enrolled) {
      return (
        <Modal title="Ro‘yxatga olindi" onClose={done}
          actions={<Btn variant="primary" onClick={done}>Tayyor</Btn>}>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <Icon name="shield-check" size={48} color="var(--ok)" />
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 10 }}>Telefon ro‘yxatdan o‘tdi</div>
            <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginTop: 6, lineHeight: 1.6 }}>
              {qr.model} endi MyBazzar boshqaruvida. To‘lov kechiksa masofadan
              qulflanadi, to‘langach avtomatik ochiladi.
            </div>
          </div>
        </Modal>
      );
    }

    return (
      <Modal title="Telefonni ro‘yxatga olish" onClose={done}
        actions={<Btn variant="primary" onClick={done}>Keyinroq</Btn>}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{
            padding: 14, background: '#fff', borderRadius: 12, flex: 'none',
            width: 218, height: 218, display: 'grid', placeItems: 'center',
          }}>
            {enrollQr ? (
              <QRCodeSVG value={enrollQr} size={190} level="L" />
            ) : (
              <div style={{ textAlign: 'center', color: '#999' }}>
                <Icon name="spinner-gap" size={26} color="#999" />
                <div style={{ fontSize: 12, marginTop: 8 }}>QR tayyorlanmoqda…</div>
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{qr.model}</div>
            <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginBottom: 14 }}>
              {money(qr.monthly)} so‘m/oy
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.9, color: 'var(--color-neutral-300)' }}>
              <li>Telefonni <b>zavod holatida</b> yoqing</li>
              <li>Salomlashuv ekranida <b>6 marta bosing</b></li>
              <li>Shu QR kodni skanerlang</li>
            </ol>
            <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', marginTop: 14, lineHeight: 1.6 }}>
              Skanerlangach telefon to‘g‘ridan-to‘g‘ri MyBazzar boshqaruviga
              qo‘shiladi. Bu oyna ochiq tursin — ro‘yxatdan o‘tishi o‘zi tasdiqlanadi.
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Yangi kredit telefon" onClose={onClose} wide
      actions={
        <>
          <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
          <Btn variant="primary" icon="qr-code" onClick={save} loading={saving} disabled={!valid}>
            Qo‘shish va ro‘yxatga olish
          </Btn>
        </>
      }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-500)' }}>TELEFON VA MIJOZ</div>
          <Field label="IMEI">
            <input className="input num" value={f.imei}
              onChange={e => set('imei', e.target.value.replace(/\D/g, '').slice(0, 15))}
              placeholder="15 xonali" />
          </Field>
          <Field label="Model">
            <input className="input" value={f.model} onChange={e => set('model', e.target.value)}
              placeholder="Samsung Galaxy A55" />
          </Field>
          <Field label="Mijoz ismi">
            <input className="input" value={f.clientName} onChange={e => set('clientName', e.target.value)}
              placeholder="Alisher Karimov" />
          </Field>
          <Field label="Mijoz telefoni">
            <input className="input num" value={f.clientPhone}
              onChange={e => set('clientPhone', e.target.value)} placeholder="+998 90 …" />
          </Field>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-neutral-500)' }}>NASIYA SHARTI</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="To‘liq narx">
              <input className="input num" value={f.price}
                onChange={e => set('price', e.target.value.replace(/\D/g, ''))} placeholder="0" />
            </Field>
            <Field label="Boshlang‘ich">
              <input className="input num" value={f.down}
                onChange={e => set('down', e.target.value.replace(/\D/g, ''))} placeholder="0" />
            </Field>
          </div>
          <Field label="Muddat">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MONTHS.map(m => (
                <button key={m} onClick={() => set('months', m)}
                  style={{
                    padding: '7px 13px', borderRadius: 16, cursor: 'pointer', font: 'inherit', fontSize: 12.5,
                    border: `1px solid ${f.months === m ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                    background: f.months === m ? 'var(--color-accent-900)' : 'transparent',
                    color: f.months === m ? 'var(--color-accent)' : 'var(--color-neutral-400)',
                  }}>{m} oy</button>
              ))}
            </div>
          </Field>

          {plan.financed > 0 && (
            <div style={{
              marginTop: 4, padding: 13, borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent-900)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--color-neutral-400)' }}>Nasiyaga</span>
                <span className="num" style={{ fontWeight: 500 }}>{money(plan.financed)}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-divider)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--color-accent)' }}>Oylik to‘lov</span>
                <span className="num" style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-accent)' }}>
                  {money(plan.monthly)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ── Tafsilot ─────────────────────────────────────────────────────────── */
function DeviceDetail({ device, user, onClose, onChanged, onError }) {
  const [schedule, setSchedule] = useState(null);
  const [busy, setBusy] = useState(false);
  const [payFor, setPayFor] = useState(null);

  const st = STATUS[device.status] || STATUS.active;

  const load = useCallback(async () => {
    const { data } = await supabase.from('credit_schedule').select('*')
      .eq('device_id', device.id).order('n');
    setSchedule(data || []);
  }, [device.id]);

  useEffect(() => { load(); }, [load]);

  const paid = (schedule || []).reduce((s, x) => s + Number(x.paid_amount || 0), 0);
  const total = (schedule || []).reduce((s, x) => s + Number(x.amount || 0), 0);
  const left = total - paid;
  // Eng eski to'lanmagan oy — "To'lov qabul qilish" shu oyni ochadi
  const nextUnpaid = (schedule || []).find(s => Number(s.paid_amount || 0) < Number(s.amount || 0));

  const command = async (action, reason) => {
    setBusy(true);
    const patch = { status: action === 'lock' ? 'locked' : 'active' };
    patch.locked_at = action === 'lock' ? new Date().toISOString() : null;
    const { error: e1 } = await supabase.from('credit_devices').update(patch).eq('id', device.id);
    if (e1) { setBusy(false); onError(e1.message); return; }
    const { error: e2 } = await supabase.from('lock_commands').insert({
      device_id: device.id, action, reason, actor: user.name,
    });
    setBusy(false);
    if (e2) { onError(e2.message); return; }
    onChanged(action === 'lock' ? 'Qulflash buyrug‘i yuborildi' : 'Ochish buyrug‘i yuborildi');
    onClose();
  };

  const tel = String(device.client_phone || '').replace(/\s/g, '');

  return (
    <>
      <Modal title={device.model || 'Telefon'} onClose={onClose} wide
        actions={
          device.status === 'released' ? (
            <Btn variant="secondary" onClick={onClose}>Yopish</Btn>
          ) : (
            <>
              {nextUnpaid && (
                <Btn variant="primary" icon="hand-coins" onClick={() => setPayFor(nextUnpaid)}>
                  To‘lov qabul qilish
                </Btn>
              )}
              {device.status === 'locked' ? (
                <Btn variant="secondary" icon="lock-simple-open" onClick={() => command('unlock', 'Qo‘lda ochildi')}
                  loading={busy}>Ochish</Btn>
              ) : (
                <Btn variant="danger" icon="lock-simple" onClick={() => command('lock', 'Qo‘lda qulflandi')}
                  loading={busy}>Qulflash</Btn>
              )}
            </>
          )
        }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Chap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, color: st.color,
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'color-mix(in srgb, currentColor 10%, transparent)', alignSelf: 'flex-start',
            }}>
              <Icon name={st.icon} size={17} color={st.color} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{st.label}</span>
            </div>

            <div className="row-link" style={{ cursor: 'default' }}>
              <Avatar initials={initialsOf(device.client_name)} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5 }}>{device.client_name || 'Mijoz'}</div>
                <div className="num" style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                  {device.client_phone || '—'}
                </div>
              </div>
              {tel && (
                <a href={`tel:${tel}`}>
                  <Icon name="phone" size={18} color="var(--ok)" />
                </a>
              )}
            </div>

            <div className="num" style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
              IMEI {device.imei}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <MiniStat label="To‘langan" value={money(paid)} color="var(--ok)" />
              <MiniStat label="Qolgan" value={money(left)} color={left > 0 ? 'var(--warn)' : 'var(--ok)'} />
            </div>

            {device.status === 'pending' && (
              <div style={{
                display: 'flex', gap: 9, alignItems: 'flex-start',
                padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--warnbg)',
              }}>
                <Icon name="warning" size={16} color="var(--warn)" />
                <span style={{ fontSize: 11.5, color: 'var(--color-neutral-400)', lineHeight: 1.55 }}>
                  Telefon hali ro‘yxatga olinmagan. Zavod holatida QR skanerlanmaguncha
                  qulflash ishlamaydi — buyruq navbatda kutadi.
                </span>
              </div>
            )}
          </div>

          {/* O'ng: jadval */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>To‘lov jadvali</div>
            {schedule === null ? (
              <SkeletonRows count={3} widths={['100%']} />
            ) : (
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {schedule.map(s => {
                  const full = Number(s.paid_amount) >= Number(s.amount);
                  const overdue = !full && new Date(s.due_date) < new Date();
                  return (
                    <div key={s.id}
                      onClick={full || device.status === 'released' ? undefined : () => setPayFor(s)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0',
                        borderBottom: '1px solid var(--color-divider)',
                        cursor: full || device.status === 'released' ? 'default' : 'pointer',
                      }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flex: 'none',
                        display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600,
                        background: full ? 'var(--okbg)' : overdue ? 'var(--dangbg)' : 'var(--color-surface)',
                        color: full ? 'var(--ok)' : overdue ? 'var(--dang)' : 'var(--color-neutral-400)',
                      }}>
                        {full ? <Icon name="check" size={14} color="var(--ok)" /> : s.n}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: full ? 'var(--color-neutral-500)' : 'inherit' }}>
                          {s.n}-oy · {dateFmt(s.due_date)}
                        </div>
                        {overdue && <div style={{ fontSize: 11, color: 'var(--dang)' }}>muddati o‘tgan</div>}
                      </div>
                      <span className="num" style={{
                        fontSize: 13, fontWeight: 500,
                        color: full ? 'var(--color-neutral-500)' : 'inherit',
                      }}>{money(s.amount)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {payFor && (
        <PayModal device={device} item={payFor} user={user}
          onClose={() => setPayFor(null)}
          onPaid={(msg) => { load(); onChanged(msg); }}
          onError={onError} />
      )}
    </>
  );
}

function MonthsBar({ paid, total }) {
  const p = Number(paid || 0);
  const t = Number(total || 0);
  const pct = t > 0 ? Math.round((p / t) * 100) : 0;
  return (
    <div style={{ minWidth: 70 }}>
      <div style={{ fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontWeight: 500 }}>{p}</span>
        <span style={{ color: 'var(--color-neutral-500)' }}> / {t} oy</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--color-divider)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 2,
          background: pct >= 100 ? 'var(--ok)' : 'var(--color-accent)',
        }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ flex: 1, padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-divider)' }}>
      <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{label}</div>
      <div className="num" style={{ fontSize: 17, fontWeight: 600, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function PayModal({ device, item, user, onClose, onPaid, onError }) {
  const left = Number(item.amount) - Number(item.paid_amount);
  const [amount, setAmount] = useState(String(Math.round(left)));
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const v = parseInt(amount, 10) || 0;
    if (v <= 0) { onError('Summani kiriting'); return; }
    setSaving(true);
    const { data, error } = await supabase.rpc('credit_pay', {
      p_device: device.id, p_amount: v, p_actor: user.name,
    });
    setSaving(false);
    if (error) { onError(error.message); return; }
    onPaid(data?.released ? 'To‘liq to‘landi — telefon ochildi'
      : data?.unlocked ? 'To‘lov qabul qilindi — telefon ochildi'
        : `${money(v)} so‘m qabul qilindi`);
    onClose();
  };

  return (
    <Modal title="To‘lov qabul qilish" onClose={onClose}
      actions={
        <>
          <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
          <Btn variant="primary" icon="check" onClick={submit} loading={saving} disabled={!amount}>
            Qabul qilish
          </Btn>
        </>
      }>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginBottom: 12 }}>
        {item.n}-oy · {money(left)} so‘m qoldi
      </div>
      <Field label="To‘lov summasi">
        <input className="input num" inputMode="numeric" value={amount} autoFocus
          onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="0" />
      </Field>
    </Modal>
  );
}
