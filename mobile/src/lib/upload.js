import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import Constants from 'expo-constants';
import { API_URL } from './api';

/* ══════════════════════════════════════════════════════════════════════════
   Tovar suratini yuklash

   Telefon kamerasidagi surat 4-8 MB bo'ladi, server chegarasi esa
   2 MB — ustiga serverda rasm kichraytiradigan kutubxona yo'q.
   Shuning uchun surat telefonning o'zida kichraytiriladi va JPEG ga
   o'giriladi. Bu bir vaqtning o'zida internet trafigini ham tejaydi:
   mobil internetda 6 MB surat yuklash uzoq davom etadi.
   ══════════════════════════════════════════════════════════════════════ */

const MAX_SIDE = 1200;      // onlayn katalog uchun yetarli
const QUALITY = 0.82;

const anonKey = Constants.expoConfig?.extra?.anonKey || '';

/**
 * Surat manzilini qaytaradi ("/uploads/ab12….jpg") yoki xatoda null.
 * srcWidth — surat kengligi (ImagePicker qaytaradi). Berilsa, kichik
 * suratlar bekorga kattalashtirilmaydi.
 */
export async function uploadPhoto(uri, srcWidth) {
  try {
    const ctx = ImageManipulator.manipulate(uri);
    if (!srcWidth || srcWidth > MAX_SIDE) ctx.resize({ width: MAX_SIDE });

    const rendered = await ctx.renderAsync();
    const small = await rendered.saveAsync({ compress: QUALITY, format: SaveFormat.JPEG });

    const form = new FormData();
    form.append('file', {
      uri: small.uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const res = await fetch(`${API_URL}/api/upload.php`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${anonKey}` },
      body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return null;
    return data.url || null;
  } catch {
    return null;
  }
}

/** Nisbiy manzilni to'liq manzilga aylantiradi */
export function imageUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url}`;
}
