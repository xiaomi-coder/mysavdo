import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // createClient bo'sh qiymat bilan tushunarsiz xato beradi — sababini aniq aytamiz.
  throw new Error(
    'Supabase sozlanmagan. Loyiha ildizida .env fayl yarating va ichiga yozing:\n' +
    '  REACT_APP_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  REACT_APP_SUPABASE_ANON_KEY=eyJ...\n' +
    'Namuna uchun .env.example ga qarang. Fayl qo\'shilgach dev serverni qayta ishga tushiring.'
  );
}

/* ── Foydalanuvchi tokeni ───────────────────────────────────────────────
   Login serverda bajariladi va JWT qaytaradi (ichida store_id va rol).
   Baza qatorlarni shu token bo'yicha filtrlaydi — boshqa do'konning
   ma'lumoti umuman qaytmaydi.

   Token yo'q bo'lsa Authorization sarlavhasi YUBORILMAYDI: PostgREST
   so'rovni anonim deb qabul qiladi va faqat login, katalog va onlayn
   buyurtmaga ruxsat beradi. Ilgari hamma so'rov anon kalit bilan
   ketardi va u barcha jadvallarni ochardi. */
let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

/* AI xizmati PostgREST dan tashqarida (mybazzar.uz/ai) — u ham shu
   tokenni so'raydi, shuning uchun tashqariga beriladi. Token brauzer
   xotirasida, diskda emas. */
export function getAuthToken() {
  return authToken;
}

/* ── Tanlangan filial ────────────────────────────────────────────────────
   Har so'rov X-Branch sarlavhasi bilan ketadi: raqam yoki 'all'. Baza
   (current_branch) qoldiq, sotuv va hisobotni shu filial bo'yicha
   qaytaradi. Sotuvchi filialga biriktirilgan bo'lsa, server sarlavhaga
   qaramaydi — tokendagi filial ustun. */
let activeBranch = null;

export function setActiveBranch(branch) {
  activeBranch = branch == null ? null : String(branch);
}

async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
  else headers.delete('Authorization');
  if (authToken && activeBranch) headers.set('X-Branch', activeBranch);
  return fetch(input, { ...init, headers });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: authFetch },
  auth: { persistSession: false, autoRefreshToken: false },
});
