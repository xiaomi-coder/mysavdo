import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_NAV, useTranslation } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nav = ROLE_NAV[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColors = {
    creator: 'linear-gradient(135deg,#F59E0B,#D97706)',
    owner: 'linear-gradient(135deg,#3B82F6,#2563EB)',
    manager: 'linear-gradient(135deg,#10B981,#059669)',
    cashier: 'linear-gradient(135deg,#A78BFA,#7C3AED)',
  };

  const roleBadgeColor = {
    creator: '#F59E0B',
    owner: '#3B82F6',
    manager: '#10B981',
    cashier: '#A78BFA',
  };

  return (
    <aside style={{ width: 224, minWidth: 224, background: 'linear-gradient(180deg, rgba(26, 35, 50, 0.95) 0%, rgba(13, 17, 23, 0.98) 100%)', borderRight: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, zIndex: 10 }}>

      {/* Logo */}
      <div style={{ padding: '18px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="MyBazzar" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', boxShadow: '0 0 18px rgba(59,130,246,0.35)', flexShrink: 0 }} />
          <span style={{ fontSize: 16, fontWeight: 900, background: 'linear-gradient(90deg,#fff,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MyBazzar</span>
        </div>
        {user?.storeName && (
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--t2)', padding: '4px 10px', background: 'var(--s2)', borderRadius: 8, display: 'inline-block' }}>
            🏪 {user.storeName}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/creator'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', margin: '2px 0', borderRadius: 10,
              textDecoration: 'none', fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? roleBadgeColor[user?.role] || '#3B82F6' : 'var(--t2)',
              background: isActive ? (roleBadgeColor[user?.role] || '#3B82F6') + '14' : 'transparent',
              transition: 'all .15s', position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && <div style={{ position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: roleBadgeColor[user?.role] || '#3B82F6', borderRadius: 2 }} />}
                <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{t(item.label)}</span>
                {item.badge && <span style={{ background: '#F43F5E', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20 }}>{item.badge}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="glass" style={{ borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: roleColors[user?.role] || 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, boxShadow: `0 0 12px ${roleBadgeColor[user?.role]}44` }}>
            {user?.icon}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: 10, padding: '2px 6px', background: roleBadgeColor[user?.role] + '22', color: roleBadgeColor[user?.role], borderRadius: 20, display: 'inline-block', fontWeight: 700, marginTop: 2 }}>{user?.label}</div>
          </div>
          <button className="btn-primary" onClick={handleLogout} title="Chiqish" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E', cursor: 'pointer', fontSize: 14, padding: '6px 8px', borderRadius: 8, fontFamily: 'Outfit,sans-serif' }}>↩</button>
        </div>
      </div>
    </aside>
  );
}
