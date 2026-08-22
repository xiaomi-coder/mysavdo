import React, { useState, useEffect } from 'react';
import { Page, PageHeader, Card, Icon, Btn, Seg, Field, Toast } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import {
  printReceipt, getReceiptSettings, saveReceiptSettings, qrImageUrl,
} from '../utils/receipt';

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

/* Namuna savat — ko'rinishni tekshirish uchun */
const SAMPLE = {
  items: [
    { id: 1, name: 'iPhone 15 128GB Black', qty: 1, price: 8900000, itemDiscount: 500000 },
    { id: 2, name: 'Silikon chexol', qty: 2, price: 80000 },
  ],
  subtotal: 9060000,
  discount: 500000,
  total: 8560000,
};

const TEMPLATES = [
  { id: 'standard', label: 'Standart', lines: [60, 85, 80, 45] },
  { id: 'compact', label: 'Ixcham', lines: [70, 50, 40] },
  { id: 'detailed', label: "To'liq", lines: [60, 90, 85, 88, 70, 50] },
];

/* ══════════════════════════════════════════════════════════════════════════
   Chek printer
   ══════════════════════════════════════════════════════════════════════ */

export default function ChekPrinter() {
  const { user } = useAuth();
  const [cfg, setCfg] = useState(getReceiptSettings);
  const [toast, setToast] = useState(null);

  const set = (k, v) => setCfg(prev => {
    const next = { ...prev, [k]: v };
    saveReceiptSettings(next);
    return next;
  });

  // Do'kon ma'lumotlari bo'sh bo'lsa — Sozlamalardagi qiymatlarni olamiz
  useEffect(() => {
    if (!user?.store_id || cfg.storeName) return;
    supabase.from('stores').select('name, address, phone').eq('id', user.store_id).single()
      .then(({ data }) => {
        if (!data) return;
        setCfg(prev => {
          const next = {
            ...prev,
            storeName: prev.storeName || data.name || '',
            address: prev.address || data.address || '',
            phone: prev.phone || data.phone || '',
          };
          saveReceiptSettings(next);
          return next;
        });
      });
  }, [user, cfg.storeName]);

  const print = (test) => {
    const ok = printReceipt({
      ...SAMPLE, paidAmount: 0, payMethod: 'card',
      receiptNo: test ? 'TEST' : 10248,
      cashier: user?.name, customer: null,
      storeName: user?.storeName, isPhone: user?.storeType === 'phone',
      settings: cfg,
    });
    if (!ok) setToast({ msg: 'Pop-up oynalarga ruxsat bering', variant: 'warn' });
  };

  return (
    <Page>
      <PageHeader title="Chek printer" subtitle="Chek ko‘rinishi va chop etish sozlamalari" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Shablon */}
          <Card padding="var(--space-6)" gap={10}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Shablon</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
              {TEMPLATES.map(t => {
                const on = cfg.template === t.id;
                return (
                  <div key={t.id} onClick={() => set('template', t.id)} style={{
                    display: 'flex', flexDirection: 'column', gap: 7, padding: 11,
                    borderRadius: 9, cursor: 'pointer',
                    border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                    background: on ? 'var(--color-accent-900)' : 'transparent',
                  }}>
                    <div style={{
                      height: 44, borderRadius: 5, background: '#fdfdfb', padding: 6,
                      display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'center',
                    }}>
                      {t.lines.map((w, i) => (
                        <span key={i} style={{
                          height: i === 0 || i === t.lines.length - 1 ? 3 : 2,
                          width: `${w}%`, borderRadius: 1,
                          background: i === 0 || i === t.lines.length - 1 ? '#1a1a1a' : '#c9c9c4',
                        }} />
                      ))}
                    </div>
                    <span style={{
                      fontSize: 12, textAlign: 'center',
                      fontWeight: on ? 500 : 400,
                      color: on ? 'var(--color-text)' : 'var(--color-neutral-400)',
                    }}>
                      {t.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Do'kon ma'lumotlari */}
          <Card padding="var(--space-6)" gap={11}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Do‘kon ma’lumotlari</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              <Field label="Do‘kon nomi">
                <input className="input" value={cfg.storeName}
                  onChange={e => set('storeName', e.target.value)} placeholder="MY BAZZAR" />
              </Field>
              <Field label="Telefon">
                <input className="input num" value={cfg.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+998 71 200 10 42" />
              </Field>
            </div>
            <Field label="Manzil">
              <input className="input" value={cfg.address}
                onChange={e => set('address', e.target.value)} placeholder="Toshkent, Yunusobod tumani" />
            </Field>
            <Field label="Pastki matn">
              <input className="input" value={cfg.footer}
                onChange={e => set('footer', e.target.value)} placeholder="Xaridingiz uchun rahmat!" />
            </Field>
          </Card>

          {/* Logo, QR, matn o'lchami */}
          <Card padding="var(--space-6)" gap={12}>
            <ToggleRow
              title="Logo" sub="Chek tepasida logo ko‘rsatish"
              on={cfg.showLogo} onChange={() => set('showLogo', !cfg.showLogo)}
            />
            {cfg.showLogo && (
              <Field label="Logo URL" hint="Rasm to‘g‘ridan-to‘g‘ri ochiladigan havola bo‘lishi kerak">
                <input className="input" value={cfg.logoUrl} onChange={e => set('logoUrl', e.target.value)}
                  placeholder="https://mybazzar.uz/logo.png" style={{ fontSize: 12 }} />
              </Field>
            )}

            <div style={{ paddingTop: 4, borderTop: '1px solid var(--color-divider)' }}>
              <ToggleRow
                title="QR kod" sub="Chek pastida QR havola"
                on={cfg.showQr} onChange={() => set('showQr', !cfg.showQr)}
              />
            </div>
            {cfg.showQr && (
              <Field label="QR havolasi" hint="Internetsiz chop etilsa QR ko‘rinmaydi">
                <input className="input" value={cfg.qrUrl} onChange={e => set('qrUrl', e.target.value)}
                  placeholder={`mybazzar.uz/shop/${user?.store_id ?? ''}`} style={{ fontSize: 12 }} />
              </Field>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              paddingTop: 4, borderTop: '1px solid var(--color-divider)',
            }}>
              <div style={{ flex: 1, fontSize: 13.5 }}>Matn o‘lchami</div>
              <Seg
                style={{ fontSize: 12 }}
                options={[
                  { value: 'kichik', label: 'Kichik' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'katta', label: 'Katta' },
                ]}
                value={cfg.fontSize}
                onChange={v => set('fontSize', v)}
              />
            </div>
          </Card>

          <div style={{ display: 'flex', gap: 9 }}>
            <Btn variant="primary" icon="printer" onClick={() => print(false)}>Chop Etish</Btn>
            <Btn variant="secondary" icon="flask" onClick={() => print(true)}>Test Chop Etish</Btn>
          </div>
        </div>

        {/* ── Jonli ko'rinish ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', position: 'sticky', top: 0 }}>
          <ReceiptPreview cfg={cfg} cashier={user?.name} />
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', textAlign: 'center' }}>
            Termal chek · {cfg.template === 'compact' ? '58mm' : '80mm'} ·{' '}
            {TEMPLATES.find(t => t.id === cfg.template)?.label} · {cfg.fontSize} matn
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

function ToggleRow({ title, sub, on, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>{sub}</div>
      </div>
      <span
        role="switch" aria-checked={on} onClick={onChange}
        style={{
          width: 40, height: 23, borderRadius: 12, position: 'relative', flex: 'none',
          display: 'inline-block', cursor: 'pointer', transition: 'background .15s',
          background: on ? 'var(--color-accent)' : 'var(--color-neutral-700)',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: on ? 19 : 2,
          width: 19, height: 19, borderRadius: '50%', transition: 'left .15s',
          background: on ? 'var(--color-bg)' : 'var(--color-neutral-400)',
        }} />
      </span>
    </div>
  );
}

/* Chekning haqiqiy qog'ozdagi ko'rinishi — oq fon, qora siyoh */
function ReceiptPreview({ cfg, cashier }) {
  const scale = cfg.fontSize === 'kichik' ? 0.9 : cfg.fontSize === 'katta' ? 1.15 : 1;
  const row = { display: 'flex', justifyContent: 'space-between' };
  const dash = { borderTop: '1px dashed #999', margin: '10px 0' };

  return (
    <div style={{
      width: 280, background: '#fdfdfb', color: '#1a1a1a', padding: '18px 16px',
      font: `${12 * scale}px/1.5 ui-monospace, Menlo, monospace`,
      boxShadow: 'var(--shadow-md)', borderRadius: 3,
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {cfg.showLogo && (
          cfg.logoUrl
            ? <img src={cfg.logoUrl} alt="" style={{ maxHeight: 40, margin: '0 auto 4px' }} />
            : <div style={{
                width: 36, height: 36, border: '1.5px solid #1a1a1a', borderRadius: 8,
                display: 'grid', placeItems: 'center', margin: '0 auto 4px', fontSize: 17,
              }}>🏬</div>
        )}
        <div style={{ fontWeight: 700, fontSize: 14 * scale, letterSpacing: 1 }}>
          {(cfg.storeName || 'MY BAZZAR').toUpperCase()}
        </div>
        {cfg.address && <div>{cfg.address}</div>}
        {cfg.phone && <div>{cfg.phone}</div>}
      </div>

      <div style={dash} />
      <div style={row}><span>Chek #10248</span><span>{new Date().toLocaleDateString('ru-RU')}</span></div>
      <div>Kassir: {cashier || 'Kassir'}</div>

      <div style={dash} />
      <div>iPhone 15 128GB Black</div>
      <div style={row}><span>1 × {money(8900000)}</span><span>{money(8900000)}</span></div>
      <div style={row}><span>Chegirma</span><span>−{money(500000)}</span></div>
      <div style={{ marginTop: 5 }}>Silikon chexol</div>
      <div style={row}><span>2 × {money(80000)}</span><span>{money(160000)}</span></div>

      <div style={dash} />
      <div style={row}><span>Oraliq jami</span><span>{money(SAMPLE.subtotal)}</span></div>
      <div style={{ ...row, fontWeight: 700, fontSize: 14 * scale, marginTop: 3 }}>
        <span>JAMI</span><span>{money(SAMPLE.total)}</span>
      </div>
      <div style={row}><span>To‘lov</span><span>Plastik</span></div>

      <div style={dash} />
      {cfg.showQr && cfg.qrUrl && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
          <img src={qrImageUrl(cfg.qrUrl)} alt="QR" style={{ width: 64, height: 64 }} />
        </div>
      )}
      {cfg.showQr && cfg.qrUrl && <div style={{ textAlign: 'center' }}>{cfg.qrUrl}</div>}
      <div style={{ textAlign: 'center', marginTop: 5 }}>{cfg.footer}</div>
    </div>
  );
}
