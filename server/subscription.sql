-- ══════════════════════════════════════════════════════════════════════════
-- Obuna: tarif, to'lov muddati, xodim chegarasi
--
-- To'lov QO'LDA olinadi (egasi qarori). Tizim faqat hisobni yuritadi:
--   · stores.plan / paid_until / max_users — creator belgilaydi
--   · tariflar platform_settings.plans da — creator o'zi yaratadi/tahrirlaydi
--   · muddat tugagach grace_days (3) kun imtiyoz, keyin do'kon avtomatik
--     to'xtatiladi (lock-worker har kuni subscription_expire() ni chaqiradi)
--   · paid_until = NULL → muddat belgilanmagan, HECH QACHON to'xtatilmaydi.
--     Mavjud mijozlar sana qo'yilmaguncha avvalgidek ishlayveradi
--
-- To'xtatilgan do'kon: ilgari to'xtatish faqat yangi loginni bloklardi,
-- ochiq sessiya (30 kunlik token) ishlayverardi. Endi har so'rovda
-- store_ok() tekshiriladi va aniq xabar qaytadi (ma'lumot jimgina
-- bo'sh ko'rinmaydi — kassir "hammasi o'chib ketdi" deb o'ylamasin).
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS plan       TEXT,
  ADD COLUMN IF NOT EXISTS paid_until DATE,
  ADD COLUMN IF NOT EXISTS max_users  INTEGER;   -- NULL = cheklovsiz

INSERT INTO platform_settings (key, value) VALUES
  ('grace_days', '3'),
  ('plans', '[
     {"key":"start","name":"Start","price":null,"max_users":2},
     {"key":"biznes","name":"Biznes","price":null,"max_users":10},
     {"key":"pro","name":"Pro","price":null,"max_users":null}
   ]')
ON CONFLICT (key) DO NOTHING;

-- ── Do'kon faolmi — har so'rovda (RLS) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.store_ok() RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE a BOOLEAN;
BEGIN
  IF is_creator() OR auth_store() IS NULL THEN RETURN true; END IF;
  SELECT is_active INTO a FROM stores WHERE id = auth_store();
  IF a IS FALSE THEN
    RAISE EXCEPTION 'Do‘kon obunasi to‘xtatilgan. To‘lov uchun ma’muriyat bilan bog‘laning.'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN true;
END $$;

-- Mavjud siyosatlarga store_ok() qo'shamiz. (SELECT ...) — so'rov
-- boshida BIR MARTA hisoblanadi, har qatorda emas.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'credit_devices','customers','debts','expenses','products','purchases',
    'shifts','stock_movements','supplier_payments','suppliers',
    'telegram_chats','telegram_links','transactions'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS own_store ON %I', t);
    EXECUTE format($p$
      CREATE POLICY own_store ON %I FOR ALL TO mb_user
      USING (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer' AND (SELECT store_ok())))
      WITH CHECK (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer' AND (SELECT store_ok())))
    $p$, t);
  END LOOP;

  FOREACH t IN ARRAY ARRAY['credit_schedule','lock_commands'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS own_store ON %I', t);
    EXECUTE format($p$
      CREATE POLICY own_store ON %I FOR ALL TO mb_user
      USING (auth_role() <> 'dealer' AND (SELECT store_ok()) AND EXISTS (
        SELECT 1 FROM credit_devices d WHERE d.id = device_id
          AND (is_creator() OR d.store_id = auth_store())))
      WITH CHECK (auth_role() <> 'dealer' AND (SELECT store_ok()) AND EXISTS (
        SELECT 1 FROM credit_devices d WHERE d.id = device_id
          AND (is_creator() OR d.store_id = auth_store())))
    $p$, t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS dealer_own ON transactions;
CREATE POLICY dealer_own ON transactions FOR SELECT TO mb_user
  USING (auth_role() = 'dealer' AND store_id = auth_store() AND customer_id = auth_uid() AND (SELECT store_ok()));
DROP POLICY IF EXISTS dealer_own ON debts;
CREATE POLICY dealer_own ON debts FOR SELECT TO mb_user
  USING (auth_role() = 'dealer' AND store_id = auth_store() AND customer_id = auth_uid() AND (SELECT store_ok()));

-- ── Egasi obuna maydonlarini o'zi o'zgartira olmasin ───────────────────
CREATE OR REPLACE FUNCTION private.guard_store_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, private AS $$
BEGIN
  IF NOT is_creator() AND current_user = 'mb_user' THEN
    NEW.is_active    := OLD.is_active;
    NEW.max_branches := OLD.max_branches;
    NEW.store_type   := OLD.store_type;
    NEW.owner_email  := OLD.owner_email;
    NEW.plan         := OLD.plan;
    NEW.paid_until   := OLD.paid_until;
    NEW.max_users    := OLD.max_users;
  END IF;
  RETURN NEW;
END $$;

-- ── Xodim chegarasi (tarif bo'yicha) ───────────────────────────────────
-- Egasi hisobga kirmaydi. O'chirilgan (is_active=false) xodim ham
-- hisoblanmaydi — do'konchi eskisini o'chirib, yangisini qo'sha oladi.
CREATE OR REPLACE FUNCTION private.enforce_user_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE lim INTEGER; cnt INTEGER;
BEGIN
  IF NEW.store_id IS NULL OR NEW.role IN ('owner', 'creator') OR NEW.is_active IS FALSE THEN
    RETURN NEW;
  END IF;
  -- Allaqachon hisobda bo'lgan faol xodimni tahrirlash — tekshirmaymiz
  IF TG_OP = 'UPDATE' AND OLD.is_active IS NOT FALSE AND OLD.store_id = NEW.store_id
     AND OLD.role NOT IN ('owner', 'creator') THEN
    RETURN NEW;
  END IF;
  IF is_creator() THEN RETURN NEW; END IF;

  SELECT max_users INTO lim FROM stores WHERE id = NEW.store_id;
  IF lim IS NULL THEN RETURN NEW; END IF;

  SELECT count(*) INTO cnt FROM users
  WHERE store_id = NEW.store_id AND role NOT IN ('owner', 'creator')
    AND is_active IS NOT FALSE AND id <> NEW.id;
  IF cnt >= lim THEN
    RAISE EXCEPTION 'Tarifingiz bo‘yicha xodimlar soni: %. Ko‘proq xodim uchun tarifni oshiring.', lim
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_user_limit ON users;
CREATE TRIGGER trg_user_limit BEFORE INSERT OR UPDATE OF is_active, store_id, role ON users
  FOR EACH ROW EXECUTE FUNCTION private.enforce_user_limit();

-- ── Muddati o'tganlarni to'xtatish (lock-worker har kuni chaqiradi) ────
CREATE OR REPLACE FUNCTION public.subscription_expire()
RETURNS TABLE (store_id INTEGER, name TEXT, paid_until DATE)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE stores s SET is_active = false
  WHERE s.is_active IS NOT FALSE
    AND s.paid_until IS NOT NULL
    AND s.paid_until + coalesce((SELECT value::INTEGER FROM platform_settings WHERE key = 'grace_days'), 3)
        < current_date
  RETURNING s.id, s.name, s.paid_until
$$;

-- ── Joriy do'kon obunasi (ogohlantirish banneri uchun) ────────────────
-- store_ok() ni chaqirmaydi: to'xtatilgan do'konga ham holatini ko'rsatadi
CREATE OR REPLACE FUNCTION public.my_subscription() RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s stores%ROWTYPE;
  g INTEGER := coalesce((SELECT value::INTEGER FROM platform_settings WHERE key = 'grace_days'), 3);
  d INTEGER;
BEGIN
  IF auth_store() IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO s FROM stores WHERE id = auth_store();
  IF NOT FOUND THEN RETURN NULL; END IF;
  d := CASE WHEN s.paid_until IS NULL THEN NULL ELSE s.paid_until - current_date END;
  RETURN json_build_object(
    'plan', s.plan, 'paid_until', s.paid_until, 'days_left', d, 'grace_days', g,
    'max_users', s.max_users,
    'users', (SELECT count(*) FROM users WHERE store_id = s.id
              AND role NOT IN ('owner', 'creator') AND is_active IS NOT FALSE),
    'status', CASE WHEN s.is_active IS FALSE THEN 'paused'
                   WHEN d IS NULL THEN 'ok'
                   WHEN d < 0 THEN 'grace'
                   WHEN d <= 3 THEN 'soon'
                   ELSE 'ok' END);
END $$;

REVOKE EXECUTE ON FUNCTION public.store_ok(), public.subscription_expire(),
  public.my_subscription() FROM PUBLIC, mb_anon;
GRANT EXECUTE ON FUNCTION public.store_ok(), public.my_subscription() TO mb_user;
GRANT EXECUTE ON FUNCTION public.subscription_expire(), public.my_subscription() TO mb_bot;

COMMIT;
