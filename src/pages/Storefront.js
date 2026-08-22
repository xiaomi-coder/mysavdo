import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Icon, Btn, Field, EmptyState, SkeletonRows, Toast } from '../components/UI';
import { supabase } from '../utils/supabaseClient';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

/* ══════════════════════════════════════════════════════════════════════════
   Onlayn do'kon — mijozlar uchun ochiq vitrina.
   Login talab qilinmaydi: buyurtma ism va telefon bilan qabul qilinadi,
   do'kon keyin telefon orqali bog'lanadi.
   ══════════════════════════════════════════════════════════════════════ */

export default function Storefront() {
  const { storeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Hammasi');

  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async (id) => {
    setLoading(true);
    const [storeRes, prodRes] = await Promise.all([
      supabase.from('stores').select('*').eq('id', id).single(),
      supabase.from('products').select('*').eq('store_id', id),
    ]);
    setStore(storeRes.data || null);
    setProducts(prodRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (storeId) load(storeId); }, [storeId, load]);

  const categories = useMemo(
    () => ['Hammasi', ...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (cat !== 'Hammasi' && p.category !== cat) return false;
      if (!q) return true;
      return [p.name, p.phone_model, p.category].some(v => String(v || '').toLowerCase().includes(q));
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
        setToast({ msg: `Omborda ${p.stock} dona qolgan`, variant: 'warn' });
        return prev;
      }
      return { ...prev, [p.id]: { ...p, qty: (cur?.qty || 0) + 1 } };
    });
  };

  const changeQty = (id, delta) => setCart(prev => {
    const cur = prev[id];
    if (!cur) return prev;
    const next = cur.qty + delta;
    if (next <= 0) { const c = { ...prev }; delete c[id]; return c; }
    if (next > cur.stock) return prev;
    return { ...prev, [id]: { ...cur, qty: next } };
  });

  const remove = (id) => setCart(prev => { const c = { ...prev }; delete c[id]; return c; });

  const checkout = async () => {
    if (!name.trim() || !phone.trim() || items.length === 0) return;
    setSubmitting(true);

    // Telefon bo'yicha mavjud mijozni qidiramiz, bo'lmasa yangisini ochamiz
    const { data: existing } = await supabase.from('customers')
      .select('id').eq('store_id', storeId).eq('phone', phone.trim()).maybeSingle();

    let customerId = existing?.id ?? null;
    if (!customerId) {
      const { data: created } = await supabase.from('customers').insert({
        store_id: Number(storeId), name: name.trim(), phone: phone.trim(),
        type: 'regular', total_spent: 0, purchases: 0,
      }).select().single();
      customerId = created?.id ?? null;
    }

    const { error } = await supabase.from('transactions').insert({
      store_id: Number(storeId),
      customer_id: customerId,
      receipt_no: `#WEB-${Math.floor(1000 + Math.random() * 9000)}`,
      cashier: `Saytdan: ${name.trim()}`,
      items,
      total,
      discount: 0,
      payment_method: 'online',
      status: 'online_pending',
    });

    setSubmitting(false);
    if (error) {
      setToast({ msg: `Buyurtma yuborilmadi: ${error.message}`, variant: 'dang' });
      return;
    }
    setDone({ total, count: itemCount });
    setCart({});
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 26 }}>
        <SkeletonRows count={6} widths={['100%']} />
      </div>
    );
  }

  if (!store) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 26 }}>
        <EmptyState icon="storefront" text="Do‘kon topilmadi"
          sub="Havola noto‘g‘ri bo‘lishi mumkin — do‘kon egasidan qayta so‘rang" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Sarlavha ── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 26px',
        borderBottom: '1px solid var(--color-divider)', position: 'sticky', top: 0,
        background: 'var(--color-bg)', zIndex: 10, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flex: 'none',
            background: 'var(--color-accent)', color: 'var(--color-bg)',
            display: 'grid', placeItems: 'center', fontSize: 17,
          }}>
            {store.store_type === 'phone' ? '📱' : '🏬'}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{store.name}</div>
            <div style={{ fontSize: 10, color: 'var(--color-neutral-500)' }}>
              mybazzar.uz/shop/{storeId}
            </div>
          </div>
        </div>

        <div style={{
          flex: 1, maxWidth: 460, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 9,
          minHeight: 42, padding: '0 14px', borderRadius: 21,
          border: '1px solid var(--color-divider)', background: 'var(--color-surface)',
        }}>
          <Icon name="magnifying-glass" size={16} color="var(--color-neutral-500)" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Mahsulot qidiring..."
            style={{ flex: 1, background: 'none', border: 0, outline: 'none', color: 'var(--color-text)', font: 'inherit', fontSize: 13.5 }}
          />
        </div>

        <Btn variant="primary" icon="shopping-cart" onClick={() => setShowCart(true)}
          style={{ borderRadius: 21 }}>
          Savat
          {itemCount > 0 && (
            <span style={{
              minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
              background: 'var(--color-accent)', color: 'var(--color-bg)',
              fontSize: 10.5, fontWeight: 700, display: 'inline-grid', placeItems: 'center',
            }}>
              {itemCount}
            </span>
          )}
        </Btn>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* ── Vitrina ── */}
        <div style={{ flex: 1, minWidth: 0, padding: '18px 26px', display: 'flex', flexDirection: 'column', gap: 15 }}>
          {categories.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(c => {
                const on = cat === c;
                return (
                  <button key={c} onClick={() => setCat(c)} style={{
                    padding: '8px 15px', borderRadius: 17, border: 0, cursor: 'pointer', font: 'inherit',
                    fontSize: 12.5, fontWeight: on ? 500 : 400,
                    background: on ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 6%, transparent)',
                    color: on ? 'var(--color-bg)' : 'var(--color-neutral-300)',
                  }}>{c}</button>
                );
              })}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState icon="package"
              text={search ? `"${search}" topilmadi` : 'Hozircha mahsulot yo‘q'}
              sub={search ? 'Boshqa nom bilan qidirib ko‘ring' : 'Tez orada tovarlar qo‘shiladi'} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {filtered.map(p => {
                const out = p.stock <= 0;
                const sub = [p.phone_memory, p.phone_color].filter(Boolean).join(' · ') || p.category;
                return (
                  <Card key={p.id} elev={out ? null : 'sm'} padding="var(--space-6)" gap={9}
                    style={{ opacity: out ? 0.55 : 1 }}>
                    <div style={{
                      height: 96, borderRadius: 9, display: 'grid', placeItems: 'center', fontSize: 42,
                      background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
                      filter: out ? 'grayscale(1)' : 'none',
                    }}>
                      {p.image || '📦'}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{p.phone_model || p.name}</div>
                    <div style={{ fontSize: 12, color: out ? 'var(--dang)' : 'var(--color-neutral-500)' }}>
                      {out ? 'Sotuvda yo‘q' : (sub || ' ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                      <span className="num" style={{ fontSize: 15.5, fontWeight: 600 }}>
                        {money(p.price)} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-neutral-500)' }}>so‘m</span>
                      </span>
                      {out
                        ? <Btn variant="secondary" size="sm" disabled style={{ borderRadius: 17 }}>Tugagan</Btn>
                        : <Btn variant="primary" size="sm" icon="shopping-cart" onClick={() => add(p)}
                            style={{ borderRadius: 17 }}>Savatga</Btn>}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Savat paneli ── */}
        {showCart && (
          <aside style={{
            width: 360, flex: 'none', display: 'flex', flexDirection: 'column',
            borderLeft: '1px solid var(--color-divider)', background: 'var(--color-surface)',
            position: 'sticky', top: 71, height: 'calc(100vh - 71px)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid var(--color-divider)',
            }}>
              <span style={{ fontSize: 14.5, fontWeight: 500 }}>Savat · {itemCount} dona</span>
              <Btn variant="ghost" iconOnly icon="x" onClick={() => setShowCart(false)}
                style={{ width: 28, height: 28 }} />
            </div>

            {done ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--okbg)', display: 'grid', placeItems: 'center' }}>
                  <Icon name="check-circle" fill size={30} color="var(--ok)" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Buyurtma qabul qilindi</div>
                <div className="num" style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>
                  {done.count} dona · {money(done.total)} so‘m
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                  Do‘kon tez orada siz bilan telefon orqali bog‘lanadi.
                </div>
                <Btn variant="primary" onClick={() => { setDone(null); setShowCart(false); }}>
                  Xaridni davom ettirish
                </Btn>
              </div>
            ) : items.length === 0 ? (
              <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
                <EmptyState icon="shopping-cart" text="Savat bo‘sh" sub="Mahsulot tanlang" />
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '6px 16px' }}>
                  {items.map((it, i) => (
                    <div key={it.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0',
                      borderBottom: i < items.length - 1 ? '1px solid var(--color-divider)' : 'none',
                    }}>
                      <span style={{ fontSize: 20 }}>{it.image || '📦'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{it.phone_model || it.name}</div>
                        <div className="num" style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                          {money(it.price)} so‘m
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Btn variant="secondary" iconOnly icon="minus" onClick={() => changeQty(it.id, -1)}
                          style={{ width: 28, height: 28 }} />
                        <span className="num" style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{it.qty}</span>
                        <Btn variant="secondary" iconOnly icon="plus" onClick={() => changeQty(it.id, 1)}
                          style={{ width: 28, height: 28 }} />
                      </div>
                      <Btn variant="ghost" iconOnly icon="trash" title="Olib tashlash"
                        onClick={() => remove(it.id)}
                        style={{ width: 26, height: 26, color: 'var(--color-neutral-500)' }} />
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: '14px 16px', borderTop: '1px solid var(--color-divider)',
                  display: 'flex', flexDirection: 'column', gap: 11,
                }}>
                  <div className="num" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600 }}>
                    <span>Jami</span><span>{money(total)} so‘m</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                    <Field label="Ism">
                      <input className="input" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Ismingiz" />
                    </Field>
                    <Field label="Telefon">
                      <input className="input num" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+998 90 …" />
                    </Field>
                  </div>
                  <Btn
                    variant="primary" icon="check-circle" block
                    disabled={!name.trim() || !phone.trim()} loading={submitting}
                    onClick={checkout}
                    style={{ minHeight: 46, fontSize: 14, borderRadius: 23 }}
                  >
                    Buyurtma berish
                  </Btn>
                  <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)', textAlign: 'center' }}>
                    Login shart emas — do‘kon siz bilan telefon orqali bog‘lanadi
                  </div>
                </div>
              </>
            )}
          </aside>
        )}
      </div>

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </div>
  );
}
