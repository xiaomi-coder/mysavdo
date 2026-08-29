-- ══════════════════════════════════════════════════════════════════════════
-- MyBazzar — kredit telefonlar va masofadan qulflash
--
-- Nasiyaga sotilgan telefonni to'lov kechiksa qulflash tizimi.
--
-- ARXITEKTURA: MyBazzar — MIYA, qulflash mexanizmi — QO'L
--   · bu jadvallar kim, qaysi telefonni, qancha muddatga olganini,
--     to'lov jadvalini va qulf holatini yuritadi (biz to'liq quramiz)
--   · haqiqiy qulflashni tashqi provayder bajaradi:
--       - Android Management API (o'zimiz EMM, bepul), yoki
--       - reseller (Google Device Lock, ~20 ming/IMEI)
--     Shu sababli provider ustuni bor — qaysi mexanizm bo'lsa ham
--     boshqaruv qismi o'zgarmaydi.
--
-- Telefon zavod holatida QR bilan ro'yxatga olinadi. IMEI — asosiy
-- bog'lovchi: qulf buyrug'i o'sha IMEI/enrollment bo'yicha ketadi.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Kredit qurilma (nasiyaga sotilgan telefon) ───────────────────────────
CREATE TABLE IF NOT EXISTS credit_devices (
  id            SERIAL PRIMARY KEY,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  -- Sotuv va nasiya bilan bog'lash — qaysi chek, qaysi qarz
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  debt_id       INTEGER REFERENCES debts(id) ON DELETE SET NULL,
  customer_id   INTEGER REFERENCES customers(id) ON DELETE SET NULL,

  -- Qurilma
  imei          TEXT NOT NULL,
  model         TEXT,
  client_name   TEXT,
  client_phone  TEXT,

  -- Narx va nasiya sharti
  price         NUMERIC NOT NULL DEFAULT 0,   -- to'liq narx
  down_payment  NUMERIC NOT NULL DEFAULT 0,   -- boshlang'ich
  months        INTEGER NOT NULL DEFAULT 1,   -- necha oyga

  -- Qulflash mexanizmi
  provider      TEXT NOT NULL DEFAULT 'amapi', -- 'amapi' | 'reseller' | 'manual'
  enrollment_id TEXT,                          -- provayderdagi qurilma nomi/tokeni

  -- Holat:
  --   pending   — sotilgan, lekin telefon hali ro'yxatga olinmagan
  --   active    — ro'yxatda, ochiq, to'lovlar ketyapti
  --   warned    — to'lov kechikdi, ogohlantirildi
  --   locked    — qulflangan
  --   released  — to'liq to'landi, boshqaruvdan chiqarildi
  status        TEXT NOT NULL DEFAULT 'pending',

  locked_at     TIMESTAMPTZ,
  released_at   TIMESTAMPTZ,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_store  ON credit_devices(store_id, status);
CREATE INDEX IF NOT EXISTS idx_credit_imei   ON credit_devices(imei);
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_imei_active
  ON credit_devices(imei) WHERE status NOT IN ('released');

-- ── To'lov jadvali (bo'lib to'lash) ──────────────────────────────────────
-- Har oy uchun bitta qator. Nasiya bo'limi bitta summa ustida ishlaydi,
-- bu esa oy-oy jadval — telefon do'koni aynan shunday sotadi.
CREATE TABLE IF NOT EXISTS credit_schedule (
  id          SERIAL PRIMARY KEY,
  device_id   INTEGER NOT NULL REFERENCES credit_devices(id) ON DELETE CASCADE,
  n           INTEGER NOT NULL,               -- oy tartibi: 1, 2, 3...
  due_date    DATE NOT NULL,
  amount      NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  paid_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_schedule_device ON credit_schedule(device_id, n);
CREATE INDEX IF NOT EXISTS idx_schedule_due    ON credit_schedule(due_date) WHERE paid_at IS NULL;

-- ── Qulf buyruqlari navbati ──────────────────────────────────────────────
-- Ilova to'g'ridan-to'g'ri provayderni chaqirmaydi: buyruq shu jadvalga
-- yoziladi, tashqi xizmat (lock-worker) uni provayder API'siga uzatadi.
-- Sabab: ilovada provayder kaliti bo'lmasligi kerak va buyruq internet
-- uzilsa ham yo'qolmasin — navbatda turadi.
CREATE TABLE IF NOT EXISTS lock_commands (
  id          SERIAL PRIMARY KEY,
  device_id   INTEGER NOT NULL REFERENCES credit_devices(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,                  -- 'lock' | 'unlock' | 'message'
  reason      TEXT,
  payload     JSONB,                          -- xabar matni va h.k.
  status      TEXT NOT NULL DEFAULT 'queued', -- queued | sent | done | failed
  attempts    INTEGER NOT NULL DEFAULT 0,
  error       TEXT,
  actor       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  done_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cmd_queue ON lock_commands(status, created_at)
  WHERE status IN ('queued', 'failed');

-- ── To'lov qabul qilish ──────────────────────────────────────────────────
-- Bir amalda: jadvalga yozadi, qurilma holatini yangilaydi va kerak
-- bo'lsa ochish buyrug'ini navbatga qo'yadi. Ilova buni qismlarga
-- bo'lib qilsa, o'rtada uzilib xato holat qolishi mumkin.
CREATE OR REPLACE FUNCTION credit_pay(p_device INTEGER, p_amount NUMERIC, p_actor TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql AS $$
DECLARE
  v_left    NUMERIC := p_amount;
  v_row     RECORD;
  v_dev     credit_devices%ROWTYPE;
  v_all_paid BOOLEAN;
  v_was_locked BOOLEAN;
BEGIN
  SELECT * INTO v_dev FROM credit_devices WHERE id = p_device FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Qurilma topilmadi'; END IF;

  v_was_locked := v_dev.status IN ('locked', 'warned');

  -- Eng eski to'lanmagan oydan boshlab yopamiz
  FOR v_row IN
    SELECT * FROM credit_schedule
    WHERE device_id = p_device AND paid_amount < amount
    ORDER BY n
  LOOP
    EXIT WHEN v_left <= 0;
    DECLARE
      v_need NUMERIC := v_row.amount - v_row.paid_amount;
      v_put  NUMERIC := LEAST(v_left, v_need);
    BEGIN
      UPDATE credit_schedule
      SET paid_amount = paid_amount + v_put,
          paid_at = CASE WHEN paid_amount + v_put >= amount THEN now() ELSE paid_at END
      WHERE id = v_row.id;
      v_left := v_left - v_put;
    END;
  END LOOP;

  -- Hammasi to'landimi
  SELECT NOT EXISTS (
    SELECT 1 FROM credit_schedule WHERE device_id = p_device AND paid_amount < amount
  ) INTO v_all_paid;

  IF v_all_paid THEN
    -- To'liq to'landi — boshqaruvdan chiqaramiz va ochamiz
    UPDATE credit_devices
    SET status = 'released', released_at = now()
    WHERE id = p_device;
    INSERT INTO lock_commands (device_id, action, reason, actor)
    VALUES (p_device, 'unlock', 'To''liq to''landi', p_actor);
  ELSIF v_was_locked THEN
    -- Qulflangan edi, to'lov keldi — ochamiz va faollashtiramiz
    UPDATE credit_devices SET status = 'active', locked_at = NULL WHERE id = p_device;
    INSERT INTO lock_commands (device_id, action, reason, actor)
    VALUES (p_device, 'unlock', 'To''lov qabul qilindi', p_actor);
  END IF;

  RETURN jsonb_build_object(
    'applied', p_amount - v_left,
    'unused', v_left,
    'released', v_all_paid,
    'unlocked', v_was_locked OR v_all_paid
  );
END;
$$;

-- ── Kechikkanlarni ogohlantirish/qulflash ────────────────────────────────
-- Kuniga bir marta chaqiriladi (lock-worker yoki cron). Muddat o'tgan
-- oyni topadi va: avval ogohlantiradi, grace kunidan keyin qulflaydi.
-- "Ogohlantirib, keyin qulflash" — foydalanuvchi tanlagan qoida.
CREATE OR REPLACE FUNCTION credit_run_overdue(p_grace_days INTEGER DEFAULT 3)
RETURNS TABLE (device_id INTEGER, new_status TEXT)
LANGUAGE plpgsql AS $$
DECLARE
  v RECORD;
BEGIN
  FOR v IN
    SELECT d.id, d.status,
           MIN(s.due_date) AS oldest_due
    FROM credit_devices d
    JOIN credit_schedule s ON s.device_id = d.id AND s.paid_amount < s.amount
    WHERE d.status IN ('active', 'warned')
    GROUP BY d.id, d.status
    HAVING MIN(s.due_date) < current_date
  LOOP
    IF v.oldest_due < current_date - p_grace_days THEN
      -- Grace tugadi — qulflaymiz
      IF v.status <> 'locked' THEN
        UPDATE credit_devices SET status = 'locked', locked_at = now() WHERE id = v.id;
        INSERT INTO lock_commands (device_id, action, reason, actor)
        VALUES (v.id, 'lock', 'To''lov muddati o''tdi', 'tizim');
        device_id := v.id; new_status := 'locked'; RETURN NEXT;
      END IF;
    ELSE
      -- Muddat o'tdi, lekin grace ichida — ogohlantiramiz
      IF v.status = 'active' THEN
        UPDATE credit_devices SET status = 'warned' WHERE id = v.id;
        INSERT INTO lock_commands (device_id, action, reason,
          payload, actor)
        VALUES (v.id, 'message', 'To''lov muddati o''tdi',
          jsonb_build_object('grace_days', p_grace_days), 'tizim');
        device_id := v.id; new_status := 'warned'; RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- ── Ruxsatlar ────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON credit_devices  TO mb_anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON credit_schedule TO mb_anon;
GRANT SELECT, INSERT ON lock_commands TO mb_anon;
GRANT USAGE, SELECT ON SEQUENCE credit_devices_id_seq  TO mb_anon;
GRANT USAGE, SELECT ON SEQUENCE credit_schedule_id_seq TO mb_anon;
GRANT USAGE, SELECT ON SEQUENCE lock_commands_id_seq   TO mb_anon;
GRANT EXECUTE ON FUNCTION credit_pay(INTEGER, NUMERIC, TEXT) TO mb_anon;
-- credit_run_overdue faqat lock-worker (mb_bot) chaqiradi, ilova emas

COMMIT;

NOTIFY pgrst, 'reload schema';
