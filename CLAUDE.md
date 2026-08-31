# MyBazzar — loyiha qo'llanmasi

O'zbekiston do'konlari uchun savdo boshqaruv platformasi. Bitta backend'da
ishlaydigan **veb ilova** va **mobil ilova**, ustiga **Telegram bot** va
**masofadan telefon qulflash** tizimi.

---

## 1. Texnik asos

| Qism | Texnologiya |
|---|---|
| Veb | React 18 (CRA), React Router, Recharts, Phosphor Icons |
| Mobil | React Native + Expo SDK 57, EAS Build |
| Backend | PostgREST (`mybazzar.uz/rest/v1`), PostgreSQL |
| Bot / worker | Node.js 20, systemd |
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

systemd xizmatlari: `mybazzar-bot`, `mybazzar-lock-worker`

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
| `sync_product_photos()` | `photos[0]` ↔ `photo_url` mosligini saqlaydi |

---

## 7. Deploy

```bash
# Veb
CI=false npm run build      # keyin build/ papkasini /var/www/mybazzar ga
# Mobil
cd mobile && npx eas-cli build --platform android --profile preview
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

---

## 9. Ochiq ishlar

1. **Qulflashni haqiqiy telefonda sinash** — server tomoni to'liq sinalgan,
   lekin zavod holatidagi Android hali skanerlanmagan. Tizimning asosiy
   va'dasi shunda.
2. **Tovar variantlari** (`o'lcham × rang`, har biriga barcode) — kiyim
   do'koni uchun eng katta yetishmovchilik. Hozir har variant alohida tovar
   sifatida kiritiladi: ishlaydi, lekin ko'p yozish kerak.
3. **O'lchov birligi + kasrli qoldiq** (kg, metr, litr) — qurilish va
   oziq-ovqatni ochadi.
4. **Seriya raqami har turga** — hozir S/N faqat telefon rejimida
   (quyosh paneli, maishiy texnika kafolati uchun kerak).
5. **Parollar bazada ochiq matnda** — shifrlashga o'tish kerak (ilovaning
   o'zi bu haqda ogohlantiradi).
