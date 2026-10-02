import { getAuthToken } from './supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   AI maslahat xizmati bilan aloqa

   Xizmat PostgREST dan tashqarida turadi (mybazzar.uz/ai), chunki AI
   kaliti serverda qolishi kerak — brauzerga berilsa, uni har kim olib
   platforma hisobidan foydalanadi.

   Ilova bu yerga faqat o'z tokenini yuboradi; qaysi do'kon ekanini
   server tokendan o'zi aniqlaydi.
   ══════════════════════════════════════════════════════════════════════ */

const BASE = `${(process.env.REACT_APP_SUPABASE_URL || '').replace(/\/+$/, '')}/ai`;

async function call(path, body) {
  const token = getAuthToken();
  if (!token) return { error: 'Avval tizimga kiring' };
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || `Xatolik ${res.status}` };
    return data;
  } catch (_) {
    // Internet yo'q yoki xizmat to'xtagan — ikkalasi ham do'konchi uchun bir xil
    return { error: 'AI xizmatiga ulanib bo‘lmadi' };
  }
}

/** Do'kon uchun maslahat. Kuniga bir marta hisoblanadi (kesh). */
export const aiReport = (refresh = false) => call('/report', { refresh });

/** Kalitni sinash — faqat platforma egasi uchun. */
export const aiTest = () => call('/test');
