# MyBazzar Telegram bot

Do'kon egasiga xabar beradi va so'rov bo'yicha statistika chiqaradi.

## Nima uchun kerak

Ilovada push bildirishnoma yo'q. Onlayn buyurtma tushsa, do'konchi
ilovani ochmaguncha bilmaydi va mijoz javob kutib qoladi. Telegram
esa har kimning telefonida ochiq turadi — xabar bir soniyada yetadi.

## Nima qiladi

| Xabar | Qachon |
|---|---|
| Yangi onlayn buyurtma | Tushgan zahoti |
| Kunlik xulosa | Har kuni 21:00 da |

So'rov bo'yicha: `/bugun` `/hafta` `/oy` `/ombor` `/nasiya`

Creator uchun qo'shimcha: `/dokonlar` — barcha do'konlar kesimida.

## Bog'lash

Botga parol yozilmaydi. Ilovada **Sozlamalar → Telegram bot** bo'limida
6 xonali kod olinadi va botga yuboriladi. Kod 15 daqiqa yashaydi va
bir marta ishlaydi. Egasi istagan vaqtda `/uzish` bilan uzib qo'yadi.

## Ishlash tartibi

- Telegram bilan **long polling** — webhook uchun alohida sozlash shart emas
- Baza bilan **to'g'ridan-to'g'ri** (`pg`), PostgREST orqali emas: botga
  `LISTEN` kerak va u faqat to'g'ridan-to'g'ri ulanishda bor
- Yangi buyurtma haqida **baza o'zi xabar beradi** (`pg_notify`) — bot
  bazani so'rab turmaydi, ya'ni ortiqcha yuk yo'q va xabar darhol yetadi

## O'rnatish

```bash
# serverda
cd /opt/mybazzar-bot && npm install --omit=dev

# token va ulanish satri — repoda EMAS
sudo install -d -m 750 /etc/mybazzar
sudo nano /etc/mybazzar/bot.env
#   BOT_TOKEN=...
#   DATABASE_URL=postgres://...@localhost:5432/mybazzar
#   CREATOR_CHAT_ID=...
#   DIGEST_HOUR=21
sudo chmod 600 /etc/mybazzar/bot.env

sudo systemctl enable --now mybazzar-bot
```

Baza tomoni: `server/telegram.sql`.

## Token haqida

Token faqat serverda `/etc/mybazzar/bot.env` da turadi va repoga
hech qachon tushmaydi. Token oshkor bo'lsa, uni BotFather'da
`/revoke` bilan bekor qilib, yangisini shu faylga yozish kifoya.
