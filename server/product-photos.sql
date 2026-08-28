-- ══════════════════════════════════════════════════════════════════════════
-- MyBazzar — tovarga bir nechta surat
--
-- Ilgari tovarga bitta surat qo'yish mumkin edi (`photo_url`). Onlayn
-- katalogda bu kamlik qiladi: mijoz telefonni old, orqa va yon
-- tomondan ko'rishni xohlaydi.
--
-- Yechim: `photos` — suratlar ro'yxati. `photo_url` esa saqlanib
-- qoladi va DOIM birinchi suratga teng bo'ladi. Sabab: chek, savat
-- ichidagi kichik rasm va eski yozuvlar hammasi `photo_url` ni
-- o'qiydi. Ularni qayta yozish shart emas — tetik ikkalasini
-- o'zi bir joyda ushlab turadi.
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Mavjud suratlarni ro'yxatga ko'chiramiz
UPDATE products
   SET photos = jsonb_build_array(photo_url)
 WHERE photo_url IS NOT NULL
   AND photo_url <> ''
   AND jsonb_array_length(photos) = 0;

-- ── photo_url va photos doim mos turadi ──────────────────────────────────
--
-- Qaysi ustun O'ZGARTIRILGANIGA qarab yo'nalish tanlanadi. Bu muhim:
-- aks holda bo'sh ro'yxat yozib suratni o'chirib bo'lmaydi — tetik uni
-- eski `photo_url` dan qayta tiklab qo'yaveradi.
CREATE OR REPLACE FUNCTION sync_product_photos() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  photos_changed BOOLEAN;
  url_changed    BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    photos_changed := (NEW.photos IS NOT NULL AND jsonb_array_length(NEW.photos) > 0);
    url_changed    := (NEW.photo_url IS NOT NULL AND NEW.photo_url <> '');
  ELSE
    photos_changed := NEW.photos IS DISTINCT FROM OLD.photos;
    url_changed    := NEW.photo_url IS DISTINCT FROM OLD.photo_url;
  END IF;

  IF photos_changed THEN
    -- Ro'yxat yangilandi — birinchi surat asosiy bo'ladi
    NEW.photo_url := NULLIF(NEW.photos->>0, '');

  ELSIF url_changed THEN
    -- Eski usulda faqat photo_url yozilgan — ro'yxatni undan yasaymiz
    IF NEW.photo_url IS NULL OR NEW.photo_url = '' THEN
      NEW.photos := '[]'::jsonb;
    ELSE
      NEW.photos := jsonb_build_array(NEW.photo_url);
    END IF;
  END IF;

  IF NEW.photos IS NULL THEN
    NEW.photos := '[]'::jsonb;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_product_photos ON products;
CREATE TRIGGER trg_product_photos
  BEFORE INSERT OR UPDATE OF photos, photo_url ON products
  FOR EACH ROW EXECUTE FUNCTION sync_product_photos();

COMMIT;

NOTIFY pgrst, 'reload schema';
