import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Page, PageHeader, Card, Icon, Btn, Tag, Modal, Field, Avatar,
  EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

/* Sidebar moduli ↔ ruxsat kaliti. Bu ro'yxat AuthContext dagi
   ROLE_NAV.perm qiymatlari bilan mos bo'lishi shart. */
const MODULES = [
  { perm: 'pos', label: 'POS' },
  { perm: 'dashboard_owner', label: 'Dashboard' },
  { perm: 'inventory', label: 'Ombor' },
  { perm: 'crm', label: 'CRM' },
  { perm: 'nasiya', label: 'Nasiya' },
  { perm: 'finance', label: 'Moliya' },
  { perm: 'reports', label: 'Hisobot' },
  { perm: 'chek', label: 'Chek' },
  { perm: 'employees', label: 'Xodimlar' },
  { perm: 'settings', label: 'Sozlamalar' },
];

const ROLE_LABEL = { owner: 'Do‘kon egasi', manager: 'Manager', cashier: 'Sotuvchi' };

/* ══════════════════════════════════════════════════════════════════════════
   Xodimlar
   ══════════════════════════════════════════════════════════════════════ */

export default function Employees() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(null); // null | 'new' | xodim
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [userRes, txnRes] = await Promise.all([
      supabase.from('users').select('*').eq('store_id', storeId),
      supabase.from('transactions').select('cashier, total').eq('store_id', storeId)
        .eq('status', 'completed').gte('date', monthStart),
    ]);

    // Oylik sotuvni kassir ismi bo'yicha yig'amiz
    const byCashier = {};
    (txnRes.data || []).forEach(t => {
      const k = t.cashier || '—';
      if (!byCashier[k]) byCashier[k] = { sales: 0, txns: 0 };
      byCashier[k].sales += Number(t.total) || 0;
      byCashier[k].txns += 1;
    });

    setStaff((userRes.data || [])
      .filter(u => u.role !== 'owner' && u.role !== 'creator')
      .map(u => ({
        ...u,
        active: u.is_active !== false,
        sales: byCashier[u.name]?.sales || 0,
        txns: byCashier[u.name]?.txns || 0,
      }))
      .sort((a, b) => b.sales - a.sales));
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  /* Noaktiv xodim tizimga kira olmaydi — login shu ustunni tekshiradi */
  const toggleActive = async (s) => {
    setStaff(prev => prev.map(x => x.id === s.id ? { ...x, active: !x.active } : x));
    const { error } = await supabase.from('users').update({ is_active: !s.active }).eq('id', s.id);
    if (error) {
      setStaff(prev => prev.map(x => x.id === s.id ? { ...x, active: s.active } : x));
      setToast({ msg: `O‘zgartirilmadi: ${error.message}`, variant: 'dang' });
    } else {
      setToast({ msg: `${s.name} — ${s.active ? 'kirish to‘xtatildi' : 'kirishga ruxsat berildi'}`, variant: 'ok' });
    }
  };

  const top = staff.find(s => s.sales > 0);
  const maxSales = top?.sales || 1;
  const activeCount = staff.filter(s => s.active).length;

  return (
    <Page>
      <PageHeader title="Xodimlar" subtitle="Jamoa va savdo faoliyatini boshqarish">
        <Btn variant="primary" icon="plus" onClick={() => setShowForm('new')}>Yangi Xodim</Btn>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <Card padding={13} gap={4}>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Jami xodimlar</div>
          <div className="num" style={{ fontSize: 20, fontWeight: 500 }}>{staff.length}</div>
        </Card>
        <Card padding={13} gap={4}>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Aktiv</div>
          <div className="num" style={{ fontSize: 20, fontWeight: 500, color: 'var(--ok)' }}>{activeCount}</div>
        </Card>
        <Card padding={13} gap={4}>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Eng yaxshi sotuvchi</div>
          <div style={{ fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
            {top ? <><Icon name="trophy" fill size={16} color="var(--warn)" />{top.name}</>
              : <span style={{ color: 'var(--color-neutral-500)', fontSize: 14 }}>—</span>}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, alignItems: 'start' }}>
        <Card padding="var(--space-6)">
          {loading ? <SkeletonRows count={5} widths={['100%']} />
            : staff.length === 0 ? (
              <EmptyState
                icon="identification-badge" text="Xodimlar yo‘q"
                sub="Kassir yoki manager qo‘shing — ular tizimga o‘z login bilan kiradi"
                action={<Btn variant="primary" size="sm" icon="plus" onClick={() => setShowForm('new')}>Yangi Xodim</Btn>}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th>Xodim</th><th>Aloqa</th>
                      <th style={{ textAlign: 'right' }}>Sotuvlar (oy)</th>
                      <th>Holat</th><th />
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar initials={initialsOf(s.name)} size={32}
                              color={s === top ? undefined : 'var(--color-neutral-800)'} />
                            <div>
                              <div style={{ fontWeight: 500, color: s.active ? undefined : 'var(--color-neutral-400)' }}>
                                {s.name}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                                {ROLE_LABEL[s.role] || s.role}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="num" style={{ color: 'var(--color-neutral-400)' }}>{s.phone || s.email || '—'}</td>
                        <td className="num" style={{ textAlign: 'right', fontWeight: 500 }}>
                          {s.sales > 0 ? money(s.sales) : <span style={{ color: 'var(--color-neutral-500)' }}>—</span>}
                        </td>
                        <td>{s.active ? <Tag variant="ok">Aktiv</Tag> : <Tag variant="neutral">Noaktiv</Tag>}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Btn variant="secondary" size="sm" onClick={() => setDetail(s)}>Ko‘rish</Btn>
                            <Switch
                              on={s.active}
                              title={s.active ? 'Kirishni to‘xtatish' : 'Kirishga ruxsat berish'}
                              onChange={() => toggleActive(s)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card padding="var(--space-6)" gap={9}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500 }}>
              <Icon name="trophy" fill size={16} color="var(--warn)" />
              Top Xodim — bu oy
            </div>
            {top ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Avatar initials={initialsOf(top.name)} size={40} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{top.name}</div>
                  <div className="num" style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                    {top.txns} tranzaksiya · {money(top.sales)} so‘m
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
                Bu oyda hali sotuv qilinmagan
              </div>
            )}
          </Card>

          <Card padding="var(--space-6)" gap={11}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Sotuv Reytingi</div>
            {staff.filter(s => s.sales > 0).length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>Ma’lumot yig‘ilmagan</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                {staff.filter(s => s.sales > 0).map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{s.name}</span>
                      <span className="num" style={{ color: 'var(--color-neutral-400)' }}>
                        {(s.sales / 1000000).toFixed(1)} mln
                      </span>
                    </div>
                    <div style={{ height: 7, borderRadius: 4, background: 'color-mix(in srgb, var(--color-text) 6%, transparent)' }}>
                      <div style={{
                        width: `${Math.round((s.sales / maxSales) * 100)}%`, height: '100%', borderRadius: 4,
                        background: i === 0 ? 'var(--color-accent)' : i === 1 ? 'var(--color-accent-700)' : 'var(--color-accent-800)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {showForm && (
        <EmployeeForm
          storeId={user?.store_id}
          employee={showForm === 'new' ? null : showForm}
          onClose={() => setShowForm(null)}
          onSaved={(name) => {
            setShowForm(null); setDetail(null);
            load(user.store_id);
            setToast({ msg: `${name} saqlandi`, variant: 'ok' });
          }}
          onError={m => setToast({ msg: m, variant: 'dang' })}
        />
      )}

      {detail && (
        <EmployeeDetail
          employee={detail}
          onClose={() => setDetail(null)}
          onEdit={() => setShowForm(detail)}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

/* ── Xodim qo'shish / tahrirlash ───────────────────────────────────────── */
function EmployeeForm({ storeId, employee, onClose, onSaved, onError }) {
  const editing = Boolean(employee);
  const [f, setF] = useState({
    name: employee?.name || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    password: employee?.password || '',
  });
  const [perms, setPerms] = useState(() => {
    if (Array.isArray(employee?.permissions)) return new Set(employee.permissions);
    return new Set(['pos']);
  });
  const [reveal, setReveal] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggle = (perm) => setPerms(prev => {
    const n = new Set(prev);
    n.has(perm) ? n.delete(perm) : n.add(perm);
    return n;
  });

  const valid = f.name.trim() && f.email.trim() && f.password.trim() && perms.size > 0;

  const save = async () => {
    setSaving(true);
    const permissions = [...perms];
    // Sozlamalarga kirish huquqi bo'lsa — manager, aks holda kassir
    const role = permissions.includes('settings') || permissions.includes('employees') ? 'manager' : 'cashier';
    const row = {
      store_id: storeId, name: f.name.trim(), phone: f.phone.trim() || null,
      email: f.email.trim(), password: f.password, role, permissions,
    };

    const { error } = editing
      ? await supabase.from('users').update(row).eq('id', employee.id)
      : await supabase.from('users').insert(row);

    setSaving(false);
    if (error) onError(`Saqlanmadi: ${error.message}`);
    else onSaved(row.name);
  };

  return (
    <Modal title={editing ? 'Xodimni tahrirlash' : 'Yangi Xodim'} onClose={onClose} wide actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" onClick={save} disabled={!valid} loading={saving}>Saqlash</Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <Field label="Ism">
            <input className="input" autoFocus value={f.name} onChange={e => set('name', e.target.value)}
              placeholder="Masalan: Sardor Olimov" />
          </Field>
          <Field label="Telefon">
            <input className="input num" value={f.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+998 90 123 45 67" />
          </Field>
          <Field label="Email" hint="Tizimga shu email bilan kiradi">
            <input className="input" value={f.email} onChange={e => set('email', e.target.value)}
              placeholder="sardor@mybazzar.uz" />
          </Field>
          <Field label="Parol">
            <div className="input" style={{ display: 'flex', alignItems: 'center', padding: 0, paddingInline: 10 }}>
              <input
                type={reveal ? 'text' : 'password'} value={f.password}
                onChange={e => set('password', e.target.value)}
                style={{ flex: 1, background: 'none', border: 0, outline: 'none', color: 'inherit', font: 'inherit', padding: '6px 0' }}
              />
              <Icon name={reveal ? 'eye-slash' : 'eye'} size={15} color="var(--color-neutral-500)"
                style={{ cursor: 'pointer' }} onClick={() => setReveal(r => !r)} />
            </div>
          </Field>
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--color-neutral-400)', display: 'block', marginBottom: 7 }}>
            Ruxsatlar
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {MODULES.map(m => {
              const on = perms.has(m.perm);
              return (
                <button key={m.perm} onClick={() => toggle(m.perm)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px',
                  borderRadius: 8, cursor: 'pointer', font: 'inherit', fontSize: 12.5, textAlign: 'left',
                  border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                  background: on ? 'var(--color-accent-900)' : 'transparent',
                  color: on ? 'var(--color-text)' : 'var(--color-neutral-400)',
                }}>
                  <Icon name={on ? 'check-square' : 'square'} fill={on} size={16}
                    color={on ? 'var(--color-accent)' : 'currentColor'} />
                  {m.label}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)', marginTop: 6 }}>
            Sidebar’da faqat ruxsat berilgan modullar ko‘rinadi. Sozlamalar yoki Xodimlar
            ruxsati berilsa xodim <b style={{ fontWeight: 500 }}>manager</b>, aks holda
            <b style={{ fontWeight: 500 }}> sotuvchi</b> bo‘ladi.
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Xodim detali ──────────────────────────────────────────────────────── */
function EmployeeDetail({ employee: e, onClose, onEdit }) {
  const [reveal, setReveal] = useState(false);
  const perms = Array.isArray(e.permissions) ? e.permissions : [];
  const permLabels = perms.map(p => MODULES.find(m => m.perm === p)?.label).filter(Boolean);

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Avatar initials={initialsOf(e.name)} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{e.name}</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
            {ROLE_LABEL[e.role] || e.role} · <span style={{ color: e.active ? 'var(--ok)' : 'var(--color-neutral-400)' }}>
              {e.active ? 'Aktiv' : 'Noaktiv'}
            </span>
          </div>
        </div>
        <Btn variant="secondary" size="sm" icon="pencil-simple" onClick={onEdit}>O‘zgartirish</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 12 }}>
        <Card elev={null} padding={11} gap={3}>
          <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>Jami sotuv (oy)</div>
          <div className="num" style={{ fontSize: 16, fontWeight: 500 }}>{money(e.sales)}</div>
        </Card>
        <Card elev={null} padding={11} gap={3}>
          <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>Tranzaksiyalar</div>
          <div className="num" style={{ fontSize: 16, fontWeight: 500 }}>{e.txns} ta</div>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 12.5 }}>
        <DetailRow label="Telefon" value={<span className="num">{e.phone || '—'}</span>} />
        <DetailRow label="Email" value={e.email || '—'} />
        <DetailRow label="Parol" value={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ letterSpacing: reveal ? 0 : 2 }}>{reveal ? e.password : '••••••••'}</span>
            <Icon name={reveal ? 'eye-slash' : 'eye'} size={14} color="var(--color-neutral-500)"
              style={{ cursor: 'pointer' }} onClick={() => setReveal(r => !r)} />
          </span>
        } />
        <DetailRow label="Ruxsatlar" last
          value={permLabels.length ? permLabels.join(' · ') : 'Rol bo‘yicha standart'} />
      </div>
    </Modal>
  );
}

function DetailRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      padding: '8px 0', borderBottom: last ? 'none' : '1px solid var(--color-divider)',
    }}>
      <span style={{ color: 'var(--color-neutral-500)', flex: 'none' }}>{label}</span>
      <span style={{ textAlign: 'right' }}>{value}</span>
    </div>
  );
}

/* ── Yoqish/o'chirish tugmasi ──────────────────────────────────────────── */
function Switch({ on, onChange, title }) {
  return (
    <span
      role="switch" aria-checked={on} title={title} onClick={onChange}
      style={{
        width: 36, height: 21, borderRadius: 11, position: 'relative', flex: 'none',
        display: 'inline-block', cursor: 'pointer', transition: 'background .15s',
        background: on ? 'var(--color-accent)' : 'var(--color-neutral-700)',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 17 : 2,
        width: 17, height: 17, borderRadius: '50%', transition: 'left .15s',
        background: on ? 'var(--color-bg)' : 'var(--color-neutral-400)',
      }} />
    </span>
  );
}
