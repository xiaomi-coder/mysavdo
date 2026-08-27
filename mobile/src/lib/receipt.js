import * as Print from 'expo-print';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildReceiptHtml, DEFAULT_RECEIPT_SETTINGS } from '@shared/receipt';

/* ══════════════════════════════════════════════════════════════════════════
   Chek chop etish

   Chekning ko'rinishi veb ilova bilan bitta faylda turadi
   (../../src/utils/receipt.js). Do'kon egasi kompyuterda chek
   shablonini o'zgartirsa, telefondan chiqqan chek ham o'sha bo'ladi.

   Telefondan chop etish tizimning o'z chop etish oynasi orqali
   ketadi — u yerda Bluetooth termal printer ham, oddiy printer ham,
   "PDF ga saqlash" ham chiqadi. Alohida drayver kerak emas.
   ══════════════════════════════════════════════════════════════════════ */

const KEY = 'mb.receiptSettings';

export async function getReceiptSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return { ...DEFAULT_RECEIPT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_RECEIPT_SETTINGS };
  }
}

export async function saveReceiptSettings(s) {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

/**
 * Chekni chop etish oynasini ochadi.
 * payload — CartSheet dagi sotuv ma'lumoti.
 */
export async function printReceipt(payload) {
  const settings = await getReceiptSettings();
  const html = buildReceiptHtml({
    items: payload.items,
    subtotal: payload.subtotal,
    discount: payload.discount,
    total: payload.total,
    paidAmount: payload.paidAmount || 0,
    payMethod: payload.payMethod || methodFromLabel(payload.payLabel),
    receiptNo: String(payload.receiptNo || '').replace('#', ''),
    cashier: payload.cashier,
    customer: payload.customer,
    storeName: payload.storeName,
    isPhone: payload.isPhone,
    settings,
  });

  await Print.printAsync({ html });
}

/** Chekni PDF qilib saqlash — mijoz "menga yuboring" desa */
export async function receiptToPdf(payload) {
  const settings = await getReceiptSettings();
  const html = buildReceiptHtml({ ...payload, settings });
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

const methodFromLabel = (label) => ({
  Naqd: 'cash', Karta: 'card', 'O‘tkazma': 'transfer', Nasiya: 'nasiya',
}[label] || 'cash');
