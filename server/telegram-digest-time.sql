-- ══════════════════════════════════════════════════════════════════════════
-- MyBazzar — kunlik xulosa vaqtini har do'kon o'zi tanlaydi
--
-- Ilgari xulosa hamma uchun 21:00 da ketardi. Lekin do'konlar har xil
-- yopiladi: biri 17:00, boshqasi 19:00, uchinchisi kechgacha ishlaydi.
-- Do'kon yopilmasdan kelgan "kun yakuni" esa noto'g'ri raqam beradi.
--
-- Vaqt CHAT bo'yicha saqlanadi, do'kon bo'yicha emas: egasi va menejer
-- bir do'konda ishlab, xabarni har xil vaqtda olishni xohlashi mumkin.
--
-- Server Asia/Tashkent da, ya'ni soat mahalliy vaqtda.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE telegram_chats
  ADD COLUMN IF NOT EXISTS digest_hour SMALLINT NOT NULL DEFAULT 21,
  -- Qaysi kun uchun yuborilgani. Bot qayta ishga tushsa ham bir kunda
  -- ikki marta yubormasligi uchun xotirada emas, bazada saqlanadi.
  ADD COLUMN IF NOT EXISTS last_digest DATE;

ALTER TABLE telegram_chats
  DROP CONSTRAINT IF EXISTS telegram_chats_digest_hour_check;
ALTER TABLE telegram_chats
  ADD CONSTRAINT telegram_chats_digest_hour_check CHECK (digest_hour BETWEEN 0 AND 23);

-- Ilova faqat shu ustunlarni o'zgartira oladi. store_id va role ga
-- tegib bo'lmaydi — aks holda ochiq kalit bilan boshqa do'konga
-- ulanib olish mumkin bo'lardi.
GRANT UPDATE (digest_hour, notify_orders, notify_daily, notify_alerts)
  ON telegram_chats TO mb_anon;

COMMIT;

NOTIFY pgrst, 'reload schema';
