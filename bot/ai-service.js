'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   AI maslahat xizmati

   Nega alohida xizmat:
     · AI kaliti SERVERDA qoladi. Ilovaga berilsa, uni har bir do'konchi
       brauzer konsolidan olib, platforma hisobidan foydalanadi
     · do'kon raqamlari bazadan shu yerda yig'iladi — ilova nima yuborishni
       o'zi hal qilmaydi, ya'ni ortiqcha ma'lumot ketib qolmaydi
     · kuniga bitta tahlil keshlanadi: sahifa 50 marta ochilsa ham
       provayderga bir marta to'lanadi

   Ilova bu yerga o'zining oddiy tokeni bilan keladi. Xizmat JWT kalitini
   KO'RMAYDI — tokenni bazadagi private.jwt_verify ga berib tekshiradi.

   Provayderga MIJOZ MA'LUMOTI YUBORILMAYDI: ism, telefon, IMEI yo'q.
   Faqat raqamlar va tovar nomlari ketadi (maxfiylik sahifasida shunday
   yozilgan — o'zgartirsangiz u yerni ham yangilang).
   ══════════════════════════════════════════════════════════════════════ */

const http = require('http');
const { Client } = require('pg');

const DB = process.env.DATABASE_URL;
const PORT = Number(process.env.AI_PORT || 3003);
// Kunlik chegara — kalit o'g'irlansa ham hisobdagi pul bir kunda tugamasin
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 100);

const db = new Client({ connectionString: DB });
const one = async (sql, a) => (await db.query(sql, a)).rows[0] || null;
const many = async (sql, a) => (await db.query(sql, a)).rows;

let calls = { day: '', n: 0 };
const bumpDaily = () => {
  const today = new Date().toISOString().slice(0, 10);
  if (calls.day !== today) calls = { day: today, n: 0 };
  calls.n += 1;
  return calls.n <= DAILY_LIMIT;
};

/* ── Do'kon raqamlari ────────────────────────────────────────────────────
   Hammasi bazada hisoblanadi: telefon sekin internetda ham bir xil. */
async function collect(storeId) {
  const store = await one(
    `SELECT name, store_type FROM stores WHERE id = $1`, [storeId]);

  const sum = await one(`
    SELECT coalesce(sum(total), 0)::NUMERIC AS jami,
           count(*) FILTER (WHERE status = 'completed') AS soni,
           coalesce(avg(total) FILTER (WHERE status = 'completed'), 0)::NUMERIC AS ortacha
      FROM transactions
     WHERE store_id = $1 AND date > now() - INTERVAL '30 days'
       AND status IN ('completed', 'returned')`, [storeId]);

  const kunlar = await many(`
    SELECT date_trunc('day', date)::DATE::TEXT AS kun,
           coalesce(sum(total), 0)::NUMERIC AS summa
      FROM transactions
     WHERE store_id = $1 AND date > now() - INTERVAL '14 days'
       AND status IN ('completed', 'returned')
     GROUP BY 1 ORDER BY 1`, [storeId]);

  const top = await many(`
    SELECT c.name,
           sum((i ->> 'qty')::NUMERIC) AS dona,
           sum((i ->> 'qty')::NUMERIC * coalesce((i ->> 'price')::NUMERIC, c.price)) AS tushum,
           c.price, c.cost_price
      FROM transactions t, jsonb_array_elements(t.items) i
      JOIN product_catalog c ON c.id::TEXT = (i ->> 'id')
     WHERE t.store_id = $1 AND t.status = 'completed'
       AND t.date > now() - INTERVAL '30 days'
     GROUP BY c.id, c.name, c.price, c.cost_price
     ORDER BY tushum DESC LIMIT 10`, [storeId]);

  // Yotib qolgan tovar — pul shunda qotib turadi
  const olik = await many(`
    SELECT c.name, bs.qty, c.cost_price, (bs.qty * c.cost_price) AS pul
      FROM product_catalog c
      JOIN (SELECT product_id, sum(qty) AS qty FROM branch_stock GROUP BY 1) bs
        ON bs.product_id = c.id
     WHERE c.store_id = $1 AND bs.qty > 0
       AND NOT EXISTS (
         SELECT 1 FROM transactions t, jsonb_array_elements(t.items) i
          WHERE t.store_id = $1 AND t.status = 'completed'
            AND t.date > now() - INTERVAL '30 days'
            AND (i ->> 'id') = c.id::TEXT)
     ORDER BY pul DESC NULLS LAST LIMIT 8`, [storeId]);

  const kam = await many(`
    SELECT c.name, coalesce(bs.qty, 0) AS qty, c."minStock"
      FROM product_catalog c
      LEFT JOIN (SELECT product_id, sum(qty) AS qty FROM branch_stock GROUP BY 1) bs
        ON bs.product_id = c.id
     WHERE c.store_id = $1 AND coalesce(bs.qty, 0) <= coalesce(c."minStock", 0)
     ORDER BY coalesce(bs.qty, 0) LIMIT 10`, [storeId]);

  const qarz = await one(`
    SELECT coalesce(sum(amount - coalesce(paid_amount, 0)), 0)::NUMERIC AS qoldiq,
           count(*) FILTER (WHERE due_date < now() AND status <> 'To''langan') AS kechikkan
      FROM debts WHERE store_id = $1 AND status <> 'To''langan'`, [storeId]);

  const tolov = await many(`
    SELECT payment_method AS usul, coalesce(sum(total), 0)::NUMERIC AS summa
      FROM transactions
     WHERE store_id = $1 AND status = 'completed' AND date > now() - INTERVAL '30 days'
     GROUP BY 1 ORDER BY 2 DESC`, [storeId]);

  const filiallar = await many(`
    SELECT b.name,
           coalesce((SELECT sum(t.total) FROM transactions t
                      WHERE t.branch_id = b.id AND t.status = 'completed'
                        AND t.date > now() - INTERVAL '30 days'), 0)::NUMERIC AS savdo
      FROM branches b WHERE b.store_id = $1 AND b.is_active
     ORDER BY savdo DESC`, [storeId]);

  return { store, sum, kunlar, top, olik, kam, qarz, tolov, filiallar };
}

const money = (n) => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/ /g, ' ');

/* Provayderga boradigan matn. Faqat raqam va tovar nomi — mijoz ismi,
   telefoni, IMEI yo'q. */
function buildPrompt(d) {
  const L = [];
  L.push(`Do'kon: ${d.store?.name || '-'} (${d.store?.store_type === 'phone' ? 'telefon do\'koni' : 'oddiy do\'kon'})`);
  L.push(`So'nggi 30 kun: savdo ${money(d.sum.jami)} so'm, ${d.sum.soni} ta chek, o'rtacha chek ${money(d.sum.ortacha)} so'm`);

  if (d.kunlar.length) {
    L.push(`Kunlik savdo (oxirgi 14 kun): ${d.kunlar.map((k) => `${k.kun.slice(5)}=${money(k.summa)}`).join(', ')}`);
  }
  if (d.filiallar.length > 1) {
    L.push(`Filiallar bo'yicha 30 kunlik savdo: ${d.filiallar.map((b) => `${b.name}=${money(b.savdo)}`).join(', ')}`);
  }
  if (d.top.length) {
    L.push('Eng ko\'p tushum keltirgan tovarlar (30 kun): ' + d.top.map((p) => {
      const marja = p.price > 0 ? Math.round(((p.price - (p.cost_price || 0)) / p.price) * 100) : null;
      return `${p.name} — ${p.dona} dona, ${money(p.tushum)} so'm${marja != null ? `, ustama ${marja}%` : ''}`;
    }).join('; '));
  }
  if (d.olik.length) {
    L.push('30 kunda umuman sotilmagan, lekin omborda turgan tovarlar: ' +
      d.olik.map((p) => `${p.name} — ${p.qty} dona, ${money(p.pul)} so'm pul qotgan`).join('; '));
  }
  if (d.kam.length) {
    L.push('Qoldig\'i tugagan yoki tugayotgan: ' +
      d.kam.map((p) => `${p.name} (${p.qty} dona, minimal ${p.minStock || 0})`).join('; '));
  }
  if (Number(d.qarz.qoldiq) > 0) {
    L.push(`Nasiya: qaytmagan ${money(d.qarz.qoldiq)} so'm, muddati o'tgan ${d.qarz.kechikkan} ta`);
  }
  if (d.tolov.length) {
    L.push('To\'lov usullari (30 kun): ' + d.tolov.map((t) => `${t.usul}=${money(t.summa)}`).join(', '));
  }
  return L.join('\n');
}

const SYSTEM = [
  "Sen O'zbekistondagi do'kon egasiga maslahat beradigan tajribali savdo tahlilchisisan.",
  "Javobni FAQAT o'zbek tilida (lotin yozuvida), sodda so'zlar bilan yoz — mijozing IT mutaxassisi emas, do'konchi.",
  '',
  'Qoidalar:',
  '1. FAQAT berilgan raqamlarga tayan. Yo\'q ma\'lumotni o\'ylab topma. Raqam yetmasa, "buni aytish uchun ma\'lumot kam" deb yoz.',
  '2. Har bir maslahat aniq bo\'lsin: qaysi tovar, qancha, qancha pul. "Savdoni oshiring" kabi quruq gap yozma.',
  '3. Eng ko\'p pul keltiradigani birinchi tursin.',
  '4. 4-6 ta maslahat, har biri 1-2 jumla. Sarlavha qo\'yma, oddiy ro\'yxat qil.',
  '5. Summani so\'mda yoz, uch xonadan bo\'shliq bilan ajrat.',
  '6. Do\'konchini maqtash yoki uzr so\'rash shart emas — darhol ishga o\'t.',
].join('\n');

/* ── Provayderlar ────────────────────────────────────────────────────── */
async function askClaude(key, model, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message || `Claude xatosi ${res.status}`);
  return (body.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
}

async function askGemini(key, model, prompt) {
  const m = model || 'gemini-2.5-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1200 },
      }),
    });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message || `Gemini xatosi ${res.status}`);
  const parts = body?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('\n').trim();
}

async function ask(prompt) {
  const cfg = await one(`
    SELECT (SELECT value FROM platform_settings WHERE key = 'ai_provider') AS provider,
           (SELECT value FROM platform_settings WHERE key = 'ai_model')    AS model,
           private.ai_key() AS key`);
  if (!cfg?.key) throw new Error('AI kaliti sozlanmagan');
  if (!bumpDaily()) throw new Error('Bugungi AI chegarasi tugadi, ertaga qayta urinib ko‘ring');
  const text = cfg.provider === 'gemini'
    ? await askGemini(cfg.key, cfg.model, prompt)
    : await askClaude(cfg.key, cfg.model, prompt);
  if (!text) throw new Error('AI bo‘sh javob qaytardi');
  return { text, model: cfg.model, provider: cfg.provider };
}

/* ── HTTP ────────────────────────────────────────────────────────────── */
const json = (res, code, obj) => {
  const s = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(s) });
  res.end(s);
};

async function claims(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  // JWT kaliti bazada qoladi — xizmat uni ko'rmaydi
  const row = await one('SELECT private.jwt_verify($1) AS c', [h.slice(7).trim()]);
  return row?.c || null;
}

const readBody = (req) => new Promise((resolve) => {
  let s = '';
  req.on('data', (c) => { s += c; if (s.length > 10000) req.destroy(); });
  req.on('end', () => { try { resolve(JSON.parse(s || '{}')); } catch { resolve({}); } });
});

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/health') return json(res, 200, { ok: true, calls: calls.n });

    const c = await claims(req);
    if (!c) return json(res, 401, { error: 'Avtorizatsiya kerak' });

    // Kalitni sinash — faqat creator
    if (req.method === 'POST' && req.url === '/test') {
      if (c.app_role !== 'creator') return json(res, 403, { error: 'Faqat platforma egasi' });
      const r = await ask('Sinov: "ishlayapti" deb bitta so\'z bilan javob ber.');
      return json(res, 200, { ok: true, text: r.text, provider: r.provider, model: r.model });
    }

    if (req.method === 'POST' && req.url === '/report') {
      const storeId = Number(c.store_id);
      if (!storeId) return json(res, 400, { error: 'Do‘kon aniqlanmadi' });
      const { refresh } = await readBody(req);

      if (!refresh) {
        const cached = await one(
          `SELECT text, model, created_at FROM ai_reports WHERE store_id = $1 AND day = current_date`, [storeId]);
        if (cached) return json(res, 200, { text: cached.text, cached: true, at: cached.created_at });
      }

      const data = await collect(storeId);
      if (Number(data.sum.soni) === 0 && data.top.length === 0) {
        return json(res, 200, {
          text: 'Hali sotuv yo‘q — tahlil qilish uchun ma’lumot yetarli emas. '
              + 'Bir necha kun savdo qilganingizdan keyin qayting.',
          cached: false, empty: true,
        });
      }

      const r = await ask(buildPrompt(data));
      await db.query(`
        INSERT INTO ai_reports (store_id, day, text, model) VALUES ($1, current_date, $2, $3)
        ON CONFLICT (store_id, day) DO UPDATE SET text = EXCLUDED.text, model = EXCLUDED.model,
          created_at = now()`, [storeId, r.text, r.model]);
      return json(res, 200, { text: r.text, cached: false, at: new Date().toISOString() });
    }

    return json(res, 404, { error: 'Topilmadi' });
  } catch (e) {
    console.error('[ai]', e.message);
    return json(res, 500, { error: e.message });
  }
});

(async () => {
  await db.connect();
  server.listen(PORT, '127.0.0.1', () => console.log(`[ai] ${PORT} portda tayyor`));
})();

process.on('SIGTERM', async () => { try { await db.end(); } catch {} process.exit(0); });
