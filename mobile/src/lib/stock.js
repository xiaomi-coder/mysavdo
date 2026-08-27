/* Qoldiq holati qoidasi veb ilova bilan bitta joyda turadi:
   ../../src/utils/stock.js. Nusxa ko'chirilmaydi — qoida
   o'zgarsa ikkalasi birdan o'zgaradi.

   Sabab: telefon do'konida qoldiq 1 bo'lgan iPhone "kam qoldiq"
   emas — u noyob tovar, bittadan bo'lishi normal. Shu farqni
   veb va mobil boshqa-boshqa hisoblasa, hisobotlar mos kelmaydi. */
export { isUnique, lowThreshold, stockStatus, isLowStock, isOutOfStock } from '@shared/stock';

/* variant nomini mavzu rangiga o'giradi */
export const variantColor = (t, variant) => ({
  ok: t.ok, warn: t.warn, dang: t.err, info: t.blue,
}[variant] || t.t3);
