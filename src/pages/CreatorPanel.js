import React, { useState, useEffect } from 'react';
import { StatCard, Badge, SectionHeader, Btn, Avatar } from '../components/UI';
import { supabase } from '../utils/supabaseClient';

const ROLE_LABELS = { owner: "Do'kon Egasi", manager: 'Manager', cashier: 'Kassir', creator: 'Creator' };
const ROLE_COLORS = { owner: '#3B82F6', manager: '#10B981', cashier: '#A78BFA', creator: '#F59E0B' };

export default function CreatorPanel({ page }) {
  const [showAddStore, setShowAddStore] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [toast, setToast] = useState(null);

  // Dynamic Data States
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: storesData } = await supabase.from('stores').select('*');
      const { data: usersData } = await supabase.from('users').select('*, stores(name)');

      // Map data to expected format for UI
      if (storesData) {
        setStores(storesData.map(s => {
          const storeUsersCount = usersData ? usersData.filter(u => u.store_id === s.id && u.role !== 'creator').length : 0;
          return {
            id: s.id, name: s.name, owner: s.owner_email, email: s.owner_email,
            plan: s.max_branches > 1 ? (s.max_branches > 3 ? 'Enterprise' : 'Business') : 'Starter',
            revenue: 0, // In a real app, calculate from transactions
            active: s.is_active, employees: storeUsersCount, color: '#3B82F6'
          };
        }));
      }

      if (usersData) {
        setUsers(usersData.map(u => ({
          id: u.id, name: u.name, email: u.email, role: u.role, store: u.stores?.name || 'Tizim',
          active: true, lastLogin: 'Yaqinda', avatar: u.name?.substring(0, 2).toUpperCase() || '??', color: ROLE_COLORS[u.role] || '#888'
        })));
      }
    } catch (err) {
      console.error('Error fetching creator panel data:', err);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); fetchData(); };

  const totalRevenue = stores.reduce((s, st) => s + st.revenue, 0);

  if (page === 'dashboard') return <CreatorDashboard stores={stores} users={users} totalRevenue={totalRevenue} />;
  if (page === 'stores') return <StoresPage stores={stores} onAdd={() => setShowAddStore(true)} showToast={showToast} showAddStore={showAddStore} setShowAddStore={setShowAddStore} />;
  if (page === 'users') return <UsersPage stores={stores} users={users} onAdd={() => setShowAddUser(true)} showToast={showToast} showAddUser={showAddUser} setShowAddUser={setShowAddUser} />;
  if (page === 'stats') return <StatsPage stores={stores} totalRevenue={totalRevenue} />;
  if (page === 'settings') return <CreatorSettings />;
  return null;
}

// ── CREATOR DASHBOARD ───────────────────────────────────────────────
function CreatorDashboard({ stores, users, totalRevenue }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(59,130,246,0.04))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 44 }}>👑</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Creator Paneli</div>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>Barcha do'konlar va foydalanuvchilar ustidan nazorat</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard icon="🏪" value={stores.length} label="Jami do'konlar" accent="#F59E0B" />
        <StatCard icon="✅" value={stores.filter(s => s.active).length} label="Aktiv do'konlar" accent="#10B981" />
        <StatCard icon="👥" value={users.length} label="Jami foydalanuvchilar" accent="#3B82F6" />
        <StatCard icon="💰" value={`${(totalRevenue / 1000000000).toFixed(2)}B`} label="Umumiy daromad" accent="#A78BFA" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {stores.map(s => (
          <div key={s.id} className="glass-card" style={{ border: `1px solid ${s.active ? 'rgba(255,255,255,0.05)' : 'rgba(244,63,94,0.15)'}`, borderRadius: 16, padding: 20, opacity: s.active ? 1 : 0.65 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏪</div>
              <Badge type={s.active ? 'success' : 'danger'}>{s.active ? 'Aktiv' : 'Faolsiz'}</Badge>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 12 }}>👤 {s.owner} · {s.employees} xodim</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#10B981' }}>{(s.revenue / 1000000).toFixed(0)}M so'm</div>
            <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 14 }}>Bu oy daromad</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="fast-transition" style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.color + '22', color: s.color, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'} onMouseLeave={e => e.currentTarget.style.filter = 'none'}>{s.plan}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STORES PAGE ─────────────────────────────────────────────────────
function StoresPage({ stores, onAdd, showToast, showAddStore, setShowAddStore }) {
  const [form, setForm] = useState({ name: '', owner: '', email: '', password: '', plan: 'Starter' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);

    // 1. Create store
    const { data: storeData, error: storeErr } = await supabase
      .from('stores')
      .insert({ name: form.name, owner_email: form.email, max_branches: form.plan === 'Starter' ? 1 : form.plan === 'Business' ? 3 : 10 })
      .select()
      .single();

    if (storeErr || !storeData) {
      showToast(`❌ Xatolik: Do'kon yaratilmadi (${storeErr?.message})`);
      setLoading(false);
      return;
    }

    // 2. Create owner user
    const { error: userErr } = await supabase
      .from('users')
      .insert({ email: form.email, password: form.password, name: form.owner, role: 'owner', store_id: storeData.id });

    if (userErr) {
      showToast(`❌ Xatolik: Egasi yaratilmadi (${userErr?.message})`);
    } else {
      showToast(`✅ "${form.name}" do'koni va egasi qo'shildi!`);
      setShowAddStore(false);
      setForm({ name: '', owner: '', email: '', password: '', plan: 'Starter' });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <SectionHeader title="Do'konlar Boshqaruvi">
          <Btn variant="primary" size="sm" onClick={onAdd}>+ Yangi Do'kon</Btn>
        </SectionHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stores.map(s => (
            <div key={s.id} className="fast-transition" style={{ background: 'rgba(17, 24, 39, 0.4)', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${s.active ? 'rgba(255,255,255,0.05)' : 'rgba(244,63,94,0.15)'}` }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(17, 24, 39, 0.4)'}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏪</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>👤 {s.owner} · ✉️ {s.email}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#10B981' }}>{(s.revenue / 1000000).toFixed(0)}M so'm</div>
                <div style={{ fontSize: 10, color: 'var(--t2)' }}>Bu oy</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.employees} ta</div>
                <div style={{ fontSize: 10, color: 'var(--t2)' }}>Xodimlar</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: s.color + '22', color: s.color }}>{s.plan}</span>
              <Badge type={s.active ? 'success' : 'danger'}>{s.active ? 'Aktiv' : 'Faolsiz'}</Badge>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="subtle" size="sm">✏️ Tahrirlash</Btn>
                <Btn variant={s.active ? 'danger' : 'green'} size="sm">{s.active ? '⏸ To\'xtatish' : '▶ Faollashtirish'}</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddStore && (
        <Modal onClose={() => setShowAddStore(false)}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>🏪 Yangi Do'kon Qo'shish</div>
          {[
            { lbl: "Do'kon nomi *", key: 'name', ph: "Asosiy Do'kon", type: 'text' },
            { lbl: 'Egasi ismi *', key: 'owner', ph: 'Jasur Karimov', type: 'text' },
            { lbl: 'Egasi emaili *', key: 'email', ph: 'egasi@savdo.uz', type: 'email' },
            { lbl: 'Egasi paroli *', key: 'password', ph: 'Kamida 6 belgi', type: 'password' },
          ].map(f => (
            <FormField key={f.key} label={f.lbl}>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </FormField>
          ))}
          <FormField label="Tarif rejasi">
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option>Starter</option><option>Business</option><option>Enterprise</option>
            </select>
          </FormField>
          <ModalActions onCancel={() => setShowAddStore(false)} onConfirm={handleAdd} confirmLabel={loading ? "Yaratilmoqda..." : "✅ Do'kon Yaratish"} disabled={!form.name || !form.email || !form.password || loading} />
        </Modal>
      )}
    </div>
  );
}

// ── USERS PAGE ──────────────────────────────────────────────────────
function UsersPage({ users, onAdd, showToast, showAddUser, setShowAddUser }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'cashier', store: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password || !form.store) return;
    setLoading(true);

    const { error } = await supabase
      .from('users')
      .insert({ email: form.email, password: form.password, name: form.name, role: form.role, store_id: form.store });

    if (error) {
      showToast(`❌ Xatolik: Foydalanuvchi yaratilmadi (${error.message})`);
    } else {
      showToast(`✅ "${form.name}" foydalanuvchisi yaratildi!`);
      setShowAddUser(false);
      setForm({ name: '', email: '', role: 'cashier', store: '', password: '' });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <SectionHeader title="Foydalanuvchilar Boshqaruvi">
          <Btn variant="primary" size="sm" onClick={onAdd}>+ Yangi Foydalanuvchi</Btn>
        </SectionHeader>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Foydalanuvchi', "Do'kon", 'Rol', 'Oxirgi kirish', 'Holat', ''].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: .8, padding: '0 10px 12px 0', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="fast-transition" style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '11px 10px 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initials={u.avatar} color={u.color} size={32} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--t2)', fontFamily: 'JetBrains Mono,monospace' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 10px 11px 0', fontSize: 12, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{u.store}</td>
                <td style={{ padding: '11px 10px 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: ROLE_COLORS[u.role] + '22', color: ROLE_COLORS[u.role] }}>{ROLE_LABELS[u.role]}</span>
                </td>
                <td style={{ padding: '11px 10px 11px 0', fontSize: 12, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{u.lastLogin}</td>
                <td style={{ padding: '11px 10px 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Badge type={u.active ? 'success' : 'danger'}>{u.active ? 'Aktiv' : 'Faolsiz'}</Badge></td>
                <td style={{ padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn variant="subtle" size="sm">🔑 Parol</Btn>
                    <Btn variant={u.active ? 'danger' : 'green'} size="sm">{u.active ? 'Bloklash' : 'Faollashtirish'}</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddUser && (
        <Modal onClose={() => setShowAddUser(false)}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>👤 Yangi Foydalanuvchi</div>
          {[
            { lbl: 'Ism Familiya *', key: 'name', ph: 'Aziz Karimov', type: 'text' },
            { lbl: 'Email *', key: 'email', ph: 'aziz@savdo.uz', type: 'email' },
            { lbl: 'Parol *', key: 'password', ph: 'Kamida 6 belgi', type: 'password' },
          ].map(f => (
            <FormField key={f.key} label={f.lbl}>
              <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </FormField>
          ))}
          <FormField label="Rol">
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="owner">Do'kon Egasi</option>
              <option value="manager">Manager</option>
              <option value="cashier">Kassir</option>
            </select>
          </FormField>
          <FormField label="Do'kon">
            <select value={form.store} onChange={e => setForm({ ...form, store: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Tanlang...</option>
              {STORES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <ModalActions onCancel={() => setShowAddUser(false)} onConfirm={handleAdd} confirmLabel={loading ? "Yaratilmoqda..." : "✅ Yaratish"} disabled={!form.name || !form.email || !form.password || !form.store || loading} />
        </Modal>
      )}
    </div>
  );
}

// ── STATS PAGE ──────────────────────────────────────────────────────
function StatsPage({ stores, totalRevenue }) {
  const maxRev = Math.max(...stores.map(s => s.revenue));
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        <StatCard icon="💰" value={`${(totalRevenue / 1000000000).toFixed(2)}B`} label="Umumiy daromad (so'm)" accent="#F59E0B" />
        <StatCard icon="🏪" value={stores.filter(s => s.active).length + '/' + stores.length} label="Aktiv do'konlar" accent="#10B981" />
        <StatCard icon="👥" value={stores.reduce((s, st) => s + st.employees, 0)} label="Jami xodimlar" accent="#3B82F6" />
      </div>
      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <SectionHeader title="Do'konlar Bo'yicha Daromad" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {stores.sort((a, b) => b.revenue - a.revenue).map((s, i) => (
            <div key={s.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {s.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{(s.revenue / 1000000).toFixed(0)}M so'm</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(s.revenue / maxRev * 100)}%`, background: `linear-gradient(90deg,${s.color},${s.color}99)`, borderRadius: 4, transition: 'width .8s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CREATOR SETTINGS ────────────────────────────────────────────────
function CreatorSettings() {
  const plans = [
    { name: 'Starter', price: '$29', stores: 1, employees: 5, color: '#10B981' },
    { name: 'Business', price: '$59', stores: 3, employees: 15, color: '#3B82F6' },
    { name: 'Enterprise', price: '$99', stores: 10, employees: 50, color: '#F59E0B' },
  ];
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>💳 Tarif Rejalari</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {plans.map(p => (
            <div key={p.name} className="fast-transition" style={{ background: 'rgba(17, 24, 39, 0.4)', border: `1px solid ${p.color}33`, borderRadius: 14, padding: 20, textAlign: 'center' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(17, 24, 39, 0.4)'}>
              <div style={{ fontSize: 28, fontWeight: 900, color: p.color, marginBottom: 4, filter: `drop-shadow(0 2px 8px ${p.color}44)` }}>{p.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--t2)' }}>/oy</span></div>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}>🏪 {p.stores} ta do'kon</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 16 }}>👥 {p.employees} ta xodim</div>
              <Btn variant="primary" size="sm" style={{ background: `linear-gradient(135deg,${p.color},${p.color}cc)`, width: '100%', justifyContent: 'center' }}>Tahrirlash</Btn>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>🔧 Tizim Sozlamalari</div>
        {[
          { label: 'Platforma nomi', val: 'SavdoPlatform' },
          { label: 'Versiya', val: 'v2.0.0' },
          { label: 'Texnik email', val: 'support@savdo.uz' },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: .8 }}>{s.label}</label>
            <input defaultValue={s.val} className="fast-transition" style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
          </div>
        ))}
        <Btn variant="primary">💾 Saqlash</Btn>
      </div>
    </div>
  );
}

// ── Shared ──────────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 30px', width: 420, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        {children}
      </div>
    </div>
  );
}
function FormField({ label, children }) { return (<div style={{ marginBottom: 14 }}><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: .8 }}>{label}</label>{children}</div>); }
function ModalActions({ onCancel, onConfirm, confirmLabel = 'Tasdiqlash', disabled }) { return (<div style={{ display: 'flex', gap: 10, marginTop: 8 }}><button className="fast-transition" onClick={onCancel} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>Bekor</button><button className="btn-primary" onClick={onConfirm} disabled={disabled} style={{ flex: 2, padding: '12px', background: disabled ? 'var(--s2)' : 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', borderRadius: 11, color: disabled ? 'var(--t2)' : '#fff', fontSize: 13, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', opacity: disabled ? .45 : 1, boxShadow: disabled ? 'none' : '0 4px 16px rgba(59,130,246,0.28)' }}>{confirmLabel}</button></div>); }
const inputStyle = { width: '100%', padding: '11px 13px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' };

