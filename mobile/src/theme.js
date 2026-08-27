/* ══════════════════════════════════════════════════════════════════════════
   MyBazzar mobil — rang tizimi

   Ranglar Claude Design'dagi dizayndan bir-biriga aynan ko'chirilgan.
   Ikki mavzu (tungi / kunduzgi) va uchta akcent rang bor: binafsha
   (asosiy), yashil, ko'k. Do'kon egasi o'ziga yoqqanini tanlaydi.

   Veb ilovada bular CSS o'zgaruvchisi edi; React Native'da CSS yo'q,
   shuning uchun oddiy obyekt qilib berilgan va useTheme() orqali
   olinadi.
   ══════════════════════════════════════════════════════════════════════ */

/* Tungi mavzu — asosiy ko'rinish */
const DARK = {
  page: '#101120',
  ring: '#0c0d16',
  shell: '#161826',
  nav: '#1b1d2b',
  inset: '#1c1e2c',
  card: '#232532',
  line: '#2b2741',
  line2: '#3f424d',
  scan1: '#191b28',
  scan2: '#141622',
  acc: '#9184d9',
  accdim: '#5d5294',
  acctext: '#d2cefd',
  t1: '#e9e9ed',
  t2: '#cfd3e5',
  t3: '#9397ab',
  t4: '#75798c',
  ok: '#5fd39a',
  warn: '#e8c268',
  err: '#e26d6d',
  blue: '#6aa8e8',
  accRgb: '145,132,217',
  okRgb: '95,211,154',
  warnRgb: '232,194,104',
  errRgb: '226,109,109',
  blueRgb: '106,168,232',
  shimRgb: '255,255,255',
  backdrop: 'rgba(6,7,14,.6)',
  succBg: 'rgba(16,17,32,.92)',
  onAcc: '#161826',   // akcent fon ustidagi matn
};

/* Kunduzgi mavzu */
const LIGHT = {
  page: '#e9ebf3',
  ring: '#dfe2ec',
  shell: '#f6f7fb',
  nav: '#ffffff',
  inset: '#eef0f6',
  card: '#ffffff',
  line: '#e9e8f4',
  line2: '#d5d8e4',
  scan1: '#e4e6ef',
  scan2: '#eceef5',
  acc: '#6a58c7',
  accdim: '#b3a8ea',
  acctext: '#4b3ab0',
  t1: '#1d1e2c',
  t2: '#3c3f52',
  t3: '#6b7086',
  t4: '#8a8fa3',
  ok: '#1f9d63',
  warn: '#b07f14',
  err: '#d24343',
  blue: '#2f7fd0',
  accRgb: '106,88,199',
  okRgb: '31,157,99',
  warnRgb: '176,127,20',
  errRgb: '210,67,67',
  blueRgb: '47,127,208',
  shimRgb: '25,28,50',
  backdrop: 'rgba(35,38,60,.35)',
  succBg: 'rgba(246,247,251,.92)',
  onAcc: '#ffffff',
};

/* Akcent ranglar — mavzu ustiga qo'yiladi */
const ACCENTS = {
  binafsha: {
    dark:  { acc: '#9184d9', accdim: '#5d5294', acctext: '#d2cefd', accRgb: '145,132,217' },
    light: { acc: '#6a58c7', accdim: '#b3a8ea', acctext: '#4b3ab0', accRgb: '106,88,199' },
  },
  yashil: {
    dark:  { acc: '#52c48d', accdim: '#2e7d57', acctext: '#bdeed6', accRgb: '82,196,141' },
    light: { acc: '#178a55', accdim: '#8fd4b2', acctext: '#0d6b40', accRgb: '23,138,85' },
  },
  kok: {
    dark:  { acc: '#5ea3e8', accdim: '#3a6ea8', acctext: '#cfe4fd', accRgb: '94,163,232' },
    light: { acc: '#2270c8', accdim: '#9cc4ee', acctext: '#14549c', accRgb: '34,112,200' },
  },
};

export const ACCENT_LIST = [
  { key: 'binafsha', label: 'Binafsha', swatch: '#9184d9' },
  { key: 'yashil',   label: 'Yashil',   swatch: '#52c48d' },
  { key: 'kok',      label: "Ko'k",     swatch: '#5ea3e8' },
];

export function buildTheme(mode = 'dark', accent = 'binafsha') {
  const base = mode === 'light' ? LIGHT : DARK;
  const a = (ACCENTS[accent] || ACCENTS.binafsha)[mode === 'light' ? 'light' : 'dark'];
  return { ...base, ...a, mode };
}

/* Shaffof akcent — soya va yumshoq fonlar uchun.
   RN'da color-mix yo'q, shuning uchun rgba qo'lda yig'iladi. */
export const alpha = (rgb, a) => `rgba(${rgb},${a})`;

/* O'lchamlar — dizayndagi qiymatlar */
export const R = {
  sm: 8, md: 12, lg: 14, xl: 16, pill: 19, sheet: 20,
};

/* Barmoq uchun eng kichik tegish maydoni. Dizaynda hamma tugma
   kamida 44px — telefonni bir qo'lda ushlab ishlatish uchun. */
export const TAP = 44;

/* Matn o'lchamlari */
export const FS = {
  h1: 24, h2: 19, h3: 17, big: 36, num: 22,
  body: 15, sm: 14, xs: 13, tiny: 12, micro: 11, nano: 10.5,
};

export const MONO = { android: 'monospace', ios: 'Menlo', default: 'monospace' };
