-- ══════════════════════════════════════════════════════════════════════════
-- Kredit qurilma — ro'yxatga olish ko'prigi (AMAPI enrollment)
--
-- Ilova Google'ga to'g'ridan-to'g'ri murojaat qilolmaydi (kalit serverda).
-- Shuning uchun oqim:
--   1. Ilova credit_devices ga pending qator qo'shadi
--   2. lock-worker AMAPI'dan enrollment token/QR oladi va shu qatorga yozadi
--   3. Ilova qatorni kuzatib, enroll_qr kelganda HAQIQIY QR ko'rsatadi
--   4. Do'konchi telefonda skanerlaydi → telefon ro'yxatdan o'tadi
--   5. lock-worker yangi qurilmani topib enrollment_id + status='active' qiladi
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE credit_devices
  ADD COLUMN IF NOT EXISTS enroll_qr      TEXT,        -- Google QR ichidagi JSON
  ADD COLUMN IF NOT EXISTS enroll_token   TEXT,        -- enrollment token qiymati
  ADD COLUMN IF NOT EXISTS enroll_error   TEXT,        -- token olishda xato bo'lsa
  ADD COLUMN IF NOT EXISTS enrolled_at    TIMESTAMPTZ; -- ro'yxatdan o'tgan vaqt

-- Ilova (mb_anon) enroll_qr/enroll_token ni o'qiy olishi kerak, lekin
-- yozishni faqat worker (mb_bot) qiladi. Anon GRANT allaqachon SELECT bergan.

COMMIT;
