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
| **Yana** | Kunni yopish, mijozlar, nasiya, moliya, hisobot, chek printer, onlayn do'kon havolasi, sozlamalar |

Qo'shimcha:

- **Offline rejim** — internet uzilsa sotuv qurilmada navbatga qo'yiladi va
  aloqa tiklanishi bilan o'zi yuboriladi. Kassir hech narsa qilmaydi.
- **Qaytarish** — to'liq yoki qisman. Ombor ortadi, hisobotda minus bo'ladi,
  asl chek o'zgarmaydi.
- **Ikki mavzu, uch akcent rang** — tungi/kunduzgi, binafsha/yashil/ko'k.
- **Ruxsatlar** — sotuvchiga foyda, tannarx va moliya ko'rinmaydi.

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
    lib/
      api.js             PostgREST mijozi (supabase-js o'rniga, ~120 qator)
      format.js          pul, sana, telefon ko'rinishi
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
- Ilova ichida til tanlash (rus/ingliz).
- Filiallar o'rtasida tovar ko'chirish.

## Ma'lum kamchilik

Parollar bazada ochiq matnda turadi va RLS yoqilmagan — bu veb ilovadan
qolgan muammo, mobil ilova ham o'sha `users` jadvalidan o'qiydi.
Tuzatish yo'li: `bcrypt` bilan xeshlash va kirishni `SECURITY DEFINER`
funksiyaga o'tkazish. Ilova tomonida faqat `signIn` o'zgaradi.
