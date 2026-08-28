-- ══════════════════════════════════════════════════════════════════════════
-- MyBazzar — Telegram bot
--
-- Bot ikki ish qiladi:
--   1) do'kon egasiga xabar yuboradi (yangi buyurtma, kunlik xulosa)
--   2) so'rov bo'yicha statistika beradi
--
-- Buning uchun Telegram hisobini do'kon bilan bog'lash kerak. Bog'lash
-- BIR MARTALIK KOD orqali: ilovada kod ko'rsatiladi, egasi uni botga
-- yuboradi. Shu yo'l tanlandi, chunki:
--   · botga hech qanday parol yozilmaydi
--   · kodning umri qisqa, ya'ni tasodifan boshqaga tushib qolsa ham
--     foydasi yo'q
--   · egasi istagan vaqtda uzib qo'ya oladi
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Bog'langan Telegram hisoblari ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS telegram_chats (
  chat_id     BIGINT PRIMARY KEY,           -- Telegram chat identifikatori
  store_id    INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- 'owner'   — do'kon egasi, hamma narsani ko'radi
  -- 'creator' — tizim egasi, barcha do'konlarni ko'radi
  role        TEXT NOT NULL DEFAULT 'owner',

  name        TEXT,
  username    TEXT,

  -- Qaysi xabarlarni oladi
  notify_orders BOOLEAN NOT NULL DEFAULT TRUE,   -- yangi onlayn buyurtma
  notify_daily  BOOLEAN NOT NULL DEFAULT TRUE,   -- kunlik xulosa
  notify_alerts BOOLEAN NOT NULL DEFAULT TRUE,   -- kam qoldiq, kechikkan nasiya

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tg_store ON telegram_chats(store_id);

-- ── Bir martalik bog'lash kodi ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS telegram_links (
  code       TEXT PRIMARY KEY,
  store_id   INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'owner',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ
);

-- ── Kod yaratish ─────────────────────────────────────────────────────────
-- Ilova shu funksiyani chaqiradi va chiqqan kodni ekranda ko'rsatadi.
-- Kod 6 xonali, 15 daqiqa yashaydi.
CREATE OR REPLACE FUNCTION make_telegram_code(p_store INTEGER, p_user INTEGER DEFAULT NULL,
                                              p_role TEXT DEFAULT 'owner')
RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Eskirganlarini tozalaymiz — jadval o'sib ketmasin
  DELETE FROM telegram_links WHERE expires_at < now() - INTERVAL '1 day';

  LOOP
    v_code := lpad((random() * 999999)::INT::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM telegram_links WHERE code = v_code AND used_at IS NULL);
  END LOOP;

  INSERT INTO telegram_links (code, store_id, user_id, role, expires_at)
  VALUES (v_code, p_store, p_user, p_role, now() + INTERVAL '15 minutes');

  RETURN v_code;
END;
$$;

-- ── Yangi buyurtma haqida darhol xabar ───────────────────────────────────
-- Bot bazani so'rab turmaydi: baza o'zi xabar beradi. Shu tufayli
-- buyurtma tushgan zahoti telefonga yetadi va ortiqcha so'rov bo'lmaydi.
CREATE OR REPLACE FUNCTION notify_new_order() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'online_pending' THEN
    PERFORM pg_notify('mb_order', NEW.id::TEXT);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_order ON transactions;
CREATE TRIGGER trg_notify_order
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION notify_new_order();

-- ── Ruxsatlar ────────────────────────────────────────────────────────────
-- Ilova faqat kod yaratadi va bog'lanish holatini ko'radi.
-- telegram_chats ni bot o'zi to'ldiradi (o'z ulanishi bilan).
GRANT SELECT ON telegram_chats TO mb_anon;
GRANT DELETE ON telegram_chats TO mb_anon;      -- egasi uzib qo'ya olsin
GRANT EXECUTE ON FUNCTION make_telegram_code(INTEGER, INTEGER, TEXT) TO mb_anon;

COMMIT;

NOTIFY pgrst, 'reload schema';
