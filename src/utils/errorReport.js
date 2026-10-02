import * as Sentry from '@sentry/react';

/* ══════════════════════════════════════════════════════════════════════════
   Xatolarni yig'ish (Sentry)

   Nega kerak: ilova do'konchining kompyuterida qulasa, biz buni faqat
   u qo'ng'iroq qilsa bilamiz. Ko'pchilik qo'ng'iroq qilmaydi — "ishlamas
   ekan" deb tashlab qo'yadi. Mobil ilova bir vaqtlar hammada ishga
   tushmay qulagan va buni faqat egasi aytgandan keyin bilganmiz.

   DSN yo'q bo'lsa hech narsa yuborilmaydi — kod shunchaki o'chiq turadi.
   Shuning uchun uni .env ga qo'shmaguncha ilova hozirgidek ishlayveradi.

   MIJOZ MA'LUMOTI YUBORILMAYDI: faqat xato matni, sahifa manzili va
   qaysi do'kon ekani. Parol, token va mijoz ismlari yuborilmaydi.
   ══════════════════════════════════════════════════════════════════════ */

const DSN = process.env.REACT_APP_SENTRY_DSN;

export function initErrorReport() {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV,
    // Foydalanuvchi yozgan matn (mijoz ismi, izoh) xato xabariga
    // tushib qolmasin
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend(event) {
      if (event.request?.headers) delete event.request.headers;
      return event;
    },
  });
}

/* Kim ishlatayotgani — xato qaysi do'konda bo'lganini bilish uchun.
   Ism va email yuborilmaydi, faqat raqam va rol. */
export function markUser(user) {
  if (!DSN) return;
  if (!user) { Sentry.setUser(null); return; }
  Sentry.setUser({ id: String(user.id || '') });
  Sentry.setTags({
    store_id: String(user.store_id || ''),
    store: user.storeName || '',
    role: user.role || '',
  });
}

/* Qulab tushmagan, lekin bilishimiz kerak bo'lgan xatolar uchun */
export function reportError(err, where) {
  if (!DSN) return;
  Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
    tags: { where: where || 'nomalum' },
  });
}
