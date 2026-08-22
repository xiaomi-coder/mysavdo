import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Btn, Field } from '../components/UI';
import { useAuth } from '../context/AuthContext';

/* ══════════════════════════════════════════════════════════════════════════
   Kirish sahifasi

   Dizayn maketida bu ekran chizilmagan — Nocturne tokenlari asosida
   qolgan sahifalarga mos qilib yasaldi.
   ══════════════════════════════════════════════════════════════════════ */

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return setError('Email yoki login kiriting');
    if (!password) return setError('Parol kiriting');

    setLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.error) setError(result.error);
    else navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      padding: 'var(--space-6)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Akcent yorug'ligi — Nocturne'da akcent chiziq va nur sifatida ishlatiladi */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: 720, height: 720, pointerEvents: 'none',
        background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 65%)',
      }} />

      <form onSubmit={submit} style={{ position: 'relative', width: 400, maxWidth: '100%' }}>
        <div className="card elev-md" style={{ padding: 'var(--space-8)', gap: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>

          {/* Brend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
            <div style={{
              width: 44, height: 44, flex: 'none', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-accent)', color: 'var(--color-accent)',
              display: 'grid', placeItems: 'center',
            }}>
              <Icon name="storefront" fill size={24} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em' }}>MyBazzar</div>
              <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>
                Savdo boshqaruv tizimi
              </div>
            </div>
          </div>

          <Field label="Email yoki login">
            <div className="input-icon">
              <Icon name="user" />
              <input
                className="input" type="text" autoFocus autoComplete="username"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="email@mybazzar.uz"
              />
            </div>
          </Field>

          <Field label="Parol">
            <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 0, paddingInline: 10 }}>
              <Icon name="lock-simple" size={15} color="var(--color-neutral-500)" />
              <input
                type={showPass ? 'text' : 'password'} autoComplete="current-password"
                value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Parolni kiriting"
                style={{
                  flex: 1, background: 'none', border: 0, outline: 'none',
                  color: 'var(--color-text)', font: 'inherit', fontSize: 14, padding: '8px 0',
                }}
              />
              <Icon
                name={showPass ? 'eye-slash' : 'eye'} size={16} color="var(--color-neutral-500)"
                style={{ cursor: 'pointer' }} onClick={() => setShowPass(s => !s)}
              />
            </div>
          </Field>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 9,
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--dangbg)', color: 'var(--dang)', fontSize: 12.5,
            }}>
              <Icon name="warning-circle" fill size={15} style={{ marginTop: 1 }} />
              {error}
            </div>
          )}

          <Btn type="submit" variant="primary" block loading={loading}
            style={{ minHeight: 46, fontSize: 15, marginTop: 'var(--space-2)' }}>
            {loading ? 'Tekshirilmoqda…' : 'Tizimga kirish'}
          </Btn>

          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', textAlign: 'center' }}>
            Dilerlar o‘zlariga berilgan login bilan kiradi
          </div>
        </div>
      </form>
    </div>
  );
}
