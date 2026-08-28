/* ══════════════════════════════════════════════════════════════════════════
   Do'kon tahlili

   Bu yerda hech qanday tashqi xizmat yo'q — barcha hisob-kitob
   telefonning o'zida bajariladi. Sabab uchta:
     · do'kon ma'lumoti hech qayerga yuborilmaydi;
     · internet sekin bo'lsa ham ishlaydi;
     · pullik so'rovlar yo'q, ya'ni har ochganda qayta hisoblansa ham
       hech narsa turmaydi.

   Maqsad — "chiroyli grafik" emas, PUL. Har bir xulosa ortida
   "buni qilmasangiz shuncha so'm yo'qotasiz" degan baho turadi va
   ro'yxat aynan shu baho bo'yicha tartiblanadi.
   ══════════════════════════════════════════════════════════════════════ */

const DAY = 86400000;

/* Pul ko'rinishi. format.js dan import qilinmaydi — bu modul veb va
   mobil ikkalasida ishlaydi va hech qanday bog'liqligi bo'lmasligi
   kerak. Bo'shliq ingichka va uzilmaydigan: raqam qator oxirida
   bo'linib ketmasin. */
const money = (n) => {
  const v = Math.round(Number(n) || 0);
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (v < 0 ? '−' : '') + s;
};

const num = (v) => Number(v) || 0;
const isSale = (tx) => tx.status === 'completed' || tx.status === 'returned';
const itemsOf = (tx) => (Array.isArray(tx.items) ? tx.items : []);

/** Sotuvning belgisi: qaytarish manfiy summa bilan yoziladi */
const sign = (tx) => (num(tx.total) < 0 ? -1 : 1);

/* ── Tovar bo'yicha sotuv yig'indisi ─────────────────────────────────── */
function perProduct(transactions, fromTs, now) {
  const map = new Map();
  transactions.forEach((tx) => {
    const ts = new Date(tx.date).getTime();
    if (ts < fromTs || ts > now) return;
    const s = sign(tx);
    itemsOf(tx).forEach((it) => {
      const cur = map.get(it.id) || { qty: 0, revenue: 0, cost: 0, last: 0, count: 0 };
      const qty = s * (it.qty || 1);
      cur.qty += qty;
      cur.revenue += s * num(it.price) * (it.qty || 1);
      cur.cost += s * num(it.cost_price) * (it.qty || 1);
      cur.count += s;
      if (s > 0 && ts > cur.last) cur.last = ts;
      map.set(it.id, cur);
    });
  });
  return map;
}

/* ── Kunlik tushum qatori ────────────────────────────────────────────── */
function dailySeries(transactions, days, now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const t0 = start.getTime();

  const out = [];
  for (let i = days - 1; i >= 0; i--) out.push({ ts: t0 - i * DAY, value: 0, count: 0 });

  const index = new Map(out.map((d, i) => [d.ts, i]));
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    d.setHours(0, 0, 0, 0);
    const i = index.get(d.getTime());
    if (i === undefined) return;
    out[i].value += num(tx.total);
    out[i].count += sign(tx);
  });
  return out;
}

/* ── Eng kichik kvadratlar: y = a + b·x ──────────────────────────────── */
function linefit(ys) {
  const n = ys.length;
  if (n < 2) return { a: ys[0] || 0, b: 0 };
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) { sx += i; sy += ys[i]; sxy += i * ys[i]; sxx += i * i; }
  const d = n * sxx - sx * sx;
  if (d === 0) return { a: sy / n, b: 0 };
  const b = (n * sxy - sx * sy) / d;
  return { a: (sy - b * sx) / n, b };
}

/* ══════════════════════════════════════════════════════════════════════
   1. PROGNOZ

   Ikki narsani birlashtiradi: umumiy yo'nalish (o'sish yoki pasayish)
   va hafta kunining ta'siri. Do'konda shanba dushanbadan ikki barobar
   ko'p bo'lishi normal — buni hisobga olmasa prognoz har hafta
   xato chiqadi.
   ══════════════════════════════════════════════════════════════════ */
function forecast(transactions, now) {
  const hist = dailySeries(transactions, 56, now);
  const active = hist.filter((d) => d.value !== 0);

  if (active.length < 5) {
    return { ready: false, reason: 'kam', days: [], week: 0 };
  }

  // Hafta kuni koeffitsienti
  const byDow = Array.from({ length: 7 }, () => []);
  hist.forEach((d) => byDow[new Date(d.ts).getDay()].push(d.value));
  const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
  const overall = mean(hist.map((d) => d.value)) || 1;
  const dow = byDow.map((a) => {
    const m = mean(a);
    // Ma'lumot kam bo'lsa koeffitsientni 1 ga yaqinlashtiramiz
    const w = Math.min(1, a.length / 4);
    return 1 + w * (m / overall - 1);
  });

  // Yo'nalish — oxirgi 28 kunning hafta kunidan tozalangan qiymati
  const tail = hist.slice(-28);
  const flat = tail.map((d) => d.value / (dow[new Date(d.ts).getDay()] || 1));
  const { a, b } = linefit(flat);

  // Xatolik tarqoqligi — ishonch darajasi uchun
  const resid = flat.map((v, i) => v - (a + b * i));
  const sd = Math.sqrt(mean(resid.map((r) => r * r)));
  const rel = overall > 0 ? sd / overall : 1;
  const confidence = rel < 0.35 ? 'yuqori' : rel < 0.7 ? 'o‘rta' : 'past';

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 1; i <= 7; i++) {
    const ts = start.getTime() + i * DAY;
    const base = a + b * (tail.length - 1 + i);
    const v = Math.max(0, base * (dow[new Date(ts).getDay()] || 1));
    days.push({ ts, value: Math.round(v) });
  }

  const week = days.reduce((s, d) => s + d.value, 0);
  const lastWeek = hist.slice(-7).reduce((s, d) => s + d.value, 0);
  const change = lastWeek > 0 ? Math.round(((week - lastWeek) / lastWeek) * 100) : null;

  return {
    ready: true, days, week, lastWeek, change, confidence,
    band: Math.round(sd * 2.6),          // taxminiy tebranish
    trend: b > overall * 0.01 ? 'up' : b < -overall * 0.01 ? 'down' : 'flat',
    history: hist.slice(-14),
  };
}

/* ══════════════════════════════════════════════════════════════════════
   2. TUGASH PROGNOZI

   Do'konchi uchun eng qimmatli raqam: "bu tovar necha kunda tugaydi".
   Tezlik oxirgi 30 kun bo'yicha olinadi, lekin tovar yaqinda
   qo'shilgan bo'lsa faqat mavjud kunlar hisobga kiritiladi —
   aks holda yangi tovar "sekin sotiladi" deb ko'rinadi.
   ══════════════════════════════════════════════════════════════════ */
function stockRisk(products, stats, now) {
  const out = [];
  products.forEach((p) => {
    const stock = num(p.stock);
    if (stock <= 0) return;

    const s = stats.get(p.id);
    if (!s || s.qty <= 0) return;

    const age = p.created_at ? (now - new Date(p.created_at).getTime()) / DAY : 30;
    const window = Math.max(7, Math.min(30, age));
    const velocity = s.qty / window;                  // kuniga necha dona
    if (velocity <= 0) return;

    const daysLeft = stock / velocity;
    if (daysLeft > 21) return;

    const margin = num(p.price) - num(p.cost_price);
    // Bir haftada yo'qotilishi mumkin bo'lgan foyda
    const impact = Math.max(0, velocity * 7 - stock) * Math.max(margin, num(p.price) * 0.15);

    out.push({
      product: p,
      velocity,
      daysLeft,
      sold30: s.qty,
      reorder: Math.max(1, Math.ceil(velocity * 30 - stock)),
      impact: Math.round(impact),
    });
  });
  return out.sort((a, b) => a.daysLeft - b.daysLeft);
}

/* ══════════════════════════════════════════════════════════════════════
   3. QOTIB QOLGAN PUL

   Javonda turgan, lekin sotilmayotgan tovar — bu naqd pulning
   qotgan holati. Do'konchi buni ko'rmaydi, chunki ombor ro'yxatida
   u boshqalari bilan bir xil ko'rinadi.
   ══════════════════════════════════════════════════════════════════ */
function deadStock(products, statsLong, now, days = 45) {
  const cut = now - days * DAY;
  const out = [];

  products.forEach((p) => {
    const stock = num(p.stock);
    if (stock <= 0) return;

    const s = statsLong.get(p.id);
    const last = s?.last || 0;
    const created = p.created_at ? new Date(p.created_at).getTime() : 0;

    // Yaqinda qo'shilgan tovarga hukm chiqarmaymiz
    if (created > cut) return;
    if (last > cut) return;

    const unit = num(p.cost_price) || num(p.price) * 0.7;
    out.push({
      product: p,
      frozen: Math.round(stock * unit),
      idleDays: last ? Math.round((now - last) / DAY) : null,
      neverSold: !last,
    });
  });

  return out.sort((a, b) => b.frozen - a.frozen);
}

/* ══════════════════════════════════════════════════════════════════════
   4. FOYDA TAHLILI
   ══════════════════════════════════════════════════════════════════ */
function margins(products, stats) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const rows = [];
  let revenue = 0, cost = 0;

  stats.forEach((s, id) => {
    if (s.qty <= 0) return;
    revenue += s.revenue;
    cost += s.cost;
    const p = byId.get(id);
    const profit = s.revenue - s.cost;
    rows.push({
      product: p,
      name: p?.name || '—',
      qty: s.qty,
      revenue: s.revenue,
      profit,
      margin: s.revenue > 0 ? (profit / s.revenue) * 100 : 0,
      hasCost: s.cost > 0,
    });
  });

  const total = revenue - cost;
  return {
    revenue, cost, profit: total,
    percent: revenue > 0 ? (total / revenue) * 100 : 0,
    stars: [...rows].sort((a, b) => b.profit - a.profit).slice(0, 5),
    weak: rows.filter((r) => r.hasCost && r.margin < 10)
      .sort((a, b) => a.margin - b.margin).slice(0, 5),
    losing: rows.filter((r) => r.hasCost && r.profit < 0)
      .sort((a, b) => a.profit - b.profit),
    noCost: rows.filter((r) => !r.hasCost).length,
  };
}

/* ══════════════════════════════════════════════════════════════════════
   5. VAQT NAQSHLARI — qaysi soatda va qaysi kunda ko'p sotiladi
   ══════════════════════════════════════════════════════════════════ */
function timing(transactions, fromTs, now) {
  /* Bu yerda PUL emas, MIJOZ SONI sanaladi.

     Sabab: bitta qimmat telefon sotilgan kun "eng gavjum kun" bo'lib
     ko'rinadi, aslida esa o'sha kuni do'konga ikki kishi kirgan.
     Bu bo'lim esa "qachon odam ko'p" degan savolga javob beradi —
     ya'ni kassada kim turishi kerakligini hal qiladi. */
  const hours = Array.from({ length: 24 }, () => 0);
  const dows = Array.from({ length: 7 }, () => 0);
  const dowMoney = Array.from({ length: 7 }, () => 0);
  let n = 0;

  transactions.forEach((tx) => {
    const ts = new Date(tx.date).getTime();
    if (ts < fromTs || ts > now || sign(tx) < 0) return;
    const d = new Date(tx.date);
    hours[d.getHours()] += 1;
    dows[d.getDay()] += 1;
    dowMoney[d.getDay()] += num(tx.total);
    n++;
  });

  // Eng gavjum uch soatlik oyna
  let best = { from: 0, sum: -1 };
  for (let h = 0; h < 22; h++) {
    const sum = hours[h] + hours[h + 1] + hours[h + 2];
    if (sum > best.sum) best = { from: h, sum };
  }

  const maxDow = dows.indexOf(Math.max(...dows));
  const active = dows.map((v, i) => ({ i, v })).filter((x) => x.v > 0);
  const minDow = active.length ? active.reduce((a, b) => (a.v < b.v ? a : b)).i : null;

  return {
    hours, dows, dowMoney, count: n,
    peak: best.sum > 0 ? best : null,
    bestDow: maxDow, worstDow: minDow,
  };
}

/* ══════════════════════════════════════════════════════════════════════
   6. MIJOZLAR
   ══════════════════════════════════════════════════════════════════ */
function customerHealth(customers, transactions, now) {
  const byCustomer = new Map();
  transactions.forEach((tx) => {
    if (!tx.customer_id || sign(tx) < 0) return;
    const ts = new Date(tx.date).getTime();
    const cur = byCustomer.get(tx.customer_id) || { count: 0, sum: 0, last: 0, first: Infinity };
    cur.count++;
    cur.sum += num(tx.total);
    if (ts > cur.last) cur.last = ts;
    if (ts < cur.first) cur.first = ts;
    byCustomer.set(tx.customer_id, cur);
  });

  const byId = new Map(customers.map((c) => [c.id, c]));
  const rows = [...byCustomer.entries()]
    .map(([id, v]) => ({ customer: byId.get(id), ...v }))
    .filter((r) => r.customer);

  const repeat = rows.filter((r) => r.count >= 2);
  const churn = repeat
    .filter((r) => now - r.last > 45 * DAY && now - r.last < 200 * DAY)
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 6);

  const fresh = rows.filter((r) => r.first > now - 30 * DAY).length;

  return {
    total: customers.length,
    withPurchase: rows.length,
    repeat: repeat.length,
    repeatShare: rows.length ? (repeat.length / rows.length) * 100 : 0,
    top: [...rows].sort((a, b) => b.sum - a.sum).slice(0, 5),
    churn,
    churnValue: churn.reduce((s, r) => s + r.sum / Math.max(1, r.count), 0),
    fresh,
  };
}

/* ══════════════════════════════════════════════════════════════════════
   7. XAVF VA G'ALATILIKLAR
   ══════════════════════════════════════════════════════════════════ */
function risks(transactions, debts, movements, fromTs, now) {
  const inRange = transactions.filter((tx) => {
    const ts = new Date(tx.date).getTime();
    return ts >= fromTs && ts <= now;
  });

  const gross = inRange.filter((t) => sign(t) > 0).reduce((s, t) => s + num(t.total), 0);
  const refunded = Math.abs(inRange.filter((t) => sign(t) < 0)
    .reduce((s, t) => s + num(t.total), 0));

  const credit = inRange.filter((t) => t.payment_method === 'nasiya')
    .reduce((s, t) => s + num(t.total), 0);

  const overdue = debts.filter((d) => {
    const left = num(d.amount) - num(d.paid_amount);
    return left > 0 && d.due_date && new Date(d.due_date).getTime() < now;
  });
  const overdueSum = overdue.reduce((s, d) => s + num(d.amount) - num(d.paid_amount), 0);

  // Sababsiz qoldiq tuzatishlari — sverkada eng shubhali yozuv
  const manual = (movements || []).filter((m) => {
    const ts = new Date(m.created_at).getTime();
    return m.type === 'tuzatish' && ts >= fromTs;
  });
  const manualDown = manual.filter((m) => num(m.qty) < 0);

  const discount = inRange.reduce((s, t) => s + num(t.discount), 0);

  return {
    gross, refunded,
    refundRate: gross > 0 ? (refunded / gross) * 100 : 0,
    credit,
    creditShare: gross > 0 ? (credit / gross) * 100 : 0,
    overdueCount: overdue.length,
    overdueSum,
    manualCount: manual.length,
    manualLoss: Math.abs(manualDown.reduce((s, m) => s + num(m.qty), 0)),
    manual: manualDown.slice(0, 5),
    discount,
    discountShare: gross > 0 ? (discount / gross) * 100 : 0,
  };
}

/* ══════════════════════════════════════════════════════════════════════
   8. XULOSALAR

   Har bir xulosa pul bahosi bilan keladi va ro'yxat shu baho
   bo'yicha tartiblanadi. Shuning uchun ekranning tepasida doim eng
   qimmat masala turadi — do'konchi pastga tushmasa ham eng
   muhimini ko'radi.
   ══════════════════════════════════════════════════════════════════ */
function buildInsights(r, now) {
  const list = [];

  /* Tugab qolayotgan tovarlar */
  const urgent = r.stockRisk.filter((x) => x.daysLeft <= 7);
  if (urgent.length) {
    const top = urgent[0];
    list.push({
      key: 'stockout',
      severity: urgent.length > 2 ? 'critical' : 'warn',
      icon: 'package',
      title: urgent.length === 1
        ? `${top.product.name} — ${Math.max(1, Math.round(top.daysLeft))} kunda tugaydi`
        : `${urgent.length} ta tovar bir hafta ichida tugaydi`,
      body: `Eng tezi — ${top.product.name}: kuniga ${top.velocity.toFixed(1)} dona ketyapti, `
        + `omborda ${top.product.stock} dona qoldi. Bir oyga yetishi uchun ${top.reorder} dona kerak.`,
      impact: urgent.reduce((s, x) => s + x.impact, 0),
      action: { screen: 'Ombor', params: { filter: 'low' }, label: 'Omborni ochish' },
    });
  }

  /* Muddati o'tgan nasiya */
  if (r.risks.overdueSum > 0) {
    list.push({
      key: 'debt',
      severity: r.risks.overdueCount > 3 ? 'critical' : 'warn',
      icon: 'handshake',
      title: `${r.risks.overdueCount} nasiyaning muddati o‘tgan`,
      body: `Qaytarilmagan pul: ${money(r.risks.overdueSum)} so‘m. `
        + 'Muddati o‘tgan qarz qancha uzoq tursa, qaytishi shuncha kamayadi — bugun eslatma yuboring.',
      impact: r.risks.overdueSum,
      action: { screen: 'Nasiya', label: 'Nasiyani ochish' },
    });
  }

  /* Zararga sotilayotgan tovar */
  if (r.margins.losing.length) {
    const loss = Math.abs(r.margins.losing.reduce((s, x) => s + x.profit, 0));
    list.push({
      key: 'losing',
      severity: 'critical',
      icon: 'warning',
      title: `${r.margins.losing.length} ta tovar zararga sotilyapti`,
      body: `Oxirgi 30 kunda ${money(loss)} so‘m zarar. Eng kattasi — `
        + `${r.margins.losing[0].name}. Narxi tannarxdan past yoki tannarx xato kiritilgan.`,
      impact: loss,
      action: { screen: 'Ombor', label: 'Narxlarni tekshirish' },
    });
  }

  /* Qotib qolgan pul */
  const frozen = r.deadStock.reduce((s, x) => s + x.frozen, 0);
  if (frozen > 0 && r.deadStock.length >= 2) {
    list.push({
      key: 'dead',
      severity: 'info',
      icon: 'coin',
      title: `${money(frozen)} so‘m javonda qotib qolgan`,
      body: `${r.deadStock.length} ta tovar 45 kundan beri sotilmadi. `
        + 'Chegirma bilan chiqarib yuborsangiz, o‘sha pul aylanmaga qaytadi.',
      impact: frozen * 0.2,
      action: { screen: 'Ombor', label: 'Tovarlarni ko‘rish' },
    });
  }

  /* Qaytarishlar ko'payib ketgan */
  if (r.risks.refundRate > 7) {
    list.push({
      key: 'refunds',
      severity: 'warn',
      icon: 'undo',
      title: `Qaytarishlar sotuvning ${r.risks.refundRate.toFixed(1)}% ini tashkil qiladi`,
      body: `30 kunda ${money(r.risks.refunded)} so‘m qaytarildi. `
        + 'Odatda bu 3% dan oshmaydi — sabablarini chekdan ko‘rib chiqing.',
      impact: r.risks.refunded * 0.5,
    });
  }

  /* Sababsiz qoldiq tuzatishlari */
  if (r.risks.manualCount >= 3) {
    list.push({
      key: 'manual',
      severity: 'warn',
      icon: 'pencil',
      title: `Qoldiq ${r.risks.manualCount} marta qo‘lda tuzatilgan`,
      body: `Shundan ${r.risks.manualLoss} dona kamaytirilgan. Qo‘lda tuzatish `
        + 'har doim biror narsa hisobga olinmaganini bildiradi — sverkani ko‘ring.',
      impact: 0,
    });
  }

  /* Nasiya ulushi katta */
  if (r.risks.creditShare > 35) {
    list.push({
      key: 'credit',
      severity: 'warn',
      icon: 'handshake',
      title: `Sotuvning ${Math.round(r.risks.creditShare)}% i nasiyaga ketyapti`,
      body: 'Nasiya ulushi uchdan birdan oshsa, kassada aylanma pul qolmaydi. '
        + 'Boshlang‘ich to‘lovni oshirish kerak bo‘lishi mumkin.',
      impact: r.risks.credit * 0.15,
    });
  }

  /* Yo'qolayotgan mijozlar */
  if (r.customers.churn.length >= 2) {
    list.push({
      key: 'churn',
      severity: 'info',
      icon: 'users',
      title: `${r.customers.churn.length} doimiy mijoz uzoq vaqtdan beri kelmadi`,
      body: `Ular ilgari muntazam xarid qilardi. O‘rtacha cheki `
        + `${money(r.customers.churnValue / r.customers.churn.length)} so‘m — `
        + 'qo‘ng‘iroq qilish arziydi.',
      impact: r.customers.churnValue,
      action: { screen: 'Mijozlar', label: 'Mijozlarni ochish' },
    });
  }

  /* Tannarxsiz tovarlar — foyda hisobini buzadi */
  if (r.margins.noCost >= 3) {
    list.push({
      key: 'nocost',
      severity: 'info',
      icon: 'info',
      title: `${r.margins.noCost} ta tovarda tannarx ko‘rsatilmagan`,
      body: 'Tannarxsiz tovar foyda hisobiga kirmaydi, ya’ni haqiqiy foydangiz '
        + 'ko‘rsatilgandan boshqacha. Ularni to‘ldirsangiz hisobot aniq bo‘ladi.',
      impact: 0,
      action: { screen: 'Ombor', label: 'Omborni ochish' },
    });
  }

  /* Yaxshi xabar — o'sish */
  if (r.forecast.ready && r.forecast.trend === 'up' && r.forecast.change > 5) {
    list.push({
      key: 'growth',
      severity: 'good',
      icon: 'chart',
      title: `Sotuv o‘syapti — keyingi hafta +${r.forecast.change}%`,
      body: `Prognozga ko‘ra ${money(r.forecast.week)} so‘m. `
        + 'Eng ko‘p ketadigan tovarlardan zaxira qilib qo‘ying.',
      impact: 0,
    });
  }

  if (r.forecast.ready && r.forecast.trend === 'down' && r.forecast.change < -10) {
    list.push({
      key: 'decline',
      severity: 'warn',
      icon: 'chart',
      title: `Sotuv pasayyapti — keyingi hafta ${r.forecast.change}%`,
      body: `Oxirgi haftada ${money(r.forecast.lastWeek)} so‘m edi, `
        + `prognoz ${money(r.forecast.week)} so‘m. Sabab mavsummi yoki `
        + 'omborda tovar kamayib qolganmi — tekshiring.',
      impact: Math.max(0, r.forecast.lastWeek - r.forecast.week),
    });
  }

  const rank = { critical: 0, warn: 1, info: 2, good: 3 };
  return list.sort((a, b) =>
    (rank[a.severity] - rank[b.severity]) || (b.impact - a.impact));
}

/* ══════════════════════════════════════════════════════════════════════
   Asosiy kirish nuqtasi
   ══════════════════════════════════════════════════════════════════ */
export function analyze({ products = [], transactions = [], debts = [], customers = [], movements = [] },
  now = Date.now()) {

  const sales = transactions.filter(isSale);
  const from30 = now - 30 * DAY;
  const from90 = now - 90 * DAY;

  const stats30 = perProduct(sales, from30, now);
  const stats90 = perProduct(sales, from90, now);

  const r = {
    forecast: forecast(sales, now),
    stockRisk: stockRisk(products, stats30, now),
    deadStock: deadStock(products, stats90, now),
    margins: margins(products, stats30),
    timing: timing(sales, from30, now),
    customers: customerHealth(customers, sales, now),
    risks: risks(sales, debts, movements, from30, now),
    sampleDays: Math.min(30, Math.max(1,
      Math.round((now - Math.min(...sales.map((t) => new Date(t.date).getTime()), now)) / DAY))),
    salesCount: sales.filter((t) => new Date(t.date).getTime() >= from30).length,
  };

  r.insights = buildInsights(r, now);
  return r;
}
