import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, setAuthToken, setActiveBranch } from '../utils/supabaseClient';
import { isLowStock, isOutOfStock } from '../utils/stock';
import { markUser } from '../utils/errorReport';

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
    { to: '/creator/imei', icon: 'lock-simple', label: 'IMEI Block' },
    { to: '/creator/stats', icon: 'chart-bar', label: 'Umumiy Statistika' },
    { to: '/creator/settings', icon: 'gear', label: 'settings' },
  ],
  owner: [
    { to: '/dashboard', icon: 'squares-four', label: 'dashboard', perm: 'dashboard_owner' },
    { to: '/pos', icon: 'cash-register', label: 'pos', perm: 'pos' },
    { to: '/sales', icon: 'receipt', label: 'Sotuvlar tarixi', perm: 'pos' },
    { to: '/inventory', icon: 'package', label: 'inventory', badge: 'lowStock', perm: 'inventory' },
    { to: '/kirim', icon: 'truck', label: 'Ommaviy kirim', perm: 'inventory' },
    { to: '/suppliers', icon: 'handshake', label: 'Ta’minotchilar', perm: 'inventory' },
    { to: '/customers', icon: 'users-three', label: 'crm', perm: 'crm' },
    { to: '/orders', icon: 'shopping-bag', label: 'Buyurtmalar', badge: 'newOrders', perm: 'crm' },
    { to: '/nasiya', icon: 'hand-coins', label: 'nasiya', badge: 'urgentDebts', perm: 'nasiya' },
    // Faqat telefon do'konida — IMEI/qulflash oddiy do'konga keraksiz
    { to: '/credit', icon: 'lock-simple', label: 'Kredit telefonlar', perm: 'nasiya', storeType: 'phone' },
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
    { to: '/sales', icon: 'receipt', label: 'Sotuvlar tarixi', perm: 'pos' },
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

  /* ── Filiallar ─────────────────────────────────────────────────────────
     activeBranch: filial id yoki 'all' (barcha filiallar). Sotuvchi
     filialga biriktirilgan bo'lsa (pinnedBranch) — o'zgartira olmaydi.
     Tanlov do'kon bo'yicha eslab qolinadi. */
  const [branches, setBranches] = useState([]);
  const [activeBranch, setActive] = useState(null);
  const [pinnedBranch, setPinned] = useState(null);

  const chooseBranch = useCallback((b, storeId) => {
    setActive(b);
    setActiveBranch(b);
    try { if (storeId) localStorage.setItem(`mb_branch_${storeId}`, String(b)); } catch (_) { /* yopiq */ }
  }, []);

  const loadBranches = useCallback(async (storeId, pin) => {
    const { data } = await supabase.from('branches').select('*')
      .eq('is_active', true).order('is_main', { ascending: false }).order('id');
    const list = data || [];
    setBranches(list);
    setPinned(pin || null);
    if (pin) { chooseBranch(pin, null); return list; }
    let saved = null;
    try { saved = localStorage.getItem(`mb_branch_${storeId}`); } catch (_) { /* yopiq */ }
    const valid = saved === 'all' ? list.length > 1 : list.some(b => String(b.id) === saved);
    chooseBranch(valid ? (saved === 'all' ? 'all' : Number(saved)) : (list[0]?.id ?? null), storeId);
    return list;
  }, [chooseBranch]);
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

  /* Oflayn sotuvlarni bazaga yuborish. Ilgari bu yerda faqat navbat
     tozalanib "yuborildi" deyilardi — sotuvlar aslida yo'qolardi.
     Endi har biri alohida yoziladi va ombordan yechiladi; o'tmaganlari
     navbatda qoladi (masalan qoldiq yetmasa) va keyingi safar qayta
     urinib ko'riladi. Token bo'lmasa (tizimdan chiqilgan) kutadi. */
  const syncing = React.useRef(false);
  const attempted = React.useRef('');   // o'tmagan navbat bilan qayta-qayta urinmaslik uchun
  useEffect(() => {
    if (!settings.isOnline) { attempted.current = ''; return; }   // internet qaytganda yana urinadi
    if (!user?.store_id || pendingTxns.length === 0 || syncing.current) return;
    const key = pendingTxns.map(p => p.id).join(',');
    if (key === attempted.current) return;
    attempted.current = key;
    syncing.current = true;
    (async () => {
      const left = [];
      let sent = 0;
      let lastErr = '';
      for (const p of pendingTxns) {
        const { data: txn, error } = await supabase.from('transactions').insert({
          store_id: p.store_id || user.store_id,
          customer_id: p.customer_id || null,
          receipt_no: p.receipt_no || `#OF-${p.id}`,
          cashier: p.cashier || user.name,
          items: p.items, total: p.total, discount: p.discount || 0,
          payment_method: p.method, status: 'completed',
          date: p.time,
          shift_id: p.shift_id ?? null,
          branch_id: p.branch_id ?? null,
        }).select().single();
        if (error) { left.push(p); lastErr = error.message; continue; }
        const { error: stockErr } = await supabase.rpc('apply_sale', { p_txn: txn.id, p_actor: p.cashier || user.name });
        if (stockErr) {
          await supabase.from('transactions').delete().eq('id', txn.id);
          left.push(p); lastErr = stockErr.message; continue;
        }
        if (p.method === 'nasiya' && p.customer_id) {
          const due = new Date(p.time);
          due.setDate(due.getDate() + (parseInt(p.due_days, 10) || 30));
          const paid = Number(p.paid) || 0;
          await supabase.from('debts').insert({
            store_id: p.store_id || user.store_id, customer_id: p.customer_id,
            client: p.customer_name || '', phone: p.customer_phone || '',
            amount: p.total, paid_amount: paid, due_date: due.toISOString(),
            status: paid >= p.total ? "To'landi" : "To'lanmagan",
          });
        }
        if (p.customer_id) await supabase.rpc('increment_customer_spent', { cid: p.customer_id, amnt: p.total });
        sent += 1;
      }
      // Sinxronlash davomida yangi oflayn sotuv qo'shilgan bo'lishi mumkin
      setPendingTxns(cur => {
        const rest = [...left, ...cur.filter(c => !pendingTxns.some(p => p.id === c.id))];
        localStorage.setItem('mybazzar_pending_txns', JSON.stringify(rest));
        // Faqat o'tmaganlar qolsa — shu tarkib bilan qayta urinilmaydi
        attempted.current = left.map(p => p.id).join(',');
        return rest;
      });
      if (left.length > 0) setTgAlert(`⚠️ ${left.length} ta oflayn sotuv yuborilmadi: ${lastErr}. Keyinroq qayta urinadi.`);
      else if (sent > 0) setTgAlert(`✅ Internet uzilganda saqlangan ${sent} ta sotuv bazaga yuborildi.`);
      syncing.current = false;
    })();
  }, [settings.isOnline, pendingTxns, user]);

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

  /* Login SERVERDA tekshiriladi (login() funksiyasi). Ilgari parol
     bazadan brauzerga olinib shu yerda solishtirilardi — ya'ni har
     kim hamma parolni ko'ra olardi. Endi server faqat token va
     parolsiz foydalanuvchi ma'lumotini qaytaradi. */
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.rpc('login', {
        p_email: String(email || '').trim(),
        p_password: password,
      });
      if (error) {
        // Server xabari foydalanuvchi uchun yozilgan (o'zbekcha)
        return { error: error.message || "Tizimga kirishda xatolik yuz berdi" };
      }

      setAuthToken(data.token);
      const u = data.user || {};

      if (u.type === 'dealer') {
        setUser({
          ...u,
          role: 'dealer',
          store_id: u.store_id,
          storeType: 'general',
          icon: ROLES.dealer.icon,
          color: ROLES.dealer.color,
          label: u.shop_name || u.name,
          permissions: ROLES.dealer.permissions,
        });
        return { success: true };
      }

      const roleDefaults = ROLES[u.role] || {};
      const finalPermissions = Array.isArray(u.permissions) && u.permissions.length > 0
        ? u.permissions
        : roleDefaults.permissions;

      if (u.store_id) await loadBranches(u.store_id, data.branch_id);

      // Xato yuborilsa qaysi do'konda bo'lganini bilaylik
      markUser({ id: u.id, store_id: u.store_id, storeName: data.store?.name, role: u.role });

      setUser({
        ...u,
        stores: data.store,
        storeName: data.store?.name,
        storeType: data.store?.store_type || 'general',
        storeSlug: data.store?.slug,
        icon: roleDefaults.icon,
        color: roleDefaults.color,
        label: roleDefaults.label,
        permissions: finalPermissions,
      });
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { error: 'Tizimga kirishda xatolik yuz berdi' };
    }
  };

  const logout = () => {
    markUser(null);
    setAuthToken(null); setActiveBranch(null);
    setBranches([]); setActive(null); setPinned(null);
    setUser(null);
  };
  const hasPermission = (perm) => user?.permissions?.includes(perm);

  return (
    <AuthContext.Provider value={{
      user, login, logout, hasPermission, sendTgAlert, settings, toggleSetting, addPendingTxn,
      pendingTxns, setSettings, alerts, refreshAlerts,
      branches, activeBranch, pinnedBranch,
      chooseBranch: (b) => chooseBranch(b, user?.store_id),
      reloadBranches: () => loadBranches(user?.store_id, pinnedBranch),
    }}>
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
