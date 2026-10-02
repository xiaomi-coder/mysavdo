-- ══════════════════════════════════════════════════════════════════════════
-- Xavfsizlik, 1-bosqich — server tomonida login va token
--
-- MUAMMO (2026-09-18 da topildi): PostgREST `mb_anon` roli bilan ishlaydi
-- va /rest/v1 internetga ochiq. mb_anon hamma jadvalda SELECT/INSERT/
-- UPDATE/DELETE huquqiga ega edi. Ya'ni kalitsiz istalgan odam barcha
-- parollarni o'qiy, boshqa do'kon sotuvlarini ko'ra va do'konlarni o'chira
-- olardi. Login esa BRAUZERDA ishlardi: parolni bazadan olib solishtirardi.
--
-- Bu bosqich hech narsani BUZMAYDI — faqat qo'shadi:
--   · parollar bcrypt bilan `private` sxemaga ko'chiriladi (PostgREST uni
--     ochmaydi — db-schemas = public)
--   · login() funksiyasi parolni SERVERDA tekshiradi va JWT beradi
--   · token ichida store_id va app_role — keyingi bosqichdagi RLS shunga tayanadi
--   · katalog va buyurtma uchun xavfsiz funksiyalar (narx serverda hisoblanadi)
--
-- 2-bosqich (auth-phase2.sql) mb_anon'ni yopadi va RLS'ni yoqadi.
-- JWT kaliti bu faylda YO'Q — deploy skripti uni private.secrets ga yozadi.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- ── Yashirin sxema: PostgREST ko'rmaydi ─────────────────────────────────
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;

CREATE TABLE IF NOT EXISTS private.secrets (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Parol xeshlari asosiy jadvalda turmaydi: `select=*` bilan ham chiqmasin
CREATE TABLE IF NOT EXISTS private.user_secrets (
  user_id INTEGER PRIMARY KEY,
  hash    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS private.customer_secrets (
  customer_id INTEGER PRIMARY KEY,
  hash        TEXT NOT NULL
);

-- Mavjud ochiq parollarni xeshlab ko'chiramiz (ochiq matn 2-bosqichda o'chadi)
INSERT INTO private.user_secrets (user_id, hash)
SELECT id, crypt(password, gen_salt('bf')) FROM users
WHERE password IS NOT NULL AND password <> ''
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO private.customer_secrets (customer_id, hash)
SELECT id, crypt(password, gen_salt('bf')) FROM customers
WHERE password IS NOT NULL AND password <> ''
ON CONFLICT (customer_id) DO NOTHING;

-- ── Parol yozilganda avtomatik xeshlash ─────────────────────────────────
-- Ilova kodi o'zgarmasin: xodim/diler yaratish hali ham `password`
-- maydonini yuboradi, trigger uni xeshlab yashirin jadvalga oladi.
-- 2-bosqichda trigger ochiq matnni ham o'chiradi (hozircha eski login
-- ishlashi uchun qoldiriladi).
CREATE OR REPLACE FUNCTION private.stash_user_password() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
BEGIN
  IF NEW.password IS NOT NULL AND NEW.password <> '' THEN
    INSERT INTO private.user_secrets (user_id, hash)
    VALUES (NEW.id, crypt(NEW.password, gen_salt('bf')))
    ON CONFLICT (user_id) DO UPDATE SET hash = EXCLUDED.hash;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.stash_customer_password() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
BEGIN
  IF NEW.password IS NOT NULL AND NEW.password <> '' THEN
    INSERT INTO private.customer_secrets (customer_id, hash)
    VALUES (NEW.id, crypt(NEW.password, gen_salt('bf')))
    ON CONFLICT (customer_id) DO UPDATE SET hash = EXCLUDED.hash;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_stash_user_password ON users;
CREATE TRIGGER trg_stash_user_password
  BEFORE INSERT OR UPDATE OF password ON users
  FOR EACH ROW EXECUTE FUNCTION private.stash_user_password();

DROP TRIGGER IF EXISTS trg_stash_customer_password ON customers;
CREATE TRIGGER trg_stash_customer_password
  BEFORE INSERT OR UPDATE OF password ON customers
  FOR EACH ROW EXECUTE FUNCTION private.stash_customer_password();

-- O'chirilgan hisobning xeshi qolmasin
CREATE OR REPLACE FUNCTION private.drop_user_secret() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
BEGIN
  DELETE FROM private.user_secrets WHERE user_id = OLD.id;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS trg_drop_user_secret ON users;
CREATE TRIGGER trg_drop_user_secret AFTER DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION private.drop_user_secret();

-- ── Tizimga kirgan foydalanuvchi roli ──────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mb_user') THEN
    CREATE ROLE mb_user NOLOGIN;
  END IF;
END $$;
GRANT mb_user TO mb_authenticator;
GRANT USAGE ON SCHEMA public TO mb_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mb_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mb_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO mb_user;

-- Bot va qulf ijrochisi to'g'ridan bazaga ulanadi va barcha do'konlar
-- bilan ishlaydi — RLS ularga taalluqli emas
ALTER ROLE mb_bot BYPASSRLS;

-- ── Token ichidagi ma'lumotni o'qish ───────────────────────────────────
-- PostgREST tasdiqlangan JWT claim'larini shu sozlamaga yozadi
CREATE OR REPLACE FUNCTION public.auth_claim(k TEXT) RETURNS TEXT
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claims', true), '')::json ->> k
$$;
CREATE OR REPLACE FUNCTION public.auth_store() RETURNS INTEGER
LANGUAGE sql STABLE AS $$ SELECT (public.auth_claim('store_id'))::INTEGER $$;
CREATE OR REPLACE FUNCTION public.auth_uid() RETURNS INTEGER
LANGUAGE sql STABLE AS $$ SELECT (public.auth_claim('uid'))::INTEGER $$;
CREATE OR REPLACE FUNCTION public.auth_role() RETURNS TEXT
LANGUAGE sql STABLE AS $$ SELECT public.auth_claim('app_role') $$;
CREATE OR REPLACE FUNCTION public.is_creator() RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$ SELECT coalesce(public.auth_claim('app_role') = 'creator', false) $$;

-- ── JWT imzolash (HS256) ───────────────────────────────────────────────
-- Kalit private.secrets da, PostgREST konfiguratsiyasidagi bilan bir xil.
CREATE OR REPLACE FUNCTION private.b64url(data BYTEA) RETURNS TEXT
LANGUAGE sql IMMUTABLE AS $$
  SELECT translate(rtrim(encode(data, 'base64'), '='), E'+/\n', '-_')
$$;

CREATE OR REPLACE FUNCTION private.jwt_sign(payload JSON) RETURNS TEXT
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, private AS $$
DECLARE
  secret TEXT;
  head TEXT := private.b64url(convert_to('{"alg":"HS256","typ":"JWT"}', 'utf8'));
  body TEXT := private.b64url(convert_to(payload::TEXT, 'utf8'));
BEGIN
  SELECT value INTO secret FROM private.secrets WHERE key = 'jwt';
  IF secret IS NULL THEN
    RAISE EXCEPTION 'JWT kaliti sozlanmagan';
  END IF;
  RETURN head || '.' || body || '.' ||
    private.b64url(hmac(head || '.' || body, secret, 'sha256'));
END $$;

-- ── Login ──────────────────────────────────────────────────────────────
-- Parol SERVERDA tekshiriladi. "Email yo'q" va "parol xato" uchun bitta
-- xabar — aks holda qaysi email ro'yxatda borligini bilib olish mumkin.
-- Token 30 kun amal qiladi: kassa offline ishlashi mumkin, har kuni
-- qayta kirish noqulay.
CREATE OR REPLACE FUNCTION public.login(p_email TEXT, p_password TEXT) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE
  u   users%ROWTYPE;
  c   customers%ROWTYPE;
  s   stores%ROWTYPE;
  exp BIGINT := extract(epoch FROM now() + INTERVAL '30 days')::BIGINT;
  bad TEXT := 'Email yoki parol noto‘g‘ri';
BEGIN
  SELECT * INTO u FROM users WHERE lower(email) = lower(trim(p_email)) LIMIT 1;

  IF FOUND THEN
    IF NOT EXISTS (SELECT 1 FROM private.user_secrets
                   WHERE user_id = u.id AND hash = crypt(p_password, hash)) THEN
      PERFORM pg_sleep(0.4);   -- ketma-ket taxmin qilishni sekinlatadi
      RAISE EXCEPTION '%', bad USING ERRCODE = '28P01';
    END IF;
    IF u.is_active = false THEN
      RAISE EXCEPTION 'Hisobingiz to‘xtatilgan. Do‘kon egasiga murojaat qiling.' USING ERRCODE = '28000';
    END IF;
    IF u.store_id IS NOT NULL THEN
      SELECT * INTO s FROM stores WHERE id = u.store_id;
      IF u.role <> 'creator' AND s.is_active = false THEN
        RAISE EXCEPTION 'Do‘koningiz faoliyati to‘xtatilgan. Ma’muriyat bilan bog‘laning.' USING ERRCODE = '28000';
      END IF;
    END IF;

    RETURN json_build_object(
      'token', private.jwt_sign(json_build_object(
        'role', 'mb_user', 'uid', u.id, 'store_id', u.store_id,
        'app_role', u.role, 'exp', exp)),
      'user', to_jsonb(u) - 'password',
      'store', CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object(
        'id', s.id, 'name', s.name, 'store_type', s.store_type, 'slug', s.slug,
        'is_active', s.is_active, 'address', s.address, 'phone', s.phone) END
    );
  END IF;

  -- Diler: customers jadvalidagi login bilan
  SELECT * INTO c FROM customers
  WHERE type = 'dealer' AND lower(login) = lower(trim(p_email)) LIMIT 1;
  IF FOUND AND EXISTS (SELECT 1 FROM private.customer_secrets
                       WHERE customer_id = c.id AND hash = crypt(p_password, hash)) THEN
    RETURN json_build_object(
      'token', private.jwt_sign(json_build_object(
        'role', 'mb_user', 'uid', c.id, 'store_id', c.store_id,
        'app_role', 'dealer', 'exp', exp)),
      'user', to_jsonb(c) - 'password',
      'store', NULL
    );
  END IF;

  PERFORM pg_sleep(0.4);
  RAISE EXCEPTION '%', bad USING ERRCODE = '28P01';
END $$;

-- ── Onlayn katalog (login'siz) ─────────────────────────────────────────
-- Faqat mijozga ko'rsatiladigan maydonlar. Tannarx, barcode va IMEI
-- tashqariga chiqmaydi — ilgari select('*') bilan tannarx ham ochiq edi.
CREATE OR REPLACE FUNCTION public.storefront(p_key TEXT) RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE s stores%ROWTYPE;
BEGIN
  IF p_key ~ '^\d+$' THEN
    SELECT * INTO s FROM stores WHERE id = p_key::INTEGER;
  ELSE
    SELECT * INTO s FROM stores WHERE slug = p_key;
  END IF;
  IF NOT FOUND OR s.is_active = false THEN
    RETURN json_build_object('store', NULL, 'products', '[]'::json);
  END IF;

  RETURN json_build_object(
    'store', json_build_object(
      'id', s.id, 'name', s.name, 'store_type', s.store_type, 'slug', s.slug,
      'address', s.address, 'phone', s.phone),
    'products', coalesce((
      SELECT json_agg(json_build_object(
        'id', p.id, 'name', p.name, 'category', p.category, 'price', p.price,
        'stock', p.stock, 'image', p.image, 'photo_url', p.photo_url,
        'photos', p.photos, 'description', p.description,
        'phone_model', p.phone_model, 'phone_memory', p.phone_memory,
        'phone_color', p.phone_color, 'phone_condition', p.phone_condition,
        'created_at', p.created_at))
      FROM products p WHERE p.store_id = s.id AND p.is_online), '[]'::json)
  );
END $$;

-- ── Onlayn buyurtma (login'siz) ────────────────────────────────────────
-- Ilgari summani BRAUZER yuborardi — istalgan tovarni 1 so'mga buyurtma
-- qilish mumkin edi. Endi narx bazadan olinadi, brauzer faqat id va
-- miqdor yuboradi.
CREATE OR REPLACE FUNCTION public.place_order(
  p_store INTEGER, p_name TEXT, p_phone TEXT, p_items JSON
) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cust  INTEGER;
  v_items JSONB := '[]'::JSONB;
  v_total NUMERIC := 0;
  it      JSON;
  p       products%ROWTYPE;
  q       INTEGER;
  v_no    TEXT;
BEGIN
  IF coalesce(trim(p_name), '') = '' OR coalesce(trim(p_phone), '') = '' THEN
    RAISE EXCEPTION 'Ism va telefon kerak';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM stores WHERE id = p_store AND is_active IS NOT FALSE) THEN
    RAISE EXCEPTION 'Do‘kon topilmadi';
  END IF;

  FOR it IN SELECT * FROM json_array_elements(p_items) LOOP
    q := greatest(1, least(99, coalesce((it ->> 'qty')::INTEGER, 1)));
    SELECT * INTO p FROM products
    WHERE id = (it ->> 'id')::INTEGER AND store_id = p_store AND is_online;
    CONTINUE WHEN NOT FOUND;
    v_items := v_items || jsonb_build_object(
      'id', p.id, 'name', p.name, 'price', p.price, 'qty', q,
      'cost_price', p.cost_price);
    v_total := v_total + p.price * q;
  END LOOP;

  IF jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'Savat bo‘sh';
  END IF;

  SELECT id INTO v_cust FROM customers
  WHERE store_id = p_store AND phone = trim(p_phone) LIMIT 1;
  IF v_cust IS NULL THEN
    INSERT INTO customers (store_id, name, phone, type, total_spent, purchases)
    VALUES (p_store, trim(p_name), trim(p_phone), 'regular', 0, 0)
    RETURNING id INTO v_cust;
  END IF;

  v_no := '#WEB-' || lpad((floor(random() * 90000) + 10000)::TEXT, 5, '0');
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items,
                            total, discount, payment_method, status)
  VALUES (p_store, v_cust, v_no, 'Saytdan: ' || trim(p_name) || ' · ' || trim(p_phone),
          v_items, v_total, 0, 'online', 'online_pending');

  RETURN json_build_object('receipt_no', v_no, 'total', v_total,
                           'count', jsonb_array_length(v_items));
END $$;

-- ── Telegram havolasi: rol va do'kon tokendan olinadi ──────────────────
-- Ilgari p_role istalgan qiymat edi — do'kon egasi o'ziga 'creator'
-- havolasini yaratib, butun platforma statistikasini olishi mumkin edi.
CREATE OR REPLACE FUNCTION public.make_telegram_code(
  p_store INTEGER, p_user INTEGER DEFAULT NULL, p_role TEXT DEFAULT 'owner'
) RETURNS TEXT
LANGUAGE plpgsql AS $$
DECLARE v_code TEXT;
BEGIN
  IF auth_role() IS NOT NULL THEN   -- token bilan chaqirilgan (ilova)
    IF p_role = 'creator' AND NOT is_creator() THEN
      RAISE EXCEPTION 'Ruxsat yo‘q' USING ERRCODE = '42501';
    END IF;
    IF NOT is_creator() AND p_store IS DISTINCT FROM auth_store() THEN
      RAISE EXCEPTION 'Ruxsat yo‘q' USING ERRCODE = '42501';
    END IF;
  END IF;

  DELETE FROM telegram_links WHERE expires_at < now() - INTERVAL '1 day';
  LOOP
    v_code := lpad((random() * 999999)::INT::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM telegram_links WHERE code = v_code AND used_at IS NULL);
  END LOOP;
  INSERT INTO telegram_links (code, store_id, user_id, role, expires_at)
  VALUES (v_code, p_store, p_user, p_role, now() + INTERVAL '15 minutes');
  RETURN v_code;
END $$;

-- ── Viewlar chaqiruvchi huquqi bilan ishlasin ──────────────────────────
-- Aks holda view egasi (postgres) nomidan ishlab, RLS'ni chetlab o'tadi
ALTER VIEW credit_device_view SET (security_invoker = true);
ALTER VIEW imei_billing_view  SET (security_invoker = true);
ALTER VIEW shift_view         SET (security_invoker = true);
ALTER VIEW supplier_balances  SET (security_invoker = true);

-- ── Funksiyalarga ruxsat ───────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.login(TEXT, TEXT)              TO mb_anon, mb_user;
GRANT EXECUTE ON FUNCTION public.storefront(TEXT)               TO mb_anon, mb_user;
GRANT EXECUTE ON FUNCTION public.place_order(INTEGER, TEXT, TEXT, JSON) TO mb_anon, mb_user;
GRANT EXECUTE ON FUNCTION public.auth_claim(TEXT), public.auth_store(), public.auth_uid(),
  public.auth_role(), public.is_creator() TO mb_anon, mb_user, mb_bot;
GRANT EXECUTE ON FUNCTION public.apply_sale(INTEGER, TEXT), public.credit_pay(INTEGER, NUMERIC, TEXT),
  public.move_stock(INTEGER, INTEGER, TEXT, TEXT, TEXT, INTEGER),
  public.revert_sale(INTEGER, TEXT, TEXT), public.increment_customer_spent(INTEGER, NUMERIC),
  public.make_telegram_code(INTEGER, INTEGER, TEXT) TO mb_user;

COMMIT;
