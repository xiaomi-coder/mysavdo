-- ══════════════════════════════════════════════════════════════════════════
-- Demo ma'lumotini tozalash
--
-- `demo-seed.sql` qo'shgan hamma narsani o'chiradi va do'konning o'z
-- ma'lumotiga tegmaydi. Har yozuv `demo_data` jadvalida belgilangan,
-- shuning uchun tozalash aniq: nom yoki sana bo'yicha taxmin qilinmaydi.
--
-- Ishlatish:
--     sudo -u postgres psql -d mybazzar -f demo-clean.sql
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Tartib muhim: avval bog'liq yozuvlar, keyin asosiylari
DELETE FROM stock_movements   WHERE id IN (SELECT id FROM demo_data WHERE kind = 'movement');
DELETE FROM debts             WHERE id IN (SELECT id FROM demo_data WHERE kind = 'debt');
DELETE FROM expenses          WHERE id IN (SELECT id FROM demo_data WHERE kind = 'expense');
DELETE FROM transactions      WHERE id IN (SELECT id FROM demo_data WHERE kind = 'transaction');
DELETE FROM customers         WHERE id IN (SELECT id FROM demo_data WHERE kind = 'customer');
DELETE FROM users             WHERE id IN (SELECT id FROM demo_data WHERE kind = 'user');

-- Tovarni o'chirishdan oldin uning harakat tarixi ketadi
DELETE FROM stock_movements
 WHERE product_id IN (SELECT id FROM demo_data WHERE kind = 'product');
DELETE FROM products          WHERE id IN (SELECT id FROM demo_data WHERE kind = 'product');

-- Mijoz jamlanmasini qayta hisoblaymiz — demo sotuvlar ketgach
-- eski raqamlar noto'g'ri bo'lib qoladi
UPDATE customers c SET
  total_spent = COALESCE(s.sum, 0),
  purchases   = COALESCE(s.cnt, 0)
FROM (
  SELECT customer_id, SUM(total) AS sum, COUNT(*) AS cnt
  FROM transactions WHERE status = 'completed' AND customer_id IS NOT NULL
  GROUP BY customer_id
) s
WHERE c.id = s.customer_id;

UPDATE customers SET total_spent = 0, purchases = 0
 WHERE id NOT IN (SELECT DISTINCT customer_id FROM transactions WHERE customer_id IS NOT NULL);

DROP TABLE IF EXISTS demo_data;

COMMIT;

NOTIFY pgrst, 'reload schema';
