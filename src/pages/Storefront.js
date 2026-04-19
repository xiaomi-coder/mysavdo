import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Storefront() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);
  
  // Checkout form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (storeId) {
      loadData();
    }
  }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    // Fetch store info
    const { data: st } = await supabase.from('stores').select('*').eq('id', storeId).single();
    if (st) setStore(st);

    // Fetch products
    const { data: pr } = await supabase.from('products').select('*').eq('store_id', storeId).gt('stock', 0);
    if (pr) setProducts(pr);
    
    setLoading(false);
  };

  const addToCart = (p) => {
    setCart(prev => {
      const q = (prev[p.id]?.qty || 0) + 1;
      if (q > p.stock) return prev;
      return { ...prev, [p.id]: { ...p, qty: q } };
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const q = (prev[id]?.qty || 0) - 1;
      if (q <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...prev[id], qty: q } };
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = async () => {
    if (!name || !phone || cartItems.length === 0) return;
    setSubmitting(true);

    try {
      // 1. Find or create customer
      let customerId = null;
      const { data: existCust } = await supabase.from('customers').select('id').eq('phone', phone).eq('store_id', storeId).single();
      
      if (existCust) {
        customerId = existCust.id;
      } else {
        const { data: newCust, error: custErr } = await supabase.from('customers').insert({
          store_id: storeId,
          name: name,
          phone: phone,
          type: 'regular',
          total_spent: 0,
          purchases: 0
        }).select().single();
        if (newCust) customerId = newCust.id;
      }

      // 2. Insert into transactions as 'online_pending'
      const { error } = await supabase.from('transactions').insert({
        store_id: storeId,
        customer_id: customerId,
        receipt_no: `#WEB-${Math.floor(1000 + Math.random() * 9000)}`,
        cashier: `Saytdan: ${name}`,
        items: cartItems,
        total: cartTotal,
        discount: 0,
        payment_method: 'online',
        status: 'online_pending'
      });

      if (!error) {
        setSuccess(true);
        setCart({});
      } else {
        alert("Xatolik! " + error.message);
      }
    } catch(err) {
      console.error(err);
      alert("Xatolik!");
    }
    setSubmitting(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Yuklanmoqda...</div>;
  if (!store) return <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Do'kon topilmadi! Havolani tekshiring.</div>;

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Modern UI strictly tailored for mobile buyers
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Header */}
      <div style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg, #3B82F6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
               {store.name}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Onlayn Do'kon (Vitrina)</div>
          </div>
          <button onClick={() => setShowCart(true)} style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer' }}>
            🛒
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#F43F5E', color: '#fff', fontSize: 11, fontWeight: 800, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
        
        {/* Search */}
        <div style={{ marginTop: 16 }}>
          <input 
            type="text" 
            placeholder="🔍 Nima qidiryapmiz?" 
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>
      </div>

      {/* Product List */}
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {filtered.map(p => {
          const q = cart[p.id]?.qty || 0;
          return (
            <div key={p.id} style={{ background: 'rgba(30,41,59,0.5)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: 16, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>{p.emoji || '📦'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#22D3EE' }}>{p.price.toLocaleString()} so'm</div>
              </div>
              <div style={{ marginTop: 16 }}>
                {q === 0 ? (
                  <button onClick={() => addToCart(p)} style={{ width: '100%', padding: '10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, color: '#3B82F6', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    + Savatga
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(59,130,246,0.2)', borderRadius: 10, border: '1px solid rgba(59,130,246,0.4)', overflow: 'hidden' }}>
                    <button onClick={() => removeFromCart(p.id)} style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>-</button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 14 }}>{q}</div>
                    <button onClick={() => addToCart(p)} style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>+</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#94A3B8' }}>
            Hech narsa topilmadi...
          </div>
        )}
      </div>

      {/* Floating Bottom Bar (if items in cart) */}
      {cartCount > 0 && !showCart && (
        <div style={{ position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 20, animation: 'slideUp 0.3s ease' }}>
          <button onClick={() => setShowCart(true)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', borderRadius: 16, border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(59,130,246,0.4)' }}>
            <span style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: 20 }}>{cartCount} ta</span>
            <span>Ko'rib chiqish &rarr;</span>
            <span>{cartTotal.toLocaleString()} so'm</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s' }}>
          <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } } @keyframes slideUp { from { transform: translateY(100px) } to { transform: translateY(0) } }`}</style>
          
          <div style={{ flex: 1 }} onClick={() => setShowCart(false)} />
          
          <div style={{ background: '#0F172A', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: 18, fontWeight: 800 }}>🧾 Buyurtmangiz</div>
               <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 24 }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Buyurtma yuborildi!</div>
                  <div style={{ color: '#94A3B8', lineHeight: 1.5 }}>Tez orada {store.name} xodimlari siz bilan bog'lanishadi.</div>
                  <button onClick={() => { setSuccess(false); setShowCart(false); }} style={{ marginTop: 24, padding: '14px 30px', background: '#3B82F6', color: '#fff', borderRadius: 12, fontWeight: 800, border: 'none', cursor: 'pointer' }}>Xaridni davom ettirish</button>
                </div>
              ) : <>
                {cartItems.length === 0 ? <div style={{ textAlign: 'center', color: '#94A3B8', padding: 40 }}>Savat bo'sh!</div> : <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {cartItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
                        <div style={{ fontSize: 28 }}>{item.emoji || '📦'}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>{(item.price * item.qty).toLocaleString()} so'm</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '4px 8px' }}>
                          <button onClick={() => removeFromCart(item.id)} style={{ color: '#fff', background: 'none', border: 'none', fontSize: 16, fontWeight: 800 }}>-</button>
                          <span style={{ fontWeight: 800, fontSize: 13, width: 14, textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => addToCart(item)} style={{ color: '#fff', background: 'none', border: 'none', fontSize: 16, fontWeight: 800 }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
  
                  <div style={{ marginTop: 30 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Bog'lanish uchun:</div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Ismingiz</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sardor O'ktamov" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 15, outline: 'none' }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Telefon Raqamingiz</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 90 123 45 67" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 15, outline: 'none' }} />
                    </div>
                  </div>
                </>}
              </>}
            </div>
            
            {!success && cartItems.length > 0 && (
              <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,23,42,0.95)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 16, fontWeight: 800 }}>
                  <span>Jami to'lov:</span>
                  <span style={{ color: '#3B82F6' }}>{cartTotal.toLocaleString()} so'm</span>
                </div>
                <button onClick={handleCheckout} disabled={!name || !phone || submitting} style={{ width: '100%', padding: '16px', background: (!name || !phone || submitting) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10B981, #059669)', border: 'none', borderRadius: 14, color: (!name || !phone) ? '#94A3B8' : '#fff', fontSize: 16, fontWeight: 800, cursor: (!name || !phone) ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Yuborilmoqda...' : 'Tasdiqlash va Yuborish ➔'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
