/* ══════════════════════════════════════════════════════════════════════════
   Tovar kartochkasidagi tayyor ro'yxatlar

   Brendlar, xotira o'lchamlari, tovar holati va belgilar. Bular veb
   ilovada ham, mobil ilovada ham bir xil bo'lishi shart: do'konchi
   kompyuterda "Xiaomi/Redmi" deb tanlagan tovar telefonda ham aynan
   shu kategoriyada turishi kerak, aks holda filtrlar ikkiga bo'linib
   ketadi.
   ══════════════════════════════════════════════════════════════════════ */

export const PHONE_BRANDS = [
  'Samsung', 'iPhone', 'Xiaomi/Redmi', 'Honor', 'Infinix',
  'Tecno', 'ZTE', 'Realme', 'OPPO', 'Vivo', 'Aksesuar', 'Boshqa',
];

export const MEMORIES = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];

export const CONDITIONS = [
  { value: 'Yangi', label: '✨ Yangi' },
  { value: 'B/U', label: '♻️ B/U' },
  { value: 'Refurbished', label: '🔧 Refurbished' },
];

export const EMOJIS = ['📦', '📱', '🎧', '🔌', '⌚', '💻', '🖥️', '⌨️', '🔗', '🥤', '🍪', '🧋'];

/** Tovar telefon sifatida yuritiladimi — model yoki IMEI bo'lsa ha */
export const isPhoneItem = (p) => Boolean(p?.phone_model || p?.phone_imei1);

/**
 * Telefonning nomi model va xotiradan yig'iladi: "Galaxy S24 Ultra 256GB".
 * Do'konchi nomni qo'lda yozmaydi — shunda ro'yxatda bir xil telefon
 * har xil yozilib ketmaydi.
 */
export const phoneName = (model, memory) =>
  [String(model || '').trim(), String(memory || '').trim()].filter(Boolean).join(' ');

/**
 * Skanerlangan raqamni qayerga qo'yishni aniqlaydi.
 * 15 xonali raqam — IMEI, boshqasi — seriya raqami.
 * Bo'sh IMEI-1 bo'lsa unga, keyin IMEI-2 ga tushadi.
 */
export function routeScannedCode(code, current = {}) {
  const digits = String(code || '').replace(/\D/g, '');
  if (digits.length === 15) {
    if (!current.imei1) return { field: 'imei1', value: digits };
    if (!current.imei2) return { field: 'imei2', value: digits };
    return { field: 'imei1', value: digits };
  }
  return { field: 'serial', value: String(code || '').trim() };
}
