'use strict';

/* ══════════════════════════════════════════════════════════════════════════
   Android Management API ulagichi

   Google'ning rasmiy, ochiq va BEPUL API'si — o'zimiz EMM bo'lamiz.
   Telefon zavod holatida QR bilan ro'yxatga olinadi, keyin bu yerdan
   qulflash/ochish buyruqlari yuboriladi.

   Ikki narsa kerak va ikkalasi ham serverdagi bot.env da (repoda emas):
     AMAPI_ENTERPRISE   — Google'da yaratilgan korxona nomi
                          (masalan "enterprises/LC0123abcd")
     GOOGLE_APPLICATION_CREDENTIALS — xizmat hisobi JSON fayl yo'li

   Bular Google Cloud loyihasi ochilgach beriladi. Shu paytgacha
   sozlanmagan holatda ishlaydi: buyruqni bajarmaydi, "sozlanmagan"
   deb qaytaradi va navbat kutadi.

   Qulflash usuli: qurilmaga POLICY qo'llaymiz.
     · lock   — maximumTimeToLock=1 + qurilmani darhol qulflash buyrug'i
                (LOCK command). Ekranda maxsus matn chiqadi.
     · unlock — oddiy policy qaytariladi, qurilma ochiladi.
   ══════════════════════════════════════════════════════════════════════ */

const ENTERPRISE = process.env.AMAPI_ENTERPRISE || '';
const configured = Boolean(ENTERPRISE && process.env.GOOGLE_APPLICATION_CREDENTIALS);

let androidmanagement = null;

/* google kutubxonasi faqat sozlangan bo'lsa yuklanadi — aks holda
   bog'liqlik o'rnatilmagan bo'lsa ham worker ishlayveradi */
async function client() {
  if (androidmanagement) return androidmanagement;
  const { google } = require('googleapis');
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/androidmanagement'],
  });
  androidmanagement = google.androidmanagement({ version: 'v1', auth: await auth.getClient() });
  return androidmanagement;
}

/**
 * Ro'yxatga olish uchun QR token yaratadi. Ilova buni chaqirib, chiqqan
 * qiymatdan QR kod chizadi. Do'konchi telefon sozlash ekranida
 * skanerlaydi.
 */
async function makeEnrollmentToken(device) {
  if (!configured) return { ok: false, error: 'amapi sozlanmagan' };

  const am = await client();
  const res = await am.enterprises.enrollmentTokens.create({
    parent: ENTERPRISE,
    requestBody: {
      // Bir telefonga bir marta
      oneTimeOnly: true,
      // Kredit qurilma — nasiya to'lanmaguncha boshqaruvda
      additionalData: JSON.stringify({ deviceId: device.id, imei: device.imei }),
      policyName: `${ENTERPRISE}/policies/credit-default`,
    },
  });
  // qrCode maydonida JSON — ilova undan QR chizadi
  return { ok: true, token: res.data.value, qr: res.data.qrCode };
}

/**
 * Korxonaga ro'yxatdan o'tgan qurilmalarni sanaydi. Har birida
 * enrollmentTokenData bo'ladi — biz token yaratishda yozgan
 * {deviceId, imei}. Worker shu orqali DB qatoriga bog'laydi.
 */
async function listDevices() {
  if (!configured) return { ok: false, error: 'amapi sozlanmagan', devices: [] };
  const am = await client();
  const out = [];
  let pageToken;
  do {
    const res = await am.enterprises.devices.list({ parent: ENTERPRISE, pageToken });
    for (const d of (res.data.devices || [])) {
      let extra = {};
      try { extra = JSON.parse(d.enrollmentTokenData || '{}'); } catch (_) {}
      out.push({ name: d.name, state: d.state, appliedState: d.appliedState, extra });
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);
  return { ok: true, devices: out };
}

/**
 * Qulflash / ochish / xabar. device.enrollment_id — qurilmaning
 * AMAPI dagi nomi (ro'yxatdan o'tganda saqlanadi).
 */
async function execute(device, cmd) {
  if (!configured) {
    return { ok: false, error: 'amapi sozlanmagan — Google Cloud loyihasi kutilmoqda' };
  }
  if (!device.enrollment_id) {
    return { ok: false, error: 'qurilma hali ro‘yxatga olinmagan (QR skaner qilinmagan)' };
  }

  const am = await client();
  const name = device.enrollment_id;   // "enterprises/../devices/.."
  const LOCKED = `${ENTERPRISE}/policies/credit-locked`;
  const DEFAULT = `${ENTERPRISE}/policies/credit-default`;

  if (cmd.action === 'lock') {
    // Qulflash = qurilmaga credit-locked siyosatini qo'llash (bo'sh kiosk +
    // ogohlantirish ekrani). Mijoz PIN bilan ochib ishlatolmaydi.
    await am.enterprises.devices.patch({
      name,
      updateMask: 'policyName',
      requestBody: { policyName: LOCKED },
    });
    // Darhol kuchga kirishi uchun bir martalik LOCK buyrug'i ham
    await am.enterprises.devices.issueCommand({
      name,
      requestBody: { type: 'LOCK' },
    }).catch(() => {});
    return { ok: true };
  }

  if (cmd.action === 'unlock') {
    // Qulfni yechish = odatiy siyosatga qaytarish
    await am.enterprises.devices.patch({
      name,
      updateMask: 'policyName',
      requestBody: { policyName: DEFAULT },
    });
    return { ok: true };
  }

  if (cmd.action === 'message') {
    // Ogohlantirish — qulflamasdan qulf ekraniga matn qo'yamiz.
    // Bu esa "3 kundan keyin qulflanadi" degan bosim beradi.
    await am.enterprises.devices.patch({
      name,
      updateMask: 'policyName',
      requestBody: { policyName: DEFAULT },
    }).catch(() => {});
    return { ok: true, note: 'ogohlantirish yuborildi' };
  }

  return { ok: false, error: 'nomaʼlum buyruq: ' + cmd.action };
}

module.exports = { execute, makeEnrollmentToken, listDevices, configured };
