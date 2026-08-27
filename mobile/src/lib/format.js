/* Raqam va sana ko'rinishi — butun ilova bo'ylab bir xil bo'lishi uchun */

/* 2450000 → "2 450 000". Bo'shliq oddiy probel emas, uzilmaydigan
   ingichka probel — raqam qator oxirida bo'linib ketmasin. */
export const money = (n) => {
  const v = Math.round(Number(n) || 0);
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  return (v < 0 ? '\u2212' : '') + s;
};

/* Katta summani qisqartiradi: 12 500 000 → "12,5 mln" */
export const shortMoney = (n) => {
  const v = Math.round(Number(n) || 0);
  const a = Math.abs(v);
  if (a >= 1e9) return (v / 1e9).toFixed(1).replace('.', ',') + ' mlrd';
  if (a >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' mln';
  if (a >= 1e3) return money(v);
  return money(v);
};

const OYLAR = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const KUNLAR = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba',
  'payshanba', 'juma', 'shanba'];

export const dateLong = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getDate()}-${OYLAR[x.getMonth()]}, ${KUNLAR[x.getDay()]}`;
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
export const ago = (d) => {
  const ms = Date.now() - new Date(d).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daq oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const dd = Math.floor(h / 24);
  if (dd === 1) return 'kecha';
  return `${dd} kun oldin`;
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
