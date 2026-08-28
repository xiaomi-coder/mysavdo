import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Page, Card, Icon, Btn, Tag, Modal, Field, Avatar, SectionHeader,
  EmptyState, SkeletonRows, Toast, StatCard,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { uniqueSlug } from '../utils/slug';
import { storeUrl } from '../utils/storeHost';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

const PLANS = [
  { value: 1, label: 'Starter' },
  { value: 3, label: 'Business' },
  { value: 10, label: 'Enterprise' },
];
const planOf = n => PLANS.slice().reverse().find(p => (n || 1) >= p.value)?.label || 'Starter';

const ROLE_LABEL = { owner: 'Egasi', manager: 'Manager', cashier: 'Sotuvchi', creator: 'Creator' };

/* ══════════════════════════════════════════════════════════════════════════
   Creator Panel — platforma darajasidagi boshqaruv.
   Barcha do'konlar va foydalanuvchilar shu yerdan yaratiladi.
   ══════════════════════════════════════════════════════════════════════ */

export default function CreatorPanel({ page = 'dashboard' }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenue, setRevenue] = useState({});
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const [storeForm, setStoreForm] = useState(null);   // null | 'new' | store
  const [userForm, setUserForm] = useState(null);
  const [confirm, setConfirm] = useState(null);       // { type, store }

  const load = useCallback(async () => {
    setLoading(true);
    const [storeRes, userRes, txnRes] = await Promise.all([
      supabase.from('stores').select('*').order('id'),
      supabase.from('users').select('*'),
      supabase.from('transactions').select('store_id, total').eq('status', 'completed')
        .gte('date', new Date(Date.now() - 365 * 86400000).toISOString()),
    ]);
    setStores(storeRes.data || []);
    setUsers(userRes.data || []);

    const byStore = {};
    (txnRes.data || []).forEach(t => {
      byStore[t.store_id] = (byStore[t.store_id] || 0) + (Number(t.total) || 0);
    });
    setRevenue(byStore);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = (msg, variant = 'ok') => setToast({ msg, variant });

  const toggleActive = async (s) => {
    const { error } = await supabase.from('stores').update({ is_active: !s.is_active }).eq('id', s.id);
    if (error) notify(`O‘zgartirilmadi: ${error.message}`, 'dang');
    else { load(); notify(`"${s.name}" ${s.is_active ? 'to‘xtatildi' : 'davom ettirildi'}`); }
    setConfirm(null);
  };

  const deleteStore = async (s) => {
    const { error } = await supabase.from('stores').delete().eq('id', s.id);
    if (error) notify(`O‘chirilmadi: ${error.message}`, 'dang');
    else { load(); notify(`"${s.name}" o‘chirildi`); }
    setConfirm(null);
  };

  const totalRevenue = useMemo(
    () => Object.values(revenue).reduce((s, v) => s + v, 0), [revenue]
  );

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter(s => [s.name, s.owner_email].some(v => String(v || '').toLowerCase().includes(q)));
  }, [stores, search]);

  const staffCount = users.filter(u => u.role !== 'creator').length;

  return (
    <Page style={{ padding: 0, gap: 0 }}>
      {/* ── Platforma sarlavhasi ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px',
        borderBottom: '1px solid var(--color-divider)',
        background: 'linear-gradient(90deg, var(--color-accent-900), transparent 60%)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flex: 'none',
          background: 'var(--color-accent)', color: 'var(--color-bg)',
          display: 'grid', placeItems: 'center',
        }}>
          <Icon name="wrench" fill size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Creator Panel</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Platforma va do‘konlar boshqaruvi</div>
        </div>
        <Tag variant="accent" icon="shield-star">Platforma darajasi</Tag>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar initials={initialsOf(user?.name)} size={28} />
          <span style={{ fontSize: 12.5 }}>{user?.name}</span>
        </div>
      </div>

      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        {page === 'dashboard' || page === 'stats' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            <StatCard icon="storefront" label="Jami do‘konlar" value={stores.length} />
            <StatCard icon="check-circle" label="Aktiv do‘konlar" value={stores.filter(s => s.is_active).length} />
            <StatCard icon="users-three" label="Foydalanuvchilar" value={staffCount} />
            <StatCard icon="money" label="Umumiy aylanma" value={money(totalRevenue)} unit="so‘m" />
          </div>
        ) : null}

        {/* ── Do'konlar ── */}
        {(page === 'dashboard' || page === 'stores' || page === 'stats') && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>Do‘konlar · {stores.length}</div>
              <div className="input-icon" style={{ width: 250 }}>
                <Icon name="magnifying-glass" />
                <input className="input" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Do‘kon qidirish…" />
              </div>
              <Btn variant="primary" icon="plus" onClick={() => setStoreForm('new')}>Yangi Do‘kon</Btn>
            </div>

            <Card padding="var(--space-6)">
              {loading ? <SkeletonRows count={4} widths={['100%']} />
                : filteredStores.length === 0 ? (
                  <EmptyState icon="storefront" text="Do‘konlar yo‘q"
                    action={<Btn variant="primary" size="sm" icon="plus" onClick={() => setStoreForm('new')}>Yangi Do‘kon</Btn>} />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th>Do‘kon</th><th>Egasi</th><th>Tarif</th>
                          <th style={{ textAlign: 'right' }}>Aylanma</th>
                          <th>Yaratilgan</th><th>Holat</th><th />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStores.map(s => (
                          <tr key={s.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                <span style={{
                                  width: 28, height: 28, borderRadius: 7, display: 'grid', placeItems: 'center',
                                  fontSize: 14, flex: 'none',
                                  background: 'color-mix(in srgb, var(--color-text) 6%, transparent)',
                                  filter: s.is_active ? 'none' : 'grayscale(1)',
                                  opacity: s.is_active ? 1 : 0.6,
                                }}>
                                  {s.store_type === 'phone' ? '📱' : '🏬'}
                                </span>
                                <span style={{ fontWeight: 500, color: s.is_active ? undefined : 'var(--color-neutral-400)' }}>
                                  {s.name}
                                </span>
                              </div>
                            </td>
                            <td style={{ color: s.is_active ? undefined : 'var(--color-neutral-400)' }}>
                              {users.find(u => u.store_id === s.id && u.role === 'owner')?.name || s.owner_email || '—'}
                            </td>
                            <td><Tag variant={s.max_branches > 1 ? 'accent' : 'neutral'}>{planOf(s.max_branches)}</Tag></td>
                            <td className="num" style={{ textAlign: 'right' }}>{money(revenue[s.id] || 0)}</td>
                            <td style={{ color: 'var(--color-neutral-500)' }}>
                              {s.created_at ? new Date(s.created_at).toLocaleDateString('ru-RU') : '—'}
                            </td>
                            <td>
                              {s.is_active
                                ? <Tag variant="ok" icon="check">Aktiv</Tag>
                                : <Tag variant="warn" icon="pause">To‘xtatilgan</Tag>}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                <Btn variant="ghost" iconOnly icon="pencil-simple" title="Tahrirlash"
                                  onClick={() => setStoreForm(s)} style={{ width: 30, height: 30 }} />
                                <Btn
                                  variant="ghost" iconOnly icon={s.is_active ? 'pause' : 'play'}
                                  title={s.is_active ? 'To‘xtatish' : 'Davom ettirish'}
                                  onClick={() => s.is_active ? setConfirm({ type: 'pause', store: s }) : toggleActive(s)}
                                  style={{ width: 30, height: 30, color: s.is_active ? 'var(--warn)' : 'var(--ok)' }}
                                />
                                <Btn variant="ghost" iconOnly icon="trash" title="O‘chirish"
                                  onClick={() => setConfirm({ type: 'delete', store: s })}
                                  style={{ width: 30, height: 30, color: 'var(--dang)' }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </Card>
          </>
        )}

        {/* ── Foydalanuvchilar ── */}
        {(page === 'dashboard' || page === 'users') && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>Foydalanuvchilar · {users.length}</div>
              <Btn variant="secondary" icon="plus" onClick={() => setUserForm('new')}>Yangi Foydalanuvchi</Btn>
            </div>

            <Card padding="var(--space-6)">
              {loading ? <SkeletonRows count={4} widths={['100%']} /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr><th>Foydalanuvchi</th><th>Do‘kon</th><th>Rol</th><th>Parol</th><th>Holat</th><th /></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <UserRow key={u.id} user={u}
                          store={stores.find(s => s.id === u.store_id)}
                          onEdit={() => setUserForm(u)} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="shield-warning" size={13} color="var(--warn)" />
              Parollar bazada ochiq matnda saqlanadi — bu vaqtinchalik yechim, shifrlashga o‘tish rejalashtirilgan.
            </div>
          </>
        )}

        {page === 'settings' && (
          <Card padding="var(--space-6)" gap={12}>
            <SectionHeader title="Creator sozlamalari" />
            <EmptyState icon="gear" text="Platforma sozlamalari tayyorlanmoqda"
              sub="Tariflar, limitlar va global parametrlar shu yerda bo‘ladi" />
          </Card>
        )}
      </div>

      {storeForm && (
        <StoreForm
          store={storeForm === 'new' ? null : storeForm}
          takenSlugs={stores.map(s => s.slug)}
          onClose={() => setStoreForm(null)}
          onSaved={(name) => { setStoreForm(null); load(); notify(`"${name}" saqlandi`); }}
          onError={m => notify(m, 'dang')}
        />
      )}

      {userForm && (
        <UserForm
          user={userForm === 'new' ? null : userForm}
          stores={stores}
          onClose={() => setUserForm(null)}
          onSaved={(name) => { setUserForm(null); load(); notify(`${name} saqlandi`); }}
          onError={m => notify(m, 'dang')}
        />
      )}

      {confirm?.type === 'pause' && (
        <Modal onClose={() => setConfirm(null)} actions={
          <>
            <Btn variant="secondary" onClick={() => setConfirm(null)}>Bekor qilish</Btn>
            <Btn variant="primary" icon="pause"
              style={{ color: 'var(--warn)', borderColor: 'var(--warn)' }}
              onClick={() => toggleActive(confirm.store)}>
              To‘xtatish
            </Btn>
          </>
        }>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
            <Icon name="pause-circle" fill size={20} color="var(--warn)" />
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>Do‘konni vaqtincha to‘xtatish?</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', marginTop: 3 }}>
                "{confirm.store.name}" xodimlari tizimga kira olmaydi. Ma’lumotlar saqlanib
                qoladi — istalgan payt davom ettirish mumkin.
              </div>
            </div>
          </div>
        </Modal>
      )}

      {confirm?.type === 'delete' && (
        <DeleteStoreModal
          store={confirm.store}
          onClose={() => setConfirm(null)}
          onConfirm={() => deleteStore(confirm.store)}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

/* ── Foydalanuvchi qatori (parolni ko'rsatish/nusxalash) ───────────────── */
function UserRow({ user, store, onEdit }) {
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(user.password || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Avatar initials={initialsOf(user.name)} size={28}
            color={user.role === 'owner' || user.role === 'creator' ? undefined : 'var(--color-neutral-800)'} />
          <div>
            <div style={{ fontWeight: 500 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td>{store?.name || <span style={{ color: 'var(--color-neutral-500)' }}>Platforma</span>}</td>
      <td><Tag variant="neutral">{ROLE_LABEL[user.role] || user.role}</Tag></td>
      <td>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span className={reveal ? 'mono' : ''} style={{ letterSpacing: reveal ? 0 : 2, color: 'var(--color-neutral-400)' }}>
            {reveal ? user.password : '••••••••'}
          </span>
          <Icon name={reveal ? 'eye-slash' : 'eye'} size={14} color="var(--color-neutral-500)"
            style={{ cursor: 'pointer' }} onClick={() => setReveal(r => !r)} />
          <Icon name={copied ? 'check' : 'copy'} size={14}
            color={copied ? 'var(--ok)' : 'var(--color-neutral-500)'}
            style={{ cursor: 'pointer' }} onClick={copy} />
        </span>
      </td>
      <td>{user.is_active === false ? <Tag variant="neutral">Noaktiv</Tag> : <Tag variant="ok">Aktiv</Tag>}</td>
      <td style={{ textAlign: 'right' }}>
        <Btn variant="ghost" iconOnly icon="pencil-simple" onClick={onEdit} style={{ width: 30, height: 30 }} />
      </td>
    </tr>
  );
}

/* ── Do'kon yaratish / tahrirlash ──────────────────────────────────────── */
function StoreForm({ store, takenSlugs = [], onClose, onSaved, onError }) {
  const editing = Boolean(store);
  const [f, setF] = useState({
    name: store?.name || '',
    owner_email: store?.owner_email || '',
    store_type: store?.store_type || 'general',
    max_branches: store?.max_branches || 1,
    slug: store?.slug || '',
    owner: '', password: '',
  });
  const [slugEdited, setSlugEdited] = useState(Boolean(store?.slug));
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  /* Nom yozilganda subdomain o'zi to'ladi — foydalanuvchi qo'lda
     o'zgartirmagan bo'lsa. Tahrirlashda mavjud slug saqlanadi. */
  const setName = (v) => {
    setF(p => ({
      ...p,
      name: v,
      slug: slugEdited ? p.slug : uniqueSlug(v, takenSlugs.filter(x => x !== store?.slug)),
    }));
  };

  const valid = editing
    ? f.name.trim()
    : f.name.trim() && f.owner_email.trim() && f.owner.trim() && f.password.trim();

  const save = async () => {
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('stores').update({
        name: f.name.trim(), owner_email: f.owner_email.trim(),
        store_type: f.store_type, max_branches: Number(f.max_branches),
        slug: f.slug || null,
      }).eq('id', store.id);
      setSaving(false);
      return error ? onError(`Saqlanmadi: ${error.message}`) : onSaved(f.name);
    }

    // Yangi do'kon + uning egasi bir vaqtda yaratiladi
    const { data, error } = await supabase.from('stores').insert({
      name: f.name.trim(), owner_email: f.owner_email.trim(),
      store_type: f.store_type, max_branches: Number(f.max_branches),
      slug: f.slug || uniqueSlug(f.name, takenSlugs), is_active: true,
    }).select().single();

    if (error || !data) { setSaving(false); return onError(`Do‘kon yaratilmadi: ${error?.message}`); }

    const { error: userErr } = await supabase.from('users').insert({
      store_id: data.id, name: f.owner.trim(), email: f.owner_email.trim(),
      password: f.password, role: 'owner',
    });
    setSaving(false);
    if (userErr) onError(`Do‘kon yaratildi, lekin egasi qo‘shilmadi: ${userErr.message}`);
    else onSaved(f.name);
  };

  return (
    <Modal title={editing ? 'Do‘konni tahrirlash' : 'Yangi Do‘kon'} onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" onClick={save} disabled={!valid} loading={saving}>Saqlash</Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Do‘kon nomi">
          <input className="input" autoFocus value={f.name} onChange={e => setName(e.target.value)}
            placeholder="Texno Bozor" />
        </Field>

        <Field label="Onlayn do‘kon manzili" hint="Mijozlarga yuboriladigan havola">
          <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 0, paddingInline: 10 }}>
            <input
              className="mono" value={f.slug}
              onChange={e => { setSlugEdited(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
              placeholder="texno-bozor"
              style={{
                flex: 1, minWidth: 0, background: 'none', border: 0, outline: 'none',
                color: 'var(--color-accent)', font: 'inherit', padding: '6px 0',
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>
              .mybazzar.uz
            </span>
          </div>
        </Field>

        {f.slug && (
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginTop: -6 }}>
            {storeUrl(f.slug)}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <Field label="Do‘kon turi" hint="Telefon do‘konida IMEI maydonlari ochiladi">
            <select className="input" value={f.store_type} onChange={e => set('store_type', e.target.value)}>
              <option value="general">Oddiy do‘kon</option>
              <option value="phone">Telefon do‘koni</option>
            </select>
          </Field>
          <Field label="Tarif">
            <select className="input" value={f.max_branches} onChange={e => set('max_branches', e.target.value)}>
              {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Egasining emaili" hint={editing ? null : 'Egasi shu email bilan tizimga kiradi'}>
          <input className="input" value={f.owner_email} onChange={e => set('owner_email', e.target.value)}
            placeholder="egasi@dokon.uz" />
        </Field>

        {!editing && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <Field label="Egasining ismi">
              <input className="input" value={f.owner} onChange={e => set('owner', e.target.value)}
                placeholder="Bekzod Rahimov" />
            </Field>
            <Field label="Parol">
              <input className="input mono" value={f.password} onChange={e => set('password', e.target.value)}
                placeholder="kamida 8 belgi" />
            </Field>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ── Foydalanuvchi yaratish / tahrirlash ───────────────────────────────── */
function UserForm({ user, stores, onClose, onSaved, onError }) {
  const editing = Boolean(user);
  const [f, setF] = useState({
    name: user?.name || '', email: user?.email || '', password: user?.password || '',
    role: user?.role || 'cashier', store_id: user?.store_id || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const valid = f.name.trim() && f.email.trim() && f.password.trim() &&
    (f.role === 'creator' || f.store_id);

  const save = async () => {
    setSaving(true);
    const row = {
      name: f.name.trim(), email: f.email.trim(), password: f.password,
      role: f.role, store_id: f.role === 'creator' ? null : Number(f.store_id),
    };
    const { error } = editing
      ? await supabase.from('users').update(row).eq('id', user.id)
      : await supabase.from('users').insert(row);
    setSaving(false);
    if (error) onError(`Saqlanmadi: ${error.message}`);
    else onSaved(row.name);
  };

  return (
    <Modal title={editing ? 'Foydalanuvchini tahrirlash' : 'Yangi Foydalanuvchi'} onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" onClick={save} disabled={!valid} loading={saving}>Saqlash</Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Ism">
          <input className="input" autoFocus value={f.name} onChange={e => set('name', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <Field label="Email">
            <input className="input" value={f.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <Field label="Parol">
            <input className="input mono" value={f.password} onChange={e => set('password', e.target.value)} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <Field label="Rol">
            <select className="input" value={f.role} onChange={e => set('role', e.target.value)}>
              <option value="cashier">Sotuvchi</option>
              <option value="manager">Manager</option>
              <option value="owner">Do‘kon egasi</option>
              <option value="creator">Creator</option>
            </select>
          </Field>
          <Field label="Do‘kon" hint={f.role === 'creator' ? 'Creator do‘konga bog‘lanmaydi' : null}>
            <select className="input" value={f.store_id} disabled={f.role === 'creator'}
              onChange={e => set('store_id', e.target.value)}>
              <option value="">Tanlang…</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}

/* ── Do'konni o'chirish (nomini yozib tasdiqlash) ──────────────────────── */
function DeleteStoreModal({ store, onClose, onConfirm }) {
  const [text, setText] = useState('');
  const match = text.trim() === store.name;

  return (
    <Modal onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="danger" icon="trash" disabled={!match} onClick={onConfirm}>O‘chirish</Btn>
      </>
    }>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 12 }}>
        <Icon name="warning-octagon" fill size={20} color="var(--dang)" />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--dang)' }}>Do‘konni butunlay o‘chirish?</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', marginTop: 3 }}>
            "{store.name}" — barcha tovarlar, sotuvlar va mijozlar bazasi qaytarib
            bo‘lmas tarzda o‘chiriladi.
          </div>
        </div>
      </div>
      <Field label="Tasdiqlash uchun do‘kon nomini yozing">
        <input className="input" autoFocus value={text} onChange={e => setText(e.target.value)}
          placeholder={store.name} />
      </Field>
    </Modal>
  );
}
