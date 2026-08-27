# MyBazzar — mobil ilova

Do'kon boshqaruvining telefon versiyasi. Bu veb saytning qisqartmasi emas:
ba'zi do'konlarda kompyuter yo'q va butun ish shu ilovadan yuritiladi.
Shuning uchun sotuv, ombor, nasiya, mijozlar, moliya, hisobot, sverka va
chek — hammasi shu yerda.

React Native + Expo (SDK 57). Android va iOS uchun bitta kod.

---

## Nima ishlaydi

| Bo'lim | Nimalar bor |
|---|---|
| **Asosiy** | Bugungi sotuv va foyda, kechagi kun bilan taqqoslash, haftalik grafik, top tovarlar, so'nggi cheklar, ogohlantirish tugmalari |
| **Sotuv** | Tez sotuv tugmalari (uzoq bosib almashtiriladi), barcode skaner, qidiruv, savat, chegirma, 4 xil to'lov, qaytim hisoblagichi, narxsiz tovar uchun kalkulyator |
| **Ombor** | Qidiruv va filtrlar, qatorni surtib tahrir/barcode, kirim, yangi tovar, ko'p tanlab stiker chop etish, tovar harakati tarixi (sverka) |
| **Buyurtma** | Onlayn do'kondan tushgan buyurtmani qabul qilish yoki rad etish |
| **Yana** | Kunni yopish, mijozlar, nasiya, moliya, hisobot, **AI Analitika**, chek printer, onlayn do'kon havolasi, sozlamalar |

Qo'shimcha:

- **Offline rejim** — internet uzilsa sotuv qurilmada navbatga qo'yiladi va
  aloqa tiklanishi bilan o'zi yuboriladi. Kassir hech narsa qilmaydi.
- **Qaytarish** — to'liq yoki qisman. Ombor ortadi, hisobotda minus bo'ladi,
  asl chek o'zgarmaydi.
- **Ikki mavzu, uch akcent rang** — tungi/kunduzgi, binafsha/yashil/ko'k.
- **Uch til** — o'zbekcha, ruscha, inglizcha. Sana nomlari va "5 daq oldin"
  kabi yozuvlar ham tilga qarab o'zgaradi.
- **Ruxsatlar** — sotuvchiga foyda, tannarx va moliya ko'rinmaydi.

### AI Analitika

Tashqi xizmat yo'q — barcha hisob-kitob telefonning o'zida bajariladi.
Do'kon ma'lumoti tahlil uchun hech qayerga yuborilmaydi, internetsiz
ham ishlaydi va hech qanday pullik so'rov yo'q.

Nima hisoblanadi:

| Bo'lim | Nima beradi |
|---|---|
| Prognoz | Keyingi 7 kun tushumi. Umumiy yo'nalish + hafta kuni ta'siri (shanba dushanbadan boshqacha) |
| Tugash xavfi | Har tovar necha kunda tugaydi va bir oyga yetishi uchun qancha kirim kerak |
| Qotib qolgan pul | 45 kundan beri sotilmagan tovarlarda necha so'm turibdi |
| Foyda tahlili | Marja, eng ko'p foyda keltirganlar, zararga sotilayotganlar |
| Ish vaqti | Qaysi soatda va qaysi kunda odam ko'p — kassaga kim kerakligini hal qilish uchun |
| Mijozlar | Qaytib kelganlar ulushi, yo'qolayotgan doimiy mijozlar |
| Xavf | Qaytarish, nasiya, chegirma ulushi; sababsiz qoldiq tuzatishlari |

Ekran tepasida **"nimaga e'tibor berish kerak"** turadi: har xulosa
ortida pul bahosi bor va ro'yxat shu baho bo'yicha tartiblanadi, ya'ni
eng qimmat masala doim birinchi. Har xulosada kerakli ekranga olib
boradigan tugma bor.

---

## Ishga tushirish

```bash
cd mobile
npm install
npx expo start          # QR kodni Expo Go bilan o'qing
```

Kamera skaneri Expo Go da ham ishlaydi. Chek chop etish uchun telefonda
printer sozlangan bo'lishi kerak (Bluetooth termal printer tizim
ro'yxatida chiqadi).

---

## Do'konlarga chiqarish

Ilova **EAS Build** orqali yig'iladi — Windows'dan iOS uchun ham.

```bash
npm install -g eas-cli
eas login

# Sinov uchun APK (telefonga to'g'ridan-to'g'ri o'rnatiladi)
npm run build:apk

# Play Market uchun .aab
npm run build:play

# App Store uchun (Apple Developer hisobi kerak)
npm run build:ios
```

Birinchi marta `eas build` o'zi Android keystore va iOS sertifikatini
yaratib beradi — qo'lda hech narsa sozlash shart emas.

Do'konga yuborish:

```bash
eas submit -p android --latest
eas submit -p ios --latest
```

Kerakli hisoblar:

- **Play Market** — Google Play Console, bir martalik $25
- **App Store** — Apple Developer Program, yiliga $99

### Android Studio bilan qurish

Agar EAS'siz, o'z kompyuteringizda yig'moqchi bo'lsangiz:

```bash
npx expo prebuild --clean     # android/ va ios/ papkalarini yaratadi
cd android && ./gradlew assembleRelease
```

Shundan keyin `android/` papkasi Android Studio'da ochiladi. Lekin
`prebuild` dan keyin `app.json` dagi o'zgarishlar avtomatik ko'chmaydi —
har safar qayta `prebuild` qilish kerak bo'ladi.

---

## Tuzilishi

```
mobile/
  App.js                 navigatsiya va provayderlar
  metro.config.js        @shared → ../src/utils (veb bilan umumiy kod)
  src/
    theme.js             ranglar: 2 mavzu × 3 akcent
    ThemeContext.js      mavzu tanlovi (qurilmada saqlanadi)
    AuthContext.js       kirish, sessiya, ruxsatlar
    DataContext.js       tovar/mijoz/sotuv/nasiya — bir joyda
    CartContext.js       savat, sotuvni yakunlash, offline navbat
    i18n/                uz / ru / en lug'atlari va tarjimon
    lib/
      api.js             PostgREST mijozi (supabase-js o'rniga, ~120 qator)
      insights.js        tahlil dvigateli — prognoz, tugash xavfi, foyda
      format.js          pul, sana, telefon ko'rinishi (tilga bog'liq)
      stock.js           qoldiq holati — veb bilan umumiy qoida
      receipt.js         chek chop etish — veb bilan umumiy shablon
      labels.js          40×30mm narx yorlig'i — veb bilan umumiy
      barcode.js         barcode chizish (DOM'siz)
      upload.js          suratni kichraytirib yuklash
    ui/                  komponentlar kutubxonasi
    nav/TabBar.js        pastki navigatsiya
    screens/             ekranlar
    sheets/              pastdan chiqadigan oynalar
```

### Veb bilan umumiy kod

Uchta fayl **nusxa ko'chirilmagan** — ikkala ilova bitta fayldan o'qiydi:

| Fayl | Nima uchun umumiy |
|---|---|
| `src/utils/stock.js` | Qoldiq holati qoidasi. Veb va mobil boshqa-boshqa hisoblasa, hisobotlar mos kelmaydi |
| `src/utils/receipt.js` | Chek ko'rinishi. Kompyuterdan va telefondan bir xil chek chiqishi kerak |
| `src/utils/labels.js` | Narx yorlig'i. Rulon bir xil kesilishi kerak |

Metro ularni `@shared/...` nomi bilan topadi (`metro.config.js` ga qarang).
Qoida o'zgarsa ikkala ilovada birdan o'zgaradi.

---

## Server

Ilova `https://mybazzar.uz/rest/v1` bilan gaplashadi — bu veb ilova
ishlatadigan o'sha PostgREST. Manzil va kalit `app.json` dagi `extra`
bo'limida.

Ombor faqat server funksiyalari orqali o'zgaradi:

- `apply_sale(p_txn, p_actor)` — sotuvda yechish
- `move_stock(p_product, p_qty, p_type, ...)` — kirim, qaytarish, tuzatish

Qatorlar qulflanadi, shuning uchun ikki kassir bir vaqtda oxirgi
telefonni sota olmaydi. Har o'zgarish `stock_movements` ga yoziladi —
buni bazadagi tetik qiladi, ilova emas, ya'ni tarixdan qochib bo'lmaydi.

---

## Hali qilinmagan

- Push bildirishnoma (yangi buyurtma kelganda). Hozir faqat ilova ochilganda
  yangilanadi — buning uchun EAS project ID va FCM kaliti kerak.
- Ommaviy SMS (eskiz.uz orqali). Hozir SMS telefonning o'z ilovasidan
  bittalab ketadi — bu mijoz uchun tanish raqamdan kelgani ma'qul,
  lekin yuzta qarzdorga bir yo'la yuborish uchun server tomoni kerak.
- Filiallar o'rtasida tovar ko'chirish.
- Telefon do'koni maydonlari (IMEI, model, xotira, rang) — hozir ular
  faqat veb ilovada tahrirlanadi.
- Xodimlar bo'limi — yangi sotuvchi qo'shish va ruxsat berish.

## Fiskal chek

Ilovadagi chek — **tovar cheki**, ya'ni do'konning ichki hujjati.
Sozlamalardagi STIR maydoni shu raqamni chekka bosib chiqaradi, xolos.
Bu chekni fiskal qilmaydi.

Fiskal chek uchun uchta narsa kerak:

1. Soliq qo'mitasida ro'yxatdan o'tgan onlayn kassa yoki virtual kassa;
2. Har sotuvni real vaqtda fiskal tizimga yuborish va undan fiskal
   belgi olish;
3. Chekda fiskal belgi va tekshirish QR kodini chop etish.

Buning uchun tovar kartochkasiga MXIK (mahsulot tasnif kodi), o'lchov
birligi va QQS stavkasi qo'shilishi kerak — hozir bu maydonlar yo'q.
Qaysi provayder orqali ulanish tanlangach, ular qo'shiladi.

## Ma'lum kamchilik

Parollar bazada ochiq matnda turadi va RLS yoqilmagan — bu veb ilovadan
qolgan muammo, mobil ilova ham o'sha `users` jadvalidan o'qiydi.
Tuzatish yo'li: `bcrypt` bilan xeshlash va kirishni `SECURITY DEFINER`
funksiyaga o'tkazish. Ilova tomonida faqat `signIn` o'zgaradi.
