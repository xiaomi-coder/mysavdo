import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_NAV, useTranslation } from '../context/AuthContext';
import { Icon, Btn, Avatar } from './UI';

/* Nocturne sidebar — 236px ochiq, 66px yig'ilgan holatda.
   Aktiv element: akcent rangi + fill ikon, fon yo'q (Nocturne akcentni
   to'ldirish emas, chiziq va belgi sifatida ishlatadi). */

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

export default function Sidebar() {
  const { user, logout, alerts, hasPermission } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('mybazzar_sidebar_collapsed') === '1'
  );

  // Xodimga berilgan ruxsatlarga ko'ra menyu qisqaradi
  /* Menyu roli, ruxsati va do'kon turiga qarab filtrlanadi.
     storeType belgilangan bo'lim faqat o'sha turdagi do'konda ko'rinadi. */
  const nav = (ROLE_NAV[user?.role] || []).filter(i =>
    (!i.perm || hasPermission(i.perm))
    && (!i.storeType || i.storeType === (user?.storeType || 'general')));
  /* Pastdagi ⚙️ — rolning o'z sozlamalar sahifasiga. Creator uchun bu
     /creator/settings, do'kon egasi uchun /settings. Roli sozlamasiz
     bo'lsa (masalan sotuvchi) tugma umuman ko'rsatilmaydi. */
  const settingsPath = nav.find(i => String(i.to).endsWith('settings'))?.to;

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem('mybazzar_sidebar_collapsed', c ? '0' : '1');
      return !c;
    });
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)',
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--color-divider)',
        padding: '14px 10px',
        gap: 4,
        transition: 'width .16s ease',
      }}
    >
      {/* ── Brend ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 10px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          onClick={toggle}
          title={collapsed ? 'Menyuni ochish' : 'Menyuni yig\'ish'}
          style={{
            width: 30, height: 30, flex: 'none', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-accent)', color: 'var(--color-accent)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}
        >
          <Icon name="storefront" fill size={17} />
        </div>
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 15, letterSpacing: '-0.01em' }}>MyBazzar</div>
            {user?.storeName && (
              <div style={{
                fontSize: 10, color: 'var(--color-neutral-500)',
                letterSpacing: '.06em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user.storeName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Menyu ── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {nav.map(item => {
          const count = item.badge ? alerts?.[item.badge] : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/creator'}
              title={t(item.label)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '9px 11px', borderRadius: 'var(--radius-md)',
                fontSize: 14, textDecoration: 'none',
                color: isActive ? 'var(--color-accent)' : 'var(--color-neutral-400)',
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'color .12s ease, background .12s ease',
                position: 'relative',
              })}
              className="nav-item"
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} fill={isActive} size={18} />
                  {!collapsed && <span style={{ flex: 1 }}>{t(item.label)}</span>}
                  {!collapsed && count > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, minWidth: 17, height: 17, padding: '0 5px',
                      borderRadius: 9, display: 'inline-grid', placeItems: 'center',
                      background: 'var(--warnbg)', color: 'var(--warn)',
                    }}>
                      {count}
                    </span>
                  )}
                  {/* Yig'ilgan holatda raqam sig'maydi — nuqta bilan belgilanadi */}
                  {collapsed && count > 0 && (
                    <span style={{
                      position: 'absolute', top: 7, right: 9,
                      width: 7, height: 7, borderRadius: '50%', background: 'var(--warn)',
                    }} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* ── Foydalanuvchi ── */}
      <div
        style={{
          borderTop: '1px solid var(--color-divider)',
          paddingTop: 10,
          display: 'flex', alignItems: 'center', gap: 10,
          paddingLeft: 6, paddingRight: 6,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Avatar initials={initialsOf(user?.name)} size={32} />
        {!collapsed && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{user?.label}</div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {settingsPath && (
                <Btn
                  variant="ghost" iconOnly icon="gear" title="Sozlamalar"
                  onClick={() => navigate(settingsPath)}
                  style={{ width: 30, height: 30, color: 'var(--color-neutral-400)' }}
                />
              )}
              <Btn
                variant="ghost" iconOnly icon="sign-out" title="Chiqish"
                onClick={handleLogout}
                style={{ width: 30, height: 30, color: 'var(--color-neutral-400)' }}
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
