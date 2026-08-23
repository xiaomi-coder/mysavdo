import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useTranslation } from '../context/AuthContext';
import { Icon, Btn, Avatar } from './UI';

/* Nocturne topbar — qidiruv, sinxronlash holati, sana, bildirishnomalar,
   foydalanuvchi. Sahifa sarlavhasi bu yerda emas: har sahifa o'zining
   PageHeader ini chizadi (dizayndagidek). */

const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';

const WEEKDAYS = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

function formatDate(d) {
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, pendingTxns, alerts, settings } = useAuth();
  const { t } = useTranslation();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const onClick = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Marshrut o'zgarsa popover yopiladi
  useEffect(() => { setShowNotif(false); }, [location.pathname]);

  const pending = pendingTxns?.length || 0;
  const offline = pending > 0 || settings?.isOnline === false;

  const notifs = [];
  if (alerts?.newOrders > 0) {
    notifs.push({
      icon: 'shopping-bag', color: 'var(--color-accent)', unread: true,
      text: <>Yangi onlayn buyurtma: <b style={{ fontWeight: 500 }}>{alerts.newOrders} ta</b></>,
      sub: 'Qabul qilish yoki rad etish kutilmoqda',
      to: '/orders',
    });
  }
  if (alerts?.outOfStock > 0) {
    notifs.push({
      icon: 'warning-circle', color: 'var(--dang)', unread: true,
      text: <>Tugagan mahsulot: <b style={{ fontWeight: 500 }}>{alerts.outOfStockNames[0] || `${alerts.outOfStock} ta`}</b></>,
      sub: alerts.outOfStock > 1 ? `Jami ${alerts.outOfStock} ta` : 'Hozir',
      to: '/inventory',
    });
  }
  if (alerts?.lowStock > 0) {
    notifs.push({
      icon: 'warning', color: 'var(--warn)', unread: true,
      text: <>Kam qoldiq: <b style={{ fontWeight: 500 }}>{alerts.lowStockNames[0] || `${alerts.lowStock} ta mahsulot`}</b></>,
      sub: `Jami ${alerts.lowStock} ta mahsulot`,
      to: '/inventory',
    });
  }
  if (alerts?.overdueDebts > 0) {
    notifs.push({
      icon: 'clock-countdown', color: 'var(--dang)', unread: true,
      text: <>Muddati o‘tgan nasiya: <b style={{ fontWeight: 500 }}>{alerts.overdueDebts} mijoz</b></>,
      sub: `${alerts.overdueAmount.toLocaleString('ru-RU')} so‘m`,
      to: '/nasiya',
    });
  }
  if (pending > 0) {
    notifs.push({
      icon: 'arrows-clockwise', color: 'var(--info)', unread: false,
      text: `${pending} ta oflayn sotuv sinxronlashni kutmoqda`,
      sub: 'Internet ulanishi kutilmoqda',
    });
  }

  const unread = notifs.filter(n => n.unread).length;

  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 24px',
        borderBottom: '1px solid var(--color-divider)',
        position: 'relative', flex: 'none',
      }}
    >
      {/* Qidiruv — hali ulanmagan, dizaynda ham shunday belgilangan */}
      <div
        title="Qidiruv hozircha ulanmagan"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: 340, minHeight: 34, padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-divider)',
          background: 'var(--color-surface)',
          color: 'var(--color-neutral-600)',
          cursor: 'not-allowed', opacity: 0.7,
        }}
      >
        <Icon name="magnifying-glass" size={15} />
        <span style={{ fontSize: 13, flex: 1 }}>{t('search')}…</span>
        <span style={{
          fontSize: 10, letterSpacing: '.05em', textTransform: 'uppercase',
          padding: '2px 6px', borderRadius: 'var(--radius-sm)',
          background: 'color-mix(in srgb, var(--color-text) 6%, transparent)',
        }}>
          Tez orada
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Sinxronlash holati */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 11px', borderRadius: 16, fontSize: 12,
        background: offline ? 'var(--warnbg)' : 'var(--okbg)',
        color: offline ? 'var(--warn)' : 'var(--ok)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
        <Icon name="arrows-clockwise" size={13} />
        {pending > 0
          ? `${pending} ta sotuv sinxronlashni kutmoqda`
          : settings?.isOnline === false ? 'Oflayn rejim' : 'Onlayn — hammasi sinxron'}
      </div>

      {/* Sana */}
      <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon name="calendar-blank" size={15} />
        {formatDate(new Date())}
      </div>

      {/* Bildirishnomalar */}
      <div style={{ position: 'relative' }} ref={notifRef}>
        <Btn
          variant="secondary" iconOnly icon="bell" title="Bildirishnomalar"
          onClick={() => setShowNotif(v => !v)}
          style={{ position: 'relative' }}
        />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 16, height: 16, padding: '0 4px', borderRadius: 8,
            background: 'var(--dang)', color: 'var(--color-bg)',
            fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center',
            pointerEvents: 'none',
          }}>
            {unread}
          </span>
        )}

        {showNotif && (
          <div style={{
            position: 'absolute', top: 46, right: 0, width: 340, zIndex: 50,
            borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)',
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
            animation: 'rise .14s ease-out',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderBottom: '1px solid var(--color-divider)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{t('notifications')}</span>
            </div>

            {notifs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--color-neutral-500)' }}>
                Ogohlantirishlar yo‘q
              </div>
            ) : notifs.map((n, i) => (
              <div
                key={i}
                onClick={() => { if (n.to) { navigate(n.to); setShowNotif(false); } }}
                style={{
                  display: 'flex', gap: 11, padding: '11px 14px',
                  background: n.unread ? 'color-mix(in srgb, var(--color-text) 3%, transparent)' : 'transparent',
                  cursor: n.to ? 'pointer' : 'default',
                }}
              >
                <Icon name={n.icon} fill={n.unread} size={17} color={n.color} style={{ marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: n.unread ? 'var(--color-text)' : 'var(--color-neutral-300)' }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginTop: 2 }}>{n.sub}</div>
                </div>
                {n.unread && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', marginTop: 5, flex: 'none' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Foydalanuvchi */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <Avatar initials={initialsOf(user?.name)} size={30} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{user?.name}</div>
          <div style={{ fontSize: 10.5, color: 'var(--color-neutral-500)', lineHeight: 1.2 }}>{user?.label}</div>
        </div>
      </div>
    </header>
  );
}
