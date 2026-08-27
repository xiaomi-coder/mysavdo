import React, { useState, useRef, useMemo } from 'react';
import Barcode from 'react-barcode';
import { Modal, Icon, Btn, Field, EmptyState } from './UI';
import { printLabels, codeOf } from '../utils/labels';

/* ══════════════════════════════════════════════════════════════════════════
   Narx yorliqlarini chop etish

   Bitta tovar uchun ham, o'nlab tovar uchun ham shu oyna ishlatiladi.
   Har tovarga nusxa soni alohida beriladi — masalan chexoldan 20 ta,
   telefondan 1 ta.

   Barcode'lar ko'rinmaydigan joyda chiziladi va SVG sifatida olinadi,
   shundan keyin chop etish oynasiga qo'yiladi. Shu sababli hech qanday
   tashqi xizmat kerak emas — internetsiz ham ishlaydi.
   ══════════════════════════════════════════════════════════════════════ */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

export default function LabelPrint({ products, onClose, onError }) {
  // Har tovarga nusxa soni. Aksessuarga qoldiq bo'yicha taklif qilamiz,
  // noyob tovarga (IMEI bor) faqat 1 ta — u baribir bitta dona.
  const [copies, setCopies] = useState(() =>
    Object.fromEntries(products.map(p => [
      p.id,
      p.phone_imei1 || p.phone_serial ? '1' : String(Math.min(p.stock || 1, 30)),
    ]))
  );

  const svgRef = useRef(null);
  const single = products.length === 1;

  const total = useMemo(
    () => products.reduce((s, p) => s + (parseInt(copies[p.id], 10) || 0), 0),
    [products, copies]
  );

  const setCopy = (id, v) => setCopies(prev => ({ ...prev, [id]: v.replace(/\D/g, '') }));

  const print = () => {
    // Yashirin joydagi barcode'lardan SVG matnini olamiz
    const svgs = {};
    svgRef.current?.querySelectorAll('[data-product]').forEach(node => {
      svgs[node.dataset.product] = node.querySelector('svg')?.outerHTML || '';
    });

    const items = products
      .filter(p => (parseInt(copies[p.id], 10) || 0) > 0)
      .map(p => ({
        name: p.name,
        price: p.price,
        svg: svgs[p.id],
        copies: copies[p.id],
      }));

    if (items.length === 0) return;
    if (!printLabels(items)) {
      onError?.('Chop etish uchun pop-up oynalarga ruxsat bering');
    }
  };

  return (
    <Modal
      title={single ? 'Barcode chop etish' : `Narx yorliqlari — ${products.length} ta tovar`}
      onClose={onClose}
      wide={!single}
      actions={
        <>
          <Btn variant="secondary" onClick={onClose}>Yopish</Btn>
          <Btn variant="primary" icon="printer" onClick={print} disabled={total === 0}>
            Chop etish{total > 0 && ` — ${total} ta yorliq`}
          </Btn>
        </>
      }
    >
      {/* Barcode'lar shu yerda chiziladi. Ko'rinmaydi, lekin DOM da bor —
          chop etishda SVG shu yerdan olinadi. */}
      <div ref={svgRef} style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden>
        {products.map(p => (
          <div key={p.id} data-product={p.id}>
            <Barcode value={codeOf(p)} width={1.6} height={46} fontSize={11} margin={0}
              background="#fdfdfb" lineColor="#1a1a1a" />
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState icon="barcode" text="Tovar tanlanmagan" />
      ) : single ? (
        /* ── Bitta tovar: yorliq ko'rinishi bilan ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, alignItems: 'center' }}>
          <LabelPreview product={products[0]} />
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
            Stiker o‘lchami: 40 × 30 mm
          </div>
          <Field label="Nusxa soni" style={{ width: '100%' }}>
            <input className="input num" inputMode="numeric" autoFocus
              value={copies[products[0].id] ?? ''}
              onChange={e => setCopy(products[0].id, e.target.value)} />
          </Field>
        </div>
      ) : (
        /* ── Ko'p tovar: har biriga nusxa soni ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            display: 'flex', gap: 9, alignItems: 'flex-start',
            padding: '10px 12px', borderRadius: 8,
            background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
          }}>
            <Icon name="info" size={14} color="var(--color-neutral-500)" style={{ marginTop: 1 }} />
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', lineHeight: 1.45 }}>
              Nusxa soni qoldiq bo‘yicha taklif qilindi. IMEI’li tovarlarga
              bittadan qo‘yilgan — ular baribir noyob. Kerakmas tovarga
              <b style={{ fontWeight: 500 }}> 0</b> yozsangiz chop etilmaydi.
            </span>
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            <table className="table" style={{ fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th>Tovar</th>
                  <th>Barcode</th>
                  <th style={{ textAlign: 'right' }}>Narxi</th>
                  <th style={{ textAlign: 'right', width: 96 }}>Nusxa</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className="num" style={{ color: 'var(--color-neutral-500)' }}>{codeOf(p)}</td>
                    <td className="num" style={{ textAlign: 'right' }}>{money(p.price)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <input
                        className="input num" inputMode="numeric"
                        value={copies[p.id] ?? ''}
                        onChange={e => setCopy(p.id, e.target.value)}
                        style={{ width: 72, minHeight: 28, padding: '4px 8px', textAlign: 'right', display: 'inline-block' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 13px', borderRadius: 9,
            background: 'color-mix(in srgb, var(--color-text) 4%, transparent)',
          }}>
            <span style={{ fontSize: 12.5, color: 'var(--color-neutral-400)' }}>
              Jami chop etiladi
            </span>
            <span className="num" style={{ fontSize: 16, fontWeight: 600 }}>
              {total} ta yorliq
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* Yorliqning haqiqiy qog'ozdagi ko'rinishi */
function LabelPreview({ product }) {
  return (
    <div style={{
      width: 240, minHeight: 180, borderRadius: 6, background: '#fdfdfb', color: '#1a1a1a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 6, padding: 14, boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ font: '600 12px Inter, sans-serif', textAlign: 'center', lineHeight: 1.25 }}>
        {product.name}
      </div>
      <Barcode value={codeOf(product)} width={1.6} height={46} fontSize={11} margin={0}
        background="#fdfdfb" lineColor="#1a1a1a" />
      <div style={{ font: '600 13px Inter, sans-serif' }}>{money(product.price)} so‘m</div>
    </div>
  );
}
