-- ══════════════════════════════════════════════════════════════════════════
-- MyBazzar — ta'minotchilar va ularga qarz
--
-- Ilgari faqat MIJOZNING bizga qarzi yozilardi (debts). Bizning
-- ta'minotchiga qarzimiz hech qayerda yozilmasdi — do'konchi buni
-- daftarda yuritishga majbur edi.
--
-- Uchta jadval:
--   suppliers          — kimdan tovar olamiz
--   purchases          — yuk qabul qilish hujjati (jami va to'langani)
--   supplier_payments  — keyinchalik qilingan to'lovlar
--
-- Qarz = purchases.total − purchases.paid − supplier_payments.amount
-- Uni har safar qo'lda hisoblamaslik uchun pastda `supplier_balances`
-- ko'rinishi bor.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS suppliers (
  id         SERIAL PRIMARY KEY,
  store_id   INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  phone      TEXT,
  note       TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_store ON suppliers(store_id);

-- Yuk qabul qilish hujjati
CREATE TABLE IF NOT EXISTS purchases (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,

  -- Nimalar kelgani: [{ id, name, qty, cost }]
  items       JSONB NOT NULL DEFAULT '[]'::jsonb,

  total       NUMERIC NOT NULL DEFAULT 0,   -- tannarx bo'yicha jami
  paid        NUMERIC NOT NULL DEFAULT 0,   -- shu zahoti to'langani
  note        TEXT,
  actor       TEXT,
  date        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_store    ON purchases(store_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id, date DESC);

-- Keyinchalik qilingan to'lovlar
CREATE TABLE IF NOT EXISTS supplier_payments (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  amount      NUMERIC NOT NULL DEFAULT 0,
  method      TEXT,                          -- naqd | karta | o'tkazma
  note        TEXT,
  actor       TEXT,
  date        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_payments ON supplier_payments(supplier_id, date DESC);

-- ── Qarz balansi ─────────────────────────────────────────────────────────
-- Ilova har safar uch jadvalni qo'shib o'tirmasin: bitta so'rov bilan
-- "kimga qancha qarzimiz bor" ni oladi.
CREATE OR REPLACE VIEW supplier_balances AS
SELECT
  s.id,
  s.store_id,
  s.name,
  s.phone,
  s.is_active,
  COALESCE(p.total, 0)                        AS purchased,
  COALESCE(p.paid, 0) + COALESCE(pay.paid, 0) AS paid,
  COALESCE(p.total, 0) - COALESCE(p.paid, 0) - COALESCE(pay.paid, 0) AS balance,
  p.last_date                                 AS last_purchase
FROM suppliers s
LEFT JOIN (
  SELECT supplier_id, SUM(total) AS total, SUM(paid) AS paid, MAX(date) AS last_date
  FROM purchases GROUP BY supplier_id
) p ON p.supplier_id = s.id
LEFT JOIN (
  SELECT supplier_id, SUM(amount) AS paid
  FROM supplier_payments GROUP BY supplier_id
) pay ON pay.supplier_id = s.id;

-- ── Ruxsatlar ────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON suppliers         TO mb_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchases         TO mb_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_payments TO mb_anon;
GRANT SELECT ON supplier_balances TO mb_anon;

GRANT USAGE, SELECT ON SEQUENCE suppliers_id_seq         TO mb_anon;
GRANT USAGE, SELECT ON SEQUENCE purchases_id_seq         TO mb_anon;
GRANT USAGE, SELECT ON SEQUENCE supplier_payments_id_seq TO mb_anon;

COMMIT;

NOTIFY pgrst, 'reload schema';
