import React, { useRef, useState } from 'react';
import { Icon, Btn, Field } from './UI';
import { uploadImage, imageUrl } from '../utils/upload';

/* ══════════════════════════════════════════════════════════════════════════
   Mahsulot rasmlari

   Bir nechta surat qo'yish mumkin — onlayn katalogda mijoz tovarni
   old, orqa va yon tomondan ko'radi. Marketpleyslarda shunday, va
   suratsiz yoki bitta suratli tovar ular yonida yutqazadi.

   BIRINCHI surat asosiy hisoblanadi: ro'yxatlarda, savatda va chekda
   aynan u ko'rinadi. Shuning uchun tartibni o'zgartirish mumkin —
   "asosiy qilish" tugmasi suratni boshiga ko'chiradi.

   Rasm tanlanganda darhol yuklanadi. Kichraytirish brauzerda bo'ladi,
   shuning uchun telefondan olingan katta surat ham muammosiz o'tadi.
   ══════════════════════════════════════════════════════════════════════ */

const MAX = 5;

export default function PhotoField({ value, onChange, label = 'Rasmlar', hint, max = MAX }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(0);        // yuklanayotgan fayllar soni
  const [error, setError] = useState('');

  // Eski yozuvlarda bitta satr bo'lishi mumkin — ro'yxatga keltiramiz
  const photos = Array.isArray(value) ? value.filter(Boolean) : (value ? [value] : []);
  const room = Math.max(0, max - photos.length);

  const pick = () => inputRef.current?.click();

  const handle = async (e) => {
    const files = [...(e.target.files || [])].slice(0, room);
    e.target.value = '';                      // bir xil faylni qayta tanlash mumkin bo'lsin
    if (files.length === 0) return;

    setError('');
    setBusy(files.length);

    /* Ketma-ket yuklaymiz. Bir vaqtda yuborilsa sekin internetda
       ba'zilari uzilib qoladi, do'konchi esa nima yuklanib nima
       yuklanmaganini bilmay qoladi. */
    const added = [];
    for (const file of files) {
      try {
        added.push(await uploadImage(file));
      } catch (err) {
        setError(err.message);
        break;
      } finally {
        setBusy((n) => n - 1);
      }
    }

    if (added.length) onChange([...photos, ...added]);
  };

  const removeAt = (i) => onChange(photos.filter((_, k) => k !== i));

  const makeFirst = (i) => {
    const next = [...photos];
    const [x] = next.splice(i, 1);
    onChange([x, ...next]);
  };

  return (
    <Field label={label} error={error} hint={!error ? hint : null}>
      <input
        ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
        onChange={handle} style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {photos.map((p, i) => (
          <div key={p + i} style={{ position: 'relative', width: 88 }}>
            <img
              src={imageUrl(p)} alt=""
              style={{
                width: 88, height: 88, objectFit: 'cover', display: 'block',
                borderRadius: 'var(--radius-md)',
                border: i === 0
                  ? '2px solid var(--color-accent)'
                  : '1px solid var(--color-divider)',
              }}
            />

            {i === 0 ? (
              <span style={{
                position: 'absolute', top: 5, left: 5,
                padding: '2px 6px', borderRadius: 6,
                background: 'var(--color-accent)', color: 'var(--color-bg)',
                fontSize: 9.5, fontWeight: 600,
              }}>
                Asosiy
              </span>
            ) : (
              <button
                type="button" onClick={() => makeFirst(i)} title="Asosiy qilish"
                style={{
                  position: 'absolute', top: 5, left: 5,
                  width: 22, height: 22, borderRadius: 6, cursor: 'pointer',
                  border: 0, background: 'rgba(0,0,0,.55)', color: '#fff',
                  display: 'grid', placeItems: 'center', fontSize: 11,
                }}
              >
                ★
              </button>
            )}

            <button
              type="button" onClick={() => removeAt(i)} title="O‘chirish"
              style={{
                position: 'absolute', top: 5, right: 5,
                width: 22, height: 22, borderRadius: 6, cursor: 'pointer',
                border: 0, background: 'rgba(0,0,0,.55)', color: '#fff',
                display: 'grid', placeItems: 'center', fontSize: 13, lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        ))}

        {busy > 0 && Array.from({ length: busy }, (_, i) => (
          <div key={'busy' + i} style={{
            width: 88, height: 88, borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-divider)',
            display: 'grid', placeItems: 'center',
          }}>
            <span className="spinner" />
          </div>
        ))}

        {room > 0 && busy === 0 && (
          <button
            type="button" onClick={pick}
            style={{
              width: 88, height: 88, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4,
              borderRadius: 'var(--radius-md)', font: 'inherit',
              border: '1px dashed var(--color-divider)', background: 'transparent',
              color: 'var(--color-neutral-500)',
            }}
          >
            <Icon name="image" size={20} />
            <span style={{ fontSize: 11 }}>
              {photos.length === 0 ? 'Rasm tanlang' : 'Yana'}
            </span>
          </button>
        )}
      </div>

      <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)', marginTop: 7 }}>
        {photos.length === 0
          ? 'JPEG, PNG yoki WEBP · bir vaqtda bir nechtasini tanlash mumkin'
          : `${photos.length} ta rasm · ko‘pi bilan ${max} ta · birinchisi asosiy`}
      </div>
    </Field>
  );
}
