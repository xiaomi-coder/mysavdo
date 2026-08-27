import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './lib/api';

/* ══════════════════════════════════════════════════════════════════════════
   Kirish va ruxsatlar

   Sessiya qurilmada saqlanadi — sotuvchi har kuni ertalab qayta parol
   terib o'tirmasin. Chiqish tugmasi bosilgandagina o'chadi.
   ══════════════════════════════════════════════════════════════════════ */

const Ctx = createContext(null);
const KEY = 'mb.session';

/* Ekranlarga kirish huquqi. Do'kon egasiga hammasi ochiq;
   sotuvchiga faqat sotuvga tegishlisi. */
export const ALL_PERMS = [
  'dashboard', 'pos', 'inventory', 'orders', 'crm', 'nasiya',
  'finance', 'reports', 'analytics', 'employees', 'receipt',
  'storefront', 'settings',
];

const CASHIER_PERMS = ['pos', 'inventory', 'orders', 'crm', 'nasiya', 'receipt'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    setUser(null);
    setStore(null);
    await AsyncStorage.removeItem(KEY);
  }, []);

  /* Serverdagi yozuvni qayta o'qiymiz: xodimning ruxsatlari
     o'zgargan yoki hisobi to'xtatilgan bo'lishi mumkin. */
  const refresh = useCallback(async (id) => {
    if (!id) return;
    const { data } = await db.from('users').select('*').eq('id', id).maybeSingle();
    if (!data) return;
    if (data.is_active === false) { await signOut(); return; }
    setUser((u) => ({ ...u, ...data, password: undefined }));
  }, [signOut]);

  /* Saqlangan sessiyani tiklaymiz — kassir har kuni ertalab qayta
     parol terib o'tirmasin. */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const s = JSON.parse(raw);
          setUser(s.user);
          setStore(s.store);
          refresh(s.user?.id);   // fon rejimida yangilaymiz
        }
      } catch {}
      setLoading(false);
    })();
  }, [refresh]);

  const signIn = useCallback(async (email, password) => {
    const clean = String(email || '').trim().toLowerCase();
    if (!clean || !password) return { error: 'Email va parolni kiriting' };

    const { data, error } = await db.from('users')
      .select('*').eq('email', clean).maybeSingle();

    if (error) return { error: error.offline ? 'Internet aloqasi yo\u2018q' : 'Server bilan aloqa yo\u2018q' };
    if (!data) return { error: 'Bunday foydalanuvchi topilmadi' };
    if (data.password !== password) return { error: 'Parol xato' };
    if (data.is_active === false) return { error: 'Hisobingiz to\u2018xtatilgan. Do\u2018kon egasiga murojaat qiling.' };

    const safe = { ...data, password: undefined };
    let st = null;
    if (data.store_id) {
      const r = await db.from('stores').select('*').eq('id', data.store_id).maybeSingle();
      st = r.data;
    }
    setUser(safe);
    setStore(st);
    await AsyncStorage.setItem(KEY, JSON.stringify({ user: safe, store: st }));
    return { user: safe };
  }, []);

  /* Ruxsat tekshiruvi. Egaga hammasi ochiq — do'kon uniki. */
  const can = useCallback((perm) => {
    if (!user) return false;
    const role = user.role;
    if (role === 'owner' || role === 'creator' || role === 'admin') return true;
    const list = Array.isArray(user.permissions) && user.permissions.length
      ? user.permissions
      : CASHIER_PERMS;
    return list.includes(perm);
  }, [user]);

  const isOwner = user?.role === 'owner' || user?.role === 'creator' || user?.role === 'admin';

  return (
    <Ctx.Provider value={{ user, store, loading, signIn, signOut, can, isOwner, refresh, setStore }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
