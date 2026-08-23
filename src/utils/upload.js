/* ══════════════════════════════════════════════════════════════════════════
   Mahsulot rasmini yuklash

   Rasm brauzerda kichraytiriladi va JPEG ga o'giriladi, keyin serverga
   yuboriladi. Sabab: telefon kamerasidagi surat 3-8 MB bo'ladi, server
   chegarasi esa 2 MB. Ustiga serverda GD/Imagick o'rnatilmagan, ya'ni
   u yerda kichraytirib bo'lmaydi.
   ══════════════════════════════════════════════════════════════════════ */

const MAX_SIDE = 1200;   // katalog uchun yetarli
const QUALITY = 0.82;
const ENDPOINT = `${process.env.REACT_APP_SUPABASE_URL || ''}/api/upload.php`;

/** Faylni <img> ga yuklab, o'lchamini olish */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Rasm ochilmadi')); };
    img.src = url;
  });
}

/** Uzun tomonini MAX_SIDE ga tushirib, JPEG blob qaytaradi */
async function shrink(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  // Shaffof PNG lar chekda qora bo'lib chiqmasligi uchun oq fon
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => b ? resolve(b) : reject(new Error('Rasm tayyorlanmadi')),
      'image/jpeg',
      QUALITY
    );
  });
}

/**
 * Rasmni yuklaydi va manzilini qaytaradi (masalan "/uploads/ab12….jpg").
 * Xatolik bo'lsa tushunarli matn bilan Error tashlaydi.
 */
export async function uploadImage(file) {
  if (!file) throw new Error('Fayl tanlanmadi');
  if (!file.type.startsWith('image/')) throw new Error('Faqat rasm fayllari');

  const blob = await shrink(file);

  const form = new FormData();
  form.append('file', blob, 'photo.jpg');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}` },
    body: form,
  });

  let data = {};
  try { data = await res.json(); } catch { /* javob JSON emas */ }

  if (!res.ok) throw new Error(data.error || `Yuklanmadi (${res.status})`);
  return data.url;
}

/** Nisbiy manzilni to'liq manzilga aylantiradi */
export function imageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${process.env.REACT_APP_SUPABASE_URL || ''}${url}`;
}
