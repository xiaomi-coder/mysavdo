import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatCard, SectionHeader, Btn, Badge } from '../components/UI';

const CATEGORIES = [
    { name: 'Ijara', icon: '🏢', color: '#8B5CF6' },
    { name: 'Oylik Maosh', icon: '👥', color: '#10B981' },
    { name: 'Kommunal, Internet', icon: '⚡', color: '#F59E0B' },
    { name: 'Soliqlar', icon: '🏛️', color: '#EF4444' },
    { name: 'Kantselyariya, Xo\'jalik', icon: '🧹', color: '#6366F1' },
    { name: 'Transport, Logistika', icon: '🚚', color: '#3B82F6' },
    { name: 'Marketing', icon: '📣', color: '#EC4899' },
    { name: 'Boshqa', icon: '💸', color: '#94A3B8' },
];

const inputStyle = { width: '100%', padding: '11px 13px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' };

function Modal({ children, onClose }) {
    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 30px', width: 420, maxWidth: '92vw', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <style>{`@keyframes slideUp { 0% { transform: translateY(40px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }`}</style>
                {children}
            </div>
        </div>
    );
}

export default function Finance() {
    const { user, expenses, addExpense } = useAuth();
    const [showAdd, setShowAdd] = useState(false);
    const [toast, setToast] = useState(null);

    // Form State
    const [amount, setAmount] = useState('');
    const [cat, setCat] = useState('Kommunal, Internet');
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleAddReturn = () => {
        if (!amount || isNaN(amount) || amount <= 0) return;

        addExpense({
            id: Date.now(),
            date,
            cat,
            desc: desc || CATEGORIES.find(c => c.name === cat)?.name || 'Xarajat',
            amount: parseInt(amount),
            cashier: user?.name,
        });

        showToast(`✅ Xarajat saqlandi: ${parseInt(amount).toLocaleString()} so'm`);
        setShowAdd(false);
        setAmount(''); setDesc('');
    };

    const totalExp = expenses.reduce((a, b) => a + b.amount, 0);
    const catBreakdown = expenses.reduce((acc, exp) => {
        acc[exp.cat] = (acc[exp.cat] || 0) + exp.amount;
        return acc;
    }, {});

    const biggestCat = Object.keys(catBreakdown).length > 0 ? Object.keys(catBreakdown).reduce((a, b) => catBreakdown[a] > catBreakdown[b] ? a : b) : '-';

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 24, fontWeight: 800 }}>Moliya va Xarajatlar</div>
                    <div style={{ fontSize: 13, color: 'var(--t2)' }}>Kassa xarajatlari nazorati va ko'chirmalar</div>
                </div>
                <Btn variant="primary" onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10B981', borderColor: '#10B981' }}>
                    <span>💸</span> Yangi Xarajat
                </Btn>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                <StatCard icon="📉" value={totalExp.toLocaleString()} label="Jami Xarajatlar" accent="#EF4444" />
                <StatCard icon="📅" value={expenses.length} label="Ushbu oydagi tranzaksiyalar" accent="#3B82F6" />
                <StatCard icon="🔍" value={biggestCat} label="Eng ko'p xarajat yo'nalishi" accent="#F59E0B" />
                <StatCard icon="👤" value={user?.name || '-'} label="Mas'ul shaxs" accent="#A78BFA" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

                {/* Table */}
                <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
                    <SectionHeader title="Xarajatlar Tarixi">
                        <span style={{ fontSize: 12, color: 'var(--t3)' }}>Oxirgi 30 kun</span>
                    </SectionHeader>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Sana', 'Yo\'nalish', 'Izoh / Tafsilot', 'Kim tomonidan', 'Summa'].map(h => (
                                        <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: .8, padding: '0 12px 12px 0', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[...expenses].reverse().map(exp => {
                                    const catObj = CATEGORIES.find(c => c.name === exp.cat) || CATEGORIES[7];
                                    return (
                                        <tr key={exp.id} className="fast-transition" style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 12px 12px 0', fontSize: 12, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{exp.date}</td>
                                            <td style={{ padding: '12px 12px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: catObj.color + '15', color: catObj.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                                    <span>{catObj.icon}</span> {exp.cat}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 12px 12px 0', fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{exp.desc}</td>
                                            <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: 'var(--t2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{exp.cashier}</td>
                                            <td style={{ padding: '12px 12px 12px 0', fontSize: 14, fontWeight: 800, color: '#EF4444', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                -{exp.amount.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--t3)' }}>UZS</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {expenses.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)', fontSize: 13 }}>Hech qanday xarajat yo'q.</div>
                        )}
                    </div>
                </div>

                {/* Small Analytics Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="glass-card" style={{ borderRadius: 16, padding: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Tuzilma (Kategoriyalar)</div>
                        {Object.keys(catBreakdown).map(k => {
                            const catObj = CATEGORIES.find(c => c.name === k) || CATEGORIES[7];
                            const pct = ((catBreakdown[k] / totalExp) * 100).toFixed(0);
                            return (
                                <div key={k} style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 14 }}>{catObj.icon}</span> <span style={{ fontWeight: 600 }}>{k}</span></span>
                                        <span style={{ fontWeight: 800, color: 'var(--t1)' }}>{catBreakdown[k].toLocaleString()}</span>
                                    </div>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: catObj.color, borderRadius: 3 }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* Add Modal */}
            {showAdd && (
                <Modal onClose={() => setShowAdd(false)}>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>💸</span> Yangi Xarajat
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Summa (so'm) *</label>
                            <input type="number" autoFocus value={amount} onChange={e => setAmount(e.target.value)} placeholder="Misol: 50000" style={{ ...inputStyle, fontSize: 16, fontWeight: 700, padding: '12px 14px', background: 'rgba(0,0,0,0.2)' }} onFocus={e => e.target.style.borderColor = '#10B981'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Yo'nalish (Kategoriya) *</label>
                            <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Izoh yoki Tafsilot</label>
                            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ixtiyoriy yozuv..." style={inputStyle} onFocus={e => e.target.style.borderColor = '#10B981'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--t2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sana</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, colorscheme: 'dark' }} onFocus={e => e.target.style.borderColor = '#10B981'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                        <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '12px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 11, color: 'var(--t1)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>Bekor qilish</button>
                        <button onClick={handleAddReturn} disabled={!amount} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 800, cursor: !amount ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', opacity: !amount ? 0.6 : 1, boxShadow: !amount ? 'none' : '0 4px 16px rgba(16,185,129,0.3)' }}>💾 Saqlash</button>
                    </div>
                </Modal>
            )}

            {toast && (
                <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#10B981', color: '#fff', padding: '13px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 9999, boxShadow: '0 8px 24px rgba(16,185,129,0.4)', animation: 'slideUp .3s ease' }}>
                    {toast}
                </div>
            )}
        </div>
    );
}
