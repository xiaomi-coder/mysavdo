import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, ping } from './lib/api';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

/* ══════════════════════════════════════════════════════════════════════════
   Savat va sotuvni yakunlash

   Savat butun ilova bo'ylab bitta — skaner oynasidan qo'shilgan tovar
   ham, ro'yxatdan bosilgani ham o'sha savatga tushadi.

   OFFLINE REJIM
   Do'konda internet uzilishi oddiy hol. Sotuvni to'xtatib bo'lmaydi —
   mijoz qarshida turibdi. Shuning uchun internet yo'q bo'lsa sotuv
   qurilmada navbatga qo'yiladi va aloqa tiklanishi bilan o'zi
   yuboriladi. Kassir hech narsa qilmaydi.

   Navbatdagi sotuv yuborilganda ombor serverda yechiladi, ya'ni
   qoldiq baribir to'g'ri chiqadi — faqat biroz kechroq.
   ══════════════════════════════════════════════════════════════════════ */

const Ctx = createContext(null);
const QUEUE_KEY = 'mb.pendingSales';

export const PAY_METHODS = [
  { id: 'cash',     label: 'Naqd',     icon: 'money' },
  { id: 'card',     label: 'Karta',    icon: 'card' },
  { id: 'transfer', label: "O‘tkazma", icon: 'transfer' },
  { id: 'nasiya',   label: 'Nasiya',   icon: 'handshake' },
];

export function CartProvider({ children }) {
  const { user } = useAuth();
  const data = useData();

  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);        // foizda
  const [payMethod, setPayMethod] = useState('cash');
  const [customer, setCustomer] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');   // nasiyada boshlang'ich to'lov
  const [dueDays, setDueDays] = useState(30);
  const [cashGiven, setCashGiven] = useState(0);      // naqdda mijoz bergan pul
  const [saving, setSaving] = useState(false);
  const [queue, setQueue] = useState([]);

  /* Navbatni tiklaymiz */
  useEffect(() => {
    AsyncStorage.getItem(QUEUE_KEY).then((raw) => {
      if (raw) { try { setQueue(JSON.parse(raw)); } catch {} }
    });
  }, []);

  const persistQueue = useCallback((q) => {
    setQueue(q);
    AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q)).catch(() => {});
  }, []);

  /* ── Savat amallari ─────────────────────────────────────────────────── */

  const add = useCallback((product, qty = 1) => {
    setItems((list) => {
      const i = list.findIndex((x) => x.id === product.id);
      if (i >= 0) {
        const next = [...list];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...list, { ...product, qty }];
    });
  }, []);

  /* Narxsiz tovar — kalkulyatordan kiritilgan summa */
  const addCustom = useCallback((amount, name = 'Boshqa tovar') => {
    setItems((list) => [...list, {
      id: `custom-${Date.now()}`,
      name, price: amount, cost_price: 0, qty: 1, custom: true,
    }]);
  }, []);

  const setQty = useCallback((id, qty) => {
    setItems((list) => (qty <= 0
      ? list.filter((x) => x.id !== id)
      : list.map((x) => (x.id === id ? { ...x, qty } : x))));
  }, []);

  const remove = useCallback((id) => setItems((l) => l.filter((x) => x.id !== id)), []);

  const clear = useCallback(() => {
    setItems([]);
    setDiscount(0);
    setPayMethod('cash');
    setCustomer(null);
    setPaidAmount('');
    setDueDays(30);
    setCashGiven(0);
  }, []);

  /* ── Summalar ───────────────────────────────────────────────────────── */
  const totals = useMemo(() => {
    const subtotal = items.reduce((s, x) => s + Number(x.price || 0) * x.qty, 0);
    const discountTotal = Math.round((subtotal * discount) / 100);
    const total = Math.max(0, subtotal - discountTotal);
    const count = items.reduce((s, x) => s + x.qty, 0);
    const change = cashGiven > 0 ? cashGiven - total : 0;
    const nasiyaRest = Math.max(0, total - (parseInt(paidAmount, 10) || 0));
    return { subtotal, discountTotal, total, count, change, nasiyaRest };
  }, [items, discount, cashGiven, paidAmount]);

  /* ── Sotuvni yakunlash ──────────────────────────────────────────────── */

  const checkout = useCallback(async () => {
    if (items.length === 0) return { error: 'Savat bo‘sh' };
    if (payMethod === 'nasiya' && !customer) {
      return { error: 'Nasiya uchun mijozni tanlang' };
    }

    setSaving(true);
    const { total, discountTotal } = totals;
    const receiptNo = `#${Date.now().toString().slice(-6)}`;

    const payload = {
      store_id: user.store_id,
      customer_id: customer?.id || null,
      receipt_no: receiptNo,
      cashier: user.name,
      items: items.map(stripForStorage),
      total,
      discount: discountTotal,
      payment_method: payMethod,
      status: 'completed',
      // Sotuv qaysi smenada bo'lgani — kassa yopilganda hisob shu bo'yicha
      shift_id: data.shift?.id ?? null,
    };

    const online = await ping();

    if (!online) {
      // Navbatga qo'yamiz. Qoldiqni ekranda darrov kamaytiramiz, aks
      // holda kassir yo'q tovarni yana sotib yuborishi mumkin.
      const q = [...queue, { ...payload, _queuedAt: new Date().toISOString(), _nasiya: nasiyaPayload() }];
      persistQueue(q);
      items.forEach((it) => {
        if (it.custom) return;
        const p = data.products.find((x) => x.id === it.id);
        if (p) data.patchProduct(p.id, { stock: Math.max(0, (p.stock || 0) - it.qty) });
      });
      setSaving(false);
      return { ok: true, offline: true, receiptNo, total };
    }

    const { data: txn, error } = await db.from('transactions').insert(payload).select().single();
    if (error) {
      setSaving(false);
      return { error: `Sotuv saqlanmadi: ${error.message}` };
    }

    /* Ombordan yechish bazada bajariladi: qatorlar qulflanadi va
       qoldiq yetmasa butun amal bekor bo'ladi. Shu sababli ikki
       kassir bir vaqtda oxirgi telefonni sota olmaydi. */
    const { error: stockErr } = await db.rpc('apply_sale', { p_txn: txn.id, p_actor: user.name });
    if (stockErr) {
      // Ombor yechilmadi — sotuv yozuvini ham olib tashlaymiz, aks holda
      // hisobotda mavjud bo'lmagan sotuv qolib ketadi
      await db.from('transactions').delete().eq('id', txn.id);
      setSaving(false);
      return { error: stockErr.message };
    }

    if (payMethod === 'nasiya') {
      const np = nasiyaPayload();
      const { data: debtRow } = await db.from('debts').insert(np).select().single();
      if (debtRow) data.addDebt(debtRow);
    }

    if (customer) {
      await db.rpc('increment_customer_spent', { cid: customer.id, amnt: total });
    }

    data.addTransaction(txn);
    items.forEach((it) => {
      if (it.custom) return;
      const p = data.products.find((x) => x.id === it.id);
      if (p) data.patchProduct(p.id, { stock: Math.max(0, (p.stock || 0) - it.qty) });
    });

    setSaving(false);
    return { ok: true, receiptNo, total, txn };

    function nasiyaPayload() {
      if (payMethod !== 'nasiya' || !customer) return null;
      const due = new Date();
      due.setDate(due.getDate() + (parseInt(dueDays, 10) || 30));
      const paid = parseInt(paidAmount, 10) || 0;
      return {
        store_id: user.store_id,
        customer_id: customer.id,
        client: customer.name,
        phone: customer.phone || '',
        amount: total,
        paid_amount: paid,
        due_date: due.toISOString(),
        status: paid >= total ? "To'landi" : "To'lanmagan",
      };
    }
  }, [items, totals, payMethod, customer, paidAmount, dueDays, user, data, queue, persistQueue]);

  /* ── Navbatni yuborish ──────────────────────────────────────────────── */

  const syncing = useRef(false);

  const flushQueue = useCallback(async () => {
    if (syncing.current || queue.length === 0) return { sent: 0 };
    if (!(await ping())) return { sent: 0 };

    syncing.current = true;
    const left = [];
    let sent = 0;

    for (const item of queue) {
      const { _queuedAt, _nasiya, ...payload } = item;
      const { data: txn, error } = await db.from('transactions')
        .insert({ ...payload, date: _queuedAt }).select().single();

      if (error) { left.push(item); continue; }

      const { error: stockErr } = await db.rpc('apply_sale', {
        p_txn: txn.id, p_actor: payload.cashier,
      });
      if (stockErr) {
        /* Qoldiq yetmadi — ehtimol shu orada boshqa kassir sotib
           yuborgan. Sotuvni o'chirmaymiz: pul olingan, chek berilgan.
           Izohga belgi qo'yib qoldiramiz, egasi sverkada ko'radi. */
        await db.from('transactions').update({
          cashier: `${payload.cashier} · ombor mos kelmadi`,
        }).eq('id', txn.id);
      }

      if (_nasiya) await db.from('debts').insert(_nasiya);
      if (payload.customer_id) {
        await db.rpc('increment_customer_spent', { cid: payload.customer_id, amnt: payload.total });
      }
      sent++;
    }

    persistQueue(left);
    syncing.current = false;
    if (sent > 0) data.reload({ silent: true });
    return { sent, failed: left.length };
  }, [queue, persistQueue, data]);

  /* Navbat bo'sh bo'lmasa har 20 soniyada urinib ko'ramiz */
  useEffect(() => {
    if (queue.length === 0) return;
    flushQueue();
    const id = setInterval(flushQueue, 20000);
    return () => clearInterval(id);
  }, [queue.length, flushQueue]);

  const value = {
    items, totals, discount, payMethod, customer, paidAmount, dueDays,
    cashGiven, saving, queue,
    add, addCustom, setQty, remove, clear, checkout, flushQueue,
    setDiscount, setPayMethod, setCustomer, setPaidAmount, setDueDays, setCashGiven,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);

/* Bazaga yozishdan oldin tovardan keraksiz maydonlarni olib tashlaymiz.
   Chekda va qaytarishda nima kerak bo'lsa — o'sha qoladi. */
function stripForStorage(it) {
  return {
    id: it.id, name: it.name, qty: it.qty,
    price: Number(it.price) || 0,
    cost_price: Number(it.cost_price) || 0,
    barcode: it.barcode || null,
    photo_url: it.photo_url || null,
    image: it.image || null,
    phone_imei1: it.phone_imei1 || null,
    custom: it.custom || false,
  };
}
