import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
    { icon: '🧾', title: 'POS Kassa', desc: 'Tez va oson sotuv. Barcode skanerlash, chek chiqarish, bir tugma bilan sotuv.' },
    { icon: '📦', title: 'Ombor Nazorati', desc: 'Tovar qoldiqlarini real-time kuzating. Kam qolsa avtomatik ogohlantirish.' },
    { icon: '📊', title: 'Hisobotlar', desc: 'Kunlik, haftalik, oylik hisobotlar. Foyda va zarar avtomatik hisoblanadi.' },
    { icon: '🤖', title: 'AI Analitika', desc: "Sun'iy intellekt asosida savdo prognozi va biznes tavsiyalar." },
    { icon: '📱', title: 'Telegram Bot', desc: "Kunlik hisobot to'g'ridan-to'g'ri Telegram ga keladi. Har doim xabardor." },
    { icon: '💳', title: 'Nasiya Tizimi', desc: "Mijozlar nasiyasini boshqaring. Muddati kelganda avtomatik eslatma." },
];

const ADVANTAGES = [
    { icon: '🇺🇿', title: "100% O'zbek tilida", desc: "To'liq o'zbek tilida interfeys — hech qanday tarjima muammosi yo'q." },
    { icon: '💰', title: 'Arzon narx', desc: "Boshqa tizimlar $50-100/oy. MyBazzar atigi 100,000 so'mdan boshlanadi." },
    { icon: '📱', title: 'Telegram integratsiya', desc: "Kunlik hisobot Telegram ga keladi. O'zbeklar uchun juda qulay." },
    { icon: '⚡', title: 'Oddiy interfeys', desc: "10 daqiqada o'rganib, ishni boshlang. Texnik bilim kerak emas." },
];

const STATS = [
    { num: '3+', label: "Faol do'konlar" },
    { num: '24/7', label: 'Ishlash vaqti' },
    { num: '100%', label: "O'zbek tilida" },
    { num: '10 daq', label: "O'rganish vaqti" },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);
    const [visible, setVisible] = useState({});

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.id]: true })); });
        }, { threshold: 0.15 });
        document.querySelectorAll('.land-section').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const anim = (id) => visible[id] ? { opacity: 1, transform: 'translateY(0)' } : { opacity: 0, transform: 'translateY(40px)' };

    return (
        <div style={{ background: '#07090F', color: '#F8FAFC', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>

            {/* ═══ NAVBAR ═══ */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: scrollY > 50 ? 'rgba(7,9,15,0.92)' : 'transparent',
                backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
                borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
                transition: 'all 0.3s',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src="/logo.png" alt="MyBazzar" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
                    <span style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(90deg,#fff,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MyBazzar</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate('/login')} style={{
                        padding: '10px 24px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)',
                        border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
                        boxShadow: '0 4px 16px rgba(59,130,246,0.3)', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 6px 24px rgba(59,130,246,0.5)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)'; }}
                    >
                        Kirish →
                    </button>
                </div>
            </nav>

            {/* ═══ HERO ═══ */}
            <section style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '120px 24px 80px', position: 'relative',
            }}>
                {/* BG Effects */}
                <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '20%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)' }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'inline-block', padding: '6px 16px', background: 'rgba(59,130,246,0.1)',
                        border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        color: '#3B82F6', marginBottom: 24,
                    }}>
                        🚀 O'zbekistonning #1 savdo platformasi
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20,
                        maxWidth: 800,
                    }}>
                        <span style={{ background: 'linear-gradient(135deg, #fff 30%, #22D3EE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Do'koningizni
                        </span>
                        <br />
                        <span style={{ background: 'linear-gradient(135deg, #3B82F6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            aqlli boshqaring
                        </span>
                    </h1>

                    <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#94A3B8', maxWidth: 560, marginBottom: 36, lineHeight: 1.6, margin: '0 auto 36px' }}>
                        POS kassa, ombor nazorati, moliya hisoboti, AI analitika va Telegram bot — barchasi bitta platformada.
                    </p>

                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/login')} style={{
                            padding: '16px 36px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)',
                            border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 800,
                            cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
                            boxShadow: '0 8px 32px rgba(59,130,246,0.35)', transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 12px 40px rgba(59,130,246,0.5)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 32px rgba(59,130,246,0.35)'; }}
                        >
                            Bepul boshlash →
                        </button>
                        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} style={{
                            padding: '16px 36px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#94A3B8', fontSize: 16, fontWeight: 700,
                            cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = '#fff'; }}
                            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#94A3B8'; }}
                        >
                            Batafsil →
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
                        {STATS.map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg,#3B82F6,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.num}</div>
                                <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section id="features" className="land-section" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto', transition: 'all 0.6s ease-out', ...anim('features') }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Imkoniyatlar</div>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900 }}>Biznesingiz uchun barcha kerakli vositalar</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} style={{
                            padding: 28, borderRadius: 18,
                            background: 'linear-gradient(145deg, rgba(26,35,50,0.7), rgba(13,17,23,0.8))',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.3s', cursor: 'default',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{f.title}</div>
                            <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ ADVANTAGES ═══ */}
            <section id="advantages" className="land-section" style={{
                padding: '80px 24px', position: 'relative', transition: 'all 0.6s ease-out', ...anim('advantages'),
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(59,130,246,0.03), transparent)', pointerEvents: 'none' }} />
                <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#22D3EE', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Afzalliklar</div>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900 }}>Nima bilan farqlanamiz?</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                        {ADVANTAGES.map((a, i) => (
                            <div key={i} style={{
                                padding: 28, borderRadius: 18, textAlign: 'center',
                                background: 'linear-gradient(145deg, rgba(26,35,50,0.5), rgba(13,17,23,0.6))',
                                border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                            >
                                <div style={{ fontSize: 44, marginBottom: 14 }}>{a.icon}</div>
                                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{a.title}</div>
                                <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{a.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 600, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, marginBottom: 16 }}>
                        Savdoni <span style={{ background: 'linear-gradient(135deg,#3B82F6,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>aqlli</span> boshqarishni bugunoq boshlang
                    </h2>
                    <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 32, lineHeight: 1.6 }}>
                        MyBazzar bilan do'koningizni raqamlashtiring. 10 daqiqada o'rnatib, ishni boshlang.
                    </p>
                    <button onClick={() => navigate('/login')} style={{
                        padding: '18px 48px', background: 'linear-gradient(135deg,#3B82F6,#2563EB)',
                        border: 'none', borderRadius: 14, color: '#fff', fontSize: 18, fontWeight: 800,
                        cursor: 'pointer', fontFamily: "'Outfit',sans-serif",
                        boxShadow: '0 8px 40px rgba(59,130,246,0.4)', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-3px) scale(1.02)'; e.target.style.boxShadow = '0 14px 48px rgba(59,130,246,0.5)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 8px 40px rgba(59,130,246,0.4)'; }}
                    >
                        Hoziroq boshlash 🚀
                    </button>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer style={{
                padding: '48px 24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(7,9,15,0.8)',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <img src="/logo.png" alt="MyBazzar" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                            <span style={{ fontSize: 16, fontWeight: 900, background: 'linear-gradient(90deg,#fff,#22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MyBazzar</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>Aqlli savdo boshqaruv tizimi. O'zbekiston do'konlari uchun yaratilgan.</p>
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Sahifalar</div>
                        {['Imkoniyatlar', 'Afzalliklar'].map(l => (
                            <div key={l} style={{ fontSize: 14, color: '#64748B', marginBottom: 8, cursor: 'pointer', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#64748B'}
                            >{l}</div>
                        ))}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Aloqa</div>
                        <div style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>📧 info@mybazzar.uz</div>
                        <div style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>📱 Telegram: @mybazzar</div>
                        <div style={{ fontSize: 14, color: '#64748B' }}>🌐 mybazzar.uz</div>
                    </div>
                </div>
                <div style={{ maxWidth: 1100, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: 13, color: '#475569' }}>
                    © 2026 MyBazzar. Barcha huquqlar himoyalangan.
                </div>
            </footer>
        </div>
    );
}
