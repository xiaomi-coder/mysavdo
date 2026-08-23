# MyBazzar — server infratuzilmasi

Supabase o'rniga o'z serverimizda ishlaydigan API. Frontend kodida **hech narsa
o'zgarmadi** — `supabase-js` kutubxonasi PostgREST bilan gaplashadi, Supabase
esa aynan PostgREST'ni ishlatadi.

## Qayerda

```
138.249.7.47  (vps09369.eskiz.uz) · Ubuntu 22.04 · 2 CPU · 3.8 GB RAM
```

Bu serverda **boshqa ikkita loyiha** ham bor — `bekbags.uz` va
`api.eduprocrm.uz`. MyBazzar ular bilan hech qanday resursni bo'lishmaydi:
alohida baza, alohida rollar, alohida port, alohida nginx sayti.

## Arxitektura

```
Brauzer
   │
   ▼
nginx :80  (server_name 138.249.7.47)
   ├── /            → /var/www/mybazzar        React ilova (statik)
   └── /rest/v1/    → 127.0.0.1:3002           PostgREST
                            │
                            ▼
                     PostgreSQL 16 · mybazzar bazasi
```

Mavjud CRM loyihasi 3001-portda ishlaydi va unga tegilmagan.

## Komponentlar

| Nima | Qayerda |
|---|---|
| Baza | PostgreSQL 16, `mybazzar` bazasi |
| Rollar | `mb_anon` (so'rovlar), `mb_authenticator` (PostgREST ulanishi) |
| API | `postgrest-mybazzar.service` → `/etc/postgrest/mybazzar.conf` (port 3002) |
| nginx | `/etc/nginx/sites-available/mybazzar` |
| Frontend | `/var/www/mybazzar` |

Rollar `mb_` prefiksi bilan ataylab alohida: Postgres'da rollar butun klaster
uchun umumiy, shuning uchun CRM loyihasining `anon` roli bilan aralashib
ketmasligi kerak.

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `schema.sql` | 7 ta jadval, indekslar, `increment_customer_spent` funksiyasi |
| `roles.sql` | `mb_anon` / `mb_authenticator` ruxsatlari |
| `nginx-mybazzar.conf` | nginx sayti (frontend + API proxy) |

Maxfiy kalitlar (JWT secret, baza paroli, anon key) bu papkada **yo'q** va
git'ga tushmaydi. Ular serverda `/etc/postgrest/mybazzar.conf` (chmod 600)
ichida va mahalliy `.env` faylida saqlanadi.

## Yangi versiyani joylashtirish

```bash
npm run build
tar -czf build.tar.gz -C build .
scp build.tar.gz root@138.249.7.47:/tmp/
ssh root@138.249.7.47 'rm -rf /var/www/mybazzar/* &&
  tar -xzf /tmp/build.tar.gz -C /var/www/mybazzar &&
  chown -R www-data:www-data /var/www/mybazzar && rm /tmp/build.tar.gz'
```

## Domen va SSL — tayyor

```
https://mybazzar.uz            → ilova
https://mybazzar.uz/rest/v1/   → API
```

`www` va IP manzil asosiy domenga yo'naltiriladi, HTTP → HTTPS ham.

Sertifikat `certbot certonly --webroot` bilan olingan — **nginx plagini bilan
emas**. Sabab: nginx plagini umumiy `nginx.conf` ni tahrirlab,
`server_names_hash_bucket_size` direktivasini takrorlab yuboradi va butun
nginx ishdan chiqadi (ya'ni `bekbags.uz` bilan `api.eduprocrm.uz` ham).
Yangilashda ham shu usulni ishlating:

```bash
certbot certonly --webroot -w /var/www/html -d mybazzar.uz -d www.mybazzar.uz
systemctl reload nginx
```

Avtomatik yangilanish certbot timer'i orqali sozlangan.

## Mahsulot rasmlari

```
POST /api/upload.php   →  php-fpm  →  /var/www/mybazzar-uploads
GET  /uploads/…        →  nginx statik
```

Rasm brauzerda 1200px gacha kichraytirilib, JPEG ga o'girilib yuboriladi —
serverda GD/Imagick yo'q, ya'ni u yerda kichraytirib bo'lmaydi.

Endpoint himoyasi: JWT imzosi tekshiriladi, MIME fayl mazmunidan
aniqlanadi (faqat jpeg/png/webp), fayl nomi tasodifiy, papkada PHP
bajarilishi nginx darajasida bloklangan (403), nginx tezlik chegarasi
daqiqasiga 20 ta so'rov.

Maxfiy kalit: `/var/www/mybazzar-api/secret.php` (640 root:www-data).

## Subdomainlar — qisman tayyor

`*.mybazzar.uz` DNS yozuvi Cloudflare'da qo'shilgan va serverga qaratilgan.
Frontend subdomainni o'zi taniydi (`src/utils/storeHost.js`) va katalogni
ochadi. **Qolgani: wildcard SSL sertifikat** — Cloudflare nameserverlari
faollashgach:

```bash
apt install python3-certbot-dns-cloudflare
# /root/.cloudflare.ini ichiga API token, chmod 600
certbot certonly --dns-cloudflare   --dns-cloudflare-credentials /root/.cloudflare.ini   -d mybazzar.uz -d '*.mybazzar.uz'
```

Keyin nginx'ga `server_name *.mybazzar.uz` bloki qo'shiladi.

## Tovar harakati (sverka)

`stock_movements` jadvali — har bir qoldiq o'zgarishi yozib boriladi:
kim, qachon, qanday amal, qanchadan qanchaga.

**Yozish ilovaga emas, bazaga yuklatilgan.** `products` jadvalidagi
`stock` ustuniga trigger qo'yilgan — qoldiq qanday yo'l bilan
o'zgarmasin, yozuv qoladi. Amal turi RPC tomonidan sessiya
o'zgaruvchisiga yoziladi; ko'rsatilmagan bo'lsa harakat `tuzatish`
deb belgilanadi va hisobotda "sababsiz o'zgarish" bo'lib chiqadi.

Funksiyalar:

| Funksiya | Vazifasi |
|---|---|
| `move_stock(product, qty, type, note, actor, txn)` | Qoldiqni sabab bilan o'zgartiradi. Qator qulflanadi, qoldiq yetmasa xato |
| `apply_sale(txn, actor)` | Sotuv tarkibidagi hamma tovarni bir yo'la yechadi — bittasi yetmasa hech biri yechilmaydi |
| `revert_sale(txn, actor, note)` | Qaytarish — sotuvni orqaga qaytaradi |

Amal turlari: `boshlangich` · `kirim` · `sotuv` · `qaytarish` ·
`kochirish` · `taftish` · `tuzatish`.

Ombor jadvalida qoldiq raqami bosilsa o'sha tovarning kartochkasi
ochiladi. Umumiy hisobot: Hisobotlar → Tovar harakati (sana oralig'i bilan).

## Bajarilishi kerak

### Xavfsizlik — hal qilinmagan

Ikkita muammo hozircha ochiq, ikkalasi ham Supabase davridan meros:

**Parollar ochiq matnda saqlanadi.** `users.password` va
`customers.password` shifrlanmagan. `bcryptjs` paketi loyihada bor, lekin
ishlatilmaydi.

**Anon kalit hamma narsaga ruxsat beradi.** Kalit brauzerga chiqadi, RLS
(Row Level Security) yoqilmagan — ya'ni kalitni qo'lga kiritgan odam
`users` jadvalini parollari bilan o'qiy oladi.

To'g'ri yechim: login `SECURITY DEFINER` funksiyasi orqali o'tsin, parol
bcrypt bilan hashlansin, jadvallarga RLS qo'yilsin. Bu frontend'da faqat
bitta joyni — `AuthContext.login()` ni — o'zgartiradi.
