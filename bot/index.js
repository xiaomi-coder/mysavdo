'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   MyBazzar Telegram bot

   Nima qiladi:
     · yangi onlayn buyurtma tushganda do'kon egasiga DARHOL xabar beradi
     · har kuni kechqurun kunlik xulosa yuboradi
     · so'rov bo'yicha statistika beradi (/bugun, /hafta, /ombor, /nasiya)

   Nega kerak: ilovada push bildirishnoma yo'q. Buyurtma tushsa,
   do'konchi ilovani ochmaguncha bilmaydi va mijoz javob kutib
   qoladi. Telegram esa har kimning telefonida ochiq turadi.

   Ishlash tartibi:
     · Telegram bilan LONG POLLING orqali gaplashadi — webhook uchun
       alohida domen va sertifikat sozlash shart emas
     · Baza bilan to'g'ridan-to'g'ri (pg), PostgREST orqali emas:
       botga LISTEN kerak va u faqat to'g'ridan-to'g'ri ulanishda bor
     · Buyurtma xabarini baza o'zi yuboradi (pg_notify) — bot bazani
       so'rab turmaydi

   Token muhitdan olinadi (/etc/mybazzar/bot.env) va hech qachon
   kodda yoki repoda turmaydi.
   ══════════════════════════════════════════════════════════════════════ */

const { Client } = require('pg');
const https = require('https');

const TOKEN = process.env.BOT_TOKEN;
const DB = process.env.DATABASE_URL;
const CREATOR_ID = Number(process.env.CREATOR_CHAT_ID || 0);
const DIGEST_HOUR = Number(process.env.DIGEST_HOUR || 21);   // mahalliy vaqt

if (!TOKEN || !DB) {
  console.error('BOT_TOKEN yoki DATABASE_URL berilmagan');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

/* ── Telegram bilan gaplashish ────────────────────────────────────────── */

function tg(method, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload || {});
    const req = https.request(
      `${API}/${method}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        timeout: 65000,
      },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch { resolve({ ok: false }); }
        });
      }
    );
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    req.write(body);
    req.end();
  });
}

const send = (chat, text, extra) =>
  tg('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', ...extra });

/* ── Ko'rinish ────────────────────────────────────────────────────────── */

const money = (n) => {
  const v = Math.round(Number(n) || 0);
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (v < 0 ? '−' : '') + s;
};

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const OYLAR = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const sana = (d = new Date()) => `${d.getDate()}-${OYLAR[d.getMonth()]}`;

/* ── Baza ─────────────────────────────────────────────────────────────── */

const db = new Client({ connectionString: DB });
const listener = new Client({ connectionString: DB });

const one = async (sql, args) => (await db.query(sql, args)).rows[0] || null;
const many = async (sql, args) => (await db.query(sql, args)).rows;

/* ── Hisobotlar ───────────────────────────────────────────────────────── */

/** Bir davr uchun sotuv jamlanmasi */
async function summary(storeId, fromSql) {
  return one(`
    SELECT
      COALESCE(SUM(total), 0)                                   AS total,
      COUNT(*) FILTER (WHERE total >= 0)                        AS count,
      COALESCE(SUM(total) FILTER (WHERE payment_method='cash'), 0)     AS cash,
      COALESCE(SUM(total) FILTER (WHERE payment_method='card'), 0)     AS card,
      COALESCE(SUM(total) FILTER (WHERE payment_method='transfer'), 0) AS transfer,
      COALESCE(SUM(total) FILTER (WHERE payment_method='nasiya'), 0)   AS nasiya,
      COALESCE(SUM(total) FILTER (WHERE total < 0), 0)          AS returned
    FROM transactions
    WHERE store_id = $1 AND status IN ('completed','returned') AND date >= ${fromSql}
  `, [storeId]);
}

/** Foyda: har chekdagi tovarlarning tannarxi ayiriladi */
async function profit(storeId, fromSql) {
  const r = await one(`
    SELECT COALESCE(SUM(
      CASE WHEN t.total < 0 THEN -1 ELSE 1 END *
      (COALESCE((i->>'price')::NUMERIC,0) - COALESCE((i->>'cost_price')::NUMERIC,0))
      * COALESCE((i->>'qty')::NUMERIC,1)
    ), 0) AS profit
    FROM transactions t, jsonb_array_elements(COALESCE(t.items,'[]'::jsonb)) i
    WHERE t.store_id = $1 AND t.status IN ('completed','returned') AND t.date >= ${fromSql}
  `, [storeId]);
  return Number(r?.profit || 0);
}

async function topProducts(storeId, fromSql, limit = 5) {
  return many(`
    SELECT i->>'name' AS name,
           SUM(COALESCE((i->>'qty')::NUMERIC,1)) AS qty,
           SUM(COALESCE((i->>'price')::NUMERIC,0) * COALESCE((i->>'qty')::NUMERIC,1)) AS sum
    FROM transactions t, jsonb_array_elements(COALESCE(t.items,'[]'::jsonb)) i
    WHERE t.store_id = $1 AND t.status = 'completed' AND t.date >= ${fromSql}
    GROUP BY 1 ORDER BY sum DESC LIMIT ${limit}
  `, [storeId]);
}

async function storeOf(chatId) {
  return one('SELECT * FROM telegram_chats WHERE chat_id = $1', [chatId]);
}

async function storeName(storeId) {
  const s = await one('SELECT name FROM stores WHERE id = $1', [storeId]);
  return s?.name || 'Do‘kon';
}

/* ── Matnlar ──────────────────────────────────────────────────────────── */

async function textSales(storeId, fromSql, title) {
  const s = await summary(storeId, fromSql);
  const p = await profit(storeId, fromSql);
  const tops = await topProducts(storeId, fromSql, 5);

  const lines = [
    `<b>${esc(await storeName(storeId))}</b> · ${title}`,
    '',
    `💰 Sotuv: <b>${money(s.total)}</b> so‘m`,
    `📈 Foyda: <b>${money(p)}</b> so‘m`,
    `🧾 Cheklar: <b>${s.count}</b> ta`,
  ];

  if (Number(s.count) > 0) {
    lines.push(`📊 O‘rtacha chek: ${money(Number(s.total) / Number(s.count))} so‘m`);
  }
  if (Number(s.returned) < 0) {
    lines.push(`↩️ Qaytarish: ${money(Math.abs(s.returned))} so‘m`);
  }

  lines.push('', '<b>To‘lov turlari</b>');
  for (const [label, v] of [['Naqd', s.cash], ['Karta', s.card],
    ['O‘tkazma', s.transfer], ['Nasiya', s.nasiya]]) {
    if (Number(v) !== 0) lines.push(`  ${label}: ${money(v)}`);
  }

  if (tops.length) {
    lines.push('', '<b>Eng ko‘p sotilgan</b>');
    tops.forEach((t, i) => {
      lines.push(`  ${i + 1}. ${esc(t.name)} — ${Math.round(t.qty)} dona · ${money(t.sum)}`);
    });
  }

  return lines.join('\n');
}

async function textStock(storeId) {
  /* Kam qoldiq qoidasi ilovadagi bilan bir xil: IMEI'li tovar
     noyob, uning qoldig'i 1 bo'lishi normal. */
  const rows = await many(`
    SELECT name, stock, "minStock", phone_imei1
    FROM products
    WHERE store_id = $1
      AND (stock <= 0
           OR (phone_imei1 IS NULL AND stock <= GREATEST(COALESCE("minStock",0), 5)))
    ORDER BY stock, name
    LIMIT 25
  `, [storeId]);

  if (!rows.length) return '✅ Ombor joyida — kam qolgan yoki tugagan tovar yo‘q.';

  const out = rows.filter((r) => Number(r.stock) <= 0);
  const low = rows.filter((r) => Number(r.stock) > 0);
  const lines = [`<b>${esc(await storeName(storeId))}</b> · ombor holati`, ''];

  if (out.length) {
    lines.push(`<b>Tugagan — ${out.length} ta</b>`);
    out.slice(0, 12).forEach((r) => lines.push(`  ❌ ${esc(r.name)}`));
    lines.push('');
  }
  if (low.length) {
    lines.push(`<b>Kam qoldiq — ${low.length} ta</b>`);
    low.slice(0, 12).forEach((r) => lines.push(`  ⚠️ ${esc(r.name)} — ${r.stock} dona`));
  }
  return lines.join('\n');
}

async function textDebts(storeId) {
  const rows = await many(`
    SELECT client, phone, amount - paid_amount AS left,
           due_date, (due_date < now()) AS overdue
    FROM debts
    WHERE store_id = $1 AND amount > paid_amount
    ORDER BY due_date NULLS LAST
    LIMIT 20
  `, [storeId]);

  if (!rows.length) return '✅ Qarzdor yo‘q — barcha nasiyalar to‘langan.';

  const overdue = rows.filter((r) => r.overdue);
  const total = rows.reduce((s, r) => s + Number(r.left), 0);

  const lines = [
    `<b>${esc(await storeName(storeId))}</b> · nasiya`,
    '',
    `Jami qarz: <b>${money(total)}</b> so‘m · ${rows.length} ta`,
  ];

  if (overdue.length) {
    lines.push('', `<b>⏰ Muddati o‘tgan — ${overdue.length} ta</b>`);
    overdue.slice(0, 10).forEach((r) => {
      const days = Math.round((Date.now() - new Date(r.due_date)) / 86400000);
      lines.push(`  ${esc(r.client)} — ${money(r.left)} so‘m · ${days} kun kechikdi`);
      if (r.phone) lines.push(`     ${esc(r.phone)}`);
    });
  }
  return lines.join('\n');
}

/** Creator uchun: barcha do'konlar bo'yicha */
async function textAllStores() {
  const rows = await many(`
    SELECT s.id, s.name,
           COALESCE(SUM(t.total) FILTER (WHERE t.date >= date_trunc('day', now())), 0) AS today,
           COALESCE(SUM(t.total) FILTER (WHERE t.date >= now() - INTERVAL '30 days'), 0) AS month,
           COUNT(t.id) FILTER (WHERE t.date >= date_trunc('day', now())) AS cnt
    FROM stores s
    LEFT JOIN transactions t
      ON t.store_id = s.id AND t.status IN ('completed','returned')
    WHERE s.is_active
    GROUP BY s.id, s.name
    ORDER BY month DESC
  `);

  if (!rows.length) return 'Do‘kon yo‘q.';

  const lines = ['<b>Barcha do‘konlar</b> · bugun / 30 kun', ''];
  let today = 0; let month = 0;
  rows.forEach((r) => {
    today += Number(r.today); month += Number(r.month);
    lines.push(`${esc(r.name)}\n  bugun ${money(r.today)} (${r.cnt} chek) · oyda ${money(r.month)}`);
  });
  lines.push('', `<b>Jami bugun:</b> ${money(today)} so‘m`);
  lines.push(`<b>Jami 30 kun:</b> ${money(month)} so‘m`);
  return lines.join('\n');
}

/* ── Klaviatura ───────────────────────────────────────────────────────── */

const MENU = {
  keyboard: [
    [{ text: '📊 Bugun' }, { text: '📅 Hafta' }],
    [{ text: '📦 Ombor' }, { text: '🤝 Nasiya' }],
    [{ text: '⚙️ Sozlamalar' }],
  ],
  resize_keyboard: true,
};

/* Creator barcha do'konlarni ko'radi — unga qo'shimcha tugma */
const MENU_CREATOR = {
  keyboard: [
    [{ text: '🏬 Do‘konlar' }],
    [{ text: '📊 Bugun' }, { text: '📅 Hafta' }],
    [{ text: '📦 Ombor' }, { text: '🤝 Nasiya' }],
    [{ text: '⚙️ Sozlamalar' }],
  ],
  resize_keyboard: true,
};

const HELP = [
  '<b>MyBazzar bot</b>',
  '',
  'Buyruqlar:',
  '/bugun — bugungi sotuv va foyda',
  '/hafta — 7 kunlik hisobot',
  '/oy — 30 kunlik hisobot',
  '/ombor — kam qolgan va tugagan tovarlar',
  '/nasiya — qarzdorlar, muddati o‘tganlari',
  '/sozlamalar — xabarlarni yoqish yoki o‘chirish',
  '/uzish — do‘kondan uzish',
  '',
  'Yangi onlayn buyurtma tushsa darhol xabar keladi.',
].join('\n');

/* ── Xabarlarni qayta ishlash ─────────────────────────────────────────── */

async function onMessage(msg) {
  const chatId = msg.chat.id;
  const text = String(msg.text || '').trim();
  const link = await storeOf(chatId);

  // ── Bog'lanmagan bo'lsa: faqat kod qabul qilinadi ──
  if (!link) {
    const code = text.replace(/\D/g, '');

    if (/^\/start/.test(text) && !code) {
      await send(chatId,
        ['<b>MyBazzar</b>ga xush kelibsiz.',
          '',
          'Botni do‘koningizga bog‘lash uchun ilovadan olingan',
          '<b>6 xonali kodni</b> shu yerga yuboring.',
          '',
          'Kodni olish: ilovada <b>Sozlamalar → Telegram bot</b>.'].join('\n'));
      return;
    }

    if (code.length === 6) {
      const row = await one(`
        UPDATE telegram_links SET used_at = now()
        WHERE code = $1 AND used_at IS NULL AND expires_at > now()
        RETURNING store_id, user_id, role
      `, [code]);

      if (!row) {
        await send(chatId, '❌ Kod noto‘g‘ri yoki muddati o‘tgan. Ilovadan yangi kod oling.');
        return;
      }

      await db.query(`
        INSERT INTO telegram_chats (chat_id, store_id, user_id, role, name, username, last_seen)
        VALUES ($1,$2,$3,$4,$5,$6, now())
        ON CONFLICT (chat_id) DO UPDATE
          SET store_id = EXCLUDED.store_id, user_id = EXCLUDED.user_id,
              role = EXCLUDED.role, last_seen = now()
      `, [chatId, row.store_id, row.user_id, row.role,
        [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' '),
        msg.from?.username || null]);

      await send(chatId,
        `✅ <b>${esc(await storeName(row.store_id))}</b> ga bog‘landi.\n\n${HELP}`,
        { reply_markup: MENU });
      return;
    }

    await send(chatId, 'Bog‘lash uchun ilovadan olingan 6 xonali kodni yuboring.');
    return;
  }

  await db.query('UPDATE telegram_chats SET last_seen = now() WHERE chat_id = $1', [chatId]);

  /* Creator hisobiga do'kon biriktirilmagan bo'lishi mumkin — u
     tizim egasi, muayyan do'konga bog'lanmagan. Do'kon kesimidagi
     buyruqlar ishlashi uchun birinchi faol do'konni olamiz. */
  const store = link.store_id
    || (await one('SELECT id FROM stores WHERE is_active ORDER BY id LIMIT 1'))?.id;
  const cmd = text.toLowerCase();

  if (!store) {
    await send(chatId, 'Do‘kon topilmadi. Ilovadan bog‘lash kodini oling.');
    return;
  }

  // ── Creator uchun alohida ko'rinish ──
  if (link.role === 'creator' && (cmd.startsWith('/dokonlar') || cmd.includes('do‘konlar'))) {
    await send(chatId, await textAllStores());
    return;
  }

  if (cmd.startsWith('/start') || cmd.startsWith('/help') || cmd.startsWith('/yordam')) {
    await send(chatId, HELP, { reply_markup: link.role === 'creator' ? MENU_CREATOR : MENU });

  } else if (cmd.startsWith('/bugun') || cmd.includes('bugun')) {
    await send(chatId, await textSales(store, "date_trunc('day', now())", `bugun, ${sana()}`));

  } else if (cmd.startsWith('/hafta') || cmd.includes('hafta')) {
    await send(chatId, await textSales(store, "now() - INTERVAL '7 days'", 'oxirgi 7 kun'));

  } else if (cmd.startsWith('/oy') || cmd.includes(' oy')) {
    await send(chatId, await textSales(store, "now() - INTERVAL '30 days'", 'oxirgi 30 kun'));

  } else if (cmd.startsWith('/ombor') || cmd.includes('ombor')) {
    await send(chatId, await textStock(store));

  } else if (cmd.startsWith('/nasiya') || cmd.includes('nasiya')) {
    await send(chatId, await textDebts(store));

  } else if (cmd.startsWith('/sozlamalar') || cmd.includes('sozlamalar')) {
    await send(chatId, [
      '<b>Xabarlar</b>',
      '',
      `${link.notify_orders ? '✅' : '❌'} Yangi buyurtma — /buyurtma`,
      `${link.notify_daily ? '✅' : '❌'} Kunlik xulosa — /kunlik`,
      `${link.notify_alerts ? '✅' : '❌'} Ogohlantirishlar — /ogoh`,
      '',
      'Yoqish yoki o‘chirish uchun buyruqni bosing.',
    ].join('\n'));

  } else if (cmd.startsWith('/buyurtma') || cmd.startsWith('/kunlik') || cmd.startsWith('/ogoh')) {
    const col = cmd.startsWith('/buyurtma') ? 'notify_orders'
      : cmd.startsWith('/kunlik') ? 'notify_daily' : 'notify_alerts';
    const r = await one(
      `UPDATE telegram_chats SET ${col} = NOT ${col} WHERE chat_id = $1 RETURNING ${col} AS v`,
      [chatId]);
    await send(chatId, r.v ? '✅ Yoqildi' : '❌ O‘chirildi');

  } else if (cmd.startsWith('/uzish')) {
    await db.query('DELETE FROM telegram_chats WHERE chat_id = $1', [chatId]);
    await send(chatId, 'Do‘kondan uzildi. Qayta bog‘lash uchun ilovadan yangi kod oling.',
      { reply_markup: { remove_keyboard: true } });

  } else {
    await send(chatId, HELP, { reply_markup: link.role === 'creator' ? MENU_CREATOR : MENU });
  }
}

/* ── Yangi buyurtma xabari ────────────────────────────────────────────── */

async function announceOrder(txnId) {
  const t = await one(`
    SELECT t.*, s.name AS store_name
    FROM transactions t JOIN stores s ON s.id = t.store_id
    WHERE t.id = $1
  `, [txnId]);
  if (!t) return;

  /* Do'kon egasi va tizim egasi (creator) — ikkalasiga ham boradi.
     Creator muayyan do'konga bog'lanmagan, lekin hammasini kuzatadi. */
  const chats = await many(`
    SELECT chat_id FROM telegram_chats
    WHERE notify_orders AND (store_id = $1 OR role = 'creator')
  `, [t.store_id]);
  if (!chats.length) return;

  const items = Array.isArray(t.items) ? t.items : [];
  // Onlayn buyurtmada mijoz ismi va telefoni cashier maydonida turadi
  const who = String(t.cashier || '').replace(/^Saytdan:\s*/, '');

  const text = [
    '🛒 <b>Yangi onlayn buyurtma</b>',
    `<i>${esc(t.store_name)}</i>`,
    '',
    `👤 ${esc(who) || 'Mijoz'}`,
    '',
    ...items.map((i) => `  • ${esc(i.name)}${i.qty > 1 ? ` ×${i.qty}` : ''} — ${money(i.price)}`),
    '',
    `💰 <b>${money(t.total)} so‘m</b>`,
    '',
    'Ilovadagi «Buyurtmalar» bo‘limida qabul qiling.',
  ].join('\n');

  for (const c of chats) await send(c.chat_id, text);
}

/* ── Kunlik xulosa ────────────────────────────────────────────────────── */

let lastDigest = '';

async function maybeDigest() {
  const now = new Date();
  const key = `${now.toDateString()}`;
  if (now.getHours() !== DIGEST_HOUR || lastDigest === key) return;
  lastDigest = key;

  /* Creator do'konga bog'lanmagan bo'lsa birinchi faol do'kon
     bo'yicha xulosa oladi — aks holda unga hech narsa kelmaydi. */
  const chats = await many(`
    SELECT c.chat_id,
           COALESCE(c.store_id,
                    (SELECT id FROM stores WHERE is_active ORDER BY id LIMIT 1)) AS store_id
    FROM telegram_chats c
    WHERE c.notify_daily
  `);

  for (const c of chats) {
    if (!c.store_id) continue;
    try {
      let text = await textSales(c.store_id, "date_trunc('day', now())", `kun yakuni · ${sana()}`);

      // Ertaga e'tibor talab qiladigan narsalar
      const extra = [];
      const low = await one(`
        SELECT COUNT(*) AS n FROM products
        WHERE store_id = $1 AND stock > 0 AND phone_imei1 IS NULL
          AND stock <= GREATEST(COALESCE("minStock",0), 5)`, [c.store_id]);
      const out = await one(
        'SELECT COUNT(*) AS n FROM products WHERE store_id = $1 AND stock <= 0', [c.store_id]);
      const due = await one(`
        SELECT COUNT(*) AS n, COALESCE(SUM(amount - paid_amount),0) AS s FROM debts
        WHERE store_id = $1 AND amount > paid_amount AND due_date < now()`, [c.store_id]);

      if (Number(low.n)) extra.push(`⚠️ ${low.n} tovar kam qoldi`);
      if (Number(out.n)) extra.push(`❌ ${out.n} tovar tugagan`);
      if (Number(due.n)) extra.push(`⏰ ${due.n} nasiya muddati o‘tgan — ${money(due.s)} so‘m`);

      if (extra.length) text += `\n\n<b>Ertaga e’tibor bering</b>\n${extra.map((x) => '  ' + x).join('\n')}`;

      await send(c.chat_id, text);
    } catch (e) {
      console.error('digest', c.chat_id, e.message);
    }
  }
}

/* ── Ishga tushirish ──────────────────────────────────────────────────── */

async function main() {
  await db.connect();
  await listener.connect();

  // Baza yangi buyurtma haqida o'zi xabar beradi
  await listener.query('LISTEN mb_order');
  listener.on('notification', (n) => {
    if (n.channel === 'mb_order') {
      announceOrder(Number(n.payload)).catch((e) => console.error('order', e.message));
    }
  });

  await tg('deleteWebhook', { drop_pending_updates: false });
  const me = await tg('getMe');
  console.log('bot ishga tushdi:', me.result?.username || '(nomaʼlum)');

  if (CREATOR_ID) {
    await db.query(`
      INSERT INTO telegram_chats (chat_id, store_id, role, name, last_seen)
      VALUES ($1, NULL, 'creator', 'Creator', now())
      ON CONFLICT (chat_id) DO UPDATE SET role = 'creator', last_seen = now()
    `, [CREATOR_ID]);
  }

  setInterval(() => maybeDigest().catch((e) => console.error('digest', e.message)), 60000);

  // ── Long polling ──
  let offset = 0;
  for (;;) {
    const r = await tg('getUpdates', { offset, timeout: 50, allowed_updates: ['message'] });
    if (!r.ok) { await new Promise((s) => setTimeout(s, 3000)); continue; }

    for (const u of r.result) {
      offset = u.update_id + 1;
      if (!u.message?.text) continue;
      try {
        await onMessage(u.message);
      } catch (e) {
        console.error('message', e.message);
        await send(u.message.chat.id, '⚠️ Xatolik yuz berdi. Birozdan keyin urinib ko‘ring.');
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
