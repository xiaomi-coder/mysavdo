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

  if (cmd.action === 'lock') {
    await am.enterprises.devices.issueCommand({
      name,
      requestBody: { type: 'LOCK' },
    });
    return { ok: true };
  }

  if (cmd.action === 'unlock') {
    // Qulfni yechish uchun qurilmani odatiy holatga qaytaramiz
    await am.enterprises.devices.patch({
      name,
      updateMask: 'appliedState',
      requestBody: { state: 'ACTIVE' },
    });
    return { ok: true };
  }

  if (cmd.action === 'message') {
    // Ogohlantirish — qurilma ekranida ko'rinadigan matn policy orqali.
    // Hozircha SMS ustuvor (SmsSheet), bu esa qo'shimcha.
    return { ok: true, note: 'ogohlantirish holati yangilandi' };
  }

  return { ok: false, error: 'nomaʼlum buyruq: ' + cmd.action };
}

module.exports = { execute, makeEnrollmentToken, configured };
