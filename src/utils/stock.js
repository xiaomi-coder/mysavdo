/* ══════════════════════════════════════════════════════════════════════════
   Qoldiq holatini aniqlash

   Ikki xil tovar bor va ular boshqacha hisoblanadi:

   NOYOB (IMEI yoki seriya raqami bor) — telefon, soat, noutbuk.
     Har biri alohida birlik. Qoldiq 1 bo'lishi NORMAL holat,
     ogohlantirish emas. 0 bo'lsa — sotilgan.

   ODDIY (barcode bilan) — chexol, kabel, zaryadlovchi.
     Miqdor bilan yuritiladi. minStock dan pastga tushsa ogohlantiradi,
     minStock belgilanmagan bo'lsa 5 dona chegara olinadi.

   Bu qoida Ombor jadvali, sidebar badge'i va Dashboard'dagi
   ogohlantirishlar uchun bir xil bo'lishi shart — shuning uchun
   bitta joyda turadi.
   ══════════════════════════════════════════════════════════════════════ */

/** Tovar noyob birlikmi (IMEI yoki S/N bilan yuritiladimi) */
export function isUnique(p) {
  return Boolean(p?.phone_imei1 || p?.phone_serial);
}

/** Ogohlantirish chegarasi — noyob tovarlar uchun ma'nosiz */
export function lowThreshold(p) {
  return p?.minStock || 5;
}

/** { key, label, variant, icon } */
export function stockStatus(p) {
  const stock = p?.stock ?? 0;

  if (stock <= 0) {
    return isUnique(p)
      ? { key: 'out', label: 'Sotilgan', variant: 'dang', icon: 'check' }
      : { key: 'out', label: 'Tugagan', variant: 'dang', icon: 'warning-circle' };
  }

  // Noyob tovar mavjud bo'lsa — bu normal holat, qancha borligi muhim emas
  if (isUnique(p)) return { key: 'ok', label: 'Sotuvda', variant: 'ok', icon: 'check' };

  if (stock <= lowThreshold(p)) {
    return { key: 'low', label: 'Kam qoldiq', variant: 'warn', icon: 'warning' };
  }
  return { key: 'ok', label: 'Normal', variant: 'ok', icon: 'check' };
}

/** Ogohlantirish kerakmi — sidebar badge va bildirishnomalar shuni sanaydi */
export function isLowStock(p) {
  return stockStatus(p).key === 'low';
}

export function isOutOfStock(p) {
  return (p?.stock ?? 0) <= 0;
}
