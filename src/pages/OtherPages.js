import React, { useState, useEffect } from 'react';
import { useAuth, useTranslation } from '../context/AuthContext';
import { StatCard, Badge, SectionHeader, Btn, Avatar } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../utils/supabaseClient';

const inputStyle = { width: '100%', padding: '11px 13px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' };

function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 30px', width: 420, maxWidth: '92vw', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        {children}
      </div>
    </div>
  );
}

export function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', permissions: { pos: false, dashboard: false, ombor: false, nasiya: false, crm: false, hisobot: false, sozlamalar: false } });

  React.useEffect(() => {
    if (user?.store_id) {
      loadEmployees(user.store_id);
    }
  }, [user]);

  const loadEmployees = async (storeId) => {
    const { data } = await supabase.from('users').select('*').eq('store_id', storeId);
    if (data) {
      // Fetch transaction stats per cashier
      const { data: txns } = await supabase.from('transactions').select('cashier, total').eq('store_id', storeId).eq('status', 'completed');
      const cashierStats = {};
      if (txns) {
        txns.forEach(t => {
          const c = t.cashier;
          if (!cashierStats[c]) cashierStats[c] = { sales: 0, txns: 0 };
          cashierStats[c].sales += Number(t.total) || 0;
          cashierStats[c].txns += 1;
        });
      }
      setEmployees(data.filter(u => u.role !== 'owner').map(u => ({
        ...u, active: true,
        sales: cashierStats[u.name]?.sales || 0,
        txns: cashierStats[u.name]?.txns || 0,
        avatar: (u.name || '??').substring(0, 2).toUpperCase(),
        color: u.role === 'manager' ? '#10B981' : '#A78BFA'
      })));
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return;
    const activePerms = Object.keys(form.permissions).filter(k => form.permissions[k]);
    const role = activePerms.includes('sozlamalar') ? 'manager' : 'cashier';

    if (editMode && editId) {
      // Update existing user (simplified)
      const { error } = await supabase.from('users').update({ name: form.name, role }).eq('id', editId);
      if (!error) {
        showToast(`✅ ${form.name} ma'lumotlari yangilandi!`);
        loadEmployees(user.store_id);
      }
    } else {
      // Create new user
      const { error } = await supabase.from('users').insert({
        store_id: user.store_id,
        name: form.name,
        email: form.email,
        password: form.password,
        role: role
      });
      if (!error) {
        showToast(`✅ ${form.name} qo'shildi!`);
        loadEmployees(user.store_id);
      } else {
        showToast(`❌ Xatolik: ${error.message}`);
      }
    }

    setShowAdd(false);
    setEditMode(false);
    setEditId(null);
    setForm({ name: '', email: '', phone: '', password: '', permissions: { pos: false, dashboard: false, ombor: false, nasiya: false, crm: false, hisobot: false, sozlamalar: false } });
  };

  const handleEdit = (emp) => {
    setEditMode(true);
    setEditId(emp.id);
    const perms = { pos: false, dashboard: false, ombor: false, nasiya: false, crm: false, hisobot: false, sozlamalar: false };
    if (emp.activePerms) {
      emp.activePerms.forEach(p => { if (perms[p] !== undefined) perms[p] = true; });
    }
    setForm({ name: emp.name, email: emp.email, phone: emp.phone || '', password: emp.password || '', permissions: perms });
    setDetail(null);
    setShowAdd(true);
  };

  const toggleActive = (id) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, active: !e.active } : e));
  };

  const activeCount = employees.filter(e => e.active).length;
  const topEmp = [...employees].sort((a, b) => b.sales - a.sales)[0];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        <StatCard icon="👥" value={employees.length} label="Jami xodimlar" accent="#3B82F6" />
        <StatCard icon="✅" value={activeCount} label="Aktiv xodimlar" accent="#10B981" />
        <StatCard icon="⭐" value={topEmp?.name?.split(' ')[0] || '-'} label="Eng yaxshi sotuvchi" accent="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Xodimlar Ro'yxati">
            <Btn variant="primary" size="sm" onClick={() => {
              setEditMode(false); setEditId(null);
              setForm({ name: '', email: '', phone: '', password: '', permissions: { pos: false, dashboard: false, ombor: false, nasiya: false, crm: false, hisobot: false, sozlamalar: false } });
              setShowAdd(true);
            }}>+ Yangi Xodim</Btn>
          </SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {employees.map(emp => (
              <div key={emp.id} className="fast-transition" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(17, 24, 39, 0.4)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', opacity: emp.active ? 1 : .55, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(17, 24, 39, 0.4)'}>
                <Avatar initials={emp.avatar} color={emp.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)' }}>{emp.email}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: emp.role === 'manager' ? 'rgba(16,185,129,0.12)' : emp.role === 'owner' ? 'rgba(59,130,246,0.12)' : 'rgba(167,139,250,0.12)', color: emp.role === 'manager' ? '#10B981' : emp.role === 'owner' ? '#3B82F6' : '#A78BFA' }}>
                  {emp.role === 'cashier' ? 'Kassir' : emp.role === 'manager' ? 'Manager' : 'Egasi'}
                </span>
                {emp.sales > 0 && <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{emp.sales.toLocaleString()} so'm</div><div style={{ fontSize: 10, color: 'var(--t2)' }}>{emp.txns} sotuv</div></div>}
                <Badge type={emp.active ? 'success' : 'danger'}>{emp.active ? 'Aktiv' : 'Off'}</Badge>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn variant="subtle" size="sm" onClick={() => setDetail(emp)}>Ko'rish</Btn>
                  <Btn variant={emp.active ? 'danger' : 'green'} size="sm" onClick={() => toggleActive(emp.id)}>{emp.active ? 'Off' : 'On'}</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass-card" style={{ borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>🏆 Top Xodim</div>
            {topEmp && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12 }}>
                <Avatar initials={topEmp.avatar} color={topEmp.color} size={44} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{topEmp.name}</div>
                  <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>{topEmp.sales.toLocaleString()} so'm</div>
                  <div style={{ fontSize: 10, color: 'var(--t2)' }}>{topEmp.txns} ta sotuv</div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Sotuv Reytingi</div>
            {employees.filter(e => e.sales > 0).sort((a, b) => b.sales - a.sales).map((e, i) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <Avatar initials={e.avatar} color={e.color} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{e.name}</div>
                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(e.sales / employees[0].sales * 100)}%`, background: `linear-gradient(90deg,${e.color},#22D3EE)`, borderRadius: 2 }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: e.color }}>{Math.round(e.sales / 1000)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>👤 {editMode ? 'Xodimni Tahrirlash' : "Yangi Xodim Qo'shish"}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0 12px' }}>
            {[{ lbl: 'Ism Familiya *', key: 'name', ph: 'Aziz Karimov', type: 'text' }, { lbl: 'Email *', key: 'email', ph: 'aziz@savdo.uz', type: 'email' }, { lbl: 'Telefon', key: 'phone', ph: '+998 90 123 45 67', type: 'tel' }, { lbl: 'Parol *', key: 'password', ph: '••••••••', type: 'text' }].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: .8 }}>{f.lbl}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph} style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: .8 }}>Ruxsatlar (Modullar) *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {Object.keys(form.permissions).map(p => (
                <label key={p} className="fast-transition" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t1)', cursor: 'pointer', background: form.permissions[p] ? 'rgba(59,130,246,0.1)' : 'var(--s2)', padding: '10px 12px', borderRadius: 8, border: `1px solid ${form.permissions[p] ? '#3B82F6' : 'var(--border)'}` }}>
                  <input type="checkbox" checked={form.permissions[p]} onChange={(e) => setForm({ ...form, permissions: { ...form.permissions, [p]: e.target.checked } })} style={{ accentColor: '#3B82F6', width: 16, height: 16 }} />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="fast-transition" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>Bekor</button>
            <button className={(!form.name || !form.email || !form.password) ? 'fast-transition' : 'btn-primary'} onClick={handleAdd} disabled={!form.name || !form.email || !form.password} style={{ flex: 2, padding: '12px', background: (!form.name || !form.email || !form.password) ? 'var(--s2)' : 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', borderRadius: 11, color: (!form.name || !form.email || !form.password) ? 'var(--t2)' : '#fff', fontSize: 13, fontWeight: 800, cursor: (!form.name || !form.email || !form.password) ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', opacity: (!form.name || !form.email || !form.password) ? .45 : 1, boxShadow: (!form.name || !form.email || !form.password) ? 'none' : '0 4px 16px rgba(59,130,246,0.28)' }}>✅ {editMode ? 'Saqlash' : "Qo'shish"}</button>
          </div>
        </Modal>
      )}

      {showDetail && (
        <Modal onClose={() => setDetail(null)}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Avatar initials={showDetail.avatar} color={showDetail.color} size={60} />
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 12 }}>{showDetail.name}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>{showDetail.email}</div>
          </div>
          {[
            { l: 'Rol / Huquq', v: showDetail.activePerms ? showDetail.activePerms.join(', ') : (showDetail.role === 'cashier' ? 'Kassir' : 'Manager') },
            { l: 'Telefon', v: showDetail.phone || '-' },
            { l: 'Parol', v: showDetail.password ? '••••••••' : 'Noma\'lum' },
            { l: 'Jami sotuv', v: showDetail.sales > 0 ? showDetail.sales.toLocaleString() + ' so\'m' : '—' },
            { l: 'Tranzaksiyalar', v: showDetail.txns > 0 ? showDetail.txns + ' ta' : '—' },
            { l: 'Holat', v: showDetail.active ? '✅ Aktiv' : '❌ Faolsiz' },
          ].map(s => (
            <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(30,45,61,0.5)', fontSize: 13 }}>
              <span style={{ color: 'var(--t2)' }}>{s.l}</span>
              <span style={{ fontWeight: 600 }}>{s.v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setDetail(null)} style={{ flex: 1, padding: '12px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 11, color: 'var(--t1)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>Yopish</button>
            <button onClick={() => handleEdit(showDetail)} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', boxShadow: '0 4px 16px rgba(59,130,246,0.28)' }}>✏️ O'zgartirish</button>
          </div>
        </Modal>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#10B981', color: '#fff', padding: '13px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'slideUp .3s ease' }}>{toast}</div>}
    </div>
  );
}

// ── ANALYTICS ──────────────────────────────────────────────────────
export function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [applied, setApplied] = useState({});
  const [insights, setInsights] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, totalProfit: 0, productCount: 0, lowStock: 0 });

  useEffect(() => {
    if (user?.store_id) {
      analyzeData(user.store_id);
    }
  }, [user]);

  const analyzeData = async (storeId) => {
    setLoading(true);

    // Fetch products and transactions
    const { data: prods } = await supabase.from('products').select('*').eq('store_id', storeId);
    const { data: txns } = await supabase.from('transactions').select('total, items, date').eq('store_id', storeId).eq('status', 'completed');
    const { data: exps } = await supabase.from('expenses').select('amount').eq('store_id', storeId);

    const products = prods || [];
    const transactions = txns || [];
    const expenses = exps || [];

    const totalSales = transactions.reduce((s, t) => s + (Number(t.total) || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totalProfit = totalSales - totalExpenses;
    const lowStock = products.filter(p => p.stock <= 10).length;

    setStats({ totalSales, totalProfit, productCount: products.length, lowStock });

    // Analyze product sales from transaction items
    const productSales = {};
    transactions.forEach(t => {
      if (t.items && Array.isArray(t.items)) {
        t.items.forEach(item => {
          const name = item.name || item.n || 'Nomalum';
          const qty = item.qty || item.q || 1;
          productSales[name] = (productSales[name] || 0) + qty;
        });
      }
    });

    const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
    const topSelling = sorted.slice(0, 3);
    const slowSelling = sorted.slice(-3).reverse();

    // Build dynamic insights
    const dynamicInsights = [];

    if (topSelling.length > 0) {
      const topDesc = topSelling.map(([n, q]) => `${n} (${q} ta)`).join(', ');
      dynamicInsights.push({
        id: 'i1', icon: '🚀', color: '#10B981',
        title: 'Eng Ko\'p Sotilganlar',
        desc: `${topDesc} — do'koningizda eng ko'p sotilayotgan mahsulotlar.`,
        tag: `${topSelling.length} ta mahsulot`, tagType: 'g'
      });
    } else {
      dynamicInsights.push({
        id: 'i1', icon: '🚀', color: '#10B981',
        title: 'Hozircha Ma\'lumot Yo\'q',
        desc: 'POS orqali sotuv qilganingizda eng ko\'p sotilgan mahsulotlar shu yerda chiqadi.',
        tag: 'Sotuv kutilmoqda', tagType: 'p'
      });
    }

    if (slowSelling.length > 0 && sorted.length >= 3) {
      const slowDesc = slowSelling.map(([n, q]) => `${n} (${q} ta)`).join(', ');
      dynamicInsights.push({
        id: 'i2', icon: '🐌', color: '#F43F5E',
        title: 'Kam Sotilayotganlar',
        desc: `${slowDesc} — bu mahsulotlar kam sotilmoqda. Chegirma yoki aksiya o'tkazishni o'ylab ko'ring.`,
        tag: `${slowSelling.length} ta mahsulot`, tagType: 'r'
      });
    } else {
      dynamicInsights.push({
        id: 'i2', icon: '🐌', color: '#F43F5E',
        title: 'Kam Sotilganlar',
        desc: 'Yetarli sotuv ma\'lumoti to\'planganda kam sotilgan mahsulotlar aniqlanadi.',
        tag: 'Ma\'lumot kutilmoqda', tagType: 'p'
      });
    }

    // Stock warning insight
    if (lowStock > 0) {
      const lowProds = products.filter(p => p.stock <= 10 && p.stock > 0).slice(0, 3).map(p => `${p.name} (${p.stock} ta)`).join(', ');
      const outProds = products.filter(p => p.stock <= 0).length;
      dynamicInsights.push({
        id: 'i3', icon: '📦', color: '#F59E0B',
        title: 'Ombor Ogohlantirishlari',
        desc: `${lowStock} ta mahsulot kam qoldiqda${outProds > 0 ? `, ${outProds} ta tugagan` : ''}. ${lowProds ? `Jumladan: ${lowProds}` : ''}`,
        tag: `${lowStock} ta ogohlantirish`, tagType: 'r'
      });
    } else {
      dynamicInsights.push({
        id: 'i3', icon: '📦', color: '#F59E0B',
        title: 'Ombor Holati',
        desc: products.length > 0 ? 'Barcha mahsulotlar normalda — yetarli zaxira mavjud.' : 'Omborga tovar qo\'shing — keyin shu yerda holat tahlili chiqadi.',
        tag: products.length > 0 ? 'Yaxshi ✅' : 'Ombor bo\'sh', tagType: products.length > 0 ? 'g' : 'p'
      });
    }

    // Profit insight
    const fmtNum = n => n >= 1000000 ? (n / 1000000).toFixed(1) + ' mln' : n.toLocaleString();
    dynamicInsights.push({
      id: 'i4', icon: '💰', color: '#A78BFA',
      title: 'Foyda Tahlili',
      desc: totalSales > 0
        ? `Jami sotuv: ${fmtNum(totalSales)} so'm. Xarajatlar: ${fmtNum(totalExpenses)} so'm. Sof foyda: ${fmtNum(totalProfit)} so'm.`
        : 'Hali sotuv amalga oshirilmagan. POS orqali sotuv qilganingizda foyda tahlili shu yerda chiqadi.',
      tag: totalSales > 0 ? `Foyda: ${fmtNum(totalProfit)} so'm` : 'Hisoblash kutilmoqda',
      tagType: totalProfit > 0 ? 'g' : totalProfit < 0 ? 'r' : 'p'
    });

    setInsights(dynamicInsights);

    // Monthly chart data (last 6 months)
    const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
    const now = new Date();
    const mData = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const mTxns = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= m && d < mEnd;
      });
      const sotuv = mTxns.reduce((s, t) => s + (Number(t.total) || 0), 0);
      mData.push({ month: months[m.getMonth()], sotuv });
    }
    setMonthlyData(mData);

    setLoading(false);
  };

  const handleApply = (id, msg) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setApplied(prev => ({ ...prev, [id]: true }));
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
    }, 800);
  };

  const CustomTT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return <div className="glass" style={{ borderRadius: 10, padding: '10px 14px', fontSize: 12, border: '1px solid rgba(255,255,255,0.1)' }}><div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div><div style={{ color: '#A78BFA' }}>{(payload[0].value / 1000000).toFixed(1)} mln so'm</div></div>;
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--s1)', padding: '20px 30px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <span style={{ fontSize: 24, animation: 'spin 1s linear infinite' }}>🤖</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>AI tahlil qilinmoqda...</span>
          </div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', color: '#fff', padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, zIndex: 9999, boxShadow: '0 10px 30px rgba(139,92,246,0.4)', animation: 'slideUp .4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          {toast}
        </div>
      )}

      <div style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.1),rgba(59,130,246,0.06))', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <span style={{ fontSize: 44, filter: 'drop-shadow(0 4px 8px rgba(167,139,250,0.3))' }}>🤖</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4, background: 'linear-gradient(90deg, #A78BFA, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MyBazzar AI Markazi</div>
          <div style={{ fontSize: 13, color: 'var(--t2)' }}>Do'koningiz ma'lumotlari asosida tayyorlangan tahlillar va maslahatlar.</div>
        </div>
        <button onClick={() => analyzeData(user?.store_id)} style={{ marginLeft: 'auto', padding: '10px 18px', background: 'var(--s2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', cursor: 'pointer', fontSize: 13, fontFamily: 'Outfit', fontWeight: 700, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--s2)'}>
          ↻ Qayta Tahlil Qilish
        </button>
      </div>

      {insights.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          {insights.map((ins) => (
            <div key={ins.id} className="glass-card fast-transition" style={{ borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = ins.color + '44'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 140, height: 140, background: ins.color, opacity: 0.08, borderRadius: '50%', filter: 'blur(35px)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 32, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>{ins.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{ins.title}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, flex: 1, marginBottom: 20 }}>
                {ins.desc}
              </div>
              <div style={{ marginTop: 'auto' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 20, background: ins.tagType === 'g' ? 'rgba(16,185,129,0.1)' : ins.tagType === 'r' ? 'rgba(244,63,94,0.1)' : 'rgba(167,139,250,0.15)', color: ins.tagType === 'g' ? '#10B981' : ins.tagType === 'r' ? '#F43F5E' : '#A78BFA' }}>
                  {ins.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="glass-card" style={{ borderRadius: 16, padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14 }}>Ma'lumotlar yuklanmoqda...</div>
        </div>
      )}

      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <SectionHeader title="Oylik Sotuv Trendi" />
        {monthlyData.some(m => m.sotuv > 0) ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: 'var(--t2)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="sotuv" fill="url(#colorSotuv)" radius={[6, 6, 0, 0]} barSize={40} />
              <defs>
                <linearGradient id="colorSotuv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>Hozircha sotuv ma'lumotlari yo'q</div>
        )}
      </div>
    </div>
  );
}



// ── REPORTS ────────────────────────────────────────────────────────
export function Reports() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [reportStats, setReportStats] = useState({ totalSales: 0, totalProfit: 0, txnCount: 0, avgCheck: 0, totalExpenses: 0, totalDebt: 0, productCount: 0, lowStock: 0 });

  useEffect(() => {
    if (user?.store_id) loadReportData(user.store_id);
  }, [user]);

  const loadReportData = async (storeId) => {
    const { data: txns } = await supabase.from('transactions').select('total, items').eq('store_id', storeId).eq('status', 'completed');
    const { data: exps } = await supabase.from('expenses').select('amount').eq('store_id', storeId);
    const { data: debts } = await supabase.from('debts').select('amount').eq('store_id', storeId).eq('status', "To'lanmagan");
    const { data: prods } = await supabase.from('products').select('stock').eq('store_id', storeId);

    const totalSales = txns ? txns.reduce((s, t) => s + (Number(t.total) || 0), 0) : 0;
    const txnCount = txns ? txns.length : 0;
    const avgCheck = txnCount > 0 ? Math.round(totalSales / txnCount) : 0;
    const totalExpenses = exps ? exps.reduce((s, e) => s + (Number(e.amount) || 0), 0) : 0;
    const totalDebt = debts ? debts.reduce((s, d) => s + (Number(d.amount) || 0), 0) : 0;
    const productCount = prods ? prods.length : 0;
    const lowStock = prods ? prods.filter(p => p.stock <= 10).length : 0;
    const totalProfit = totalSales - totalExpenses;

    setReportStats({ totalSales, totalProfit, txnCount, avgCheck, totalExpenses, totalDebt, productCount, lowStock });
  };

  const fmt = n => n >= 1000000 ? (n / 1000000).toFixed(1) + ' mln' : n.toLocaleString();

  const getReportData = () => {
    const r = reportStats;
    return [
      { l: 'Jami sotuv', v: `${fmt(r.totalSales)} so'm`, c: '#3B82F6' },
      { l: 'Jami foyda', v: `${fmt(r.totalProfit)} so'm`, c: '#10B981' },
      { l: 'Tranzaksiyalar', v: `${r.txnCount} ta`, c: '#F59E0B' },
      { l: "O'rtacha chek", v: `${fmt(r.avgCheck)} so'm`, c: '#A78BFA' },
    ];
  };

  const currentData = getReportData();

  const renderDetailedReport = () => {
    const type = selected ? selected.id : 'sales';
    if (type === 'sales') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
          <div style={{ padding: 20, background: 'var(--s2)', borderRadius: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 18 }}>📈 Oylik Sotuv Dinamikasi</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[]}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: 'var(--t2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sotuv" fill="url(#salesGrad)" radius={[4, 4, 0, 0]} name="Sotuv (so'm)" />
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.2)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: 20, background: 'var(--s2)', borderRadius: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 18 }}>📊 Umumiy ma'lumotlar</div>
            {[
              { d: 'Jami xarajatlar', sum: fmt(reportStats.totalExpenses), color: '#F43F5E' },
              { d: 'Jami qarzdorlik', sum: fmt(reportStats.totalDebt), color: '#F59E0B' },
              { d: 'Ombordagi tovarlar', sum: `${reportStats.productCount} ta`, color: '#3B82F6' },
              { d: 'Kam qoldiq (<10)', sum: `${reportStats.lowStock} ta`, color: '#F43F5E' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i !== 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', fontSize: 13 }}>
                <span style={{ color: 'var(--t2)', fontWeight: 600 }}>{d.d}</span>
                <span style={{ fontWeight: 800, color: d.color }}>{d.sum}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (type === 'products') {
      const topProds = [];
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div style={{ padding: 20, background: 'var(--s2)', borderRadius: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 18 }}>📦 Eng Ko'p Sotilganlar (Dona)</div>
            {topProds.map((p, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{p.n}</span>
                  <span style={{ fontWeight: 800, color: p.c }}>{p.v} dona</span>
                </div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.v / p.max) * 100}%`, background: p.c, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 20, background: 'var(--s2)', borderRadius: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 18 }}>💸 Eng Ko'p Foyda Keltirganlar</div>
            {[{ n: 'Red Bull', v: '2,400,000' }, { n: 'Snickers', v: '1,850,000' }, { n: 'Coca Cola', v: '1,200,000' }, { n: 'Pista & Bodom', v: '950,000' }].map((p, i) => (
              <div key={i} className="fast-transition" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 8, fontSize: 13, border: '1px solid transparent', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                <span style={{ fontWeight: 600 }}>{p.n}</span>
                <span style={{ fontWeight: 800, color: '#10B981' }}>{p.v} so'm</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (type === 'staff') {
      return (
        <div style={{ padding: 20, background: 'var(--s2)', borderRadius: 12, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>👥 Xodimlar KPI (Maqsad: 50,000,000 so'm)</div>
            <Badge type="info">Aktiv Reyting</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {EMPLOYEES.filter(e => e.sales > 0).sort((a, b) => b.sales - a.sales).map((e, index) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: index === 0 ? '#F59E0B' : 'var(--t2)', width: 20 }}>#{index + 1}</div>
                <Avatar initials={e.name.substring(0, 2).toUpperCase()} color={index === 0 ? '#F59E0B' : '#3B82F6'} size={36} />
                <div style={{ width: 140 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)' }}>{e.txns} ta tranzaksiya</div>
                </div>
                <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (e.sales / 50000000) * 100)}%`, background: `linear-gradient(90deg, ${index === 0 ? '#F59E0B' : '#3B82F6'}, ${index === 0 ? '#FDE68A' : '#60A5FA'})`, borderRadius: 4, transition: 'width 1s ease' }} />
                </div>
                <div style={{ width: 120, textAlign: 'right', fontSize: 14, fontWeight: 800, color: index === 0 ? '#F59E0B' : '#3B82F6' }}>{e.sales.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (type === 'finance') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginTop: 16 }}>
          <div style={{ padding: 24, background: 'var(--s2)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 20, alignSelf: 'flex-start' }}>Pirog Diagramma</div>
            <div style={{ width: 160, height: 160, borderRadius: '50%', background: 'conic-gradient(#10B981 0% 80%, #F43F5E 80% 92%, #F59E0B 92% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'var(--s2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 1 }}>Daromad</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#10B981' }}>80%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 24, fontSize: 11, fontWeight: 700 }}>
              <span style={{ color: '#10B981' }}>● Sof Foyda</span>
              <span style={{ color: '#F43F5E' }}>● Xarajat</span>
              <span style={{ color: '#F59E0B' }}>● Qarz</span>
            </div>
          </div>
          <div style={{ padding: 24, background: 'var(--s2)', borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Oqimlar (Pul aylanishi)</div>
            <div className="fast-transition" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(16,185,129,0.06)', borderRadius: 12, borderLeft: '4px solid #10B981', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Sof Foyda (Kirim)</div>
                <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>+ Barcha xarajatlar chegirildi</div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#10B981' }}>+385.0M</span>
            </div>
            <div className="fast-transition" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(244,63,94,0.06)', borderRadius: 12, borderLeft: '4px solid #F43F5E', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.06)'}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Xarajatlar (Chiqim)</div>
                <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>Ijara, oyliklar, boshqa</div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#F43F5E' }}>-45.0M</span>
            </div>
            <div className="fast-transition" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(245,158,11,0.06)', borderRadius: 12, borderLeft: '4px solid #F59E0B', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.06)'}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Tushishi kerak (Nasiya)</div>
                <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>Xaridorlardan kutilayotgan qarzdorlik</div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B' }}>12.4M</span>
            </div>
          </div>
        </div>
      );
    }
    if (type === 'forecast' || type === 'tax') {
      const isTax = type === 'tax';
      return (
        <div style={{ padding: 24, background: 'var(--s2)', borderRadius: 12, marginTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            {isTax ? <span style={{ fontSize: 24 }}>🧾</span> : <span style={{ fontSize: 24 }}>🔮</span>}
            {isTax ? "Avtomatlashtirilgan Soliq Tizimi (4%)" : "Sun'iy Intellekt Prognozi (Kelgusi chorak)"}
          </div>
          <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.7 }}>
            {isTax ? "Ushbu ma'lumotlar avtomatik tarzda Soliq.uz bazasiga jo'natish uchun tayyorlandi. 4% aylanma soliq to'lovchilar uchun hisoblangan maxsus hisobot. Har bir sotilgan mahsulotning terminal va naqd chek tarixi solishtirilib, 100% aniqlik bilan chiqarilgan xulosa." : "AI o'tgan 6 oylik savdo statistikasiga asoslanib, kelgusi bayram va issiq mavsum o'zgarishlarini hisobga olgan holda sotuvni 12% dan 18% gacha o'sishini prognoz qilmoqda. Fevral-Mart oylarida Ichimliklar zaxirasini 30% ga ko'paytirish qattiq tavsiya etiladi."}
          </p>
          {isTax && (
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <div style={{ padding: 18, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>O'zbekiston DSC</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#3B82F6' }}>Yuborishga tayyor ✓</div>
              </div>
              <div style={{ padding: 18, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>So'nggi Yangilanish</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#10B981' }}>Bugun 09:30 ✓</div>
              </div>
              <Btn variant="primary" size="lg" style={{ height: '100%' }}>Soliqqa Yuborish 🚀</Btn>
            </div>
          )}
          {!isTax && (
            <div style={{ marginTop: 20, display: 'flex', gap: 14 }}>
              <Btn variant="primary">Batafsil Prognoz Hisoboti</Btn>
              <Btn variant="subtle">Zaxira Rejasini Ko'rish</Btn>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[].map(r => (
          <div key={r.id} onClick={() => setSelected(r)} className="glass-card fast-transition" style={{ border: `1px solid ${selected?.id === r.id ? r.color : 'rgba(255,255,255,0.05)'}`, borderRadius: 16, padding: 22, cursor: 'pointer', background: selected?.id === r.id ? `${r.color}15` : 'var(--s1)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${r.color}22` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = selected?.id === r.id ? r.color : 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = selected?.id === r.id ? 'translateY(-2px)' : 'none'; e.currentTarget.style.boxShadow = selected?.id === r.id ? `0 8px 24px ${r.color}22` : 'none' }}>
            <div style={{ fontSize: 34, marginBottom: 12, filter: `drop-shadow(0 2px 8px ${r.color}44)` }}>{r.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 18 }}>{r.desc}</div>
            <button className="fast-transition" style={{ padding: '8px 16px', background: selected?.id === r.id ? r.color : `linear-gradient(135deg,${r.color},${r.color}cc)`, border: 'none', borderRadius: 9, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', boxShadow: `0 4px 14px ${r.color}30` }} onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseLeave={e => e.currentTarget.style.filter = 'none'}>{selected?.id === r.id ? "Tanlandi" : "Ko'rish"}</button>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <SectionHeader title={selected ? selected.name + " — Bu Oy" : "Sotuv Hisoboti — Bu Oy"}>
          <Btn variant="subtle" size="sm">📅 Davr</Btn>
          <Btn variant="primary" size="sm">📥 Excel</Btn>
          <Btn variant="subtle" size="sm">🖨️ PDF</Btn>
        </SectionHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {currentData.map(s => (
            <div key={s.l} style={{ background: 'var(--s2)', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'var(--t2)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Dynamic Detailed Content */}
      {renderDetailedReport()}
    </div >
  );
}

// ── SETTINGS ────────────────────────────────────────────────────────
export function Settings() {
  const { settings, toggleSetting, setSettings } = useAuth();
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const save = () => { setSettings(p => ({ ...p, language: document.getElementById('langSelect').value })); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="glass-card" style={{ borderRadius: 16, padding: 22, height: 'max-content' }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>🏪 {t('storeInfo')}</div>
        {[{ lbl: "Do'kon nomi", val: "Asosiy Do'kon #1", type: 'text' }, { lbl: 'Manzil', val: "Toshkent, Yunusobod, 5-uy", type: 'text' }, { lbl: 'Telefon', val: '+998 90 123 45 67', type: 'tel' }, { lbl: 'Email', val: 'info@dokon.uz', type: 'email' }, { lbl: 'STIR', val: '123456789', type: 'text' }].map(f => (
          <div key={f.lbl} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .8 }}>{f.lbl}</label>
            <input defaultValue={f.val} type={f.type} style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
        ))}
        <button className={saved ? 'fast-transition' : 'btn-primary'} onClick={save} style={{ width: '100%', padding: '13px', background: saved ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', marginTop: 4 }}>
          {saved ? `✅ ${t('saved')}` : `💾 ${t('save')}`}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>⚙️ {t('systemSettings')}</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', background: 'var(--s2)', borderRadius: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🌍</span>
              <div><div style={{ fontSize: 13, fontWeight: 600 }}>{t('language')}</div><div style={{ fontSize: 11, color: 'var(--t2)' }}>{t('languageSub')}</div></div>
            </div>
            <select id="langSelect" defaultValue={settings.language} onChange={e => setSettings(p => ({ ...p, language: e.target.value }))} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg)', color: 'var(--t1)', border: '1px solid var(--border)', fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
              <option value="UZ">O'zbekcha</option>
              <option value="RU">Русский</option>
              <option value="EN">English</option>
            </select>
          </div>

          {[
            { key: 'dark', icon: '🌙', label: t('darkMode'), sub: t('darkModeSub') },
            { key: 'notif', icon: '🔔', label: t('alerts'), sub: t('alertsSub') },
            { key: 'sms', icon: '📲', label: t('sms'), sub: t('smsSub') },
            { key: 'offline', icon: '📶', label: t('offlineMode'), sub: t('offlineSub') },
            { key: 'twofa', icon: '🔐', label: t('twoFA'), sub: t('twoFASub') }
          ].map(t => (
            <div key={t.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', background: 'var(--s2)', borderRadius: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div><div style={{ fontSize: 11, color: 'var(--t2)' }}>{t.sub}</div></div>
              </div>
              <div onClick={() => toggleSetting(t.key)} style={{ width: 42, height: 22, borderRadius: 11, cursor: 'pointer', background: settings[t.key] ? '#3B82F6' : 'var(--border)', position: 'relative', transition: 'background .25s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, borderRadius: '50%', width: 18, height: 18, background: '#fff', left: settings[t.key] ? 22 : 2, transition: 'left .25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(34,211,238,0.04))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 6 }}>Joriy Tarif</div>
          <div style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,#3B82F6,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Business</div>
          <div style={{ fontSize: 13, color: 'var(--t2)', margin: '5px 0 14px' }}>$59/oy · 3 do'kon · 15 xodim</div>
          <button style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>Tarifni O'zgartirish</button>
        </div>
      </div>
    </div>
  );
}
