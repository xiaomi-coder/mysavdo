import React from 'react';

// ── CARD ──────────────────────────────────────────
export function Card({ children, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

// ── BADGE ─────────────────────────────────────────
export function Badge({ type = 'info', children }) {
  const colors = {
    success: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    danger: { bg: 'rgba(244,63,94,0.12)', color: '#F43F5E' },
    warning: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    info: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
    purple: { bg: 'rgba(167,139,250,0.12)', color: '#A78BFA' },
  };
  const s = colors[type] || colors.info;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color,
    }}>
      {children}
    </span>
  );
}

// ── STAT CARD ─────────────────────────────────────
export function StatCard({ icon, value, label, change, changeType = 'up', accent = '#3B82F6' }) {
  return (
    <div className="glass-card" style={{
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 4,
      cursor: 'default', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: accent, opacity: 0.06,
      }} />
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: accent + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, marginBottom: 10,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{label}</div>
      {change && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 11, fontWeight: 600,
          padding: '3px 8px', borderRadius: 20, marginTop: 6, width: 'fit-content',
          background: changeType === 'up' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
          color: changeType === 'up' ? '#10B981' : '#F43F5E',
        }}>
          {changeType === 'up' ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
  );
}

// ── BUTTON ────────────────────────────────────────
export function Btn({ children, variant = 'primary', onClick, disabled, style, size = 'md', className = '' }) {
  const base = {
    border: 'none', borderRadius: 12, fontFamily: 'Outfit, sans-serif',
    fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all .15s cubic-bezier(0.4, 0, 0.2, 1)', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', gap: 6,
    opacity: disabled ? 0.45 : 1,
    ...(size === 'sm' ? { padding: '8px 14px', fontSize: 12 }
      : size === 'lg' ? { padding: '15px 28px', fontSize: 16 }
        : { padding: '11px 20px', fontSize: 13 }),
  };
  const variants = {
    primary: { background: 'linear-gradient(135deg,#3B82F6,#2563EB)', color: '#fff', boxShadow: '0 4px 16px rgba(59,130,246,0.28)' },
    green: { background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', boxShadow: '0 4px 16px rgba(16,185,129,0.28)' },
    danger: { background: 'linear-gradient(135deg,#F43F5E,#E11D48)', color: '#fff', boxShadow: '0 4px 16px rgba(244,63,94,0.2)' },
    ghost: { background: 'transparent', color: 'var(--t2)', border: '1px solid rgba(255,255,255,0.1)' },
    subtle: { background: 'rgba(255,255,255,0.03)', color: 'var(--t2)', border: '1px solid rgba(255,255,255,0.06)' },
  };

  // Decide if it should have hover effects based on variant
  const hoverClass = ['primary', 'green', 'danger'].includes(variant) ? 'btn-primary' : 'fast-transition';

  return (
    <button
      className={`${hoverClass} ${className}`}
      style={{ ...base, ...variants[variant], ...style }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={variant === 'ghost' || variant === 'subtle' ? e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)' : undefined}
      onMouseLeave={variant === 'ghost' ? e => e.currentTarget.style.background = 'transparent' : variant === 'subtle' ? e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)' : undefined}
    >
      {children}
    </button>
  );
}

// ── INPUT ─────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type = 'text', icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: .8 }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--t2)' }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="fast-transition"
          style={{
            width: '100%',
            padding: icon ? '12px 14px 12px 38px' : '12px 14px',
            background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10, color: 'var(--t1)',
            fontSize: 14, fontFamily: 'Outfit, sans-serif',
            outline: 'none', backdropFilter: 'blur(4px)',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
        />
      </div>
    </div>
  );
}

// ── AVATAR ────────────────────────────────────────
export function Avatar({ initials, color = '#3B82F6', size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, flexShrink: 0,
      color: '#fff',
    }}>
      {initials}
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────
export function SectionHeader({ title, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
      <div style={{ display: 'flex', gap: 8 }}>{children}</div>
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────
export function EmptyState({ icon, text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 20px', color: 'var(--t2)' }}>
      <span style={{ fontSize: 40 }}>{icon}</span>
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  );
}
