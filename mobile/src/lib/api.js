/* ══════════════════════════════════════════════════════════════════════════
   PostgREST mijozi

   Veb ilova supabase-js ishlatadi, lekin u faqat .from() va .rpc() dan
   foydalanadi — auth, storage, realtime ishlatilmaydi. Shu sababli
   mobil tomonda butun kutubxonani tortib yurishning hojati yo'q:
   quyidagi ~120 qator o'sha ikki narsani beradi va so'rov yozilishi
   veb bilan bir xil qoladi:

       const { data, error } = await db.from('products')
         .select('*').eq('store_id', 1).order('name');

   Shu tufayli veb sahifasidan mobil ekranga kod ko'chirganda so'rovlarni
   qayta yozish kerak emas.
   ══════════════════════════════════════════════════════════════════════ */

import Constants from 'expo-constants';

const cfg = Constants.expoConfig?.extra || {};
export const API_URL = cfg.apiUrl || 'https://mybazzar.uz';
const ANON_KEY = cfg.anonKey || '';
const REST = `${API_URL}/rest/v1`;

const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/* Internet yo'qligini alohida ajratamiz — foydalanuvchiga
   "server xato berdi" emas, "internet yo'q" deb aytish kerak. */
export class NetworkError extends Error {
  constructor() {
    super('Internet aloqasi yo\u2018q');
    this.offline = true;
  }
}

async function send(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new NetworkError();
  }
  const text = await res.text();
  let body = null;
  if (text) { try { body = JSON.parse(text); } catch { body = text; } }
  if (!res.ok) {
    const msg = (body && (body.message || body.hint)) || `Xato ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.code = body?.code;
    throw err;
  }
  return body;
}

/* Qiymatni PostgREST filtriga yaroqli holga keltiradi */
const enc = (v) => {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `(${v.map(enc).join(',')})`;
  return encodeURIComponent(String(v));
};

class Query {
  constructor(table) {
    this.table = table;
    this.params = [];
    this.cols = '*';
    this.method = 'GET';
    this.body = null;
    this.headers = {};
    this.wantSingle = false;
  }

  select(cols = '*') {
    this.cols = cols;
    if (this.method !== 'GET') this.headers.Prefer = 'return=representation';
    return this;
  }

  eq(col, v)   { this.params.push(`${col}=eq.${enc(v)}`); return this; }
  neq(col, v)  { this.params.push(`${col}=neq.${enc(v)}`); return this; }
  gt(col, v)   { this.params.push(`${col}=gt.${enc(v)}`); return this; }
  gte(col, v)  { this.params.push(`${col}=gte.${enc(v)}`); return this; }
  lt(col, v)   { this.params.push(`${col}=lt.${enc(v)}`); return this; }
  lte(col, v)  { this.params.push(`${col}=lte.${enc(v)}`); return this; }
  is(col, v)   { this.params.push(`${col}=is.${v === null ? 'null' : v}`); return this; }
  in(col, arr) { this.params.push(`${col}=in.(${arr.map(enc).join(',')})`); return this; }
  like(col, p) { this.params.push(`${col}=like.${enc(p)}`); return this; }
  ilike(col, p){ this.params.push(`${col}=ilike.${enc(p)}`); return this; }
  or(filter)   { this.params.push(`or=(${filter})`); return this; }

  order(col, opts = {}) {
    const dir = opts.ascending === false ? 'desc' : 'asc';
    this.params.push(`order=${col}.${dir}`);
    return this;
  }

  limit(n) { this.params.push(`limit=${n}`); return this; }
  range(from, to) { this.headers.Range = `${from}-${to}`; return this; }

  insert(rows) {
    this.method = 'POST';
    this.body = Array.isArray(rows) ? rows : [rows];
    this.headers.Prefer = 'return=representation';
    return this;
  }

  update(patch) {
    this.method = 'PATCH';
    this.body = patch;
    this.headers.Prefer = 'return=representation';
    return this;
  }

  delete() { this.method = 'DELETE'; return this; }

  single() { this.wantSingle = true; return this; }
  maybeSingle() { this.wantSingle = 'maybe'; return this; }

  _url() {
    const p = [...this.params];
    if (this.method === 'GET') p.unshift(`select=${this.cols}`);
    return `${REST}/${this.table}${p.length ? '?' + p.join('&') : ''}`;
  }

  /* await qilinganda ishga tushadi — supabase-js kabi.
     Xatoni tashlamaydi, { data, error } qaytaradi. */
  then(resolve, reject) {
    send(this._url(), {
      method: this.method,
      headers: { ...HEADERS, ...this.headers },
      body: this.body ? JSON.stringify(this.body) : undefined,
    })
      .then((data) => {
        let out = data;
        if (this.wantSingle) {
          const rows = Array.isArray(data) ? data : [];
          if (rows.length === 0 && this.wantSingle !== 'maybe') {
            return resolve({ data: null, error: new Error('Topilmadi') });
          }
          out = rows[0] ?? null;
        }
        resolve({ data: out, error: null });
      })
      .catch((error) => resolve({ data: null, error }));
    return { catch: () => {}, finally: (f) => { f?.(); } };
  }
}

export const db = {
  from: (table) => new Query(table),

  /* Serverdagi funksiyalarni chaqirish — apply_sale, move_stock,
     revert_sale, increment_customer_spent. */
  async rpc(name, args = {}) {
    try {
      const data = await send(`${REST}/rpc/${name}`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(args),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

/* Serverga yetib boryaptimizmi — offline bannerini ko'rsatish uchun */
export async function ping() {
  try {
    const res = await fetch(`${REST}/stores?select=id&limit=1`, { headers: HEADERS });
    return res.ok;
  } catch {
    return false;
  }
}
