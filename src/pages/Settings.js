import React, { useState, useEffect, useCallback } from 'react';
import {
  Page, PageHeader, Card, Icon, Btn, Tag, Seg, Field, Toast, SkeletonRows,
} from '../components/UI';
import { useAuth, useTranslation } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

/* ══════════════════════════════════════════════════════════════════════════
   Sozlamalar

   Chap ustun — do'kon ma'lumotlari (bazaga saqlanadi), onlayn do'kon
   havolasi va tarif. O'ng ustun — qurilmaga bog'liq tizim sozlamalari
   (localStorage'da saqlanadi).
   ══════════════════════════════════════════════════════════════════════ */

export default function Settings() {
  const { user, settings, toggleSetting, setSettings, pendingTxns } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState({ name: '', address: '', phone: '', email: '', tax_id: '' });
  const [toast, setToast] = useState(null);

  const load = useCallback(async (storeId) => {
    setLoading(true);
    const { data } = await supabase.from('stores').select('*').eq('id', storeId).single();
    if (data) {
      setStore({
        name: data.name || '', address: data.address || '', phone: data.phone || '',
        email: data.email || '', tax_id: data.tax_id || '',
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (user?.store_id) load(user.store_id); }, [user, load]);

  const set = (k, v) => setStore(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('stores').update(store).eq('id', user.store_id);
    setSaving(false);
    setToast(error
      ? { msg: `Saqlanmadi: ${error.message}`, variant: 'dang' }
      : { msg: 'Do‘kon ma’lumotlari saqlandi', variant: 'ok' });
  };

  const shopUrl = `https://mybazzar.uz/shop/${user?.store_id ?? ''}`;
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard?.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const pending = pendingTxns?.length || 0;

  return (
    <Page>
      <PageHeader title="Sozlamalar" subtitle="Do‘kon va tizim sozlamalari" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14, alignItems: 'start' }}>

        {/* ── Chap ustun ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card padding="var(--space-6)" gap={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
              <Icon name="storefront" size={16} color="var(--color-accent)" />
              Do‘kon ma’lumotlari
            </div>

            {loading ? <SkeletonRows count={5} widths={['100%']} /> : (
              <>
                <Field label="Do‘kon nomi">
                  <input className="input" value={store.name} onChange={e => set('name', e.target.value)}
                    placeholder="Do‘kon nomini kiriting" />
                </Field>
                <Field label="Manzil">
                  <input className="input" value={store.address} onChange={e => set('address', e.target.value)}
                    placeholder="Shahar, tuman, ko‘cha" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <Field label="Telefon">
                    <input className="input num" value={store.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+998 71 200 00 00" />
                  </Field>
                  <Field label="Email">
                    <input className="input" value={store.email} onChange={e => set('email', e.target.value)}
                      placeholder="info@dokon.uz" />
                  </Field>
                </div>
                <Field label="STIR" hint="9 xonali soliq to‘lovchi raqami">
                  <input className="input num" value={store.tax_id} maxLength={9}
                    onChange={e => set('tax_id', e.target.value.replace(/\D/g, ''))} placeholder="123456789" />
                </Field>

                <div>
                  <Btn variant="primary" icon="floppy-disk" onClick={save} loading={saving}>Saqlash</Btn>
                </div>
              </>
            )}
          </Card>

          <Card padding="var(--space-6)" gap={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
              <Icon name="globe" size={16} color="var(--color-accent)" />
              Onlayn do‘kon havolasi
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
              Bu havolani mijozlarga yuboring — ular tovarlaringizni ko‘rib, buyurtma bera oladi.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-neutral-300)', minWidth: 0 }}>
                <Icon name="link" size={14} color="var(--color-neutral-500)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shopUrl}</span>
              </div>
              <Btn variant="secondary" icon={copied ? 'check' : 'copy'} onClick={copyLink}>
                {copied ? 'Nusxalandi' : 'Nusxa'}
              </Btn>
            </div>
          </Card>

          <Card padding="var(--space-6)" gap={10}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
                <Icon name="crown-simple" size={16} color="var(--warn)" />
                Joriy tarif
              </div>
              <Tag variant="accent">Business</Tag>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>
              Business — <b style={{ color: 'var(--color-text)', fontWeight: 500 }}>$59/oy</b>
            </div>
            <Btn variant="secondary" disabled title="Tarif o‘zgartirish — tez orada"
              style={{ alignSelf: 'flex-start' }}>
              Tarifni O‘zgartirish
            </Btn>
          </Card>
        </div>

        {/* ── O'ng ustun: tizim ── */}
        <Card padding="6px 0" gap={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, padding: '14px 18px 8px' }}>
            <Icon name="gear" size={16} color="var(--color-accent)" />
            Tizim
          </div>

          <Row icon="translate" title={t('language')} sub="Interfeys tili">
            <Seg
              style={{ fontSize: 12 }}
              options={[
                { value: 'UZ', label: 'O‘zbekcha' },
                { value: 'RU', label: 'Русский' },
                { value: 'EN', label: 'English' },
              ]}
              value={settings.language}
              onChange={v => setSettings(p => ({ ...p, language: v }))}
            />
          </Row>

          <Row icon="moon" title="Tungi rejim" sub="Qorong‘i mavzu">
            <Switch on={settings.dark} onChange={() => toggleSetting('dark')} />
          </Row>

          <Row icon="bell" title="Ogohlantirishlar" sub="Kam qoldiq va muddati o‘tgan nasiya haqida">
            <Switch on={settings.notif} onChange={() => toggleSetting('notif')} />
          </Row>

          <Row icon="chat-circle-text" title="SMS" sub="Mijozlarga SMS xabarlar — hozircha ulanmagan">
            <Switch on={settings.sms} onChange={() => toggleSetting('sms')} />
          </Row>

          {/* Offline rejim ajratib ko'rsatiladi — bu eng muhim sozlama */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 9, padding: '13px 18px',
            borderBottom: '1px solid var(--color-divider)',
            background: 'oklch(0.33 0.06 240 / 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <Icon name="cloud-arrow-up" fill size={19} color="var(--info)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Offline rejim</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-400)', lineHeight: 1.45 }}>
                  Internet bo‘lmaganda sotuvlar vaqtincha qurilmada saqlanadi va
                  ulanish tiklanganda avtomatik sinxronlanadi.
                </div>
              </div>
              <Switch on={settings.offline} onChange={() => toggleSetting('offline')} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginLeft: 32, fontSize: 11.5,
              color: pending > 0 ? 'var(--warn)' : 'var(--ok)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              {pending > 0
                ? `${pending} ta sotuv sinxronlashni kutmoqda`
                : settings.isOnline === false ? 'Oflayn — internet uzilgan' : 'Onlayn — hammasi sinxron'}
            </div>
          </div>

          <Row icon="shield-check" title="2FA" sub="Ikki bosqichli kirish himoyasi — hozircha ulanmagan" last>
            <Switch on={settings.twofa} onChange={() => toggleSetting('twofa')} />
          </Row>
        </Card>
      </div>

      {toast && <Toast message={toast.msg} variant={toast.variant} onClose={() => setToast(null)} />}
    </Page>
  );
}

function Row({ icon, title, sub, children, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 18px',
      borderBottom: last ? 'none' : '1px solid var(--color-divider)',
    }}>
      <Icon name={icon} size={19} color="var(--color-neutral-400)" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}

function Switch({ on, onChange }) {
  return (
    <span
      role="switch" aria-checked={on} onClick={onChange}
      style={{
        width: 40, height: 23, borderRadius: 12, position: 'relative', flex: 'none',
        display: 'inline-block', cursor: 'pointer', transition: 'background .15s',
        background: on ? 'var(--color-accent)' : 'var(--color-neutral-700)',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 19 : 2,
        width: 19, height: 19, borderRadius: '50%', transition: 'left .15s',
        background: on ? 'var(--color-bg)' : 'var(--color-neutral-400)',
      }} />
    </span>
  );
}
