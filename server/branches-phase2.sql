-- ══════════════════════════════════════════════════════════════════════
-- Filiallar — 2-bosqich (branches.sql dan KEYIN ishga tushiriladi)
--
-- 1. Filial o'chirilmaydi, faqat faolsizlantiriladi. DELETE ruxsati
--    bo'lganda branch_stock CASCADE bilan birga o'chib, qoldiq jimgina
--    yo'qolardi.
-- 2. Faolsiz filialni qayta yoqish ham tarif chegarasini tekshiradi —
--    aks holda "o'chir → yangisini och → eskisini yoq" bilan chegara
--    chetlab o'tilardi.
-- 3. max_branches bo'sh (NULL) = cheklovsiz (xodimlar chegarasi kabi).
-- 4. my_subscription() filial chegarasi va sonini ham qaytaradi.
-- 5. transfers jadvaliga faqat transfer_* funksiyalari yozadi.
-- 6. shift_view endi branch_id ni ham ko'rsatadi.
-- 7. Xodim faqat o'z do'konining faol filialiga biriktiriladi.
--
-- Qayta ishga tushirsa bo'ladi.
-- ══════════════════════════════════════════════════════════════════════
BEGIN;

REVOKE DELETE ON branches FROM mb_user;

ALTER TABLE stores ALTER COLUMN max_branches DROP NOT NULL;

CREATE OR REPLACE FUNCTION private.guard_branches() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE lim INTEGER; cnt INTEGER;
BEGIN
  -- DIQQAT: SECURITY DEFINER ichida current_user doim egasi (postgres) —
  -- ilovadan kelganini tokendagi rol bilan aniqlaymiz
  IF auth_role() IS NOT NULL AND NOT is_creator()
     AND (TG_OP = 'INSERT' OR (NOT OLD.is_active AND NEW.is_active)) THEN
    SELECT max_branches INTO lim FROM stores WHERE id = NEW.store_id;
    SELECT count(*) INTO cnt FROM branches WHERE store_id = NEW.store_id AND is_active;
    IF lim IS NOT NULL AND cnt >= lim THEN
      RAISE EXCEPTION 'Tarifingiz bo‘yicha filiallar soni: %. Ko‘proq filial uchun tarifni oshiring.', lim
        USING ERRCODE = 'P0001';
    END IF;
    -- DIQQAT: faqat ilovadan qo'shilganda. Yangi do'konga "Asosiy filial"
    -- trigger orqali yaratiladi va uning is_main belgisiga tegilmasligi
    -- kerak — aks holda do'konda asosiy filial umuman bo'lmaydi va
    -- tovar qo'shish ham, kassa ochish ham ishlamaydi
    IF TG_OP = 'INSERT' THEN
      NEW.is_main := false;   -- asosiy filial faqat bitta, u o'zi yaratiladi
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.is_main := OLD.is_main;
    NEW.store_id := OLD.store_id;
    IF OLD.is_active AND NOT NEW.is_active THEN
      IF OLD.is_main THEN RAISE EXCEPTION 'Asosiy filialni o‘chirib bo‘lmaydi'; END IF;
      IF coalesce((SELECT sum(qty) FROM branch_stock WHERE branch_id = OLD.id), 0) <> 0 THEN
        RAISE EXCEPTION 'Filialda qoldiq bor — avval tovarni boshqa filialga ko‘chiring';
      END IF;
      IF EXISTS (SELECT 1 FROM transfers WHERE status = 'sent'
                 AND (from_branch = OLD.id OR to_branch = OLD.id)) THEN
        RAISE EXCEPTION 'Filialga yo‘ldagi ko‘chirish bor — avval uni yoping';
      END IF;
      IF EXISTS (SELECT 1 FROM shifts WHERE branch_id = OLD.id AND closed_at IS NULL) THEN
        RAISE EXCEPTION 'Filialda ochiq kassa smenasi bor — avval uni yoping';
      END IF;
      -- Filialga biriktirilgan xodimlar bo'shatiladi (aks holda ular
      -- yopilgan filialga qotib qolardi)
      UPDATE users SET branch_id = NULL WHERE branch_id = OLD.id;
    END IF;
  END IF;
  RETURN NEW;
END $$;

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
    'max_branches', s.max_branches,
    'branches', (SELECT count(*) FROM branches WHERE store_id = s.id AND is_active),
    'status', CASE WHEN s.is_active IS FALSE THEN 'paused'
                   WHEN d IS NULL THEN 'ok'
                   WHEN d < 0 THEN 'grace'
                   WHEN d <= 3 THEN 'soon'
                   ELSE 'ok' END);
END $$;

-- ── Ko'chirish faqat funksiyalar orqali ────────────────────────────────
-- Ilgari transfers jadvaliga to'g'ridan-to'g'ri yozish mumkin edi: "yo'lda"
-- holatidagi soxta ko'chirish qo'shib, keyin qabul qilib, yo'q joydan
-- qoldiq paydo qilsa bo'lardi. Endi yozish faqat transfer_* orqali —
-- ular do'kon, filial va tovar egaligini o'zlari tekshiradi.
CREATE OR REPLACE FUNCTION public.transfer_cancel(p_id INTEGER)
RETURNS void
LANGUAGE plpgsql SET search_path = public, private AS $$
DECLARE
  t transfers%ROWTYPE; it JSONB;
  pin INTEGER := (auth_claim('branch_id'))::INTEGER;
BEGIN
  SELECT * INTO t FROM transfers WHERE id = p_id AND store_id = auth_store() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ko‘chirish topilmadi'; END IF;
  IF t.status <> 'sent' THEN RAISE EXCEPTION 'Faqat yo‘ldagi ko‘chirishni bekor qilish mumkin'; END IF;
  IF pin IS NOT NULL AND pin <> t.from_branch THEN
    RAISE EXCEPTION 'Faqat yuborgan filial bekor qila oladi' USING ERRCODE = '42501';
  END IF;
  FOR it IN SELECT * FROM jsonb_array_elements(t.items) LOOP
    PERFORM move_stock((it ->> 'product_id')::INTEGER, (it ->> 'qty')::INTEGER, 'kochirish',
                       'ko‘chirish bekor qilindi', actor_name(), NULL, t.from_branch);
  END LOOP;
  UPDATE transfers SET status = 'cancelled', received_by = actor_name(), received_at = now()
  WHERE id = p_id;
END $$;

-- Funksiyalar INVOKER qoladi (RLS — diler, filial cheklovi — ishlayveradi).
-- Ularga funksiya darajasidagi belgi beriladi; trigger jadvalga faqat
-- shu belgi bor paytda yozishga ruxsat beradi. PostgREST set_config ni
-- ochmaydi, ya'ni belgini tashqaridan qo'yib bo'lmaydi.
ALTER FUNCTION public.transfer_send(INTEGER, INTEGER, JSON, TEXT) SET mb.transfer_fn = '1';
ALTER FUNCTION public.transfer_receive(INTEGER, JSON) SET mb.transfer_fn = '1';
ALTER FUNCTION public.transfer_cancel(INTEGER) SET mb.transfer_fn = '1';
REVOKE DELETE ON transfers FROM mb_user;

CREATE OR REPLACE FUNCTION private.transfers_guard() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth_role() IS NOT NULL AND coalesce(current_setting('mb.transfer_fn', true), '') <> '1' THEN
    RAISE EXCEPTION 'Ko‘chirish faqat yuborish/qabul qilish orqali o‘zgaradi' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_transfers_guard ON transfers;
CREATE TRIGGER trg_transfers_guard BEFORE INSERT OR UPDATE ON transfers
  FOR EACH ROW EXECUTE FUNCTION private.transfers_guard();

-- ── shift_view ga branch_id ─────────────────────────────────────────────
-- View `s.*` bilan yaratilgan — ustunlar yaratilgan paytda qotadi, shuning
-- uchun keyin qo'shilgan shifts.branch_id unda yo'q edi. Qayta yaratamiz.
DROP VIEW IF EXISTS shift_view;
CREATE VIEW shift_view WITH (security_invoker = true) AS
SELECT
  s.*,
  COALESCE(a.cash_net, 0)                    AS cash_net,
  COALESCE(a.sales_total, 0)                 AS sales_total,
  COALESCE(a.txn_count, 0)                   AS txn_count,
  COALESCE(a.return_count, 0)                AS return_count,
  s.opening_cash + COALESCE(a.cash_net, 0)   AS expected_cash,
  CASE WHEN s.counted_cash IS NULL THEN NULL
       ELSE s.counted_cash - (s.opening_cash + COALESCE(a.cash_net, 0))
  END                                        AS difference
FROM shifts s
LEFT JOIN LATERAL (
  SELECT
    SUM(t.total) FILTER (WHERE t.payment_method = 'cash')  AS cash_net,
    SUM(t.total)                                           AS sales_total,
    COUNT(*) FILTER (WHERE t.status = 'completed')         AS txn_count,
    COUNT(*) FILTER (WHERE t.status = 'returned')          AS return_count
  FROM transactions t
  WHERE t.shift_id = s.id
) a ON true;
GRANT SELECT ON shift_view TO mb_user, mb_bot;

-- ── Xodim faqat o'z do'koni filialiga biriktiriladi ────────────────────
CREATE OR REPLACE FUNCTION private.check_user_branch() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.branch_id IS NOT NULL AND NOT EXISTS (
       SELECT 1 FROM branches WHERE id = NEW.branch_id AND store_id = NEW.store_id AND is_active) THEN
    RAISE EXCEPTION 'Filial bu do‘konga tegishli emas yoki yopilgan' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_check_user_branch ON users;
CREATE TRIGGER trg_check_user_branch BEFORE INSERT OR UPDATE OF branch_id, store_id ON users
  FOR EACH ROW EXECUTE FUNCTION private.check_user_branch();

COMMIT;
