-- ══════════════════════════════════════════════════════════════════════
-- Landing sahifasi uchun tariflar
--
-- Landing ochiq sahifa — u `platform_settings` ni to'g'ridan-to'g'ri o'qiy
-- olmaydi (o'sha jadvalda IMEI narxi kabi ichki sozlamalar ham bor).
-- Shuning uchun faqat tarif ro'yxatini qaytaradigan tor funksiya.
--
-- Nega bazadan: narx bitta joyda — creator panelida — turadi. Saytga
-- qo'lda yozilsa, tarif o'zgarganda sayt eski narxni ko'rsatib qolardi.
--
-- Qayta ishga tushirsa bo'ladi.
-- ══════════════════════════════════════════════════════════════════════
BEGIN;

CREATE OR REPLACE FUNCTION public.public_plans() RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(
    (SELECT json_agg(json_build_object(
        'key', p ->> 'key',
        'name', p ->> 'name',
        'price', p ->> 'price',
        'max_users', p ->> 'max_users',
        'max_branches', p ->> 'max_branches'))
       FROM json_array_elements((SELECT value::JSON FROM platform_settings WHERE key = 'plans')) p
      WHERE (p ->> 'price') IS NOT NULL),      -- narxi yo'q tarif saytda ko'rinmaydi
    '[]'::JSON)
$$;

REVOKE EXECUTE ON FUNCTION public.public_plans() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_plans() TO mb_anon, mb_user;

COMMIT;
