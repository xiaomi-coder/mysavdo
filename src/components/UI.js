import React from 'react';

/* ══════════════════════════════════════════════════════════════════════════
   MyBazzar UI — Nocturne dizayn tizimi komponentlari.

   Qoida: bu yerda ham hex/px yozilmaydi — hamma narsa index.css dagi
   klasslar va var(--*) tokenlar orqali keladi.

   Eskicha API (Badge, emoji ikonlar, variant="green" va h.k.) hali
   ko'chirilmagan sahifalar ishlashi uchun vaqtincha qo'llab-quvvatlanadi.
   ══════════════════════════════════════════════════════════════════════ */

// ── ICON ──────────────────────────────────────────────────────────────
// Phosphor ikonlari: <Icon name="storefront" /> yoki <Icon name="warning" fill />
export function Icon({ name, fill = false, size, color, style, className = '' }) {
  if (!name) return null;
  // Emoji yoki oldindan tayyor element bo'lsa — o'zini qaytaramiz (eski sahifalar uchun)
  if (typeof name !== 'string' || !/^[a-z0-9-]+$/.test(name)) {
    return <span style={{ fontSize: size, ...style }}>{name}</span>;
  }
  return (
    <i
      className={`${fill ? 'ph-fill' : 'ph'} ph-${name} ${className}`}
      style={{ fontSize: size, color, flex: 'none', ...style }}
    />
  );
}

// ── BUTTON ────────────────────────────────────────────────────────────
const BTN_VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  success: 'btn-success',
  // eski nomlar
  green: 'btn-success',
  subtle: 'btn-secondary',
};

export function Btn({
  children, variant = 'primary', size = 'md', onClick, disabled,
  icon, iconFill, loading, block, iconOnly, type = 'button',
  style, className = '', title,
}) {
  const cls = [
    'btn',
    BTN_VARIANTS[variant] || BTN_VARIANTS.primary,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    block ? 'btn-block' : '',
    iconOnly ? 'btn-icon' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled || loading} style={style} title={title}>
      {loading
        ? <span className="spinner" />
        : icon && <Icon name={icon} fill={iconFill} size={size === 'sm' ? 14 : 15} />}
      {children}
    </button>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────
export function Card({ children, elev = 'sm', padding, gap, style, className = '' }) {
  return (
    <div
      className={`card ${elev ? `elev-${elev}` : ''} ${className}`}
      style={{ padding, gap, ...style }}
    >
      {children}
    </div>
  );
}

// ── SECTION HEADER (karta ichidagi sarlavha + o'ng amallar) ───────────
export function SectionHeader({ title, hint, children, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)', ...style }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      {hint && <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{hint}</div>}
      {children && <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>{children}</div>}
    </div>
  );
}

// ── PAGE (sahifa konteyneri — dizayndagi main o'lchamlari) ────────────
export function Page({ children, style }) {
  return (
    <div style={{ padding: '22px 24px 28px', display: 'flex', flexDirection: 'column', gap: 18, ...style }}>
      {children}
    </div>
  );
}

// ── PAGE HEADER (sahifa sarlavhasi + tavsif + amallar) ────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-6)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: '0 0 2px' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ── TAG ───────────────────────────────────────────────────────────────
const TAG_VARIANTS = {
  ok: 'tag-ok', warn: 'tag-warn', dang: 'tag-dang', info: 'tag-info',
  accent: 'tag-accent', neutral: 'tag-neutral', outline: 'tag-outline',
  // eski nomlar
  success: 'tag-ok', warning: 'tag-warn', danger: 'tag-dang', purple: 'tag-accent',
};

export function Tag({ children, variant = 'neutral', icon, iconFill, style }) {
  return (
    <span className={`tag ${TAG_VARIANTS[variant] || 'tag-neutral'}`} style={style}>
      {icon && <Icon name={icon} fill={iconFill} size={12} />}
      {children}
    </span>
  );
}

// Eski API — <Badge type="success">…</Badge>
export function Badge({ type = 'info', children }) {
  return <Tag variant={type}>{children}</Tag>;
}

// ── STAT CARD (KPI) ───────────────────────────────────────────────────
// Yangi API:  <StatCard icon="money" label="Jami sotuv" value="12 850 000" unit="so'm"
//                       trend={{ value: '+12.5%', dir: 'up' }} hint="kechaga nisbatan" />
// Eski API:   <StatCard icon="💰" value={…} label="…" change="12%" changeType="up" accent="#…" />
export function StatCard({ icon, label, value, unit, trend, hint, change, changeType, accent, onClick, active }) {
  // eski `change`/`changeType` ni yangi `trend` ga o'giramiz
  const t = trend || (change ? { value: change, dir: changeType === 'down' ? 'down' : 'up' } : null);
  const up = t && t.dir !== 'down';

  return (
    <div
      className="card elev-sm"
      onClick={onClick}
      style={{
        padding: 'var(--space-6)',
        gap: 10,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: active ? '0 0 0 1px var(--color-accent)' : undefined,
        transition: 'box-shadow .12s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-neutral-500)' }}>
        {icon && <Icon name={icon} size={16} color={accent || 'var(--color-accent)'} />}
        {label}
      </div>
      <div className="num" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
        {value}
        {unit && <span style={{ fontSize: 13, color: 'var(--color-neutral-500)', fontWeight: 400 }}> {unit}</span>}
      </div>
      {t && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '2px 7px', borderRadius: 'var(--radius-sm)', fontWeight: 500,
              background: up ? 'var(--okbg)' : 'var(--dangbg)',
              color: up ? 'var(--ok)' : 'var(--dang)',
            }}
          >
            <Icon name={up ? 'trend-up' : 'trend-down'} size={12} />
            {t.value}
          </span>
          {hint && <span style={{ color: 'var(--color-neutral-500)' }}>{hint}</span>}
        </div>
      )}
    </div>
  );
}

// ── FIELD + INPUT ─────────────────────────────────────────────────────
export function Field({ label, error, hint, children, style }) {
  return (
    <div className={`field ${error ? 'field-error' : ''}`} style={style}>
      {label && <label>{label}</label>}
      {children}
      {(error || hint) && <div className="input-hint">{error || hint}</div>}
    </div>
  );
}

export function Input({
  label, value, onChange, placeholder, type = 'text', icon, error, hint,
  disabled, autoFocus, onKeyDown, inputMode, maxLength, readOnly, mono, style, inputStyle,
}) {
  const input = (
    <input
      className={`input ${mono ? 'mono' : ''}`}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      inputMode={inputMode}
      maxLength={maxLength}
      readOnly={readOnly}
      style={inputStyle}
    />
  );

  return (
    <Field label={label} error={error} hint={hint} style={style}>
      {icon
        ? <div className="input-icon"><Icon name={icon} />{input}</div>
        : input}
    </Field>
  );
}

// ── SEGMENTED CONTROL ─────────────────────────────────────────────────
// <Seg options={[{value:'today',label:'Bugun'}]} value={v} onChange={setV} />
export function Seg({ options, value, onChange, style }) {
  return (
    <div className="seg" style={style}>
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          className="seg-opt"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={14} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── AVATAR ────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 32, color, style }) {
  return (
    <div
      style={{
        width: size, height: size, flex: 'none', borderRadius: '50%',
        background: color || 'var(--color-accent-800)',
        color: color ? 'var(--color-neutral-100)' : 'var(--color-accent-200)',
        display: 'grid', placeItems: 'center',
        fontSize: Math.round(size * 0.38), fontWeight: 600,
        ...style,
      }}
    >
      {initials}
    </div>
  );
}

// Reyting/tartib raqami uchun kvadrat nishon (Top mahsulotlar ro'yxati)
export function RankBadge({ n, size = 22 }) {
  const first = Number(n) === 1;
  return (
    <span
      style={{
        width: size, height: size, flex: 'none',
        borderRadius: 'var(--radius-sm)', display: 'grid', placeItems: 'center',
        fontSize: 11, fontWeight: 600,
        background: first ? 'var(--color-accent-800)' : 'var(--color-neutral-800)',
        color: first ? 'var(--color-accent-200)' : 'var(--color-neutral-200)',
      }}
    >
      {n}
    </span>
  );
}

// ── ROW LINK (E'tibor talab qiladi kabi ro'yxat qatorlari) ────────────
export function RowLink({ icon, iconFill, iconColor, title, sub, onClick, right }) {
  return (
    <button type="button" className="row-link" onClick={onClick}>
      {icon && <Icon name={icon} fill={iconFill} size={17} color={iconColor} />}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13 }}>{title}</span>
        {sub && <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-500)' }}>{sub}</span>}
      </span>
      {right || <Icon name="caret-right" size={13} color="var(--color-neutral-600)" />}
    </button>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose, wide, actions }) {
  React.useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className={`dialog ${wide ? 'dialog-wide' : ''}`} role="dialog" aria-modal="true">
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <h2 className="dialog-title">{title}</h2>
            <Btn variant="ghost" iconOnly icon="x" onClick={onClose} title="Yopish" />
          </div>
        )}
        <div className="dialog-body">{children}</div>
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </div>
  );
}

// ── GLOBAL HOLATLAR ───────────────────────────────────────────────────

export function EmptyState({ icon = 'package', text, sub, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8, padding: 'var(--space-8)', textAlign: 'center',
    }}>
      <Icon name={icon} size={26} color="var(--color-neutral-600)" />
      <div style={{ fontSize: 13 }}>{text}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>{sub}</div>}
      {action}
    </div>
  );
}

export function ErrorState({ text = "Ma'lumot yuklanmadi", sub = 'Internet aloqasini tekshirib, qayta urinib ko\'ring.', onRetry }) {
  return (
    <div className="card elev-sm" style={{ flexDirection: 'row', gap: 11, alignItems: 'flex-start', padding: 'var(--space-4)' }}>
      <Icon name="warning-circle" fill size={18} color="var(--dang)" style={{ marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{text}</div>
        <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>{sub}</div>
      </div>
      {onRetry && <Btn variant="ghost" size="sm" onClick={onRetry}>Qayta urinish</Btn>}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 12, style }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

export function SkeletonRows({ count = 3, widths = ['60%', '85%', '45%'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────
export function Toast({ message, variant = 'ok', onClose, duration = 3500 }) {
  const map = { ok: ['check-circle', 'var(--ok)'], dang: ['warning-circle', 'var(--dang)'], warn: ['warning', 'var(--warn)'], info: ['info', 'var(--info)'] };
  const [icon, color] = map[variant] || map.ok;

  // O'zi yo'qoladi — chaqiruvchi har safar taymer yozib o'tirmasligi uchun
  React.useEffect(() => {
    if (!onClose || !duration) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration, message]);
  return (
    <div
      className="card elev-md"
      style={{
        position: 'fixed', bottom: 'var(--space-8)', right: 'var(--space-8)', zIndex: 9999,
        flexDirection: 'row', alignItems: 'center', gap: 11, padding: '12px 14px',
        minWidth: 260, animation: 'slide-in-right .18s ease-out',
      }}
    >
      <Icon name={icon} fill size={18} color={color} />
      <div style={{ flex: 1, fontSize: 13 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--color-neutral-600)', padding: 0, display: 'grid' }}
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}
