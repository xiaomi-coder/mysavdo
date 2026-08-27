/* ══════════════════════════════════════════════════════════════════════════
   Narx yorliqlarini chop etish

   Stiker o'lchami 40 × 30 mm — O'zbekistonda eng ko'p ishlatiladigan
   termal printer rulonining o'lchami (Xprinter va shunga o'xshashlar).

   Barcode SVG'i brauzerda react-barcode bilan chiziladi va shu yerga
   tayyor holda beriladi. Sabab: tashqi xizmatga bog'lanmaslik —
   internetsiz ham chop etilsin.
   ══════════════════════════════════════════════════════════════════════ */

const money = n => Math.round(Number(n) || 0).toLocaleString('ru-RU');

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

const STYLES = `
  @page { margin: 0; size: 40mm 30mm; }
  body { margin: 0; font-family: Arial, sans-serif; background: #fff; }
  .label {
    width: 40mm; height: 30mm; padding: 2mm; box-sizing: border-box;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center;
    page-break-after: always; break-after: page;
  }
  .label:last-child { page-break-after: auto; break-after: auto; }
  .name {
    font-size: 9px; font-weight: bold; line-height: 1.15;
    margin-bottom: 1mm; max-height: 7mm; overflow: hidden;
  }
  .price { font-size: 11px; font-weight: bold; margin-top: 1mm; }
  svg { max-width: 100%; height: auto; }
`;

/**
 * Yorliqlarni yangi oynada chop etadi.
 *
 * items: [{ name, price, svg, copies }]
 *   svg — react-barcode chizgan <svg>…</svg> matni
 *
 * Pop-up bloklangan bo'lsa false qaytaradi.
 */
/**
 * Yorliqlar sahifasining HTML'ini yig'adi.
 *
 * Brauzerga bog'liq emas — veb ilova ham, mobil ilova ham shu yerdan
 * foydalanadi, shuning uchun ikkalasidan bir xil yorliq chiqadi.
 * Tovar bo'lmasa bo'sh satr qaytaradi.
 */
export function buildLabelsHtml(items) {
  const labels = items.flatMap(it => {
    const n = Math.min(200, Math.max(1, parseInt(it.copies, 10) || 1));
    const one = `
      <div class="label">
        <div class="name">${esc(it.name)}</div>
        ${it.svg || ''}
        <div class="price">${money(it.price)} so'm</div>
      </div>`;
    return Array(n).fill(one);
  });

  if (labels.length === 0) return '';

  return `<!DOCTYPE html><html lang="uz"><head><meta charset="utf-8">
<title>Narx yorliqlari (${labels.length} ta)</title>
<style>${STYLES}</style></head><body>
${labels.join('')}
</body></html>`;
}

export function printLabels(items) {
  const html = buildLabelsHtml(items);
  if (!html) return false;

  const win = window.open('', '_blank');
  if (!win) return false;

  win.document.write(html.replace(
    '</body>',
    '<script>setTimeout(function(){ window.print(); window.close(); }, 500);<\/script></body>'
  ));
  win.document.close();
  return true;
}

/** Tovar uchun barcode qiymati — barcode yo'q bo'lsa IMEI yoki id */
export function codeOf(p) {
  return p.barcode || p.phone_imei1 || String(p.id).padStart(10, '0');
}
