import React, { useState } from 'react';
import { StatCard, Badge, SectionHeader, Btn, Avatar } from '../components/UI';

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const CUSTOMERS_DATA = [
  {
    id: 1, name: 'Sardor Toshmatov', phone: '+998901234567', totalSpent: 4250000, visits: 12, lastVisit: '2025-02-20', debt: 0, avatar: 'ST', color: '#3B82F6',
    purchases: [
      { date: '2025-02-20', items: 'Samsung A55, Qopqoq', total: 3200000, method: 'Plastik' },
      { date: '2025-01-15', items: 'Zaryadlovchi', total: 150000, method: 'Naqd' },
      { date: '2024-12-10', items: 'Naushnik', total: 350000, method: 'Transfer' },
    ]
  },
  {
    id: 2, name: 'Malika Rahimova', phone: '+998901234568', totalSpent: 1800000, visits: 5, lastVisit: '2025-02-18', debt: 450000, avatar: 'MR', color: '#A78BFA',
    purchases: [
      { date: '2025-02-18', items: 'iPhone 15 qopqoq', total: 85000, method: 'Naqd' },
      { date: '2025-01-20', items: 'AirPods Pro', total: 1200000, method: 'Nasiya', debt: 450000 },
    ]
  },
  {
    id: 3, name: 'Jasur Karimov', phone: '+998901234569', totalSpent: 7600000, visits: 23, lastVisit: '2025-02-21', debt: 0, avatar: 'JK', color: '#10B981',
    purchases: [
      { date: '2025-02-21', items: 'iPhone 15 Pro 256GB', total: 5500000, method: 'Plastik' },
      { date: '2025-01-05', items: 'MagSafe, Qopqoq', total: 380000, method: 'Naqd' },
    ]
  },
  {
    id: 4, name: 'Zulfiya Umarova', phone: '+998901234570', totalSpent: 620000, visits: 3, lastVisit: '2025-01-30', debt: 200000, avatar: 'ZU', color: '#F59E0B',
    purchases: [
      { date: '2025-01-30', items: 'Redmi Note 13', total: 820000, method: 'Nasiya', debt: 200000 },
    ]
  },
  {
    id: 5, name: 'Otabek Yusupov', phone: '+998901234571', totalSpent: 3100000, visits: 8, lastVisit: '2025-02-19', debt: 0, avatar: 'OY', color: '#F43F5E',
    purchases: [
      { date: '2025-02-19', items: 'Samsung S24, Stiklo', total: 1200000, method: 'Transfer' },
    ]
  },
  {
    id: 6, name: 'Feruza Nazarova', phone: '+998901234572', totalSpent: 950000, visits: 4, lastVisit: '2025-02-10', debt: 300000, avatar: 'FN', color: '#22D3EE',
    purchases: [
      { date: '2025-02-10', items: 'Xiaomi 14, Qopqoq', total: 1250000, method: 'Nasiya', debt: 300000 },
    ]
  },
];

const DEBTS_DATA = CUSTOMERS_DATA.filter(c => c.debt > 0).map(c => ({
  ...c,
  dueDate: '2025-03-15',
  daysLeft: Math.floor(Math.random() * 25) + 5,
  paid: Math.round((c.totalSpent / (c.totalSpent + c.debt)) * 100),
}));

// ── CRM PAGE ──────────────────────────────────────────────────────────────
export function CRM() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = CUSTOMERS_DATA.filter(c => {
    const matchQ = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchF = filter === 'all' ? true : filter === 'debt' ? c.debt > 0 : c.visits >= 10;
    return matchQ && matchF;
  });

  const totalDebt = CUSTOMERS_DATA.reduce((s, c) => s + c.debt, 0);
  const totalRevenue = CUSTOMERS_DATA.reduce((s, c) => s + c.totalSpent, 0);
  const debtors = CUSTOMERS_DATA.filter(c => c.debt > 0).length;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard icon="👥" value={CUSTOMERS_DATA.length} label="Jami mijozlar" accent="#3B82F6" />
        <StatCard icon="💰" value={`${(totalRevenue / 1000000).toFixed(1)}M`} label="Jami daromad (so'm)" accent="#10B981" />
        <StatCard icon="💸" value={debtors} label="Nasiyadorlar" accent="#F43F5E" change={`${(totalDebt / 1000000).toFixed(2)}M qarz`} changeType="down" />
        <StatCard icon="⭐" value="Jasur K." label="Eng yaxshi mijoz" accent="#F59E0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16 }}>

        {/* Left: list */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Mijozlar Bazasi">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Ism yoki telefon..."
              className="fast-transition"
              style={{ padding: '8px 14px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', width: 200, backdropFilter: 'blur(4px)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
            />
            <Btn variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Yangi Mijoz</Btn>
          </SectionHeader>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['all', 'Hammasi'], ['debt', 'Nasiyadorlar'], ['loyal', 'Doimiy']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                fontFamily: 'Outfit,sans-serif', cursor: 'pointer', border: `1px solid ${filter === k ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
                background: filter === k ? 'rgba(59,130,246,0.1)' : 'var(--s2)',
                color: filter === k ? '#3B82F6' : 'var(--t2)',
              }}>{l}</button>
            ))}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Mijoz', 'Telefon', 'Xaridlar', 'Jami Summa', 'Qarz', 'Oxirgi Tashrif', ''].map(h => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: .8, padding: '0 10px 12px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}
                  className="fast-transition"
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  style={{ cursor: 'pointer', background: selected?.id === c.id ? 'rgba(59,130,246,0.1)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = selected?.id === c.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = selected?.id === c.id ? 'rgba(59,130,246,0.1)' : 'transparent'}
                >
                  <td style={{ padding: '11px 10px 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={c.avatar} color={c.color} size={32} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 10px 11px 0', fontSize: 12, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'JetBrains Mono,monospace' }}>{c.phone}</td>
                  <td style={{ padding: '11px 10px 11px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>{c.visits}</td>
                  <td style={{ padding: '11px 10px 11px 0', fontSize: 13, fontWeight: 700, color: '#10B981', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{c.totalSpent.toLocaleString()}</td>
                  <td style={{ padding: '11px 10px 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {c.debt > 0
                      ? <Badge type="danger">{c.debt.toLocaleString()} so'm</Badge>
                      : <Badge type="success">✓ Toza</Badge>
                    }
                  </td>
                  <td style={{ padding: '11px 10px 11px 0', fontSize: 11, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{c.lastVisit}</td>
                  <td style={{ padding: '11px 0 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Btn variant="subtle" size="sm">Ko'rish</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: detail */}
        {selected && (
          <div className="glass-card" style={{ borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Mijoz Kartochkasi</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--t2)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--s2)', borderRadius: 12 }}>
              <Avatar initials={selected.avatar} color={selected.color} size={52} />
              <div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', fontFamily: 'JetBrains Mono,monospace' }}>{selected.phone}</div>
                {selected.debt > 0 && <Badge type="danger" style={{ marginTop: 6 }}>Nasiya: {selected.debt.toLocaleString()} so'm</Badge>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: 'Jami xaridlar', v: selected.visits + ' ta' },
                { l: 'Jami summa', v: selected.totalSpent.toLocaleString() + " so'm" },
                { l: 'Oxirgi tashrif', v: selected.lastVisit },
                { l: 'Holat', v: selected.debt > 0 ? '⚠️ Nasiyador' : '✅ Toza' },
              ].map(s => (
                <div key={s.l} style={{ background: 'var(--s2)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--t2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .8 }}>{s.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{s.v}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Xaridlar Tarixi</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.purchases.map((p, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{p.items}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>{p.total.toLocaleString()} so'm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--t2)' }}>{p.date}</span>
                      <Badge type={p.method === 'Nasiya' ? 'warning' : 'info'}>{p.method}</Badge>
                    </div>
                    {p.debt > 0 && <div style={{ fontSize: 11, color: '#F43F5E', marginTop: 6 }}>⚠️ Qolgan qarz: {p.debt.toLocaleString()} so'm</div>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <Btn variant="primary" style={{ flex: 1 }} size="sm">📱 SMS Yuborish</Btn>
              <Btn variant="ghost" style={{ flex: 1 }} size="sm">✏️ Tahrirlash</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 36, width: 400, maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>👥 Yangi Mijoz Qo'shish</div>
            {[
              { lbl: 'Ism Familiya', ph: 'Sardor Toshmatov', type: 'text' },
              { lbl: 'Telefon raqam', ph: '+998 90 123 45 67', type: 'tel' },
              { lbl: 'Manzil (ixtiyoriy)', ph: 'Toshkent, Yunusobod', type: 'text' },
            ].map(f => (
              <div key={f.lbl} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .8 }}>{f.lbl}</label>
                <input type={f.type} placeholder={f.ph} className="fast-transition" style={{ width: '100%', padding: '11px 14px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--t1)', fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', backdropFilter: 'blur(4px)' }} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="fast-transition" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>Bekor</button>
              <Btn variant="primary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Saqlash</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NASIYA PAGE ────────────────────────────────────────────────────────────
export function Nasiya() {
  const [showPay, setShowPay] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [debts, setDebts] = useState(DEBTS_DATA);
  const [showAdd, setShowAdd] = useState(false);
  const [newDebt, setNewDebt] = useState({ name: '', phone: '', debt: '', daysLeft: 30 });
  const [toast, setToast] = useState(null);

  const totalDebt = debts.reduce((s, d) => s + d.debt, 0);
  const urgent = debts.filter(d => d.daysLeft <= 7).length;

  const handlePay = () => {
    if (!paidAmount || isNaN(paidAmount)) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setDebts(prev => prev.map(d => d.id === showPay.id ? { ...d, debt: Math.max(0, d.debt - parseInt(paidAmount)) } : d));
      setShowPay(null);
      setPaidAmount('');
    }, 2000);
  };

  const handleAddDebt = () => {
    if (!newDebt.name || !newDebt.debt) return;
    const d = {
      id: Date.now(),
      name: newDebt.name,
      phone: newDebt.phone || '+998',
      debt: parseInt(newDebt.debt),
      daysLeft: parseInt(newDebt.daysLeft) || 30,
      paid: 0,
      dueDate: new Date(Date.now() + parseInt(newDebt.daysLeft || 30) * 86400000).toISOString().split('T')[0],
      avatar: newDebt.name.substring(0, 2).toUpperCase(),
      color: '#3B82F6'
    };
    setDebts(prev => [d, ...prev]);
    setShowAdd(false);
    setNewDebt({ name: '', phone: '', debt: '', daysLeft: 30 });
    setToast('✅ Nasiya qabul qilindi!');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard icon="💸" value={debts.length} label="Nasiyadorlar" accent="#F43F5E" />
        <StatCard icon="💰" value={`${(totalDebt / 1000000).toFixed(2)}M`} label="Jami qarz (so'm)" accent="#F59E0B" change="To'lanmagan" changeType="down" />
        <StatCard icon="⚠️" value={urgent} label="Muddati yaqin (7 kun)" accent="#F43F5E" />
        <StatCard icon="✅" value="8" label="Bu oy to'lagan" accent="#10B981" />
      </div>

      {/* Urgent alert */}
      {urgent > 0 && (
        <div style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, color: '#F43F5E', fontSize: 13 }}>
          🔔 <strong>{urgent} ta nasiyaning muddati 7 kun ichida tugaydi!</strong> SMS eslatma yuborish tavsiya etiladi.
          <Btn variant="danger" size="sm" style={{ marginLeft: 'auto' }}>SMS Yuborish</Btn>
        </div>
      )}

      {/* Debt list */}
      <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
        <SectionHeader title="Nasiyalar Ro'yxati">
          <Btn variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Yangi Nasiya</Btn>
          <Btn variant="subtle" size="sm">📥 Excel</Btn>
        </SectionHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {debts.map(d => (
            <div key={d.id} className="glass-card fast-transition" style={{
              borderRadius: 14, padding: 18, background: 'rgba(17, 24, 39, 0.4)',
              border: `1px solid ${d.daysLeft <= 7 ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.05)'}`,
              display: 'flex', flexDirection: 'column', gap: 12,
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(17, 24, 39, 0.4)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials={d.avatar} color={d.color} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', fontFamily: 'JetBrains Mono,monospace' }}>{d.phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#F43F5E' }}>{d.debt.toLocaleString()} so'm</div>
                  <div style={{ fontSize: 11, color: d.daysLeft <= 7 ? '#F43F5E' : 'var(--t2)' }}>
                    {d.daysLeft <= 7 ? '🔴' : '🟡'} {d.daysLeft} kun qoldi · {d.dueDate}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t2)', marginBottom: 6 }}>
                  <span>To'langan: {d.paid}%</span>
                  <span>Qolgan: {100 - d.paid}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.paid}%`, background: 'linear-gradient(90deg,#10B981,#22D3EE)', borderRadius: 3, transition: 'width .5s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="green" size="sm" onClick={() => setShowPay(d)} style={{ flex: 1 }}>
                  💵 To'lov Qabul Qilish
                </Btn>
                <Btn variant="subtle" size="sm" onClick={() => alert('SMS: "Hurmatli ' + d.name + ', nasiya muddatingiz ' + d.dueDate + ' da tugaydi. Qarz: ' + d.debt.toLocaleString() + " so'm")}>
                  📱 SMS
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pay modal */}
      {showPay && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 36, width: 380, maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 60, marginBottom: 14 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>To'lov qabul qilindi!</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 8 }}>{parseInt(paidAmount || 0).toLocaleString()} so'm kiritildi</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>💵 To'lov Qabul Qilish</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 24 }}>{showPay.name} · Qarz: {showPay.debt.toLocaleString()} so'm</div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .8 }}>To'lov miqdori (so'm)</label>
                  <input
                    type="number" value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder={showPay.debt}
                    className="fast-transition"
                    style={{ width: '100%', padding: '13px 14px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--t1)', fontSize: 18, fontFamily: 'Outfit,sans-serif', fontWeight: 700, outline: 'none', backdropFilter: 'blur(4px)' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {[25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => setPaidAmount(Math.round(showPay.debt * pct / 100))}
                        style={{ flex: 1, padding: '6px 4px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--t2)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .8 }}>To'lov usuli</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {['💵 Naqd', '💳 Plastik', '📱 Transfer'].map(m => (
                      <button key={m} style={{ padding: '10px 4px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--t2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>{m}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="fast-transition" onClick={() => { setShowPay(null); setPaidAmount(''); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>Bekor</button>
                  <Btn variant="green" onClick={handlePay} disabled={!paidAmount} style={{ flex: 1 }}>✓ Tasdiqlash</Btn>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Nasiya modal */}
      {showAdd && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 36, width: 400, maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>🤝 Yangi Nasiya Qo'shish</div>
            {[
              { lbl: 'Mijoz Ism Familiyasi', key: 'name', ph: 'Dilshod Karimov', type: 'text' },
              { lbl: 'Telefon raqam', key: 'phone', ph: '+998 90 123 45 67', type: 'tel' },
              { lbl: 'Qarz Miqdori (so\'m)', key: 'debt', ph: 'Masalan: 500000', type: 'number' },
              { lbl: 'Muddati (necha kundan keyin)', key: 'daysLeft', ph: '30', type: 'number' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .8 }}>{f.lbl}</label>
                <input type={f.type} value={newDebt[f.key]} onChange={e => setNewDebt({ ...newDebt, [f.key]: e.target.value })} placeholder={f.ph} className="fast-transition" style={{ width: '100%', padding: '11px 14px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--t1)', fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', backdropFilter: 'blur(4px)' }} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="fast-transition" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>Bekor</button>
              <button className={!newDebt.name || !newDebt.debt ? "fast-transition" : "btn-primary"} disabled={!newDebt.name || !newDebt.debt} onClick={handleAddDebt} style={{ flex: 1, padding: '12px', background: !newDebt.name || !newDebt.debt ? 'var(--s2)' : 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', borderRadius: 11, color: !newDebt.name || !newDebt.debt ? 'var(--t2)' : '#fff', fontSize: 13, fontWeight: 800, cursor: !newDebt.name || !newDebt.debt ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', opacity: !newDebt.name || !newDebt.debt ? .45 : 1 }}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#10B981', color: '#fff', padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'slideUp .3s ease' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── CHEK PRINTER PAGE ──────────────────────────────────────────────────────
export function ChekPrinter() {
  const [template, setTemplate] = useState('standard');
  const [storeName, setStoreName] = useState("Asosiy Do'kon");
  const [storePhone, setStorePhone] = useState('+998 90 123 45 67');
  const [storeAddress, setStoreAddress] = useState('Toshkent, Yunusobod, 5');
  const [footer, setFooter] = useState('Xarid uchun rahmat! Qaytib keling!');
  const [showLogo, setShowLogo] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [printing, setPrinting] = useState(false);

  const sampleItems = [
    { name: 'Samsung A55 128GB', qty: 1, price: 3200000 },
    { name: 'Qopqoq (Silikon)', qty: 1, price: 45000 },
    { name: 'Stiklo (2 ta)', qty: 2, price: 25000 },
  ];
  const subtotal = sampleItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = 50000;
  const total = subtotal - discount;

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => setPrinting(false), 2000);
    window.print();
  };

  return (
    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

      {/* Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="🖨️ Chek Sozlamalari" />

          {/* Template */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: .8 }}>Shablon</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { id: 'standard', label: 'Standart', desc: 'Klassik 58mm' },
                { id: 'compact', label: 'Ixcham', desc: 'Minimal matn' },
                { id: 'detailed', label: "To'liq", desc: 'Batafsil ma\'lumot' },
              ].map(t => (
                <div key={t.id} onClick={() => setTemplate(t.id)} style={{
                  padding: '12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `1px solid ${template === t.id ? '#3B82F6' : 'var(--border)'}`,
                  background: template === t.id ? 'rgba(59,130,246,0.08)' : 'var(--s2)',
                  transition: 'all .15s',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: template === t.id ? '#3B82F6' : 'var(--t1)' }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 3 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Store info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { lbl: "Do'kon nomi", val: storeName, set: setStoreName },
              { lbl: 'Telefon', val: storePhone, set: setStorePhone },
              { lbl: 'Manzil', val: storeAddress, set: setStoreAddress },
              { lbl: 'Pastki matn', val: footer, set: setFooter },
            ].map(f => (
              <div key={f.lbl} style={{ gridColumn: f.lbl === 'Manzil' || f.lbl === 'Pastki matn' ? '1/-1' : 'auto' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .8 }}>{f.lbl}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Logo va do\'kon nomi', val: showLogo, set: setShowLogo },
              { label: 'QR kod (sayt/telegram)', val: showQr, set: setShowQr },
            ].map(t => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--s2)', borderRadius: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
                <div onClick={() => t.set(!t.val)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', background: t.val ? '#3B82F6' : 'var(--border)', position: 'relative', transition: 'background .25s' }}>
                  <div style={{ position: 'absolute', top: 2, borderRadius: '50%', width: 18, height: 18, background: '#fff', left: t.val ? 20 : 2, transition: 'left .25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Font size */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .8 }}>Matn o'lchami</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['kichik', 'normal', 'katta'].map(s => (
                <button key={s} onClick={() => setFontSize(s)} style={{
                  flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  fontFamily: 'Outfit,sans-serif', cursor: 'pointer', textTransform: 'capitalize',
                  border: `1px solid ${fontSize === s ? '#3B82F6' : 'var(--border)'}`,
                  background: fontSize === s ? 'rgba(59,130,246,0.1)' : 'var(--s2)',
                  color: fontSize === s ? '#3B82F6' : 'var(--t2)',
                }}>{s}</button>
              ))}
            </div>
          </div>

          <Btn variant="primary" onClick={handlePrint} style={{ width: '100%' }}>
            {printing ? '⏳ Chop etilmoqda...' : '🖨️ Chek Chop Etish'}
          </Btn>
        </div>

        {/* Printer status */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Printer Holati</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '✅', label: 'Printer ulangan', val: 'USB / Bluetooth', color: '#10B981' },
              { icon: '📄', label: 'Qog\'oz', val: "Yetarli (58mm)", color: '#10B981' },
              { icon: '🖨️', label: 'Model', val: 'SUNMI V2s Pro', color: '#3B82F6' },
              { icon: '⚡', label: 'Tezlik', val: '90 mm/s', color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECEIPT PREVIEW */}
      <div style={{ position: 'sticky', top: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 12, textAlign: 'center' }}>
          Ko'rinish (58mm)
        </div>
        <div style={{
          background: '#fff', color: '#000',
          width: '100%', maxWidth: 220,
          margin: '0 auto',
          borderRadius: 8,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: fontSize === 'kichik' ? 10 : fontSize === 'katta' ? 14 : 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          userSelect: 'none',
        }}>
          {/* Receipt paper effect top */}
          <div style={{ height: 12, background: '#f5f5f5', borderBottom: '1px dashed #ccc' }} />

          <div style={{ padding: '12px 10px', lineHeight: 1.8 }}>
            {showLogo && (
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 18 }}>🏪</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{storeName}</div>
                <div style={{ fontSize: 10, color: '#555' }}>{storePhone}</div>
                <div style={{ fontSize: 10, color: '#555' }}>{storeAddress}</div>
              </div>
            )}

            <div style={{ borderTop: '1px dashed #999', borderBottom: '1px dashed #999', padding: '6px 0', margin: '6px 0', fontSize: 10, textAlign: 'center' }}>
              Chek: #00125 &nbsp;&nbsp; {new Date().toLocaleDateString('uz-UZ')}
            </div>

            {template !== 'compact' && (
              <div style={{ fontSize: 10, marginBottom: 6 }}>
                <div>Kassir: Aziz K.</div>
                <div>To'lov: 💳 Plastik</div>
              </div>
            )}

            <div style={{ borderTop: '1px dashed #ccc', paddingTop: 6, marginTop: 4 }}>
              {sampleItems.map((item, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 11 }}>{item.name}</div>
                  {template !== 'compact' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555' }}>
                      <span>{item.qty} x {item.price.toLocaleString()}</span>
                      <span>{(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  )}
                  {template === 'compact' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                      <span>{item.qty}x</span>
                      <span style={{ fontWeight: 700 }}>{(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed #ccc', paddingTop: 6, marginTop: 4 }}>
              {template === 'detailed' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                    <span>Jami:</span><span>{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#d00' }}>
                    <span>Chegirma:</span><span>-{discount.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 13, marginTop: 4 }}>
                <span>JAMI:</span>
                <span>{total.toLocaleString()} so'm</span>
              </div>
            </div>

            {showQr && (
              <div style={{ textAlign: 'center', margin: '10px 0', fontSize: 10, color: '#555' }}>
                ▪▫▪▪▫▪▫▪<br />▫▪▪▫▪▪▫▪<br />▪▪▫▪▫▪▪▫<br />
                <div style={{ marginTop: 4 }}>savdoplatform.uz</div>
              </div>
            )}

            <div style={{ borderTop: '1px dashed #ccc', paddingTop: 8, marginTop: 8, textAlign: 'center', fontSize: 10, color: '#555' }}>
              {footer}
            </div>
          </div>

          {/* Paper tear effect */}
          <div style={{ height: 16, background: 'repeating-linear-gradient(90deg, #fff 0px, #fff 8px, #f5f5f5 8px, #f5f5f5 10px)' }} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Btn variant="subtle" size="sm" onClick={handlePrint}>🖨️ Test Chop Etish</Btn>
        </div>
      </div>
    </div>
  );
}
