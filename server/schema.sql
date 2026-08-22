-- ══════════════════════════════════════════════════════════════════════════
-- MyBazzar — baza tuzilmasi (PostgreSQL 16 + PostgREST)
--
-- Supabase o'rniga o'z serverimizda ishlaydi. Jadval va ustun nomlari
-- kodda ishlatilganidek — shuning uchun frontend'da bitta chaqiruv ham
-- o'zgarmaydi.
--
-- Ishga tushirish:  psql -d mybazzar -f schema.sql
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── DO'KONLAR ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  owner_email  TEXT,
  address      TEXT,
  phone        TEXT,
  email        TEXT,
  tax_id       TEXT,                             -- STIR
  store_type   TEXT NOT NULL DEFAULT 'general',   -- 'general' | 'phone'
  max_branches INTEGER NOT NULL DEFAULT 1,        -- 1=Starter, 3=Business, 10=Enterprise
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── FOYDALANUVCHILAR (creator / owner / manager / cashier) ───────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT UNIQUE,
  password    TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'cashier',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  permissions JSONB,                              -- bo'sh bo'lsa roldan olinadi
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── MIJOZLAR (oddiy xaridor va diler/do'kondor) ─────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'regular',    -- 'regular' | 'dealer'
  name        TEXT,
  phone       TEXT,
  shop_name   TEXT,                               -- diler uchun
  address     TEXT,
  login       TEXT,                               -- diler portaliga kirish
  password    TEXT,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  purchases   INTEGER NOT NULL DEFAULT 0,
  last_visit  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── MAHSULOTLAR ──────────────────────────────────────────────────────────
-- DIQQAT: "minStock" ataylab qo'shtirnoqda — kod aynan shu yozuvda o'qiydi.
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  store_id        INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  barcode         TEXT,
  category        TEXT,
  cost_price      NUMERIC NOT NULL DEFAULT 0,
  price           NUMERIC NOT NULL DEFAULT 0,
  stock           INTEGER NOT NULL DEFAULT 0,
  "minStock"      INTEGER NOT NULL DEFAULT 0,
  image           TEXT,                           -- emoji yoki rasm manzili
  -- telefon do'koni uchun maydonlar
  phone_model     TEXT,
  phone_memory    TEXT,
  phone_color     TEXT,
  phone_imei1     TEXT,
  phone_imei2     TEXT,
  phone_serial    TEXT,
  phone_condition TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── SOTUVLAR ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id             SERIAL PRIMARY KEY,
  store_id       INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  customer_id    INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  receipt_no     TEXT,
  cashier        TEXT,
  items          JSONB NOT NULL DEFAULT '[]'::jsonb,
  total          NUMERIC NOT NULL DEFAULT 0,
  discount       NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,                            -- cash|card|transfer|nasiya|online
  status         TEXT NOT NULL DEFAULT 'completed', -- completed | online_pending
  date           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── NASIYA (qarzlar) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debts (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  client      TEXT,
  phone       TEXT,
  amount      NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  due_date    TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'To''lanmagan',
  date        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── XARAJATLAR ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id         SERIAL PRIMARY KEY,
  store_id   INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  category   TEXT,
  note       TEXT,
  amount     NUMERIC NOT NULL DEFAULT 0,
  cashier    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── INDEKSLAR ────────────────────────────────────────────────────────────
-- Deyarli har bir so'rov store_id bo'yicha filtrlaydi.
CREATE INDEX IF NOT EXISTS idx_users_store        ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_store    ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_login    ON customers(login) WHERE login IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_store     ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode   ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_txn_store_date     ON transactions(store_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_txn_customer       ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_debts_store        ON debts(store_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_store     ON expenses(store_id, date DESC);

-- ── FUNKSIYA: nasiya/sotuvdan keyin mijoz statistikasini oshirish ────────
-- POS.js dan supabase.rpc('increment_customer_spent', {cid, amnt}) orqali chaqiriladi.
CREATE OR REPLACE FUNCTION increment_customer_spent(cid INTEGER, amnt NUMERIC)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE customers
     SET purchases   = purchases + 1,
         total_spent = total_spent + amnt,
         last_visit  = now()
   WHERE id = cid;
END;
$$;

COMMIT;
