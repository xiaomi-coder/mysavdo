-- ══════════════════════════════════════════════════════════════════════════
-- MyBazzar — tovar harakati (sverka)
--
-- Maqsad: qoldiq noto'g'ri chiqsa, SABABINI topish mumkin bo'lsin.
--
-- Asosiy qaror: yozib borish ilovaga emas, BAZAGA yuklatilgan.
-- `products.stock` o'zgarganda trigger avtomatik yozuv qo'yadi — kim,
-- qachon, qanchadan, qanday amal. Shu sababli hech qanday kod yo'li
-- (hatto qo'lda yozilgan SQL ham) tarixdan qochib qutula olmaydi.
--
-- Amal turi va izoh RPC tomonidan sessiya o'zgaruvchilariga yoziladi.
-- Ular berilmagan bo'lsa harakat 'tuzatish' deb belgilanadi — ya'ni
-- kimdir qoldiqni tushuntirishsiz o'zgartirgani ko'rinib turadi.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── JADVAL ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id             BIGSERIAL PRIMARY KEY,
  store_id       INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- kirim · sotuv · qaytarish · kochirish · taftish · boshlangich · tuzatish
  type           TEXT NOT NULL,

  qty            INTEGER NOT NULL,        -- musbat = kirim, manfiy = chiqim
  stock_before   INTEGER NOT NULL,
  stock_after    INTEGER NOT NULL,

  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  note           TEXT,
  actor          TEXT,                    -- kim qildi
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movements_store   ON stock_movements(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movements_type    ON stock_movements(store_id, type, created_at DESC);

-- ── TRIGGER: qoldiq o'zgarishini yozib boradi ────────────────────────────
CREATE OR REPLACE FUNCTION log_stock_movement() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  v_before INTEGER;
  v_type   TEXT;
  v_note   TEXT;
  v_actor  TEXT;
  v_txn    INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Yangi tovar: boshlang'ich qoldiq nolga teng bo'lsa yozuv shart emas
    IF COALESCE(NEW.stock, 0) = 0 THEN RETURN NEW; END IF;
    v_before := 0;
    v_type   := 'boshlangich';
  ELSE
    IF NEW.stock IS NOT DISTINCT FROM OLD.stock THEN RETURN NEW; END IF;
    v_before := OLD.stock;
    v_type   := NULLIF(current_setting('mb.move_type', true), '');
    -- Tur ko'rsatilmagan bo'lsa — tushuntirishsiz o'zgarish
    IF v_type IS NULL THEN v_type := 'tuzatish'; END IF;
  END IF;

  v_note  := NULLIF(current_setting('mb.move_note',  true), '');
  v_actor := NULLIF(current_setting('mb.move_actor', true), '');
  v_txn   := NULLIF(current_setting('mb.move_txn',   true), '')::INTEGER;

  INSERT INTO stock_movements
    (store_id, product_id, type, qty, stock_before, stock_after,
     transaction_id, note, actor)
  VALUES
    (NEW.store_id, NEW.id, v_type, NEW.stock - v_before, v_before, NEW.stock,
     v_txn, v_note, v_actor);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_movement ON products;
CREATE TRIGGER trg_stock_movement
  AFTER INSERT OR UPDATE OF stock ON products
  FOR EACH ROW EXECUTE FUNCTION log_stock_movement();

-- ── RPC: qoldiqni sabab bilan o'zgartirish ───────────────────────────────
-- Ilova shu funksiyani chaqiradi. Qatorni qulflaydi — ikki kassir bir
-- vaqtda sotsa ham qoldiq buzilmaydi.
CREATE OR REPLACE FUNCTION move_stock(
  p_product  INTEGER,
  p_qty      INTEGER,              -- musbat = kirim, manfiy = chiqim
  p_type     TEXT,
  p_note     TEXT    DEFAULT NULL,
  p_actor    TEXT    DEFAULT NULL,
  p_txn      INTEGER DEFAULT NULL
) RETURNS INTEGER
LANGUAGE plpgsql AS $$
DECLARE
  v_stock INTEGER;
  v_name  TEXT;
BEGIN
  SELECT stock, name INTO v_stock, v_name
    FROM products WHERE id = p_product FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tovar topilmadi (id=%)', p_product;
  END IF;

  IF v_stock + p_qty < 0 THEN
    RAISE EXCEPTION '% — omborda % dona bor, % dona chiqarib bo''lmaydi',
      v_name, v_stock, abs(p_qty);
  END IF;

  PERFORM set_config('mb.move_type',  p_type, true);
  PERFORM set_config('mb.move_note',  COALESCE(p_note, ''),  true);
  PERFORM set_config('mb.move_actor', COALESCE(p_actor, ''), true);
  PERFORM set_config('mb.move_txn',   COALESCE(p_txn::TEXT, ''), true);

  UPDATE products SET stock = stock + p_qty WHERE id = p_product
    RETURNING stock INTO v_stock;

  -- Sessiya o'zgaruvchilari tranzaksiya oxirida o'zi tozalanadi (local = true)
  RETURN v_stock;
END;
$$;

-- ── RPC: sotuvni omborga tushirish ───────────────────────────────────────
-- Tranzaksiya ichidagi barcha tovarlarni bir yo'la yechadi. Bittasi
-- yetmasa — hech biri yechilmaydi (butun amal bekor bo'ladi).
CREATE OR REPLACE FUNCTION apply_sale(
  p_txn   INTEGER,
  p_actor TEXT DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_item  JSONB;
  v_items JSONB;
  v_receipt TEXT;
BEGIN
  SELECT items, receipt_no INTO v_items, v_receipt
    FROM transactions WHERE id = p_txn;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sotuv topilmadi (id=%)', p_txn;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(v_items, '[]'::jsonb))
  LOOP
    IF (v_item->>'id') IS NULL THEN CONTINUE; END IF;
    PERFORM move_stock(
      (v_item->>'id')::INTEGER,
      -COALESCE((v_item->>'qty')::INTEGER, 1),
      'sotuv',
      v_receipt,
      p_actor,
      p_txn
    );
  END LOOP;
END;
$$;

-- ── RPC: sotuvni qaytarish ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION revert_sale(
  p_txn   INTEGER,
  p_actor TEXT DEFAULT NULL,
  p_note  TEXT DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_item  JSONB;
  v_items JSONB;
BEGIN
  SELECT items INTO v_items FROM transactions WHERE id = p_txn;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sotuv topilmadi (id=%)', p_txn;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(v_items, '[]'::jsonb))
  LOOP
    IF (v_item->>'id') IS NULL THEN CONTINUE; END IF;
    PERFORM move_stock(
      (v_item->>'id')::INTEGER,
      COALESCE((v_item->>'qty')::INTEGER, 1),
      'qaytarish',
      p_note,
      p_actor,
      p_txn
    );
  END LOOP;
END;
$$;

-- ── Ruxsatlar ────────────────────────────────────────────────────────────
GRANT SELECT ON stock_movements TO mb_anon;
GRANT USAGE, SELECT ON SEQUENCE stock_movements_id_seq TO mb_anon;
GRANT EXECUTE ON FUNCTION move_stock(INTEGER, INTEGER, TEXT, TEXT, TEXT, INTEGER) TO mb_anon;
GRANT EXECUTE ON FUNCTION apply_sale(INTEGER, TEXT) TO mb_anon;
GRANT EXECUTE ON FUNCTION revert_sale(INTEGER, TEXT, TEXT) TO mb_anon;

COMMIT;
