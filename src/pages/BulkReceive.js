import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Page, PageHeader, Card, Icon, Btn, Field, StatCard,
  EmptyState, SkeletonRows, Toast,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   Ommaviy kirim

   Yuk kelganda o'nlab tovarni bittalab ochib "Kirim" qilish uzoq.
   Bu yerda hammasi bitta ro'yxatda yig'iladi va bir tugma bilan
   saqlanadi.

   Kompyuterda skaner yo'q deb o'ylamang: USB barcode skaner klaviatura
   kabi ishlaydi va kodni tez yozib, oxirida Enter bosadi. Shuni
   payqash uchun qidiruv maydoniga tez yozilgan uzun kod alohida
   qaraladi — do'konchi hech narsa sozlamaydi, shunchaki skanerlaydi.

   Har tovar `move_stock` orqali o'tadi — sverkada har biri o'z
   yozuviga ega bo'ladi. Bittasi xato bo'lsa qolganlari saqlanaveradi:
   yuk qabul qilishning yarmida to'xtab qolish eng yomon holat.
   ══════════════════════════════════════════════════════════════════════ */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

export default function BulkReceive() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [lines, setLines] = useState([]);        // [{ id, qty }]
  const [q, setQ] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [paid, setPaid] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [toast, setToast] = useState(null);

  const searchRef = useRef(null);
  const typedAt = useRef(0);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const [p, s] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', storeId).order('name'),
      supabase.from('suppliers').select('id, name').eq('store_id', storeId)
        .eq('is_active', true).order('name'),
    ]);
    setProducts(p.data || []);
    setSuppliers(s.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user?.store_id) load(user.store_id);
  }, [user, load]);

  useEffect(() => { searchRef.current?.focus(); }, [loading]);

  const byId = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  const addLine = useCallback((id) => {
    setLines(l => {
      const i = l.findIndex(x => x.id === id);
      if (i >= 0) {
        const next = [...l];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [{ id, qty: 1 }, ...l];
    });
    setQ('');
  }, []);

  /* USB skaner: kodni juda tez yozadi va Enter bosadi. Qo'lda
     yozilgan matndan shu bilan ajraladi. */
  const onSearchKey = (e) => {
    if (e.key !== 'Enter') { typedAt.current = typedAt.current || Date.now(); return; }
    const code = q.trim();
    typedAt.current = 0;
    if (!code) return;

    const p = products.find(x =>
      x.barcode === code || x.phone_imei1 === code || x.phone_serial === code);

    if (p) { addLine(p.id); return; }
    if (found.length === 1) { addLine(found[0].id); return; }
    setToast({ msg: `"${code}" bo‘yicha tovar topilmadi`, variant: 'warn' });
  };

  const found = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(s) ||
      (p.barcode || '').includes(s) ||
      (p.phone_imei1 || '').includes(s)
    ).slice(0, 8);
  }, [q, products]);

  const setQty = (id, qty) => setLines(l => (qty <= 0
    ? l.filter(x => x.id !== id)
    : l.map(x => (x.id === id ? { ...x, qty } : x))));

  const totalQty = lines.reduce((s, x) => s + x.qty, 0);
  const totalCost = lines.reduce(
    (s, x) => s + (Number(byId.get(x.id)?.cost_price) || 0) * x.qty, 0);

  const save = async () => {
    if (lines.length === 0) return;
    setSaving(true);

    let ok = 0;
    const failed = [];

    for (const line of lines) {
      const p = byId.get(line.id);
      if (!p) continue;
      const { error } = await supabase.rpc('move_stock', {
        p_product: p.id,
        p_qty: line.qty,
        p_type: 'kirim',
        p_note: 'Ommaviy kirim',
        p_actor: user?.name,
        p_txn: null,
      });
      if (error) { failed.push({ name: p.name, message: error.message }); continue; }
      ok++;
    }

    if (supplierId && ok > 0) {
      await supabase.from('purchases').insert({
        store_id: user.store_id,
        supplier_id: Number(supplierId),
        items: lines.map(l => {
          const p = byId.get(l.id);
          return { id: l.id, name: p?.name, qty: l.qty, cost: Number(p?.cost_price) || 0 };
        }),
        total: totalCost,
        paid: parseInt(paid, 10) || 0,
        actor: user?.name,
      });
    }

    setSaving(false);
    setDone({ ok, failed, qty: totalQty });
    load(user.store_id);
  };

  if (loading) {
    return (
      <Page>
        <PageHeader title="Ommaviy kirim" subtitle="Yuk qabul qilish" />
        <SkeletonRows count={4} widths={['100%']} />
      </Page>
    );
  }

  if (done) {
    return (
      <Page>
        <PageHeader title="Kirim yakunlandi" subtitle="Ombor yangilandi" />
        <Card padding="var(--space-8)" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Icon name={done.failed.length ? 'warning' : 'check-circle'} fill size={44}
            color={done.failed.length ? 'var(--warn)' : 'var(--ok)'} />
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 10 }}>
            {done.ok} ta tovar kirim qilindi
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 4 }}>
            Jami {done.qty} dona
          </div>
        </Card>

        {done.failed.length > 0 && (
          <Card padding="var(--space-6)" style={{ borderColor: 'var(--dang)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--dang)' }}>
              {done.failed.length} tasida xato bo‘ldi
            </div>
            {done.failed.map((x, i) => (
              <div key={i} style={{ fontSize: 12.5, color: 'var(--color-neutral-400)', marginTop: 6 }}>
                {x.name} — {x.message}
              </div>
            ))}
            <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', marginTop: 8 }}>
              Qolganlari saqlandi. Bularni alohida kirim qilib ko‘ring.
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="primary" icon="plus"
            onClick={() => { setLines([]); setDone(null); setPaid(''); setSupplierId(''); }}>
            Yana kirim qilish
          </Btn>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="Ommaviy kirim"
        subtitle="Skanerlang yoki nom bilan qidiring — hammasi bitta ro‘yxatga yig‘iladi" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <StatCard label="Xil tovar" value={lines.length} unit="ta" icon="package" />
        <StatCard label="Jami dona" value={totalQty} unit="dona" icon="stack"
          accent="var(--color-accent)" />
        <StatCard label="Tannarxda" value={money(totalCost)} unit="so‘m" icon="coin" />
      </div>

      <Card padding="var(--space-6)" gap={12}>
        <Field label="Tovar qidirish yoki skanerlash"
          hint="USB skaner ishlatsangiz shu maydonga fokus qo‘ying — kod o‘zi tushadi">
          <input
            ref={searchRef}
            className="input"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onSearchKey}
            placeholder="Nom, barcode yoki IMEI…"
            autoComplete="off"
          />
        </Field>

        {found.length > 0 && (
          <div style={{ border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)' }}>
            {found.map((p, i) => (
              <div key={p.id} onClick={() => addLine(p.id)} className="row-link"
                style={{
                  cursor: 'pointer',
                  borderTop: i ? '1px solid var(--color-divider)' : 'none',
                }}>
                <span style={{ fontSize: 20 }}>{p.image || '📦'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                    hozir {p.stock} dona
                    {p.barcode ? ` · ${p.barcode}` : ''}
                  </div>
                </div>
                <Icon name="plus" size={17} color="var(--color-accent)" />
              </div>
            ))}
          </div>
        )}
      </Card>

      {lines.length === 0 ? (
        <EmptyState icon="package" text="Ro‘yxat bo‘sh"
          sub="Kelgan tovarlarni skanerlang yoki qidirib qo‘shing" />
      ) : (
        <>
          <Card padding={0}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Tovar</th>
                    <th style={{ textAlign: 'right' }}>Hozir</th>
                    <th style={{ textAlign: 'center', width: 150 }}>Kirim</th>
                    <th style={{ textAlign: 'right' }}>Bo‘ladi</th>
                    <th style={{ textAlign: 'right' }}>Tannarxda</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {lines.map(line => {
                    const p = byId.get(line.id);
                    if (!p) return null;
                    return (
                      <tr key={line.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <span style={{ fontSize: 18 }}>{p.image || '📦'}</span>
                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                          </div>
                        </td>
                        <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-500)' }}>
                          {p.stock}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Btn variant="secondary" iconOnly icon="minus"
                              onClick={() => setQty(line.id, line.qty - 1)}
                              style={{ width: 28, height: 28 }} />
                            <input className="input num" value={line.qty} inputMode="numeric"
                              onChange={e => setQty(line.id, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
                              style={{ width: 58, minHeight: 28, textAlign: 'center', padding: '2px 6px' }} />
                            <Btn variant="secondary" iconOnly icon="plus"
                              onClick={() => setQty(line.id, line.qty + 1)}
                              style={{ width: 28, height: 28 }} />
                          </div>
                        </td>
                        <td className="num" style={{ textAlign: 'right', color: 'var(--ok)', fontWeight: 500 }}>
                          {p.stock + line.qty}
                        </td>
                        <td className="num" style={{ textAlign: 'right' }}>
                          {money((Number(p.cost_price) || 0) * line.qty)}
                        </td>
                        <td>
                          <Btn variant="ghost" iconOnly icon="trash"
                            onClick={() => setQty(line.id, 0)}
                            style={{ width: 28, height: 28, color: 'var(--color-neutral-500)' }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Ta'minotchi — ixtiyoriy */}
          <Card padding="var(--space-6)" gap={12}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Kimdan keldi" hint="Ixtiyoriy — tanlansa qarz hisobiga tushadi">
                <select className="input" value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}>
                  <option value="">— tanlanmagan —</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>

              {supplierId && (
                <Field label="Shu zahoti to‘langani"
                  hint={`To‘lanmagani ta’minotchiga qarz bo‘lib qoladi`}>
                  <input className="input num" inputMode="numeric" value={paid}
                    onChange={e => setPaid(e.target.value.replace(/\D/g, ''))}
                    placeholder={String(Math.round(totalCost))} />
                </Field>
              )}
            </div>

            {supplierId && (
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-400)' }}>
                Yuk summasi <b className="num">{money(totalCost)}</b> so‘m ·
                qarzga qoladi{' '}
                <b className="num" style={{ color: 'var(--warn)' }}>
                  {money(Math.max(0, totalCost - (parseInt(paid, 10) || 0)))}
                </b> so‘m
              </div>
            )}

            <Btn variant="primary" icon="check-circle" block loading={saving}
              onClick={save} style={{ minHeight: 46 }}>
              Kirim qilish — {totalQty} dona
            </Btn>
          </Card>
        </>
      )}

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}
