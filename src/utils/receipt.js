/* ══════════════════════════════════════════════════════════════════════════
   Chek chop etish

   Chek yangi oynada ochiladi va o'zi chop etish oynasini chaqiradi.
   Bu yerdagi HTML ilova dizayniga bog'liq emas — u termal printerga
   ketadi, oq qog'ozda qora siyoh bilan. Shuning uchun Nocturne
   tokenlari ishlatilmaydi.

   Ikki shablon: 'compact' (58mm, monospace) va 'detailed' (80mm, jadval).
   Tanlov Chek printer sozlamalarida, localStorage da saqlanadi.
   ══════════════════════════════════════════════════════════════════════ */

/** Chek printer sozlamalari — Chek bo'limida saqlanadi, shu yerda o'qiladi */
export const RECEIPT_SETTINGS_KEY = 'mybazzar_receipt_settings';

export const DEFAULT_RECEIPT_SETTINGS = {
  template: 'detailed',
  storeName: '', phone: '', address: '',
  footer: 'Xaridingiz uchun rahmat!',
  showLogo: false, logoUrl: '',
  showQr: false, qrUrl: '',
  fontSize: 'normal',
};

export function getReceiptSettings() {
  try {
    return { ...DEFAULT_RECEIPT_SETTINGS, ...JSON.parse(localStorage.getItem(RECEIPT_SETTINGS_KEY) || '{}') };
  } catch {
    return { ...DEFAULT_RECEIPT_SETTINGS };
  }
}

export function saveReceiptSettings(s) {
  localStorage.setItem(RECEIPT_SETTINGS_KEY, JSON.stringify(s));
}

const FONT_SCALE = { kichik: 0.9, normal: 1, katta: 1.15 };

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

const money = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU');

const PAY_LABELS = {
  cash: 'Naqd', card: 'Plastik', transfer: 'Transfer',
  nasiya: 'Nasiya', online: 'Onlayn',
};

/** Bitta savat qatorining chegirmadan keyingi narxi */
const netPriceOf = (item) => (Number(item.price) || 0) - (Number(item.itemDiscount) || 0);

/** Telefon do'konida model nomi, aks holda oddiy nom */
function titleOf(item, isPhone) {
  const base = isPhone ? (item.phone_model || item.name) : item.name;
  const mem = isPhone && item.phone_memory ? ` ${item.phone_memory}` : '';
  return esc(base + mem);
}

// ── 58mm ixcham shablon ───────────────────────────────────────────────
function compactHtml(d) {
  const rows = d.items.map(item => {
    const net = netPriceOf(item);
    return `
      <div style="margin-bottom:4px">
        <div class="bold">${titleOf(item, d.isPhone)}</div>
        ${d.isPhone && item.phone_imei1 ? `<div style="font-size:9px">IMEI: ${esc(item.phone_imei1)}</div>` : ''}
        <div style="display:flex;justify-content:space-between;font-size:11px">
          <span>${item.qty} x ${money(net)}</span>
          <span class="bold">${money(net * item.qty)}</span>
        </div>
      </div>`;
  }).join('');

  return `
  ${d.logo ? `<div class="center" style="margin-bottom:4px"><img src="${esc(d.logo)}" style="max-height:14mm;margin:0 auto"></div>` : ''}
  <div class="center bold" style="font-size:16px;margin-bottom:4px;text-transform:uppercase">${esc(d.storeName)}</div>
  ${d.address ? `<div class="center" style="font-size:10px">${esc(d.address)}</div>` : ''}
  ${d.phone ? `<div class="center" style="font-size:10px;margin-bottom:4px">${esc(d.phone)}</div>` : ''}
  <div class="center" style="margin-bottom:6px">Chek: ${String(d.receiptNo).padStart(6, '0')}</div>
  <div class="center" style="margin-bottom:6px;font-size:10px">${esc(d.dateText)}</div>

  <div>Kassir: ${esc(d.cashier)}</div>
  ${d.customer ? `<div>Mijoz: ${esc(d.customer.name)}</div>` : ''}
  ${d.customer?.phone ? `<div>Telefon: ${esc(d.customer.phone)}</div>` : ''}
  <div>To'lov: ${esc(d.payLabel)}</div>
  <div class="divider"></div>

  ${rows}
  <div class="divider"></div>

  ${d.discount > 0 ? `
  <div style="display:flex;justify-content:space-between">
    <span>Chegirma:</span><span>-${money(d.discount)}</span>
  </div>` : ''}
  <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-top:4px">
    <span>JAMI:</span><span>${money(d.total)} so'm</span>
  </div>

  ${d.debt > 0 ? `
  <div style="margin-top:8px;font-size:12px;font-weight:bold">Qarz: ${money(d.debt)} so'm</div>` : ''}

  <div class="divider"></div>
  ${d.qr ? `<div class="center" style="margin:6px 0"><img src="${esc(d.qr)}" style="width:22mm;height:22mm;margin:0 auto"></div>` : ''}
  <div class="center" style="font-size:11px">${esc(d.footer)}</div>
  <div class="center" style="font-size:10px;margin-top:2px">*** mybazzar.uz ***</div>`;
}

// ── 80mm batafsil jadval shabloni ─────────────────────────────────────
function detailedHtml(d) {
  const rows = d.items.map((item, i) => {
    const net = netPriceOf(item);
    return `
      <tr>
        <td class="center">${i + 1}</td>
        <td>
          ${titleOf(item, d.isPhone)}
          ${d.isPhone && item.phone_imei1 ? `<br><span style="font-size:8px">IMEI: ${esc(item.phone_imei1)}</span>` : ''}
        </td>
        <td class="center">dona</td>
        <td class="center">${item.qty}</td>
        <td class="right">${money(net)}</td>
        <td class="right">${money(net * item.qty)}</td>
      </tr>`;
  }).join('');

  return `
  ${d.logo ? `<div class="center" style="margin-bottom:4px"><img src="${esc(d.logo)}" style="max-height:16mm;margin:0 auto"></div>` : ''}
  <div class="center bold" style="font-size:16px;margin-bottom:4px;text-transform:uppercase">${esc(d.storeName)}</div>
  ${d.address ? `<div class="center info-text">${esc(d.address)}</div>` : ''}
  ${d.phone ? `<div class="center info-text">${esc(d.phone)}</div>` : ''}
  <div class="center bold" style="font-size:12px;margin-bottom:6px">Mahsulot chek bilan 30 KUN ichida qaytariladi</div>

  <div class="center bold" style="font-size:13px;margin-bottom:4px">Tovar cheki № ${String(d.receiptNo).padStart(6, '0')}</div>
  <div class="center info-text" style="margin-bottom:8px">${esc(d.dateText)}</div>

  <div class="info-text">Sotuvchi: ${esc(d.cashier)}</div>
  ${d.customer ? `<div class="info-text">Xaridor: ${esc(d.customer.name)}</div>` : ''}
  ${d.customer?.phone ? `<div class="info-text">Telefon: ${esc(d.customer.phone)}</div>` : ''}
  <div class="info-text">To'lov: ${esc(d.payLabel)}</div>

  <table class="bordered-table">
    <thead>
      <tr>
        <th style="width:5%">№</th><th style="width:40%">Nomi</th>
        <th style="width:10%">Birlik</th><th style="width:10%">Soni</th>
        <th style="width:15%">Narxi</th><th style="width:20%">Summa</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="total-table">
    <tr><td class="right">Chek summasi:</td><td class="right bold" style="width:35%">${money(d.subtotal)}</td></tr>
    <tr><td class="right">Chegirma:</td><td class="right bold">${money(d.discount)}</td></tr>
    <tr><td class="right">Jami:</td><td class="right bold" style="font-size:13px">${money(d.total)}</td></tr>
  </table>

  <div style="margin-top:8px;font-size:11px">
    Jami ${d.itemCount} dona, ${money(d.total)} so'm
  </div>

  ${d.debt > 0 ? `
  <div style="margin-top:10px;font-size:13px;font-weight:bold">Qarz: ${money(d.debt)} so'm</div>` : ''}

  <div class="divider"></div>
  ${d.qr ? `<div class="center" style="margin:6px 0"><img src="${esc(d.qr)}" style="width:24mm;height:24mm;margin:0 auto"></div>` : ''}
  <div class="center info-text">${esc(d.footer)}</div>
  <div class="center info-text" style="font-size:9px;margin-top:2px">*** mybazzar.uz ***</div>`;
}

const STYLES = {
  compact: `
    body { font-family: monospace; width: 58mm; margin: 0 auto; color: #000; font-size: 12px; padding: 2mm; box-sizing: border-box; }
    .center { text-align: center; } .bold { font-weight: bold; } .right { text-align: right; }
    .divider { border-bottom: 1px dashed #000; margin: 8px 0; }`,
  detailed: `
    body { font-family: Arial, sans-serif; width: 80mm; margin: 0 auto; color: #000; font-size: 11px; padding: 2mm; box-sizing: border-box; }
    .center { text-align: center; } .bold { font-weight: bold; } .right { text-align: right; }
    .bordered-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    .bordered-table th, .bordered-table td { border: 1px solid #000; padding: 4px; font-size: 10px; }
    .bordered-table th { font-weight: bold; text-align: center; }
    .info-text { font-size: 11px; margin-bottom: 3px; }
    .total-table { width: 100%; font-size: 11px; margin-top: 5px; border-collapse: collapse; }
    .total-table td { padding: 3px; }
    .divider { border-bottom: 1px dashed #000; margin: 10px 0; }`,
};

/**
 * Chekni yangi oynada ochib chop etadi.
 * Pop-up bloklangan bo'lsa false qaytaradi — chaqiruvchi foydalanuvchini
 * ogohlantirishi kerak.
 */
export function printReceipt({
  items, subtotal, discount, total, paidAmount = 0,
  payMethod, receiptNo, cashier, customer, storeName, isPhone,
  settings,
}) {
  const cfg = settings || getReceiptSettings();
  const compact = cfg.template === 'compact' || cfg.template === 'standard';
  const scale = FONT_SCALE[cfg.fontSize] || 1;

  const data = {
    items, subtotal, discount, total,
    debt: payMethod === 'nasiya' ? Math.max(0, total - Number(paidAmount || 0)) : 0,
    itemCount: items.reduce((s, i) => s + i.qty, 0),
    payLabel: PAY_LABELS[payMethod] || 'Naqd',
    receiptNo, cashier: cashier || 'Kassir', customer, isPhone,
    storeName: cfg.storeName || storeName || 'MyBazzar',
    address: cfg.address, phone: cfg.phone,
    footer: cfg.footer || 'Xaridingiz uchun rahmat!',
    logo: cfg.showLogo && cfg.logoUrl ? cfg.logoUrl : null,
    qr: cfg.showQr && cfg.qrUrl ? qrImageUrl(cfg.qrUrl) : null,
    dateText: new Date().toLocaleString('uz-UZ'),
  };

  const win = window.open('', '_blank');
  if (!win) return false;

  win.document.write(`<!DOCTYPE html>
<html lang="uz"><head><meta charset="utf-8"><title>Chek #${receiptNo}</title>
<style>@page { margin: 0; } ${compact ? STYLES.compact : STYLES.detailed}
body { font-size: ${(compact ? 12 : 11) * scale}px; }
@media print { body { width: 100%; margin: 0; padding: 0; } }</style>
</head><body>${compact ? compactHtml(data) : detailedHtml(data)}
<script>setTimeout(function(){ window.print(); window.close(); }, 400);<\/script>
</body></html>`);
  win.document.close();
  return true;
}

/** QR kodni rasmga aylantirish — chek oynasida JS ishlatmaslik uchun */
export function qrImageUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
}
