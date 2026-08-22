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
