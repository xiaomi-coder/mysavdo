import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon, Btn, Tag, Seg, Modal, EmptyState, Avatar, Toast, SkeletonRows } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { printReceipt } from '../utils/receipt';
import { isLowStock } from '../utils/stock';

/* ── yordamchilar ──────────────────────────────────────────────────────── */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

// Kiritish paytida raqamni bo'shliq bilan ajratib ko'rsatadi: 8 900 000
const formatInput = v => {
  const digits = String(v ?? '').replace(/\D/g, '');
  return digits ? Number(digits).toLocaleString('ru-RU') : '';
};

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

const PAY_METHODS = [
  { id: 'cash', label: 'Naqd', icon: 'money' },
  { id: 'card', label: 'Plastik', icon: 'credit-card' },
  { id: 'transfer', label: 'Transfer', icon: 'arrows-left-right' },
  { id: 'nasiya', label: 'Nasiya', icon: 'hand-coins' },
];

const DISCOUNTS = [0, 5, 10, 15].map(d => ({ value: d, label: `${d}%` }));

/* ══════════════════════════════════════════════════════════════════════════
   POS — sotuv sahifasi
   ══════════════════════════════════════════════════════════════════════ */

export default function POS() {
  const { user, settings, addPendingTxn, refreshAlerts } = useAuth();
  const location = useLocation();
  const isPhone = user?.storeType === 'phone';
  const isDealer = user?.role === 'dealer';

  const searchRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Hammasi');

  const [cart, setCart] = useState({});
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState(isDealer ? 'nasiya' : 'cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [dueDays, setDueDays] = useState('30');

  const [customer, setCustomer] = useState(location.state?.selectedCustomer || null);
  const [showCustomers, setShowCustomers] = useState(false);
  const [custSearch, setCustSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [receiptNo, setReceiptNo] = useState(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [toast, setToast] = useState(null);

  /* ── yuklash ── */
  const load = useCallback(async (storeId) => {
    setLoading(true);
    const [prodRes, custRes, cntRes] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', storeId),
      supabase.from('customers').select('*').eq('store_id', storeId),
      supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    ]);
    setProducts(prodRes.data || []);
    setCustomers(custRes.data || []);
    setReceiptNo((cntRes.count || 0) + 1);
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  /* ── filtrlash ── */
  const categories = useMemo(
    () => ['Hammasi', ...new Set(products.map(p => p.category || p.cat).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (cat !== 'Hammasi' && (p.category || p.cat) !== cat) return false;
      if (!q) return true;
      return [p.name, p.barcode, p.phone_imei1, p.phone_imei2, p.phone_serial, p.phone_model]
        .some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [products, search, cat]);

  /* ── savat ── */
  const addToCart = (p) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const cur = prev[p.id];
      if (cur && cur.qty >= p.stock) {
        setToast({ msg: `${p.name}: omborda ${p.stock} dona bor, ko'proq qo'shib bo'lmaydi`, variant: 'warn' });
        return prev;
      }
      return { ...prev, [p.id]: { ...p, qty: (cur?.qty || 0) + 1, itemDiscount: cur?.itemDiscount || '' } };
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

  const setItemDiscount = (id, val) =>
    setCart(prev => prev[id] ? { ...prev, [id]: { ...prev[id], itemDiscount: val } } : prev);

  const clearCart = () => { setCart({}); setDiscount(0); setPaidAmount(''); setShowClearConfirm(false); };

  /* ── hisob-kitob ── */
  const items = Object.values(cart);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const itemsDiscount = items.reduce((s, i) => s + (Number(i.itemDiscount) || 0) * i.qty, 0);
  const globalDiscount = Math.round((subtotal - itemsDiscount) * discount / 100);
  const discountTotal = itemsDiscount + globalDiscount;
  const total = subtotal - discountTotal;
  const remainingDebt = Math.max(0, total - Number(paidAmount || 0));

  /* ── barcode skaneri: Enter bosilganda savatga qo'shadi ── */
  const onSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    const q = search.trim();
    if (!q) return;
    const match = products.find(p =>
      p.barcode === q || p.phone_imei1 === q || p.phone_imei2 === q || p.phone_serial === q
    ) || (filtered.length === 1 ? filtered[0] : null);

    if (match) { addToCart(match); setSearch(''); }
    else setToast({ msg: `"${q}" topilmadi`, variant: 'warn' });
  };

  /* ── sotuvni yakunlash ── */
  const checkout = async () => {
    if (payMethod === 'nasiya' && !customer) {
      setToast({ msg: 'Nasiyaga sotish uchun avval xaridorni tanlang', variant: 'warn' });
      setShowCustomers(true);
      return;
    }
    if (payMethod === 'nasiya' && Number(paidAmount || 0) > total) {
      setToast({ msg: "Boshlang'ich to'lov jami summadan katta bo'lishi mumkin emas", variant: 'dang' });
      return;
    }

    setSaving(true);
    const offline = !settings.isOnline && settings.offline;

    if (offline) {
      // Internet yo'q — sotuvni xotiraga saqlaymiz, ulanganda yuboriladi
      addPendingTxn({
        id: Date.now(), items, total, discount: discountTotal,
        method: payMethod, customer_id: customer?.id || null,
        time: new Date().toISOString(),
      });
    } else {
      const { data: txn, error } = await supabase.from('transactions').insert({
        store_id: user.store_id,
        customer_id: customer?.id || null,
        receipt_no: `#${receiptNo}`,
        cashier: user.name,
        items,
        total,
        discount: discountTotal,
        payment_method: payMethod,
        status: 'completed',
      }).select().single();

      if (error) {
        setSaving(false);
        setToast({ msg: `Sotuv saqlanmadi: ${error.message}`, variant: 'dang' });
        return;
      }

      // Ombordan yechish bazada bajariladi: qatorlar qulflanadi, qoldiq
      // yetmasa butun amal bekor bo'ladi va harakat tarixiga yoziladi.
      const { error: stockErr } = await supabase.rpc('apply_sale', {
        p_txn: txn.id,
        p_actor: user.name,
      });

      if (stockErr) {
        // Sotuv yozildi, lekin ombor yechilmadi — yozuvni olib tashlaymiz,
        // aks holda hisobotda mavjud bo'lmagan sotuv qolib ketadi
        await supabase.from('transactions').delete().eq('id', txn.id);
        setSaving(false);
        setToast({ msg: stockErr.message, variant: 'dang' });
        return;
      }

      if (payMethod === 'nasiya') {
        const due = new Date();
        due.setDate(due.getDate() + (parseInt(dueDays, 10) || 30));
        const paid = Number(paidAmount) || 0;
        await supabase.from('debts').insert({
          store_id: user.store_id,
          customer_id: customer.id,
          client: customer.name,
          phone: customer.phone || '',
          amount: total,
          paid_amount: paid,
          due_date: due.toISOString(),
          status: paid >= total ? "To'landi" : "To'lanmagan",
        });
      }

      if (customer) {
        await supabase.rpc('increment_customer_spent', { cid: customer.id, amnt: total });
      }

      await load(user.store_id);
      refreshAlerts();
    }

    const printed = printReceipt({
      items, subtotal, discount: discountTotal, total, paidAmount,
      payMethod, receiptNo, cashier: user?.name, customer,
      storeName: user?.storeName, isPhone,
    });

    setSaving(false);
    setSuccess({
      receiptNo, total, printed, offline,
      payLabel: PAY_METHODS.find(m => m.id === payMethod)?.label,
    });
  };

  const startNewSale = () => {
    setSuccess(null);
    clearCart();
    setCustomer(null);
    setPayMethod(isDealer ? 'nasiya' : 'cash');
    setReceiptNo(n => n + 1);
    searchRef.current?.focus();
  };

  const filteredCustomers = useMemo(() => {
    const q = custSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      [c.name, c.phone, c.shop_name].some(v => String(v || '').toLowerCase().includes(q))
    );
  }, [customers, custSearch]);

  /* ══ ko'rinish ══ */
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>

      {/* ── CHAP: katalog ── */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        padding: '18px 20px', gap: 14, borderRight: '1px solid var(--color-divider)',
      }}>
        {/* Qidiruv + skaner */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            minHeight: 46, padding: '0 14px', borderRadius: 10,
            border: '2px solid var(--color-accent)', background: 'var(--color-surface)',
          }}>
            <Icon name="barcode" size={20} color="var(--color-accent)" />
            <input
              ref={searchRef}
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={isPhone
                ? 'Mahsulot, barcode, IMEI yoki S/N qidiring...'
                : 'Mahsulot nomi yoki barcode qidiring...'}
              style={{
                flex: 1, background: 'none', border: 0, outline: 'none',
                color: 'var(--color-text)', font: 'inherit', fontSize: 14.5,
              }}
            />
            <span style={{
              fontSize: 10, letterSpacing: '.05em', padding: '3px 7px', borderRadius: 5,
              background: 'color-mix(in srgb, var(--color-text) 7%, transparent)',
              color: 'var(--color-neutral-400)', whiteSpace: 'nowrap',
            }}>
              Enter — savatga
            </span>
          </div>

          <Btn
            variant="secondary" icon="camera" disabled
            title="Kamera skaneri hozircha mavjud emas"
            style={{ minHeight: 46 }}
          >
            Skaner
            <span style={{
              fontSize: 9.5, letterSpacing: '.05em', textTransform: 'uppercase',
              padding: '2px 5px', borderRadius: 4,
              background: 'color-mix(in srgb, var(--color-text) 8%, transparent)',
            }}>
              Tez orada
            </span>
          </Btn>
        </div>

        {/* Kategoriyalar */}
        {categories.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    padding: '7px 14px', borderRadius: 16, border: 0, cursor: 'pointer',
                    font: 'inherit', fontSize: 12.5, fontWeight: active ? 500 : 400,
                    background: active ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 6%, transparent)',
                    color: active ? 'var(--color-bg)' : 'var(--color-neutral-300)',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {/* Mahsulotlar */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {loading ? (
            <SkeletonRows count={6} widths={['100%']} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="magnifying-glass"
              text={search ? `"${search}" bo‘yicha hech narsa topilmadi` : 'Omborda mahsulot yo‘q'}
              sub={search ? 'Barcode, IMEI yoki S/N bilan qidirib ko‘ring' : 'Ombor bo‘limidan tovar qo‘shing'}
            />
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: 12, alignContent: 'start',
            }}>
              {filtered.map(p => {
                const inCart = cart[p.id]?.qty || 0;
                const out = p.stock <= 0;
                const low = isLowStock(p);
                const sub = isPhone
                  ? [p.phone_memory, p.phone_color].filter(Boolean).join(' · ')
                  : (p.category || p.cat || '');
                const serial = p.phone_imei1 || p.phone_serial;

                return (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={out ? 'card' : 'card elev-sm'}
                    style={{
                      padding: 13, gap: 7,
                      cursor: out ? 'not-allowed' : 'pointer',
                      opacity: out ? 0.45 : 1,
                      boxShadow: inCart ? '0 0 0 1px var(--color-accent)' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 26, filter: out ? 'grayscale(1)' : 'none' }}>
                        {p.image || (isPhone ? '📱' : '📦')}
                      </span>
                      {out
                        ? <Tag variant="dang">Tugagan</Tag>
                        : low
                          ? <Tag variant="warn">Kam! · {p.stock}</Tag>
                          : <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{p.stock} dona</span>}
                    </div>

                    <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.25 }}>
                      {isPhone ? (p.phone_model || p.name) : p.name}
                    </div>
                    {sub && <div style={{ fontSize: 11.5, color: 'var(--color-neutral-400)' }}>{sub}</div>}
                    {serial && (
                      <div className="num" style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>
                        {p.phone_imei1 ? 'IMEI' : 'S/N'}: …{String(serial).slice(-8)}
                      </div>
                    )}
                    <div className="num" style={{ fontSize: 14.5, fontWeight: 500, marginTop: serial ? 2 : 'auto' }}>
                      {money(p.price)}
                    </div>

                    {inCart > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--color-accent)' }}>
                        Savatda: {inCart} dona
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── O'NG: savat ── */}
      <aside style={{
        width: 430, flex: 'none', display: 'flex', flexDirection: 'column',
        background: 'var(--color-surface)', minHeight: 0,
      }}>
        {/* Xaridor */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px', borderBottom: '1px solid var(--color-divider)',
        }}>
          <Icon name="user-circle" size={19} color="var(--color-neutral-400)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            {customer ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {customer.name}
                  {customer.type === 'dealer' && <Tag variant="accent" style={{ marginLeft: 5 }}>Diler</Tag>}
                </div>
                <div className="num" style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                  {customer.phone}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Xaridor tanlanmagan</div>
            )}
          </div>
          {customer && (
            <Btn variant="ghost" iconOnly icon="x" title="Xaridorni olib tashlash"
              onClick={() => setCustomer(null)} style={{ width: 28, height: 28 }} />
          )}
          <Btn variant="ghost" size="sm" onClick={() => setShowCustomers(true)}>
            {customer ? 'Almashtirish' : 'Tanlash'}
          </Btn>
        </div>

        {isDealer && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px',
            fontSize: 12, background: 'var(--infobg)', color: 'var(--info)',
          }}>
            <Icon name="info" fill size={15} />
            Diler rejimi — faqat Nasiya to‘lovi mavjud
          </div>
        )}

        {/* Savat ro'yxati */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
              Savat · {itemCount} dona
            </span>
            {items.length > 0 && (
              <Btn variant="ghost" size="sm" icon="trash" onClick={() => setShowClearConfirm(true)}
                style={{ color: 'var(--dang)' }}>
                Tozalash
              </Btn>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState icon="shopping-cart" text="Savat bo‘sh" sub="Chapdan mahsulot tanlang yoki barcode skanerlang" />
          ) : items.map(item => {
            const disc = Number(item.itemDiscount) || 0;
            const net = item.price - disc;
            return (
              <div key={item.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--color-divider)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 19 }}>{item.image || (isPhone ? '📱' : '📦')}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {isPhone ? (item.phone_model || item.name) : item.name}
                      {isPhone && item.phone_memory ? ` ${item.phone_memory}` : ''}
                    </div>
                    <div className="num" style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                      {disc > 0 ? (
                        <>
                          <s>{money(item.price)}</s> → {money(net)}{' '}
                          <span style={{ color: 'var(--warn)' }}>(−{money(disc)} / dona)</span>
                        </>
                      ) : (
                        <>{money(item.price)} / dona{item.stock <= 5 && <span style={{ color: 'var(--warn)' }}> · omborda {item.stock} ta</span>}</>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Btn variant="secondary" iconOnly icon="minus" onClick={() => changeQty(item.id, -1)}
                      style={{ width: 26, height: 26 }} />
                    <span className="num" style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{item.qty}</span>
                    <Btn variant="secondary" iconOnly icon="plus" onClick={() => changeQty(item.id, 1)}
                      style={{ width: 26, height: 26 }} />
                  </div>

                  <div className="num" style={{ fontSize: 13, fontWeight: 500, width: 82, textAlign: 'right' }}>
                    {money(net * item.qty)}
                  </div>
                </div>

                {/* Dona uchun chegirma */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, paddingLeft: 29 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Chegirma / dona</span>
                  <input
                    className="input num"
                    inputMode="numeric"
                    value={formatInput(item.itemDiscount)}
                    onChange={e => setItemDiscount(item.id, e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    style={{ width: 110, minHeight: 28, padding: '2px 8px', fontSize: 12 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Yakuniy panel */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--color-divider)',
          display: 'flex', flexDirection: 'column', gap: 11,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>Umumiy chegirma</span>
            <Seg options={DISCOUNTS} value={discount} onChange={setDiscount} style={{ fontSize: 12 }} />
          </div>

          <div className="num" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5 }}>
            <Row label="Oraliq jami" value={money(subtotal)} />
            {itemsDiscount > 0 && <Row label="Mahsulot chegirmalari" value={`−${money(itemsDiscount)}`} />}
            {globalDiscount > 0 && <Row label={`Umumiy chegirma (${discount}%)`} value={`−${money(globalDiscount)}`} />}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 16, fontWeight: 500, color: 'var(--color-text)',
              paddingTop: 4, borderTop: '1px dashed var(--color-divider)',
            }}>
              <span>Jami</span><span>{money(total)} so‘m</span>
            </div>
          </div>

          {/* To'lov turi */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
            {PAY_METHODS.map(pm => {
              const sel = payMethod === pm.id;
              const dis = isDealer && pm.id !== 'nasiya';
              return (
                <button
                  key={pm.id}
                  disabled={dis}
                  title={dis ? 'Diler rejimida faqat Nasiya' : pm.label}
                  onClick={() => { setPayMethod(pm.id); setPaidAmount(''); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '9px 4px', borderRadius: 8, font: 'inherit',
                    border: `1px solid ${sel ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                    background: sel ? 'var(--color-accent-900)' : 'transparent',
                    opacity: dis ? 0.35 : 1,
                    cursor: dis ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Icon name={pm.icon} size={17} color={sel ? 'var(--color-accent)' : 'var(--color-neutral-400)'} />
                  <span style={{ fontSize: 11.5, color: sel ? 'var(--color-text)' : 'var(--color-neutral-400)' }}>
                    {pm.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Nasiya tafsilotlari */}
          {payMethod === 'nasiya' && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 9, padding: 11, borderRadius: 9,
              background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                <div className="field">
                  <label style={{ fontSize: 11 }}>Boshlang‘ich to‘lov</label>
                  <input
                    className="input num" inputMode="numeric" placeholder="0"
                    value={formatInput(paidAmount)}
                    onChange={e => setPaidAmount(e.target.value.replace(/\D/g, ''))}
                    style={{ fontSize: 13 }}
                  />
                </div>
                <div className="field">
                  <label style={{ fontSize: 11 }}>Nasiya muddati (kun)</label>
                  <input
                    className="input num" inputMode="numeric" placeholder="30"
                    value={dueDays}
                    onChange={e => setDueDays(e.target.value.replace(/\D/g, ''))}
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 11px', borderRadius: 8, background: 'var(--warnbg)',
              }}>
                <span style={{ fontSize: 12.5, color: 'var(--warn)' }}>Qolgan qarz</span>
                <span className="num" style={{ fontSize: 17, fontWeight: 600, color: 'var(--warn)' }}>
                  {money(remainingDebt)} so‘m
                </span>
              </div>
            </div>
          )}

          <Btn
            variant="primary" icon="check-circle" block
            disabled={items.length === 0} loading={saving}
            onClick={checkout}
            style={{ minHeight: 48, fontSize: 15 }}
          >
            {saving ? 'Saqlanmoqda…' : `Sotuvni Yakunlash — ${money(total)} so‘m`}
          </Btn>

          <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)', textAlign: 'center' }}>
            Yakunlangach: ombor kamayadi · nasiya bo‘lsa qarz ochiladi · chek yangi oynada chop etiladi
          </div>
        </div>
      </aside>

      {/* ── Xaridor tanlash ── */}
      {showCustomers && (
        <Modal title="Xaridorni tanlash" onClose={() => setShowCustomers(false)}>
          <input
            className="input" autoFocus placeholder="Ism yoki telefon…"
            value={custSearch} onChange={e => setCustSearch(e.target.value)}
            style={{ marginBottom: 'var(--space-3)' }}
          />
          <div style={{ maxHeight: 320, overflowY: 'auto', margin: '0 calc(-1 * var(--space-6))' }}>
            {filteredCustomers.length === 0 ? (
              <EmptyState icon="users-three" text="Mijoz topilmadi" sub="CRM bo‘limidan yangi mijoz qo‘shing" />
            ) : filteredCustomers.map(c => {
              const sel = customer?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => { setCustomer(c); setShowCustomers(false); setCustSearch(''); }}
                  className="row-link"
                  style={{
                    borderRadius: 0, gap: 11, padding: '11px var(--space-6)',
                    background: sel ? 'var(--color-accent-900)' : 'transparent',
                  }}
                >
                  <Avatar initials={initialsOf(c.name)} size={34}
                    color={c.type === 'dealer' ? undefined : 'var(--color-neutral-800)'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {c.shop_name ? `"${c.shop_name}" — ${c.name}` : c.name}
                    </div>
                    <div className="num" style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{c.phone}</div>
                  </div>
                  {c.type === 'dealer' && <Tag variant="accent">Diler</Tag>}
                  {sel && <Icon name="check-circle" fill size={17} color="var(--color-accent)" />}
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* ── Savatni tozalash tasdig'i ── */}
      {showClearConfirm && (
        <Modal onClose={() => setShowClearConfirm(false)}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
            <Icon name="warning" fill size={20} color="var(--warn)" />
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>Savatni tozalash?</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', marginTop: 3 }}>
                Savatdagi {itemCount} ta mahsulot olib tashlanadi. Bu amalni qaytarib bo‘lmaydi.
              </div>
            </div>
          </div>
          <div className="dialog-actions">
            <Btn variant="secondary" onClick={() => setShowClearConfirm(false)}>Bekor qilish</Btn>
            <Btn variant="danger" onClick={clearCart}>Tozalash</Btn>
          </div>
        </Modal>
      )}

      {/* ── Muvaffaqiyatli sotuv ── */}
      {success && (
        <Modal onClose={startNewSale}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--okbg)', display: 'grid', placeItems: 'center',
            }}>
              <Icon name="check-circle" fill size={30} color="var(--ok)" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Sotuv yakunlandi</div>
            <div className="num" style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>
              Chek #{success.receiptNo} · {money(success.total)} so‘m · {success.payLabel}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
              {success.offline
                ? 'Internet yo‘q — sotuv xotiraga saqlandi, ulanganda yuboriladi'
                : success.printed
                  ? 'Chek yangi oynada ochildi · ombor yangilandi'
                  : 'Ombor yangilandi · chekni chop etish uchun pop-up oynalarga ruxsat bering'}
            </div>
            <div style={{ display: 'flex', gap: 9, marginTop: 5 }}>
              <Btn variant="secondary" icon="printer" onClick={() => printReceipt({
                items, subtotal, discount: discountTotal, total, paidAmount,
                payMethod, receiptNo: success.receiptNo, cashier: user?.name,
                customer, storeName: user?.storeName, isPhone,
              })}>
                Qayta chop etish
              </Btn>
              <Btn variant="primary" icon="plus" onClick={startNewSale}>Yangi sotuv</Btn>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-neutral-400)' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
