import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { db, ping } from './lib/api';
import { useAuth } from './AuthContext';
import { isLowStock, isOutOfStock } from './lib/stock';

/* ══════════════════════════════════════════════════════════════════════════
   Do'kon ma'lumotlari

   Tovarlar, mijozlar, sotuvlar va nasiyalar bir joyda turadi. Har
   ekran o'zi alohida so'rov yubormaydi — telefonda internet sekin
   bo'lishi mumkin, shuning uchun bir marta olinadi va kerak bo'lganda
   yangilanadi.

   Ilova fonga tushib qaytganda avtomatik yangilanadi: kassir
   telefonini cho'ntagiga solib, keyin ochganda eski raqamlarni
   ko'rmasligi kerak.
   ══════════════════════════════════════════════════════════════════════ */

const Ctx = createContext(null);

export function DataProvider({ children }) {
  const { user, store } = useAuth();
  const storeId = user?.store_id ?? store?.id ?? null;

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [debts, setDebts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);
  const inflight = useRef(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!storeId) { setLoading(false); return; }
    if (inflight.current) return;
    inflight.current = true;
    if (!silent) setLoading(true);

    const [p, c, tx, d] = await Promise.all([
      db.from('products').select('*').eq('store_id', storeId).order('name'),
      db.from('customers').select('*').eq('store_id', storeId).order('name'),
      db.from('transactions').select('*').eq('store_id', storeId).order('date', { ascending: false }).limit(300),
      db.from('debts').select('*').eq('store_id', storeId).order('due_date'),
    ]);

    inflight.current = false;
    setLoading(false);

    const firstErr = [p, c, tx, d].map((r) => r.error).find(Boolean);
    if (firstErr) {
      setOffline(Boolean(firstErr.offline));
      setError(firstErr.offline ? 'Internet aloqasi yo\u2018q' : firstErr.message);
      return;
    }

    setOffline(false);
    setError(null);
    setProducts(p.data || []);
    setCustomers(c.data || []);
    setTransactions(tx.data || []);
    setDebts(d.data || []);
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  /* Ilova fondan qaytganda jimgina yangilaymiz */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') load({ silent: true });
    });
    return () => sub.remove();
  }, [load]);

  /* Aloqa tiklandimi — offline banneri uchun */
  useEffect(() => {
    if (!offline) return;
    const id = setInterval(async () => {
      if (await ping()) load({ silent: true });
    }, 15000);
    return () => clearInterval(id);
  }, [offline, load]);

  /* Bitta tovarni ro'yxatda joyida yangilaymiz — butun ro'yxatni
     qayta yuklamasdan. Sotuvdan keyin ekran darrov yangilanadi. */
  const patchProduct = useCallback((id, patch) => {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const addProduct = useCallback((row) => setProducts((l) => [...l, row]), []);
  const dropProduct = useCallback((id) => setProducts((l) => l.filter((p) => p.id !== id)), []);
  const addTransaction = useCallback((row) => setTransactions((l) => [row, ...l]), []);
  const addCustomer = useCallback((row) => setCustomers((l) => [...l, row]), []);
  const patchDebt = useCallback((id, patch) => {
    setDebts((l) => l.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);
  const addDebt = useCallback((row) => setDebts((l) => [...l, row]), []);

  /* Onlayn buyurtmalar — do'konga tushgan, hali qabul qilinmagan */
  const pendingOrders = useMemo(
    () => transactions.filter((t) => t.status === 'online_pending'),
    [transactions]
  );

  /* Bosh ekrandagi ogohlantirishlar */
  const alerts = useMemo(() => {
    const low = products.filter(isLowStock);
    const out = products.filter(isOutOfStock);
    const now = Date.now();
    const overdue = debts.filter(
      (d) => d.status !== "To'langan" && d.due_date && new Date(d.due_date).getTime() < now
    );
    return { low, out, overdue, orders: pendingOrders };
  }, [products, debts, pendingOrders]);

  const value = {
    storeId, products, customers, transactions, debts,
    loading, error, offline, alerts, pendingOrders,
    reload: load,
    patchProduct, addProduct, dropProduct,
    addTransaction, addCustomer, addDebt, patchDebt,
    setTransactions, setDebts, setCustomers,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);
