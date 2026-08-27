import ru from './ru';
import en from './en';

/* ══════════════════════════════════════════════════════════════════════════
   Tarjimon — sof funksiya, React'ga bog'liq emas

   Kalit sifatida o'zbekcha matnning o'zi ishlatiladi. Sabab: kod
   o'zbekcha yozilgan va uni sun'iy kalitlarga ("pos.cart.title")
   ko'chirish 7 000 qator kodni o'qib bo'lmaydigan qilib qo'yardi.
   Ustiga tarjima topilmasa o'zbekchasi chiqadi — hech qayerda bo'sh
   joy yoki "missing.key" ko'rinmaydi.

   Qidirish uch bosqichda:
     1) aniq moslik      — "Sotuv" → "Продажа"
     2) namuna bo'yicha  — "3 tovar kam qoldi" → "3 товара заканчивается"
     3) topilmasa o'zbekchasi
   ══════════════════════════════════════════════════════════════════════ */

export const DICTS = { ru, en };

/* Ko'p qatorli JSX matni bitta qatorga keltiriladi */
export const norm = (s) => s.replace(/\s+/g, ' ').trim();

/* Namunani ({0} bilan) muntazam ifodaga aylantiramiz */
function compile(pattern) {
  const esc = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('^' + esc.replace(/\\\{(\d+)\\\}/g, '(.+?)') + '$');
}

const compiled = new Map();
function patternsFor(lang) {
  if (!compiled.has(lang)) {
    compiled.set(lang, (DICTS[lang]?.patterns || []).map(([uz, tr]) => [compile(uz), tr]));
  }
  return compiled.get(lang);
}

/**
 * Tarjimon yasaydi.
 *
 * keepSpace — matn atrofidagi bo'shliqni saqlaydi. JSX ichida
 * "{count} dona · {sum} so'm" ko'rinishida yozilgan bo'laklar uchun
 * kerak: u yerdagi bo'shliq matnning bir qismi.
 */
export function makeTranslator(lang) {
  const dict = DICTS[lang];
  if (!dict) return (s) => s;

  return function tr(s, keepSpace) {
    if (typeof s !== 'string' || !s) return s;

    const core = norm(s);
    if (!core) return s;

    let out = dict.exact[core];
    if (out === undefined) {
      for (const [re, tpl] of patternsFor(lang)) {
        const m = core.match(re);
        if (m) { out = tpl.replace(/\{(\d+)\}/g, (_, i) => m[Number(i) + 1]); break; }
      }
    }
    if (out === undefined) return s;

    if (keepSpace) {
      return s.match(/^\s*/)[0] + out + s.match(/\s*$/)[0];
    }
    return out;
  };
}
