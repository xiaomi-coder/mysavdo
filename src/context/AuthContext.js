import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

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
    permissions: ['dashboard_owner', 'pos', 'inventory', 'employees', 'reports', 'analytics', 'nasiya', 'chek', 'settings', 'finance'],
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
};

export const ROLE_NAV = {
  creator: [
    { to: '/creator', icon: '📊', label: 'dashboard' },
    { to: '/creator/stores', icon: '🏪', label: "Do'konlar" },
    { to: '/creator/users', icon: '👥', label: 'Foydalanuvchilar' },
    { to: '/creator/stats', icon: '📈', label: 'Umumiy Statistika' },
    { to: '/creator/settings', icon: '⚙️', label: 'settings' },
  ],
  owner: [
    { to: '/dashboard', icon: '📊', label: 'dashboard' },
    { to: '/pos', icon: '🛒', label: 'pos' },
    { to: '/inventory', icon: '📦', label: 'inventory', badge: '3' },
    { to: '/nasiya', icon: '💸', label: 'nasiya', badge: '4' },
    { to: '/finance', icon: '💰', label: 'finance' },
    { to: '/customers', icon: '👥', label: 'crm' },
    { to: '/employees', icon: '🧑‍💼', label: 'employees' },
    { to: '/reports', icon: '📈', label: 'reports' },
    { to: '/analytics', icon: '🤖', label: 'aiAnalytics' },
    { to: '/chek', icon: '🖨️', label: 'printer' },
    { to: '/settings', icon: '⚙️', label: 'settings' },
  ],
  manager: [
    { to: '/dashboard', icon: '📊', label: 'dashboard' },
    { to: '/pos', icon: '🛒', label: 'pos' },
    { to: '/inventory', icon: '📦', label: 'inventory', badge: '3' },
    { to: '/nasiya', icon: '💸', label: 'nasiya' },
    { to: '/finance', icon: '💰', label: 'finance' },
    { to: '/reports', icon: '📈', label: 'reports' },
    { to: '/chek', icon: '🖨️', label: 'printer' },
  ],
  cashier: [
    { to: '/pos', icon: '🛒', label: 'pos' },
    { to: '/chek', icon: '🖨️', label: 'printer' },
  ],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tgAlert, setTgAlert] = useState(null);

  // Settings & Offline State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('savdo_settings');
    return saved ? JSON.parse(saved) : { dark: true, notif: true, sms: false, offline: true, twofa: false, isOnline: navigator.onLine, language: 'UZ' };
  });

  useEffect(() => {
    localStorage.setItem('savdo_settings', JSON.stringify(settings));
    if (!settings.dark) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [settings.dark]);

  const [pendingTxns, setPendingTxns] = useState(() => {
    const saved = localStorage.getItem('savdo_pending_txns');
    return saved ? JSON.parse(saved) : [];
  });

  const addPendingTxn = (txn) => {
    setPendingTxns(p => {
      const updated = [...p, txn];
      localStorage.setItem('savdo_pending_txns', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (settings.isOnline && pendingTxns.length > 0) {
      setTimeout(() => {
        setTgAlert(`✅ Sinxronizatsiya qilindi!\nInternet uzilishi vaqtida saqlangan ${pendingTxns.length} ta sotuv bazaga yuborildi.`);
        setPendingTxns([]);
        localStorage.removeItem('savdo_pending_txns');
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

  const toggleSetting = (k) => setSettings(p => ({ ...p, [k]: !p[k] }));

  const [expenses, setExpenses] = useState([
    { id: 1, date: '2026-02-27', cat: 'Kommunal', desc: "Svet uchun to'lov", amount: 150000, cashier: "Jasur Do'kon Egasi" }
  ]);

  const addExpense = (exp) => setExpenses(prev => [...prev, exp]);

  const sendTgAlert = (msg) => {
    setTgAlert(msg);
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, stores(name)')
        .eq('email', email)
        .single();

      if (error || !data) return { error: "Foydalanuvchi topilmadi" };
      if (data.password !== password) return { error: "Parol noto'g'ri" };

      const roleDefaults = ROLES[data.role] || {};
      const finalPermissions = Array.isArray(data.permissions) && data.permissions.length > 0
        ? data.permissions
        : roleDefaults.permissions;

      setUser({
        ...data,
        storeName: data.stores?.name,
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
    <AuthContext.Provider value={{ user, login, logout, hasPermission, sendTgAlert, expenses, addExpense, settings, toggleSetting, addPendingTxn, pendingTxns, setSettings }}>
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
