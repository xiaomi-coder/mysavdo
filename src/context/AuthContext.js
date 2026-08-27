import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { isLowStock, isOutOfStock } from '../utils/stock';

// Simulated Telegram Toast for global use
function TelegramToast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, background: '#2AABEE', color: '#fff', padding: '12px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, zIndex: 99999, boxShadow: '0 10px 30px rgba(42,171,238,0.3)', animation: 'slideDown .4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
      <style>{`@keyframes slideDown { 0% { transform: translateY(-50px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={{ width: 32, height: 32, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✈️</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.9, letterSpacing: .5 }}>Telegram Bot Bot</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, whiteSpace: 'pre-wrap' }}>{msg}</div>
      </div>
    </div>
  );
}

const AuthContext = createContext(null);

export const ROLES = {
  creator: {
    label: 'Creator',
    icon: '👑',
    color: '#F59E0B',
    permissions: ['dashboard_creator', 'stores', 'all_stats', 'create_owner'],
  },
  owner: {
    label: "Do'kon Egasi",
    icon: '🏪',
    color: '#3B82F6',
    permissions: ['dashboard_owner', 'pos', 'inventory', 'crm', 'employees', 'reports', 'analytics', 'nasiya', 'chek', 'settings', 'finance'],
  },
  manager: {
    label: 'Manager',
    icon: '📦',
    color: '#10B981',
    permissions: ['dashboard_owner', 'pos', 'inventory', 'nasiya', 'reports', 'chek', 'finance'],
  },
  cashier: {
    label: 'Kassir',
    icon: '💳',
    color: '#A78BFA',
    permissions: ['pos', 'chek'],
  },
  dealer: {
    label: "Do'kondor (Diler)",
    icon: '🤝',
    color: '#F59E0B',
    permissions: ['dealer_dashboard'],
  },
};

/* Sidebar menyusi — ikonlar Phosphor nomlari (index.js da ulangan).
   `badge` — jonli hisoblagich kaliti, AuthContext.alerts dan o'qiladi. */
export const ROLE_NAV = {
  creator: [
    { to: '/creator', icon: 'squares-four', label: 'dashboard' },
    { to: '/creator/stores', icon: 'storefront', label: "Do'konlar" },
    { to: '/creator/users', icon: 'users-three', label: 'Foydalanuvchilar' },
    { to: '/creator/stats', icon: 'chart-bar', label: 'Umumiy Statistika' },
    { to: '/creator/settings', icon: 'gear', label: 'settings' },
  ],
  owner: [
    { to: '/dashboard', icon: 'squares-four', label: 'dashboard', perm: 'dashboard_owner' },
    { to: '/pos', icon: 'cash-register', label: 'pos', perm: 'pos' },
    { to: '/inventory', icon: 'package', label: 'inventory', badge: 'lowStock', perm: 'inventory' },
    { to: '/customers', icon: 'users-three', label: 'crm', perm: 'crm' },
    { to: '/orders', icon: 'shopping-bag', label: 'Buyurtmalar', badge: 'newOrders', perm: 'crm' },
    { to: '/nasiya', icon: 'hand-coins', label: 'nasiya', badge: 'urgentDebts', perm: 'nasiya' },
    { to: '/finance', icon: 'wallet', label: 'finance', perm: 'finance' },
    { to: '/reports', icon: 'chart-bar', label: 'reports', perm: 'reports' },
    { to: '/analytics', icon: 'sparkle', label: 'aiAnalytics', perm: 'analytics' },
    { to: '/employees', icon: 'identification-badge', label: 'employees', perm: 'employees' },
    { to: '/chek', icon: 'printer', label: 'printer', perm: 'chek' },
    { to: '/settings', icon: 'gear', label: 'settings', perm: 'settings' },
  ],
  manager: [
    { to: '/dashboard', icon: 'squares-four', label: 'dashboard', perm: 'dashboard_owner' },
    { to: '/pos', icon: 'cash-register', label: 'pos', perm: 'pos' },
    { to: '/inventory', icon: 'package', label: 'inventory', badge: 'lowStock', perm: 'inventory' },
    { to: '/nasiya', icon: 'hand-coins', label: 'nasiya', badge: 'urgentDebts', perm: 'nasiya' },
    { to: '/finance', icon: 'wallet', label: 'finance', perm: 'finance' },
    { to: '/reports', icon: 'chart-bar', label: 'reports', perm: 'reports' },
    { to: '/chek', icon: 'printer', label: 'printer', perm: 'chek' },
  ],
  cashier: [
    { to: '/pos', icon: 'cash-register', label: 'pos', perm: 'pos' },
    { to: '/chek', icon: 'printer', label: 'printer', perm: 'chek' },
  ],
  dealer: [
    { to: '/dealer', icon: 'squares-four', label: 'Mening Profilim' },
  ],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tgAlert, setTgAlert] = useState(null);

  // Settings & Offline State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('mybazzar_settings');
    return saved ? JSON.parse(saved) : { dark: true, notif: true, sms: false, offline: true, twofa: false, isOnline: navigator.onLine, language: 'UZ' };
  });

  useEffect(() => {
    localStorage.setItem('mybazzar_settings', JSON.stringify(settings));
    if (!settings.dark) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [settings.dark]);

  const [pendingTxns, setPendingTxns] = useState(() => {
    const saved = localStorage.getItem('mybazzar_pending_txns');
    return saved ? JSON.parse(saved) : [];
  });

  const addPendingTxn = (txn) => {
    setPendingTxns(p => {
      const updated = [...p, txn];
      localStorage.setItem('mybazzar_pending_txns', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (settings.isOnline && pendingTxns.length > 0) {
      setTimeout(() => {
        setTgAlert(`✅ Sinxronizatsiya qilindi!\nInternet uzilishi vaqtida saqlangan ${pendingTxns.length} ta sotuv bazaga yuborildi.`);
        setPendingTxns([]);
        localStorage.removeItem('mybazzar_pending_txns');
      }, 2000);
    }
  }, [settings.isOnline, pendingTxns]);

  useEffect(() => {
    const handleOnline = () => { setSettings(p => ({ ...p, isOnline: true })); setTgAlert('🌐 Internet ulandi! Tizim onlayn rejimda.'); };
    const handleOffline = () => { setSettings(p => ({ ...p, isOnline: false })); setTgAlert('⚠️ Internet uzildi! Offline rejim faollashdi. Barcha sotuvlar xavfsiz saqlanadi.'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  /* ── Jonli ogohlantirishlar ────────────────────────────────────────────
     Sidebar badge'lari, Topbar bildirishnomalari va Dashboard'ning
     "E'tibor talab qiladi" paneli — hammasi shu bitta so'rovdan oziqlanadi,
     har biri alohida so'rov yubormasligi uchun. */
  const [alerts, setAlerts] = useState({
    outOfStock: 0, lowStock: 0, urgentDebts: 0, overdueDebts: 0, overdueAmount: 0,
    newOrders: 0, outOfStockNames: [], lowStockNames: [],
  });

  const refreshAlerts = useCallback(async () => {
    if (!user?.store_id) return;
    const [prodRes, debtRes, orderRes] = await Promise.all([
      supabase.from('products').select('name, stock, minStock, phone_imei1, phone_serial').eq('store_id', user.store_id),
      supabase.from('debts').select('due_date, date, amount, paid_amount').eq('store_id', user.store_id).eq('status', "To'lanmagan"),
      supabase.from('transactions').select('id', { count: 'exact', head: true })
        .eq('store_id', user.store_id).eq('status', 'online_pending'),
    ]);

    const prods = prodRes.data || [];
    // Qoida utils/stock.js da — noyob IMEI li tovar 1 dona bo'lsa
    // bu normal holat, ogohlantirish emas
    const out = prods.filter(isOutOfStock);
    const low = prods.filter(isLowStock);

    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const debts = (debtRes.data || []).map(d => {
      const due = d.due_date ? new Date(d.due_date) : new Date(new Date(d.date).getTime() + 30 * 24 * 60 * 60 * 1000);
      return { due: due.getTime(), rest: Number(d.amount || 0) - Number(d.paid_amount || 0) };
    });
    const overdue = debts.filter(d => d.due < now);

    setAlerts({
      outOfStock: out.length,
      lowStock: low.length,
      urgentDebts: debts.filter(d => d.due - now <= week).length,
      newOrders: orderRes.count || 0,
      overdueDebts: overdue.length,
      overdueAmount: overdue.reduce((s, d) => s + d.rest, 0),
      outOfStockNames: out.slice(0, 5).map(p => p.name),
      lowStockNames: low.slice(0, 5).map(p => `${p.name} — ${p.stock} dona`),
    });
  }, [user]);

  useEffect(() => { refreshAlerts(); }, [refreshAlerts]);

  const toggleSetting = (k) => setSettings(p => ({ ...p, [k]: !p[k] }));

  const sendTgAlert = (msg) => {
    setTgAlert(msg);
  };

  const login = async (email, password) => {
    try {
      // Birinchi users dan qidiramiz
      let { data, error } = await supabase
        .from('users')
        .select('*, stores(name, store_type, slug)')
        .eq('email', email)
        .single();

      if (error || !data) {
        // Agar users dan topilmasa, customers (diler) dan login orqali qidiramiz
        const { data: dData, error: dErr } = await supabase
          .from('customers')
          .select('*')
          .eq('login', email)
          .eq('type', 'dealer')
          .single();

        if (!dErr && dData) {
          // Bu diler! Parolini tekshiramiz
          if (dData.password !== password) return { error: "Parol noto'g'ri" };

          // Diler do'koni nomlarini to'g'ridan to'g'ri o'zida saqlaydi (shop_name) 
          // yoki unga ulangan do'konni o'qib olishi mumkin. Vaqtincha general nomi
          setUser({
            ...dData,
            role: 'dealer',
            store_id: dData.store_id, // Bu muhim, shu orqali u katta do'kon hamma tovarini ko'radi
            storeType: 'general',
            icon: ROLES['dealer'].icon,
            color: ROLES['dealer'].color,
            label: dData.shop_name || dData.name,
            permissions: ROLES['dealer'].permissions
          });
          return { success: true };
        }

        // Fallback for demo accounts if DB is empty
        if (email === 'owner@mybazzar.uz' && password === 'owner123') {
          setUser({ id: 'demo1', email, role: 'owner', name: 'Demo Egasi', storeName: "Demo Do'kon", icon: '🏪', color: '#3B82F6', label: "Do'kon Egasi", permissions: ROLES['owner'].permissions, store_id: 'demo-store-1' });
          return { success: true };
        }
        if (email === 'manager@mybazzar.uz' && password === 'manager123') {
          setUser({ id: 'demo2', email, role: 'manager', name: 'Demo Manager', storeName: "Demo Do'kon", icon: '📦', color: '#10B981', label: 'Manager', permissions: ROLES['manager'].permissions, store_id: 'demo-store-1' });
          return { success: true };
        }
        if (email === 'kassir@mybazzar.uz' && password === 'kassir123') {
          setUser({ id: 'demo3', email, role: 'cashier', name: 'Demo Kassir', storeName: "Demo Do'kon", icon: '💳', color: '#A78BFA', label: 'Kassir', permissions: ROLES['cashier'].permissions, store_id: 'demo-store-1' });
          return { success: true };
        }
        return { error: "Login yoki Email topilmadi" };
      }
      if (data.password !== password) return { error: "Parol noto'g'ri" };

      // Xodimlar sahifasidan o'chirilgan hisob tizimga kira olmaydi
      if (data.is_active === false) {
        return { error: "Sizning hisobingiz vaqtincha to'xtatilgan. Do'kon egasiga murojaat qiling." };
      }

      // Block if store is inactive
      if (data.role !== 'creator' && data.stores && data.stores.is_active === false) {
        return { error: "Sizning do'koningiz faoliyati to'xtatilgan. Iltimos, ma'muriyat bilan bog'laning." };
      }

      const roleDefaults = ROLES[data.role] || {};
      const finalPermissions = Array.isArray(data.permissions) && data.permissions.length > 0
        ? data.permissions
        : roleDefaults.permissions;

      setUser({
        ...data,
        storeName: data.stores?.name,
        storeType: data.stores?.store_type || 'general',
        storeSlug: data.stores?.slug,
        icon: roleDefaults.icon,
        color: roleDefaults.color,
        label: roleDefaults.label,
        permissions: finalPermissions
      });
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { error: "Tizimga kirishda xatolik yuz berdi" };
    }
  };

  const logout = () => setUser(null);
  const hasPermission = (perm) => user?.permissions?.includes(perm);

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, sendTgAlert, settings, toggleSetting, addPendingTxn, pendingTxns, setSettings, alerts, refreshAlerts }}>
      {children}
      {tgAlert && <TelegramToast msg={tgAlert} onClose={() => setTgAlert(null)} />}
    </AuthContext.Provider>
  );
}

import { translations } from '../utils/i18n';
export const useTranslation = () => {
  const { settings } = useAuth();
  const lang = settings?.language || 'UZ';

  const t = (key) => {
    return translations[lang][key] || key;
  };
  return { t, lang };
};

export const useAuth = () => useContext(AuthContext);
