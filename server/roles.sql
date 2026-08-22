-- ══════════════════════════════════════════════════════════════════════════
-- MyBazzar — PostgREST rollariga ruxsatlar
--
-- Serverda `crm` loyihasi ham turibdi va uning `anon`/`authenticator`
-- rollari bor. Postgres'da rollar butun klaster uchun umumiy, shuning uchun
-- MyBazzar ATAYLAB alohida rollar ishlatadi (mb_ prefiksi) — ikki loyiha
-- bir-birining bazasiga kira olmaydi.
--
-- Rollarning o'zi setup.sh da yaratiladi (parol kerak bo'lgani uchun).
-- Bu fayl faqat ruxsatlarni beradi.
--
-- Ishga tushirish:  psql -d mybazzar -f roles.sql
-- ══════════════════════════════════════════════════════════════════════════

-- mb_authenticator PostgREST ulanish roli; so'rov paytida mb_anon ga o'tadi
GRANT mb_anon TO mb_authenticator;

-- ── Faqat shu bazaga kirish ──────────────────────────────────────────────
REVOKE ALL ON DATABASE mybazzar FROM PUBLIC;
GRANT CONNECT ON DATABASE mybazzar TO mb_authenticator, mb_anon;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO mb_anon;

-- ── Jadval ruxsatlari ────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mb_anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mb_anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO mb_anon;

-- Kelajakda qo'shiladigan jadvallar uchun ham
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mb_anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO mb_anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO mb_anon;
