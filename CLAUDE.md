# MyBazzar — loyiha qo'llanmasi

O'zbekiston do'konlari uchun savdo boshqaruv platformasi. Bitta backend'da
ishlaydigan **veb ilova** va **mobil ilova**, ustiga **Telegram bot** va
**masofadan telefon qulflash** tizimi.

> ## 📌 Bu fayl — tirik jurnal
>
> Har bir ish tugagach shu faylga yoziladi:
> - bajarilgani → **§9 Bajarilgan ishlar** (sana bilan)
> - qolgani / yangi kelishilgani → **§10 Qilinishi kerak** (ustuvorligi bilan)
> - topilgan tuzoq yoki xato sababi → **§8 Tuzoqlar** (takrorlanmasligi uchun)
>
> Ish tugagach uni §10 dan olib §9 ga ko'chiring.
> **Maxfiy qiymat yozilmaydi** — token, parol, kalit faqat serverdagi joyi
> ko'rsatiladi (bu fayl GitHub'ga ketadi).

---

## 1. Texnik asos

| Qism | Texnologiya |
|---|---|
| Veb | React 18 (CRA), React Router, Recharts, Phosphor Icons |
| Mobil | React Native + Expo SDK 57, EAS Build |
| Backend | PostgREST (`mybazzar.uz/rest/v1`), PostgreSQL |
| Bot / worker | Node.js 20, systemd |
| AI maslahat | `bot/ai-service.js` (127.0.0.1:3003, nginx `/ai/`) |
| Qulflash | Google Android Management API (AMAPI) |

**Muhim:** alohida backend kodi yo'q — PostgREST bazani to'g'ridan-to'g'ri
ochadi. Shuning uchun mantiq **SQL funksiya, view va triggerlarda** yashaydi
(`server/*.sql`). Yangi imkoniyat qo'shganda avval shu yerni o'ylang.

### Rollar (DB)
- `mb_anon` — ilova (veb va mobil) shu rol bilan o'qiydi/yozadi
- `mb_bot` — Telegram bot va qulf ijrochisi
- `mb_authenticator` — PostgREST kirish roli

---

## 2. Papka tuzilmasi

```
src/                  Veb ilova
  pages/              Har bo'lim bitta fayl (POS, Inventory, DeviceLock…)
  components/UI.js    Umumiy dizayn komponentlari (Btn, Card, Modal…)
  context/AuthContext.js   Foydalanuvchi, ruxsatlar, ROLE_NAV menyusi
  utils/              UMUMIY mantiq — mobil ham shu yerdan oladi
mobile/               React Native ilova
  src/screens/        Ekranlar
  src/ui/             Mobil dizayn komponentlari
server/*.sql          Baza sxemasi, funksiyalar, viewlar
bot/                  Telegram bot + qulf ijrochisi (lock-worker)
```

### Umumiy kod (juda muhim)
`src/utils/` dagi fayllar **ikkala ilovada** ishlaydi. Mobil ularni Metro
`@shared/` taxallusi orqali oladi (`mobile/metro.config.js`).

Umumiy: `stock.js`, `receipt.js`, `labels.js`, `catalog.js`, `insights.js`

Hisob-kitobni **faqat shu yerda** yozing. Ilgari veb va mobil alohida
hisoblardi — natijalar bir-biriga to'g'ri kelmasdi.

---

## 3. Yozish qoidalari

- **Izohlar o'zbek tilida**, va *nima* qilinayotganini emas, **nega** shunday
  qilinganini tushuntiradi
- **Soxta ma'lumot yo'q.** Landing sahifada uydirma mijoz soni, reyting yoki
  otziv bo'lmaydi; katalogda soxta yulduzcha yoki yetkazib berish yozilmaydi.
  Egasining qat'iy talabi: *"soxta ko'rsatish mijozni aldash bo'ladi"*
- **Maxfiy ma'lumot repoga tushmaydi** — token, parol, kalit faqat serverda
- Dizayn tokenlari (`--color-accent`, `--radius-md`…) `src/index.css` da;
  rangni qo'lda yozmang, token ishlating (yorug'/qorong'i rejim shunga bog'liq)

---

## 4. Server va maxfiy ma'lumotlar

VPS: `138.249.7.47` (Ubuntu 22.04, Asia/Tashkent). Veb `/var/www/mybazzar`.

**Maxfiy qiymatlar faqat serverda** (repoda YO'Q, `.gitignore` da):

| Nima | Qayerda |
|---|---|
| Bot tokeni, DB ulanishi, AMAPI korxona nomi | `/etc/mybazzar/bot.env` |
| Google xizmat hisobi kaliti | `/etc/mybazzar/amapi-key.json` (chmod 600) |

systemd xizmatlari: `mybazzar-bot`, `mybazzar-lock-worker`, `mybazzar-ai`

⚠️ Bu serverda **boshqa tirik loyihalar ham bor** — nginx va umumiy
sozlamalarga tegishdan oldin tekshiring.

---

## 5. Qurilgan imkoniyatlar

### Do'kon uchun
- **POS kassa** — barcode/IMEI qidiruv, savat, chegirma, chek chop etish, offline rejim
- **Ombor** — qoldiq, ommaviy kirim, ta'minotchilar, inventarizatsiya, minimal qoldiq ogohlantirishi
- **Nasiya** — muddatli qarz, qisman to'lov, muddati o'tganlar
- **Mijozlar (CRM)** — xaridorlar va dilerlar, xarid tarixi, joriy qarz
- **Onlayn katalog** (Storefront) — ko'p suratli, marketplace uslubida
- **Buyurtmalar** — onlayn buyurtma qabul qilish
- **Moliya, Hisobotlar, AI Analitika**
- **Xodimlar** — rol va ruxsatlar
- **Kredit telefonlar** — masofadan qulflash (faqat telefon do'konida)

### Creator (platforma egasi) paneli
- Do'konlar, **foydalanuvchilar** (do'kon direktori ostida guruhlangan, xodimlar ochiladi)
- **IMEI Block** — qulflash xizmati hisob-kitobi: do'kon kesimida IMEI soni,
  narx, summa; davr filtri; do'kon bo'yicha tafsilot
- Sozlamalar — bitta IMEI narxi (`platform_settings.imei_price`)

### Do'kon turi
`stores.store_type`: `general` (oddiy) yoki `phone` (telefon do'koni).

Bu **universal riteyl** modeli — kiyim, quyosh paneli, kosmetika, qurilish
mollari hammasi `general` da ishlaydi. `phone` alohida, chunki IMEI va
qulflash faqat telefonga xos.

Turga bog'liq bo'lim qo'shish: `ROLE_NAV` elementiga `storeType: 'phone'`
qo'ying — Sidebar va `PrivateRoute` qolganini o'zi qiladi.

### Telegram bot (@MyBazzaruzbot)
- Do'kon egasiga savdo/qoldiq/qarz hisoboti
- **Kunlik xulosa vaqtini har do'kon o'zi tanlaydi** (`/vaqt N`)
- Yangi buyurtma xabari — `pg_notify('mb_order')` orqali darhol
- Creator uchun **platforma darajasidagi** ko'rsatkichlar (do'kon kassasi emas)

### Masofadan telefon qulflash (AMAPI)
Google loyiha `mybazzar-507001`, korxona **`enterprises/LC01xcdxh0`**.

Oqim (ilova Google bilan to'g'ridan gaplashmaydi — kalit serverda):
1. Ilova `credit_devices` ga `pending` qator qo'shadi
2. `lock-worker` AMAPI'dan enrollment QR olib `enroll_qr` ga yozadi
3. Ilova haqiqiy Google QR ko'rsatadi
4. Zavod holatidagi telefonda 6 marta bosib QR skanerlanadi
5. Worker qurilmani topib `enrollment_id` + `status='active'` qiladi
6. To'lov kechiksa ogohlantiradi → 3 kundan keyin qulflaydi → to'langach ochadi

**Qulflash siyosat almashtirish orqali:** `credit-locked` (bo'sh kiosk +
ogohlantirish ekrani, factory reset o'chirilgan) ↔ `credit-default`.
Bir martalik `LOCK` buyrug'i **yaramaydi** — mijoz PIN bilan ochib
ishlatishda davom etadi.

---

## 6. Muhim baza obyektlari

| Nom | Vazifasi |
|---|---|
| `credit_devices` | Nasiyaga sotilgan telefon, IMEI, qulf holati |
| `credit_schedule` | Oylik to'lov jadvali |
| `lock_commands` | Qulflash/ochish buyruqlari navbati |
| `credit_pay(device, amount, actor)` | Eng eski oydan yopadi, kerak bo'lsa avtomatik ochadi |
| `credit_run_overdue(grace_days)` | Kechikkanlarni ogohlantiradi/qulflaydi |
| `credit_device_view` | Qurilma + jadval agregatlari (qoldiq, kechikish, oy) |
| `imei_billing_view` | Creator hisob-kitobi uchun IMEI ro'yxati |
| `platform_settings` | Platforma sozlamalari (kalit/qiymat) |
| `shifts` | Kassa smenasi (ochilgan/yopilgan, boshlang'ich va sanalgan pul) |
| `shift_view` | Smena + kutilayotgan summa va **farq** (naqd bo'yicha) |
| `move_stock(...)` | Qoldiqni o'zgartiradi — qisman qaytarish shu bilan |
| `sync_product_photos()` | `photos[0]` ↔ `photo_url` mosligini saqlaydi |
| `branches` | Filiallar (har do'konda bittasi `is_main`). O'chirilmaydi — faqat yopiladi |
| `branch_stock` | Filial qoldig'i. `products.stock` shundan hisoblanadi (VIEW) |
| `transfers` | Filiallararo ko'chirish: `sent` → `received` / `cancelled` |
| `current_branch()` | Token `branch_id` > `X-Branch` > asosiy; `NULL` = barcha filiallar |
| `transfer_send / receive / cancel` | Ko'chirish faqat shular orqali (jadvalga to'g'ridan yozib bo'lmaydi) |
| `set_ai_config / ai_config` | AI kalitini o'rnatish (creator) va holatini so'rash. Kalit QAYTMAYDI |
| `private.ai_key / private.jwt_verify` | AI xizmati uchun ikki tor eshik (faqat `mb_bot`) |
| `ai_reports` | Kunlik AI tahlili keshi (do'kon o'zinikini o'qiydi, yoza olmaydi) |
| `public_plans()` | Landing uchun tarif ro'yxati (ochiq, faqat narxi borlari) |

---

## 7. Deploy

```bash
# Veb
CI=false npm run build      # keyin build/ papkasini /var/www/mybazzar ga
# Mobil — to'liq build (native o'zgarish bo'lsa)
cd mobile && npx eas-cli build --platform android --profile preview
# Mobil — faqat JS o'zgarsa (APK qayta o'rnatilmaydi)
cd mobile && CI=1 npx eas-cli update --branch preview --environment preview   --platform android --message "..." --non-interactive
# SQL
psql -d mybazzar -f server/<fayl>.sql
# Sxema o'zgarsa PostgREST keshini yangilang:
psql -d mybazzar -c "NOTIFY pgrst, 'reload schema';"
```

`server/*.sql` fayllari **qayta ishga tushirsa bo'ladigan** qilib yozilgan
(`IF NOT EXISTS`, `CREATE OR REPLACE`).

---

## 8. Bilib qo'yish kerak bo'lgan tuzoqlar

- **PostgREST yangi ustunni ko'rmaydi** — sxema keshini yangilash shart.
  Ustun-darajali GRANT bo'lsa, yangi ustunga alohida ruxsat bering.
- **`analyze()` qaytish shakli doim bir xil bo'lsin.** Bir paytlar
  `forecast` "tayyor emas" holatda `history` maydonini qaytarmagan — natijada
  har bir yangi do'konda AI Analitika **butun ilovani qora ekranga**
  aylantirgan. Endi `PageErrorBoundary` bor, lekin ildiz sabab — shakl
  o'zgaruvchanligi.
- **Sahifa xatosi butun ilovani o'chirmaydi** — `Layout.js` ichida
  `PageErrorBoundary`, marshrut bo'yicha `key` bilan tiklanadi.
- **Menyu havolasini qattiq yozmang.** Pastdagi ⚙️ `/settings` ga qattiq
  bog'langani uchun creator o'z sozlamalariga kira olmagan. Endi havola
  `ROLE_NAV` dan olinadi.
- **`react-native-keyboard-controller`** `reanimated` + `worklets` va
  `babel.config.js` da plagin talab qiladi — bo'lmasa ilova qurilmada qulaydi.
- **`products.stock` — butun son.** Kilogramm/litr yo'q, shuning uchun
  oziq-ovqat va vaznli savdo hozircha to'g'ri kelmaydi.
- **`mb_anon` = internetdagi hamma.** PostgREST `db-anon-role` bilan
  ishlaydi va nginx orqali `/rest/v1` tashqariga ochiq. Shuning uchun
  `mb_anon` ga berilgan har bir GRANT butun dunyoga berilgan hisoblanadi.
  Maxfiy ustun (parol, merchant kaliti) hech qachon `mb_anon` o‘qiydigan
  joyda turmasin. Tekshirish: `curl https://mybazzar.uz/rest/v1/<jadval>`
- **View RLS’ni chetlab o‘tadi.** Oddiy view egasi (postgres) nomidan
  ishlaydi. Yangi view yaratsangiz: `ALTER VIEW ... SET (security_invoker = true)`
- **Maxfiy ustunni `users` da ustun-darajali GRANT bilan yashirmang.**
  PostgREST `select=*` barcha ustunga ruxsat talab qiladi va xato beradi.
  Maxfiy narsa `private` sxemada alohida jadvalda turadi
- **RLS do‘kon ichidagi rollarni ajratmaydi.** Sotuvchi API orqali o‘z do‘koni
  tovarini o‘chira oladi — bu hozircha faqat UI’da cheklangan
- **`sudo -u postgres psql -f /root/x.sql` ishlamaydi** — postgres `/root` ni
  o'qiy olmaydi. Faylni stdin orqali bering: `psql ... < /root/x.sql`
- **`eas update` (eas-cli 24+)** `--environment` siz va `--platform android`
  siz yiqiladi (vebni ham eksport qilmoqchi bo'ladi). Buyruq — §7 da
- **Mobil yangilanish ikkinchi ochilishda qo'llanadi.** Birinchi ochilishda
  fonda yuklanadi. Foydalanuvchiga: ilovani to'liq yoping va qayta oching
- **Google xizmatini tanlashdan oldin uning "Permissible Usage" qoidasini
  o‘qing.** AMAPI "resellersiz bepul yo‘l" deb tanlangan, lekin qoidada nasiya
  qulflash aniq taqiqlangan ekan — bu sotuvdan oldin, qurilgandan keyin topildi
- **Maxfiy kalit `platform_settings` da turmaydi** — u jadvalni har bir
  do'kon ilovasi o'qiy oladi. AI kaliti `private.secrets` da; creator uni
  `set_ai_config` bilan yozadi, hech kim (creator ham) qaytarib o'qiy
  olmaydi. AI chaqiruvi serverdagi xizmatda bajariladi
- **`mb_bot` ga yangi jadval avtomatik ochilmaydi.** AI xizmati ishga
  tushdi-yu, `platform_settings` ni o'qiy olmadi — GRANT unutilgan edi.
  Yangi server xizmati yozsangiz, u tegadigan HAR jadvalni tekshiring
- **JSON ni `psql -c "..."` ichiga qo'ymang** — qo'shtirnoqlar shell
  tomonidan yeb yuboriladi va bazada buzuq qiymat qoladi (tariflar bir
  marta shunday buzildi). Faylga yozib `psql < fayl` qiling, keyin
  `json.loads` bilan tekshiring
- **Yangi do'konni alohida sinang.** Mavjud do'konda hammasi ishlayotgani
  hech narsani bildirmaydi. `branches-phase2.sql` da `NEW.is_main := false`
  qatori "ilovadan qo'shilganda" shartidan tashqarida qolgan edi — natijada
  YANGI do'konga avtomatik ochiladigan "Asosiy filial" belgisiz qolib,
  o'sha do'konda tovar qo'shish ham, kassa ochish ham ishlamas edi. Eski uch
  do'konda muammo ko'rinmagan (ularning filiali bundan oldin yaratilgan).
  Topildi: nusxada nol ma'lumotli do'kon ochib, ilova yuboradigan barcha
  so'rovni ketma-ket bajarish bilan (`scratchpad/yangi_dokon_remote.py` usuli)
- **`SELECT s.*` li view yangi ustunni ko'rmaydi.** Ustunlar view yaratilgan
  paytda qotadi. `shifts.branch_id` qo'shilgach `shift_view` da u yo'q edi —
  view'ni DROP + CREATE qiling (`security_invoker` va GRANT'ni qayta bering)
- **"Barcha filiallar" rejimida `move_stock` jimgina asosiy filialga tushadi**
  (`p_branch` berilmasa). Qaytarish, kirim kabi amallarda filialni aniq
  bering: qaytarish — `p_branch: tx.branch_id` (sotilgan filialga)
- **Filial ichida sanaladigan narsa endi filial bo'yicha.** RLS joriy filialni
  qaytaradi: `transactions` soni ham. Veb chek raqami shu sababli asosiy
  bo'lmagan filialda `#F<id>-N` ko'rinishida (ikki filialda bir xil `#15` bo'lmasin)
- **Jadvalga yozish ruxsati = funksiyani chetlab o'tish.** `transfers` ga
  INSERT bor ekan — "yo'lda" soxta ko'chirish qo'shib, qabul qilib, yo'q joydan
  qoldiq yaratsa bo'lardi. Endi trigger faqat `SET mb.transfer_fn='1'` li
  funksiya ichidan yozishga ruxsat beradi (PostgREST `set_config` ni ochmaydi)
- **Ekrandagi "yuborildi" xabarini tekshiring.** Vebda oflayn sotuvlar
  internet qaytganda bazaga YUBORILMASDAN o'chirilib, "yuborildi" deyilardi
  (2026-09-19 tuzatildi). Soxta tarif kartasi ham bo'lgan ("Business $59/oy")
- **`SECURITY DEFINER` ichida `current_user` — funksiya egasi (postgres).**
  "So'rov ilovadanmi?" ni `current_user = 'mb_user'` bilan tekshirmang — doim
  yolg'on bo'ladi (filial chegarasi shu sababli ishlamay qolgan). Tokendagi
  rol bilan tekshiring: `auth_role() IS NOT NULL`
- **Migratsiya tartibi:** `branches.sql` dan keyin `products` — VIEW. Eski
  fayllar (`auth-phase2.sql`, `subscription.sql`) ichidagi siyosat
  ro'yxatida `products` bor — ularni qayta ishga tushirmang
- **Import qilinmagan ikonka butun mobil ilovani qulatadi.**
  `mobile/src/ui/Icon.js` dagi `MAP` da nom ishlatilib, `phosphor-react-native`
  dan import qilinmasa — `ReferenceError` modul yuklanishida chiqadi. Icon.js ni
  hamma ekran import qilgani uchun ilova **splash'dan keyin darhol yopiladi**,
  hech qanday xato oynasi ko'rsatmaydi. Metro buni **ushlamaydi** (bundle
  muvaffaqiyatli yig'iladi), ESLint ham ushlamadi.
  Tekshirish: `adb logcat` da `ReactNativeJS: ReferenceError: Property 'X'
  doesn't exist`. Yoki `@babel/traverse` bilan `scope.hasBinding` orqali butun
  papkani skanerlash — shu usul 4 ta yetishmayotgan importni topgan
  (`LockSimpleOpen`, `Lock`, `QrCode`, `DeviceMobile`).

---

## 9. Bajarilgan ishlar

### 2026-09-29

**Haqiqiy AI maslahat (egasi qarori: "haqiqiy AI qo'shaylik")**
- `server/ai.sql`: kalit `private.secrets` da; `set_ai_config` (faqat
  creator yozadi), `ai_config` (holat, kalit qaytmaydi), `ai_reports`
  (kunlik kesh — do'kon o'qiydi, yoza olmaydi), `private.ai_key()` va
  `private.jwt_verify()` — AI xizmati uchun ikki tor eshik
- `bot/ai-service.js` + `server/mybazzar-ai.service`: 127.0.0.1:3003,
  nginx `/ai/` orqali. Xizmat JWT kalitini KO'RMAYDI — tokenni bazaga
  tekshirtiradi. Do'kon raqamlarini o'zi yig'adi (30 kunlik savdo,
  top tovarlar, yotib qolgan tovar, kam qoldiq, nasiya, to'lov usullari,
  filial kesimi), kuniga bir marta hisoblaydi, kunlik chegara 100 ta
- Provayder almashtiriladi: Claude (`claude-haiku-4-5-20251001`) yoki
  Gemini. Creator panel → Sozlamalar → **AI maslahat** da tanlanadi,
  kalit o'sha yerda qo'yiladi va "Sinab ko'rish" bilan tekshiriladi
- Veb va mobil Analitika ekranida "AI maslahat" kartasi — kalit
  bo'lmasa umuman ko'rinmaydi
- Maxfiylik sahifasi yangilandi (nima yuboriladi, nima yuborilmaydi).
  Sahifa sarlavhasi ham: AI yoqilganda "hech qayerga yuborilmaydi"
  deyilmaydi
- Sinov nusxada (17 ta): do'kon egasi va anonim kalit qo'ya olmaydi,
  kalit `platform_settings` orqali ham, API orqali ham chiqmaydi,
  kalitsiz saqlaganda eskisi qoladi, xizmat tokenni to'g'ri tekshiradi,
  imzosi buzilgan token rad etiladi, ilova roli kalitga yeta olmaydi.
  Productionda: tokensiz 401, soxta token 401, do'kon egasi /test ga
  403, haqiqiy token bilan "AI kaliti sozlanmagan" (kalit kutilmoqda)

**Sentry ulandi (2026-09-29 kechqurun)**
- Tashkilot `mybazzar`, ma'lumot Yevropa Ittifoqida (`ingest.de.sentry.io`),
  bepul tarif — oyiga 5 000 xato. Faqat **Error monitoring** yoqilgan:
  Session replay ataylab YOQILMADI — u ekranni yozib oladi, unda mijoz
  ismi va summalar Sentry serveriga ketardi
- DSN `.env` da (`REACT_APP_SENTRY_DSN`) — repoda YO'Q. Boshqa kompyuterda
  yig'ilsa Sentry o'chiq chiqadi, shuni yodda tuting
- Ulanish sinov xabari bilan tasdiqlandi (envelope API, 200 + event id)
- Maxfiylik sahifasiga qo'shildi: nima yuboriladi va nima yuborilmaydi
- Mobil uchun hali yo'q — native kutubxona kerak, keyingi APK bilan

**Landing: narxlar va Sentry tayyorgarligi**
- Landingda narx bo'limi — `public_plans()` orqali BAZADAN olinadi.
  Creator panelida narx o'zgarsa sayt ham o'zgaradi, qo'lda yozilmaydi.
  Narxsiz tarif saytda ko'rinmaydi
- `@sentry/react` + `src/utils/errorReport.js`: DSN yo'q bo'lsa butunlay
  o'chiq. Yoqilganda sahifa xatosi avtomatik yuboriladi, do'kon nomi va
  rol belgilanadi; parol, token va mijoz ma'lumoti yuborilmaydi.
  **Mobil uchun Sentry alohida — u native kutubxona, EAS update bilan
  emas, yangi APK bilan chiqadi**

**Tarqatildi (filiallar endi do'konchilarda)**
- Veb: `main.f9ffbd36.js` → `/var/www/mybazzar`. Eski versiya
  `/var/backups/web-eski-20260929-1724` da (qaytarish kerak bo'lsa)
- Mobil: EAS update "Filiallar: tanlash, ko'chirish…" (guruh
  `8adee4f0-3e94-47c2-9e3a-9a094a44b41b`). Ikkinchi ochilishda qo'llanadi
- Shu bilan **oflayn sotuv yo'qolishi** tuzatilgani ham tirik tizimga chiqdi

**Tariflar kiritildi** (egasi tasdiqladi, raqobatchilardan arzon):
Start 149 000 (3 xodim, 1 filial) · Biznes 249 000 (10 xodim, 3 filial) ·
Pro 399 000 (cheklovsiz). `platform_settings.plans` da.
Mavjud uch do'konga tarif/muddat berilmadi — `paid_until` ni o'tgan sana
bilan qo'ysa do'kon darhol to'xtardi, bu tirik do'konni buzadi.
DIQQAT: JSON ni `psql -c "…"` ichiga qo'ymang — qo'shtirnoqlar yo'qoladi
va qiymat buzuq JSON bo'lib qoladi (bir marta shunday bo'ldi, fayl orqali
qayta yozildi va `json.loads` bilan tekshirildi)

**Yangi do'kon sinovi (nusxada, 19 ta tekshiruv)** — do'konchiga sotilganda
aynan shu holat: creator do'kon+egasini yaratadi → egasi kiradi → bo'sh
do'konda hamma so'rov → birinchi tovar → smena → birinchi sotuv → ombordan
yechish → kassa hisobi → qaytarish → tarif chegarasi.
**Jiddiy xato topildi va tuzatildi:** yangi do'konda asosiy filial belgisiz
qolar, tovar ham, kassa ham ishlamasdi (§8). Tuzatish productionga
qo'llandi, mavjud ma'lumot o'zgarmadi (20 tovar, 175 qoldiq, 732 sotuv)

**Umumiy kod bo'sh do'konda sinaldi** (Node, 13 ta tekshiruv): `analyze({})`
qulamaydi va `forecast.history` doim massiv; qoldiq holati; chek — oddiy,
filialli (nomi+manzili) va asosiy filialda takrorlanmasligi; yorliq

### 2026-09-19

**Filiallar — 2–3-bosqich: veb, mobil, baza himoyasi**
- Baza (`server/branches-phase2.sql`, productionda; oldidan zaxira
  `pre-branches2-*.sql.gz`): filialni DELETE qilib bo'lmaydi (qoldiq CASCADE
  bilan yo'qolardi); yopilgan filialni qayta ochish ham tarif chegarasini
  tekshiradi; `max_branches` bo'sh = cheklovsiz; `my_subscription()` filial
  soni/chegarasini qaytaradi; `transfers` ga faqat funksiyalar yozadi;
  biriktirilgan kassir faqat o'z filialidan yuborilganni bekor qiladi; xodim
  faqat o'z do'konining faol filialiga biriktiriladi; filial yopilsa xodimlari
  bo'shaydi, ochiq smenasi bo'lsa yopilmaydi; `shift_view` da `branch_id`
- Nusxada 18 ta HTTP stsenariy — hammasi o'tdi. Productionda qo'llangandan
  keyin 20 tovar, qoldiq 175, 732 sotuv, 6 xodim — o'zgarmagan
- Veb: tepada filial tanlagichi (egasi/manager uchun "Barcha filiallar" ham;
  biriktirilgan xodim faqat nomini ko'radi), tanlov do'kon bo'yicha eslab
  qolinadi, filial almashganda sahifa qayta yuklanadi (`Layout` kaliti)
- Veb POS: "barcha filiallar" rejimida sotuvdan oldin filial so'raladi;
  sotuv `branch_id` bilan; chekda filial nomi/manzili/telefoni
- Veb Sozlamalar: **Filiallar** kartasi (qo'shish, tahrirlash, yopish/ochish,
  tarif chegarasi) va soxta tarif kartasi o'rniga haqiqiy obuna
  (tarif, muddat, xodim va filial soni)
- Veb Xodimlar: filialga biriktirish (yoki "barcha filiallar")
- Veb Ombor: soxta "ko'chirish" tabi o'chirildi → `components/Transfers.jsx`:
  bir nechta tovarni yuborish, kelganini sanab qabul (qisman ham), bekor,
  tarix. "Barcha filiallar" rejimida kirim/inventarizatsiya o'chiriladi
- Creator: tarif va do'kon formasida filial chegarasi
- Qaytarish (veb + mobil) tovarni sotilgan filialga qaytaradi, smenani ham
  o'sha filialdan oladi
- **Tuzatildi: veb oflayn sotuvlari yo'qolardi** — endi haqiqatan yuboriladi
  (ombordan yechiladi, nasiya va mijoz summasi yoziladi); o'tmaganlari
  navbatda qoladi, qayta-qayta urinib serverni to'ldirmaydi
- Mobil: `X-Branch`, filial tanlash (Yana → Filial), biriktirilgan filial
  tokendan o'qiladi, filial ro'yxati oflayn uchun keshlanadi; ma'lumot va
  smena filial bo'yicha qayta yuklanadi; sotuv (oflayn navbat ham) `branch_id`
  bilan; Asosiy ekranda filial nomi; `TransferSheet` — yuborish, qabul, bekor,
  tarix; chekda filial. `MapPin` ikonkasi import + MAP ga qo'shildi
- Tekshiruv: o'zgargan barcha fayllar `@babel/traverse` bilan skanerlandi
  (aniqlanmagan nom yo'q), mobil `expo export` muvaffaqiyatli yig'ildi

**Filiallar — 1-bosqich: baza (productionda)** — `server/branches.sql`
- `branches` (har do'konga avtomatik "Asosiy filial"), `branch_stock`
  (filial qoldig'i), `transfers` (yuborildi → qabul qilindi / bekor)
- `products` endi VIEW: `stock` = joriy filial qoldig'i ("all" rejimida
  jami), qo'shimcha `stock_total`. Asl jadval — `product_catalog`.
  INSTEAD OF triggerlar: insert/update/delete ilovadan o'zgarishsiz ishlaydi
- `current_branch()`: tokendagi `branch_id` (biriktirilgan xodim) >
  `X-Branch` sarlavhasi (raqam yoki `all`) > asosiy filial. Bot/creator — hammasi
- Sotuv/smena/xarajat/kirim/ombor tarixiga `branch_id` avtomatik (trigger);
  RLS ularni joriy filial bo'yicha ko'rsatadi. Mijoz, nasiya, kredit — umumiy
- `move_stock(..., p_branch)`, `apply_sale`/`revert_sale` sotuv filialidan;
  `transfer_send/receive/cancel`; filial chegarasi `stores.max_branches`;
  qoldig'i yoki yo'ldagi ko'chirishi bor filialni o'chirib bo'lmaydi
- Login: egasidan boshqa xodimda `users.branch_id` bo'lsa tokenga yoziladi
- Sinov: nusxada 25 ta HTTP stsenariy (ko'chirish, qisman qabul, filial
  sotuvi, oshiqcha sotuv rad, kassir boshqa filialni ko'rmaydi, katalog jami,
  chegara...). Chegara tekshiruvi xatosi topilib tuzatildi (§8). Productionda:
  19 tovar, jami qoldiq 165 va 732 sotuv migratsiyadan oldin/keyin bir xil

**Obuna hisobi (to'lov qo'lda, tizim hisob yuritadi)** — `server/subscription.sql`
- `stores.plan / paid_until / max_users`; tariflar `platform_settings.plans`
  (JSON, creator sozlamalarida tahrirlanadi), `grace_days` = 3
- `paid_until = NULL` → hech qachon to'xtatilmaydi (mavjud mijozlar shu holatda)
- `subscription_expire()` — lock-worker kuniga bir marta (10:00 dan keyin);
  muddat + 3 kun o'tgan do'kon `is_active=false`
- `store_ok()` barcha RLS siyosatida: to'xtatilgan do'konning ochiq sessiyasi
  ham darhol aniq xabar oladi (ilgari token 30 kun ishlayverardi)
- Xodim chegarasi triggeri (egasi hisobga kirmaydi, o'chirilgan xodim ham)
- Egasi `plan/paid_until/max_users` ni o'zi o'zgartira olmaydi (trigger)
- `my_subscription()` → veb (`SubscriptionBanner`, faqat egasi/manager) va
  mobil Asosiy ekranda ogohlantirish: 3 kun qoldi / muddat o'tdi / to'xtatilgan
- Creator: do'kon formasida tarif, xodim chegarasi, muddat (+1 oy / +1 yil),
  jadvalda "Obuna" ustuni; sozlamalarda tarif tahrirlagichi. Eski "filial
  soni bo'yicha tarif" olib tashlandi (filiallar soxta — §8)
- Sinov nusxada: egasi sanani uzaytira olmaydi, 3-xodim rad, soon/grace,
  avtomatik to'xtatish sanasizlarga tegmadi, to'xtatilgan sessiya xabar oladi

**Maxfiylik siyosati** — `src/pages/Privacy.js`, ochiq `/maxfiylik`, landing
va login sahifasida havola. Matn tizim haqiqatda qanday ishlashini yozadi
(O'zbekistonda saqlash, bcrypt, Google/Telegram/Expo). Tizimda yangi tashqi
xizmat qo'shilsa — sahifa ham yangilanadi

**Zaxira serverdan tashqariga (egasining kompyuteri)**
- Serverda `mbbackup` foydalanuvchisi; uning kaliti `authorized_keys` dagi
  majburiy buyruq bilan FAQAT `/home/mbbackup/latest.sql.gz` ni o'qiy oladi
  (boshqa buyruq berilsa ham faqat shu fayl qaytadi — sinaldi)
- `server/backup-mybazzar.sh` har kungi zaxirani shu joyga ham qo'yadi
- Kompyuterda `D:\MyBazzar-zaxira\zaxira-olish.ps1` + Windows vazifasi
  "MyBazzar zaxira": har kuni 05:30, o'tkazib yuborilsa yoqilganda;
  gzip boshi va hajmi tekshiriladi, oxirgi 30 kun saqlanadi, jurnal `zaxira.log`
- Sinov: fayl serverdagi bilan baytma-bayt mos, 19 jadval, rejalashtiruvchi
  orqali ishga tushirish muvaffaqiyatli

### 2026-09-18

**Xavfsizlik — productionga qo‘llandi va tashqaridan tekshirildi**
- Topildi: `mb_anon` (internetdagi hamma) har jadvalda SELECT/INSERT/UPDATE/
  **DELETE**; RLS yo‘q; login brauzerda (parolni bazadan olib solishtirardi);
  vebda qattiq yozilgan demo hisoblar (`owner123`...); onlayn buyurtmada
  summani brauzer yuborardi (1 so‘mga buyurtma); katalog tannarxni ochardi;
  `make_telegram_code` istalgan rolni qabul qilardi (egasi creator havolasi
  olardi); Sozlamalar egasiga tarif/do‘kon turini o‘zgartirishga imkon berardi
- `server/auth-phase1.sql`: `pgcrypto`, `private` sxema (PostgREST ko‘rmaydi),
  parollar bcrypt bilan `private.user_secrets`/`customer_secrets` ga, trigger
  yangi parolni o‘zi xeshlaydi; `mb_user` roli; `login()` serverda tekshiradi
  va HS256 JWT beradi (`uid`, `store_id`, `app_role`, 30 kun); `storefront()`
  va `place_order()` (narx bazadan); viewlar `security_invoker`
- `server/auth-phase2.sql`: anonimga faqat 3 funksiya; RLS barcha jadvalda
  (o‘z do‘koni / creator hammasi / diler faqat o‘zi); foydalanuvchi yozish
  qoidalari (hech kim o‘zini creator qila olmaydi, manager egasini
  o‘zgartira olmaydi); `stores` triggeri tarif/tur/holatni himoyalaydi;
  ochiq parollar o‘chiriladi
- Veb: login `rpc('login')`, token `supabaseClient` orqali; demo hisoblar
  olib tashlandi; parollar faqat yoziladi (Creator, Xodimlar — tahrirda bo‘sh
  = o‘zgarmaydi); katalog va buyurtma server funksiyalarida
- Mobil: login `rpc('login')`, token `AsyncStorage` da, tokensiz eski sessiya
  qayta kirishga majburlanadi, 401 da avtomatik chiqish; `ping()` endi
  anonim jadval o‘qimaydi
- **Sinov:** production nusxasida (zaxiradan tiklangan) ikkala bosqich +
  vaqtinchalik PostgREST orqali HTTP: anonim 401, boshqa do‘kon `[]`,
  buzilgan token 401, 1 so‘mlik buyurtma 75 000 ga tuzatildi, sotuvchi
  xodim qo‘sha olmaydi, creator hammasini ko‘radi. Nusxa o‘chirildi
- **Productionga qo‘llandi (2026-09-18 ~23:40):** phase1 → veb deploy →
  mobil EAS update → phase2. JWT kaliti almashtirildi (eskisi bekor).
  Tashqi manzildan tekshiruv: anonim users/sotuv/mijoz/do‘kon va DELETE —
  401; katalog 200; Texno Bozor faqat o‘z 732 sotuvi; demo do‘kon
  begona ma’lumot ko‘rmaydi; creator 3 do‘kon; soxta token 401. Bot va
  qulf ijrochisi (mb_bot, BYPASSRLS) ishlaydi, CRM loyihasi buzilmagan.
  Zaxiralar: `OLDIN-phase1-*`, `OLDIN-phase2-*` (`/var/backups/mybazzar`)


### 2026-09-01

**Tuzatish: to'lov jadvalida qolgan summa**
- Kredit telefon jadvalida oy **to'liq summasi** ko'rsatilardi. 1 500 000 lik
  oyga 1 000 000 to'langach ham 1 500 000 turaverardi — do'konchi qancha
  qolganini bilmasdi
- Baza to'g'ri ishlayotgani tekshirildi (`credit_pay` → `paid_amount`
  to'g'ri yoziladi), xato faqat ekranda edi
- Endi **qolgan summa** ko'rsatiladi, ostida yashil rangda "X to'landi"
- Veb va mobil — ikkalasi ham. Mobilga **EAS Update orqali** jo'natildi
  (APK qayta o'rnatilmadi — birinchi marta ishlatildi)

**Mobil xatolar (M1–M3)**
- **M1** Nasiya filtrlari teng ulushli qilindi (`flex: 1`) — "To‘langan"
  endi chetga chiqmaydi. `Chip` ga `numberOfLines` + `flexShrink` qo‘shildi,
  bu butun ilovada tor joyda matn kesilishini ta’minlaydi
- **M2** Haftalik grafik: har ustun tepasida **summa** (1.2mln, 450m),
  hafta cho‘qqisi belgilanadi; grafik tepasida **jami** va o‘tgan hafta
  bilan **foiz farqi**
- **M3** Sotuvlar tarixi: 5 ta chip o‘rniga **bitta keng tugma** (bosilganda
  davr ro‘yxati ochiladi) va **qidiruv** — chek raqami, tovar, sotuvchi,
  summa bo‘yicha. Ochilganda avtomatik bugun (avvaldan shunday edi)

**Kassa smenasi (yangi)** — hech qayerda yo‘q edi
- `shifts` jadvali + `shift_view` (kutilayotgan summa va farq bazada
  hisoblanadi), `transactions.shift_id`
- Bitta sotuvchida bir vaqtda bitta ochiq smena (unique index)
- Mobil: `ShiftSheet` (ochish / yopish / xulosa), POS tepasida smena chizig‘i
- Veb: `ShiftBar` + `useShift`, POS chap ustunida
- Faqat **naqd** hisoblanadi; qaytarish manfiy summa bo‘lgani uchun o‘zi
  ayiriladi. Yopishda: bo‘lishi kerak / sanaldi / **FARQ**

**Vozvrat (qaytarish)**
- Aniqlandi: mobil ilovada allaqachon bor edi (`ReceiptSheet`) — qisman
  qaytarish, omborni tiklash, ikki marta qaytarishning oldini olish
- **Vebda yo‘q edi** — yangi `src/pages/Sales.js` sahifasi: sotuvlar tarixi,
  davr filtri, qidiruv va **aynan bir xil mantiq** bilan qaytarish
  (`move_stock` + `<chek>-Q` manfiy yozuv). Menyuga "Sotuvlar tarixi" qo‘shildi
- Qaytarish endi joriy **smenaga** ham bog‘lanadi (naqd chiqim to‘g‘ri chiqsin)

**EAS Update (havodan yangilanish)**
- `expo-updates` o‘rnatildi, `eas update:configure` bajarildi
- `runtimeVersion` policy `appVersion`, kanal `preview`
- Bundan keyin **JS tuzatishlar APK qayta o‘rnatmasdan** tarqaladi:
  `eas update --branch preview`

**Zaxira nusxa (1-navbat)** — avval umuman yo‘q edi
- `/root/backup-mybazzar.sh` — kunlik `pg_dump` + gzip, 14 kun saqlanadi,
  fayl juda kichik chiqsa xato deb belgilaydi
- `mybazzar-backup.service` + `.timer` — har kuni **04:00** (03:00 crm va
  03:30 paybox bilan to‘qnashmasin), `Persistent=true`
- Zaxira `/var/backups/mybazzar/`, jurnal `backup.log`
- **Tiklash sinovdan o‘tkazildi:** toza bazaga tiklanib, barcha jadval
  qatorlari asl bilan solishtirildi — to‘liq mos (731 sotuv, 22 qarz,
  20 mijoz, 2 kredit qurilma). Xatosiz
- Fayllar repoda: `server/backup-mybazzar.sh`, `server/mybazzar-backup.*`


### 2026-08-31

**Masofadan qulflash (AMAPI) — noldan oxirigacha**
- Google Cloud loyihasi `mybazzar-507001`, AMAPI yoqildi, xizmat hisobi
  yaratildi va unga Owner roli berildi (`signupUrls.create` shuni talab qildi)
- Korxona yaratildi: **`enterprises/LC01xcdxh0`** (Managed Google Play)
- Ikkita siyosat: `credit-default` va `credit-locked`
- Qulflash **siyosat almashtirishga** o'tkazildi (bir martalik `LOCK`
  buyrug'i yaramasdi — mijoz PIN bilan ochib ishlatardi)
- `lock-worker` ga enrollment ko'prigi qo'shildi: pending qurilmaga AMAPI'dan
  haqiqiy QR olib beradi, telefon ro'yxatdan o'tgach `enrollment_id` +
  `active` qiladi. Sinovda tasdiqlandi (`[enroll] #4 uchun QR tayyorlandi`)
- Ilova endi **haqiqiy Google QR** ko'rsatadi (avval soxta ichki QR edi),
  ro'yxatdan o'tishni o'zi kuzatib tasdiqlaydi
- Worker javob tezligi 30s → 7s

**Kredit telefonlar ekrani boyitildi**
- `credit_device_view` yaratildi (qoldiq, kechikish, keyingi to'lov, oy progressi)
- Veb va mobil: qolgan qarz, keyingi to'lov/kechikish, N/M oy, moliyaviy xulosa
- **"To'lov qabul qilish"** tugmasi qo'shildi (ilgari faqat jadval oyiga
  bosish kerak edi — egasi topa olmadi)
- "Faol" kartasi qulflanganni ham sanayotgani tuzatildi

**Landing sahifa qayta yozildi**
- Mahsulot maketi (brauzer oynasi ichida dashboard), 3 ta spotlight bo'lim
  (IMEI, qulflash, AI), scroll-animatsiya, mobil-responsive
- Oy/quyosh almashtirgich — landing va ilova yuqori panelida

**Creator paneli**
- Foydalanuvchilar **do'kon direktori ostida guruhlandi**, xodimlar tugma
  bilan ochiladi
- **IMEI Block** menyusi: do'kon kesimida IMEI soni × narx = summa, davr
  filtri, do'kon bo'yicha tafsilot
- `platform_settings` jadvali + sozlamalarda IMEI narxi
- Hisob asosi: **qulflashga ro'yxatdan o'tgan har IMEI bir marta**

**Do'kon turi**
- `storeType` bo'yicha menyu va marshrut filtri qo'shildi — "Kredit
  telefonlar" faqat telefon do'konida (veb + mobil)
- Tovar qo'shishdagi "Telefon" tabi oddiy do'konda yashirildi

**Tuzatilgan xatolar**
- **Mobil ilova ishga tushishda qulardi** (splash'dan keyin 1 soniyada
  yopilardi) — `Icon.js` da `LockSimpleOpen`, `Lock`, `QrCode`,
  `DeviceMobile` `MAP` da ishlatilgan, lekin import qilinmagan edi.
  `adb logcat` orqali topildi: `ReferenceError: Property 'LockSimpleOpen'
  doesn't exist`. Barcha buildlarga ta'sir qilgan. Butun mobil va veb kodi
  shu tur xatoga qayta skanerlandi — boshqa yo'q
- **AI Analitika qora ekrani** — `forecast` "tayyor emas" holatda `history`
  qaytarmasdi, `undefined.map()` butun ilovani o'chirardi. Har yangi do'konda
  takrorlanardi. Qaytish shakli bir xillashtirildi
- **`PageErrorBoundary`** qo'shildi — endi sahifa xatosi butun ilovani
  o'chirmaydi, menyu tirik qoladi
- **⚙️ tugmasi** `/settings` ga qattiq bog'langan edi — creator o'z
  sozlamalariga kira olmasdi. Endi `ROLE_NAV` dan olinadi

---

## 10. Qilinishi kerak

Tartib egasi bilan kelishilgan (2026-09-01). Yuqoridan pastga bajariladi.

---

### 0-navbat: SOTUVGA CHIQISHDAN OLDIN (bloklovchi) — 2026-09-18

1. **🚨 AMAPI bilan nasiya qulflash Google qoidalariga ZID** (2026-09-18 aniqlandi).
   Permissible Usage: *"Device financing solutions… that manage, restrict, or
   control device usage or functionality based on payment status"* — taqiqlangan.
   Qo‘shimcha: 2025-10-29 dan yangi loyihaga kvota avtomatik berilmaydi, "biznes
   asosnomasi" bilan so‘raladi (nasiya deb yozsak rad, boshqa deb yozsak —
   aldash). Google loyihani bloklasa ro‘yxatdagi mijoz telefonlari boshqaruvdan
   chiqadi yoki tozalanadi. Rasmiy yo‘l — Device Lock Controller (faqat
   OEM hamkorlik, katta hajm) → kichik do‘konlar uchun **reseller**.
   Reja: haqiqiy mijozdan oldin AMAPI qulflashni to‘xtatish; nasiya
   boshqaruvi (jadval, to‘lov, ogohlantirish, IMEI hisobi) qoladi; qulflash
   `provider='reseller'` orqali reseller API’ga ulanadi (IMEI Block narxi
   reseller narxidan yuqori). Landingdagi "ilovasiz Google orqali qulflash"
   matni reseller ulanmaguncha o‘zgartirilsin (soxta va’da bo‘lmasin).
   **Holat (2026-09-18):** egasida mijozlar bilan imzolangan shartnomalar bor —
   funksiyani olib tashlab bo‘lmaydi. Kelishilgan yo‘l: funksiya qoladi,
   faqat "dvigatel" almashadi (AMAPI → reseller), do‘konchi uchun hech narsa
   o‘zgarmaydi. Tartib: (1) zavod holatidagi telefonda sinab kvota bor-yo‘qligini
   aniqlash; (2) parallel reseller topish va API’ga ulash; (3) haqiqiy mijoz
   telefonlari BOSHIDANOQ reseller orqali ro‘yxatga olinsin (keyin ko‘chirish =
   telefonni qayta zavod holatiga qaytarish). Samsung ko‘p bo‘lsa — Knox Guard.
   Kvota uchun Google’ga noto‘g‘ri asosnoma yozilmaydi.
   **EGASI QARORI (2026-09-19): AMAPI shu holatida qoladi, tegilmaydi.**
   Xavf egasiga to‘liq tushuntirildi va qabul qilindi. Bu mavzu qayta
   ko‘tarilmaydi. Faqat haqiqiy telefonda ishlashini sinash qoladi (kvota 0
   bo‘lsa ro‘yxatdan o‘tish ishlamaydi — shartnomalar shunga bog‘liq)
2. **Zaxira** — ✅ kompyuterga har kuni tushadi (2026-09-19). Sotuv
   boshlangach: boshqa O‘zbek provayderida ikkinchi kichik VPS
3. **Obuna hisobi** — ✅ qurildi (2026-09-19). Narxlar kelishilishi kerak. Tizimda faqat
   `stores.paid_until`: 3 kun oldin do‘konchiga ogohlantirish, creatorga
   Telegram, muddat o‘tgach avtomatik to‘xtatish. Tariflar `max_branches`
   bo‘yicha, IMEI alohida, yillik chegirma, 14 kun sinov.
   Tavsiya etilgan tuzilma (2026-09-18): 3 ko‘rinadigan tarif + "Korporativ
   (kelishuv)". Start: 1 filial, 2 xodim | Biznes (asosiy): 3 filial, 10 xodim |
   Pro: 10 filial, cheklovsiz xodim. Funksiyalar hammasida bir xil — ajratish
   faqat filial/xodim soni va yordam darajasi bo‘yicha. Kodda: `max_branches`
   bor, xodim cheklovi (`max_users`) qo‘shilishi kerak
4. **Google Play** (egasi ochadi) — $25; shaxsiy hisob 2023-dan keyin bo‘lsa
   12 tester × 14 kun yopiq sinov shart, tashkilot hisobi (MChJ + D-U-N-S)
   ozod. **App Store** — $99/yil. Ikkalasiga platformaning **maxfiylik
   siyosati** havolasi va ko‘rib chiquvchi uchun demo hisob kerak

**Excel import — hozir qilinmaydi** (egasi qarori, 2026-09-18): onboardingni
egasi qo‘lda qiladi (pullik xizmat sifatida ham bo‘lishi mumkin), fayl
berilsa Claude import qiladi. Keyinroq — creator panelida oddiy CSV yuklash.

**Filiallar — ✅ qurildi va tarqatildi (2026-09-29).** Qolgani:
- Productionda haqiqiy ikkinchi filial bilan qo'lda sinov (tanlagich,
  ko'chirish, biriktirilgan kassir, chek)
- Uchala do'konda `max_branches = 3` (eski qiymat) — creator tarif bo'yicha
  to'g'rilasin
- Telegram kunlik xulosa filial kesimida; Hisobotlarda filiallarni
  yonma-yon solishtirish ("barcha filiallar" rejimi hozir jami beradi)

**EGASIDAN KUTILMOQDA (busiz sotuvni boshlab bo'lmaydi):**
1. **AMAPI ni zavod holatidagi telefonda sinash** — server tayyor,
   haqiqiy telefonda hech qachon sinalmagan. Shartnomalar shunga bog'liq
2. **AI kaliti** — Claude yoki Gemini. Creator panel → Sozlamalar →
   AI maslahat da qo'yiladi (kod tayyor va tarqatilgan)
3. **Sentry DSN** — sentry.io da bepul hisob (kod tayyor, DSN kelgach
   `.env` ga yoziladi va veb qayta yig'iladi)
4. **Telefon raqam** — landing narx bo'limida "Qo'ng'iroq qiling" tugmasi
   uchun (hozir faqat Telegram bot havolasi bor)
5. **Google Play** ($25) va **App Store** ($99)
6. Har do'kon uchun shartnoma/oferta

Yuridik hujjatlar (oferta, maxfiylik siyosati) — **umumiy emas**, qaysi
do‘konga kerak bo‘lsa o‘sha uchun alohida (egasi qarori, 2026-09-18).

Kuchli tavsiya: Sentry, qo‘llab-quvvatlash kanali (Telegram bot),
landingda narx va aloqa, "AI Analitika" nomi — yo haqiqiy AI, yo nomini
o‘zgartirish.

### 1-navbat: Qolganlari

**Ishonchlilik**
- **Sentry (xato yig‘ish)** — ilova hammada qulab turgan edi, biz faqat
  egasi aytganda bildik. Do‘kon ko‘paygach shart bo‘ladi
- **Parollar bazada ochiq matnda** — shifrlashga o‘tish

**Bozorni kengaytirish**
- **Tovar variantlari** (`o‘lcham × rang`, har biriga barcode) — kiyim
  bozori uchun eng katta yetishmovchilik
- **O‘lchov birligi + kasrli qoldiq** (kg, metr, litr) — qurilish va
  oziq-ovqatni ochadi (`products.stock` hozir butun son)
- **Seriya raqami har turga** — hozir S/N faqat telefon rejimida
  (quyosh paneli, maishiy texnika kafolati uchun)

**Savdo qulayligi**
- **Dollar narx va kurs** — telefon/elektronika do‘konlari narxni dollarda
  yuritadi, sotishda kunlik kursga ko‘paytiradi. Hozir qo‘lda
- **Avtomatik chegirma/aksiya** — "3 olsang 1 tekin", kategoriya bo‘yicha,
  vaqtga bog‘liq. Hozir faqat qo‘lda chegirma
- **Payme / Click QR to‘lov** — hozir "Plastik" shunchaki yorliq, pul
  kelgani tasdiqlanmaydi. **Qaror (2026-09-01):** API orqali *dinamik* QR
  qilinadi (summa QR ichida + to‘lov tizimi serverga xabar beradi → chek
  o‘zi "to‘landi" bo‘ladi). Devordagi doimiy QR variantidan voz kechildi —
  u sotuvchi qo‘lda tasdiqlashini talab qiladi, ya’ni asosiy muammo qoladi.
  **Har do‘kon uchun alohida**, do‘kon xohlaganda ulanadi.

  Muhim shartlar:
  - **Har do‘kon o‘z merchant hisobini oladi** (YaTT/MChJ + bank hisobi
    kerak). Pul to‘g‘ridan-to‘g‘ri do‘konga tushadi. MyBazzar vositachi
    BO‘LMAYDI — u to‘lov agregatori faoliyati bo‘lib, Markaziy bank
    litsenziyasini talab qiladi
  - Ariza: [b2b-partner.payme.uz](https://b2b-partner.payme.uz/) va
    [business.click.uz](https://business.click.uz/uz); Click hujjatlari
    [docs.click.uz](https://docs.click.uz/en/merchant-api-request/)
  - ⚠️ **Maxfiy kalit `mb_anon` o‘qiydigan joyda saqlanmasin** — aks holda
    ilovadan ko‘rinadi. Kalitlar server tomonida (masalan `/etc/mybazzar/`
    yoki PostgREST ochmaydigan jadval), callback tekshiruvi ham serverda
- **Chekni mijozga Telegram/SMS orqali yuborish**
- **Ta’minotchiga buyurtma ro‘yxati** — AI "nima tugayapti"ni topadi,
  shundan avtomatik ro‘yxat tuzilsin

**Mijoz ushlab qolish**
- **Mijozga avtomatik qarz eslatmasi** (SMS/Telegram) — hozir do‘konchi
  qo‘lda qo‘ng‘iroq qiladi
- **Loyalty / cashback**

**Creator (daromad)**
- **Obuna to‘lovi hisobi** — hozir faqat IMEI uchun pul olinadi.
  `PLANS` (Starter/Business/Enterprise) bor, lekin hisob yuritilmaydi:
  qaysi do‘kon to‘lagan, kim qarzdor, qachon tugaydi

**Sinov**
- **Qulflashni haqiqiy telefonda sinash** ⚠️ — server tomoni to‘liq
  sinalgan, zavod holatidagi Android hali skanerlanmagan. Tizimning asosiy
  va’dasi shunda. Kerak: yangi yoki tozalangan Android telefon

---

### Keyinga qoldirilgan (alohida loyiha)

**Fiskal chek / soliq integratsiyasi.** Egasi 2026-09-01 da keyinga
qoldirdi. Ikki yo‘l: (A) reyestrdagi virtual kassa provayderi API’siga
ulanish — tez; (B) MyBazzar’ni Davlat reyestriga kiritish — uzoq, lekin
vositachisiz. Ishning ~30% i kod, ~70% i qog‘ozbozlik.
Talab qiladi: har tovarga **MXIK (IKPU) kodi** (majburiy, tasnif.soliq.uz),
QQS stavkasi, chekda QR + fiskal belgi, vozvrat ham fiskallashtiriladi.
Diqqat: **offline rejim bilan ziddiyat** — fiskal chek onlayn ketishi kerak.
OFD — Soliq qo‘mitasi huzuridagi "Yangi Texnologiyalar" markazi.
Mantiqiy vaqt: 10-20 ta tirik do‘kon bo‘lganda.
