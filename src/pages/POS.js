import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Btn, Badge, EmptyState } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

export default function POS() {
  const { user, settings, addPendingTxn } = useAuth();
  const isPhone = user?.storeType === 'phone';
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Hammasi');
  const [cart, setCart] = useState({});
  const [payMethod, setMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [dueDays, setDueDays] = useState('30');
  const [discount, setDiscount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [receiptNo, setReceiptNo] = useState(1);
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(location.state?.selectedCustomer || null);
  const [showCustModal, setShowCustModal] = useState(false);

  useEffect(() => {
    if (user?.store_id) {
      loadProducts(user.store_id);
      loadReceiptCount(user.store_id);
      loadCustomers(user.store_id);
    }
  }, [user]);

  const loadCustomers = async (storeId) => {
    const { data } = await supabase.from('customers').select('*').eq('store_id', storeId);
    if (data) setCustomers(data);
  };

  const loadProducts = async (storeId) => {
    const { data } = await supabase.from('products').select('*').eq('store_id', storeId);
    if (data) setProducts(data.map(p => ({ ...p, emoji: p.image || '📦' })));
  };

  const loadReceiptCount = async (storeId) => {
    const { count } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('store_id', storeId);
    setReceiptNo((count || 0) + 1);
  };

  const filtered = products.filter(p => {
    const pCat = p.category || p.cat;
    const matchCat = cat === 'Hammasi' || pCat === cat;
    const q = search.toLowerCase();
    const matchQ = p.name.toLowerCase().includes(q) || (p.barcode || '').includes(search)
      || (p.phone_imei1 || '').includes(search) || (p.phone_imei2 || '').includes(search)
      || (p.phone_serial || '').toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const dynamicCats = ['Hammasi', ...new Set(products.map(p => p.category || p.cat).filter(Boolean))];

  const addToCart = (p) => {
    if (p.stock === 0) return;
    setCart(prev => {
      const cur = prev[p.id];
      if (cur && cur.qty >= p.stock) return prev;
      return { ...prev, [p.id]: { ...p, qty: (cur?.qty || 0) + 1 } };
    });
  };

  const changeQty = (id, delta) => {
    setCart(prev => {
      const cur = prev[id];
      if (!cur) return prev;
      const newQty = cur.qty + delta;
      if (newQty <= 0) { const n = { ...prev }; delete n[id]; return n; }
      if (newQty > cur.stock) return prev;
      return { ...prev, [id]: { ...cur, qty: newQty } };
    });
  };

  const changeItemDiscount = (id, val) => {
    setCart(prev => {
      const cur = prev[id];
      if (!cur) return prev;
      return { ...prev, [id]: { ...cur, itemDiscount: val } };
    });
  };

  const clearCart = () => { setCart({}); setDiscount(0); };

  const cartItems = Object.values(cart);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const itemsDiscountSum = cartItems.reduce((s, i) => s + (Number(i.itemDiscount) || 0) * i.qty, 0);
  const afterItemsDiscount = subtotal - itemsDiscountSum;
  const globalDiscountAmt = Math.round(afterItemsDiscount * discount / 100);
  const discountAmt = itemsDiscountSum + globalDiscountAmt;
  const total = subtotal - discountAmt;

  const PAY_METHODS = user?.role === 'dealer'
    ? [{ id: 'nasiya', label: '💸 Nasiya (Qarz)' }] // Diler faqat nasiya orqali oladi (hisobdan yechiladi)
    : [
      { id: 'cash', label: '💵 Naqd' },
      { id: 'card', label: '💳 Plastik' },
      { id: 'transfer', label: '📱 Transfer' },
      { id: 'nasiya', label: '💸 Nasiya' }
    ];

  const checkout = async () => {
    if (!settings.isOnline && settings.offline) {
      addPendingTxn({ id: Date.now(), items: cartItems, total, method: payMethod, time: new Date().toISOString() });
    } else {
      // Create transaction in Supabase
      const { error } = await supabase.from('transactions').insert({
        store_id: user.store_id,
        customer_id: selectedCustomer?.id || null,
        receipt_no: `#${receiptNo}`,
        cashier: user.name,
        items: cartItems,
        total: total,
        discount: discountAmt,
        payment_method: payMethod,
        status: 'completed'
      });
      if (error) {
        console.error("Checkout db error:", error);
        alert("Sotuvni saqlashda baza xatosi yuz berdi! Xato: " + error.message);
        return;
      }

      // Enforce selecting a customer if Nasiya is chosen. 
      // We will actually do UI validation down below, but keep this safety check here.
      if (payMethod === 'nasiya') {
        if (!selectedCustomer) {
           alert("Nasiya qarz yozish uchun Mijoz tanlash shart!");
           return;
        }

        const initialPay = Number(paidAmount) || 0;
        if (initialPay > total) {
          alert("Boshlang'ich to'lov jami summadan katta bo'lishi mumkin emas!");
          return;
        }

        const dDate = new Date();
        dDate.setDate(dDate.getDate() + parseInt(dueDays || 30));

        const debtData = {
          store_id: user.store_id,
          customer_id: selectedCustomer.id,
          client: selectedCustomer.name,
          phone: selectedCustomer.phone || '',
          amount: total,
          paid_amount: initialPay,
          due_date: dDate.toISOString(),
          status: initialPay >= total ? 'To\'langan' : 'To\'lanmagan'
        };
        await supabase.from('debts').insert(debtData);
      }

      if (selectedCustomer) {
        // Increment purchases count & amount for the selected customer regardless of payment method
        await supabase.rpc('increment_customer_spent', { cid: selectedCustomer.id, amnt: total });
      }

      // Reduce stock locally and in DB
      cartItems.forEach(async (item) => {
        await supabase.from('products').update({ stock: item.stock - item.qty }).eq('id', item.id);
      });
      loadProducts(user.store_id);
    }

    // Generate and open Receipt
    const printWin = window.open('', '_blank');
    const paymentLabel = PAY_METHODS.find(m => m.id === payMethod)?.label.substring(2) || 'Naqd';
    const receiptHtml = `
      <html>
        <head>
          <title>Chek #${receiptNo}</title>
          <style>
            body { font-family: monospace; width: 58mm; margin: 0 auto; color: #000; font-size: 12px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
            @media print { body { width: 100%; margin: 0; } }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px; margin-bottom: 4px;">MyBazzar</div>
          <div class="center">"${user?.storeName || 'Do\'kon'}"</div>
          <div class="center" style="font-size: 10px; margin-bottom: 6px;">Manzil kiritilmagan</div>
          <div class="line"></div>
          <div>Sana: ${new Date().toLocaleString('uz-UZ')}</div>
          <div>Chek RAQAMI: #${receiptNo}</div>
          <div>Kassir: ${user?.name || 'Kassir'}</div>
          <div class="line"></div>
          <div class="row bold"><span>Mahsulot</span><span>Summa</span></div>
          <div class="line"></div>
          ${cartItems.map(item => {
            const itemDiscount = Number(item.itemDiscount) || 0;
            const netPrice = item.price - itemDiscount;
            return `
            <div>${isPhone ? (item.phone_model || item.name) : item.name}${isPhone && item.phone_memory ? ` (${item.phone_memory})` : ''}</div>
            <div class="row">
              <span style="padding-left: 8px;">${item.qty} x ${netPrice.toLocaleString()}${itemDiscount > 0 ? ` (Asl: ${item.price.toLocaleString()})` : ''}</span>
              <span>${(netPrice * item.qty).toLocaleString()}</span>
            </div>
            ${isPhone && item.phone_imei1 ? `<div style="font-size:9px;color:#888;padding-left:8px;">IMEI1: ${item.phone_imei1}${item.phone_imei2 ? ` | IMEI2: ${item.phone_imei2}` : ''}${item.phone_serial ? ` | S/N: ${item.phone_serial}` : ''}</div>` : ''}
            `;
          }).join('')}
          <div class="line"></div>
          <div class="row"><span>Jami:</span><span>${subtotal.toLocaleString()} so'm</span></div>
          ${discountAmt > 0 ? `<div class="row"><span>Chegirma:</span><span>-${discountAmt.toLocaleString()} so'm</span></div>` : ''}
          <div class="line"></div>
          <div class="row bold" style="font-size: 14px;"><span>TOLASH:</span><span>${total.toLocaleString()} so'm</span></div>
          <div class="row" style="margin-top: 4px;"><span>To'lov turi:</span><span>${paymentLabel.trim()}</span></div>
          <div class="line"></div>
          <div class="center" style="margin-top: 10px;">Xaridingiz uchun rahmat!</div>
          <div class="center" style="margin-top: 2px;">*** mybazzar.uz ***</div>
          <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body>
      </html>
    `;

    if (printWin) {
      printWin.document.write(receiptHtml);
      printWin.document.close();
    } else {
      console.warn("Pop-up blocker prevented receipt printing.");
      // Optional: alert asking user to allow popups
      alert("Chekni chop etish uchun brauzeringizda pop-uplarga (ochiluvchi oynalarga) ruxsat bering!");
    }

    setSuccess(true);
    setReceiptNo(n => n + 1);
    setPaidAmount('');
    setTimeout(() => { setSuccess(false); clearCart(); }, 2600);
  };
  const catBtnStyle = {
    padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
    fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'all .15s',
    border: '1px solid var(--border)', background: 'var(--s1)', color: 'var(--t2)',
    whiteSpace: 'nowrap'
  };
  const catBtnActive = {
    border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.12)', color: '#3B82F6'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, padding: 20, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ── LEFT ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>

        {/* Search + scan */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--t2)' }}>🔍</span>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && search.trim()) {
                  const matched = products.find(p => p.barcode === search.trim() || p.barcode.includes(search.trim()));
                  if (matched) {
                    addToCart(matched);
                    setSearch('');
                  }
                }
              }}
              placeholder={isPhone ? "IMEI, S/N yoki model qidiring..." : "Mahsulot nomi yoki barcode..."}
              style={{
                width: '100%', padding: '12px 14px 12px 40px',
                background: 'var(--s1)', border: '1px solid var(--border)',
                borderRadius: 12, color: 'var(--t1)', fontSize: 14,
                fontFamily: 'Outfit,sans-serif', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <Btn variant="subtle">📷 Skaner</Btn>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {dynamicCats.map(c => (
            <button key={c} onClick={() => setCat(c)} className="fast-transition" style={{ ...catBtnStyle, ...(cat === c ? catBtnActive : {}) }}>
              {c}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))',
          gap: 10, overflowY: 'auto', paddingBottom: 8,
        }}>
          {filtered.map(p => {
            const inCart = cart[p.id]?.qty || 0;
            return (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="glass-card"
                style={{
                  border: `1px solid ${inCart > 0 ? 'rgba(59,130,246,0.6)' : 'rgba(255, 255, 255, 0.05)'}`,
                  borderRadius: 14, padding: 14, cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                  opacity: p.stock === 0 ? 0.4 : 1,
                  position: 'relative', overflow: 'hidden',
                  transform: inCart > 0 ? 'scale(1.02) translateY(-2px)' : 'scale(1)',
                  boxShadow: inCart > 0 ? '0 8px 32px -4px rgba(59,130,246,0.3)' : '',
                }}
              >
                {/* Low stock badge */}
                {p.stock > 0 && p.stock < 10 && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#F43F5E', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20 }}>
                    Kam!
                  </div>
                )}
                {/* Cart count */}
                {inCart > 0 && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: '#3B82F6', color: '#fff', fontSize: 10, fontWeight: 800, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(59,130,246,0.5)' }}>
                    {inCart}
                  </div>
                )}
                <div style={{ fontSize: isPhone ? 22 : 30, marginBottom: isPhone ? 4 : 8, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>{p.emoji || (isPhone ? '📱' : '📦')}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 }}>{isPhone ? (p.phone_model || p.name) : p.name}</div>
                {isPhone && p.phone_memory && <div style={{ fontSize: 10, color: '#22D3EE', fontWeight: 700, marginBottom: 2 }}>💾 {p.phone_memory} {p.phone_color ? `· ${p.phone_color}` : ''}</div>}
                {isPhone && p.phone_imei1 && <div style={{ fontSize: 8, color: 'var(--t3)', fontFamily: 'JetBrains Mono,monospace', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>IMEI: {p.phone_imei1}</div>}
                <div style={{ fontSize: 14, fontWeight: 800, color: '#22D3EE' }}>{p.price.toLocaleString()} so'm</div>
                <div style={{ fontSize: 11, color: p.stock === 0 ? '#F43F5E' : p.stock < 10 ? '#F59E0B' : 'var(--t2)', marginTop: 2 }}>
                  {p.stock === 0 ? '❌ Tugagan' : `${p.stock} ta qoldi`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CART ── */}
      <div style={{
        background: 'var(--s1)', border: '1px solid var(--border)',
        borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Cart header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            🧾 Savat <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 400 }}>({itemCount} ta)</span>
          </div>
          {cartItems.length > 0 && (
            <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#F43F5E', fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}>
              Tozalash
            </button>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {cartItems.length === 0
            ? <EmptyState icon="🛒" text="Mahsulot qo'shing" />
            : cartItems.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 8px', borderRadius: 10,
                borderBottom: '1px solid rgba(30,45,61,0.5)',
                animation: 'slideIn .2s ease',
              }}>
                <span style={{ fontSize: 20 }}>{item.emoji || (isPhone ? '📱' : '📦')}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isPhone ? (item.phone_model || item.name) : item.name}</div>
                  {isPhone && item.phone_memory && <div style={{ fontSize: 9, color: '#22D3EE' }}>{item.phone_memory} {item.phone_color ? `· ${item.phone_color}` : ''}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                     <div style={{ fontSize: 11, color: 'var(--t2)', textDecoration: item.itemDiscount ? 'line-through' : 'none' }}>
                       {(item.price * item.qty).toLocaleString()} so'm
                     </div>
                     {Number(item.itemDiscount) > 0 && (
                       <div style={{ fontSize: 11, color: '#10B981', fontWeight: 800 }}>
                         {((item.price - Number(item.itemDiscount)) * item.qty).toLocaleString()} so'm
                       </div>
                     )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <input 
                      type="number" 
                      value={item.itemDiscount || ''} 
                      onChange={e => changeItemDiscount(item.id, e.target.value)}
                      placeholder="Chegirma qiymati..."
                      style={{
                        width: '100%', maxWidth: 110, padding: '4px 6px', fontSize: 10, borderRadius: 4, 
                        border: '1px solid var(--border)', background: 'var(--s2)', color: 'var(--t1)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <button onClick={() => changeQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--t1)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--t1)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
            ))
          }
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
          {/* Customer Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '10px 14px', background: 'rgba(59,130,246,0.06)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
              👥 Xaridor: <span style={{ color: selectedCustomer ? '#3B82F6' : 'var(--t3)' }}>{selectedCustomer ? selectedCustomer.name : 'Tanlanmagan'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {selectedCustomer && (
                <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 6, color: '#F43F5E', fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
              )}
              <button onClick={() => setShowCustModal(true)} style={{ background: '#3B82F6', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', cursor: 'pointer' }}>Tanlash</button>
            </div>
          </div>

          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--t2)', whiteSpace: 'nowrap' }}>Chegirma:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 5, 10, 15].map(d => (
                <button key={d} onClick={() => setDiscount(d)} style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  fontFamily: 'Outfit,sans-serif', cursor: 'pointer',
                  border: `1px solid ${discount === d ? '#3B82F6' : 'var(--border)'}`,
                  background: discount === d ? 'rgba(59,130,246,0.12)' : 'var(--s2)',
                  color: discount === d ? '#3B82F6' : 'var(--t2)',
                }}>{d}%</button>
              ))}
            </div>
          </div>

          {/* Totals */}
          {[
            { label: "Mahsulotlar:", val: subtotal.toLocaleString() + " so'm" },
            { label: "Chegirma:", val: `- ${discountAmt.toLocaleString()} so'm`, red: true },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}>
              <span>{r.label}</span>
              <span style={{ color: r.red ? '#F43F5E' : undefined }}>{r.val}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Jami:</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#22D3EE' }}>{total.toLocaleString()} so'm</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 12 }}>
            {PAY_METHODS.map(m => (
              <button key={m.id} onClick={() => { setMethod(m.id); setPaidAmount(''); }} style={{
                padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                fontFamily: 'Outfit,sans-serif', cursor: 'pointer', textAlign: 'center',
                border: `1px solid ${payMethod === m.id ? '#10B981' : 'var(--border)'}`,
                background: payMethod === m.id ? 'rgba(16,185,129,0.1)' : 'var(--s2)',
                color: payMethod === m.id ? '#10B981' : 'var(--t2)',
                transition: 'all .15s',
              }}>{m.label}</button>
            ))}
          </div>

          {/* Partial Payment for Nasiya */}
          {payMethod === 'nasiya' && (
            <div style={{ marginBottom: 16, background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F43F5E', marginBottom: 8 }}>💵 Boshlang'ich to'lov (Naqd/Plastik)</div>
                <input 
                  type="number" 
                  value={paidAmount} 
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0 so'm" 
                  style={{ 
                    width: '100%', padding: '10px 12px', background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: 8, color: 'var(--t1)', fontSize: 16, fontWeight: 800, fontFamily: 'Outfit,sans-serif' 
                  }}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                 <div style={{ fontSize: 12, fontWeight: 700, color: '#F43F5E', marginBottom: 8 }}>⏳ Nasiya muddati (kun)</div>
                 <input 
                  type="number" 
                  value={dueDays} 
                  onChange={(e) => setDueDays(e.target.value)}
                  placeholder="Masalan: 30" 
                  style={{ 
                    width: '100%', padding: '10px 12px', background: 'var(--s1)', border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: 8, color: 'var(--t1)', fontSize: 16, fontWeight: 800, fontFamily: 'Outfit,sans-serif' 
                  }}
                 />
              </div>

              {Number(paidAmount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: '1px solid rgba(244,63,94,0.2)', paddingTop: 8, color: 'var(--t2)' }}>
                  <span>Qolgan qarz:</span>
                  <span style={{ color: '#F43F5E', fontWeight: 800 }}>{Math.max(0, total - Number(paidAmount)).toLocaleString()} so'm</span>
                </div>
              )}
            </div>
          )}

          {/* Checkout btn */}
          <button
            onClick={() => {
              if (payMethod === 'nasiya' && !selectedCustomer) {
                alert("Iltimos, Nasiyaga (Qarzga) sotish uchun avval Xaridorni tanlang!");
                setShowCustModal(true);
                return;
              }
              checkout();
            }}
            disabled={cartItems.length === 0}
            className="btn-primary"
            style={{
              width: '100%', padding: 14,
              background: cartItems.length === 0 ? 'var(--s2)' : 'linear-gradient(135deg,#10B981,#059669)',
              border: 'none', borderRadius: 12,
              color: cartItems.length === 0 ? 'var(--t3)' : '#fff',
              fontSize: 14, fontWeight: 800, fontFamily: 'Outfit,sans-serif',
              cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: cartItems.length > 0 ? '0 6px 20px rgba(16,185,129,0.28)' : 'none',
              filter: cartItems.length === 0 ? 'none' : 'drop-shadow(0 4px 6px rgba(16,185,129,0.2))',
            }}
          >
            ✓ Sotuvni Yakunlash
          </button>
        </div>
      </div>

      {/* ── SUCCESS MODAL ── */}
      {success && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(8px)',
        }}>
          <div className="modal-content" style={{
            background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '44px 36px', textAlign: 'center',
            maxWidth: 320, width: '90%',
            boxShadow: '0 24px 60px rgba(16,185,129,0.3)',
          }}>
            <div style={{ fontSize: 72, marginBottom: 16, filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.4))' }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: '#fff' }}>Yakunlandi!</div>
            <div style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 20 }}>
              Sayvdo yakunlandi. {(!settings.isOnline && settings.offline) ? "(Offline Xotiraga Saqlandi)" : "Kvitantsiya tayyor."}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10B981', marginTop: 12 }}>
              {total.toLocaleString()} so'm
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMER MODAL ── */}
      {showCustModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(8px)',
        }} onClick={e => e.target === e.currentTarget && setShowCustModal(false)}>
          <div className="modal-content" style={{
            background: 'linear-gradient(145deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '30px', width: 440, maxWidth: '90vw',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column', maxHeight: '80vh'
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span>👥 Xaridorni tanlang</span>
              <button onClick={() => setShowCustModal(false)} style={{ background: 'none', border: 'none', color: 'var(--t2)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 6 }}>
              {customers.map(c => (
                <div key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustModal(false); }} className="fast-transition" style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: 'var(--s2)', borderRadius: 12, border: `1px solid ${selectedCustomer?.id === c.id ? '#3B82F6' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer'
                }}>
                  <div style={{ fontSize: 24 }}>{c.type === 'dealer' ? '🏪' : '👤'}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name} {c.shop_name ? `(${c.shop_name})` : ''}</div>
                    <div style={{ fontSize: 12, color: 'var(--t2)' }}>{c.phone}</div>
                  </div>
                </div>
              ))}
              {customers.length === 0 && (
                 <div style={{ textAlign: 'center', padding: 20, color: 'var(--t3)', fontSize: 13 }}>Mijozlar mavjud emas. CRM orqali qo'shing.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}
