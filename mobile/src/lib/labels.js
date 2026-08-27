import * as Print from 'expo-print';
import { buildLabelsHtml } from '@shared/labels';
import { barcodeSvg, codeOf } from './barcode';

/* Narx yorliqlarini chop etish — 40 × 30 mm stiker.

   Yorliq ko'rinishi veb ilova bilan bitta faylda turadi, shuning uchun
   kompyuterdan chop etilgan yorliq bilan telefondan chiqqani bir xil
   bo'ladi va rulon bir xil kesiladi. */

export { codeOf };

/**
 * items: [{ name, price, code, copies }]
 */
export async function printLabels(items) {
  const withSvg = items
    .filter((it) => (parseInt(it.copies, 10) || 0) > 0)
    .map((it) => ({
      name: it.name,
      price: it.price,
      copies: it.copies,
      svg: barcodeSvg(it.code, { width: 1.4, height: 40, fontSize: 10 }),
    }));

  const html = buildLabelsHtml(withSvg);
  if (!html) return false;

  await Print.printAsync({ html });
  return true;
}
