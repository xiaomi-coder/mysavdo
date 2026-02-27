import React, { useState } from 'react';
import { PRODUCTS, CATEGORIES } from '../utils/mockData';
import { Btn, Badge, EmptyState } from '../components/UI';
import { useAuth } from '../context/AuthContext';

export default function POS() {
  const { settings, addPendingTxn } = useAuth();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Hammasi');
  const [cart, setCart] = useState({});
  const [payMethod, setMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [receiptNo, setReceiptNo] = useState(125);

  const filtered = PRODUCTS.filter(p => {
    const matchCat = cat === 'Hammasi' || p.cat === cat;
    const matchQ = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    return matchCat && matchQ;
  });

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

  const clearCart = () => { setCart({}); setDiscount(0); };

  const cartItems = Object.values(cart);
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = Math.round(subtotal * discount / 100);
  const total = subtotal - discountAmt;

  const PAY_METHODS = [
    { id: 'cash', label: '💵 Naqd' },
    { id: 'card', label: '💳 Plastik' },
    { id: 'transfer', label: '📱 Transfer' },
  ];

  const checkout = () => {
    if (!settings.isOnline && settings.offline) {
      addPendingTxn({ id: Date.now(), items: cartItems, total, method: payMethod, time: new Date().toISOString() });
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
          <div class="center bold" style="font-size: 16px; margin-bottom: 4px;">SavdoPlatform</div>
          <div class="center">"Asosiy Do'kon #1"</div>
          <div class="center" style="font-size: 10px; margin-bottom: 6px;">Toshkent, Yunusobod</div>
          <div class="line"></div>
          <div>Sana: ${new Date().toLocaleString('uz-UZ')}</div>
          <div>Chek RAQAMI: #${receiptNo}</div>
          <div>Kassir: Jasur (Owner)</div>
          <div class="line"></div>
          <div class="row bold"><span>Mahsulot</span><span>Summa</span></div>
          <div class="line"></div>
          ${cartItems.map(item => `
            <div>${item.name}</div>
            <div class="row">
              <span style="padding-left: 8px;">${item.qty} x ${item.price.toLocaleString()}</span>
              <span>${(item.price * item.qty).toLocaleString()}</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="row"><span>Jami:</span><span>${subtotal.toLocaleString()} so'm</span></div>
          ${discountAmt > 0 ? `<div class="row"><span>Chegirma:</span><span>-${discountAmt.toLocaleString()} so'm</span></div>` : ''}
          <div class="line"></div>
          <div class="row bold" style="font-size: 14px;"><span>TOLASH:</span><span>${total.toLocaleString()} so'm</span></div>
          <div class="row" style="margin-top: 4px;"><span>To'lov turi:</span><span>${paymentLabel.trim()}</span></div>
          <div class="line"></div>
          <div class="center" style="margin-top: 10px;">Xaridingiz uchun rahmat!</div>
          <div class="center" style="margin-top: 2px;">*** savdoplatform.uz ***</div>
          <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body>
      </html>
    `;
    printWin.document.write(receiptHtml);
    printWin.document.close();

    setSuccess(true);
    setReceiptNo(n => n + 1);
    setTimeout(() => { setSuccess(false); clearCart(); }, 2600);
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
                  const matched = PRODUCTS.find(p => p.barcode === search.trim() || p.barcode.includes(search.trim()));
                  if (matched) {
                    addToCart(matched);
                    setSearch('');
                  }
                }
              }}
              placeholder="Mahsulot nomi yoki barcode..."
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              fontFamily: 'Outfit,sans-serif', cursor: 'pointer', transition: 'all .15s',
              border: `1px solid ${cat === c ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
              background: cat === c ? 'rgba(59,130,246,0.12)' : 'var(--s1)',
              color: cat === c ? '#3B82F6' : 'var(--t2)',
            }}>{c}</button>
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
                <div style={{ fontSize: 30, marginBottom: 8, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>{p.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#22D3EE' }}>{p.price.toLocaleString()} so'm</div>
                <div style={{ fontSize: 11, color: p.stock === 0 ? '#F43F5E' : p.stock < 10 ? '#F59E0B' : 'var(--t2)', marginTop: 4 }}>
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
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)' }}>{(item.price * item.qty).toLocaleString()} so'm</div>
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

          {/* Pay methods */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 12 }}>
            {PAY_METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} style={{
                padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                fontFamily: 'Outfit,sans-serif', cursor: 'pointer', textAlign: 'center',
                border: `1px solid ${payMethod === m.id ? '#10B981' : 'var(--border)'}`,
                background: payMethod === m.id ? 'rgba(16,185,129,0.1)' : 'var(--s2)',
                color: payMethod === m.id ? '#10B981' : 'var(--t2)',
                transition: 'all .15s',
              }}>{m.label}</button>
            ))}
          </div>

          {/* Checkout btn */}
          <button
            onClick={checkout}
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

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}
