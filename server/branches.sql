-- ══════════════════════════════════════════════════════════════════════════
-- Filiallar — haqiqiy ko'p filialli do'kon
--
-- Ilgari filial faqat nomda edi: Inventory.js da qattiq yozilgan uchta
-- nom va qoldiqni shunchaki ayiradigan "ko'chirish". Bazada filial umuman
-- yo'q edi.
--
-- DIZAYN: filial mantiqi BAZADA. `products` nomi saqlanadi, lekin endi
-- view: `stock` = JORIY FILIALDAGI qoldiq ("barcha filiallar" rejimida
-- jami). Shu sababli kassa, ombor, AI tahlil, hisobotlar, bot — mavjud
-- kod deyarli o'zgarmasdan filial bo'yicha ishlaydi.
--
-- Joriy filial (current_branch):
--   · sotuvchi filialga biriktirilgan bo'lsa — tokendagi branch_id
--     (o'zgartira olmaydi)
--   · aks holda so'rovdagi `X-Branch` sarlavhasi (egasi tanlagani);
--     'all' = barcha filiallar
--   · sarlavha yo'q — asosiy filial (eski ilova versiyalari shunday
--     ishlaydi va hozirgi bir filialli do'konlar hech narsa sezmaydi)
--   · bot/creator/anonim (do'kon konteksti yo'q) — barcha filiallar
--
-- Mijozlar, nasiya, kredit telefonlar — UMUMIY (bir filialda olingan
-- nasiya boshqasida to'lanadi). Sotuv, smena, xarajat, kirim, ombor
-- tarixi — filialga bog'lanadi.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Filiallar ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id         SERIAL PRIMARY KEY,
  store_id   INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT,
  phone      TEXT,
  is_main    BOOLEAN NOT NULL DEFAULT false,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_branches_store ON branches(store_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_branches_one_main ON branches(store_id) WHERE is_main;

-- Har do'konga asosiy filial (manzil va telefon do'kondan)
INSERT INTO branches (store_id, name, address, phone, is_main)
SELECT s.id, 'Asosiy filial', s.address, s.phone, true
FROM stores s
WHERE NOT EXISTS (SELECT 1 FROM branches b WHERE b.store_id = s.id AND b.is_main);

CREATE OR REPLACE FUNCTION public.main_branch(p_store INTEGER) RETURNS INTEGER
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM branches WHERE store_id = p_store AND is_main LIMIT 1
$$;

-- Yangi do'kon ochilganda asosiy filial o'zi yaratiladi
CREATE OR REPLACE FUNCTION private.store_main_branch() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
BEGIN
  INSERT INTO branches (store_id, name, address, phone, is_main)
  VALUES (NEW.id, 'Asosiy filial', NEW.address, NEW.phone, true);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_store_main_branch ON stores;
CREATE TRIGGER trg_store_main_branch AFTER INSERT ON stores
  FOR EACH ROW EXECUTE FUNCTION private.store_main_branch();

-- ── 2. Joriy filial ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_branch() RETURNS INTEGER
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s   INTEGER := auth_store();
  pin INTEGER := (auth_claim('branch_id'))::INTEGER;
  h   TEXT;
  b   INTEGER;
BEGIN
  IF s IS NULL THEN RETURN NULL; END IF;          -- bot/creator/anonim: hammasi
  IF pin IS NOT NULL THEN RETURN pin; END IF;     -- biriktirilgan xodim
  h := nullif(current_setting('request.headers', true), '')::json ->> 'x-branch';
  IF h = 'all' THEN RETURN NULL; END IF;
  IF h ~ '^\d+$' THEN
    SELECT id INTO b FROM branches WHERE id = h::INTEGER AND store_id = s AND is_active;
    IF FOUND THEN RETURN b; END IF;
  END IF;
  RETURN main_branch(s);
END $$;

-- Ko'rinish: creator va "barcha filiallar" — hammasi, aks holda joriy filial
CREATE OR REPLACE FUNCTION public.branch_visible(b INTEGER) RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT is_creator() OR current_branch() IS NULL OR b = current_branch()
$$;

-- ── 3. Filial bo'yicha qoldiq ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branch_stock (
  branch_id  INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id   INTEGER NOT NULL,
  qty        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (branch_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_branch_stock_product ON branch_stock(product_id);

-- Hozirgi butun qoldiq asosiy filialga o'tadi
INSERT INTO branch_stock (branch_id, product_id, store_id, qty)
SELECT b.id, p.id, p.store_id, p.stock
FROM products p JOIN branches b ON b.store_id = p.store_id AND b.is_main
ON CONFLICT (branch_id, product_id) DO NOTHING;

-- ── 4. Hujjatlarga filial ──────────────────────────────────────────────
ALTER TABLE transactions    ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id);
ALTER TABLE shifts          ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id);
ALTER TABLE expenses        ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id);
ALTER TABLE purchases       ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id);
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id);
ALTER TABLE users           ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;

UPDATE transactions    t SET branch_id = main_branch(t.store_id) WHERE branch_id IS NULL;
UPDATE shifts          t SET branch_id = main_branch(t.store_id) WHERE branch_id IS NULL;
UPDATE expenses        t SET branch_id = main_branch(t.store_id) WHERE branch_id IS NULL;
UPDATE purchases       t SET branch_id = main_branch(t.store_id) WHERE branch_id IS NULL;
UPDATE stock_movements t SET branch_id = main_branch(t.store_id) WHERE branch_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_txn_branch ON transactions(branch_id);

-- Yozuvga filial avtomatik qo'yiladi. Biriktirilgan xodim boshqa filial
-- nomidan yoza olmaydi; filial boshqa do'konga tegishli bo'lsa — rad.
CREATE OR REPLACE FUNCTION private.set_branch() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE pin INTEGER := (auth_claim('branch_id'))::INTEGER;
BEGIN
  IF pin IS NOT NULL THEN
    NEW.branch_id := pin;
  ELSIF NEW.branch_id IS NULL THEN
    NEW.branch_id := coalesce(current_branch(), main_branch(NEW.store_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM branches WHERE id = NEW.branch_id AND store_id = NEW.store_id) THEN
    RAISE EXCEPTION 'Filial bu do‘konga tegishli emas' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['transactions','shifts','expenses','purchases','stock_movements'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_branch ON %I', t);
    EXECUTE format('CREATE TRIGGER trg_set_branch BEFORE INSERT ON %I
                    FOR EACH ROW EXECUTE FUNCTION private.set_branch()', t);
  END LOOP;
END $$;

-- ── 5. products → katalog + filial qoldig'i ────────────────────────────
-- Eski trigger products.stock ni kuzatardi — endi qoldiq branch_stock da
DROP TRIGGER IF EXISTS trg_stock_movement ON products;
ALTER TABLE products RENAME TO product_catalog;
ALTER TABLE product_catalog DROP COLUMN stock;

-- Ustunlar tartibi eski products bilan bir xil — select('*') o'zgarmaydi.
-- current_branch() bir marta hisoblanadi (FROM ichidagi subquery).
CREATE VIEW public.products WITH (security_invoker = true) AS
SELECT c.id, c.store_id, c.name, c.barcode, c.category, c.cost_price, c.price,
  coalesce(CASE WHEN cb.br IS NULL
    THEN (SELECT sum(bs.qty) FROM branch_stock bs WHERE bs.product_id = c.id)
    ELSE (SELECT bs.qty FROM branch_stock bs WHERE bs.product_id = c.id AND bs.branch_id = cb.br)
  END, 0)::INTEGER AS stock,
  c."minStock", c.image, c.phone_model, c.phone_memory, c.phone_color,
  c.phone_imei1, c.phone_imei2, c.phone_serial, c.phone_condition,
  c.created_at, c.photo_url, c.is_online, c.description, c.photos,
  coalesce((SELECT sum(bs.qty) FROM branch_stock bs WHERE bs.product_id = c.id), 0)::INTEGER AS stock_total
FROM product_catalog c
CROSS JOIN (SELECT current_branch() AS br) cb;

ALTER VIEW products ALTER COLUMN id         SET DEFAULT nextval('products_id_seq');
ALTER VIEW products ALTER COLUMN cost_price SET DEFAULT 0;
ALTER VIEW products ALTER COLUMN price      SET DEFAULT 0;
ALTER VIEW products ALTER COLUMN stock      SET DEFAULT 0;
ALTER VIEW products ALTER COLUMN "minStock" SET DEFAULT 0;
ALTER VIEW products ALTER COLUMN created_at SET DEFAULT now();
ALTER VIEW products ALTER COLUMN is_online  SET DEFAULT true;
ALTER VIEW products ALTER COLUMN photos     SET DEFAULT '[]'::jsonb;

-- Qoldiqni belgilangan filialda o'rnatish (tarix triggeri yozadi)
CREATE OR REPLACE FUNCTION private.set_branch_qty(p_product INTEGER, p_store INTEGER, p_qty INTEGER)
RETURNS void LANGUAGE plpgsql SET search_path = public, private AS $$
DECLARE br INTEGER := current_branch();
BEGIN
  IF br IS NULL THEN
    -- "Barcha filiallar": bitta faol filial bo'lsa — o'sha, aks holda noaniq
    IF (SELECT count(*) FROM branches WHERE store_id = p_store AND is_active) = 1 THEN
      br := main_branch(p_store);
    ELSE
      RAISE EXCEPTION 'Qoldiqni o‘zgartirish uchun filialni tanlang' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  INSERT INTO branch_stock (branch_id, product_id, store_id, qty)
  VALUES (br, p_product, p_store, p_qty)
  ON CONFLICT (branch_id, product_id) DO UPDATE SET qty = EXCLUDED.qty;
END $$;

CREATE OR REPLACE FUNCTION private.products_insert() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, private AS $$
BEGIN
  INSERT INTO product_catalog (id, store_id, name, barcode, category, cost_price, price,
    "minStock", image, phone_model, phone_memory, phone_color, phone_imei1, phone_imei2,
    phone_serial, phone_condition, created_at, photo_url, is_online, description, photos)
  VALUES (NEW.id, NEW.store_id, NEW.name, NEW.barcode, NEW.category, coalesce(NEW.cost_price, 0),
    coalesce(NEW.price, 0), coalesce(NEW."minStock", 0), NEW.image, NEW.phone_model,
    NEW.phone_memory, NEW.phone_color, NEW.phone_imei1, NEW.phone_imei2, NEW.phone_serial,
    NEW.phone_condition, coalesce(NEW.created_at, now()), NEW.photo_url,
    coalesce(NEW.is_online, true), NEW.description, coalesce(NEW.photos, '[]'::jsonb));

  IF coalesce(NEW.stock, 0) <> 0 THEN
    PERFORM set_config('mb.move_type', 'boshlangich', true);
    PERFORM private.set_branch_qty(NEW.id, NEW.store_id, NEW.stock);
  END IF;

  -- Katalog triggeri photo_url ni photos dan to'ldiradi — javobda ham shu bo'lsin
  SELECT photo_url, photos INTO NEW.photo_url, NEW.photos FROM product_catalog WHERE id = NEW.id;
  NEW.stock := coalesce(NEW.stock, 0);
  NEW.stock_total := NEW.stock;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.products_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, private AS $$
BEGIN
  UPDATE product_catalog SET
    name = NEW.name, barcode = NEW.barcode, category = NEW.category,
    cost_price = NEW.cost_price, price = NEW.price, "minStock" = NEW."minStock",
    image = NEW.image, phone_model = NEW.phone_model, phone_memory = NEW.phone_memory,
    phone_color = NEW.phone_color, phone_imei1 = NEW.phone_imei1, phone_imei2 = NEW.phone_imei2,
    phone_serial = NEW.phone_serial, phone_condition = NEW.phone_condition,
    photo_url = NEW.photo_url, is_online = NEW.is_online, description = NEW.description,
    photos = NEW.photos
  WHERE id = OLD.id;

  IF NEW.stock IS DISTINCT FROM OLD.stock THEN
    PERFORM private.set_branch_qty(OLD.id, OLD.store_id, NEW.stock);
  END IF;

  SELECT photo_url, photos INTO NEW.photo_url, NEW.photos FROM product_catalog WHERE id = OLD.id;
  NEW.stock_total := coalesce((SELECT sum(qty) FROM branch_stock WHERE product_id = OLD.id), 0);
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION private.products_delete() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, private AS $$
BEGIN
  DELETE FROM product_catalog WHERE id = OLD.id;
  RETURN OLD;
END $$;

CREATE TRIGGER trg_products_insert INSTEAD OF INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION private.products_insert();
CREATE TRIGGER trg_products_update INSTEAD OF UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION private.products_update();
CREATE TRIGGER trg_products_delete INSTEAD OF DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION private.products_delete();

-- ── 6. Ombor tarixi endi filial qoldig'idan yoziladi ───────────────────
CREATE OR REPLACE FUNCTION public.log_branch_stock() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_before INTEGER := CASE WHEN TG_OP = 'INSERT' THEN 0 ELSE OLD.qty END;
  v_type   TEXT;
BEGIN
  IF NEW.qty = v_before THEN RETURN NEW; END IF;
  v_type := coalesce(nullif(current_setting('mb.move_type', true), ''),
                     CASE WHEN TG_OP = 'INSERT' THEN 'boshlangich' ELSE 'tuzatish' END);
  INSERT INTO stock_movements
    (store_id, product_id, branch_id, type, qty, stock_before, stock_after,
     transaction_id, note, actor)
  VALUES
    (NEW.store_id, NEW.product_id, NEW.branch_id, v_type, NEW.qty - v_before, v_before, NEW.qty,
     nullif(current_setting('mb.move_txn', true), '')::INTEGER,
     nullif(current_setting('mb.move_note', true), ''),
     nullif(current_setting('mb.move_actor', true), ''));
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_branch_stock_log ON branch_stock;
CREATE TRIGGER trg_branch_stock_log AFTER INSERT OR UPDATE OF qty ON branch_stock
  FOR EACH ROW EXECUTE FUNCTION public.log_branch_stock();

-- ── 7. Qoldiq harakati filial bo'yicha ─────────────────────────────────
DROP FUNCTION IF EXISTS public.move_stock(INTEGER, INTEGER, TEXT, TEXT, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION public.move_stock(
  p_product INTEGER, p_qty INTEGER, p_type TEXT,
  p_note TEXT DEFAULT NULL, p_actor TEXT DEFAULT NULL,
  p_txn INTEGER DEFAULT NULL, p_branch INTEGER DEFAULT NULL
) RETURNS INTEGER
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_store INTEGER;
  v_name  TEXT;
  v_stock INTEGER;
  br      INTEGER;
BEGIN
  SELECT store_id, name INTO v_store, v_name FROM product_catalog WHERE id = p_product;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tovar topilmadi (id=%)', p_product;
  END IF;

  br := coalesce(p_branch, current_branch(), main_branch(v_store));
  IF NOT EXISTS (SELECT 1 FROM branches WHERE id = br AND store_id = v_store) THEN
    RAISE EXCEPTION 'Filial topilmadi' USING ERRCODE = '42501';
  END IF;

  INSERT INTO branch_stock (branch_id, product_id, store_id, qty)
  VALUES (br, p_product, v_store, 0) ON CONFLICT (branch_id, product_id) DO NOTHING;

  SELECT qty INTO v_stock FROM branch_stock
  WHERE branch_id = br AND product_id = p_product FOR UPDATE;

  IF v_stock + p_qty < 0 THEN
    RAISE EXCEPTION '% — bu filialda % dona bor, % dona chiqarib bo‘lmaydi',
      v_name, v_stock, abs(p_qty);
  END IF;

  PERFORM set_config('mb.move_type',  p_type, true);
  PERFORM set_config('mb.move_note',  coalesce(p_note, ''),  true);
  PERFORM set_config('mb.move_actor', coalesce(p_actor, ''), true);
  PERFORM set_config('mb.move_txn',   coalesce(p_txn::TEXT, ''), true);

  UPDATE branch_stock SET qty = qty + p_qty
  WHERE branch_id = br AND product_id = p_product
  RETURNING qty INTO v_stock;
  RETURN v_stock;
END $$;

-- Sotuv qaysi filialda bo'lsa — o'sha filialdan yechiladi
CREATE OR REPLACE FUNCTION public.apply_sale(p_txn INTEGER, p_actor TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_item JSONB; v_items JSONB; v_receipt TEXT; v_branch INTEGER;
BEGIN
  SELECT items, receipt_no, branch_id INTO v_items, v_receipt, v_branch
    FROM transactions WHERE id = p_txn;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sotuv topilmadi (id=%)', p_txn;
  END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(coalesce(v_items, '[]'::jsonb)) LOOP
    IF (v_item->>'id') IS NULL THEN CONTINUE; END IF;
    PERFORM move_stock((v_item->>'id')::INTEGER, -coalesce((v_item->>'qty')::INTEGER, 1),
                       'sotuv', v_receipt, p_actor, p_txn, v_branch);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.revert_sale(p_txn INTEGER, p_actor TEXT DEFAULT NULL, p_note TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_item JSONB; v_items JSONB; v_branch INTEGER;
BEGIN
  SELECT items, branch_id INTO v_items, v_branch FROM transactions WHERE id = p_txn;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sotuv topilmadi (id=%)', p_txn;
  END IF;
  FOR v_item IN SELECT * FROM jsonb_array_elements(coalesce(v_items, '[]'::jsonb)) LOOP
    IF (v_item->>'id') IS NULL THEN CONTINUE; END IF;
    PERFORM move_stock((v_item->>'id')::INTEGER, coalesce((v_item->>'qty')::INTEGER, 1),
                       'qaytarish', p_note, p_actor, p_txn, v_branch);
  END LOOP;
END $$;

-- ── 8. Filiallar orasida ko'chirish (yuborildi → qabul qilindi) ────────
CREATE TABLE IF NOT EXISTS transfers (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  from_branch INTEGER NOT NULL REFERENCES branches(id),
  to_branch   INTEGER NOT NULL REFERENCES branches(id),
  items       JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{product_id, name, qty}]
  received    JSONB,                               -- [{product_id, qty}]
  status      TEXT NOT NULL DEFAULT 'sent',        -- sent | received | cancelled
  note        TEXT,
  sent_by     TEXT,
  received_by TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  received_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_transfers_store ON transfers(store_id, status);

CREATE OR REPLACE FUNCTION private.actor_name() RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce((SELECT name FROM users WHERE id = auth_uid()), 'tizim')
$$;

CREATE OR REPLACE FUNCTION public.transfer_send(
  p_from INTEGER, p_to INTEGER, p_items JSON, p_note TEXT DEFAULT NULL
) RETURNS INTEGER
LANGUAGE plpgsql SET search_path = public, private AS $$
DECLARE
  s INTEGER := auth_store();
  pin INTEGER := (auth_claim('branch_id'))::INTEGER;
  it JSON; q INTEGER; pid INTEGER; v_items JSONB := '[]'::jsonb; v_id INTEGER; v_name TEXT; v_to TEXT;
BEGIN
  IF p_from = p_to THEN RAISE EXCEPTION 'Bir xil filialga ko‘chirib bo‘lmaydi'; END IF;
  IF (SELECT count(*) FROM branches WHERE id IN (p_from, p_to) AND store_id = s AND is_active) <> 2 THEN
    RAISE EXCEPTION 'Filial topilmadi' USING ERRCODE = '42501';
  END IF;
  IF pin IS NOT NULL AND pin <> p_from THEN
    RAISE EXCEPTION 'Faqat o‘z filialingizdan yubora olasiz' USING ERRCODE = '42501';
  END IF;
  SELECT name INTO v_to FROM branches WHERE id = p_to;

  FOR it IN SELECT * FROM json_array_elements(p_items) LOOP
    pid := (it ->> 'product_id')::INTEGER;
    q   := (it ->> 'qty')::INTEGER;
    CONTINUE WHEN pid IS NULL OR q IS NULL OR q <= 0;
    SELECT name INTO v_name FROM product_catalog WHERE id = pid AND store_id = s;
    IF NOT FOUND THEN RAISE EXCEPTION 'Tovar topilmadi (id=%)', pid; END IF;
    PERFORM move_stock(pid, -q, 'kochirish', v_to || ' filialiga', actor_name(), NULL, p_from);
    v_items := v_items || jsonb_build_object('product_id', pid, 'name', v_name, 'qty', q);
  END LOOP;
  IF jsonb_array_length(v_items) = 0 THEN RAISE EXCEPTION 'Tovar tanlanmagan'; END IF;

  INSERT INTO transfers (store_id, from_branch, to_branch, items, note, sent_by)
  VALUES (s, p_from, p_to, v_items, p_note, actor_name())
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- p_items bo'sh bo'lsa — hammasi to'liq qabul qilindi. Kam kelsa — farq
-- `received` da qoladi (yo'lda yo'qolgan), manba filialdan allaqachon yechilgan.
CREATE OR REPLACE FUNCTION public.transfer_receive(p_id INTEGER, p_items JSON DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SET search_path = public, private AS $$
DECLARE
  t transfers%ROWTYPE;
  pin INTEGER := (auth_claim('branch_id'))::INTEGER;
  it JSONB; q INTEGER; v_rec JSONB := '[]'::jsonb; v_from TEXT;
BEGIN
  SELECT * INTO t FROM transfers WHERE id = p_id AND store_id = auth_store() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ko‘chirish topilmadi'; END IF;
  IF t.status <> 'sent' THEN RAISE EXCEPTION 'Bu ko‘chirish allaqachon yopilgan'; END IF;
  IF pin IS NOT NULL AND pin <> t.to_branch THEN
    RAISE EXCEPTION 'Faqat qabul qiluvchi filial tasdiqlaydi' USING ERRCODE = '42501';
  END IF;
  SELECT name INTO v_from FROM branches WHERE id = t.from_branch;

  FOR it IN SELECT * FROM jsonb_array_elements(t.items) LOOP
    q := (it ->> 'qty')::INTEGER;
    IF p_items IS NOT NULL THEN
      SELECT least(q, greatest(0, (x ->> 'qty')::INTEGER)) INTO q
      FROM json_array_elements(p_items) x
      WHERE (x ->> 'product_id')::INTEGER = (it ->> 'product_id')::INTEGER;
      q := coalesce(q, 0);
    END IF;
    IF q > 0 THEN
      PERFORM move_stock((it ->> 'product_id')::INTEGER, q, 'kochirish',
                         v_from || ' filialidan', actor_name(), NULL, t.to_branch);
    END IF;
    v_rec := v_rec || jsonb_build_object('product_id', (it ->> 'product_id')::INTEGER, 'qty', q);
  END LOOP;

  UPDATE transfers SET status = 'received', received = v_rec,
    received_by = actor_name(), received_at = now()
  WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.transfer_cancel(p_id INTEGER)
RETURNS void
LANGUAGE plpgsql SET search_path = public, private AS $$
DECLARE t transfers%ROWTYPE; it JSONB;
BEGIN
  SELECT * INTO t FROM transfers WHERE id = p_id AND store_id = auth_store() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ko‘chirish topilmadi'; END IF;
  IF t.status <> 'sent' THEN RAISE EXCEPTION 'Faqat yo‘ldagi ko‘chirishni bekor qilish mumkin'; END IF;
  FOR it IN SELECT * FROM jsonb_array_elements(t.items) LOOP
    PERFORM move_stock((it ->> 'product_id')::INTEGER, (it ->> 'qty')::INTEGER, 'kochirish',
                       'ko‘chirish bekor qilindi', actor_name(), NULL, t.from_branch);
  END LOOP;
  UPDATE transfers SET status = 'cancelled', received_by = actor_name(), received_at = now()
  WHERE id = p_id;
END $$;

-- ── 9. Filial chegarasi (tarif) va o'chirish qoidasi ───────────────────
CREATE OR REPLACE FUNCTION private.guard_branches() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE lim INTEGER; cnt INTEGER;
BEGIN
  -- DIQQAT: SECURITY DEFINER ichida current_user doim egasi (postgres) —
  -- ilovadan kelganini tokendagi rol bilan aniqlaymiz
  IF TG_OP = 'INSERT' AND auth_role() IS NOT NULL AND NOT is_creator() THEN
    SELECT max_branches INTO lim FROM stores WHERE id = NEW.store_id;
    SELECT count(*) INTO cnt FROM branches WHERE store_id = NEW.store_id AND is_active;
    IF lim IS NOT NULL AND cnt >= lim THEN
      RAISE EXCEPTION 'Tarifingiz bo‘yicha filiallar soni: %. Ko‘proq filial uchun tarifni oshiring.', lim
        USING ERRCODE = 'P0001';
    END IF;
    NEW.is_main := false;     -- asosiy filial faqat bitta, u o'zi yaratiladi
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
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_guard_branches ON branches;
CREATE TRIGGER trg_guard_branches BEFORE INSERT OR UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION private.guard_branches();

-- ── 10. RLS ────────────────────────────────────────────────────────────
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS read_own ON branches;
CREATE POLICY read_own ON branches FOR SELECT TO mb_user
  USING (is_creator() OR (store_id = auth_store() AND (SELECT store_ok())));
DROP POLICY IF EXISTS owner_write ON branches;
CREATE POLICY owner_write ON branches FOR ALL TO mb_user
  USING (is_creator() OR (store_id = auth_store() AND auth_role() = 'owner'))
  WITH CHECK (is_creator() OR (store_id = auth_store() AND auth_role() = 'owner'));

ALTER TABLE branch_stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS own_store ON branch_stock;
CREATE POLICY own_store ON branch_stock FOR ALL TO mb_user
  USING (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer' AND (SELECT store_ok())))
  WITH CHECK (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer' AND (SELECT store_ok())));

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS own_store ON transfers;
CREATE POLICY own_store ON transfers FOR ALL TO mb_user
  USING (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer' AND (SELECT store_ok())
         AND (branch_visible(from_branch) OR branch_visible(to_branch))))
  WITH CHECK (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer' AND (SELECT store_ok())));

-- Sotuv, smena, xarajat, kirim, ombor tarixi — faqat joriy filial
-- ("barcha filiallar" rejimida hammasi). Mijoz/nasiya/kredit — umumiy.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['transactions','shifts','expenses','purchases','stock_movements'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS own_store ON %I', t);
    EXECUTE format($p$
      CREATE POLICY own_store ON %I FOR ALL TO mb_user
      USING (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer'
             AND (SELECT store_ok())
             AND ((SELECT current_branch()) IS NULL OR branch_id = (SELECT current_branch()))))
      WITH CHECK (is_creator() OR (store_id = auth_store() AND auth_role() <> 'dealer' AND (SELECT store_ok())))
    $p$, t);
  END LOOP;
END $$;

-- ── 11. Login: biriktirilgan xodim tokenida filial ─────────────────────
-- Egasi hech qachon biriktirilmaydi — u hamma filialni boshqaradi.
CREATE OR REPLACE FUNCTION public.login(p_email TEXT, p_password TEXT) RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE
  u   users%ROWTYPE;
  c   customers%ROWTYPE;
  s   stores%ROWTYPE;
  pin INTEGER;
  exp BIGINT := extract(epoch FROM now() + INTERVAL '30 days')::BIGINT;
  bad TEXT := 'Email yoki parol noto‘g‘ri';
BEGIN
  SELECT * INTO u FROM users WHERE lower(email) = lower(trim(p_email)) LIMIT 1;

  IF FOUND THEN
    IF NOT EXISTS (SELECT 1 FROM private.user_secrets
                   WHERE user_id = u.id AND hash = crypt(p_password, hash)) THEN
      PERFORM pg_sleep(0.4);
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
    IF u.role NOT IN ('owner', 'creator') AND u.branch_id IS NOT NULL
       AND EXISTS (SELECT 1 FROM branches WHERE id = u.branch_id AND store_id = u.store_id AND is_active) THEN
      pin := u.branch_id;
    END IF;

    RETURN json_build_object(
      'token', private.jwt_sign(json_build_object(
        'role', 'mb_user', 'uid', u.id, 'store_id', u.store_id,
        'app_role', u.role, 'branch_id', pin, 'exp', exp)),
      'user', to_jsonb(u) - 'password',
      'store', CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object(
        'id', s.id, 'name', s.name, 'store_type', s.store_type, 'slug', s.slug,
        'is_active', s.is_active, 'address', s.address, 'phone', s.phone) END,
      'branch_id', pin
    );
  END IF;

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

-- ── 12. Ruxsatlar ──────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON products, product_catalog, branches, branch_stock, transfers TO mb_user;
GRANT SELECT ON products, product_catalog, branches, branch_stock, transfers TO mb_bot;
GRANT USAGE, SELECT ON SEQUENCE branches_id_seq, transfers_id_seq, products_id_seq TO mb_user;

REVOKE EXECUTE ON FUNCTION
  public.main_branch(INTEGER), public.current_branch(), public.branch_visible(INTEGER),
  public.move_stock(INTEGER, INTEGER, TEXT, TEXT, TEXT, INTEGER, INTEGER),
  public.transfer_send(INTEGER, INTEGER, JSON, TEXT), public.transfer_receive(INTEGER, JSON),
  public.transfer_cancel(INTEGER), public.log_branch_stock()
FROM PUBLIC, mb_anon;
GRANT EXECUTE ON FUNCTION
  public.main_branch(INTEGER), public.current_branch(), public.branch_visible(INTEGER),
  public.move_stock(INTEGER, INTEGER, TEXT, TEXT, TEXT, INTEGER, INTEGER),
  public.transfer_send(INTEGER, INTEGER, JSON, TEXT), public.transfer_receive(INTEGER, JSON),
  public.transfer_cancel(INTEGER), public.log_branch_stock()
TO mb_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO mb_bot;

COMMIT;
