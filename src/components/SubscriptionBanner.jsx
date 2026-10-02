import React, { useState, useEffect } from 'react';
import { Icon } from './UI';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

/* ══════════════════════════════════════════════════════════════════════════
   Obuna ogohlantirishi

   To'lov qo'lda olinadi, shuning uchun do'konchi muddat yaqinlashganini
   o'zi ko'rishi kerak — aks holda do'kon to'satdan to'xtab qoladi va
   bu mijozni yo'qotadi.

     soon   — 3 kun va undan kam qoldi
     grace  — muddat o'tdi, imtiyoz kunlari ketyapti
     paused — do'kon to'xtatilgan

   Faqat egasi va manager ko'radi — sotuvchi to'lov qila olmaydi.
   ══════════════════════════════════════════════════════════════════════ */

const fmt = d => (d ? new Date(d + 'T00:00:00').toLocaleDateString('ru-RU') : '');

export default function SubscriptionBanner() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [hidden, setHidden] = useState(false);

  const visibleFor = user?.store_id && ['owner', 'manager'].includes(user?.role);

  useEffect(() => {
    if (!visibleFor) return undefined;
    let alive = true;
    const load = async () => {
      const { data } = await supabase.rpc('my_subscription');
      if (alive) setSub(data || null);
    };
    load();
    const iv = setInterval(load, 60 * 60 * 1000);   // soatiga bir marta
    return () => { alive = false; clearInterval(iv); };
  }, [visibleFor]);

  if (!visibleFor || !sub || hidden || !['soon', 'grace', 'paused'].includes(sub.status)) return null;

  const left = Number(sub.days_left);
  const graceLeft = Number(sub.grace_days) + left;   // left manfiy
  const [color, bg, text] =
    sub.status === 'paused'
      ? ['var(--dang)', 'var(--dangbg)', 'Do‘kon obunasi to‘xtatilgan. Davom ettirish uchun ma’muriyat bilan bog‘laning.']
      : sub.status === 'grace'
        ? ['var(--dang)', 'var(--dangbg)',
          `Obuna muddati ${fmt(sub.paid_until)} da tugagan. ${graceLeft > 0 ? `${graceLeft} kundan keyin` : 'Bugun'} do‘kon to‘xtatiladi.`]
        : ['var(--warn)', 'var(--warnbg)',
          left === 0
            ? `Obuna bugun tugaydi (${fmt(sub.paid_until)}). Uzaytirish uchun ma’muriyat bilan bog‘laning.`
            : `Obuna ${left} kundan keyin tugaydi (${fmt(sub.paid_until)}). Uzaytirish uchun ma’muriyat bilan bog‘laning.`];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px',
      background: bg, color, fontSize: 13, borderBottom: '1px solid var(--color-divider)',
    }}>
      <Icon name={sub.status === 'soon' ? 'clock' : 'warning'} size={16} color={color} />
      <span style={{ flex: 1 }}>{text}</span>
      <a href="https://t.me/MyBazzaruzbot" target="_blank" rel="noreferrer"
        style={{ color, fontWeight: 500, whiteSpace: 'nowrap' }}>Bog‘lanish</a>
      {sub.status === 'soon' && (
        <Icon name="x" size={15} color={color} style={{ cursor: 'pointer' }}
          onClick={() => setHidden(true)} />
      )}
    </div>
  );
}
