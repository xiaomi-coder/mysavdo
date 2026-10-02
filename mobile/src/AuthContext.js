import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, setToken, setBranch, onAuthExpired } from './lib/api';

/* ══════════════════════════════════════════════════════════════════════════
   Kirish va ruxsatlar

   Sessiya qurilmada saqlanadi — sotuvchi har kuni ertalab qayta parol
   terib o'tirmasin. Chiqish tugmasi bosilgandagina o'chadi.
   ══════════════════════════════════════════════════════════════════════ */

const Ctx = createContext(null);
const KEY = 'mb.session';
const BRANCH_KEY = 'mb.branch';   // { list, active } — oflayn ishga tushish uchun ham

/* ══════════════════════════════════════════════════════════════════════════
   Ruxsatlar

   Ruxsat kalitlari bazada `users.permissions` da saqlanadi va ularni
   do'kon egasi VEB ilovadagi Xodimlar bo'limida belgilaydi. Shuning
   uchun kalitlar veb bilan AYNAN bir xil bo'lishi shart — aks holda
   eganing bergan ruxsati telefonda ishlamaydi.

   Veb ro'yxati: src/pages/Employees.js → MODULES
   ══════════════════════════════════════════════════════════════════════ */
export const MODULES = [
  { perm: 'pos', label: 'Sotuv' },
  { perm: 'dashboard_owner', label: 'Asosiy' },
  { perm: 'inventory', label: 'Ombor' },
  { perm: 'crm', label: 'Mijozlar' },
  { perm: 'nasiya', label: 'Nasiya' },
  { perm: 'finance', label: 'Moliya' },
  { perm: 'reports', label: 'Hisobot' },
  { perm: 'analytics', label: 'AI Analitika' },
  { perm: 'chek', label: 'Chek' },
  { perm: 'employees', label: 'Xodimlar' },
  { perm: 'settings', label: 'Sozlamalar' },
];

/* Ilova ichidagi nomlarni bazadagi kalitga bog'laymi. Ba'zi bo'lim
   faqat mobilda bor (buyurtmalar), ular yaqin ma'nodagi ruxsatga
   qarab beriladi. */
const PERM_ALIAS = {
  dashboard: 'dashboard_owner',
  receipt: 'chek',
  storefront: 'inventory',   // onlayn ko'rsatish — ombor ruxsati bilan
  orders: 'pos',             // buyurtma qabul qilish — sotuvning bir qismi
};

const CASHIER_PERMS = ['pos', 'inventory', 'crm', 'nasiya', 'chek'];

/* Tokendagi biriktirilgan filial. Server ham aynan shunga qaraydi —
   eski sessiyada branch_id alohida saqlanmagan bo'lsa ham to'g'ri chiqadi. */
function tokenBranch(token) {
  try {
    const part = String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(global.atob(part + '='.repeat((4 - (part.length % 4)) % 4)));
    return claims.branch_id ? Number(claims.branch_id) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Filiallar ─────────────────────────────────────────────────────────
     Telefonda doim aniq bitta filial tanlangan bo'ladi ("barcha
     filiallar" rejimi faqat vebda — hisobot uchun). Sotuvchi filialga
     biriktirilgan bo'lsa (pinned) — o'zgartira olmaydi. */
  const [branches, setBranches] = useState([]);
  const [branch, setActive] = useState(null);
  const [pinned, setPinned] = useState(null);

  const applyBranch = useCallback((id) => {
    setBranch(id);
    setActive(id);
  }, []);

  const loadBranches = useCallback(async (pin) => {
    let cache = null;
    try { cache = JSON.parse((await AsyncStorage.getItem(BRANCH_KEY)) || 'null'); } catch {}
    const { data, error } = await db.from('branches').select('*')
      .eq('is_active', true).order('is_main', { ascending: false }).order('id');
    // Internet yo'q — oxirgi ma'lum ro'yxat bilan ishlayveramiz
    const list = error ? (cache?.list || []) : (data || []);
    const want = pin || cache?.active;
    const active = list.some((b) => b.id === want) ? want : (pin || list[0]?.id || null);
    setBranches(list);
    setPinned(pin || null);
    applyBranch(active);
    AsyncStorage.setItem(BRANCH_KEY, JSON.stringify({ list, active })).catch(() => {});
  }, [applyBranch]);

  const chooseBranch = useCallback(async (id) => {
    if (pinned) return;
    applyBranch(id);
    AsyncStorage.setItem(BRANCH_KEY, JSON.stringify({ list: branches, active: id })).catch(() => {});
  }, [pinned, branches, applyBranch]);

  const signOut = useCallback(async () => {
    setToken(null);
    setBranch(null);
    setUser(null);
    setStore(null);
    setBranches([]); setActive(null); setPinned(null);
    await AsyncStorage.multiRemove([KEY, BRANCH_KEY]);
  }, []);

  // Token muddati o'tsa (30 kun) yoki bekor qilinsa — qayta kirish
  useEffect(() => { onAuthExpired(() => { signOut(); }); }, [signOut]);

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
          if (s.token) {
            setToken(s.token);
            // Filial foydalanuvchidan OLDIN tanlanadi — aks holda birinchi
            // yuklash asosiy filial ma'lumoti bilan ketib qoladi
            await loadBranches(tokenBranch(s.token));
            setUser(s.user);
            setStore(s.store);
            refresh(s.user?.id);   // fon rejimida yangilaymiz
          } else {
            // Eski versiyadagi sessiya — tokeni yo'q, qayta kirish kerak
            await AsyncStorage.removeItem(KEY);
          }
        }
      } catch {}
      setLoading(false);
    })();
  }, [refresh, loadBranches]);

  /* Parol SERVERDA tekshiriladi (login funksiyasi). Ilgari parol
     bazadan telefonga olinib shu yerda solishtirilardi. */
  const signIn = useCallback(async (email, password) => {
    const clean = String(email || '').trim().toLowerCase();
    if (!clean || !password) return { error: 'Email va parolni kiriting' };

    const { data, error } = await db.rpc('login', { p_email: clean, p_password: password });
    if (error) {
      if (error.offline) return { error: 'Internet aloqasi yo‘q' };
      return { error: error.message || 'Server bilan aloqa yo‘q' };
    }
    if (data?.user?.type === 'dealer') {
      return { error: 'Diler hisobi mobil ilovada ishlamaydi — veb portaldan kiring' };
    }

    const safe = { ...data.user, password: undefined };
    const st = data.store || null;
    setToken(data.token);
    await loadBranches(data.branch_id ?? tokenBranch(data.token));
    setUser(safe);
    setStore(st);
    await AsyncStorage.setItem(KEY, JSON.stringify({
      user: safe, store: st, token: data.token, branch_id: data.branch_id ?? null,
    }));
    return { user: safe };
  }, [loadBranches]);

  /* Ruxsat tekshiruvi. Egaga hammasi ochiq — do'kon uniki. */
  const can = useCallback((perm) => {
    if (!user) return false;
    const role = user.role;
    if (role === 'owner' || role === 'creator' || role === 'admin') return true;
    const list = Array.isArray(user.permissions) && user.permissions.length
      ? user.permissions
      : CASHIER_PERMS;
    return list.includes(PERM_ALIAS[perm] || perm);
  }, [user]);

  const isOwner = user?.role === 'owner' || user?.role === 'creator' || user?.role === 'admin';

  return (
    <Ctx.Provider value={{
      user, store, loading, signIn, signOut, can, isOwner, refresh, setStore,
      branches, branch, pinnedBranch: pinned, chooseBranch,
      reloadBranches: () => loadBranches(pinned),
      branchInfo: branches.find((b) => b.id === branch) || null,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
