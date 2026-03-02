-- MyBazzar Supabase Schema (Multi-Tenant & Creator Logic)

-- Tizim toza holatda o'rnatilishi uchun avvalgi jadvallarni o'chiramiz:
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- 1. Stores Table (Do'konlar)
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_branches INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users Table (Barcha xodimlar va adminlar)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Note: In production, rely on Supabase Auth (auth.users). This is for demo logic if bypassing Auth.
  role TEXT NOT NULL, -- 'creator', 'owner', 'manager', 'cashier'
  name TEXT NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Creator User
INSERT INTO users (email, password, role, name, permissions) VALUES
('creator', 'xiaomicoder', 'creator', 'Tizim Yaratuvchisi (Creator)', '["dashboard_creator", "stores", "all_stats", "create_owner"]');

-- 3. Products Table (Ombor)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  cost_price NUMERIC DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  image TEXT,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Transactions Table (POS Sotuvlar)
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  receipt_no TEXT NOT NULL,
  cashier TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  payment_method TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'completed'
);

-- 5. Customers Table (Mijozlar/CRM)
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  purchases INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Debts Table (Nasiya)
CREATE TABLE debts (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  client TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  phone TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'To''lanmagan'
);

-- 7. Expenses Table (Moliya - Kassa Xarajatlari)
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  note TEXT,
  cashier TEXT NOT NULL
);

-- Note: No mock data is inserted for standard tables to keep the database completely clean upon deployment.
-- Only the 'creator' login is provided by default.
