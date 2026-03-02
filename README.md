# 🏪 MyBazzar — Aqlli Savdo Boshqaruv Tizimi

## Ishga tushirish

```bash
# 1. Papkaga kiring
cd mybazzar

# 2. Paketlarni o'rnating
npm install

# 3. Ishga tushiring
npm start
```

Brauzer avtomatik http://localhost:3000 da ochiladi.

---

## Sahifalar

| Yo'l | Sahifa | Tavsif |
|------|--------|--------|
| `/login` | Login | 4 xil rol bilan kirish |
| `/dashboard` | Dashboard | KPI, grafiklar, so'nggi sotuvlar |
| `/pos` | POS Sotuv | Barcode, savat, to'lov |
| `/inventory` | Ombor | Tovarlar, qoldiqlar, kirim |
| `/employees` | Xodimlar | Ro'yxat, statistika, qo'shish |
| `/analytics` | AI Analitika | Prognoz, tavsiyalar, trendlar |
| `/reports` | Hisobotlar | Sotuv, moliya, soliq |
| `/settings` | Sozlamalar | Do'kon ma'lumotlari, tizim |

---

## Texnologiyalar

- **React 18** — UI framework
- **React Router v6** — Sahifalar routing
- **Recharts** — Grafiklar
- **Lucide React** — Ikonlar
- **CSS Variables** — Dark theme

---

## Keyingi qadamlar (Backend)

```
Backend: Node.js + Express
Database: PostgreSQL
Auth: JWT tokens
API: RESTful
Deploy: Railway / Render / VPS
```

---

## Struktura

```
mybazzar/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.js      # Asosiy layout
│   │   ├── Sidebar.js     # Chap menyu
│   │   ├── Topbar.js      # Yuqori bar
│   │   └── UI.js          # Qayta ishlatiladigan komponentlar
│   ├── context/
│   │   └── AuthContext.js # Global auth holat
│   ├── pages/
│   │   ├── Login.js       # Kirish sahifasi
│   │   ├── Dashboard.js   # Bosh sahifa
│   │   ├── POS.js         # Sotuv tizimi
│   │   └── OtherPages.js  # Ombor, Xodimlar, AI, Hisobot, Sozlamalar
│   ├── utils/
│   │   └── mockData.js    # Demo ma'lumotlar
│   ├── App.js             # Router
│   ├── index.js           # Entry point
│   └── index.css          # Global stilllar
└── package.json
```
