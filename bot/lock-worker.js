'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   Qulf ijrochisi (lock-worker)

   MyBazzar "qulfla" yoki "och" deb qaror qiladi, lekin o'zi telefonni
   qulflamaydi — buyruqni lock_commands navbatiga yozadi. Bu ijrochi
   navbatni o'qib, HAQIQIY qulflashni provayder orqali bajaradi:

     · amapi    — Android Management API (o'zimiz EMM, bepul)
     · reseller — tashqi xizmat (Google Device Lock, ~20 ming/IMEI)
     · manual   — provayder yo'q; do'konchi qo'lda qiladi, faqat holat

   Nega alohida jarayon:
     · provayder kaliti bir joyda — serverdagi bot.env da, ilovada emas
     · buyruq internet uzilsa yo'qolmaydi — navbatda turadi va qayta
       urinib ko'riladi
     · har kuni kechikkanlarni tekshirib, ogohlantirish/qulflashni
       o'zi boshlaydi (credit_run_overdue)

   Hozir amapi ulagichi TAYYORLANGAN, lekin Google Cloud loyihasi va
   EMM ro'yxati kerak — u kelgach yagona joy (callProvider) to'ldiriladi.
   Shu paytgacha buyruqlar navbatda kutadi va do'konchi ilovada qo'lda
   holatni boshqara oladi.
   ══════════════════════════════════════════════════════════════════════ */

const { Client } = require('pg');

const DB = process.env.DATABASE_URL;
const GRACE_DAYS = Number(process.env.LOCK_GRACE_DAYS || 3);
const POLL_MS = Number(process.env.LOCK_POLL_MS || 30000);

const db = new Client({ connectionString: DB });

const many = async (sql, a) => (await db.query(sql, a)).rows;
const run = (sql, a) => db.query(sql, a);

/* ── Provayder ulagichi ───────────────────────────────────────────────────
   Har provayder shu yerdan chaqiriladi. amapi kaliti bo'lsa haqiqiy
   qulflaydi; bo'lmasa buyruq navbatda qoladi (holat o'zgaradi, lekin
   telefon hali fizik qulflanmaydi — do'konchi buni ilovada ko'radi).  */

const amapi = require('./providers/amapi');

async function callProvider(device, cmd) {
  switch (device.provider) {
    case 'amapi':
      return amapi.execute(device, cmd);

    case 'reseller':
      // Reseller API'si tanlangach shu yerga ulanadi
      return { ok: false, error: 'reseller ulagichi hali sozlanmagan' };

    case 'manual':
    default:
      // Provayder yo'q — holat ilovada ko'rinadi, fizik qulf yo'q
      return { ok: true, note: 'manual — holat yangilandi, fizik qulf yo‘q' };
  }
}

/* ── Navbatni qayta ishlash ───────────────────────────────────────────── */

async function processQueue() {
  const cmds = await many(`
    SELECT lc.*, d.provider, d.imei, d.enrollment_id, d.model,
           d.client_name, d.client_phone, d.store_id
    FROM lock_commands lc
    JOIN credit_devices d ON d.id = lc.device_id
    WHERE lc.status IN ('queued', 'failed') AND lc.attempts < 8
    ORDER BY lc.created_at
    LIMIT 20
  `);

  for (const cmd of cmds) {
    try {
      const res = await callProvider(cmd, cmd);
      if (res.ok) {
        await run(`UPDATE lock_commands SET status='done', done_at=now(), error=NULL WHERE id=$1`,
          [cmd.id]);
      } else {
        await run(`UPDATE lock_commands SET status='failed', attempts=attempts+1, error=$2 WHERE id=$1`,
          [cmd.id, String(res.error || 'nomaʼlum xato')]);
      }
    } catch (e) {
      await run(`UPDATE lock_commands SET status='failed', attempts=attempts+1, error=$2 WHERE id=$1`,
        [cmd.id, e.message]);
    }
  }
  return cmds.length;
}

/* ── Kechikkanlarni tekshirish ────────────────────────────────────────────
   Kuniga bir marta: muddat o'tgan kredit telefonlarni topadi, avval
   ogohlantiradi, grace kunidan keyin qulflaydi. Buyruqlar navbatga
   tushadi, keyingi processQueue ularni provayderga uzatadi.            */

let lastOverdue = '';

async function runOverdue() {
  const key = new Date().toDateString();
  // Kuniga bir marta, soat 10 dan keyin (ertalab do'kon ochilgach)
  if (lastOverdue === key || new Date().getHours() < 10) return;
  lastOverdue = key;

  const rows = await many('SELECT * FROM credit_run_overdue($1)', [GRACE_DAYS]);
  if (rows.length) {
    console.log(`[overdue] ${rows.length} qurilma holati o'zgardi`);
  }
}

/* ── Ishga tushirish ──────────────────────────────────────────────────── */

async function main() {
  await db.connect();
  console.log('lock-worker ishga tushdi · grace', GRACE_DAYS, 'kun');

  for (;;) {
    try {
      await runOverdue();
      await processQueue();
    } catch (e) {
      console.error('worker', e.message);
    }
    await new Promise((s) => setTimeout(s, POLL_MS));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
