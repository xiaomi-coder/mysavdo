import React, { useRef, useState } from 'react';
import { Icon, Btn, Field } from './UI';
import { uploadImage, imageUrl } from '../utils/upload';

/* ══════════════════════════════════════════════════════════════════════════
   Mahsulot rasmi maydoni

   Rasm tanlanganda darhol yuklanadi va manzili qaytariladi. Kichraytirish
   brauzerda bo'ladi, shuning uchun telefondan olingan katta surat ham
   muammosiz o'tadi.
   ══════════════════════════════════════════════════════════════════════ */

export default function PhotoField({ value, onChange, label = 'Rasm', hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = () => inputRef.current?.click();

  const handle = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';           // bir xil faylni qayta tanlash mumkin bo'lsin
    if (!file) return;

    setBusy(true);
    setError('');
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const src = imageUrl(value);

  return (
    <Field label={label} error={error} hint={!error ? hint : null}>
      <input
        ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={handle} style={{ display: 'none' }}
      />

      {src ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <img
            src={src} alt=""
            style={{
              width: 88, height: 88, objectFit: 'cover', flex: 'none',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--color-divider)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Btn variant="secondary" size="sm" icon="arrows-clockwise" onClick={pick} loading={busy}>
              Almashtirish
            </Btn>
            <Btn variant="ghost" size="sm" icon="trash" onClick={() => onChange('')}
              style={{ color: 'var(--dang)' }}>
              O‘chirish
            </Btn>
          </div>
        </div>
      ) : (
        <button
          type="button" onClick={pick} disabled={busy}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, width: '100%', minHeight: 88, padding: 12, cursor: busy ? 'wait' : 'pointer',
            borderRadius: 'var(--radius-md)', font: 'inherit',
            border: '1px dashed var(--color-divider)', background: 'transparent',
            color: 'var(--color-neutral-500)',
          }}
        >
          {busy ? (
            <><span className="spinner" /><span style={{ fontSize: 12 }}>Yuklanmoqda…</span></>
          ) : (
            <>
              <Icon name="image" size={22} />
              <span style={{ fontSize: 12.5 }}>Rasm tanlang</span>
              <span style={{ fontSize: 10.5 }}>JPEG, PNG yoki WEBP</span>
            </>
          )}
        </button>
      )}
    </Field>
  );
}
