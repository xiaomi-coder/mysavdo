/* Raqam, sana va telefon ko'rinishi — butun ilova bo'ylab bir xil.

   Til o'zgarganda sana nomlari ham o'zgarishi kerak, lekin bu
   funksiyalar oddiy (React'ga bog'liq bo'lmagan) funksiyalar —
   ular chek va yorliq chop etishda ham ishlatiladi. Shuning uchun
   til shu yerda modul darajasida saqlanadi, setLocale() esa
   I18nProvider tomonidan chaqiriladi. */

let locale = 'uz';

export function setLocale(lang) {
  locale = lang === 'ru' || lang === 'en' ? lang : 'uz';
}

export const getLocale = () => locale;

/* 2450000 → "2 450 000". Bo'shliq oddiy probel emas, ingichka
   uzilmaydigan probel — raqam qator oxirida bo'linib ketmasin. */
export const money = (n) => {
  const v = Math.round(Number(n) || 0);
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (v < 0 ? '−' : '') + s;
};

/* Katta summani qisqartiradi: 12 500 000 → "12,5 mln" */
const SHORT = {
  uz: { mlrd: ' mlrd', mln: ' mln', sep: ',' },
  ru: { mlrd: ' млрд', mln: ' млн', sep: ',' },
  en: { mlrd: 'B', mln: 'M', sep: '.' },
};

export const shortMoney = (n) => {
  const v = Math.round(Number(n) || 0);
  const a = Math.abs(v);
  const u = SHORT[locale] || SHORT.uz;
  if (a >= 1e9) return (v / 1e9).toFixed(1).replace('.', u.sep) + u.mlrd;
  if (a >= 1e6) return (v / 1e6).toFixed(1).replace('.', u.sep) + u.mln;
  return money(v);
};

const MONTHS = {
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
       'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
       'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'],
};

const DAYS = {
  uz: ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'],
  ru: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

/* Grafikdagi qisqa kun nomlari — Yakshanbadan boshlanadi */
export const WEEKDAYS = {
  uz: ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export const weekdayShort = (d) => (WEEKDAYS[locale] || WEEKDAYS.uz)[new Date(d).getDay()];

export const dateLong = (d = new Date()) => {
  const x = new Date(d);
  const m = (MONTHS[locale] || MONTHS.uz)[x.getMonth()];
  const w = (DAYS[locale] || DAYS.uz)[x.getDay()];
  if (locale === 'en') return `${m} ${x.getDate()}, ${w}`;
  if (locale === 'ru') return `${x.getDate()} ${m}, ${w}`;
  return `${x.getDate()}-${m}, ${w}`;
};

export const dateShort = (d) => {
  const x = new Date(d);
  return `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}`;
};

export const timeShort = (d) => {
  const x = new Date(d);
  return `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`;
};

/* "5 daqiqa oldin" — buyurtmalar ekranida ishlatiladi */
const AGO = {
  uz: { now: 'hozirgina', min: (n) => `${n} daq oldin`, hour: (n) => `${n} soat oldin`,
        yest: 'kecha', day: (n) => `${n} kun oldin` },
  ru: { now: 'только что', min: (n) => `${n} мин назад`, hour: (n) => `${n} ч назад`,
        yest: 'вчера', day: (n) => `${n} дн назад` },
  en: { now: 'just now', min: (n) => `${n} min ago`, hour: (n) => `${n} h ago`,
        yest: 'yesterday', day: (n) => `${n} days ago` },
};

export const ago = (d) => {
  const w = AGO[locale] || AGO.uz;
  const min = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (min < 1) return w.now;
  if (min < 60) return w.min(min);
  const h = Math.floor(min / 60);
  if (h < 24) return w.hour(h);
  const dd = Math.floor(h / 24);
  return dd === 1 ? w.yest : w.day(dd);
};

/* Ism bosh harflari — mijoz doirachasi uchun */
export const initials = (name) => String(name || '?')
  .trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?';

/* Telefon: 998901234567 → +998 90 123 45 67 */
export const phoneFmt = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('998')) {
    return `+998 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  }
  return p || '';
};

export const todayStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
