-- ══════════════════════════════════════════════════════════════════════════
-- Platforma sozlamalari va IMEI hisob-kitobi
--
-- Creator qulflash xizmati uchun har bir IMEI'dan pul oladi.
-- Hisob asosi: credit_devices — qulflash tizimiga ro'yxatdan o'tgan
-- har bir IMEI bir marta hisoblanadi (takroriy skaner pul olmaydi).
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Platforma sozlamalari (kalit/qiymat) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bitta IMEI uchun narx (so'm). Creator sozlamalardan o'zgartiradi.
INSERT INTO platform_settings(key, value) VALUES ('imei_price', '5000')
  ON CONFLICT (key) DO NOTHING;

GRANT SELECT, INSERT, UPDATE ON platform_settings TO mb_anon;

-- ── IMEI hisob ko'rinishi ────────────────────────────────────────────────
-- Har bir ro'yxatdan o'tgan IMEI bitta qator. Creator paneli buni
-- do'kon va davr bo'yicha yig'adi.
CREATE OR REPLACE VIEW imei_billing_view AS
SELECT
  d.id,
  d.store_id,
  s.name  AS store_name,
  d.imei,
  d.model,
  d.client_name,
  d.status,
  d.created_at
FROM credit_devices d
JOIN stores s ON s.id = d.store_id;

GRANT SELECT ON imei_billing_view TO mb_anon;

COMMIT;
