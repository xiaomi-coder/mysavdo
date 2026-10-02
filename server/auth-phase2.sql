-- ══════════════════════════════════════════════════════════════════════════
-- Xavfsizlik, 2-bosqich — qulflash
--
-- OLDINDAN SHART: auth-phase1.sql qo'llangan, PostgREST jwt-secret
-- private.secrets dagi bilan bir xil, veb va mobil yangi loginga o'tgan.
--
--   · mb_anon (= internetdagi hamma) faqat login, katalog va onlayn
--     buyurtmani chaqira oladi. Birorta jadvalni o'qiy/yoza olmaydi
--   · RLS: tizimga kirgan foydalanuvchi faqat o'z do'konini ko'radi,
--     creator hammasini, diler faqat o'z xaridlari va qarzini
--   · ochiq matndagi parollar o'chiriladi
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Anonimdan hammasini olamiz ──────────────────────────────────────
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM mb_anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM mb_anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, mb_anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.login(TEXT, TEXT)                        TO mb_anon;
GRANT EXECUTE ON FUNCTION public.storefront(TEXT)                         TO mb_anon;
GRANT EXECUTE ON FUNCTION public.place_order(INTEGER, TEXT, TEXT, JSON)  TO mb_anon;

-- Kirgan foydalanuvchi uchun
GRANT EXECUTE ON FUNCTION
  public.login(TEXT, TEXT), public.storefront(TEXT),
  public.place_order(INTEGER, TEXT, TEXT, JSON),
  public.auth_claim(TEXT), public.auth_store(), public.auth_uid(),
  public.auth_role(), public.is_creator(),
  public.apply_sale(INTEGER, TEXT), public.credit_pay(INTEGER, NUMERIC, TEXT),
  public.move_stock(INTEGER, INTEGER, TEXT, TEXT, TEXT, INTEGER),
  public.revert_sale(INTEGER, TEXT, TEXT), public.increment_customer_spent(INTEGER, NUMERIC),
  public.make_telegram_code(INTEGER, INTEGER, TEXT),
  public.log_stock_movement(), public.notify_new_order(), public.sync_product_photos()
TO mb_user;

-- Bot va qulf ijrochisi — ishonchli server jarayonlari
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO mb_bot;

-- ── 2. RLS: har kim faqat o'z do'koni ──────────────────────────────────
-- Do'kon xodimi (diler emas) o'z do'koni qatorlari bilan ishlaydi,
-- creator — hamma do'kon bilan.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'credit_devices','customers','debts','expenses','products','purchases',
    'shifts','stock_movements','supplier_payments','suppliers',
    'telegram_chats','telegram_links','transactions'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS own_store ON %I', t);
    EXECUTE format($p$
      CREATE POLICY own_store ON %I FOR ALL TO mb_user
      USING (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer'))
      WITH CHECK (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer'))
    $p$, t);
  END LOOP;
END $$;

-- Diler: faqat o'zining xaridlari va qarzi, faqat o'qish
DROP POLICY IF EXISTS dealer_own ON transactions;
CREATE POLICY dealer_own ON transactions FOR SELECT TO mb_user
  USING (auth_role() = 'dealer' AND store_id = auth_store() AND customer_id = auth_uid());
DROP POLICY IF EXISTS dealer_own ON debts;
CREATE POLICY dealer_own ON debts FOR SELECT TO mb_user
  USING (auth_role() = 'dealer' AND store_id = auth_store() AND customer_id = auth_uid());

-- To'lov jadvali va qulf buyruqlari — qurilma orqali do'konga bog'lanadi
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['credit_schedule','lock_commands'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS own_store ON %I', t);
    EXECUTE format($p$
      CREATE POLICY own_store ON %I FOR ALL TO mb_user
      USING (auth_role() <> 'dealer' AND EXISTS (
        SELECT 1 FROM credit_devices d WHERE d.id = device_id
          AND (is_creator() OR d.store_id = auth_store())))
      WITH CHECK (auth_role() <> 'dealer' AND EXISTS (
        SELECT 1 FROM credit_devices d WHERE d.id = device_id
          AND (is_creator() OR d.store_id = auth_store())))
    $p$, t);
  END LOOP;
END $$;

-- ── 3. Do'konlar ───────────────────────────────────────────────────────
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_own ON stores;
CREATE POLICY read_own ON stores FOR SELECT TO mb_user
  USING (is_creator() OR id = auth_store());
DROP POLICY IF EXISTS creator_write ON stores;
CREATE POLICY creator_write ON stores FOR ALL TO mb_user
  USING (is_creator()) WITH CHECK (is_creator());
DROP POLICY IF EXISTS owner_edit ON stores;
CREATE POLICY owner_edit ON stores FOR UPDATE TO mb_user
  USING (id = auth_store() AND auth_role() = 'owner')
  WITH CHECK (id = auth_store() AND auth_role() = 'owner');

-- Sozlamalar sahifasi butun qatorni yuboradi. Egasi tarifini, do'kon
-- turini yoki to'xtatilgan holatini o'zi o'zgartira olmasin.
CREATE OR REPLACE FUNCTION private.guard_store_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, private AS $$
BEGIN
  IF NOT is_creator() AND current_user = 'mb_user' THEN
    NEW.is_active    := OLD.is_active;
    NEW.max_branches := OLD.max_branches;
    NEW.store_type   := OLD.store_type;
    NEW.owner_email  := OLD.owner_email;
  END IF;
  RETURN NEW;
END $$;
GRANT USAGE ON SCHEMA private TO mb_user;
GRANT EXECUTE ON FUNCTION private.guard_store_update() TO mb_user;
DROP TRIGGER IF EXISTS trg_guard_store_update ON stores;
CREATE TRIGGER trg_guard_store_update BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION private.guard_store_update();

-- ── 4. Foydalanuvchilar ────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_own ON users;
CREATE POLICY read_own ON users FOR SELECT TO mb_user
  USING (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer'));

-- Yozish: creator — istalgan; egasi — o'z do'konida (creator'dan boshqa);
-- manager — faqat manager/sotuvchi. Hech kim o'zini creator qila olmaydi.
DROP POLICY IF EXISTS staff_write ON users;
CREATE POLICY staff_write ON users FOR ALL TO mb_user
  USING (is_creator() OR (store_id = auth_store() AND (
          auth_role() = 'owner' OR
          (auth_role() = 'manager' AND role IN ('manager','cashier')))))
  WITH CHECK (is_creator() OR (store_id = auth_store() AND role <> 'creator' AND (
          auth_role() = 'owner' OR
          (auth_role() = 'manager' AND role IN ('manager','cashier')))));

-- ── 5. Platforma sozlamalari va xizmat jadvallari ──────────────────────
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_all ON platform_settings;
CREATE POLICY read_all ON platform_settings FOR SELECT TO mb_user USING (true);
DROP POLICY IF EXISTS creator_write ON platform_settings;
CREATE POLICY creator_write ON platform_settings FOR ALL TO mb_user
  USING (is_creator()) WITH CHECK (is_creator());

ALTER TABLE demo_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS creator_only ON demo_data;
CREATE POLICY creator_only ON demo_data FOR ALL TO mb_user
  USING (is_creator()) WITH CHECK (is_creator());

-- ── 6. Ochiq parollar o'chiriladi ──────────────────────────────────────
-- Xeshlar 1-bosqichda private sxemaga ko'chirilgan. Endi trigger yangi
-- parolni ham xeshlab, ochiq matnni saqlamaydi.
CREATE OR REPLACE FUNCTION private.stash_user_password() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
BEGIN
  IF NEW.password IS NOT NULL AND NEW.password <> '' THEN
    INSERT INTO private.user_secrets (user_id, hash)
    VALUES (NEW.id, crypt(NEW.password, gen_salt('bf')))
    ON CONFLICT (user_id) DO UPDATE SET hash = EXCLUDED.hash;
  END IF;
  NEW.password := NULL;
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
  NEW.password := NULL;
  RETURN NEW;
END $$;

-- Tekshiruv: har bir paroli bor hisobning xeshi bo'lishi shart,
-- aks holda uni o'chirsak u odam tizimga kira olmay qoladi
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users u WHERE u.password IS NOT NULL AND u.password <> ''
             AND NOT EXISTS (SELECT 1 FROM private.user_secrets s WHERE s.user_id = u.id)) THEN
    RAISE EXCEPTION 'Xeshi yo‘q foydalanuvchi bor — to‘xtatildi';
  END IF;
END $$;

UPDATE users     SET password = NULL WHERE password IS NOT NULL;
UPDATE customers SET password = NULL WHERE password IS NOT NULL;

COMMIT;
