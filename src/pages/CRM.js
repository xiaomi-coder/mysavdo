import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page, PageHeader, Card, Icon, Btn, Tag, Seg, Modal, Field, Avatar,
  EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

/** "Bugun" / "Kecha" / "3 kun oldin" / sana */
function relativeDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'Bugun';
  if (days === 1) return 'Kecha';
  if (days < 7) return `${days} kun oldin`;
  if (days < 30) return `${Math.floor(days / 7)} hafta oldin`;
  return d.toLocaleDateString('ru-RU');
}

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

/** Mijoz turi — diler / doimiy (10+ xarid) / oddiy */
function kindOf(c) {
  if (c.type === 'dealer') return { key: 'dealer', label: 'Diler', variant: 'accent' };
  if ((c.purchases || 0) >= 10) return { key: 'loyal', label: 'Doimiy', variant: 'neutral' };
  return { key: 'regular', label: 'Oddiy', variant: 'neutral' };
}

/* ══════════════════════════════════════════════════════════════════════════
   CRM
   ══════════════════════════════════════════════════════════════════════ */

export default function CRM() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [profile, setProfile] = useState(null);
  const [newDealer, setNewDealer] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const [custRes, debtRes] = await Promise.all([
      supabase.from('customers').select('*').eq('store_id', storeId).order('last_visit', { ascending: false }),
      supabase.from('debts').select('customer_id, client, phone, amount, paid_amount')
        .eq('store_id', storeId).eq('status', "To'lanmagan"),
    ]);

    const debts = debtRes.data || [];
    setCustomers((custRes.data || []).map(c => {
      // Eski yozuvlarda customer_id bo'lmasligi mumkin — ism/telefon bo'yicha ham moslaymiz
      const own = debts.filter(d => d.customer_id === c.id || d.client === c.name || d.phone === c.phone);
      return { ...c, debt: own.reduce((s, d) => s + (Number(d.amount) - Number(d.paid_amount || 0)), 0) };
    }));
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  const counts = useMemo(() => ({
    all: customers.length,
    debt: customers.filter(c => c.debt > 0).length,
    dealer: customers.filter(c => c.type === 'dealer').length,
    loyal: customers.filter(c => (c.purchases || 0) >= 10).length,
  }), [customers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter(c => {
      if (filter === 'debt' && !(c.debt > 0)) return false;
      if (filter === 'dealer' && c.type !== 'dealer') return false;
      if (filter === 'loyal' && (c.purchases || 0) < 10) return false;
      if (!q) return true;
      return [c.name, c.phone, c.shop_name].some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [customers, search, filter]);

  const CHIPS = [
    { key: 'all', label: 'Hammasi', n: counts.all },
    { key: 'debt', label: 'Qarzdor', n: counts.debt },
    { key: 'dealer', label: 'Diler', n: counts.dealer },
    { key: 'loyal', label: 'Doimiy', n: counts.loyal },
  ];

  return (
    <Page>
      <PageHeader title="CRM" subtitle="Mijozlar va xaridlar boshqaruvi">
        <div className="input-icon" style={{ width: 280 }}>
          <Icon name="magnifying-glass" />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Ism yoki telefon…" />
        </div>
        <Btn variant="primary" icon="plus" onClick={() => setShowAdd(true)}>Yangi Mijoz</Btn>
      </PageHeader>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CHIPS.map(c => {
          const active = filter === c.key;
          return (
            <button key={c.key} onClick={() => setFilter(c.key)} style={{
              padding: '6px 13px', borderRadius: 15, border: 0, cursor: 'pointer', font: 'inherit',
              fontSize: 12.5, fontWeight: active ? 500 : 400,
              background: active ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 6%, transparent)',
              color: active ? 'var(--color-bg)' : 'var(--color-neutral-300)',
            }}>
              {c.label} · {c.n}
            </button>
          );
        })}
      </div>

      <Card padding="var(--space-6)">
        {loading ? <SkeletonRows count={6} widths={['100%']} />
          : filtered.length === 0 ? (
            <EmptyState
              icon="users-three"
              text={customers.length === 0 ? 'Mijozlar yo‘q' : 'Hech kim topilmadi'}
              sub={customers.length === 0 ? 'Birinchi mijozni qo‘shing' : 'Qidiruv yoki filtrni o‘zgartiring'}
              action={customers.length === 0
                ? <Btn variant="primary" size="sm" icon="plus" onClick={() => setShowAdd(true)}>Yangi Mijoz</Btn>
                : null}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ fontSize: 13 }}>
                <thead>
                  <tr>
                    <th>Mijoz</th><th>Telefon</th><th>Turi</th>
                    <th style={{ textAlign: 'right' }}>Xaridlar</th>
                    <th style={{ textAlign: 'right' }}>Jami summa</th>
                    <th>Qarz</th><th>Oxirgi xarid</th><th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const kind = kindOf(c);
                    return (
                      <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setProfile(c)}>
                        <td style={{ fontWeight: 500 }}>
                          {c.shop_name ? `"${c.shop_name}" — ${c.name}` : c.name}
                        </td>
                        <td className="num">{c.phone || '—'}</td>
                        <td><Tag variant={kind.variant}>{kind.label}</Tag></td>
                        <td className="num" style={{ textAlign: 'right' }}>{c.purchases || 0}</td>
                        <td className="num" style={{ textAlign: 'right' }}>{money(c.total_spent)}</td>
                        <td>
                          {c.debt > 0
                            ? <Tag variant={c.debt > 5000000 ? 'warn' : 'dang'}>{money(c.debt)}</Tag>
                            : <span style={{ color: 'var(--color-neutral-600)' }}>—</span>}
                        </td>
                        <td style={{ color: 'var(--color-neutral-500)' }}>{relativeDate(c.last_visit)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <Btn variant="ghost" iconOnly icon="chat-circle-text" disabled
                              title="SMS — tez orada" style={{ width: 28, height: 28 }} />
                            <Btn variant="ghost" iconOnly icon="pencil-simple" disabled
                              title="Tahrir — tez orada" style={{ width: 28, height: 28 }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      {showAdd && (
        <AddCustomerModal
          storeId={user?.store_id}
          onClose={() => setShowAdd(false)}
          onSaved={(created, credentials) => {
            setShowAdd(false);
            load(user.store_id);
            if (credentials) setNewDealer({ ...created, ...credentials });
            else setToast({ msg: `${created.name} qo‘shildi`, variant: 'ok' });
          }}
          onError={m => setToast({ msg: m, variant: 'dang' })}
        />
      )}

      {newDealer && <DealerCredentialsModal dealer={newDealer} onClose={() => setNewDealer(null)} />}

      {profile && (
        <CustomerProfile
          customer={profile}
          storeId={user?.store_id}
          onClose={() => setProfile(null)}
          onSell={() => navigate('/pos', { state: { selectedCustomer: profile } })}
        />
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

/* ── Yangi mijoz ───────────────────────────────────────────────────────── */
function AddCustomerModal({ storeId, onClose, onSaved, onError }) {
  const [type, setType] = useState('regular');
  const [f, setF] = useState({ name: '', phone: '', shopName: '', address: '', login: '', password: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const isDealer = type === 'dealer';
  const valid = f.name.trim() && f.phone.trim() && (!isDealer || f.shopName.trim());

  const save = async () => {
    setSaving(true);
    const row = {
      store_id: storeId, type, name: f.name.trim(), phone: f.phone.trim(),
      total_spent: 0, purchases: 0,
    };
    let credentials = null;
    if (isDealer) {
      const login = f.login.trim() || `${f.shopName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${f.phone.replace(/\D/g, '').slice(-3)}`;
      const password = f.password.trim() || Math.random().toString(36).slice(-8);
      Object.assign(row, { shop_name: f.shopName.trim(), address: f.address.trim(), login, password });
      credentials = { login, password };
    }

    const { error } = await supabase.from('customers').insert(row);
    setSaving(false);
    if (error) onError(`Saqlanmadi: ${error.message}`);
    else onSaved(row, credentials);
  };

  return (
    <Modal title="Yangi Mijoz" onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" onClick={save} disabled={!valid} loading={saving}>Saqlash</Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--color-neutral-400)', display: 'block', marginBottom: 6 }}>
            Mijoz turi
          </label>
          <Seg
            style={{ width: '100%' }}
            options={[{ value: 'regular', label: 'Oddiy' }, { value: 'dealer', label: "Do‘kondor / Diler" }]}
            value={type} onChange={setType}
          />
        </div>

        {isDealer && (
          <Field label="Do‘kon nomi">
            <input className="input" autoFocus value={f.shopName}
              onChange={e => set('shopName', e.target.value)} placeholder="TexnoPlus" />
          </Field>
        )}

        <Field label="Ism">
          <input className="input" autoFocus={!isDealer} value={f.name}
            onChange={e => set('name', e.target.value)} placeholder="Masalan: Aliyev Aziz" />
        </Field>

        <Field label="Telefon">
          <input className="input num" value={f.phone}
            onChange={e => set('phone', e.target.value)} placeholder="+998 90 123 45 67" />
        </Field>

        {isDealer && (
          <>
            <Field label="Manzil">
              <input className="input" value={f.address}
                onChange={e => set('address', e.target.value)} placeholder="Toshkent, Chilonzor…" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              <Field label="Login" hint="Bo‘sh qoldirsangiz avtomatik yaratiladi">
                <input className="input mono" value={f.login} onChange={e => set('login', e.target.value)}
                  placeholder="avtomatik" />
              </Field>
              <Field label="Parol" hint="Bo‘sh qoldirsangiz avtomatik yaratiladi">
                <input className="input mono" value={f.password} onChange={e => set('password', e.target.value)}
                  placeholder="avtomatik" />
              </Field>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ── Diler kirish ma'lumotlari (bir marta ko'rsatiladi) ────────────────── */
function DealerCredentialsModal({ dealer, onClose }) {
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState('');

  const copy = (what, value) => {
    navigator.clipboard?.writeText(value);
    setCopied(what);
    setTimeout(() => setCopied(''), 1500);
  };

  const Row = ({ label, value, masked }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 64, fontSize: 11, color: 'var(--color-neutral-500)' }}>{label}</span>
      <span className="mono" style={{ flex: 1, fontSize: 13, fontWeight: 500, letterSpacing: masked && !reveal ? 2 : 0 }}>
        {masked && !reveal ? '•'.repeat(10) : value}
      </span>
      {masked && (
        <Btn variant="ghost" iconOnly icon={reveal ? 'eye-slash' : 'eye'}
          title={reveal ? 'Yashirish' : 'Ko‘rsatish'} onClick={() => setReveal(r => !r)}
          style={{ width: 28, height: 28 }} />
      )}
      <Btn variant="ghost" iconOnly icon={copied === label ? 'check' : 'copy'} title="Nusxalash"
        onClick={() => copy(label, value)} style={{ width: 28, height: 28 }} />
    </div>
  );

  return (
    <Modal onClose={onClose} actions={<Btn variant="primary" onClick={onClose}>Tushunarli, yopish</Btn>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <Icon name="check-circle" fill size={17} color="var(--ok)" />
        <span style={{ fontSize: 14.5, fontWeight: 500 }}>Diler yaratildi</span>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--color-neutral-400)', marginBottom: 11 }}>
        "{dealer.shop_name}" uchun kirish ma’lumotlari yaratildi. Parolni dilerga
        xavfsiz kanal orqali yetkazing.
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 9,
        background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
      }}>
        <Row label="Login" value={dealer.login} />
        <Row label="Parol" value={dealer.password} masked />
      </div>

      <div style={{
        display: 'flex', gap: 9, alignItems: 'flex-start', marginTop: 11,
        padding: '10px 12px', borderRadius: 8, background: 'var(--warnbg)',
      }}>
        <Icon name="warning" fill size={14} color="var(--warn)" style={{ marginTop: 1 }} />
        <span style={{ fontSize: 11.5, color: 'var(--warn)' }}>
          Bu oyna yopilgach parolni CRM ro‘yxatidan qayta ko‘rish mumkin emas.
        </span>
      </div>
    </Modal>
  );
}

/* ── Mijoz profili ─────────────────────────────────────────────────────── */
function CustomerProfile({ customer, storeId, onClose, onSell }) {
  const [tab, setTab] = useState('info');
  const [history, setHistory] = useState(null);
  const kind = kindOf(customer);

  useEffect(() => {
    if (tab !== 'history' || history) return;
    let alive = true;
    supabase.from('transactions')
      .select('id, receipt_no, total, payment_method, date, items')
      .eq('store_id', storeId).eq('customer_id', customer.id)
      .order('date', { ascending: false }).limit(30)
      .then(({ data }) => { if (alive) setHistory(data || []); });
    return () => { alive = false; };
  }, [tab, history, storeId, customer.id]);

  return (
    <Modal onClose={onClose}>
      {/* Sarlavha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Avatar initials={initialsOf(customer.name)} size={42}
          color={customer.type === 'dealer' ? undefined : 'var(--color-neutral-800)'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>
            {customer.name} <Tag variant={kind.variant} style={{ marginLeft: 4 }}>{kind.label}</Tag>
          </div>
          <div className="num" style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{customer.phone}</div>
        </div>
        <Btn variant="ghost" iconOnly icon="pencil-simple" disabled title="Tahrir — tez orada"
          style={{ width: 30, height: 30 }} />
      </div>

      {/* Tablar */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--color-divider)', margin: '8px 0 14px' }}>
        {[{ id: 'info', label: 'Asosiy ma’lumotlar' }, { id: 'history', label: 'Xaridlar tarixi' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '11px 13px', border: 0, background: 'none', cursor: 'pointer', font: 'inherit',
            fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
            color: tab === t.id ? 'var(--color-accent)' : 'var(--color-neutral-500)',
            boxShadow: tab === t.id ? 'inset 0 -2px 0 var(--color-accent)' : 'none',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <Card elev={null} padding={11} gap={3}>
              <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>Jami xaridlar</div>
              <div className="num" style={{ fontSize: 17, fontWeight: 500 }}>{customer.purchases || 0} ta</div>
            </Card>
            <Card elev={null} padding={11} gap={3}>
              <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>Jami summa</div>
              <div className="num" style={{ fontSize: 17, fontWeight: 500 }}>{money(customer.total_spent)}</div>
            </Card>
          </div>

          {customer.debt > 0 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 13px', borderRadius: 9, background: 'var(--dangbg)',
            }}>
              <span style={{ fontSize: 12.5, color: 'var(--dang)' }}>Joriy qarz</span>
              <span className="num" style={{ fontSize: 15, fontWeight: 600, color: 'var(--dang)' }}>
                {money(customer.debt)} so‘m
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 12.5 }}>
            <InfoRow label="Oxirgi xarid" value={relativeDate(customer.last_visit)} />
            {customer.shop_name && <InfoRow label="Do‘kon" value={customer.shop_name} />}
            {customer.address && <InfoRow label="Manzil" value={customer.address} />}
            {customer.login && <InfoRow label="Login" value={<span className="mono">{customer.login}</span>} />}
            <InfoRow label="Ro‘yxatdan o‘tgan"
              value={customer.created_at ? new Date(customer.created_at).toLocaleDateString('ru-RU') : '—'} />
            <InfoRow label="Holat" last value={
              customer.debt > 0 ? <Tag variant="dang">Qarzdor</Tag> : <Tag variant="ok">Toza</Tag>
            } />
          </div>

          <Btn variant="primary" icon="cash-register" block onClick={onSell}>
            Shu mijozga sotuv qilish
          </Btn>
        </div>
      ) : (
        <div>
          {history === null ? <SkeletonRows count={4} widths={['100%']} />
            : history.length === 0 ? <EmptyState icon="receipt" text="Xaridlar yo‘q" />
              : (
                <table className="table" style={{ fontSize: 12.5 }}>
                  <thead>
                    <tr><th>Chek</th><th>Sana</th><th>To‘lov</th><th style={{ textAlign: 'right' }}>Summa</th></tr>
                  </thead>
                  <tbody>
                    {history.map(t => (
                      <tr key={t.id}>
                        <td className="num">{t.receipt_no}</td>
                        <td style={{ color: 'var(--color-neutral-500)' }}>
                          {new Date(t.date).toLocaleDateString('ru-RU')}
                        </td>
                        <td>
                          <Tag variant={t.payment_method === 'nasiya' ? 'warn' : 'neutral'}>
                            {t.payment_method === 'nasiya' ? 'Nasiya'
                              : t.payment_method === 'card' ? 'Plastik'
                                : t.payment_method === 'transfer' ? 'Transfer'
                                  : t.payment_method === 'online' ? 'Onlayn' : 'Naqd'}
                          </Tag>
                        </td>
                        <td className="num" style={{ textAlign: 'right' }}>{money(t.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
        </div>
      )}
    </Modal>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0',
      borderBottom: last ? 'none' : '1px solid var(--color-divider)',
    }}>
      <span style={{ color: 'var(--color-neutral-500)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
