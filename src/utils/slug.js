/* ══════════════════════════════════════════════════════════════════════════
   Do'kon nomidan subdomain yasash

   "Texno Bozor"        →  texno-bozor
   "Sardor's Mobile"    →  sardors-mobile
   "Do'kon №1"          →  dokon-1
   "Мобайл Сити"        →  mobayl-siti

   Natija subdomain sifatida ishlatiladi: texno-bozor.mybazzar.uz
   ══════════════════════════════════════════════════════════════════════ */

// O'zbek va rus harflarini lotin alifbosiga o'girish
const MAP = {
  'ʼ': '', '‘': '', '’': '', "'": '', '`': '',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh',
  'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h',
  '№': 'n', '&': '-va-',
};

/** Nomdan subdomainga yaroqli qator yasaydi */
export function slugify(name = '') {
  const lowered = String(name).toLowerCase().trim();

  let out = '';
  for (const ch of lowered) {
    out += MAP[ch] !== undefined ? MAP[ch] : ch;
  }

  return out
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // urg'u belgilarini olib tashlaymiz
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '');
}

/* Subdomain sifatida band bo'lgan nomlar — ular ilovaning o'z
   xizmatlariga tegishli, do'konga berilmasligi kerak. */
const RESERVED = new Set([
  'www', 'api', 'mail', 'webmail', 'ftp', 'admin', 'app', 'cdn',
  'static', 'assets', 'uploads', 'shop', 'test', 'dev', 'staging',
]);

/**
 * Band bo'lmagan slug qaytaradi. `taken` — mavjud sluglar ro'yxati.
 * Band bo'lsa oxiriga raqam qo'shiladi: texno-bozor-2
 */
export function uniqueSlug(name, taken = []) {
  const base = slugify(name) || 'dokon';
  const busy = new Set([...taken.filter(Boolean), ...RESERVED]);

  if (!busy.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!busy.has(candidate)) return candidate;
  }
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}
