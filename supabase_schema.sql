-- MyBazzar Supabase Schema (Multi-Tenant & Creator Logic)

-- MyBazzar Supabase Schema Update

-- DIQQAT: Agar bazada jadvallar allaqachon mavjud bo'lsa ("relation already exists" xatosi chiqsa), 
-- to'liq CREATE TABLE yozish shart emas! Shunchaki quyidagi qatorlarni o'zini ishga tushiring:

ALTER TABLE customers ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'regular';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS shop_name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS login TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password TEXT;

ALTER TABLE debts ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
ALTER TABLE debts ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE products ADD COLUMN IF NOT EXISTS "minStock" INTEGER DEFAULT 0;

-- Quyidagi funksiya Nasiya qilinganda Mijozning xaridlar sonini va Jami summasini oshiradi
CREATE OR REPLACE FUNCTION increment_customer_spent(cid INTEGER, amnt NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE customers 
  SET purchases = purchases + 1, 
      total_spent = total_spent + amnt 
  WHERE id = cid;
END;
$$ LANGUAGE plpgsql;
ALTER TABLE transactions Add COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL;
