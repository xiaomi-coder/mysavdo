import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Barcode from 'react-barcode';
import {
  Page, PageHeader, Card, Icon, Btn, Tag, Seg, Modal, Field,
  EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import PhotoField from '../components/PhotoField';
import { imageUrl } from '../utils/upload';
import { stockStatus } from '../utils/stock';
import StockHistory from '../components/StockHistory';

/* ── doimiylar ─────────────────────────────────────────────────────────── */

const PHONE_BRANDS = ['Samsung', 'iPhone', 'Xiaomi/Redmi', 'Honor', 'Infinix',
  'Tecno', 'ZTE', 'Realme', 'OPPO', 'Vivo', 'Aksesuar', 'Boshqa'];
const MEMORIES = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
const CONDITIONS = [
  { value: 'Yangi', label: '✨ Yangi' },
  { value: 'B/U', label: '♻️ B/U' },
  { value: 'Refurbished', label: '🔧 Refurbished' },
];
const BRANCHES = ['Chilonzor', 'Yunusobod', "Qo'yliq"];
const EMOJIS = ['📦', '📱', '🎧', '🔌', '⌚', '💻', '🖥️', '⌨️', '🔗', '🥤', '🍪', '🧋'];

const TABS = [
  { id: 'list', label: 'Ombor', icon: 'package' },
  { id: 'transfer', label: "Filiallarga Ko'chirish", icon: 'truck' },
  { id: 'audit', label: 'Inventarizatsiya', icon: 'clipboard-text' },
];

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');
const formatInput = v => {
  const d = String(v ?? '').replace(/\D/g, '');
  return d ? Number(d).toLocaleString('ru-RU') : '';
};

/* Qoldiq holati umumiy qoidadan olinadi — sidebar badge'i va
   Dashboard ogohlantirishlari ham aynan shu qoidani ishlatadi. */
const statusOf = stockStatus;

/* ══════════════════════════════════════════════════════════════════════════
   Ombor
   ══════════════════════════════════════════════════════════════════════ */

export default function Inventory() {
  const { user, refreshAlerts } = useAuth();
  const isPhoneStore = user?.storeType === 'phone';

  const [tab, setTab] = useState('list');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showAdd, setShowAdd] = useState(false);
  const [editFor, setEditFor] = useState(null);
  const [kirimFor, setKirimFor] = useState(null);
  const [printFor, setPrintFor] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);

  const notify = (msg, variant = 'ok') => setToast({ msg, variant });

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').eq('store_id', storeId).order('id', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  /* Tovarni onlayn katalogda ko'rsatish yoki yashirish */
  const toggleOnline = async (p) => {
    const next = p.is_online === false;
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_online: next } : x));
    const { error } = await supabase.from('products').update({ is_online: next }).eq('id', p.id);
    if (error) {
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_online: !next } : x));
      notify(`O‘zgartirilmadi: ${error.message}`, 'dang');
    }
  };

  /* ── statistika va filtrlar ── */
  const stats = useMemo(() => {
    const s = { all: products.length, ok: 0, low: 0, out: 0 };
    products.forEach(p => { s[statusOf(p).key]++; });
    return s;
  }, [products]);

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category || p.cat).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (catFilter !== 'all' && (p.category || p.cat) !== catFilter) return false;
      if (statusFilter !== 'all' && statusOf(p).key !== statusFilter) return false;
      if (!q) return true;
      return [p.name, p.barcode, p.phone_imei1, p.phone_imei2, p.phone_serial, p.phone_model]
        .some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [products, search, catFilter, statusFilter]);

  return (
    <Page>
      <PageHeader title="Ombor" subtitle="Tovarlar va qoldiq boshqaruvi">
        <Btn variant="secondary" icon="file-xls" disabled title="Excel eksport — tez orada">Excel</Btn>
        <Btn variant="primary" icon="plus" onClick={() => setShowAdd(true)}>Tovar Qo‘shish</Btn>
      </PageHeader>

      {/* Tablar */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--color-divider)' }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 14px', border: 0, background: 'none', cursor: 'pointer',
                font: 'inherit', fontSize: 13, fontWeight: active ? 500 : 400,
                color: active ? 'var(--color-accent)' : 'var(--color-neutral-500)',
                boxShadow: active ? 'inset 0 -2px 0 var(--color-accent)' : 'none',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <Icon name={t.icon} size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'list' && (
        <>
          {/* Statistika — bosilganda filtr bo'ladi */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            <StatTile label="Jami" value={stats.all} unit="tovar" icon="squares-four" color="var(--color-accent)"
              active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
            <StatTile label="Normal" value={stats.ok} icon="check-circle" color="var(--ok)"
              active={statusFilter === 'ok'} onClick={() => setStatusFilter('ok')} />
            <StatTile label="Kam qoldiq" value={stats.low} icon="warning" color="var(--warn)" valueColor="var(--warn)"
              active={statusFilter === 'low'} onClick={() => setStatusFilter('low')} />
            <StatTile label="Tugagan" value={stats.out} icon="warning-circle" color="var(--dang)" valueColor="var(--dang)"
              active={statusFilter === 'out'} onClick={() => setStatusFilter('out')} />
          </div>

          {/* Qidiruv va filtrlar */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="input-icon" style={{ flex: 1 }}>
              <Icon name="magnifying-glass" />
              <input className="input" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={isPhoneStore ? 'Nom, barcode yoki IMEI…' : 'Nom yoki barcode…'} />
            </div>
            <select className="input" style={{ width: 190 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="all">Barcha kategoriyalar</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Barcha holat</option>
              <option value="ok">Normal</option>
              <option value="low">Kam qoldiq</option>
              <option value="out">Tugagan</option>
            </select>
          </div>

          {/* Jadval */}
          <Card padding="var(--space-6)">
            {loading ? <SkeletonRows count={6} widths={['100%']} />
              : filtered.length === 0 ? (
                <EmptyState
                  icon="package"
                  text={products.length === 0 ? 'Omborda tovar yo‘q' : 'Hech narsa topilmadi'}
                  sub={products.length === 0 ? 'Birinchi tovarni qo‘shing' : 'Qidiruv yoki filtrlarni o‘zgartiring'}
                  action={products.length === 0
                    ? <Btn variant="primary" size="sm" icon="plus" onClick={() => setShowAdd(true)}>Tovar Qo‘shish</Btn>
                    : null}
                />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Tovar</th><th>Kategoriya</th><th>Onlayn</th><th>Barcode / IMEI</th>
                        <th style={{ textAlign: 'right' }}>Sotuv narxi</th>
                        <th style={{ textAlign: 'right' }}>Qoldiq</th>
                        <th style={{ textAlign: 'right' }}>Min.</th>
                        <th>Holat</th><th />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => {
                        const st = statusOf(p);
                        const code = p.phone_imei1
                          ? `IMEI …${String(p.phone_imei1).slice(-8)}`
                          : (p.barcode || p.phone_serial || '—');
                        const sub = isPhoneStore && p.phone_condition
                          ? CONDITIONS.find(c => c.value === p.phone_condition)?.label
                          : [p.phone_memory, p.phone_color].filter(Boolean).join(' · ');
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                {p.photo_url ? (
                                  <img
                                    src={imageUrl(p.photo_url)} alt=""
                                    style={{
                                      width: 30, height: 30, flex: 'none', objectFit: 'cover',
                                      borderRadius: 6, border: '1px solid var(--color-divider)',
                                      filter: st.key === 'out' ? 'grayscale(1)' : 'none',
                                    }}
                                  />
                                ) : (
                                  <span style={{
                                    width: 30, height: 30, flex: 'none', display: 'grid', placeItems: 'center',
                                    fontSize: 16, borderRadius: 6,
                                    background: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                                    filter: st.key === 'out' ? 'grayscale(1)' : 'none',
                                  }}>
                                    {p.image || '📦'}
                                  </span>
                                )}
                                <div>
                                  <div style={{ fontWeight: 500, color: st.key === 'out' ? 'var(--color-neutral-400)' : undefined }}>
                                    {p.name}
                                  </div>
                                  {sub && <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{sub}</div>}
                                </div>
                              </div>
                            </td>
                            <td>{p.category || p.cat || '—'}</td>
                            <td>
                              <OnlineToggle
                                on={p.is_online !== false}
                                hasPhoto={Boolean(p.photo_url)}
                                onChange={() => toggleOnline(p)}
                              />
                            </td>
                            <td className="num" style={{ color: 'var(--color-neutral-400)' }}>{code}</td>
                            <td className="num" style={{ textAlign: 'right' }}>{money(p.price)}</td>
                            <td style={{ textAlign: 'right' }}>
                              {/* Qoldiq bosilsa — o'sha tovarning harakat tarixi */}
                              <button
                                onClick={() => setHistoryFor(p)}
                                title="Harakat tarixini ko‘rish"
                                className="num"
                                style={{
                                  background: 'none', border: 0, cursor: 'pointer', padding: '2px 4px',
                                  font: 'inherit', fontWeight: 600, borderRadius: 4,
                                  textDecoration: 'underline', textDecorationStyle: 'dotted',
                                  textUnderlineOffset: 3,
                                  color: st.key === 'out' ? 'var(--dang)' : st.key === 'low' ? 'var(--warn)' : 'var(--color-text)',
                                }}
                              >
                                {p.stock}
                              </button>
                            </td>
                            <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-500)' }}>
                              {p.minStock || '—'}
                            </td>
                            <td><Tag variant={st.variant} icon={st.icon}>{st.label}</Tag></td>
                            <td>
                              <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                                <Btn
                                  variant={st.key === 'out' ? 'primary' : 'secondary'} size="sm" icon="plus"
                                  onClick={() => setKirimFor(p)}
                                >
                                  Kirim
                                </Btn>
                                <Btn variant="ghost" iconOnly icon="pencil-simple" title="Tahrirlash"
                                  onClick={() => setEditFor(p)} style={{ width: 28, height: 28 }} />
                                <Btn variant="ghost" iconOnly icon="printer" title="Barcode chop etish"
                                  onClick={() => setPrintFor(p)} style={{ width: 28, height: 28 }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
        </>
      )}

      {tab === 'transfer' && (
        <TransferTab
          products={products} actor={user?.name}
          onDone={(msg) => { load(user.store_id); refreshAlerts(); notify(msg); }}
          onError={(m) => notify(m, 'dang')}
        />
      )}

      {tab === 'audit' && (
        <AuditTab
          products={products} actor={user?.name}
          onDone={(msg) => { load(user.store_id); refreshAlerts(); notify(msg); }}
          onError={(m) => notify(m, 'dang')}
        />
      )}

      {/* ── Modallar ── */}
      {(showAdd || editFor) && (
        <ProductModal
          storeId={user?.store_id}
          isPhoneStore={isPhoneStore}
          categories={categories}
          product={editFor}
          onClose={() => { setShowAdd(false); setEditFor(null); }}
          onSaved={(name) => {
            const wasEdit = Boolean(editFor);
            setShowAdd(false); setEditFor(null);
            load(user.store_id);
            refreshAlerts();
            notify(`"${name}" ${wasEdit ? 'yangilandi' : 'qo‘shildi'}`);
          }}
          onError={(m) => notify(m, 'dang')}
        />
      )}

      {kirimFor && (
        <KirimModal
          product={kirimFor}
          actor={user?.name}
          onClose={() => setKirimFor(null)}
          onSaved={(qty) => {
            setKirimFor(null);
            load(user.store_id);
            refreshAlerts();
            notify(`${kirimFor.name}: +${qty} dona kirim qilindi`);
          }}
          onError={(m) => notify(m, 'dang')}
        />
      )}

      {printFor && <BarcodeModal product={printFor} onClose={() => setPrintFor(null)} />}

      {historyFor && <StockHistory product={historyFor} onClose={() => setHistoryFor(null)} />}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

/* ── Statistika kartochkasi (filtr tugmasi) ────────────────────────────── */
function StatTile({ label, value, unit, icon, color, valueColor, active, onClick }) {
  return (
    <div
      className="card elev-sm" onClick={onClick}
      style={{
        padding: 14, gap: 5, cursor: 'pointer',
        boxShadow: active ? '0 0 0 1px var(--color-accent)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--color-neutral-400)' }}>
        <Icon name={icon} fill size={16} color={color} />
        {label}
      </div>
      <div className="num" style={{ fontSize: 22, fontWeight: 500, color: valueColor }}>
        {value}
        {unit && <span style={{ fontSize: 12, color: 'var(--color-neutral-500)', fontWeight: 400 }}> {unit}</span>}
      </div>
    </div>
  );
}

/* ── Kirim modali ──────────────────────────────────────────────────────── */
function KirimModal({ product, actor, onClose, onSaved, onError }) {
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const st = statusOf(product);
  const n = parseInt(qty, 10) || 0;

  const save = async () => {
    if (n <= 0) return;
    setSaving(true);
    // move_stock qoldiqni o'zgartiradi VA harakat tarixiga yozadi —
    // ikkalasi bitta tranzaksiyada, ya'ni ular hech qachon ajralmaydi
    const { error } = await supabase.rpc('move_stock', {
      p_product: product.id,
      p_qty: n,
      p_type: 'kirim',
      p_note: note.trim() || null,
      p_actor: actor || null,
    });
    setSaving(false);
    if (error) onError(`Kirim saqlanmadi: ${error.message}`);
    else onSaved(n);
  };

  return (
    <Modal title={`Kirim — ${product.name}`} onClose={onClose} actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" icon="check-circle" onClick={save} disabled={n <= 0} loading={saving}>
          Kirimni Tasdiqlash
        </Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--color-neutral-400)' }}>
          <span>Hozirgi qoldiq</span>
          <span className="num" style={{ color: `var(--${st.variant === 'ok' ? 'ok' : st.variant})`, fontWeight: 500 }}>
            {product.stock} ta · {st.label}
          </span>
        </div>

        <Field label="Miqdor">
          <input
            className="input num" autoFocus inputMode="numeric" value={qty}
            onChange={e => setQty(e.target.value.replace(/\D/g, ''))}
            style={{ borderColor: n > 0 ? 'var(--color-accent)' : undefined, fontSize: 15, fontWeight: 600 }}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[10, 25, 50, 100].map(v => (
            <Btn
              key={v}
              variant={n === v ? 'primary' : 'secondary'}
              onClick={() => setQty(String(v))}
              style={{ minHeight: 38, justifyContent: 'center', fontSize: 12 }}
            >
              +{v}
            </Btn>
          ))}
        </div>

        <Field label="Izoh">
          <input className="input" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Masalan: yetkazib beruvchi — Chilonzor baza" />
        </Field>

        {n > 0 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 13px', borderRadius: 9, background: 'var(--okbg)',
          }}>
            <span style={{ fontSize: 12.5, color: 'var(--ok)' }}>Kirimdan keyin</span>
            <span className="num" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ok)' }}>
              {product.stock + n} ta
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ── Barcode chop etish ────────────────────────────────────────────────── */
function BarcodeModal({ product, onClose }) {
  const [copies, setCopies] = useState('1');
  const previewRef = useRef(null);
  const code = product.barcode || product.phone_imei1 || String(product.id).padStart(10, '0');

  const print = () => {
    // Barkod SVG'ini ko'rinishdan olamiz — tashqi xizmatga bog'liq bo'lmaslik uchun
    const svg = previewRef.current?.querySelector('svg')?.outerHTML || '';
    const n = Math.min(50, Math.max(1, parseInt(copies, 10) || 1));
    const label = `
      <div class="label">
        <div class="name">${product.name}</div>
        ${svg}
        <div class="price">${money(product.price)} so'm</div>
      </div>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Barcode</title>
      <style>
        @page { margin: 0; }
        body { margin: 0; font-family: Arial, sans-serif; background: #fff; }
        .label { width: 40mm; height: 30mm; padding: 2mm; box-sizing: border-box;
                 display: flex; flex-direction: column; align-items: center;
                 justify-content: center; text-align: center; page-break-after: always; }
        .name { font-size: 9px; font-weight: bold; line-height: 1.15; margin-bottom: 1mm;
                max-height: 7mm; overflow: hidden; }
        .price { font-size: 11px; font-weight: bold; margin-top: 1mm; }
        svg { max-width: 100%; height: auto; }
      </style></head><body>
      ${label.repeat(n)}
      <script>setTimeout(function(){ window.print(); window.close(); }, 400);<\/script>
      </body></html>`);
    win.document.close();
  };

  return (
    <Modal title="Barcode chop etish" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'center' }}>
        <div
          ref={previewRef}
          style={{
            width: 240, minHeight: 180, borderRadius: 6, background: '#fdfdfb', color: '#1a1a1a',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: 14, boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ font: '600 12px Inter, sans-serif', textAlign: 'center', lineHeight: 1.25 }}>
            {product.name}
          </div>
          <Barcode value={code} width={1.6} height={46} fontSize={11} margin={0}
            background="#fdfdfb" lineColor="#1a1a1a" />
          <div style={{ font: '600 13px Inter, sans-serif' }}>{money(product.price)} so‘m</div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Stiker o‘lchami: 40 × 30 mm</div>

        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end', width: '100%' }}>
          <Field label="Nusxa soni" style={{ flex: 1 }}>
            <input className="input num" inputMode="numeric" value={copies}
              onChange={e => setCopies(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Btn variant="primary" icon="printer" onClick={print}>Chop Etish</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ── Tovar qo'shish ────────────────────────────────────────────────────── */
function ProductModal({ storeId, isPhoneStore, categories, product, onClose, onSaved, onError }) {
  const editing = Boolean(product);
  // Tahrirlashda rejim tovarning o'zidan aniqlanadi: IMEI bo'lsa telefon
  const [mode, setMode] = useState(
    editing ? (product.phone_model || product.phone_imei1 ? 'phone' : 'simple')
      : (isPhoneStore ? 'phone' : 'simple')
  );
  const [saving, setSaving] = useState(false);
  const scannerRef = useRef(null);

  const [f, setF] = useState({
    brand: product?.category || 'Samsung',
    model: product?.phone_model || '',
    memory: product?.phone_memory || '128GB',
    color: product?.phone_color || '',
    imei1: product?.phone_imei1 || '',
    imei2: product?.phone_imei2 || '',
    serial: product?.phone_serial || '',
    condition: product?.phone_condition || 'Yangi',
    name: product?.name || '',
    barcode: product?.barcode || '',
    category: product?.category || '',
    emoji: product?.image || '📦',
    stock: product?.stock != null ? String(product.stock) : '',
    minStock: product?.minStock ? String(product.minStock) : '',
    cost: product?.cost_price ? String(product.cost_price) : '',
    price: product?.price ? String(product.price) : '',
    photoUrl: product?.photo_url || '',
    description: product?.description || '',
    isOnline: product ? product.is_online !== false : true,
  });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const cost = Number(f.cost) || 0;
  const price = Number(f.price) || 0;
  const profit = price - cost;
  const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : 0;

  const valid = mode === 'phone'
    ? f.model && price > 0 && cost > 0
    : f.name && price > 0 && cost > 0;

  /* Smart skaner: 15 xonali → IMEI1 → IMEI2, boshqasi → S/N */
  const onScan = (e) => {
    if (e.key !== 'Enter') return;
    const raw = e.target.value.trim();
    if (!raw) return;
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 15) {
      if (!f.imei1) set('imei1', digits);
      else if (!f.imei2) set('imei2', digits);
    } else {
      set('serial', raw);
    }
    e.target.value = '';
  };

  const save = async () => {
    setSaving(true);
    const isPhoneItem = mode === 'phone';
    const name = isPhoneItem
      ? `${f.brand === 'Boshqa' ? '' : f.brand} ${f.model}`.trim()
      : f.name;

    const row = {
      store_id: storeId,
      name,
      barcode: f.barcode || '',
      category: isPhoneItem ? f.brand : (f.category || 'Boshqa'),
      cost_price: cost,
      price,
      // Telefon noyob IMEI bilan keladi — har biri 1 dona.
      // Tahrirlashda qoldiqqa tegmaymiz: u Kirim orqali boshqariladi.
      ...(editing ? {} : { stock: isPhoneItem ? 1 : (parseInt(f.stock, 10) || 0) }),
      minStock: parseInt(f.minStock, 10) || 0,
      image: isPhoneItem ? '📱' : f.emoji,
      photo_url: f.photoUrl || null,
      description: f.description.trim() || null,
      is_online: f.isOnline,
      ...(isPhoneItem ? {
        phone_model: f.model,
        phone_memory: f.memory,
        phone_color: f.color,
        phone_imei1: f.imei1,
        phone_imei2: f.imei2,
        phone_serial: f.serial,
        phone_condition: f.condition,
      } : {}),
    };

    const { error } = editing
      ? await supabase.from('products').update(row).eq('id', product.id)
      : await supabase.from('products').insert(row);

    setSaving(false);
    if (error) onError(`Saqlanmadi: ${error.message}`);
    else onSaved(name);
  };

  const chip = (active) => ({
    padding: '6px 12px', borderRadius: 14, border: 0, cursor: 'pointer', font: 'inherit',
    fontSize: 12, fontWeight: active ? 500 : 400,
    background: active ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 6%, transparent)',
    color: active ? 'var(--color-bg)' : 'var(--color-neutral-300)',
  });

  return (
    <Modal title={editing ? 'Tovarni tahrirlash' : 'Tovar Qo‘shish'} onClose={onClose} wide actions={
      <>
        <Btn variant="secondary" onClick={onClose}>Bekor qilish</Btn>
        <Btn variant="primary" icon="check" onClick={save} disabled={!valid} loading={saving}>Saqlash</Btn>
      </>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!editing && (
          <Seg
            style={{ width: '100%' }}
            options={[
              { value: 'phone', label: '📱 Telefon' },
              { value: 'simple', label: '📦 Oddiy / Aksessuar' },
            ]}
            value={mode}
            onChange={setMode}
          />
        )}

        {mode === 'phone' ? (
          <>
            <Step n={1} title="Brend va model">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PHONE_BRANDS.map(b => (
                  <button key={b} onClick={() => set('brand', b)} style={chip(f.brand === b)}>{b}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 9 }}>
                <Field label="Model">
                  <input className="input" value={f.model} onChange={e => set('model', e.target.value)}
                    placeholder="Galaxy S24 Ultra" />
                </Field>
                <Field label="Xotira">
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {MEMORIES.map(m => (
                      <button key={m} onClick={() => set('memory', m)} style={{
                        padding: '7px 9px', borderRadius: 7, cursor: 'pointer', font: 'inherit', fontSize: 11.5,
                        border: `1px solid ${f.memory === m ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                        background: f.memory === m ? 'var(--color-accent-900)' : 'transparent',
                        color: f.memory === m ? 'var(--color-accent-200)' : 'var(--color-neutral-400)',
                      }}>{m}</button>
                    ))}
                  </div>
                </Field>
              </div>
            </Step>

            <Step n={2} title="Texnik ma’lumot — Smart skaner">
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 9, minHeight: 44,
                  padding: '0 12px', borderRadius: 9,
                  border: '2px solid var(--color-accent)', background: 'var(--color-surface)',
                }}>
                  <Icon name="barcode" size={18} color="var(--color-accent)" />
                  <input
                    ref={scannerRef} autoFocus onKeyDown={onScan}
                    placeholder="Raqamni skanerlang — 15 xonali: IMEI-1 → IMEI-2, boshqa: S/N"
                    style={{ flex: 1, background: 'none', border: 0, outline: 'none', color: 'var(--color-text)', font: 'inherit', fontSize: 13 }}
                  />
                </div>
                <Btn variant="secondary" icon="arrows-clockwise" style={{ minHeight: 44 }}
                  onClick={() => setF(p => ({ ...p, imei1: '', imei2: '', serial: '' }))}>
                  Tozalash
                </Btn>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                <ImeiField label="IMEI 1" value={f.imei1} onChange={v => set('imei1', v)} />
                <ImeiField label="IMEI 2" value={f.imei2} onChange={v => set('imei2', v)} />
                <Field label="S/N">
                  <input className="input" value={f.serial} onChange={e => set('serial', e.target.value)}
                    placeholder="Seriya raqami" />
                </Field>
                <Field label="Rang">
                  <input className="input" value={f.color} onChange={e => set('color', e.target.value)}
                    placeholder="Black" />
                </Field>
              </div>
            </Step>

            <Step n={3} title="Holati">
              <Seg style={{ width: '100%' }} options={CONDITIONS} value={f.condition} onChange={v => set('condition', v)} />
            </Step>
          </>
        ) : (
          <Step n={1} title="Tovar ma’lumoti">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 9 }}>
              <Field label="Nomi">
                <input className="input" autoFocus value={f.name} onChange={e => set('name', e.target.value)}
                  placeholder="Silikon chexol" />
              </Field>
              <Field label="Belgi">
                <select className="input" value={f.emoji} onChange={e => set('emoji', e.target.value)}>
                  {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              <Field label="Barcode">
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="input mono" value={f.barcode} onChange={e => set('barcode', e.target.value)}
                    placeholder="4780 0031 2205" />
                  <Btn variant="secondary" iconOnly icon="dice-five" title="Tasodifiy barcode"
                    onClick={() => set('barcode', '200' + Math.floor(1e9 + Math.random() * 9e9))} />
                </div>
              </Field>
              <Field label="Kategoriya">
                <input className="input" list="cat-list" value={f.category}
                  onChange={e => set('category', e.target.value)} placeholder="Aksessuarlar" />
                <datalist id="cat-list">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <Field label="Boshlang‘ich qoldiq">
                <input className="input num" inputMode="numeric" value={f.stock}
                  onChange={e => set('stock', e.target.value.replace(/\D/g, ''))} placeholder="10" />
              </Field>
              <Field label="Minimal qoldiq" hint="Shu darajaga tushganda ogohlantiradi">
                <input className="input num" inputMode="numeric" value={f.minStock}
                  onChange={e => set('minStock', e.target.value.replace(/\D/g, ''))} placeholder="5" />
              </Field>
            </div>
          </Step>
        )}

        <Step n={mode === 'phone' ? 4 : 2} title="Narxlar">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <Field label="Tan narxi">
              <MoneyInput value={f.cost} onChange={v => set('cost', v)} />
            </Field>
            <Field label="Sotuv narxi">
              <MoneyInput value={f.price} onChange={v => set('price', v)} accent />
            </Field>
          </div>
          {price > 0 && cost > 0 && (
            <div style={{ fontSize: 11, color: profit >= 0 ? 'var(--ok)' : 'var(--dang)' }}>
              {profit >= 0 ? 'Foyda' : 'Zarar'}: {money(Math.abs(profit))} so‘m ({Math.abs(margin)}%)
            </div>
          )}
        </Step>

        <Step n={mode === 'phone' ? 5 : 3} title="Onlayn katalog">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px',
            borderRadius: 9, background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
          }}>
            <Icon name="globe" size={18} color="var(--color-accent)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>Onlayn do‘konda ko‘rsatilsin</div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                Mijozlarga yuboriladigan havolada shu tovar ko‘rinadi
              </div>
            </div>
            <span
              role="switch" aria-checked={f.isOnline}
              onClick={() => set('isOnline', !f.isOnline)}
              style={{
                width: 40, height: 23, borderRadius: 12, position: 'relative', flex: 'none',
                display: 'inline-block', cursor: 'pointer', transition: 'background .15s',
                background: f.isOnline ? 'var(--color-accent)' : 'var(--color-neutral-700)',
              }}
            >
              <span style={{
                position: 'absolute', top: 2, left: f.isOnline ? 19 : 2,
                width: 19, height: 19, borderRadius: '50%', transition: 'left .15s',
                background: f.isOnline ? 'var(--color-bg)' : 'var(--color-neutral-400)',
              }} />
            </span>
          </div>

          <PhotoField
            value={f.photoUrl}
            onChange={v => set('photoUrl', v)}
            hint="Rasmsiz tovar katalogda emoji bilan chiqadi — mijozga yaxshi ko‘rinmaydi"
          />

          <Field label="Tavsif" hint="Mijoz katalogda ko‘radi — ixtiyoriy">
            <textarea
              className="input" rows={2} value={f.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Masalan: original, kafolat 1 yil, quti va zaryadlovchi bilan"
            />
          </Field>
        </Step>
      </div>
    </Modal>
  );
}

function Step({ n, title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%', background: 'var(--color-accent)',
          color: 'var(--color-bg)', display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 600, flex: 'none',
        }}>{n}</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ImeiField({ label, value, onChange }) {
  const filled = value?.length === 15;
  return (
    <Field label={
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <Icon name="shield-check" size={12} color={filled ? 'var(--info)' : 'var(--color-neutral-600)'} />
        {label}
      </span>
    }>
      <input
        className="input num" value={value} maxLength={15}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 15))}
        placeholder="15 xonali raqam"
        style={{ background: filled ? 'oklch(0.33 0.06 240 / 0.12)' : undefined }}
      />
    </Field>
  );
}

function MoneyInput({ value, onChange, accent }) {
  return (
    <div className="input" style={{
      display: 'flex', alignItems: 'center',
      borderColor: accent ? 'var(--color-accent)' : undefined,
      padding: 0, paddingInline: 10,
    }}>
      <input
        className="num" inputMode="numeric" value={formatInput(value)}
        onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
        placeholder="0"
        style={{
          flex: 1, background: 'none', border: 0, outline: 'none', color: 'inherit',
          font: 'inherit', fontSize: accent ? 15 : 14, fontWeight: accent ? 600 : 400,
          padding: '6px 0',
        }}
      />
      <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>so‘m</span>
    </div>
  );
}

/* ── Filiallarga ko'chirish ────────────────────────────────────────────── */
function TransferTab({ products, actor, onDone, onError }) {
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('');
  const [saving, setSaving] = useState(false);

  const product = products.find(p => String(p.id) === productId);
  const n = parseInt(qty, 10) || 0;
  const valid = product && n > 0 && n <= product.stock;

  const apply = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('move_stock', {
      p_product: product.id,
      p_qty: -n,
      p_type: 'kochirish',
      p_note: `${branch} filialiga`,
      p_actor: actor || null,
    });
    setSaving(false);
    if (error) return onError(`Ko‘chirilmadi: ${error.message}`);
    setProductId(''); setQty('');
    onDone(`${branch} filialiga ${n} dona "${product.name}" ko‘chirildi`);
  };

  return (
    <Card padding="var(--space-6)" gap={13} style={{ maxWidth: 620 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="truck" size={18} color="var(--color-accent)" />
        <span style={{ fontSize: 15, fontWeight: 500 }}>Filiallarga Ko‘chirish</span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 13, borderRadius: 10,
        background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', textAlign: 'center' }}>
          <Icon name="storefront" fill size={20} color="var(--color-accent)" />
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Asosiy do‘kon</span>
          <span style={{ fontSize: 10.5, color: 'var(--color-neutral-500)' }}>Manba</span>
        </div>
        <Icon name="arrow-right" size={20} color="var(--color-neutral-500)" />
        <div style={{ flex: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 10.5, color: 'var(--color-neutral-500)', textAlign: 'center' }}>Qaysi filialga?</span>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {BRANCHES.map(b => (
              <button key={b} onClick={() => setBranch(b)} style={{
                padding: '7px 13px', borderRadius: 14, border: 0, cursor: 'pointer', font: 'inherit',
                fontSize: 12, fontWeight: branch === b ? 500 : 400,
                background: branch === b ? 'var(--color-accent)' : 'color-mix(in srgb, var(--color-text) 6%, transparent)',
                color: branch === b ? 'var(--color-bg)' : 'var(--color-neutral-300)',
              }}>{b}</button>
            ))}
          </div>
        </div>
      </div>

      <Field label="Tovar">
        <select className="input" value={productId} onChange={e => { setProductId(e.target.value); setQty(''); }}>
          <option value="">Tovarni tanlang…</option>
          {products.filter(p => p.stock > 0).map(p => (
            <option key={p.id} value={p.id}>{p.name} — qoldiq: {p.stock}</option>
          ))}
        </select>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 9, alignItems: 'end' }}>
        <Field label="Miqdor">
          <input className="input num" inputMode="numeric" value={qty} disabled={!product}
            onChange={e => setQty(e.target.value.replace(/\D/g, ''))}
            style={{ fontWeight: 600, borderColor: valid ? 'var(--color-accent)' : undefined }} />
        </Field>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', paddingBottom: 9 }}>
          {product && n > 0 && (
            n > product.stock
              ? <span style={{ color: 'var(--dang)' }}>Omborda faqat {product.stock} dona bor</span>
              : <>Ko‘chirishdan keyin asosiy do‘konda: <b style={{ color: 'var(--color-text)', fontWeight: 500 }}>{product.stock - n} ta</b>
                {' · '}{branch}da: <b style={{ color: 'var(--color-text)', fontWeight: 500 }}>+{n}</b></>
          )}
        </div>
      </div>

      <Btn variant="primary" icon="truck" block disabled={!valid} loading={saving}
        onClick={apply} style={{ minHeight: 44 }}>
        Ko‘chirishni Tasdiqlash
      </Btn>

      <div style={{
        display: 'flex', gap: 9, alignItems: 'flex-start',
        padding: '10px 12px', borderRadius: 8,
        background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
      }}>
        <Icon name="info" size={14} color="var(--color-neutral-500)" style={{ marginTop: 1 }} />
        <span style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', lineHeight: 1.45 }}>
          Ko‘chirish asosiy do‘kon qoldig‘idan yechiladi va harakat tarixiga
          yoziladi. Filialning o‘z ombori hozircha alohida yuritilmaydi.
        </span>
      </div>
    </Card>
  );
}

/* ── Inventarizatsiya ──────────────────────────────────────────────────── */
function AuditTab({ products, actor, onDone, onError }) {
  const [counts, setCounts] = useState({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? products.filter(p => String(p.name || '').toLowerCase().includes(q)) : products;
  }, [products, search]);

  const totals = useMemo(() => {
    let shortQty = 0, shortVal = 0, overQty = 0, overVal = 0, counted = 0;
    products.forEach(p => {
      const c = counts[p.id];
      if (c === undefined || c === '') return;
      counted++;
      const diff = Number(c) - p.stock;
      const val = diff * (Number(p.cost_price) || 0);
      if (diff < 0) { shortQty += diff; shortVal += val; }
      else if (diff > 0) { overQty += diff; overVal += val; }
    });
    return { shortQty, shortVal, overQty, overVal, counted };
  }, [products, counts]);

  const save = async () => {
    setSaving(true);

    // Har bir farq alohida yozuv bo'ladi — keyin qaysi tovarda qancha
    // kamomad chiqqani tarixdan ko'rinadi
    const changes = products
      .map(p => ({ p, c: counts[p.id] }))
      .filter(({ p, c }) => c !== undefined && c !== '' && Number(c) !== p.stock);

    const results = await Promise.all(changes.map(({ p, c }) =>
      supabase.rpc('move_stock', {
        p_product: p.id,
        p_qty: Number(c) - p.stock,
        p_type: 'taftish',
        p_note: `Sanaldi: ${c}, tizimda: ${p.stock}`,
        p_actor: actor || null,
      })
    ));

    setSaving(false);
    const failed = results.filter(r => r.error);
    if (failed.length > 0) {
      return onError(`${failed.length} ta tovar yangilanmadi: ${failed[0].error.message}`);
    }
    setCounts({});
    onDone(`Taftish saqlandi: ${changes.length} ta tovar yangilandi`);
  };

  return (
    <Card padding="var(--space-6)" gap={13}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="clipboard-text" size={18} color="var(--color-accent)" />
        <span style={{ fontSize: 15, fontWeight: 500 }}>Inventarizatsiya</span>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
          {new Date().toLocaleDateString('ru-RU')} · {totals.counted}/{products.length} tovar sanaldi
        </span>
      </div>

      <div className="input-icon" style={{ maxWidth: 280 }}>
        <Icon name="magnifying-glass" />
        <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tovar qidirish…" />
      </div>

      {products.length === 0 ? (
        <EmptyState icon="clipboard-text" text="Sanaladigan tovar yo‘q" />
      ) : (
        <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
          <table className="table" style={{ fontSize: 12.5 }}>
            <thead>
              <tr>
                <th>Tovar</th>
                <th style={{ textAlign: 'right' }}>Tizimda</th>
                <th style={{ textAlign: 'right' }}>Sanaldi</th>
                <th style={{ textAlign: 'right' }}>Farq</th>
                <th style={{ textAlign: 'right' }}>Qiymat farqi</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(p => {
                const c = counts[p.id];
                const has = c !== undefined && c !== '';
                const diff = has ? Number(c) - p.stock : 0;
                const val = diff * (Number(p.cost_price) || 0);
                const color = !has || diff === 0 ? 'var(--color-neutral-500)' : diff < 0 ? 'var(--dang)' : 'var(--ok)';
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-400)' }}>{p.stock}</td>
                    <td style={{ textAlign: 'right' }}>
                      <input
                        className="input num" inputMode="numeric" value={c ?? ''}
                        onChange={e => setCounts(prev => ({ ...prev, [p.id]: e.target.value.replace(/\D/g, '') }))}
                        placeholder={String(p.stock)}
                        style={{ width: 64, minHeight: 28, padding: '4px 8px', textAlign: 'right', display: 'inline-block' }}
                      />
                    </td>
                    <td className="num" style={{ textAlign: 'right', fontWeight: has && diff !== 0 ? 600 : 400, color }}>
                      {has ? (diff > 0 ? `+${diff}` : diff) : '—'}
                    </td>
                    <td className="num" style={{ textAlign: 'right', color }}>
                      {has && diff !== 0 ? `${val > 0 ? '+' : '−'}${money(Math.abs(val))}` : has ? '0' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totals.counted > 0 && (
        <div style={{ display: 'flex', gap: 12 }}>
          <SummaryBox label="Kamomad" variant="dang"
            value={`${totals.shortQty} dona · ${money(totals.shortVal)}`} />
          <SummaryBox label="Ortiqcha" variant="ok"
            value={`+${totals.overQty} dona · +${money(totals.overVal)}`} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Btn variant="primary" icon="floppy-disk" onClick={save} loading={saving}
          disabled={totals.counted === 0}>Saqlash</Btn>
        <span style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="info" size={13} />
          Har bir farq harakat tarixiga sabab bilan yoziladi.
        </span>
      </div>
    </Card>
  );
}

function SummaryBox({ label, value, variant }) {
  return (
    <div style={{
      flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 13px', borderRadius: 9, background: `var(--${variant}bg)`,
    }}>
      <span style={{ fontSize: 12, color: `var(--${variant})` }}>{label}</span>
      <span className="num" style={{ fontSize: 14, fontWeight: 600, color: `var(--${variant})` }}>{value}</span>
    </div>
  );
}



/* ── Onlayn katalogda ko'rinish tugmasi ─────────────────────────── */
function OnlineToggle({ on, hasPhoto, onChange }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <span
        role="switch" aria-checked={on} onClick={onChange}
        title={on ? 'Onlayn katalogda ko‘rinadi' : 'Katalogda yashirilgan'}
        style={{
          width: 32, height: 19, borderRadius: 10, position: 'relative', flex: 'none',
          display: 'inline-block', cursor: 'pointer', transition: 'background .15s',
          background: on ? 'var(--color-accent)' : 'var(--color-neutral-700)',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: on ? 15 : 2,
          width: 15, height: 15, borderRadius: '50%', transition: 'left .15s',
          background: on ? 'var(--color-bg)' : 'var(--color-neutral-400)',
        }} />
      </span>
      {on && !hasPhoto && (
        <Icon name="image" size={13} color="var(--warn)" title="Rasm qo‘shilmagan" />
      )}
    </span>
  );
}
