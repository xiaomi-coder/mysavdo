import React, { useState, useRef, useEffect } from 'react';
import { StatCard, Badge, SectionHeader, Btn } from '../components/UI';
import Barcode from 'react-barcode';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const PHONE_BRANDS = [
  { name: 'Samsung', icon: '📱' }, { name: 'iPhone', icon: '🍎' },
  { name: 'Xiaomi/Redmi', icon: '🔴' }, { name: 'Honor', icon: '💎' },
  { name: 'Infinix', icon: '♾️' }, { name: 'Tecno', icon: '🔵' },
  { name: 'ZTE', icon: '🟢' }, { name: 'Realme', icon: '🟡' },
  { name: 'OPPO', icon: '🟣' }, { name: 'Vivo', icon: '🔷' },
  { name: 'Aksesuar', icon: '🎧' }, { name: 'Boshqa', icon: '📦' },
];
const PHONE_MEMORIES = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
const PHONE_CONDITIONS = ['Yangi', 'B/U', 'Refurbished'];

export default function Inventory() {
  const { user } = useAuth();
  const isPhone = user?.storeType === 'phone';
  const [search, setSearch] = useState('');
  const [catFilter, setCat] = useState('Hammasi');
  const [statusFilter, setStatus] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ name: "Hammasi", icon: "📦" }]);
  const [showAdd, setShowAdd] = useState(false);
  const [showKirim, setShowKirim] = useState(null);
  const [kirimQty, setKirimQty] = useState('');
  const [kirimNote, setKirimNote] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user?.store_id) loadProducts(user.store_id);
  }, [user]);

  const loadProducts = async (storeId) => {
    const { data } = await supabase.from('products').select('*').eq('store_id', storeId);
    if (data) {
      setProducts(data.map(p => ({ ...p, emoji: p.image || (isPhone ? '📱' : '📦') })));
      if (isPhone) {
        const allCats = ['Hammasi', ...PHONE_BRANDS.map(b => b.name)];
        setCategories(allCats.map(c => ({ name: c, icon: (PHONE_BRANDS.find(b => b.name === c)?.icon || '📦') })));
      } else {
        const uniqueCats = ['Hammasi', ...new Set(data.map(p => p.category || p.cat).filter(Boolean))];
        setCategories(uniqueCats.map(c => ({ name: c, icon: '📦' })));
      }
    }
  };

  // New product form
  const emptyProd = isPhone
    ? { name: '', barcode: '', cat: 'Samsung', cost: '', price: '', stock: '1', minStock: '1', emoji: '📱', phoneModel: '', phoneMemory: '128GB', phoneColor: '', phoneImei1: '', phoneImei2: '', phoneSerial: '', phoneCondition: 'Yangi' }
    : { name: '', barcode: '', cat: '', cost: '', price: '', stock: '', minStock: '', emoji: '📦' };
  const [newProd, setNewProd] = useState(emptyProd);

  const generateBarcode = () => {
    const bc = '200' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
    setNewProd(prev => ({ ...prev, barcode: bc }));
  };
  const [newCat, setNewCat] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [printProd, setPrintProd] = useState(null);

  // Tabs: list, transfer, audit
  const [activeTab, setActiveTab] = useState('list');

  // Transfer State
  const [transferStore, setTransferStore] = useState('');
  const [transferItems, setTransferItems] = useState([]);
  const [searchTransfer, setSearchTransfer] = useState('');

  // Audit State
  const [auditCounts, setAuditCounts] = useState({});
  const [auditSearch, setAuditSearch] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const getStatus = (p) => {
    if (p.stock === 0) return { label: 'Tugagan!', type: 'danger' };
    if (p.stock < p.minStock * 0.3) return { label: 'Kritik!', type: 'danger' };
    if (p.stock < p.minStock) return { label: 'Kam', type: 'warning' };
    return { label: 'Normal', type: 'success' };
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchQ = (p.name || '').toLowerCase().includes(q) || (p.barcode || '').includes(search)
      || (p.phone_imei1 || '').includes(search) || (p.phone_imei2 || '').includes(search)
      || (p.phone_serial || '').toLowerCase().includes(q) || (p.phone_model || '').toLowerCase().includes(q);
    const matchCat = catFilter === 'Hammasi' || (p.category || p.cat) === catFilter;
    const st = getStatus(p);

    let matchSt = true;
    if (statusFilter === 'normal') matchSt = st.type === 'success';
    else if (statusFilter === 'low') matchSt = st.type === 'warning' || st.type === 'danger';
    else if (statusFilter === 'out') matchSt = p.stock === 0;

    return matchQ && matchCat && matchSt;
  });

  const handleKirim = async () => {
    if (!kirimQty || isNaN(kirimQty) || parseInt(kirimQty) <= 0) return;

    const newStock = showKirim.stock + parseInt(kirimQty);
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', showKirim.id);

    if (!error) {
      setProducts(prev => prev.map(p => p.id === showKirim.id ? { ...p, stock: newStock } : p));
      showToast(`✅ ${showKirim.name}: +${kirimQty} ta kirim qilindi`);
    } else {
      showToast(`❌ Xatolik: ${error.message}`, 'danger');
    }

    setShowKirim(null); setKirimQty(''); setKirimNote('');
  };

  const handleAddProduct = async () => {
    if (!newProd.name || !newProd.price || !newProd.cost) return;
    const p = {
      store_id: user.store_id,
      name: isPhone ? `${newProd.cat} ${newProd.phoneModel}`.trim() : newProd.name,
      barcode: newProd.barcode || '',
      category: newProd.cat || 'Boshqa',
      cost_price: parseInt(newProd.cost),
      price: parseInt(newProd.price),
      stock: parseInt(newProd.stock) || 0,
      image: newProd.emoji,
      ...(isPhone ? {
        phone_model: newProd.phoneModel,
        phone_memory: newProd.phoneMemory,
        phone_color: newProd.phoneColor,
        phone_imei1: newProd.phoneImei1,
        phone_imei2: newProd.phoneImei2,
        phone_serial: newProd.phoneSerial,
        phone_condition: newProd.phoneCondition,
      } : {})
    };

    const { data, error } = await supabase.from('products').insert(p).select().single();

    if (!error && data) {
      setProducts(prev => [{ ...data, emoji: data.image || (isPhone ? '📱' : '📦') }, ...prev]);
      showToast(`✅ "${p.name}" qo'shildi`);
      setShowAdd(false);
      setNewProd({ ...emptyProd });
    } else {
      showToast(`❌ Xatolik: ${error?.message}`, 'danger');
    }
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    setCategories(prev => [...prev, { name: newCat.trim(), icon: '📦' }]);
    setNewProd(prev => ({ ...prev, cat: newCat.trim() }));
    setNewCat('');
    setShowAddCat(false);
    showToast(`✅ "${newCat}" toifasi qo'shildi`);
  };

  const outCount = products.filter(p => p.stock === 0).length;
  const lowCount = products.filter(p => p.stock > 0 && p.stock < p.minStock).length;
  const normCount = products.filter(p => p.stock >= p.minStock).length;

  const EMOJIS = ['📦', '🥤', '🍵', '⚡', '🥔', '🍪', '🫧', '🍊', '🍫', '🍭', '🧋', '🍘', '🫙', '📱', '🎧', '💻', '🖥️', '⌨️'];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
        <button onClick={() => setActiveTab('list')} style={{ padding: '8px 16px', borderRadius: 8, background: activeTab === 'list' ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeTab === 'list' ? '#3B82F6' : 'var(--t2)', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>📦 Ombor</button>
        <button onClick={() => setActiveTab('transfer')} style={{ padding: '8px 16px', borderRadius: 8, background: activeTab === 'transfer' ? 'rgba(16,185,129,0.1)' : 'transparent', color: activeTab === 'transfer' ? '#10B981' : 'var(--t2)', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>🚚 Filiallarga Ko'chirish</button>
        <button onClick={() => setActiveTab('audit')} style={{ padding: '8px 16px', borderRadius: 8, background: activeTab === 'audit' ? 'rgba(245,158,11,0.1)' : 'transparent', color: activeTab === 'audit' ? '#F59E0B' : 'var(--t2)', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>📋 Inventarizatsiya (Taftish)</button>
      </div>

      {activeTab === 'list' && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <div onClick={() => setStatus('all')} style={{ cursor: 'pointer', filter: statusFilter === 'all' ? 'brightness(1.1) drop-shadow(0 0 10px rgba(59,130,246,0.3))' : 'none', transition: 'all .2s' }}><StatCard icon="📦" value={products.length} label="Jami mahsulotlar" accent="#3B82F6" /></div>
            <div onClick={() => setStatus('normal')} style={{ cursor: 'pointer', filter: statusFilter === 'normal' ? 'brightness(1.1) drop-shadow(0 0 10px rgba(16,185,129,0.3))' : 'none', transition: 'all .2s' }}><StatCard icon="✅" value={normCount} label="Normal qoldiq" accent="#10B981" /></div>
            <div onClick={() => setStatus('low')} style={{ cursor: 'pointer', filter: statusFilter === 'low' ? 'brightness(1.1) drop-shadow(0 0 10px rgba(245,158,11,0.3))' : 'none', transition: 'all .2s' }}><StatCard icon="⚠️" value={lowCount} label="Kam qoldiq" accent="#F59E0B" /></div>
            <div onClick={() => setStatus('out')} style={{ cursor: 'pointer', filter: statusFilter === 'out' ? 'brightness(1.1) drop-shadow(0 0 10px rgba(244,63,94,0.3))' : 'none', transition: 'all .2s' }}><StatCard icon="❌" value={outCount} label="Tugagan" accent="#F43F5E" /></div>
          </div>

          {/* Table card */}
          <div className="glass-card" style={{ borderRadius: 16, padding: 22 }}>
            <SectionHeader title="Ombor Holati">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--t2)' }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isPhone ? "IMEI, S/N, model qidirish..." : "Qidirish..."}
                    className="fast-transition"
                    style={{ padding: '8px 12px 8px 30px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', width: 180, backdropFilter: 'blur(4px)' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                </div>
                {/* Category filter */}
                <select value={catFilter} onChange={e => setCat(e.target.value)} className="fast-transition" style={{ padding: '8px 12px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, color: 'var(--t1)', fontSize: 12, fontFamily: 'Outfit,sans-serif', outline: 'none', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(17, 24, 39, 0.4)'}>
                  {categories.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
                {/* Status filter */}
                <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="fast-transition" style={{ padding: '8px 12px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, color: 'var(--t1)', fontSize: 12, fontFamily: 'Outfit,sans-serif', outline: 'none', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(17, 24, 39, 0.4)'}>
                  <option value="all">Barcha holat</option>
                  <option value="normal">Faqat normal</option>
                  <option value="low">Kam/Tugagan</option>
                  <option value="out">Faqat tugagan</option>
                </select>
                <Btn variant="subtle" size="sm">📥 Excel</Btn>
                <Btn variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Tovar Qo'shish</Btn>
              </div>
            </SectionHeader>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {(isPhone
                      ? ['📱 Model', '💾 Xotira', '🎨 Rang', 'IMEI-1', 'IMEI-2', 'S/N', 'Holat', 'Tan Narxi', 'Sotuv Narxi', 'Qoldiq', 'Amal']
                      : ['Barcode', 'Mahsulot', 'Kategoriya', 'Tan Narxi', 'Sotillish Narxi', 'Qoldiq', 'Min.Qoldiq', 'Holat', 'Amal']
                    ).map(h => (
                      <th key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: .8, padding: '0 10px 12px 0', textAlign: 'left', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const st = getStatus(p);
                    const pct = Math.min(100, Math.round((p.stock / (p.minStock * 2)) * 100));
                    const tdS = { padding: '11px 10px 11px 0', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' };
                    return (
                      <tr key={p.id} className="fast-transition" style={{ cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {isPhone ? (<>
                          <td style={{ ...tdS, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.emoji} {p.phone_model || p.name}</td>
                          <td style={{ ...tdS, color: '#22D3EE', fontWeight: 700 }}>{p.phone_memory || '-'}</td>
                          <td style={tdS}>{p.phone_color || '-'}</td>
                          <td style={{ ...tdS, fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--t2)' }}>{p.phone_imei1 || '-'}</td>
                          <td style={{ ...tdS, fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--t2)' }}>{p.phone_imei2 || '-'}</td>
                          <td style={{ ...tdS, fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--t2)' }}>{p.phone_serial || '-'}</td>
                          <td style={tdS}><Badge type={p.phone_condition === 'Yangi' ? 'success' : p.phone_condition === 'B/U' ? 'warning' : 'info'}>{p.phone_condition || '-'}</Badge></td>
                          <td style={{ ...tdS, color: 'var(--t2)', whiteSpace: 'nowrap' }}>{(p.cost_price || 0).toLocaleString()}</td>
                          <td style={{ ...tdS, fontSize: 13, fontWeight: 600, color: '#10B981', whiteSpace: 'nowrap' }}>{p.price.toLocaleString()}</td>
                        </>) : (<>
                          <td style={{ ...tdS, fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'var(--t2)' }}>{p.barcode}</td>
                          <td style={{ ...tdS, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{p.emoji} {p.name}</td>
                          <td style={{ ...tdS, color: 'var(--t2)' }}>{p.category || p.cat}</td>
                          <td style={{ ...tdS, color: 'var(--t2)', whiteSpace: 'nowrap' }}>{(p.cost_price || p.cost || 0).toLocaleString()}</td>
                          <td style={{ ...tdS, fontSize: 13, fontWeight: 600, color: '#10B981', whiteSpace: 'nowrap' }}>{p.price.toLocaleString()}</td>
                        </>)}
                        <td style={tdS}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 50, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: st.type === 'danger' ? '#F43F5E' : st.type === 'warning' ? '#F59E0B' : '#10B981', borderRadius: 2, boxShadow: `0 0 8px ${st.type === 'danger' ? '#F43F5E' : st.type === 'warning' ? '#F59E0B' : '#10B981'}88` }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: st.type === 'danger' ? '#F43F5E' : st.type === 'warning' ? '#F59E0B' : '#10B981', minWidth: 24 }}>{p.stock}</span>
                          </div>
                        </td>
                        {!isPhone && <td style={{ ...tdS, color: 'var(--t2)' }}>{p.minStock}</td>}
                        {!isPhone && <td style={tdS}><Badge type={st.type}>{st.label}</Badge></td>}
                        <td style={{ padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Btn variant="primary" size="sm" onClick={() => { setShowKirim(p); setKirimQty(''); }}>+ Kirim</Btn>
                            <Btn variant="subtle" size="sm" onClick={() => setPrintProd(p)}>🖨️</Btn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--t2)', fontSize: 13 }}>🔍 Hech narsa topilmadi</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* TRANSFER TAB PLACEHOLDER */}
      {activeTab === 'transfer' && (
        <div className="glass-card" style={{ borderRadius: 16, padding: 22, minHeight: 400, display: 'flex', gap: 24 }}>
          {/* Left: Select items */}
          <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: 24 }}>
            <SectionHeader title="Filiallarga Tovar Ko'chirish (Nakladnoy)" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <select value={transferStore} onChange={e => setTransferStore(e.target.value)} style={{ padding: '10px 14px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, color: 'var(--t1)', fontSize: 13, flex: 1, outline: 'none' }}>
                <option value="">Qabul qiluvchi filialni tanlang</option>
                <option value="Chilonzor Filial">Chilonzor Filial</option>
                <option value="Yunusobod Filial">Yunusobod Filial</option>
                <option value="Qo'yliq Filial">Qo'yliq Filial</option>
              </select>
            </div>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}>🔍</span>
              <input value={searchTransfer} onChange={e => setSearchTransfer(e.target.value)} placeholder="Tovar qidirish (shtrix kod yoki nom)..."
                style={{ width: '100%', padding: '10px 14px 10px 34px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, color: 'var(--t1)', fontSize: 13, outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
              {products.filter(p => searchTransfer && (p.name.toLowerCase().includes(searchTransfer.toLowerCase()) || p.barcode.includes(searchTransfer))).slice(0, 10).map(p => (
                <div key={p.id} onClick={() => {
                  if (!transferItems.find(t => t.id === p.id)) setTransferItems([...transferItems, { ...p, transferQty: 1 }]);
                }} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, cursor: 'pointer', border: '1px solid transparent' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.emoji} {p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--t2)' }}>Qoldiq: {p.stock} ta</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected items */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Ko'chirilayotgan tovarlar ({transferItems.length})</div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {transferItems.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 13, marginTop: 40 }}>Chap tomondan tovar tanlang</div>
              ) : transferItems.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--s1)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.emoji} {t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 4 }}>Qoldiq: {t.stock} ta</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="number" min="1" max={t.stock} value={t.transferQty} onChange={e => {
                      const val = Math.min(t.stock, Math.max(1, parseInt(e.target.value) || 1));
                      setTransferItems(prev => prev.map(item => item.id === t.id ? { ...item, transferQty: val } : item));
                    }} style={{ width: 60, padding: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, color: 'var(--t1)', textAlign: 'center', outline: 'none' }} />
                    <button onClick={() => setTransferItems(prev => prev.filter(item => item.id !== t.id))} style={{ background: 'transparent', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: 16, padding: 4 }}>×</button>
                  </div>
                </div>
              ))}
            </div>

            <Btn variant="primary" disabled={!transferStore || transferItems.length === 0} onClick={() => {
              // Simulate transfer
              setProducts(prev => prev.map(p => {
                const trItem = transferItems.find(t => t.id === p.id);
                return trItem ? { ...p, stock: p.stock - trItem.transferQty } : p;
              }));
              showToast(`✅ ${transferStore}ga ${transferItems.length} xil tovar ko'chirildi!`);
              setTransferItems([]);
              setTransferStore('');
              setSearchTransfer('');
            }}>🚚 Ko'chirishni Tasdiqlash</Btn>
          </div>
        </div>
      )}

      {/* AUDIT TAB PLACEHOLDER */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ borderRadius: 16, padding: 22, minHeight: 400 }}>
          <SectionHeader title="Inventarizatsiya (Taftish rejimi)">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--t2)' }}>🔍</span>
              <input value={auditSearch} onChange={e => setAuditSearch(e.target.value)} placeholder="Tovar qidirish..." style={{ padding: '8px 12px 8px 30px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, color: 'var(--t1)', fontSize: 13, outline: 'none', width: 220 }} />
            </div>
            <Btn variant="primary" size="sm" onClick={() => {
              // Apply audit changes
              let changedCount = 0;
              setProducts(prev => prev.map(p => {
                if (auditCounts[p.id] !== undefined && auditCounts[p.id] !== '' && auditCounts[p.id] !== p.stock) {
                  changedCount++;
                  return { ...p, stock: auditCounts[p.id] };
                }
                return p;
              }));
              showToast(`✅ Taftish saqlandi: ${changedCount} ta mahsulot yangilandi`);
              setAuditCounts({});
            }}>💾 Saqlash</Btn>
          </SectionHeader>

          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', padding: '0 10px 12px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Mahsulot</th>
                  <th style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', padding: '0 10px 12px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Tizimda (Kutilgan)</th>
                  <th style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', padding: '0 10px 12px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Haqiqiy (Sanalgan)</th>
                  <th style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', padding: '0 10px 12px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Farqi (Kamomad/Ortiqcha)</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(p => !auditSearch || p.name.toLowerCase().includes(auditSearch.toLowerCase()) || p.barcode.includes(auditSearch)).map(p => {
                  const actual = auditCounts[p.id] !== undefined ? auditCounts[p.id] : '';
                  const diff = actual === '' ? 0 : parseInt(actual) - p.stock;
                  return (
                    <tr key={p.id} style={{ transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 10px 12px 0', fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{p.emoji} {p.name} <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 8 }}>{p.barcode}</span></td>
                      <td style={{ padding: '12px 10px 12px 0', fontSize: 14, fontWeight: 700, color: '#3B82F6', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{p.stock} ta</td>
                      <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <input type="number" placeholder={p.stock} value={actual} onChange={e => {
                          const val = e.target.value === '' ? '' : parseInt(e.target.value);
                          setAuditCounts(prev => ({ ...prev, [p.id]: val }));
                        }} style={{ width: 100, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: Object.keys(auditCounts).includes(p.id.toString()) ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', fontSize: 14, outline: 'none', transition: 'all 0.2s' }} />
                      </td>
                      <td style={{ padding: '12px 10px 12px 0', fontSize: 13, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {actual === '' ? <span style={{ color: 'var(--t3)' }}>-</span> : (
                          diff === 0 ? <span style={{ color: '#10B981' }}>Teng ✅</span> :
                            diff < 0 ? <span style={{ color: '#F43F5E' }}>Kamomad: {Math.abs(diff)} ta ({(Math.abs(diff) * p.cost).toLocaleString()} so'm)</span> :
                              <span style={{ color: '#F59E0B' }}>Ortiqcha: {diff} ta</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KIRIM MODAL */}
      {showKirim && (
        <Modal onClose={() => setShowKirim(null)}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>📥 Tovar Kirim</div>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 24 }}>{showKirim.emoji} {showKirim.name} · Hozir: {showKirim.stock} ta</div>
          <FormField label="Kirim miqdori (ta)">
            <input type="number" value={kirimQty} onChange={e => setKirimQty(e.target.value)} placeholder="Masalan: 100" autoFocus
              style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[10, 25, 50, 100].map(n => (
                <button key={n} className="fast-transition" onClick={() => setKirimQty(n)} style={{ flex: 1, padding: '6px 4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 7, color: 'var(--t2)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>+{n}</button>
              ))}
            </div>
          </FormField>
          <FormField label="Izoh (ixtiyoriy)">
            <input type="text" value={kirimNote} onChange={e => setKirimNote(e.target.value)} placeholder="Yetkazib beruvchi: Tashkent Market"
              style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </FormField>
          {kirimQty && (
            <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#10B981' }}>
              ✅ Kirimdan keyin: {showKirim.stock} + {kirimQty} = <strong>{showKirim.stock + parseInt(kirimQty || 0)} ta</strong>
            </div>
          )}
          <ModalActions onCancel={() => setShowKirim(null)} onConfirm={handleKirim} confirmLabel="✅ Kirimni Tasdiqlash" confirmVariant="green" disabled={!kirimQty} />
        </Modal>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} wide>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>{isPhone ? '📱 Yangi Telefon/Aksesuar Qo\'shish' : '📦 Yangi Tovar Qo\'shish'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {isPhone ? (<>
              {/* PHONE MODE FORM */}
              <FormField label="Brend (Kategoriya) *">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PHONE_BRANDS.map(b => (
                    <button key={b.name} onClick={() => setNewProd({ ...newProd, cat: b.name, emoji: b.icon })}
                      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${newProd.cat === b.name ? '#A78BFA' : 'rgba(255,255,255,0.05)'}`, background: newProd.cat === b.name ? 'rgba(167,139,250,0.12)' : 'rgba(17,24,39,0.4)', color: newProd.cat === b.name ? '#A78BFA' : 'var(--t2)', fontFamily: 'Outfit,sans-serif', transition: 'all .15s' }}>
                      {b.icon} {b.name}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Model nomi *">
                <input value={newProd.phoneModel} onChange={e => setNewProd({ ...newProd, phoneModel: e.target.value, name: `${newProd.cat} ${e.target.value}` })} placeholder={newProd.cat === 'Aksesuar' || newProd.cat === 'Boshqa' ? "Aksesuar nomi (Chexol, Zaryadka...)" : "Galaxy S24 Ultra"} style={inputStyle} onFocus={e => e.target.style.borderColor = '#A78BFA'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </FormField>

              {newProd.cat !== 'Aksesuar' && newProd.cat !== 'Boshqa' && (<>
                <FormField label="Xotira hajmi">
                  <div style={{ display: 'flex', gap: 6 }}>
                    {PHONE_MEMORIES.map(m => (
                      <button key={m} onClick={() => setNewProd({ ...newProd, phoneMemory: m })}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1px solid ${newProd.phoneMemory === m ? '#22D3EE' : 'rgba(255,255,255,0.05)'}`, background: newProd.phoneMemory === m ? 'rgba(34,211,238,0.12)' : 'rgba(17,24,39,0.4)', color: newProd.phoneMemory === m ? '#22D3EE' : 'var(--t2)', fontFamily: 'Outfit,sans-serif' }}>
                        {m}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Rang">
                  <input value={newProd.phoneColor} onChange={e => setNewProd({ ...newProd, phoneColor: e.target.value })} placeholder="Qora, Oq, Ko'k..." style={inputStyle} onFocus={e => e.target.style.borderColor = '#A78BFA'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </FormField>

                {/* SMART SCANNER */}
                <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(34,211,238,0.06))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '16px 18px', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: '#10B981' }}>📷 Smart Scanner — Skanerlang!</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 10 }}>Telefon qutisidagi barcode ni skanerlang. 15 raqam = IMEI, boshqasi = S/N. Avval IMEI1, keyin IMEI2, keyin S/N avtomatik to'ladi.</div>
                  <input
                    id="phone-scanner-input"
                    autoFocus
                    placeholder="📷 Shu yerga skanerlang..."
                    style={{ ...inputStyle, background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(16,185,129,0.3)', fontSize: 15, fontFamily: 'JetBrains Mono,monospace', letterSpacing: 1.5, textAlign: 'center', padding: '14px' }}
                    onFocus={e => e.target.style.borderColor = '#10B981'}
                    onBlur={e => e.target.style.borderColor = 'rgba(16,185,129,0.3)'}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const val = e.target.value.trim();
                        const digits = val.replace(/\D/g, '');
                        if (digits.length === 15) {
                          if (!newProd.phoneImei1) {
                            setNewProd(prev => ({ ...prev, phoneImei1: digits }));
                            showToast('✅ IMEI 1 skanerlandi!');
                          } else if (!newProd.phoneImei2) {
                            setNewProd(prev => ({ ...prev, phoneImei2: digits }));
                            showToast('✅ IMEI 2 skanerlandi!');
                          } else {
                            showToast('⚠️ Barcha IMEI maydonlari to\'ldirilgan', 'danger');
                          }
                        } else {
                          setNewProd(prev => ({ ...prev, phoneSerial: val }));
                          showToast('✅ S/N skanerlandi!');
                        }
                        e.target.value = '';
                        setTimeout(() => e.target.focus(), 100);
                      }
                    }}
                  />
                  <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 11 }}>
                    <span style={{ color: newProd.phoneImei1 ? '#10B981' : 'var(--t3)' }}>{newProd.phoneImei1 ? '✅' : '⬜'} IMEI1: {newProd.phoneImei1 || '—'}</span>
                    <span style={{ color: newProd.phoneImei2 ? '#10B981' : 'var(--t3)' }}>{newProd.phoneImei2 ? '✅' : '⬜'} IMEI2: {newProd.phoneImei2 || '—'}</span>
                    <span style={{ color: newProd.phoneSerial ? '#10B981' : 'var(--t3)' }}>{newProd.phoneSerial ? '✅' : '⬜'} S/N: {newProd.phoneSerial || '—'}</span>
                    {(newProd.phoneImei1 || newProd.phoneImei2 || newProd.phoneSerial) && (
                      <button onClick={() => setNewProd(prev => ({ ...prev, phoneImei1: '', phoneImei2: '', phoneSerial: '' }))} style={{ background: 'none', border: 'none', color: '#F43F5E', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Outfit,sans-serif' }}>🔄 Tozalash</button>
                    )}
                  </div>
                </div>

                <FormField label="IMEI 1">
                  <input value={newProd.phoneImei1} onChange={e => setNewProd({ ...newProd, phoneImei1: e.target.value.replace(/\D/g, '').slice(0, 15) })} placeholder="Skaner yoki qo'lda" maxLength={15} style={{ ...inputStyle, fontFamily: 'JetBrains Mono,monospace', letterSpacing: 1.5, background: newProd.phoneImei1 ? 'rgba(16,185,129,0.08)' : undefined, borderColor: newProd.phoneImei1 ? 'rgba(16,185,129,0.3)' : undefined }} onFocus={e => e.target.style.borderColor = '#A78BFA'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </FormField>
                <FormField label="IMEI 2 (ixtiyoriy)">
                  <input value={newProd.phoneImei2} onChange={e => setNewProd({ ...newProd, phoneImei2: e.target.value.replace(/\D/g, '').slice(0, 15) })} placeholder="Skaner yoki qo'lda" maxLength={15} style={{ ...inputStyle, fontFamily: 'JetBrains Mono,monospace', letterSpacing: 1.5, background: newProd.phoneImei2 ? 'rgba(16,185,129,0.08)' : undefined, borderColor: newProd.phoneImei2 ? 'rgba(16,185,129,0.3)' : undefined }} onFocus={e => e.target.style.borderColor = '#A78BFA'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </FormField>
                <FormField label="Seriya raqami (S/N)">
                  <input value={newProd.phoneSerial} onChange={e => setNewProd({ ...newProd, phoneSerial: e.target.value })} placeholder="Skaner yoki qo'lda" style={{ ...inputStyle, fontFamily: 'JetBrains Mono,monospace', background: newProd.phoneSerial ? 'rgba(16,185,129,0.08)' : undefined, borderColor: newProd.phoneSerial ? 'rgba(16,185,129,0.3)' : undefined }} onFocus={e => e.target.style.borderColor = '#A78BFA'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </FormField>
                <FormField label="Holati">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {PHONE_CONDITIONS.map(c => (
                      <button key={c} onClick={() => setNewProd({ ...newProd, phoneCondition: c })}
                        style={{ flex: 1, padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1px solid ${newProd.phoneCondition === c ? (c === 'Yangi' ? '#10B981' : c === 'B/U' ? '#F59E0B' : '#3B82F6') : 'rgba(255,255,255,0.05)'}`, background: newProd.phoneCondition === c ? (c === 'Yangi' ? 'rgba(16,185,129,0.12)' : c === 'B/U' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)') : 'rgba(17,24,39,0.4)', color: newProd.phoneCondition === c ? (c === 'Yangi' ? '#10B981' : c === 'B/U' ? '#F59E0B' : '#3B82F6') : 'var(--t2)', fontFamily: 'Outfit,sans-serif', textAlign: 'center' }}>
                        {c === 'Yangi' ? '✨' : c === 'B/U' ? '♻️' : '🔧'} {c}
                      </button>
                    ))}
                  </div>
                </FormField>
              </>)}

              {/* Aksesuar/Boshqa uchun qoldiq maydon */}
              {(newProd.cat === 'Aksesuar' || newProd.cat === 'Boshqa') && (
                <FormField label="Boshlang'ich qoldiq">
                  <input type="number" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} placeholder="1" style={inputStyle} onFocus={e => e.target.style.borderColor = '#A78BFA'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </FormField>
              )}

              <FormField label="Tan narxi (so'm) *">
                <input type="number" value={newProd.cost} onChange={e => setNewProd({ ...newProd, cost: e.target.value })} placeholder="2500000" style={inputStyle} onFocus={e => e.target.style.borderColor = '#A78BFA'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </FormField>
              <FormField label="Sotuv narxi (so'm) *">
                <input type="number" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} placeholder="3000000" style={inputStyle} onFocus={e => e.target.style.borderColor = '#A78BFA'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </FormField>
            </>) : (<>
              {/* GENERAL MODE FORM (original) */}
              <FormField label="Mahsulot nomi *">
                <input value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} placeholder="Coca Cola 0.5L" style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </FormField>
              <FormField label="Barcode">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={newProd.barcode} onChange={e => setNewProd({ ...newProd, barcode: e.target.value })} placeholder="8690637" style={{ ...inputStyle, flex: 1 }} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  <Btn variant="subtle" onClick={generateBarcode}>🎲 Random</Btn>
                </div>
              </FormField>
              <FormField label="Kategoriya">
                {showAddCat ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Yangi kategoriya" style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} autoFocus />
                    <Btn variant="primary" onClick={handleAddCategory}>+</Btn>
                    <Btn variant="subtle" onClick={() => setShowAddCat(false)}>✕</Btn>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={newProd.cat} onChange={e => setNewProd({ ...newProd, cat: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {categories.filter(c => c.name !== 'Hammasi').map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                    </select>
                    <Btn variant="subtle" onClick={() => setShowAddCat(true)}>+ Yangi</Btn>
                  </div>
                )}
              </FormField>
              <FormField label="Emoji">
                <select value={newProd.emoji} onChange={e => setNewProd({ ...newProd, emoji: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </FormField>
              <FormField label="Tan narxi (so'm) *">
                <input type="number" value={newProd.cost} onChange={e => setNewProd({ ...newProd, cost: e.target.value })} placeholder="6000" style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </FormField>
              <FormField label="Sotuv narxi (so'm) *">
                <input type="number" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} placeholder="8000" style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </FormField>
              <FormField label="Boshlang'ich qoldiq">
                <input type="number" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} placeholder="0" style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </FormField>
              <FormField label="Minimal qoldiq (ogohlantirish)">
                <input type="number" value={newProd.minStock} onChange={e => setNewProd({ ...newProd, minStock: e.target.value })} placeholder="50" style={inputStyle} onFocus={e => e.target.style.borderColor = '#3B82F6'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </FormField>
            </>)}
          </div>
          <div style={{ marginTop: 8 }}>
            <ModalActions onCancel={() => setShowAdd(false)} onConfirm={handleAddProduct} confirmLabel={isPhone ? "📱 Telefon Qo'shish" : "✅ Tovar Qo'shish"} disabled={isPhone ? (!newProd.phoneModel || !newProd.price || !newProd.cost) : (!newProd.name || !newProd.price || !newProd.cost)} />
          </div>
        </Modal>
      )}

      {/* BARCODE PRINT MODAL */}
      {printProd && (
        <Modal onClose={() => setPrintProd(null)}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>🖨️ Barkod Chop Etish</div>
          <div style={{ background: '#fff', padding: '24px 16px', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#000', marginBottom: 10, textAlign: 'center' }}>{printProd.name}</div>
            <Barcode value={printProd.barcode || "0000000000"} width={2} height={60} fontSize={14} background="#ffffff" lineColor="#000000" margin={0} />
            <div style={{ fontSize: 14, fontWeight: 800, color: '#000', marginTop: 8 }}>{printProd.price.toLocaleString()} so'm</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--t2)', textAlign: 'center', marginBottom: 20, lineHeight: 1.5 }}>
            Printeringiz (masalan xprinter) 40x30mm stiker uchun sozlanganligiga ishonch hosil qiling.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="fast-transition" onClick={() => setPrintProd(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>Yopish</button>
            <button onClick={() => {
              const printWin = window.open('', '_blank');
              printWin.document.write(`
                <html>
                  <head>
                    <title>Print Barcode</title>
                    <style>
                      body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #fff; }
                      .label { width: 40mm; height: 30mm; border: 1px dashed #ccc; padding: 2mm; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                      .name { font-size: 10px; font-weight: bold; margin-bottom: 2px; line-height: 1.1; max-height: 22px; overflow: hidden; }
                      .price { font-size: 12px; font-weight: bold; margin-top: 2px; }
                      @media print { body { justify-content: flex-start; } .label { border: none; } }
                    </style>
                  </head>
                  <body>
                    <div class="label">
                      <div class="name">${printProd.name}</div>
                      <img src="https://barcode.tec-it.com/barcode.ashx?data=${printProd.barcode || '000000000'}&code=Code128&translate-esc=on" style="height: 12mm; width: auto;" />
                      <div class="price">${printProd.price.toLocaleString()} so'm</div>
                    </div>
                    <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                  </body>
                </html>
              `);
              printWin.document.close();
            }} className="btn-primary" style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', boxShadow: '0 4px 16px rgba(59,130,246,0.28)' }}>🖨️ Chop Etish (Print)</button>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: toast.type === 'success' ? '#10B981' : '#F43F5E', color: '#fff', padding: '14px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', animation: 'slideUp .3s ease' }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── Shared mini components ─────────────────────────────────────────
function Modal({ children, onClose, wide }) {
  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 30px', width: wide ? 500 : 380, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: .8 }}>{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, confirmLabel = 'Tasdiqlash', confirmVariant = 'primary', disabled }) {
  const variants = {
    primary: { background: 'linear-gradient(135deg,#3B82F6,#2563EB)', boxShadow: '0 4px 16px rgba(59,130,246,0.28)' },
    green: { background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.28)' },
  };
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
      <button className="fast-transition" onClick={onCancel} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>Bekor</button>
      <button className="btn-primary" onClick={onConfirm} disabled={disabled} style={{ flex: 2, padding: '12px', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif', opacity: disabled ? .45 : 1, ...variants[confirmVariant] }}>{confirmLabel}</button>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '11px 13px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)' };
