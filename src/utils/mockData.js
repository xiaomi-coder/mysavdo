// ── PRODUCTS ──────────────────────────────────────
export const PRODUCTS = [
  { id:1,  barcode:'8690637', name:'Coca Cola 0.5L',    cat:'Ichimliklar',  price:8000,  stock:4,   minStock:50,  emoji:'🥤' },
  { id:2,  barcode:'6931001', name:'Lipton Qora Choy',  cat:'Choy/Kofe',   price:12000, stock:15,  minStock:30,  emoji:'🍵' },
  { id:3,  barcode:'4001686', name:'Red Bull 250ml',    cat:'Ichimliklar',  price:18000, stock:220, minStock:30,  emoji:'⚡' },
  { id:4,  barcode:'4607037', name:'Lays Original',     cat:'Gazaklar',    price:15000, stock:360, minStock:50,  emoji:'🥔' },
  { id:5,  barcode:'7622210', name:'Oreo Original',     cat:'Shirinliklar', price:11000, stock:0,   minStock:20,  emoji:'🍪' },
  { id:6,  barcode:'5449000', name:'Sprite 0.5L',       cat:'Ichimliklar',  price:7000,  stock:130, minStock:50,  emoji:'🫧' },
  { id:7,  barcode:'5000112', name:'Fanta 0.5L',        cat:'Ichimliklar',  price:7500,  stock:98,  minStock:40,  emoji:'🍊' },
  { id:8,  barcode:'4014400', name:'Bounty',            cat:'Shirinliklar', price:8500,  stock:67,  minStock:20,  emoji:'🍫' },
  { id:9,  barcode:'7613035', name:'Nestle KitKat',     cat:'Shirinliklar', price:9000,  stock:88,  minStock:20,  emoji:'🍫' },
  { id:10, barcode:'8000070', name:'Pringles Original', cat:'Gazaklar',    price:22000, stock:44,  minStock:15,  emoji:'🫙' },
  { id:11, barcode:'6291003', name:'Chupa Chups',       cat:'Shirinliklar', price:3000,  stock:200, minStock:50,  emoji:'🍭' },
  { id:12, barcode:'5029053', name:'Nestea Shaftoli',   cat:'Ichimliklar',  price:10000, stock:55,  minStock:30,  emoji:'🧋' },
  { id:13, barcode:'4820000', name:'Xurmo Shokolad',    cat:'Shirinliklar', price:9000,  stock:85,  minStock:20,  emoji:'🍫' },
  { id:14, barcode:'8690526', name:'Ülker Biskvit',     cat:'Shirinliklar', price:7500,  stock:120, minStock:30,  emoji:'🍘' },
];

export const CATEGORIES = ['Hammasi', 'Ichimliklar', 'Choy/Kofe', 'Shirinliklar', 'Gazaklar'];

// ── EMPLOYEES ──────────────────────────────────────
export const EMPLOYEES = [
  { id:1, name:'Aziz Karimov',   role:'cashier', email:'aziz@sp.uz',   phone:'+998901234567', active:true,  sales:4250000, txns:312, avatar:'AK', color:'#3B82F6' },
  { id:2, name:'Malika Rahimova',role:'cashier', email:'malika@sp.uz',  phone:'+998901234568', active:true,  sales:3180000, txns:248, avatar:'MR', color:'#A78BFA' },
  { id:3, name:'Sardor To\'rayev',role:'manager', email:'sardor@sp.uz',  phone:'+998901234569', active:true,  sales:0,       txns:0,   avatar:'ST', color:'#F59E0B' },
  { id:4, name:'Nodira Yusupova',role:'cashier', email:'nodira@sp.uz',  phone:'+998901234570', active:false, sales:1920000, txns:156, avatar:'NY', color:'#10B981' },
];

// ── RECENT SALES ──────────────────────────────────
export const RECENT_SALES = [
  { id:'#00124', cashier:'Aziz K.',   items:4, method:'Plastik',  total:85000,  time:'14:32', status:'done' },
  { id:'#00123', cashier:'Malika R.', items:2, method:'Naqd',     total:32000,  time:'14:18', status:'done' },
  { id:'#00122', cashier:'Aziz K.',   items:7, method:'Transfer', total:147500, time:'13:55', status:'done' },
  { id:'#00121', cashier:'Sardor T.', items:1, method:'Naqd',     total:18000,  time:'13:40', status:'cancelled' },
  { id:'#00120', cashier:'Malika R.', items:5, method:'Plastik',  total:96000,  time:'13:22', status:'done' },
  { id:'#00119', cashier:'Nodira Y.', items:3, method:'Naqd',     total:41000,  time:'12:58', status:'done' },
  { id:'#00118', cashier:'Aziz K.',   items:6, method:'Transfer', total:203000, time:'12:30', status:'done' },
];

// ── WEEKLY CHART ──────────────────────────────────
export const WEEKLY_DATA = [
  { day:'Du',  sotuv:8200000,  foyda:2050000 },
  { day:'Se',  sotuv:9800000,  foyda:2450000 },
  { day:'Ch',  sotuv:7100000,  foyda:1775000 },
  { day:'Pa',  sotuv:11500000, foyda:2875000 },
  { day:'Ju',  sotuv:13200000, foyda:3300000 },
  { day:'Sh',  sotuv:9400000,  foyda:2350000 },
  { day:'Bu',  sotuv:12450000, foyda:3112500 },
];

// ── MONTHLY CHART ─────────────────────────────────
export const MONTHLY_DATA = [
  { month:'Avg',  sotuv:280000000 },
  { month:'Sen',  sotuv:310000000 },
  { month:'Okt',  sotuv:295000000 },
  { month:'Noy',  sotuv:330000000 },
  { month:'Dek',  sotuv:420000000 },
  { month:'Yan',  sotuv:305000000 },
  { month:'Feb',  sotuv:385000000 },
  { month:'Mar*', sotuv:410000000 },
];

// ── REPORTS ───────────────────────────────────────
export const REPORT_TYPES = [
  { id:'sales',    icon:'📊', name:'Sotuv Hisoboti',   desc:'Kunlik, haftalik, oylik sotuv va foyda',    color:'#3B82F6' },
  { id:'products', icon:'📦', name:'Tovar Hisoboti',   desc:"Eng ko'p va kam sotiladigan mahsulotlar",   color:'#10B981' },
  { id:'staff',    icon:'👥', name:'Xodim Hisoboti',   desc:'Har bir xodim savdosi va samaradorligi',    color:'#F59E0B' },
  { id:'finance',  icon:'💰', name:'Moliya Hisoboti',  desc:'Kirim-chiqim, foyda, soliq hisobi',          color:'#A78BFA' },
  { id:'forecast', icon:'🔮', name:'Prognoz',          desc:'Kelgusi oy AI bashorati',                   color:'#22D3EE' },
  { id:'tax',      icon:'🧾', name:'Soliq Hisoboti',   desc:"O'zbekiston soliq tizimi uchun tayyor",     color:'#F43F5E' },
];
