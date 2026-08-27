import React from 'react';
import JsBarcode from 'jsbarcode';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

/* ══════════════════════════════════════════════════════════════════════════
   Barcode chizish

   Telefonda brauzer DOM'i yo'q, shuning uchun jsbarcode'ning oddiy
   "obyekt" rejimi ishlatiladi: u faqat chiziqlar ketma-ketligini
   qaytaradi (1 = qora, 0 = oq), chizishni o'zimiz qilamiz.

   Shu yo'l bilan ikkita narsa bir manbadan chiqadi: ekrandagi
   ko'rinish va chop etishga ketadigan SVG. Internet ham kerak emas —
   hech qanday tashqi xizmatga murojaat yo'q.
   ══════════════════════════════════════════════════════════════════════ */

/** Tovar uchun barcode qiymati — barcode yo'q bo'lsa IMEI yoki id */
export function codeOf(p) {
  return p.barcode || p.phone_imei1 || String(p.id).padStart(10, '0');
}

/** { bars: '10110...', text } yoki xato bo'lsa null */
export function encode(value, format = 'CODE128') {
  const holder = {};
  try {
    JsBarcode(holder, String(value), {
      format, displayValue: false, margin: 0,
    });
  } catch {
    return null;
  }
  const enc = holder.encodings?.[0];
  if (!enc?.data) return null;
  return { bars: enc.data, text: String(value) };
}

/** Chop etish uchun SVG matni */
export function barcodeSvg(value, { width = 1.6, height = 46, fontSize = 11 } = {}) {
  const e = encode(value);
  if (!e) return '';

  const w = e.bars.length * width;
  const total = height + fontSize + 4;
  let rects = '';
  let i = 0;
  while (i < e.bars.length) {
    if (e.bars[i] === '1') {
      let j = i;
      while (j < e.bars.length && e.bars[j] === '1') j++;
      rects += `<rect x="${(i * width).toFixed(2)}" y="0" width="${((j - i) * width).toFixed(2)}" height="${height}" fill="#1a1a1a"/>`;
      i = j;
    } else i++;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w.toFixed(1)}" height="${total}" viewBox="0 0 ${w.toFixed(1)} ${total}">`
    + `<rect width="100%" height="100%" fill="#fdfdfb"/>${rects}`
    + `<text x="${(w / 2).toFixed(1)}" y="${total - 1}" text-anchor="middle" font-family="monospace" font-size="${fontSize}" fill="#1a1a1a">${e.text}</text>`
    + '</svg>';
}

/** Ekranda ko'rsatish uchun */
export function Barcode({ value, width = 1.6, height = 46, showText = true }) {
  const e = encode(value);
  if (!e) return null;

  const w = e.bars.length * width;
  const fontSize = 11;
  const total = height + (showText ? fontSize + 4 : 0);

  const rects = [];
  let i = 0;
  while (i < e.bars.length) {
    if (e.bars[i] === '1') {
      let j = i;
      while (j < e.bars.length && e.bars[j] === '1') j++;
      rects.push(
        <Rect key={i} x={i * width} y={0} width={(j - i) * width} height={height} fill="#1a1a1a" />
      );
      i = j;
    } else i++;
  }

  return (
    <Svg width="100%" height={total} viewBox={`0 0 ${w} ${total}`} preserveAspectRatio="xMidYMid meet">
      <Rect width={w} height={total} fill="#fdfdfb" />
      {rects}
      {showText ? (
        <SvgText
          x={w / 2} y={total - 1} textAnchor="middle"
          fontFamily="monospace" fontSize={fontSize} fill="#1a1a1a"
        >
          {e.text}
        </SvgText>
      ) : null}
    </Svg>
  );
}
