import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth, useTranslation } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

export default function Topbar() {
  const location = useLocation();
  const { user, pendingTxns } = useAuth();
  const { t } = useTranslation();
  const [showNotif, setShowNotif] = useState(false);
  const [stockAlerts, setStockAlerts] = useState({ out: 0, low: 0 });
  const notifRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (user?.store_id) {
      loadStockAlerts(user.store_id);
    }
  }, [user]);

  const loadStockAlerts = async (storeId) => {
    const { data } = await supabase.from('products').select('stock').eq('store_id', storeId).lte('stock', 10);
    if (data) {
      const out = data.filter(p => p.stock === 0).length;
      const low = data.filter(p => p.stock > 0 && p.stock <= 10).length;
      setStockAlerts({ out, low });
    }
  };

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return `📊 ${t('dashboard')}`;
      case '/pos': return `🛒 ${t('pos')}`;
      case '/inventory': return `📦 ${t('inventory')}`;
      case '/customers': return `👥 ${t('crm')}`;
      case '/nasiya': return `💸 ${t('nasiya')}`;
      case '/finance': return `💰 ${t('finance')}`;
      case '/employees': return `🧑‍💼 ${t('employees')}`;
      case '/reports': return `📈 ${t('reports')}`;
      case '/analytics': return `🤖 ${t('aiAnalytics')}`;
      case '/chek': return `🖨️ ${t('printer')}`;
      case '/settings': return `⚙️ ${t('settings')}`;
      default: return `📊 ${t('dashboard')}`;
    }
  };

  const title = location.pathname.startsWith('/creator') ? '👑 Creator Panel' : getPageTitle(location.pathname);

  // Dynamic Notifications
  const notifs = [];

  if (stockAlerts.out > 0) {
    notifs.push({ icon: '❌', text: `${stockAlerts.out} ta mahsulot tugadi!`, time: 'Hozir', color: '#F43F5E' });
  }
  if (stockAlerts.low > 0) {
    notifs.push({ icon: '⚠️', text: `${stockAlerts.low} ta mahsulot qoldig'i kam (<10)`, time: 'Hozir', color: '#F59E0B' });
  }
  if (pendingTxns?.length > 0) {
    notifs.push({ icon: '📶', text: `${pendingTxns.length} ta sotuv offline xotirada. Internet kutilmoqda.`, time: 'Kutilmoqda', color: '#3B82F6' });
  }

  const hasUnread = notifs.length > 0;

  const roleColors = { creator: '#F59E0B', owner: '#3B82F6', manager: '#10B981', cashier: '#A78BFA' };
  const accent = roleColors[user?.role] || '#3B82F6';

  return (
    <header className="glass" style={{ display: 'flex', alignItems: 'center', padding: '10px 22px', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 14, position: 'sticky', top: 0, zIndex: 100, minHeight: 56 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', flex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{title}</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '7px 13px', backdropFilter: 'blur(4px)' }}>
          <span style={{ fontSize: 13, color: 'var(--t2)' }}>🔍</span>
          <input placeholder={t('search')} style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--t1)', fontSize: 13, fontFamily: 'Outfit,sans-serif', width: 150 }} className="fast-transition" onFocus={(e) => e.target.parentElement.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={(e) => e.target.parentElement.style.borderColor = 'rgba(255,255,255,0.05)'} />
        </div>

        {/* Notif */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="btn-primary" onClick={() => setShowNotif(!showNotif)} style={{ width: 36, height: 36, background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', position: 'relative', color: '#fff' }}>
            🔔
            {hasUnread && <div style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, background: '#F43F5E', borderRadius: '50%', border: '2px solid var(--s1)', animation: 'pulse 2s infinite' }} />}
          </button>
          <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(244,63,94,0.7); } 70% { box-shadow: 0 0 0 4px rgba(244,63,94,0); } 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } }`}</style>
          {showNotif && (
            <div className="glass-card" style={{ position: 'absolute', right: 0, top: 44, width: 320, borderRadius: 14, zIndex: 200, animation: 'slideUp .15s ease-out forwards' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{t('notifications')} {hasUnread && `(${notifs.length})`}</div>
              {notifs.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--t2)', fontSize: 13 }}>Ogohlantirishlar yo'q</div>
              ) : notifs.map((n, i) => (
                <div key={i} style={{ padding: '11px 16px', display: 'flex', gap: 10, borderBottom: i < notifs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 17 }}>{n.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, lineHeight: 1.4, color: '#fff' }}>{n.text}</div>
                    <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <div style={{ padding: '7px 12px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 9, fontSize: 12, color: 'var(--t2)', whiteSpace: 'nowrap' }}>
          📅 {new Date().toLocaleDateString('uz-UZ')}
        </div>

        {/* Role badge */}
        <div style={{ padding: '5px 12px', background: accent + '18', border: `1px solid ${accent}33`, borderRadius: 9, fontSize: 11, fontWeight: 700, color: accent, boxShadow: `0 0 10px ${accent}22` }}>
          {user?.icon} {user?.label}
        </div>
      </div>
    </header>
  );
}
