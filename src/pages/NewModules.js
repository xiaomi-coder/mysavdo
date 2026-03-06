import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Badge, SectionHeader, Btn, Avatar } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

export function CRM() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [custType, setCustType] = useState('regular');
  const [activeTab, setActiveTab] = useState('info'); // info | history
  const [custTxns, setCustTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', shopName: '', address: '', login: '', password: '' });

  useEffect(() => {
    if (user?.store_id) loadCustomers(user.store_id);
  }, [user]);

  const loadCustomers = async (storeId) => {
    const { data: cData } = await supabase.from('customers').select('*').eq('store_id', storeId).order('last_visit', { ascending: false });
    const { data: dData } = await supabase.from('debts').select('*').eq('store_id', storeId).eq('status', 'To\'lanmagan');
    if (cData) {
      setCustomers(cData.map(c => {
        const activeDebts = dData ? dData.filter(d => d.customer_id === c.id || d.client === c.name || d.phone === c.phone) : [];
        const totalDebtAmount = activeDebts.reduce((sum, d) => sum + (Number(d.amount) - Number(d.paid_amount || 0)), 0);
        return { ...c, debt: totalDebtAmount, avatar: c.name?.substring(0, 2)?.toUpperCase() || 'C', color: c.type === 'dealer' ? '#F59E0B' : '#3B82F6' };
      }));
    }
  };

  const handleAddCustomer = async () => {
    if (!form.name || !form.phone || !user?.store_id) return;
    const ins = { store_id: user.store_id, type: custType, name: form.name, phone: form.phone, total_spent: 0, purchases: 0 };
    if (custType === 'dealer') {
      ins.shop_name = form.shopName;
      ins.address = form.address;
      ins.login = form.login || form.phone.replace(/\D/g, '').slice(-9);
      ins.password = form.password || Math.random().toString(36).slice(-6);
    }
    const { error } = await supabase.from('customers').insert(ins);
    if (!error) {
      loadCustomers(user.store_id);
      setShowAdd(false);
      setForm({ name: '', phone: '', shopName: '', address: '', login: '', password: '' });
      setCustType('regular');
    }
  };

  const filtered = customers.filter(c => {
    const matchQ = c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.shop_name?.toLowerCase().includes(search.toLowerCase());
    const matchF = filter === 'all' ? true : filter === 'debt' ? c.debt > 0 : filter === 'dealer' ? c.type === 'dealer' : c.purchases >= 10;
    return matchQ && matchF;
  });

  const totalDebt = customers.reduce((s, c) => s + (c.debt || 0), 0);
  const totalRevenue = customers.reduce((s, c) => s + (Number(c.total_spent) || 0), 0);
  const dealers = customers.filter(c => c.type === 'dealer').length;
  const debtors = customers.filter(c => c.debt > 0).length;

  const inpS = { width: '100%', padding: '11px 14px', background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--t1)', fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', backdropFilter: 'blur(4px)' };
  const lbS = { fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .8 };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard icon="👥" value={customers.length} label="Jami mijozlar" accent="#3B82F6" />
        <StatCard icon="🏪" value={dealers} label="Do'kondorlar" accent="#F59E0B" />
        <StatCard icon="💸" value={debtors} label="Nasiyadorlar" accent="#F43F5E" change={`${(totalDebt / 1000000).toFixed(2)}M qarz`} changeType="down" />
        <StatCard icon="💰" value={`${(totalRevenue / 1000000).toFixed(1)}M`} label="Jami daromad" accent="#10B981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
          <SectionHeader title="Mijozlar Bazasi">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Ism, telefon, do'kon..." className="fast-transition" style={{ padding: '8px 14px', background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', width: 220, backdropFilter: 'blur(4px)' }} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
            <Btn variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Yangi Mijoz</Btn>
          </SectionHeader>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[['all', 'Hammasi'], ['dealer', '🏪 Do\'kondorlar'], ['debt', '💸 Nasiyadorlar'], ['loyal', '⭐ Doimiy']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', border: `1px solid ${filter === k ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`, background: filter === k ? 'rgba(59,130,246,0.1)' : 'var(--s2)', color: filter === k ? '#3B82F6' : 'var(--t2)' }}>{l}</button>
            ))}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Mijoz', 'Turi', 'Telefon', 'Xaridlar', 'Jami', 'Qarz', 'Oxirgi', ''].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: .8, padding: '0 8px 12px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="fast-transition" onClick={() => setSelected(selected?.id === c.id ? null : c)} style={{ cursor: 'pointer', background: selected?.id === c.id ? 'rgba(59,130,246,0.1)' : 'transparent' }} onMouseEnter={e => { if (selected?.id !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }} onMouseLeave={e => { if (selected?.id !== c.id) e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ padding: '11px 8px 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {c.type === 'dealer'
                        ? <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏪</div>
                        : <Avatar initials={c.avatar} color={c.color} size={32} />}
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                        {c.shop_name && <div style={{ fontSize: 11, color: '#F59E0B' }}>{c.shop_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '11px 8px 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Badge type={c.type === 'dealer' ? 'warning' : 'info'}>{c.type === 'dealer' ? '🏪' : '👤'}</Badge>
                  </td>
                  <td style={{ padding: '11px 8px 11px 0', fontSize: 12, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'JetBrains Mono,monospace' }}>{c.phone}</td>
                  <td style={{ padding: '11px 8px 11px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>{c.purchases}</td>
                  <td style={{ padding: '11px 8px 11px 0', fontSize: 13, fontWeight: 700, color: '#10B981', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{Number(c.total_spent).toLocaleString()}</td>
                  <td style={{ padding: '11px 8px 11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {c.debt > 0 ? <Badge type="danger">{c.debt.toLocaleString()}</Badge> : <Badge type="success">✓</Badge>}
                  </td>
                  <td style={{ padding: '11px 8px 11px 0', fontSize: 11, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{new Date(c.last_visit).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><Btn variant="subtle" size="sm">→</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail card */}
      </div>

      {selected && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26,35,50,0.95) 0%, rgba(13,17,23,0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 36, width: 700, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Mijoz Kartochkasi</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--t2)', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 20, background: 'var(--s2)', borderRadius: 16 }}>
              {selected.type === 'dealer'
                ? <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏪</div>
                : <Avatar initials={selected.avatar} color={selected.color} size={64} style={{fontSize: 24}}/>}
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{selected.name}</div>
                {selected.shop_name && <div style={{ fontSize: 15, color: '#F59E0B', fontWeight: 600 }}>{selected.shop_name}</div>}
                <div style={{ fontSize: 15, color: 'var(--t2)', fontFamily: 'JetBrains Mono,monospace', marginTop: 4 }}>{selected.phone}</div>
                {selected.debt > 0 && <Badge type="danger" style={{ marginTop: 8, fontSize: 13, padding: '6px 10px' }}>Nasiya: {selected.debt.toLocaleString()} so'm</Badge>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}>
              <button onClick={() => setActiveTab('info')} style={{ background: 'none', border: 'none', color: activeTab === 'info' ? '#3B82F6' : 'var(--t2)', fontWeight: 800, fontSize: 15, cursor: 'pointer', borderBottom: activeTab === 'info' ? '2px solid #3B82F6' : '2px solid transparent', paddingBottom: 4 }}>Asosiy ma'lumotlar</button>
              <button 
                onClick={async () => {
                  setActiveTab('history');
                  setLoadingTxns(true);
                  const { data } = await supabase.from('transactions').select('*').eq('customer_id', selected.id).order('date', { ascending: false });
                  setCustTxns(data || []);
                  setLoadingTxns(false);
                }} 
                style={{ background: 'none', border: 'none', color: activeTab === 'history' ? '#3B82F6' : 'var(--t2)', fontWeight: 800, fontSize: 15, cursor: 'pointer', borderBottom: activeTab === 'history' ? '2px solid #3B82F6' : '2px solid transparent', paddingBottom: 4 }}
              >
                Xaridlar tarixi
              </button>
            </div>

            {activeTab === 'info' && (
              <>
                {selected.type === 'dealer' && (
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 20, marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B', marginBottom: 12 }}>🔐 Diler kirish profil ma'lumotlari</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                      <div><span style={{ color: 'var(--t3)' }}>Login:</span> <span style={{ fontFamily: 'JetBrains Mono,monospace', color: '#22D3EE', fontWeight: 700, marginLeft: 6 }}>{selected.login}</span></div>
                      <div><span style={{ color: 'var(--t3)' }}>Parol:</span> <span style={{ fontFamily: 'JetBrains Mono,monospace', color: '#22D3EE', fontWeight: 700, marginLeft: 6 }}>{selected.password}</span></div>
                      {selected.address && <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--t3)' }}>Manzil:</span> {selected.address}</div>}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { l: 'Turi', v: selected.type === 'dealer' ? '🏪 Do\'kondor' : '👤 Oddiy' },
                    { l: 'Xaridlar summasi', v: Number(selected.total_spent).toLocaleString() + " so'm" },
                    { l: 'Tranzaksiyalar soni', v: selected.purchases + ' ta' },
                    { l: 'Holat', v: selected.debt > 0 ? '⚠️ Nasiyador' : '✅ Toza' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--s2)', borderRadius: 14, padding: '16px 20px' }}>
                      <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</div>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'history' && (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loadingTxns ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)' }}>Tarix yuklanmoqda...</div>
                ) : custTxns.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
                    {custTxns.map(t => (
                      <div key={t.id} style={{ background: 'var(--s2)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800 }}>Sotuv {t.receipt_no}</div>
                            <div style={{ fontSize: 11, color: 'var(--t2)' }}>{new Date(t.date).toLocaleString('uz-UZ')}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: t.payment_method === 'nasiya' ? '#F43F5E' : '#10B981' }}>{Number(t.total).toLocaleString()} so'm</div>
                            <Badge type={t.payment_method === 'nasiya' ? 'warning' : 'success'} style={{ fontSize: 10 }}>{t.payment_method === 'nasiya' ? 'Nasiya' : 'Naqd/Plastik'}</Badge>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12 }}>
                          {t.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: 'var(--t2)' }}>
                              <span>{item.qty}x {item.n || item.name} {item.phone_imei1 ? `(IMEI: ${item.phone_imei1})` : ''}</span>
                              <span style={{ fontWeight: 700, color: 'var(--t1)' }}>{(item.price * item.qty).toLocaleString()} so'm</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📦</div>
                    <div>Bu xaridor hali hech qanday xarid amalga oshirmagan</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <Btn variant="primary" style={{ flex: 2, padding: 14, background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(16,185,129,0.3)' }} onClick={() => {
                   navigate('/pos', { state: { selectedCustomer: selected } });
              }}>🛒 Sotuv (POS) oynasiga o'tish</Btn>
              <Btn variant="primary" style={{ flex: 1, padding: 14, borderRadius: 12, fontSize: 15 }}>📱 SMS</Btn>
              <Btn variant="ghost" style={{ flex: 1, padding: 14, borderRadius: 12, fontSize: 15 }}>✏️ Tahrir</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL - 2 type */}
      {showAdd && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26,35,50,0.95) 0%, rgba(13,17,23,0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 36, width: 480, maxWidth: '90vw', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>👥 Yangi Mijoz Qo'shish</div>

            {/* Type tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[{ key: 'regular', icon: '👤', label: 'Oddiy mijoz' }, { key: 'dealer', icon: '🏪', label: 'Do\'kondor' }].map(t => (
                <button key={t.key} onClick={() => setCustType(t.key)} style={{
                  flex: 1, padding: '14px 12px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: 'Outfit,sans-serif', cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
                  border: `2px solid ${custType === t.key ? (t.key === 'dealer' ? '#F59E0B' : '#3B82F6') : 'rgba(255,255,255,0.05)'}`,
                  background: custType === t.key ? (t.key === 'dealer' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)') : 'rgba(17,24,39,0.4)',
                  color: custType === t.key ? (t.key === 'dealer' ? '#F59E0B' : '#3B82F6') : 'var(--t2)',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon}</div>{t.label}
                </button>
              ))}
            </div>

            {custType === 'dealer' && (
              <div style={{ marginBottom: 14 }}>
                <label style={lbS}>Do'kon nomi *</label>
                <input type="text" value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })} placeholder="Sardor Mobile" className="fast-transition" style={inpS} onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbS}>Ism Familiya *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Sardor Toshmatov" className="fast-transition" style={inpS} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>
              <div>
                <label style={lbS}>Telefon *</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 123 45 67" className="fast-transition" style={inpS} onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>
            </div>

            {custType === 'dealer' && (<>
              <div style={{ marginBottom: 14 }}>
                <label style={lbS}>Manzil</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Toshkent, Chilonzor..." className="fast-transition" style={inpS} onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', marginBottom: 12 }}>🔐 Platformaga kirish</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbS}>Login</label>
                    <input type="text" value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} placeholder="Avtomatik" className="fast-transition" style={{ ...inpS, fontFamily: 'JetBrains Mono,monospace' }} onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                  </div>
                  <div>
                    <label style={lbS}>Parol</label>
                    <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Avtomatik" className="fast-transition" style={{ ...inpS, fontFamily: 'JetBrains Mono,monospace' }} onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 8 }}>Bo'sh qolsa avtomatik yaratiladi. Diler shu login/parol bilan kirib xaridlari va qarzini ko'radi.</div>
              </div>
            </>)}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="fast-transition" onClick={() => { setShowAdd(false); setCustType('regular'); setForm({ name: '', phone: '', shopName: '', address: '', login: '', password: '' }); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>Bekor</button>
              <Btn variant="primary" onClick={handleAddCustomer} style={{ flex: 1 }} disabled={!form.name || !form.phone || (custType === 'dealer' && !form.shopName)}>
                {custType === 'dealer' ? '🏪 Do\'kondor Qo\'shish' : '👤 Mijoz Qo\'shish'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NASIYA PAGE ────────────────────────────────────────────────────────────
export function Nasiya() {
  const { user } = useAuth();
  const [showPay, setShowPay] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [payMethod, setPayMethod] = useState('💵 Naqd');
  const [success, setSuccess] = useState(false);
  const [allDebts, setAllDebts] = useState([]);
  const [debts, setDebts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newDebt, setNewDebt] = useState({ name: '', phone: '', debt: '', daysLeft: 30 });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user?.store_id) loadDebts(user.store_id);
  }, [user]);

  const loadDebts = async (storeId) => {
    const { data } = await supabase.from('debts').select('*').eq('store_id', storeId);
    if (data) {
      setAllDebts(data);
      setDebts(data.filter(d => d.status === 'To\'lanmagan').map(d => {
        let dDate;
        if (d.due_date) {
           dDate = new Date(d.due_date);
        } else {
           dDate = new Date(d.date);
           dDate.setDate(dDate.getDate() + 30);
        }
        const diffTime = dDate.getTime() - new Date().getTime();
        const daysL = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const paidNum = Number(d.paid_amount || 0);
        const totalNum = Number(d.amount || 0);
        const remDebt = totalNum - paidNum;
        let pct = 0;
        if (totalNum > 0) pct = Math.round((paidNum / totalNum) * 100);

        return {
          id: d.id, name: d.client, phone: d.phone, debt: remDebt,
          totalAmount: totalNum, paidAmount: paidNum,
          daysLeft: daysL, paid: pct, dueDate: dDate.toLocaleDateString(),
          avatar: d.client?.substring(0, 2)?.toUpperCase(), color: '#3B82F6'
        }
      }));
    }
  };

  const totalDebt = debts.reduce((s, d) => s + d.debt, 0);
  const urgent = debts.filter(d => d.daysLeft <= 7).length;

  const handlePay = async () => {
    if (!paidAmount || isNaN(paidAmount) || !user?.store_id) return;

    const payingNow = parseInt(paidAmount);
    if (payingNow <= 0) return;

    const newPaid = showPay.paidAmount + payingNow;
    const isFullyPaid = newPaid >= showPay.totalAmount;
    const newStatus = isFullyPaid ? "To'landi" : "To'lanmagan";

    const { error } = await supabase.from('debts').update({ paid_amount: newPaid, status: newStatus }).eq('id', showPay.id);
    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        loadDebts(user.store_id);
        setShowPay(null);
        setPaidAmount('');
      }, 2000);
    } else {
      setToast(`❌ Xatolik yuz berdi (${error.message})`);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleAddDebt = async () => {
    if (!newDebt.name || !newDebt.debt || !user?.store_id) return;

    const dDate = new Date();
    dDate.setDate(dDate.getDate() + parseInt(newDebt.daysLeft || 30));

    const { error } = await supabase.from('debts').insert({
      store_id: user.store_id,
      client: newDebt.name,
      amount: parseInt(newDebt.debt),
      paid_amount: 0,
      phone: newDebt.phone || '+998',
      due_date: dDate.toISOString(),
      status: "To'lanmagan"
    });

    if (!error) {
      loadDebts(user.store_id);
      setShowAdd(false);
      setNewDebt({ name: '', phone: '', debt: '', daysLeft: 30 });
      setToast('✅ Nasiya qabul qilindi!');
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard icon="💸" value={debts.length} label="Nasiyadorlar" accent="#F43F5E" />
        <StatCard icon="💰" value={`${(totalDebt / 1000000).toFixed(2)}M`} label="Jami qarz (so'm)" accent="#F59E0B" change="To'lanmagan" changeType="down" />
        <StatCard icon="⚠️" value={urgent} label="Muddati yaqin (7 kun)" accent="#F43F5E" />
        <StatCard icon="✅" value={allDebts.filter(d => d.status === "To'langan" || d.paid_amount > 0).length} label="Tugallangan (To'langan)" accent="#10B981" />
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
                      <button key={m} onClick={() => setPayMethod(m)} style={{ padding: '10px 4px', background: payMethod === m ? 'rgba(59,130,246,0.1)' : 'var(--s2)', border: payMethod === m ? '1px solid #3B82F6' : '1px solid var(--border)', borderRadius: 8, color: payMethod === m ? '#3B82F6' : 'var(--t2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>{m}</button>
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
                <div style={{ marginTop: 4 }}>mybazzar.uz</div>
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
