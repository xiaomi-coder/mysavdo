import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  creator: '#F59E0B',
  owner: '#3B82F6',
  manager: '#10B981',
  cashier: '#A78BFA',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, sendTgAlert } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email) { setError("Email kiriting"); return; }
    if (!password) { setError("Parol kiriting"); return; }
    setLoading(true); setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }

    // Simulate Telegram IP Alert
    sendTgAlert(`🔒 Xavfsizlik Alerti!\nQurilma: Mac OS\nIP: 192.168.1.${Math.floor(Math.random() * 255)}\nTizimga kirildi: ${email}`);
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* BG effects */}
      <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)', backgroundSize: '44px 44px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)' }} />

      <div style={{ position: 'relative', zIndex: 10, width: 420, maxWidth: '94vw' }}>
        {/* Card */}
        <div className="glass-card" style={{
          borderRadius: 24,
          padding: '40px 38px', boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.08)',
          animation: 'fadeInUp .5s cubic-bezier(.34,1.56,.64,1)',
        }}>
          <style>{`@keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }`}</style>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#3B82F6,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 24px rgba(59,130,246,0.35)' }}>🏪</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(90deg,#fff,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SavdoPlatform</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 400 }}>Aqlli savdo boshqaruv tizimi</div>
            </div>
          </div>

          <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28, marginTop: 16 }}>Tizimga kirish uchun ma'lumotlaringizni kiriting</div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: .8 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
              <input
                type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="email@savdo.uz"
                className="fast-transition"
                style={{ width: '100%', padding: '13px 14px 13px 40px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t1)', fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box', backdropFilter: 'blur(4px)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: .8 }}>Parol</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Parolni kiriting"
                className="fast-transition"
                style={{ width: '100%', padding: '13px 40px 13px 40px', background: 'rgba(17, 24, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, color: 'var(--t1)', fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxSizing: 'border-box', backdropFilter: 'blur(4px)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
              />
              <span onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 16, opacity: .6 }}>
                {showPass ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 9, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#F43F5E', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Login btn */}
          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', padding: 15,
            background: loading ? 'var(--s2)' : 'linear-gradient(135deg,#3B82F6,#2563EB)',
            border: 'none', borderRadius: 12, color: loading ? 'var(--t2)' : '#fff',
            fontSize: 15, fontWeight: 800, fontFamily: 'Outfit,sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(59,130,246,0.3)',
            transition: 'all .2s', marginBottom: 14,
          }}>
            {loading ? '⏳ Tekshirilmoqda...' : 'Tizimga Kirish →'}
          </button>
        </div>
      </div>
    </div>
  );
}
