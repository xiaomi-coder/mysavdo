-- ══════════════════════════════════════════════════════════════════════
-- AI maslahat — sozlama va kesh
--
-- Kalit QAYERDA: `private.secrets` da. Sabab — `platform_settings` ni
-- har bir do'kon ilovasi o'qiy oladi; kalit u yerda tursa, uni istalgan
-- do'konchi brauzer konsolidan olib, platforma hisobidan foydalanadi.
-- Parollar qanday saqlansa, kalit ham shunday: creator yozadi, hech kim
-- (creator ham) qaytarib o'qiy olmaydi.
--
-- Kalit ILOVAGA umuman berilmaydi: AI chaqiruvi server tomonda
-- (ai-service) bajariladi, ilova faqat natijani oladi.
--
-- Qayta ishga tushirsa bo'ladi.
-- ══════════════════════════════════════════════════════════════════════
BEGIN;

-- Provayder va model maxfiy emas — ochiq sozlamada
INSERT INTO platform_settings (key, value) VALUES
  ('ai_provider', 'claude'),
  ('ai_model', 'claude-haiku-4-5-20251001')
ON CONFLICT (key) DO NOTHING;

-- ── Tayyor tahlil (kesh) ───────────────────────────────────────────────
-- Do'kon kuniga bir marta hisoblanadi: sahifa 50 marta ochilsa ham
-- provayderga bir marta to'lanadi.
CREATE TABLE IF NOT EXISTS ai_reports (
  id         SERIAL PRIMARY KEY,
  store_id   INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  day        DATE NOT NULL DEFAULT current_date,
  text       TEXT NOT NULL,
  model      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_reports_day ON ai_reports(store_id, day);

ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS own_store ON ai_reports;
CREATE POLICY own_store ON ai_reports FOR SELECT TO mb_user
  USING (is_creator() OR (store_id = auth_store() AND (SELECT store_ok())));
GRANT SELECT ON ai_reports TO mb_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_reports TO mb_bot;
GRANT USAGE, SELECT ON SEQUENCE ai_reports_id_seq TO mb_bot;

-- ── Kalitni o'rnatish (faqat creator, faqat yozish) ────────────────────
CREATE OR REPLACE FUNCTION public.set_ai_config(
  p_provider TEXT, p_model TEXT, p_key TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
BEGIN
  IF NOT is_creator() THEN
    RAISE EXCEPTION 'Ruxsat yo‘q' USING ERRCODE = '42501';
  END IF;
  IF p_provider NOT IN ('claude', 'gemini') THEN
    RAISE EXCEPTION 'Provayder faqat claude yoki gemini bo‘ladi';
  END IF;

  INSERT INTO platform_settings (key, value, updated_at)
  VALUES ('ai_provider', p_provider, now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  INSERT INTO platform_settings (key, value, updated_at)
  VALUES ('ai_model', nullif(trim(coalesce(p_model, '')), ''), now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  -- Bo'sh qoldirilsa eski kalit saqlanadi (parol maydonidagi kabi)
  IF p_key IS NOT NULL AND length(trim(p_key)) > 10 THEN
    INSERT INTO private.secrets (key, value) VALUES ('ai_key', trim(p_key))
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  END IF;

  RETURN json_build_object('ok', true);
END $$;

-- ── Holat: kalit bormi (kalitning O'ZI hech qachon qaytmaydi) ──────────
CREATE OR REPLACE FUNCTION public.ai_config() RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, private AS $$
DECLARE has_key BOOLEAN;
BEGIN
  IF auth_role() IS NULL THEN RETURN NULL; END IF;
  SELECT EXISTS (SELECT 1 FROM private.secrets WHERE key = 'ai_key' AND length(value) > 10) INTO has_key;
  RETURN json_build_object(
    'provider', (SELECT value FROM platform_settings WHERE key = 'ai_provider'),
    'model',    (SELECT value FROM platform_settings WHERE key = 'ai_model'),
    'has_key',  has_key,
    -- Ilova shu bayroqqa qarab "AI maslahat" tugmasini ko'rsatadi
    'enabled',  has_key);
END $$;

REVOKE EXECUTE ON FUNCTION public.set_ai_config(TEXT, TEXT, TEXT), public.ai_config()
  FROM PUBLIC, mb_anon;
GRANT EXECUTE ON FUNCTION public.set_ai_config(TEXT, TEXT, TEXT) TO mb_user;   -- ichida creator tekshiriladi
GRANT EXECUTE ON FUNCTION public.ai_config() TO mb_user, mb_bot;

-- ── AI xizmati uchun ikkita tor eshik ──────────────────────────────────
-- Butun private.secrets ni ochmaymiz: u yerda JWT kaliti ham bor.
-- Xizmatga faqat shu ikki funksiya beriladi.

-- 1) AI kaliti — provayderga so'rov yuborish uchun
CREATE OR REPLACE FUNCTION private.ai_key() RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = private AS $$
  SELECT value FROM private.secrets WHERE key = 'ai_key'
$$;

-- 2) Tokenni tekshirish. Xizmat JWT kalitini umuman ko'rmaydi —
--    tokenni shu yerga beradi, javobiga ishonadi. Imzo qayta
--    hisoblanib solishtiriladi va muddati tekshiriladi.
CREATE OR REPLACE FUNCTION private.jwt_verify(p_token TEXT) RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, private AS $$
DECLARE
  secret TEXT;
  parts  TEXT[] := string_to_array(p_token, '.');
  body   JSON;
BEGIN
  IF array_length(parts, 1) <> 3 THEN RETURN NULL; END IF;
  SELECT value INTO secret FROM private.secrets WHERE key = 'jwt';
  IF secret IS NULL THEN RETURN NULL; END IF;

  IF private.b64url(hmac(parts[1] || '.' || parts[2], secret, 'sha256')) <> parts[3] THEN
    RETURN NULL;                                  -- imzo mos emas
  END IF;

  body := convert_from(decode(
    translate(parts[2], '-_', '+/') || repeat('=', (4 - length(parts[2]) % 4) % 4),
    'base64'), 'utf8')::JSON;

  IF (body ->> 'exp') IS NOT NULL AND (body ->> 'exp')::BIGINT < extract(epoch FROM now()) THEN
    RETURN NULL;                                  -- muddati o'tgan
  END IF;
  RETURN body;
END $$;

-- Xizmat provayder va modelni shu jadvaldan o'qiydi
GRANT SELECT ON platform_settings TO mb_bot;

GRANT USAGE ON SCHEMA private TO mb_bot;
REVOKE EXECUTE ON FUNCTION private.ai_key(), private.jwt_verify(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.ai_key(), private.jwt_verify(TEXT) TO mb_bot;

COMMIT;
