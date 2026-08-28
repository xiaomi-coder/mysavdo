import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { imageUrl } from '../utils/upload';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ');

/* ══════════════════════════════════════════════════════════════════════════
   Onlayn do'kon — mijozlar uchun ochiq katalog

   Bu sahifa boshqaruv panelining bir qismi emas, MIJOZ ko'radigan
   do'kon. Shuning uchun uning o'z ko'rinishi bor: oq fon, katta
   suratlar, baland narx. Sabab oddiy — mijoz Uzum va Yandex Marketga
   o'rgangan, do'kon havolasi ochilganda tanish narsani ko'rishi kerak.

   Telefondan ochiladigan holat birinchi o'ringa qo'yilgan: do'konchi
   havolani WhatsApp orqali yuboradi, mijoz esa uni telefonda ochadi.
   Shuning uchun ikki ustunli setka, katta tegish maydonlari va savat
   pastdan chiqadigan oyna.

   Ataylab qo'yilmagan narsalar: yulduzcha reyting, sharhlar soni,
   "ertaga yetkazamiz" yozuvi. Bizda ular yo'q — soxta ko'rsatish
   mijozni birinchi savoldayoq aldash bo'ladi.
   ══════════════════════════════════════════════════════════════════════ */

const CSS = `
.shop {
  --bg: #f4f5f7;
  --card: #ffffff;
  --line: #e6e8ec;
  --ink: #16181d;
  --ink2: #5c6270;
  --ink3: #8b909c;
  --acc: #6a58c7;
  --acc-ink: #ffffff;
  --ok: #1f9d63;
  --warn: #b07f14;
  --err: #d24343;
  --shadow: 0 1px 2px rgba(16,18,29,.04), 0 4px 16px rgba(16,18,29,.06);
  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.shop *, .shop *::before, .shop *::after { box-sizing: border-box; }
.shop button { font: inherit; cursor: pointer; border: 0; background: none; color: inherit; }
.shop input, .shop textarea { font: inherit; }
.shop a { color: inherit; text-decoration: none; }

/* ── Sarlavha ── */
.shop-head {
  position: sticky; top: 0; z-index: 30;
  background: var(--card);
  border-bottom: 1px solid var(--line);
}
.shop-head-in {
  max-width: 1320px; margin: 0 auto;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px;
}
.shop-logo {
  width: 40px; height: 40px; flex: none; border-radius: 11px;
  background: var(--acc); color: var(--acc-ink);
  display: grid; place-items: center; font-size: 19px;
}
.shop-name { font-size: 15px; font-weight: 650; letter-spacing: -.01em; line-height: 1.2; }
.shop-phone { font-size: 11.5px; color: var(--ink2); }

.shop-search {
  flex: 1; display: flex; align-items: center; gap: 9px;
  height: 42px; padding: 0 14px; border-radius: 12px;
  background: var(--bg); border: 1px solid transparent;
  transition: border-color .15s, background .15s;
}
.shop-search:focus-within { background: var(--card); border-color: var(--acc); }
.shop-search input {
  flex: 1; min-width: 0; background: none; border: 0; outline: none;
  font-size: 14px; color: var(--ink);
}
.shop-search input::placeholder { color: var(--ink3); }

.shop-cart-btn {
  position: relative; flex: none;
  height: 42px; padding: 0 16px; border-radius: 12px;
  background: var(--acc); color: var(--acc-ink);
  font-size: 14px; font-weight: 550;
  display: inline-flex; align-items: center; gap: 8px;
}
.shop-cart-btn:active { transform: scale(.97); }
.shop-cart-count {
  min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px;
  background: rgba(255,255,255,.25); font-size: 11.5px; font-weight: 700;
  display: inline-grid; place-items: center;
}

/* ── Kategoriyalar ── */
.shop-cats {
  display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;
  padding: 12px 16px; max-width: 1320px; margin: 0 auto;
}
.shop-cats::-webkit-scrollbar { display: none; }
.shop-cat {
  flex: none; height: 36px; padding: 0 15px; border-radius: 18px;
  background: var(--card); border: 1px solid var(--line);
  font-size: 13px; color: var(--ink2); white-space: nowrap;
}
.shop-cat[data-on="1"] { background: var(--acc); border-color: var(--acc); color: var(--acc-ink); font-weight: 550; }

/* ── Setka ── */
.shop-body { max-width: 1320px; margin: 0 auto; padding: 4px 16px 60px; }
.shop-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 560px)  { .shop-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
@media (min-width: 860px)  { .shop-grid { grid-template-columns: repeat(4, 1fr); gap: 14px; } }
@media (min-width: 1140px) { .shop-grid { grid-template-columns: repeat(5, 1fr); } }

/* ── Kartochka ── */
.shop-card {
  background: var(--card); border-radius: 14px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: var(--shadow);
  transition: transform .16s cubic-bezier(.2,.8,.3,1), box-shadow .16s;
}
@media (hover: hover) {
  .shop-card:hover { transform: translateY(-3px); box-shadow: 0 6px 28px rgba(16,18,29,.11); }
}
.shop-photo {
  position: relative; width: 100%; aspect-ratio: 1;
  background: #fff; display: grid; place-items: center; cursor: pointer;
  overflow: hidden;
}
.shop-photo img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }
.shop-photo .emoji { font-size: 54px; opacity: .5; }
.shop-card[data-out="1"] .shop-photo { filter: grayscale(1); opacity: .5; }

.shop-badges { position: absolute; top: 8px; left: 8px; display: flex; flex-direction: column; gap: 5px; }
.shop-badge {
  padding: 3px 8px; border-radius: 7px;
  font-size: 10.5px; font-weight: 650; letter-spacing: .01em; color: #fff;
}

.shop-card-body { padding: 10px 11px 12px; display: flex; flex-direction: column; flex: 1; gap: 3px; }
.shop-price { font-size: 17px; font-weight: 700; letter-spacing: -.02em; line-height: 1.15; }
.shop-price span { font-size: 11.5px; font-weight: 500; color: var(--ink3); }
.shop-title {
  font-size: 12.5px; line-height: 1.35; color: var(--ink2);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; cursor: pointer; margin-top: 2px;
}
.shop-meta { font-size: 11px; color: var(--ink3); margin-top: 1px; }
.shop-add {
  margin-top: auto; height: 38px; border-radius: 10px;
  background: var(--acc); color: var(--acc-ink);
  font-size: 13px; font-weight: 550;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.shop-add:active { transform: scale(.97); }
.shop-add[disabled] { background: var(--bg); color: var(--ink3); cursor: default; }

/* ── Savat ── */
.shop-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(16,18,29,.45); backdrop-filter: blur(3px);
  display: flex; align-items: flex-end; justify-content: center;
  animation: shopFade .18s ease-out;
}
@media (min-width: 720px) { .shop-overlay { align-items: center; } }
@keyframes shopFade { from { opacity: 0 } }
@keyframes shopUp { from { transform: translateY(100%) } }
.shop-panel {
  width: 100%; max-width: 460px; max-height: 92vh;
  background: var(--card); border-radius: 20px 20px 0 0;
  display: flex; flex-direction: column;
  animation: shopUp .26s cubic-bezier(.2,.8,.3,1);
}
@media (min-width: 720px) { .shop-panel { border-radius: 18px; max-height: 86vh; animation: shopFade .2s; } }
.shop-panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px 18px; border-bottom: 1px solid var(--line);
}
.shop-panel-body { flex: 1; overflow-y: auto; padding: 4px 18px; }
.shop-panel-foot { padding: 14px 18px; border-top: 1px solid var(--line); }
.shop-x {
  width: 32px; height: 32px; border-radius: 9px; background: var(--bg);
  display: grid; place-items: center; font-size: 17px; color: var(--ink2);
}

.shop-field { display: block; }
.shop-field span { display: block; font-size: 11.5px; color: var(--ink2); margin-bottom: 4px; }
.shop-field input {
  width: 100%; height: 44px; padding: 0 13px; border-radius: 11px;
  border: 1px solid var(--line); background: var(--bg); outline: none;
  font-size: 14px; color: var(--ink);
}
.shop-field input:focus { border-color: var(--acc); background: var(--card); }

.shop-primary {
  width: 100%; height: 48px; border-radius: 12px;
  background: var(--acc); color: var(--acc-ink);
  font-size: 15px; font-weight: 600;
}
.shop-primary:active { transform: scale(.99); }
.shop-primary[disabled] { opacity: .45; cursor: default; }

.shop-step {
  width: 32px; height: 32px; border-radius: 9px;
  background: var(--bg); color: var(--ink2); font-size: 17px;
  display: grid; place-items: center;
}

.shop-toast {
  position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%);
  z-index: 60; max-width: 90vw;
  background: var(--ink); color: #fff;
  padding: 11px 18px; border-radius: 12px; font-size: 13.5px;
  box-shadow: 0 8px 30px rgba(0,0,0,.25);
  animation: shopFade .16s ease-out;
}

/* ── Galereya ── */
.shop-gal {
  display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
  scrollbar-width: none; border-radius: 14px;
  border: 1px solid var(--line); background: #fff;
}
.shop-gal::-webkit-scrollbar { display: none; }
.shop-gal > div {
  flex: none; width: 100%; aspect-ratio: 1;
  scroll-snap-align: center;
  display: grid; place-items: center;
}
.shop-gal img { width: 100%; height: 100%; object-fit: contain; padding: 14px; }
.shop-dots { display: flex; justify-content: center; gap: 6px; margin-top: 10px; }
.shop-dot { width: 7px; height: 7px; border-radius: 4px; background: var(--line); transition: background .15s; }
.shop-dot[data-on="1"] { background: var(--acc); width: 18px; }
.shop-count {
  position: absolute; bottom: 8px; right: 8px;
  padding: 3px 8px; border-radius: 7px;
  background: rgba(16,18,29,.62); color: #fff;
  font-size: 10.5px; font-weight: 600;
}

.shop-empty { text-align: center; padding: 70px 20px; color: var(--ink3); }
.shop-skel { background: var(--card); border-radius: 14px; overflow: hidden; }
.shop-skel::after {
  content: ''; display: block; width: 100%; aspect-ratio: .78;
  background: linear-gradient(100deg, transparent 30%, rgba(16,18,29,.05) 50%, transparent 70%);
  background-size: 220% 100%;
  animation: shopShim 1.3s infinite linear;
}
@keyframes shopShim { to { background-position: -220% 0 } }

.shop-foot {
  border-top: 1px solid var(--line); background: var(--card);
  padding: 24px 16px 34px; text-align: center;
}
`;

const DAY = 86400000;

export default function Storefront({ storeKey: keyFromHost }) {
  const params = useParams();
  const storeKey = keyFromHost || params.storeId;

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Hammasi');
  const [detail, setDetail] = useState(null);

  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async (key) => {
    setLoading(true);
    const query = /^\d+$/.test(String(key))
      ? supabase.from('stores').select('*').eq('id', Number(key))
      : supabase.from('stores').select('*').eq('slug', String(key));

    const { data: stores } = await query.limit(1);
    const found = stores?.[0] || null;
    setStore(found);

    if (found) {
      const { data } = await supabase.from('products').select('*')
        .eq('store_id', found.id).eq('is_online', true);
      /* Suratli tovarlar oldinga, tugaganlari orqaga. Katalogning
         birinchi ekrani do'konning yuzi — u yerda bo'sh kvadratlar
         turmasligi kerak. */
      const list = (data || []).sort((a, b) => {
        const rank = (p) => (p.stock > 0 ? 0 : 2) + (p.photo_url ? 0 : 1);
        return rank(a) - rank(b);
      });
      setProducts(list);
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (storeKey) load(storeKey); }, [storeKey, load]);

  useEffect(() => {
    if (store?.name) document.title = `${store.name} — onlayn do‘kon`;
  }, [store]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const categories = useMemo(
    () => ['Hammasi', ...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (cat !== 'Hammasi' && p.category !== cat) return false;
      if (!q) return true;
      return [p.name, p.phone_model, p.phone_memory, p.category, p.description]
        .some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [products, search, cat]);

  const items = Object.values(cart);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const add = (p) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const cur = prev[p.id];
      if (cur && cur.qty >= p.stock) {
        setToast(`Omborda ${p.stock} dona qolgan`);
        return prev;
      }
      return { ...prev, [p.id]: { ...p, qty: (cur?.qty || 0) + 1 } };
    });
    setToast(`${p.phone_model || p.name} savatga qo‘shildi`);
  };

  const changeQty = (id, delta) => setCart(prev => {
    const cur = prev[id];
    if (!cur) return prev;
    const next = cur.qty + delta;
    if (next <= 0) { const c = { ...prev }; delete c[id]; return c; }
    if (next > cur.stock) return prev;
    return { ...prev, [id]: { ...cur, qty: next } };
  });

  const checkout = async () => {
    if (!name.trim() || !phone.trim() || items.length === 0) return;
    setSubmitting(true);

    const { data: existing } = await supabase.from('customers')
      .select('id').eq('store_id', store.id).eq('phone', phone.trim()).maybeSingle();

    let customerId = existing?.id ?? null;
    if (!customerId) {
      const { data: created } = await supabase.from('customers').insert({
        store_id: store.id, name: name.trim(), phone: phone.trim(),
        type: 'regular', total_spent: 0, purchases: 0,
      }).select().single();
      customerId = created?.id ?? null;
    }

    const { error } = await supabase.from('transactions').insert({
      store_id: store.id,
      customer_id: customerId,
      receipt_no: `#WEB-${Math.floor(1000 + Math.random() * 9000)}`,
      cashier: `Saytdan: ${name.trim()} · ${phone.trim()}`,
      items,
      total,
      discount: 0,
      payment_method: 'online',
      status: 'online_pending',
    });

    setSubmitting(false);
    if (error) { setToast(`Buyurtma yuborilmadi: ${error.message}`); return; }
    setDone({ total, count: itemCount });
    setCart({});
  };

  const tel = String(store?.phone || '').replace(/[^\d+]/g, '');

  return (
    <div className="shop">
      <style>{CSS}</style>

      {/* ── Sarlavha ── */}
      <header className="shop-head">
        <div className="shop-head-in">
          <div className="shop-logo">{store?.store_type === 'phone' ? '📱' : '🏬'}</div>
          <div style={{ minWidth: 0, marginRight: 4 }}>
            <div className="shop-name">{store?.name || 'Do‘kon'}</div>
            {store?.phone && <a className="shop-phone" href={`tel:${tel}`}>{store.phone}</a>}
          </div>

          <label className="shop-search">
            <SearchIcon />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Mahsulot qidiring"
              aria-label="Qidirish"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Tozalash"
                style={{ color: 'var(--ink3)', fontSize: 17, lineHeight: 1 }}>×</button>
            )}
          </label>

          <button className="shop-cart-btn" onClick={() => setShowCart(true)}>
            <CartIcon />
            <span className="shop-cart-label">Savat</span>
            {itemCount > 0 && <span className="shop-cart-count">{itemCount}</span>}
          </button>
        </div>
      </header>

      {/* ── Kategoriyalar ── */}
      {categories.length > 1 && (
        <div className="shop-cats">
          {categories.map(c => (
            <button key={c} className="shop-cat" data-on={cat === c ? '1' : '0'}
              onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      )}

      {/* ── Katalog ── */}
      <div className="shop-body">
        {loading ? (
          <div className="shop-grid">
            {Array.from({ length: 10 }, (_, i) => <div key={i} className="shop-skel" />)}
          </div>
        ) : !store ? (
          <div className="shop-empty">
            <div style={{ fontSize: 46 }}>🏬</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginTop: 10 }}>
              Do‘kon topilmadi
            </div>
            <div style={{ fontSize: 13.5, marginTop: 5 }}>
              Havola noto‘g‘ri bo‘lishi mumkin — do‘kon egasidan qayta so‘rang
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="shop-empty">
            <div style={{ fontSize: 46 }}>{search ? '🔍' : '📦'}</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginTop: 10 }}>
              {search ? `"${search}" topilmadi` : 'Hozircha mahsulot yo‘q'}
            </div>
            <div style={{ fontSize: 13.5, marginTop: 5 }}>
              {search ? 'Boshqa nom bilan qidirib ko‘ring' : 'Tez orada tovarlar qo‘shiladi'}
            </div>
          </div>
        ) : (
          <div className="shop-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} p={p} onOpen={() => setDetail(p)} onAdd={() => add(p)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Pastki yozuv ── */}
      {store && !loading && (
        <footer className="shop-foot">
          <div style={{ fontSize: 14, fontWeight: 600 }}>{store.name}</div>
          {store.address && (
            <div style={{ fontSize: 12.5, color: 'var(--ink2)', marginTop: 4 }}>{store.address}</div>
          )}
          {store.phone && (
            <a href={`tel:${tel}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 12,
              height: 42, padding: '0 20px', borderRadius: 21,
              border: '1px solid var(--line)', fontSize: 13.5, fontWeight: 550,
            }}>
              <PhoneIcon /> Do‘konga qo‘ng‘iroq
            </a>
          )}
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 18 }}>
            MyBazzar orqali ishlaydi
          </div>
        </footer>
      )}

      {/* ── Mahsulot tafsiloti ── */}
      {detail && (
        <div className="shop-overlay" onClick={() => setDetail(null)}>
          <div className="shop-panel" onClick={e => e.stopPropagation()}>
            <div className="shop-panel-head">
              <span style={{ fontSize: 15, fontWeight: 600 }}>Mahsulot</span>
              <button className="shop-x" onClick={() => setDetail(null)} aria-label="Yopish">×</button>
            </div>

            <div className="shop-panel-body">
              <Gallery product={detail} />

              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>
                {money(detail.price)} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink3)' }}>so‘m</span>
              </div>
              <div style={{ fontSize: 15, marginTop: 6, lineHeight: 1.35 }}>
                {detail.phone_model || detail.name}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {[detail.phone_memory, detail.phone_color, detail.phone_condition, detail.category]
                  .filter(Boolean).map((v, i) => (
                    <span key={i} style={{
                      padding: '5px 10px', borderRadius: 8, background: 'var(--bg)',
                      fontSize: 12, color: 'var(--ink2)',
                    }}>{v}</span>
                  ))}
              </div>

              {detail.description && (
                <p style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.6, marginTop: 14 }}>
                  {detail.description}
                </p>
              )}

              <div style={{ fontSize: 12.5, color: detail.stock > 0 ? 'var(--ok)' : 'var(--err)', marginTop: 12 }}>
                {detail.stock > 0
                  ? (detail.stock <= 3 ? `Oxirgi ${detail.stock} dona` : 'Sotuvda bor')
                  : 'Hozircha sotuvda yo‘q'}
              </div>
            </div>

            <div className="shop-panel-foot" style={{ display: 'flex', gap: 10 }}>
              {store?.phone && (
                <a href={`tel:${tel}`} style={{
                  width: 48, height: 48, flex: 'none', borderRadius: 12,
                  border: '1px solid var(--line)', display: 'grid', placeItems: 'center',
                }} aria-label="Qo‘ng‘iroq"><PhoneIcon /></a>
              )}
              <button className="shop-primary" disabled={detail.stock <= 0}
                onClick={() => { add(detail); setDetail(null); }}>
                {detail.stock > 0 ? 'Savatga qo‘shish' : 'Sotuvda yo‘q'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Savat ── */}
      {showCart && (
        <div className="shop-overlay" onClick={() => setShowCart(false)}>
          <div className="shop-panel" onClick={e => e.stopPropagation()}>
            <div className="shop-panel-head">
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                Savat{itemCount > 0 ? ` · ${itemCount} dona` : ''}
              </span>
              <button className="shop-x" onClick={() => setShowCart(false)} aria-label="Yopish">×</button>
            </div>

            {done ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{
                  width: 62, height: 62, borderRadius: '50%', margin: '0 auto',
                  background: 'rgba(31,157,99,.12)', display: 'grid', placeItems: 'center',
                  fontSize: 30, color: 'var(--ok)',
                }}>✓</div>
                <div style={{ fontSize: 18, fontWeight: 650, marginTop: 14 }}>Buyurtma qabul qilindi</div>
                <div style={{ fontSize: 14, color: 'var(--ink2)', marginTop: 6 }}>
                  {done.count} dona · {money(done.total)} so‘m
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink3)', lineHeight: 1.6, marginTop: 12 }}>
                  Do‘kon tez orada siz bilan telefon orqali bog‘lanadi.
                </p>
                <button className="shop-primary" style={{ marginTop: 18 }}
                  onClick={() => { setDone(null); setShowCart(false); }}>
                  Xaridni davom ettirish
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="shop-empty" style={{ padding: '60px 20px' }}>
                <div style={{ fontSize: 44 }}>🛒</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginTop: 10 }}>
                  Savat bo‘sh
                </div>
                <div style={{ fontSize: 13.5, marginTop: 5 }}>Mahsulot tanlang</div>
              </div>
            ) : (
              <>
                <div className="shop-panel-body">
                  {items.map((it, i) => (
                    <div key={it.id} style={{
                      display: 'flex', alignItems: 'center', gap: 11, padding: '12px 0',
                      borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 'none',
                    }}>
                      <Thumb p={it} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 550, lineHeight: 1.3 }}>
                          {it.phone_model || it.name}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink2)', marginTop: 2 }}>
                          {money(it.price * it.qty)} so‘m
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button className="shop-step" onClick={() => changeQty(it.id, -1)}>−</button>
                        <span style={{ width: 24, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
                          {it.qty}
                        </span>
                        <button className="shop-step" onClick={() => changeQty(it.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="shop-panel-foot">
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    marginBottom: 14,
                  }}>
                    <span style={{ fontSize: 14, color: 'var(--ink2)' }}>Jami</span>
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{money(total)} so‘m</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <label className="shop-field">
                      <span>Ismingiz</span>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ism" />
                    </label>
                    <label className="shop-field">
                      <span>Telefon</span>
                      <input value={phone} onChange={e => setPhone(e.target.value)}
                        type="tel" placeholder="+998 90 …" />
                    </label>
                  </div>

                  <button className="shop-primary"
                    disabled={!name.trim() || !phone.trim() || submitting}
                    onClick={checkout}>
                    {submitting ? 'Yuborilmoqda…' : 'Buyurtma berish'}
                  </button>
                  <div style={{ fontSize: 11.5, color: 'var(--ink3)', textAlign: 'center', marginTop: 10 }}>
                    Ro‘yxatdan o‘tish shart emas — do‘kon telefon orqali bog‘lanadi
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  );
}

/* ── Mahsulot kartochkasi ──────────────────────────────────────────────── */
function ProductCard({ p, onOpen, onAdd }) {
  const out = p.stock <= 0;
  const fresh = p.created_at && Date.now() - new Date(p.created_at).getTime() < 14 * DAY;
  const last = !out && p.stock <= 3;

  const meta = [p.phone_memory, p.phone_color].filter(Boolean).join(' · ');

  return (
    <article className="shop-card" data-out={out ? '1' : '0'}>
      <div className="shop-photo" onClick={onOpen}>
        {p.photo_url
          ? <img src={imageUrl(p.photo_url)} alt={p.name} loading="lazy" />
          : <span className="emoji">{p.image || '📦'}</span>}

        {photoCount(p) > 1 && <span className="shop-count">{photoCount(p)} rasm</span>}

        <div className="shop-badges">
          {out && <span className="shop-badge" style={{ background: '#8b909c' }}>Tugagan</span>}
          {!out && fresh && <span className="shop-badge" style={{ background: '#6a58c7' }}>Yangi</span>}
          {last && <span className="shop-badge" style={{ background: '#d24343' }}>Oxirgi {p.stock} dona</span>}
          {p.phone_condition && p.phone_condition !== 'Yangi' && (
            <span className="shop-badge" style={{ background: '#b07f14' }}>{p.phone_condition}</span>
          )}
        </div>
      </div>

      <div className="shop-card-body">
        <div className="shop-price">{money(p.price)} <span>so‘m</span></div>
        <div className="shop-title" onClick={onOpen}>{p.phone_model || p.name}</div>
        {meta && <div className="shop-meta">{meta}</div>}

        <button className="shop-add" disabled={out} onClick={onAdd} style={{ marginTop: 10 }}>
          {out ? 'Sotuvda yo‘q' : <><CartIcon size={15} /> Savatga</>}
        </button>
      </div>
    </article>
  );
}

/* Tovarning barcha suratlari. Baza `photo_url` ni doim birinchi
   suratga teng qilib turadi, shuning uchun eski yozuvlar ham
   muammosiz ishlaydi. */
function photosOf(p) {
  if (Array.isArray(p?.photos) && p.photos.length) return p.photos.filter(Boolean);
  return p?.photo_url ? [p.photo_url] : [];
}
const photoCount = (p) => photosOf(p).length;

/* Surmalab ko'riladigan galereya. Nuqtalar qaysi suratda turganini
   ko'rsatadi — telefonda bu yagona belgisi. */
function Gallery({ product }) {
  const list = photosOf(product);
  const [at, setAt] = useState(0);

  if (list.length === 0) {
    return (
      <div style={{
        aspectRatio: 1, background: '#fff', borderRadius: 14, margin: '12px 0',
        display: 'grid', placeItems: 'center', border: '1px solid var(--line)',
      }}>
        <span style={{ fontSize: 72, opacity: .5 }}>{product.image || '📦'}</span>
      </div>
    );
  }

  const onScroll = (e) => {
    const w = e.currentTarget.clientWidth || 1;
    setAt(Math.round(e.currentTarget.scrollLeft / w));
  };

  return (
    <div style={{ margin: '12px 0' }}>
      <div className="shop-gal" onScroll={onScroll}>
        {list.map((src, i) => (
          <div key={src + i}>
            <img src={imageUrl(src)} alt={`${product.name} ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
      </div>

      {list.length > 1 && (
        <div className="shop-dots">
          {list.map((src, i) => <span key={i} className="shop-dot" data-on={i === at ? '1' : '0'} />)}
        </div>
      )}
    </div>
  );
}

function Thumb({ p }) {
  const box = {
    width: 46, height: 46, flex: 'none', borderRadius: 9,
    border: '1px solid var(--line)', background: '#fff',
    display: 'grid', placeItems: 'center', overflow: 'hidden',
  };
  return p.photo_url
    ? <img src={imageUrl(p.photo_url)} alt="" style={{ ...box, objectFit: 'contain', padding: 3 }} />
    : <span style={{ ...box, fontSize: 22, opacity: .6 }}>{p.image || '📦'}</span>;
}

/* ── Belgilar ─────────────────────────────────────────────────────────────
   Katalog boshqaruv panelidan mustaqil bo'lishi uchun o'z belgilari
   ishlatiladi — mijoz sahifasi admin komponentlariga bog'lanmasin.   */
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8b909c" strokeWidth="2"
    strokeLinecap="round" style={{ flex: 'none' }}>
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
  </svg>
);

const CartIcon = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
    <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h7.5a2 2 0 0 0 2-1.6L21 7H6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
