# -*- coding: utf-8 -*-
"""
Texno Bozor uchun demo savdo ma'lumoti.

Maqsad: AI Analitika, hisobotlar va katalogni HAQIQIY ma'lumotda
ko'rib baholash. Hozir do'konda bitta ham yaroqli sotuv yo'q, shuning
uchun har qanday tahlil bo'sh chiqadi.

Ma'lumot tasodifiy emas — ichiga do'konda uchraydigan holatlar ataylab
joylashtirilgan, ya'ni tahlil ularni topishi kerak:
  · tez tugayotgan tovar
  · javonda qotib qolgan tovar
  · zararga sotilayotgan tovar
  · muddati o'tgan nasiya
  · sababsiz qoldiq tuzatishi
  · yo'qolib borayotgan doimiy mijoz

Hamma yozuv `demo_data` jadvalida belgilanadi — keyin bitta buyruq
bilan to'liq tozalanadi, do'konning o'z ma'lumotiga tegmasdan.
"""
import io, os, random, datetime as dt

random.seed(2026)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'demo_seed.sql')
STORE = 1
TODAY = dt.datetime(2026, 8, 29, 21, 0, 0)
DAYS = 90

sql = []
W = sql.append


def q(v):
    """Satrni SQL uchun tayyorlaydi"""
    if v is None:
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


W("""-- ══════════════════════════════════════════════════════════════════════════
-- Texno Bozor — demo savdo ma'lumoti
--
-- Hamma yozuv `demo_data` da belgilanadi. Tozalash uchun:
--     \\i demo_clean.sql
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS demo_data (
  kind TEXT NOT NULL,
  id   BIGINT NOT NULL,
  PRIMARY KEY (kind, id)
);
""")

# ── Tovarlar ──────────────────────────────────────────────────────────────
# (nom, kategoriya, tannarx, narx, qoldiq, minQoldiq, emoji, rol)
#   rol: fast (tez ketadi), star (foyda beradi), dead (qotib qolgan),
#        loss (zararga), normal
NEW_PRODUCTS = [
    ("Ekran himoyasi 9D",        "Aksesuar",     6000,   15000, 3,  10, '🔗', 'fast'),
    ("Type-C zaryadlovchi 20W",  "Aksesuar",    95000,   90000, 24, 5,  '🔌', 'loss'),
    ("Powerbank 10000mAh",       "Aksesuar",   160000,  210000, 18, 4,  '🔌', 'normal'),
    ("Powerbank 20000mAh eski",  "Aksesuar",   240000,  290000, 14, 3,  '🔌', 'dead'),
    ("Avto zaryadlovchi",        "Aksesuar",    38000,   75000, 22, 6,  '🔌', 'normal'),
    ("Bluetooth quloqchin A9",   "Aksesuar",   120000,  240000, 16, 5,  '🎧', 'normal'),
    ("Simsiz zaryadlash disk",   "Aksesuar",   140000,  260000, 9,  3,  '🔌', 'normal'),
    ("Redmi Note 14 256GB",      "Xiaomi/Redmi", 2750000, 3250000, 6, 2, '📱', 'star'),
    ("Samsung Galaxy A35",       "Samsung",    2900000, 3450000, 4,  2,  '📱', 'star'),
    ("Honor X9b 256GB",          "Honor",      3100000, 3690000, 3,  2,  '📱', 'normal'),
]

W("-- ── Tovarlar ──")
for name, cat, cost, price, stock, minst, emoji, role in NEW_PRODUCTS:
    W(f"""WITH ins AS (
  INSERT INTO products (store_id, name, category, cost_price, price, stock, "minStock", image, is_online, created_at)
  VALUES ({STORE}, {q(name)}, {q(cat)}, {cost}, {price}, {stock}, {minst}, {q(emoji)}, TRUE,
          now() - INTERVAL '{DAYS + 5} days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'product', id FROM ins;""")

# ── Xodimlar ──────────────────────────────────────────────────────────────
STAFF = [
    ("Dilnoza Karimova", "dilnoza@texno-bozor.uz", "sotuvchi1"),
    ("Aziz Rasulov",     "aziz@texno-bozor.uz",    "sotuvchi2"),
]
W("\n-- ── Xodimlar ──")
for name, email, pw in STAFF:
    W(f"""WITH ins AS (
  INSERT INTO users (store_id, name, email, password, role, is_active, permissions)
  VALUES ({STORE}, {q(name)}, {q(email)}, {q(pw)}, 'cashier', TRUE,
          '["pos","inventory","crm","nasiya","chek"]'::jsonb)
  ON CONFLICT (email) DO NOTHING
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'user', id FROM ins;""")

# ── Mijozlar ──────────────────────────────────────────────────────────────
FIRST = ["Alisher", "Nodira", "Bekzod", "Malika", "Sardor", "Zilola", "Jasur",
         "Gulnora", "Rustam", "Feruza", "Otabek", "Dilfuza", "Shohruh",
         "Nigora", "Umid", "Kamola"]
LAST = ["Karimov", "Yusupova", "Rahimov", "Tosheva", "Aliyev", "Ergasheva",
        "Nazarov", "Qodirova", "Ismoilov", "Saidova", "Tursunov", "Mirzayeva",
        "Xolmatov", "Abdullayeva", "Sobirov", "Yo‘ldosheva"]

CUSTOMERS = []
for i in range(16):
    fn = FIRST[i]
    ln = LAST[i]
    CUSTOMERS.append((f"{fn} {ln}", "9989%08d" % (10000000 + i * 111111)))

W("\n-- ── Mijozlar ──")
for name, phone in CUSTOMERS:
    W(f"""WITH ins AS (
  INSERT INTO customers (store_id, name, phone, type, total_spent, purchases, created_at)
  VALUES ({STORE}, {q(name)}, {q(phone)}, 'regular', 0, 0, now() - INTERVAL '{DAYS} days')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'customer', id FROM ins;""")

# ── Sotuvlar ──────────────────────────────────────────────────────────────
# Mavjud tovarlar (1-9) + yangi qo'shilganlar nomlari orqali topiladi
EXISTING = {
    1: ("iPhone 15 128GB", 7400000, 8900000),
    2: ("iPhone 15 Pro 256GB", 10800000, 12500000),
    3: ("Samsung Galaxy A55", 3600000, 4250000),
    4: ("Xiaomi/Redmi Redmi Note 13", 2050000, 2450000),
    5: ("Silikon chexol · iPhone 15", 45000, 80000),
    6: ("USB-C kabel 1m", 22000, 45000),
    7: ("Zaryadlovchi 65W GaN", 95000, 180000),
    8: ("Galaxy Watch 6 44mm", 2600000, 3100000),
    9: ("AirPods Pro 2 USB-C", 2450000, 2890000),
}

# Sotuvda qatnashadigan tovarlar: (nom, tannarx, narx, og'irlik, rol)
POOL = []
for pid, (nm, c, p) in EXISTING.items():
    weight = {5: 9, 6: 12, 7: 6, 9: 5, 8: 2, 4: 3, 3: 3, 1: 2, 2: 1}.get(pid, 2)
    POOL.append((nm, c, p, weight, 'normal'))

for name, cat, cost, price, stock, minst, emoji, role in NEW_PRODUCTS:
    weight = {'fast': 14, 'star': 4, 'loss': 5, 'dead': 0, 'normal': 3}[role]
    POOL.append((name, cost, price, weight, role))

BAG = []
for nm, c, p, w, role in POOL:
    BAG.extend([(nm, c, p, role)] * w)

DOW = [1.15, 0.70, 0.85, 0.90, 1.00, 1.25, 1.50]   # yakshanbadan shanbagacha
CASHIERS = ["Do‘kon egasi", "Dilnoza Karimova", "Aziz Rasulov"]
CASHIER_W = [1, 3, 3]

W("\n-- ── Sotuvlar ──")

receipt = 1000
nasiya_rows = []      # (kun, mijoz_index, summa)

for d in range(DAYS, -1, -1):
    day = TODAY - dt.timedelta(days=d)
    load = DOW[(day.weekday() + 1) % 7] * (1 + (DAYS - d) * 0.004)
    count = max(1, int(round(5 * load + random.random() * 3)))

    for _ in range(count):
        hour = random.choices(range(9, 22),
                              weights=[3, 4, 5, 6, 6, 5, 6, 8, 10, 11, 10, 7, 4])[0]
        when = day.replace(hour=hour, minute=random.randint(0, 59), second=0)

        # "Powerbank 20000mAh eski" faqat 60 kundan oldin sotilgan
        while True:
            nm, cost, price, role = random.choice(BAG)
            if role == 'dead' and d < 60:
                continue
            break

        qty = random.choice([1, 1, 1, 2]) if price < 300000 else 1
        total = price * qty
        discount = int(total * 0.05) if random.random() < 0.12 else 0
        total -= discount

        r = random.random()
        method = 'cash' if r < 0.45 else 'card' if r < 0.75 else 'transfer' if r < 0.83 else 'nasiya'

        # Mijoz: yarmida bor. Ba'zilari doimiy — qayta-qayta keladi
        cust = None
        if random.random() < 0.55:
            cust = random.choices(range(16), weights=[9, 8, 7, 6, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1])[0]
            # Oxirgi 4 mijoz 60 kundan beri kelmaydi — yo'qolib borayotganlar
            if cust >= 12 and d < 60:
                cust = random.randint(0, 7)
        if method == 'nasiya' and cust is None:
            cust = random.randint(0, 7)

        cashier = random.choices(CASHIERS, weights=CASHIER_W)[0]
        receipt += 1

        cust_sql = (f"(SELECT id FROM customers WHERE store_id={STORE} AND name={q(CUSTOMERS[cust][0])} LIMIT 1)"
                    if cust is not None else 'NULL')

        # Tovar id'si HAQIQIY bo'lishi shart — tahlil tovarlarni aynan
        # shu id bo'yicha ajratadi. Nol qo'yilsa hamma sotuv bitta
        # tovarga tegishli bo'lib ko'rinadi va tahlil ma'nosini yo'qotadi.
        items_sql = (f"jsonb_build_array(jsonb_build_object("
                     f"'id', p.id, 'name', p.name, 'qty', {qty}, "
                     f"'price', {price}, 'cost_price', {cost}))")

        W(f"""WITH p AS (SELECT id, name FROM products WHERE store_id={STORE} AND name={q(nm)} LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT {STORE}, {cust_sql}, 'D-{receipt}', {q(cashier)}, {items_sql},
         {total}, {discount}, {q(method)}, 'completed', {q(when.isoformat(sep=' '))}
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;""")

        if method == 'nasiya':
            nasiya_rows.append((d, cust, total))

        # Qaytarishlar — sotuvning ~4% i
        if random.random() < 0.04:
            receipt += 1
            back = when + dt.timedelta(days=random.randint(1, 3))
            if back > TODAY:
                back = TODAY
            W(f"""WITH p AS (SELECT id, name FROM products WHERE store_id={STORE} AND name={q(nm)} LIMIT 1),
ins AS (
  INSERT INTO transactions (store_id, customer_id, receipt_no, cashier, items, total, discount, payment_method, status, date)
  SELECT {STORE}, NULL, 'D-{receipt}-Q', {q(cashier + ' · qaytarish: Nuqsonli')}, {items_sql},
         {-total}, 0, 'cash', 'returned', {q(back.isoformat(sep=' '))}
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'transaction', id FROM ins;""")

# ── Nasiyalar ─────────────────────────────────────────────────────────────
W("\n-- ── Nasiyalar ──")
for d, cust, total in nasiya_rows[-22:]:
    start = TODAY - dt.timedelta(days=d)
    term = random.choice([14, 30, 30, 45, 60])
    due = start + dt.timedelta(days=term)
    paid_ratio = random.choice([0, 0, 0.3, 0.5, 1.0])
    paid = int(total * paid_ratio)
    status = "To'landi" if paid >= total else "To'lanmagan"
    name, phone = CUSTOMERS[cust]
    W(f"""WITH ins AS (
  INSERT INTO debts (store_id, customer_id, client, phone, amount, paid_amount, due_date, status, date)
  VALUES ({STORE},
          (SELECT id FROM customers WHERE store_id={STORE} AND name={q(name)} LIMIT 1),
          {q(name)}, {q(phone)}, {total}, {paid},
          {q(due.isoformat(sep=' '))}, {q(status)}, {q(start.isoformat(sep=' '))})
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'debt', id FROM ins;""")

# ── Xarajatlar ────────────────────────────────────────────────────────────
W("\n-- ── Xarajatlar ──")
for month_back in range(3):
    base = TODAY - dt.timedelta(days=month_back * 30 + 3)
    for cat, amount in (("Ijara", 4500000), ("Ish haqi", 6200000),
                        ("Kommunal", 780000), ("Transport", 420000)):
        W(f"""WITH ins AS (
  INSERT INTO expenses (store_id, date, category, note, amount, cashier)
  VALUES ({STORE}, {q(base.isoformat(sep=' '))}, {q(cat)}, '[demo]', {amount}, 'Do‘kon egasi')
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'expense', id FROM ins;""")

# ── Qo'lda qoldiq tuzatishlari ────────────────────────────────────────────
# Sverkada "sababsiz o'zgarish" ko'rinishi uchun — tahlil buni topadi
W("\n-- ── Qo'lda tuzatishlar (sverka uchun) ──")
for days_ago, name, delta in (
    (3,  "USB-C kabel 1m",           -4),
    (9,  "Silikon chexol · iPhone 15", -3),
    (16, "Ekran himoyasi 9D",         -5),
    (24, "Avto zaryadlovchi",         +2),
):
    W(f"""WITH p AS (SELECT id, stock FROM products WHERE store_id={STORE} AND name={q(name)} LIMIT 1),
ins AS (
  INSERT INTO stock_movements (store_id, product_id, type, qty, stock_before, stock_after, note, actor, created_at)
  SELECT {STORE}, p.id, 'tuzatish', {delta}, p.stock - ({delta}), p.stock,
         '[demo] sanoqdan keyin', 'Dilnoza Karimova', now() - INTERVAL '{days_ago} days'
  FROM p
  RETURNING id)
INSERT INTO demo_data (kind, id) SELECT 'movement', id FROM ins;""")

# ── Mijoz jamlanmasi ──────────────────────────────────────────────────────
W("""
-- ── Mijozlarning xarid jamlanmasi ──
UPDATE customers c SET
  total_spent = COALESCE(s.sum, 0),
  purchases   = COALESCE(s.cnt, 0),
  last_visit  = COALESCE(s.last, c.created_at)
FROM (
  SELECT customer_id, SUM(total) AS sum, COUNT(*) AS cnt, MAX(date) AS last
  FROM transactions WHERE store_id = %d AND status = 'completed' AND customer_id IS NOT NULL
  GROUP BY customer_id
) s
WHERE c.id = s.customer_id;
""" % STORE)

W("""
-- ── Mavjud tovarlarni demo hikoyasiga moslash ──
-- Sanani orqaga suramiz: tahlil tovar necha kundan beri sotilayotganiga
-- qarab tezlikni hisoblaydi. 6 kunlik tovar "juda tez ketyapti" bo'lib
-- ko'rinib qoladi.
UPDATE products SET created_at = now() - INTERVAL '95 days'
 WHERE store_id = %d AND created_at > now() - INTERVAL '90 days';

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
WHERE products.store_id = %d AND products.name = v.nm;
""" % (STORE, STORE))

W("COMMIT;")

io.open(OUT, 'w', encoding='utf-8').write('\n'.join(sql) + '\n')
print('yozildi:', OUT)
print('sotuvlar:', sum(1 for x in sql if 'INTO transactions' in x))
print('nasiyalar:', len(nasiya_rows[-22:]))
print('tovarlar:', len(NEW_PRODUCTS), 'yangi')
print('mijozlar:', len(CUSTOMERS))
