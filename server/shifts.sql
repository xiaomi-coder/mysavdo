-- ══════════════════════════════════════════════════════════════════════════
-- Kassa smenasi
--
-- Do'kon egasining eng katta og'rig'i — kassadan pul yo'qolishi. Smena
-- shuni yopadi: sotuvchi smenani ochadi (kassadagi boshlang'ich pul),
-- ishlaydi, yopganda tizim "kassada qancha bo'lishi kerak"ini hisoblaydi,
-- sotuvchi haqiqiy sanagan summani kiritadi va FARQ ko'rinadi.
--
-- Faqat NAQD pul hisoblanadi — plastik/o'tkazma kassaga tushmaydi.
-- Qaytarish (vozvrat) manfiy summa bo'lgani uchun o'zi ayiriladi.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS shifts (
  id           SERIAL PRIMARY KEY,
  store_id     INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cashier      TEXT NOT NULL,              -- kim ochgan (users.name)
  opened_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at    TIMESTAMPTZ,
  opening_cash NUMERIC NOT NULL DEFAULT 0, -- smena boshida kassadagi pul
  counted_cash NUMERIC,                    -- yopishda sanab kiritilgan
  note         TEXT,
  status       TEXT NOT NULL DEFAULT 'open' -- open | closed
);

CREATE INDEX IF NOT EXISTS idx_shifts_store ON shifts(store_id, status);
-- Bitta do'konda bitta sotuvchida bir vaqtda faqat bitta ochiq smena
CREATE UNIQUE INDEX IF NOT EXISTS idx_shifts_one_open
  ON shifts(store_id, cashier) WHERE status = 'open';

-- Sotuv qaysi smenaga tegishli
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS shift_id INTEGER REFERENCES shifts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_txn_shift ON transactions(shift_id);

-- ── Smena ko'rinishi: kutilayotgan summa va farq shu yerda hisoblanadi ──
CREATE OR REPLACE VIEW shift_view AS
SELECT
  s.*,
  COALESCE(a.cash_net, 0)                    AS cash_net,       -- naqd kirim - qaytarish
  COALESCE(a.sales_total, 0)                 AS sales_total,    -- jami savdo (hamma usul)
  COALESCE(a.txn_count, 0)                   AS txn_count,
  COALESCE(a.return_count, 0)                AS return_count,
  s.opening_cash + COALESCE(a.cash_net, 0)   AS expected_cash,  -- kassada bo'lishi kerak
  CASE WHEN s.counted_cash IS NULL THEN NULL
       ELSE s.counted_cash - (s.opening_cash + COALESCE(a.cash_net, 0))
  END                                        AS difference      -- + ortiqcha, - kam
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

GRANT SELECT, INSERT, UPDATE ON shifts TO mb_anon;
GRANT USAGE, SELECT ON SEQUENCE shifts_id_seq TO mb_anon;
GRANT SELECT ON shift_view TO mb_anon;
GRANT SELECT (shift_id) ON transactions TO mb_anon;
GRANT UPDATE (shift_id) ON transactions TO mb_anon;
GRANT INSERT (shift_id) ON transactions TO mb_anon;

COMMIT;
