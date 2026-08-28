-- ══════════════════════════════════════════════════════════════════════════
-- Texno Bozor — demo savdo ma'lumoti
--
-- Hamma yozuv `demo_data` da belgilanadi. Tozalash uchun:
--     \i demo_clean.sql
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS demo_data (
  kind TEXT NOT NULL,
  id   BIGINT NOT NULL,
  PRIMARY KEY (kind, id)
);

-- ── Tovarlar ──
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Ekran himoyasi 9D', 'Aksesuar', 6000, 15000, 3, 10, '🔗', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Type-C zaryadlovchi 20W', 'Aksesuar', 95000, 90000, 24, 5, '🔌', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Powerbank 10000mAh', 'Aksesuar', 160000, 210000, 18, 4, '🔌', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Powerbank 20000mAh eski', 'Aksesuar', 240000, 290000, 14, 3, '🔌', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Avto zaryadlovchi', 'Aksesuar', 38000, 75000, 22, 6, '🔌', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Bluetooth quloqchin A9', 'Aksesuar', 120000, 240000, 16, 5, '🎧', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Simsiz zaryadlash disk', 'Aksesuar', 140000, 260000, 9, 3, '🔌', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Redmi Note 14 256GB', 'Xiaomi/Redmi', 2750000, 3250000, 6, 2, '📱', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Samsung Galaxy A35', 'Samsung', 2900000, 3450000, 4, 2, '📱', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;
WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES (1, 'Honor X9b 256GB', 'Honor', 3100000, 3690000, 3, 2, '📱', TRUE,
          now() - INTERVAL '95 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;

-- ── Xodimlar ──
WITH ins AS (
  INSERT INTO users (store_id, name, email, password, role, is_active, permissions)
  VALUES (1, 'Dilnoza Karimova', 'dilnoza@texno-bozor.uz', 'sotuvchi1', 'cashier', TRUE,
          '["pos","inventory","crm","nasiya","chek"]'::jsonb)
  ON CONFLICT (email) DO NOTHING
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'user', id FROM ins;
WITH ins AS (
  INSERT INTO users (store_id, name, email, password, role, is_active, permissions)
  VALUES (1, 'Aziz Rasulov', 'aziz@texno-bozor.uz', 'sotuvchi2', 'cashier', TRUE,
          '["pos","inventory","crm","nasiya","chek"]'::jsonb)
  ON CONFLICT (email) DO NOTHING
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'user', id FROM ins;

-- ── Mijozlar ──
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Alisher Karimov', '998910000000', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Nodira Yusupova', '998910111111', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Bekzod Rahimov', '998910222222', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Malika Tosheva', '998910333333', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Sardor Aliyev', '998910444444', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Zilola Ergasheva', '998910555555', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Jasur Nazarov', '998910666666', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Gulnora Qodirova', '998910777777', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Rustam Ismoilov', '998910888888', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Feruza Saidova', '998910999999', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Otabek Tursunov', '998911111110', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Dilfuza Mirzayeva', '998911222221', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Shohruh Xolmatov', '998911333332', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Nigora Abdullayeva', '998911444443', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Umid Sobirov', '998911555554', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;
WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES (1, 'Kamola Yo‘ldosheva', '998911666665', 'regular', 0, 0, now() - INTERVAL '90 days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;

-- ── Sotuvlar ──
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1001', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'cash', 'completed', '2026-05-31 16:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1002', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 210000, 'cost_price', 160000)),
         420000, 0, 'card', 'completed', '2026-05-31 17:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1003', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-05-31 18:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1004', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3277500, 172500, 'cash', 'completed', '2026-05-31 21:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1005', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         247000, 13000, 'card', 'completed', '2026-05-31 20:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1006', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'card', 'completed', '2026-05-31 16:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1007', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-06-01 19:36:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Dilfuza Mirzayeva' LIMIT 1), 'D-1008', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-01 12:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1009', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-01 17:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1010', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         171000, 9000, 'card', 'completed', '2026-06-01 12:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1011', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-01 16:58:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1012', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'transfer', 'completed', '2026-06-02 09:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1013', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'card', 'completed', '2026-06-02 20:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Feruza Saidova' LIMIT 1), 'D-1014', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         85500, 4500, 'card', 'completed', '2026-06-02 19:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1015', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'card', 'completed', '2026-06-02 11:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1016', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-02 20:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1017', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-02 16:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1018', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'nasiya', 'completed', '2026-06-03 10:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1019', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-06-03 20:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1020', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'nasiya', 'completed', '2026-06-03 10:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1021', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-06-03 19:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1022', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'card', 'completed', '2026-06-03 12:54:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1023', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 210000, 'cost_price', 160000)),
         420000, 0, 'cash', 'completed', '2026-06-03 12:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1024', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-06-04 11:13:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1025', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-06-04 19:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1026', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-06-04 11:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1027', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'transfer', 'completed', '2026-06-04 11:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1028', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-06-04 17:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1029', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'cash', 'completed', '2026-06-04 20:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1030', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-06-05 19:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1031', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'nasiya', 'completed', '2026-06-05 18:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1032-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         -210000, 0, 'cash', 'returned', '2026-06-08 18:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1033', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-05 14:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1034', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-05 17:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1035', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-05 09:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1036', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'card', 'completed', '2026-06-05 12:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1037', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'nasiya', 'completed', '2026-06-05 13:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1038', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'card', 'completed', '2026-06-05 10:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1039', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-06-05 18:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1040', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-06 21:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1041', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-06 19:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1042', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-06-06 19:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1043', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'card', 'completed', '2026-06-06 21:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1044', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'nasiya', 'completed', '2026-06-06 21:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1045', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-06-06 14:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1046', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-06 11:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1047', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-06-06 19:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1048', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'nasiya', 'completed', '2026-06-06 18:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1049', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'card', 'completed', '2026-06-07 11:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1050', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'card', 'completed', '2026-06-07 20:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1051', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-07 11:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1052', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 210000, 'cost_price', 160000)),
         420000, 0, 'cash', 'completed', '2026-06-07 20:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1053', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-06-07 15:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1054', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-06-07 13:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1055', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-06-07 12:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1056', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'card', 'completed', '2026-06-08 18:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1057', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-08 18:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1058', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-06-08 16:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1059', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-06-08 19:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1060', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-06-08 21:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1061', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         247000, 13000, 'cash', 'completed', '2026-06-09 17:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1062', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-06-09 21:58:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 Pro 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1063', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 12500000, 'cost_price', 10800000)),
         12500000, 0, 'cash', 'completed', '2026-06-09 18:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1064', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-06-09 17:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1065', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-09 18:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1066', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'nasiya', 'completed', '2026-06-09 16:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1067', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'nasiya', 'completed', '2026-06-10 17:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1068', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'card', 'completed', '2026-06-10 11:13:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1069', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'card', 'completed', '2026-06-10 17:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1070', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'nasiya', 'completed', '2026-06-10 19:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1071', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-06-10 21:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1072', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-06-10 16:34:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1073', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-10 15:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1074', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-06-10 18:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Kamola Yo‘ldosheva' LIMIT 1), 'D-1075', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'cash', 'completed', '2026-06-11 12:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1076', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-11 19:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1077', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-11 20:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1078', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         85500, 4500, 'nasiya', 'completed', '2026-06-11 12:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1079', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-06-11 09:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1080', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'nasiya', 'completed', '2026-06-11 16:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1081', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-06-11 10:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1082', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'nasiya', 'completed', '2026-06-11 11:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1083', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         228000, 12000, 'cash', 'completed', '2026-06-12 15:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1084', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-06-12 18:54:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1085', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-12 15:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1086', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'card', 'completed', '2026-06-12 17:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1087', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'cash', 'completed', '2026-06-12 14:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1088', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-06-12 17:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1089', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'cash', 'completed', '2026-06-12 19:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1090', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'nasiya', 'completed', '2026-06-13 13:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1091', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'nasiya', 'completed', '2026-06-13 10:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1092', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-13 18:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1093', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'cash', 'completed', '2026-06-13 12:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1094', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'card', 'completed', '2026-06-13 09:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1095', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'cash', 'completed', '2026-06-13 15:41:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1096', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'cash', 'completed', '2026-06-13 19:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1097', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-06-13 11:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 Pro 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1098', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 12500000, 'cost_price', 10800000)),
         12500000, 0, 'cash', 'completed', '2026-06-13 18:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1099', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-06-14 17:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1100', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         85500, 4500, 'cash', 'completed', '2026-06-14 13:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1101', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-06-14 13:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1102', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-06-14 11:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1103', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         180000, 0, 'nasiya', 'completed', '2026-06-14 19:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1104-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         -180000, 0, 'cash', 'returned', '2026-06-15 19:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1105', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-06-14 21:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1106', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-14 18:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Feruza Saidova' LIMIT 1), 'D-1107', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'transfer', 'completed', '2026-06-14 12:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1108', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-06-15 18:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1109', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'nasiya', 'completed', '2026-06-15 19:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1110', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'cash', 'completed', '2026-06-15 17:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1111', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 260000, 'cost_price', 140000)),
         520000, 0, 'card', 'completed', '2026-06-15 20:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1112', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-06-15 16:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1113', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-06-15 11:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1114', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         171000, 9000, 'cash', 'completed', '2026-06-15 15:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1115', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-16 17:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1116', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         76000, 4000, 'card', 'completed', '2026-06-16 17:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1117', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-16 16:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1118', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'card', 'completed', '2026-06-16 15:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1119', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-16 19:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1120', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-06-16 13:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1121', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'card', 'completed', '2026-06-17 09:39:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1122', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-17 18:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1123-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         -45000, 0, 'cash', 'returned', '2026-06-18 18:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1124', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-06-17 17:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1125', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-06-17 17:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1126', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'transfer', 'completed', '2026-06-17 15:48:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1127', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'card', 'completed', '2026-06-17 10:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1128', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'cash', 'completed', '2026-06-18 20:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1129', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-18 17:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1130', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'card', 'completed', '2026-06-18 19:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1131', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'cash', 'completed', '2026-06-18 19:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1132', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-06-18 10:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1133', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-06-18 17:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1134', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-06-18 12:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1135', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-18 12:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1136', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-06-19 13:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1137', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-06-19 17:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1138', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-19 16:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1139', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-06-19 14:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1140', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-19 20:58:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Umid Sobirov' LIMIT 1), 'D-1141', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         342000, 18000, 'cash', 'completed', '2026-06-19 12:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1142', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-06-19 20:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1143', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2745500, 144500, 'card', 'completed', '2026-06-19 12:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1144', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 260000, 'cost_price', 140000)),
         520000, 0, 'card', 'completed', '2026-06-20 15:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1145', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'card', 'completed', '2026-06-20 17:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1146', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-06-20 19:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1147', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         76000, 4000, 'cash', 'completed', '2026-06-20 18:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1148', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-06-20 21:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1149', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-06-20 19:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1150', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-06-20 11:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1151', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'nasiya', 'completed', '2026-06-20 19:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Shohruh Xolmatov' LIMIT 1), 'D-1152', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-20 18:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1153', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'nasiya', 'completed', '2026-06-21 18:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1154', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-06-21 17:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1155', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-06-21 19:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1156', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-21 18:58:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nigora Abdullayeva' LIMIT 1), 'D-1157', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-21 10:35:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1158', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         247000, 13000, 'nasiya', 'completed', '2026-06-21 17:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1159', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-06-21 09:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1160', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-21 12:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1161', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-06-21 17:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1162', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'cash', 'completed', '2026-06-22 12:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1163-Q', 'Do‘kon egasi · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         -75000, 0, 'cash', 'returned', '2026-06-23 12:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1164', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-06-22 15:48:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1165', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'card', 'completed', '2026-06-22 10:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1166', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'cash', 'completed', '2026-06-22 16:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1167', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-06-23 18:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1168', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-06-23 17:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1169', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2745500, 144500, 'cash', 'completed', '2026-06-23 13:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1170', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'transfer', 'completed', '2026-06-23 16:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1171', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'nasiya', 'completed', '2026-06-23 11:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1172', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-06-23 21:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1173', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-24 18:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1174', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-06-24 13:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Dilfuza Mirzayeva' LIMIT 1), 'D-1175', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         152000, 8000, 'cash', 'completed', '2026-06-24 10:41:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1176', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-24 13:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1177', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-06-24 18:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1178', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         28500, 1500, 'cash', 'completed', '2026-06-25 11:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1179', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-06-25 17:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1180', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         14250, 750, 'card', 'completed', '2026-06-25 09:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1181', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-06-25 18:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1182', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-06-25 18:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1183', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-06-25 09:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1184-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         -2890000, 0, 'cash', 'returned', '2026-06-26 09:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1185', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-26 12:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1186', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'card', 'completed', '2026-06-26 19:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1187', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3277500, 172500, 'cash', 'completed', '2026-06-26 17:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1188', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'transfer', 'completed', '2026-06-26 11:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1189', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'nasiya', 'completed', '2026-06-26 10:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1190', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         180000, 0, 'nasiya', 'completed', '2026-06-26 12:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1191', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-06-26 18:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1192', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'card', 'completed', '2026-06-26 16:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1193', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 260000, 'cost_price', 140000)),
         494000, 26000, 'cash', 'completed', '2026-06-27 20:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1194', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'card', 'completed', '2026-06-27 20:54:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1195', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'card', 'completed', '2026-06-27 15:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1196', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'nasiya', 'completed', '2026-06-27 12:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1197', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 210000, 'cost_price', 160000)),
         420000, 0, 'cash', 'completed', '2026-06-27 16:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1198', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'cash', 'completed', '2026-06-27 18:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1199', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-06-27 17:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Shohruh Xolmatov' LIMIT 1), 'D-1200', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-06-27 18:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1201', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-06-27 21:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1202', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'nasiya', 'completed', '2026-06-28 21:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1203', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-06-28 13:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1204', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-28 11:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1205', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-06-28 18:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1206', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 75000, 'cost_price', 38000)),
         150000, 0, 'cash', 'completed', '2026-06-28 16:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1207', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-28 17:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1208', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-06-28 20:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1209', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-06-28 17:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1210-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         -90000, 0, 'cash', 'returned', '2026-06-30 17:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1211', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-06-29 13:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1212', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-06-29 17:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1213', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2745500, 144500, 'cash', 'completed', '2026-06-29 13:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1214', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-06-29 19:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1215', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'transfer', 'completed', '2026-06-29 17:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1216', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-06-29 09:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1217', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'cash', 'completed', '2026-06-29 21:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1218', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-06-30 15:36:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1219', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'card', 'completed', '2026-06-30 17:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1220', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'cash', 'completed', '2026-06-30 14:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1221', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'cash', 'completed', '2026-06-30 21:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1222', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'card', 'completed', '2026-06-30 14:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1223', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-06-30 19:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1224', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         42750, 2250, 'cash', 'completed', '2026-06-30 19:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1225-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         -42750, 0, 'cash', 'returned', '2026-07-03 19:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1226', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-07-01 12:41:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1227', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-07-01 13:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1228', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'cash', 'completed', '2026-07-01 18:41:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1229', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         42750, 2250, 'nasiya', 'completed', '2026-07-01 16:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1230', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'transfer', 'completed', '2026-07-01 21:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1231', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-07-01 11:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1232', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         2945000, 155000, 'nasiya', 'completed', '2026-07-01 18:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1233', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'card', 'completed', '2026-07-02 11:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1234', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-07-02 18:34:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1235', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'card', 'completed', '2026-07-02 15:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Dilfuza Mirzayeva' LIMIT 1), 'D-1236', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-02 15:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1237', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-07-02 18:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1238', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-07-02 20:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Feruza Saidova' LIMIT 1), 'D-1239', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         42750, 2250, 'card', 'completed', '2026-07-02 18:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1240', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'card', 'completed', '2026-07-03 14:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1241', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'card', 'completed', '2026-07-03 17:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1242', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'nasiya', 'completed', '2026-07-03 17:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1243', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-07-03 14:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1244', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-07-03 19:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1245', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 240000, 'cost_price', 120000)),
         480000, 0, 'cash', 'completed', '2026-07-03 11:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1246', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-03 19:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1247', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-07-03 12:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1248', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'card', 'completed', '2026-07-04 20:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1249', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-07-04 10:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1250', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-07-04 18:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1251', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'transfer', 'completed', '2026-07-04 10:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1252', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-07-04 20:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1253', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-04 12:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1254', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3277500, 172500, 'cash', 'completed', '2026-07-04 13:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1255', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-04 14:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1256', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-07-04 15:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1257-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         -180000, 0, 'cash', 'returned', '2026-07-06 15:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1258', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'cash', 'completed', '2026-07-04 19:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1259', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-07-04 14:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1260', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'transfer', 'completed', '2026-07-05 17:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1261', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'nasiya', 'completed', '2026-07-05 17:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1262', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 260000, 'cost_price', 140000)),
         520000, 0, 'card', 'completed', '2026-07-05 11:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1263', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'transfer', 'completed', '2026-07-05 14:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1264', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'cash', 'completed', '2026-07-05 19:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1265', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-07-05 12:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1266-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         -90000, 0, 'cash', 'returned', '2026-07-06 12:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1267', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-05 17:34:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1268', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-07-05 21:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1269', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-07-06 11:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1270', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'cash', 'completed', '2026-07-06 18:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1271', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-07-06 15:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1272', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-07-06 09:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1273', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'cash', 'completed', '2026-07-07 11:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1274', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'nasiya', 'completed', '2026-07-07 16:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1275', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-07-07 20:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1276', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-07-07 17:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1277', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'transfer', 'completed', '2026-07-07 18:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1278', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-07-07 21:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1279', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-07-08 12:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1280', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'card', 'completed', '2026-07-08 15:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1281', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'card', 'completed', '2026-07-08 18:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1282', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-08 19:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1283', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-07-08 14:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1284', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-07-08 20:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1285', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'transfer', 'completed', '2026-07-08 16:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1286', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-07-08 17:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1287', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'nasiya', 'completed', '2026-07-09 20:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1288-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         -3100000, 0, 'cash', 'returned', '2026-07-11 20:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1289', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'card', 'completed', '2026-07-09 16:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1290', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-07-09 21:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1291', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         14250, 750, 'cash', 'completed', '2026-07-09 14:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1292', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-07-09 18:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1293', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         85500, 4500, 'nasiya', 'completed', '2026-07-09 11:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1294', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-07-09 15:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1295-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         -160000, 0, 'cash', 'returned', '2026-07-12 15:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1296', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'cash', 'completed', '2026-07-09 20:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1297', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-07-10 20:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1298', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2745500, 144500, 'nasiya', 'completed', '2026-07-10 21:48:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1299', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-10 17:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1300', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         14250, 750, 'cash', 'completed', '2026-07-10 20:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1301', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-07-10 14:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1302', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-07-10 21:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1303-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         -90000, 0, 'cash', 'returned', '2026-07-11 21:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1304', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-07-10 10:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1305', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-07-10 20:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1306', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-10 19:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Feruza Saidova' LIMIT 1), 'D-1307', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-07-11 17:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1308', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3277500, 172500, 'cash', 'completed', '2026-07-11 12:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1309', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'card', 'completed', '2026-07-11 18:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1310', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-11 10:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1311', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-07-11 13:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1312', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-07-11 12:13:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1313', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-11 15:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1314', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'nasiya', 'completed', '2026-07-11 18:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1315', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         85500, 4500, 'nasiya', 'completed', '2026-07-11 20:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1316', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 260000, 'cost_price', 140000)),
         520000, 0, 'card', 'completed', '2026-07-11 16:48:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1317', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3505500, 184500, 'cash', 'completed', '2026-07-12 12:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1318', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-07-12 14:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1319', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-07-12 12:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1320', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'cash', 'completed', '2026-07-12 10:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1321', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-07-12 20:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1322', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4037500, 212500, 'cash', 'completed', '2026-07-12 17:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1323', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-07-12 20:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1324', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-12 15:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Dilfuza Mirzayeva' LIMIT 1), 'D-1325', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'card', 'completed', '2026-07-13 10:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1326', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-07-13 15:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Feruza Saidova' LIMIT 1), 'D-1327', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2327500, 122500, 'nasiya', 'completed', '2026-07-13 12:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1328', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'card', 'completed', '2026-07-13 16:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1329', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-07-13 11:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1330', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-07-14 14:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1331', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4037500, 212500, 'card', 'completed', '2026-07-14 11:36:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1332', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-07-14 11:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1333', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'nasiya', 'completed', '2026-07-14 13:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1334', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'nasiya', 'completed', '2026-07-14 11:36:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1335', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-07-14 11:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1336-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         -2890000, 0, 'cash', 'returned', '2026-07-17 11:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1337', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-07-14 13:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1338', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'transfer', 'completed', '2026-07-15 16:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1339', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-07-15 17:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1340', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-07-15 12:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1341', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-15 10:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1342', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         85500, 4500, 'cash', 'completed', '2026-07-15 14:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1343', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'nasiya', 'completed', '2026-07-16 19:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1344', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-07-16 16:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1345', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-07-16 16:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1346', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'card', 'completed', '2026-07-16 18:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1347', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'card', 'completed', '2026-07-16 12:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1348', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-07-16 20:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1349', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-07-16 19:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1350', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         14250, 750, 'card', 'completed', '2026-07-17 12:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1351', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'cash', 'completed', '2026-07-17 18:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1352', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'nasiya', 'completed', '2026-07-17 20:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1353', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'cash', 'completed', '2026-07-17 17:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1354', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-07-17 20:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1355', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 260000, 'cost_price', 140000)),
         494000, 26000, 'card', 'completed', '2026-07-17 11:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1356', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-07-17 14:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1357', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'cash', 'completed', '2026-07-17 21:36:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1358', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2745500, 144500, 'cash', 'completed', '2026-07-17 10:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1359', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'card', 'completed', '2026-07-17 15:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1360', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4037500, 212500, 'card', 'completed', '2026-07-18 11:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1361-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         -4037500, 0, 'cash', 'returned', '2026-07-20 11:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1362', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-07-18 14:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1363', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'transfer', 'completed', '2026-07-18 17:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1364', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'transfer', 'completed', '2026-07-18 10:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1365', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-07-18 13:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1366', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-07-18 19:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1367', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-07-18 13:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1368', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-07-18 11:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1369', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         28500, 1500, 'transfer', 'completed', '2026-07-18 10:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1370', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'card', 'completed', '2026-07-18 11:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1371', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3277500, 172500, 'card', 'completed', '2026-07-18 13:39:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1372', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-19 20:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1373', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-07-19 16:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1374', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-07-19 12:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1375', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'nasiya', 'completed', '2026-07-19 19:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1376', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'nasiya', 'completed', '2026-07-19 21:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1377', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-07-19 11:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1378', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'card', 'completed', '2026-07-19 19:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1379', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         152000, 8000, 'card', 'completed', '2026-07-19 19:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1380', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'card', 'completed', '2026-07-20 21:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1381', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'transfer', 'completed', '2026-07-20 11:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1382', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'cash', 'completed', '2026-07-20 19:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1383', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'nasiya', 'completed', '2026-07-20 18:35:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1384', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-07-20 20:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1385', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-07-20 16:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1386', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'transfer', 'completed', '2026-07-21 11:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1387', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'nasiya', 'completed', '2026-07-21 16:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1388', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-07-21 21:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1389', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-07-21 19:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1390', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-21 13:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1391', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8455000, 445000, 'nasiya', 'completed', '2026-07-21 19:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1392', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'transfer', 'completed', '2026-07-21 18:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1393', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-22 12:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1394', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-07-22 12:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1395', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-07-22 12:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1396-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         -15000, 0, 'cash', 'returned', '2026-07-25 12:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1397', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'transfer', 'completed', '2026-07-22 14:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1398', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-07-22 17:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1399', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         42750, 2250, 'cash', 'completed', '2026-07-22 20:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1400', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 260000, 'cost_price', 140000)),
         520000, 0, 'cash', 'completed', '2026-07-22 14:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1401', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-07-22 13:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1402', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         14250, 750, 'cash', 'completed', '2026-07-23 18:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1403', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-23 20:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1404', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-07-23 21:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1405', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'transfer', 'completed', '2026-07-23 10:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1406', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'nasiya', 'completed', '2026-07-23 17:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1407', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-07-23 12:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1408', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'nasiya', 'completed', '2026-07-23 19:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1409', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'cash', 'completed', '2026-07-23 20:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1410', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-07-24 18:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1411', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-24 17:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1412', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'nasiya', 'completed', '2026-07-24 18:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1413', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-07-24 19:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1414', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-07-24 12:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1415', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'cash', 'completed', '2026-07-24 19:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1416', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'cash', 'completed', '2026-07-24 11:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1417', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-07-24 19:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1418', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-07-24 17:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1419', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-24 19:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1420', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-07-25 20:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1421', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-25 14:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1422', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         228000, 12000, 'card', 'completed', '2026-07-25 19:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1423', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'transfer', 'completed', '2026-07-25 21:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1424', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-25 16:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1425', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-07-25 18:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1426', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-07-25 19:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1427', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'card', 'completed', '2026-07-25 18:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1428', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-25 13:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1429', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'transfer', 'completed', '2026-07-26 20:54:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1430', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-07-26 19:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1431', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 75000, 'cost_price', 38000)),
         150000, 0, 'cash', 'completed', '2026-07-26 17:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1432', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'cash', 'completed', '2026-07-26 17:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1433', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-26 09:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1434', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-07-26 20:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1435', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-07-26 19:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1436', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-07-26 10:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1437', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'card', 'completed', '2026-07-26 19:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1438', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-07-26 10:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1439-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         -90000, 0, 'cash', 'returned', '2026-07-28 10:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1440', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         42750, 2250, 'card', 'completed', '2026-07-27 17:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1441', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'nasiya', 'completed', '2026-07-27 10:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1442', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-07-27 18:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1443', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-27 19:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1444', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'cash', 'completed', '2026-07-27 12:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1445', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-07-28 19:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1446', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'cash', 'completed', '2026-07-28 13:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1447', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-07-28 19:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1448', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-07-28 18:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1449', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-07-28 10:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1450', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'cash', 'completed', '2026-07-28 16:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1451', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         14250, 750, 'card', 'completed', '2026-07-28 18:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1452', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-07-28 17:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1453', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-29 18:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1454', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-07-29 12:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1455', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'nasiya', 'completed', '2026-07-29 15:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1456', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         76000, 4000, 'card', 'completed', '2026-07-29 20:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1457', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'nasiya', 'completed', '2026-07-29 17:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1458', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-07-29 19:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1459', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-29 13:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1460', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-07-29 19:58:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1461', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-07-30 16:21:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1462', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-07-30 16:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1463', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'nasiya', 'completed', '2026-07-30 11:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1464', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 240000, 'cost_price', 120000)),
         480000, 0, 'card', 'completed', '2026-07-30 16:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1465', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'card', 'completed', '2026-07-30 17:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1466', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-07-30 17:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1467', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-07-30 11:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1468', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'card', 'completed', '2026-07-30 11:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1469', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-31 19:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 Pro 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1470', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 12500000, 'cost_price', 10800000)),
         12500000, 0, 'cash', 'completed', '2026-07-31 16:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1471', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-07-31 11:35:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 Pro 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1472', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 12500000, 'cost_price', 10800000)),
         11875000, 625000, 'cash', 'completed', '2026-07-31 10:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1473', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         342000, 18000, 'cash', 'completed', '2026-07-31 17:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1474', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-07-31 13:34:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1475', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'nasiya', 'completed', '2026-07-31 19:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1476', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'transfer', 'completed', '2026-07-31 18:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1477', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-07-31 18:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1478', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-07-31 10:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1479', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'nasiya', 'completed', '2026-08-01 13:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1480', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-08-01 14:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1481', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-08-01 19:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1482', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         171000, 9000, 'cash', 'completed', '2026-08-01 15:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1483', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-08-01 12:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1484', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-08-01 09:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1485', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-08-01 14:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1486', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         171000, 9000, 'cash', 'completed', '2026-08-01 16:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1487', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-08-01 18:36:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1488', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'transfer', 'completed', '2026-08-01 16:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1489', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'cash', 'completed', '2026-08-01 20:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1490', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'card', 'completed', '2026-08-02 11:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1491', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-02 12:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1492', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-02 11:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1493', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-08-02 21:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1494', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-02 13:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1495', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 240000, 'cost_price', 120000)),
         480000, 0, 'cash', 'completed', '2026-08-02 19:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 Pro 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1496', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 12500000, 'cost_price', 10800000)),
         12500000, 0, 'cash', 'completed', '2026-08-02 19:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1497', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'card', 'completed', '2026-08-02 13:35:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1498', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-08-03 16:48:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1499', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-08-03 17:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1500', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-08-03 18:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1501', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-03 16:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1502', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-08-03 16:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1503', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3505500, 184500, 'card', 'completed', '2026-08-04 09:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1504', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-08-04 17:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1505', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'transfer', 'completed', '2026-08-04 13:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1506', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'transfer', 'completed', '2026-08-04 15:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1507', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-08-04 15:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1508', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         199500, 10500, 'card', 'completed', '2026-08-04 14:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1509', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'transfer', 'completed', '2026-08-04 12:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1510', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'transfer', 'completed', '2026-08-05 13:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1511', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-08-05 21:13:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1512', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'card', 'completed', '2026-08-05 21:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1513', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         85500, 4500, 'cash', 'completed', '2026-08-05 16:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1514', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-08-05 19:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1515', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3087500, 162500, 'nasiya', 'completed', '2026-08-05 20:25:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1516', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-05 16:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1517', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         171000, 9000, 'card', 'completed', '2026-08-05 10:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1518', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'transfer', 'completed', '2026-08-06 11:58:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1519', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'card', 'completed', '2026-08-06 12:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1520', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'nasiya', 'completed', '2026-08-06 18:41:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1521', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'nasiya', 'completed', '2026-08-06 18:13:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1522', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'transfer', 'completed', '2026-08-06 11:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1523', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3505500, 184500, 'cash', 'completed', '2026-08-06 17:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1524', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4037500, 212500, 'cash', 'completed', '2026-08-06 21:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1525', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'cash', 'completed', '2026-08-06 18:00:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1526', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-08-07 18:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1527', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'nasiya', 'completed', '2026-08-07 17:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1528', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'transfer', 'completed', '2026-08-07 14:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1529', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-08-07 15:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1530-Q', 'Do‘kon egasi · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         -45000, 0, 'cash', 'returned', '2026-08-10 15:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1531', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-08-07 19:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1532', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'card', 'completed', '2026-08-07 20:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1533', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 240000, 'cost_price', 120000)),
         480000, 0, 'nasiya', 'completed', '2026-08-07 18:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1534-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 240000, 'cost_price', 120000)),
         -480000, 0, 'cash', 'returned', '2026-08-08 18:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1535', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'cash', 'completed', '2026-08-07 16:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1536', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'transfer', 'completed', '2026-08-07 19:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1537', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-08-07 18:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1538', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-08-08 13:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1539', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-08 16:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1540', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         85500, 4500, 'card', 'completed', '2026-08-08 09:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1541', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'nasiya', 'completed', '2026-08-08 18:41:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1542', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-08 18:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1543', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'cash', 'completed', '2026-08-08 12:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1544', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'transfer', 'completed', '2026-08-08 18:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1545', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-08-08 17:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1546', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-08 19:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1547', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-08-08 17:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1548-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         -90000, 0, 'cash', 'returned', '2026-08-09 17:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Feruza Saidova' LIMIT 1), 'D-1549', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-08-08 13:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1550', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-08 19:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1551', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-09 14:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1552', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'transfer', 'completed', '2026-08-09 10:27:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1553', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-08-09 14:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1554', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'card', 'completed', '2026-08-09 10:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1555', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'card', 'completed', '2026-08-09 12:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1556', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-08-09 16:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1557', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-08-09 15:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1558', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'card', 'completed', '2026-08-09 16:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1559', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 75000, 'cost_price', 38000)),
         142500, 7500, 'cash', 'completed', '2026-08-09 18:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Dilfuza Mirzayeva' LIMIT 1), 'D-1560', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'cash', 'completed', '2026-08-09 18:34:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1561', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'card', 'completed', '2026-08-10 15:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1562-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         -90000, 0, 'cash', 'returned', '2026-08-13 15:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1563', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'nasiya', 'completed', '2026-08-10 15:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1564', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3505500, 184500, 'nasiya', 'completed', '2026-08-10 19:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1565', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-08-10 19:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1566', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'nasiya', 'completed', '2026-08-10 17:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1567', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-08-10 18:41:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Dilfuza Mirzayeva' LIMIT 1), 'D-1568', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'cash', 'completed', '2026-08-10 15:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1569', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         85500, 4500, 'transfer', 'completed', '2026-08-11 19:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1570', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         14250, 750, 'card', 'completed', '2026-08-11 13:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1571', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-08-11 17:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1572', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'transfer', 'completed', '2026-08-11 14:47:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1573', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'transfer', 'completed', '2026-08-11 19:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1574', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-08-11 18:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1575', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         171000, 9000, 'nasiya', 'completed', '2026-08-12 19:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1576', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'transfer', 'completed', '2026-08-12 12:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1577', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'card', 'completed', '2026-08-12 13:58:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1578', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'nasiya', 'completed', '2026-08-12 19:13:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1579', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 90000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-08-12 15:38:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1580', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'card', 'completed', '2026-08-12 19:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1581', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'nasiya', 'completed', '2026-08-12 15:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1582', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-08-13 10:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1583', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         42750, 2250, 'card', 'completed', '2026-08-13 15:48:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1584', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-13 20:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1585', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'transfer', 'completed', '2026-08-13 20:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1586', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'nasiya', 'completed', '2026-08-13 18:48:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1587', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         85500, 4500, 'cash', 'completed', '2026-08-13 18:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1588', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-13 20:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1589', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'cash', 'completed', '2026-08-13 16:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1590', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         42750, 2250, 'nasiya', 'completed', '2026-08-14 15:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 Pro 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1591', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 12500000, 'cost_price', 10800000)),
         12500000, 0, 'cash', 'completed', '2026-08-14 18:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1592', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-08-14 14:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1593', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-14 16:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1594', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 240000, 'cost_price', 120000)),
         480000, 0, 'nasiya', 'completed', '2026-08-14 19:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1595', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-08-14 18:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1596', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'nasiya', 'completed', '2026-08-14 17:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1597', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-08-14 18:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1598', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-08-14 10:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1599', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'transfer', 'completed', '2026-08-15 20:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1600', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'nasiya', 'completed', '2026-08-15 15:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1601', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-15 10:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1602', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-08-15 15:36:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1603', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-15 20:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1604', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-08-15 10:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1605', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'card', 'completed', '2026-08-15 15:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1606', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'cash', 'completed', '2026-08-15 15:34:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1607', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'card', 'completed', '2026-08-15 19:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1608-Q', 'Do‘kon egasi · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         -3250000, 0, 'cash', 'returned', '2026-08-18 19:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1609', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-08-15 16:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1610', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'nasiya', 'completed', '2026-08-16 18:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1611', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'nasiya', 'completed', '2026-08-16 14:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1612', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-08-16 17:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1613', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'nasiya', 'completed', '2026-08-16 17:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1614', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-16 17:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1615', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'cash', 'completed', '2026-08-16 19:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1616-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         -3100000, 0, 'cash', 'returned', '2026-08-17 19:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1617', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-16 09:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1618', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'transfer', 'completed', '2026-08-16 16:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1619', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'cash', 'completed', '2026-08-16 19:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1620', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         85500, 4500, 'card', 'completed', '2026-08-17 20:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1621', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'cash', 'completed', '2026-08-17 14:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1622', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-17 18:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1623', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'cash', 'completed', '2026-08-17 18:39:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1624', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-08-17 21:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1625', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'card', 'completed', '2026-08-17 16:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1626', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'nasiya', 'completed', '2026-08-18 11:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1627', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'nasiya', 'completed', '2026-08-18 17:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1628', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'card', 'completed', '2026-08-18 15:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1629', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'cash', 'completed', '2026-08-18 10:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1630', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'nasiya', 'completed', '2026-08-18 13:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1631', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-08-18 12:23:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1632', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-08-18 18:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1633', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-08-19 17:58:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1634', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'card', 'completed', '2026-08-19 20:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1635', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'nasiya', 'completed', '2026-08-19 11:28:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1636', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'nasiya', 'completed', '2026-08-19 15:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1637', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-08-19 17:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1638', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-08-19 17:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1639', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'cash', 'completed', '2026-08-19 19:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1640', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'cash', 'completed', '2026-08-20 15:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1641', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-08-20 18:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1642', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-08-20 17:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1643', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 75000, 'cost_price', 38000)),
         150000, 0, 'cash', 'completed', '2026-08-20 12:15:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1644', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-08-20 13:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1645', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'card', 'completed', '2026-08-20 19:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1646', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'nasiya', 'completed', '2026-08-20 19:01:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1647', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'cash', 'completed', '2026-08-20 14:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1648', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         76000, 4000, 'card', 'completed', '2026-08-20 19:39:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1649', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-08-21 11:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1650', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-08-21 15:42:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1651', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-08-21 19:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1652', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'cash', 'completed', '2026-08-21 17:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1653', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-08-21 19:20:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1654', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 210000, 'cost_price', 160000)),
         420000, 0, 'cash', 'completed', '2026-08-21 11:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1655', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-21 16:51:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1656', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-08-21 11:45:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1657', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'nasiya', 'completed', '2026-08-22 18:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1658', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 210000, 'cost_price', 160000)),
         420000, 0, 'cash', 'completed', '2026-08-22 13:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1659', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-08-22 10:19:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1660', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-08-22 16:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1661', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'cash', 'completed', '2026-08-22 11:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1662', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'nasiya', 'completed', '2026-08-22 17:22:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1663', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 75000, 'cost_price', 38000)),
         75000, 0, 'transfer', 'completed', '2026-08-22 17:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1664', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-08-22 19:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1665', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         42750, 2250, 'cash', 'completed', '2026-08-22 11:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1666', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-22 12:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Rustam Ismoilov' LIMIT 1), 'D-1667', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-22 15:55:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1668', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         76000, 4000, 'nasiya', 'completed', '2026-08-22 18:48:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1669', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 75000, 'cost_price', 38000)),
         150000, 0, 'cash', 'completed', '2026-08-23 12:33:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1670', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-08-23 16:12:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1671', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-08-23 15:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1672', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-08-23 21:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1673', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-08-23 09:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1674', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'card', 'completed', '2026-08-23 16:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1675', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 180000, 'cost_price', 95000)),
         360000, 0, 'cash', 'completed', '2026-08-23 17:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1676', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-08-23 19:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1677', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-08-23 17:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1678-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         -80000, 0, 'cash', 'returned', '2026-08-25 17:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1), 'D-1679', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'nasiya', 'completed', '2026-08-23 19:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1680', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'card', 'completed', '2026-08-24 13:11:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1681', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-24 21:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1682', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'transfer', 'completed', '2026-08-24 13:07:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A35' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1683', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3450000, 'cost_price', 2900000)),
         3450000, 0, 'cash', 'completed', '2026-08-24 15:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1684', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'cash', 'completed', '2026-08-24 19:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1685', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'card', 'completed', '2026-08-25 17:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1686', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'cash', 'completed', '2026-08-25 16:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1687', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 75000, 'cost_price', 38000)),
         150000, 0, 'cash', 'completed', '2026-08-25 20:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1688-Q', 'Dilnoza Karimova · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 75000, 'cost_price', 38000)),
         -150000, 0, 'cash', 'returned', '2026-08-28 20:59:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Galaxy Watch 6 44mm' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1689', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3100000, 'cost_price', 2600000)),
         3100000, 0, 'nasiya', 'completed', '2026-08-25 15:30:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1690', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'cash', 'completed', '2026-08-25 19:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1691', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-25 17:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1692', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-08-26 13:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1693', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-08-26 16:04:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Powerbank 10000mAh' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1694', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 210000, 'cost_price', 160000)),
         210000, 0, 'cash', 'completed', '2026-08-26 19:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1695', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-08-26 13:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1), 'D-1696', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 240000, 'cost_price', 120000)),
         240000, 0, 'nasiya', 'completed', '2026-08-26 20:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1697', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-26 09:31:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1698', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         14250, 750, 'transfer', 'completed', '2026-08-26 18:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Otabek Tursunov' LIMIT 1), 'D-1699', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2890000, 0, 'card', 'completed', '2026-08-26 21:18:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1700', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-08-27 16:40:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1701', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'cash', 'completed', '2026-08-27 18:02:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1702', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'card', 'completed', '2026-08-27 15:57:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1), 'D-1703', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-27 11:24:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1704', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'card', 'completed', '2026-08-27 17:46:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1705', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-08-27 19:29:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Feruza Saidova' LIMIT 1), 'D-1706', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'card', 'completed', '2026-08-27 17:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1707-Q', 'Aziz Rasulov · qaytarish: Nuqsonli', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         -45000, 0, 'cash', 'returned', '2026-08-28 17:53:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1708', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 15000, 'cost_price', 6000)),
         30000, 0, 'card', 'completed', '2026-08-28 20:39:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1), 'D-1709', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 240000, 'cost_price', 120000)),
         480000, 0, 'nasiya', 'completed', '2026-08-28 18:26:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1710', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         152000, 8000, 'card', 'completed', '2026-08-28 17:03:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Type-C zaryadlovchi 20W' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1711', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 90000, 'cost_price', 95000)),
         90000, 0, 'cash', 'completed', '2026-08-28 09:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Xiaomi/Redmi Redmi Note 13' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Dilfuza Mirzayeva' LIMIT 1), 'D-1712', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2450000, 'cost_price', 2050000)),
         2450000, 0, 'cash', 'completed', '2026-08-28 18:49:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Simsiz zaryadlash disk' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1713', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 260000, 'cost_price', 140000)),
         260000, 0, 'cash', 'completed', '2026-08-28 12:43:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1714', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'card', 'completed', '2026-08-28 18:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='AirPods Pro 2 USB-C' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1), 'D-1715', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 2890000, 'cost_price', 2450000)),
         2745500, 144500, 'transfer', 'completed', '2026-08-28 14:32:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1716', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 80000, 'cost_price', 45000)),
         80000, 0, 'cash', 'completed', '2026-08-28 16:10:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1717', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         85500, 4500, 'card', 'completed', '2026-08-28 21:14:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Redmi Note 14 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1718', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3250000, 'cost_price', 2750000)),
         3250000, 0, 'card', 'completed', '2026-08-28 20:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1719', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'cash', 'completed', '2026-08-29 17:08:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Zaryadlovchi 65W GaN' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1720', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 180000, 'cost_price', 95000)),
         180000, 0, 'card', 'completed', '2026-08-29 19:05:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1721', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'transfer', 'completed', '2026-08-29 16:44:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1722', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'cash', 'completed', '2026-08-29 17:06:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1723', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 80000, 'cost_price', 45000)),
         160000, 0, 'card', 'completed', '2026-08-29 20:56:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Bluetooth quloqchin A9' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1), 'D-1724', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 240000, 'cost_price', 120000)),
         480000, 0, 'cash', 'completed', '2026-08-29 21:17:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Samsung Galaxy A55' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1725', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 4250000, 'cost_price', 3600000)),
         4250000, 0, 'nasiya', 'completed', '2026-08-29 21:50:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Dilfuza Mirzayeva' LIMIT 1), 'D-1726', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 15000, 'cost_price', 6000)),
         15000, 0, 'card', 'completed', '2026-08-29 12:34:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='Honor X9b 256GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1), 'D-1727', 'Do‘kon egasi', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 3690000, 'cost_price', 3100000)),
         3690000, 0, 'transfer', 'completed', '2026-08-29 12:09:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='iPhone 15 128GB' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1728', 'Dilnoza Karimova', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 8900000, 'cost_price', 7400000)),
         8900000, 0, 'cash', 'completed', '2026-08-29 12:16:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, NULL, 'D-1729', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 2, 'price', 45000, 'cost_price', 22000)),
         90000, 0, 'card', 'completed', '2026-08-29 17:37:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;
WITH p AS (SELECT id, name FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT 1, (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1), 'D-1730', 'Aziz Rasulov', jsonb_build_array(jsonb_build_object('id', p.id, 'name', p.name, 'qty', 1, 'price', 45000, 'cost_price', 22000)),
         45000, 0, 'cash', 'completed', '2026-08-29 15:52:00'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;

-- ── Nasiyalar ──
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1),
          'Nodira Yusupova', '998910111111', 30000, 0,
          '2026-09-28 21:00:00', 'To''lanmagan', '2026-08-14 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1),
          'Nodira Yusupova', '998910111111', 210000, 0,
          '2026-10-14 21:00:00', 'To''lanmagan', '2026-08-15 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1),
          'Bekzod Rahimov', '998910222222', 160000, 160000,
          '2026-09-30 21:00:00', 'To''landi', '2026-08-16 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1),
          'Zilola Ergasheva', '998910555555', 4250000, 2125000,
          '2026-09-15 21:00:00', 'To''lanmagan', '2026-08-16 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1),
          'Gulnora Qodirova', '998910777777', 3250000, 3250000,
          '2026-10-15 21:00:00', 'To''landi', '2026-08-16 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1),
          'Bekzod Rahimov', '998910222222', 80000, 0,
          '2026-10-01 21:00:00', 'To''lanmagan', '2026-08-17 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Sardor Aliyev' LIMIT 1),
          'Sardor Aliyev', '998910444444', 3690000, 1107000,
          '2026-09-17 21:00:00', 'To''lanmagan', '2026-08-18 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Jasur Nazarov' LIMIT 1),
          'Jasur Nazarov', '998910666666', 80000, 0,
          '2026-10-17 21:00:00', 'To''lanmagan', '2026-08-18 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1),
          'Malika Tosheva', '998910333333', 360000, 180000,
          '2026-09-17 21:00:00', 'To''lanmagan', '2026-08-18 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1),
          'Zilola Ergasheva', '998910555555', 8900000, 8900000,
          '2026-09-18 21:00:00', 'To''landi', '2026-08-19 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1),
          'Malika Tosheva', '998910333333', 2890000, 867000,
          '2026-09-02 21:00:00', 'To''lanmagan', '2026-08-19 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1),
          'Nodira Yusupova', '998910111111', 45000, 0,
          '2026-09-19 21:00:00', 'To''lanmagan', '2026-08-20 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1),
          'Bekzod Rahimov', '998910222222', 30000, 0,
          '2026-09-19 21:00:00', 'To''lanmagan', '2026-08-20 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Alisher Karimov' LIMIT 1),
          'Alisher Karimov', '998910000000', 4250000, 0,
          '2026-09-21 21:00:00', 'To''lanmagan', '2026-08-22 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Nodira Yusupova' LIMIT 1),
          'Nodira Yusupova', '998910111111', 360000, 0,
          '2026-09-21 21:00:00', 'To''lanmagan', '2026-08-22 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1),
          'Malika Tosheva', '998910333333', 76000, 0,
          '2026-10-06 21:00:00', 'To''lanmagan', '2026-08-22 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1),
          'Zilola Ergasheva', '998910555555', 45000, 0,
          '2026-09-06 21:00:00', 'To''lanmagan', '2026-08-23 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Malika Tosheva' LIMIT 1),
          'Malika Tosheva', '998910333333', 45000, 13500,
          '2026-09-22 21:00:00', 'To''lanmagan', '2026-08-23 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1),
          'Gulnora Qodirova', '998910777777', 3100000, 930000,
          '2026-10-09 21:00:00', 'To''lanmagan', '2026-08-25 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Gulnora Qodirova' LIMIT 1),
          'Gulnora Qodirova', '998910777777', 240000, 72000,
          '2026-09-09 21:00:00', 'To''lanmagan', '2026-08-26 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Zilola Ergasheva' LIMIT 1),
          'Zilola Ergasheva', '998910555555', 480000, 144000,
          '2026-09-27 21:00:00', 'To''lanmagan', '2026-08-28 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;
WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES (1,
          (SELECT id FROM customers WHERE store_id=1 AND name='Bekzod Rahimov' LIMIT 1),
          'Bekzod Rahimov', '998910222222', 4250000, 0,
          '2026-09-12 21:00:00', 'To''lanmagan', '2026-08-29 21:00:00')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;

-- ── Xarajatlar ──
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-08-26 21:00:00', 'Ijara', '[demo]', 4500000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-08-26 21:00:00', 'Ish haqi', '[demo]', 6200000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-08-26 21:00:00', 'Kommunal', '[demo]', 780000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-08-26 21:00:00', 'Transport', '[demo]', 420000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-07-27 21:00:00', 'Ijara', '[demo]', 4500000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-07-27 21:00:00', 'Ish haqi', '[demo]', 6200000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-07-27 21:00:00', 'Kommunal', '[demo]', 780000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-07-27 21:00:00', 'Transport', '[demo]', 420000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-06-27 21:00:00', 'Ijara', '[demo]', 4500000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-06-27 21:00:00', 'Ish haqi', '[demo]', 6200000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-06-27 21:00:00', 'Kommunal', '[demo]', 780000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;
WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES (1, '2026-06-27 21:00:00', 'Transport', '[demo]', 420000, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;

-- ── Qo'lda tuzatishlar (sverka uchun) ──
WITH p AS (SELECT id, stock FROM products WHERE store_id=1 AND name='USB-C kabel 1m' LIMIT 1),
ins AS (
  INSERT INTO stock_movements (store_id, product_id, type, qty, stock_before, stock_after, note, actor, created_at)
  SELECT 1, p.id, 'tuzatish', -4, p.stock - (-4), p.stock,
         '[demo] sanoqdan keyin', 'Dilnoza Karimova', now() - INTERVAL '3 days'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'movement', id FROM ins;
WITH p AS (SELECT id, stock FROM products WHERE store_id=1 AND name='Silikon chexol · iPhone 15' LIMIT 1),
ins AS (
  INSERT INTO stock_movements (store_id, product_id, type, qty, stock_before, stock_after, note, actor, created_at)
  SELECT 1, p.id, 'tuzatish', -3, p.stock - (-3), p.stock,
         '[demo] sanoqdan keyin', 'Dilnoza Karimova', now() - INTERVAL '9 days'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'movement', id FROM ins;
WITH p AS (SELECT id, stock FROM products WHERE store_id=1 AND name='Ekran himoyasi 9D' LIMIT 1),
ins AS (
  INSERT INTO stock_movements (store_id, product_id, type, qty, stock_before, stock_after, note, actor, created_at)
  SELECT 1, p.id, 'tuzatish', -5, p.stock - (-5), p.stock,
         '[demo] sanoqdan keyin', 'Dilnoza Karimova', now() - INTERVAL '16 days'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'movement', id FROM ins;
WITH p AS (SELECT id, stock FROM products WHERE store_id=1 AND name='Avto zaryadlovchi' LIMIT 1),
ins AS (
  INSERT INTO stock_movements (store_id, product_id, type, qty, stock_before, stock_after, note, actor, created_at)
  SELECT 1, p.id, 'tuzatish', 2, p.stock - (2), p.stock,
         '[demo] sanoqdan keyin', 'Dilnoza Karimova', now() - INTERVAL '24 days'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'movement', id FROM ins;

-- ── Mijozlarning xarid jamlanmasi ──
UPDATE customers c SET
  total_spent = COALESCE(s.sum, 0),
  purchases   = COALESCE(s.cnt, 0),
  last_visit  = COALESCE(s.last, c.created_at)
FROM (
  SELECT customer_id, SUM(total) AS sum, COUNT(*) AS cnt, MAX(date) AS last
  FROM transactions WHERE store_id = 1 AND status = 'completed' AND customer_id IS NOT NULL
  GROUP BY customer_id
) s
WHERE c.id = s.customer_id;


-- ── Mavjud tovarlarni demo hikoyasiga moslash ──
-- Sanani orqaga suramiz: tahlil tovar necha kundan beri sotilayotganiga
-- qarab tezlikni hisoblaydi. 6 kunlik tovar "juda tez ketyapti" bo'lib
-- ko'rinib qoladi.
UPDATE products SET created_at = now() - INTERVAL '95 days'
 WHERE store_id = 1 AND created_at > now() - INTERVAL '90 days';

-- Hozirgi qoldiqlar: bir nechtasi ataylab tugash arafasida
UPDATE products SET stock = v.st, "minStock" = v.mn
FROM (VALUES
  ('USB-C kabel 1m', 4, 10),
  ('Silikon chexol · iPhone 15', 22, 8),
  ('Zaryadlovchi 65W GaN', 7, 4),
  ('AirPods Pro 2 USB-C', 5, 2),
  ('Galaxy Watch 6 44mm', 6, 2),
  ('iPhone 15 128GB', 3, 2),
  ('iPhone 15 Pro 256GB', 1, 1),
  ('Samsung Galaxy A55', 2, 2),
  ('Xiaomi/Redmi Redmi Note 13', 2, 2)
) AS v(nm, st, mn)
WHERE products.store_id = 1 AND products.name = v.nm;

COMMIT;
