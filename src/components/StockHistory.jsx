import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Icon, Btn, Tag, Seg, EmptyState, SkeletonRows } from './UI';
import { supabase } from '../utils/supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   Tovar harakati kartochkasi (sverka)

   Bitta tovarning qoldig'i qayerdan kelib, qayerga ketganini ko'rsatadi.
   Qoldiq noto'g'ri chiqqanda sababini shu yerdan topiladi.
   ══════════════════════════════════════════════════════════════════════ */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

/* Harakat turlari — ko'rinish va ma'nosi */
export const MOVE_TYPES = {
  boshlangich: { label: 'Boshlang‘ich', icon: 'flag', color: 'var(--color-neutral-400)' },
  kirim:       { label: 'Kirim',        icon: 'arrow-down',    color: 'var(--ok)' },
  sotuv:       { label: 'Sotuv',        icon: 'cash-register', color: 'var(--color-accent)' },
  qaytarish:   { label: 'Qaytarish',    icon: 'arrow-u-left-up', color: 'var(--info)' },
  kochirish:   { label: 'Ko‘chirish',   icon: 'truck',         color: 'var(--warn)' },
  taftish:     { label: 'Taftish',      icon: 'clipboard-text', color: 'var(--warn)' },
  tuzatish:    { label: 'Tuzatish',     icon: 'warning',       color: 'var(--dang)' },
};

const typeOf = t => MOVE_TYPES[t] || { label: t, icon: 'dot', color: 'var(--color-neutral-400)' };

const PERIODS = [
  { value: 30, label: '30 kun' },
  { value: 90, label: '3 oy' },
  { value: 365, label: 'Yil' },
  { value: 0, label: 'Hammasi' },
];

export default function StockHistory({ product, onClose }) {
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let alive = true;
    setRows(null);

    let q = supabase.from('stock_movements').select('*')
      .eq('product_id', product.id)
      .order('id', { ascending: false })
      .limit(300);

    if (days > 0) {
      const from = new Date(Date.now() - days * 86400000).toISOString();
      q = q.gte('created_at', from);
    }

    q.then(({ data }) => { if (alive) setRows(data || []); });
    return () => { alive = false; };
  }, [product.id, days]);

  /* Davr bo'yicha yig'indi */
  const totals = useMemo(() => {
    const t = { in: 0, out: 0, byType: {} };
    (rows || []).forEach(r => {
      if (r.type === 'boshlangich') return;
      if (r.qty > 0) t.in += r.qty; else t.out += -r.qty;
      t.byType[r.type] = (t.byType[r.type] || 0) + Math.abs(r.qty);
    });
    return t;
  }, [rows]);

  return (
    <Modal title={`Harakat tarixi — ${product.name}`} onClose={onClose} wide>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Seg options={PERIODS} value={days} onChange={setDays} style={{ fontSize: 12 }} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5 }}>
            <span style={{ color: 'var(--ok)' }}>
              Kirim: <b className="num" style={{ fontWeight: 600 }}>+{totals.in}</b>
            </span>
            <span style={{ color: 'var(--dang)' }}>
              Chiqim: <b className="num" style={{ fontWeight: 600 }}>−{totals.out}</b>
            </span>
            <span>
              Hozirgi qoldiq: <b className="num" style={{ fontWeight: 600 }}>{product.stock}</b>
            </span>
          </div>
        </div>

        {rows === null ? <SkeletonRows count={5} widths={['100%']} />
          : rows.length === 0 ? (
            <EmptyState icon="clock-counter-clockwise" text="Bu davrda harakat bo‘lmagan"
              sub="Boshqa davrni tanlab ko‘ring" />
          ) : (
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              <table className="table" style={{ fontSize: 12.5 }}>
                <thead>
                  <tr>
                    <th>Sana</th><th>Amal</th>
                    <th style={{ textAlign: 'right' }}>Miqdor</th>
                    <th style={{ textAlign: 'right' }}>Qoldiq</th>
                    <th>Kim</th><th>Izoh</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const t = typeOf(r.type);
                    return (
                      <tr key={r.id}>
                        <td className="num" style={{ color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>
                          {new Date(r.created_at).toLocaleDateString('ru-RU')}
                          <span style={{ opacity: 0.7 }}> {new Date(r.created_at).toTimeString().slice(0, 5)}</span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Icon name={t.icon} size={13} color={t.color} />
                            {t.label}
                          </span>
                        </td>
                        <td className="num" style={{
                          textAlign: 'right', fontWeight: 600,
                          color: r.qty > 0 ? 'var(--ok)' : r.qty < 0 ? 'var(--dang)' : undefined,
                        }}>
                          {r.qty > 0 ? `+${r.qty}` : r.qty}
                        </td>
                        <td className="num" style={{ textAlign: 'right', color: 'var(--color-neutral-400)' }}>
                          {r.stock_before} → <b style={{ color: 'var(--color-text)', fontWeight: 500 }}>{r.stock_after}</b>
                        </td>
                        <td style={{ color: 'var(--color-neutral-500)' }}>{r.actor || '—'}</td>
                        <td style={{ color: 'var(--color-neutral-500)' }}>{r.note || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        {/* Tushuntirishsiz o'zgarish bo'lsa ogohlantiramiz */}
        {(rows || []).some(r => r.type === 'tuzatish') && (
          <div style={{
            display: 'flex', gap: 9, alignItems: 'flex-start',
            padding: '10px 12px', borderRadius: 8, background: 'var(--dangbg)',
          }}>
            <Icon name="warning" fill size={14} color="var(--dang)" style={{ marginTop: 1 }} />
            <span style={{ fontSize: 11.5, color: 'var(--dang)', lineHeight: 1.45 }}>
              Ro‘yxatda <b style={{ fontWeight: 500 }}>tuzatish</b> turidagi yozuv bor — qoldiq
              sababsiz o‘zgartirilgan. Odatda bu tizimdan tashqarida qilingan
              o‘zgarishni bildiradi.
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11.5 }}>
          {Object.entries(totals.byType).map(([type, qty]) => {
            const t = typeOf(type);
            return (
              <Tag key={type} variant="neutral" icon={t.icon}>
                {t.label}: {qty} dona
              </Tag>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
