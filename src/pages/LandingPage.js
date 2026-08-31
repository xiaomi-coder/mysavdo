import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Btn } from '../components/UI';

/* ══════════════════════════════════════════════════════════════════════════
   Ochiq sahifa (landing) — professional marketing sahifasi

   Halol: soxta mijoz soni, reyting yoki otziv yo'q. Faqat haqiqiy
   imkoniyatlar ko'rsatiladi. Mahsulot ko'rinishi (mock dashboard) —
   bu UI namunasi, biznes da'vosi emas.
   ══════════════════════════════════════════════════════════════════════ */

const FEATURES = [
  {
    icon: 'cash-register', title: 'POS kassa',
    desc: 'Barcode va IMEI bo‘yicha qidiruv, savat, chegirma, chek chop etish. Skanerdan Enter bosilishi bilan tovar savatga tushadi.',
  },
  {
    icon: 'package', title: 'Ombor nazorati',
    desc: 'Qoldiqlar, kirim, filiallarga ko‘chirish va inventarizatsiya. Tovar minimal darajaga tushganda ogohlantiradi.',
  },
  {
    icon: 'hand-coins', title: 'Nasiya',
    desc: 'Qarzlarni muddati bilan yuritish, qisman to‘lov qabul qilish, muddati o‘tganlarni ajratib ko‘rsatish.',
  },
  {
    icon: 'users-three', title: 'Mijozlar bazasi',
    desc: 'Oddiy xaridorlar va dilerlar. Har bir mijozning xaridlari, jami summasi va joriy qarzi bir joyda.',
  },
  {
    icon: 'chart-bar', title: 'Hisobotlar',
    desc: 'Kunlik va oylik savdo, foyda, o‘rtacha chek, eng ko‘p sotilgan tovarlar va xodimlar KPI si.',
  },
  {
    icon: 'cloud-arrow-up', title: 'Offline rejim',
    desc: 'Internet uzilsa sotuv to‘xtamaydi — cheklar qurilmada saqlanadi va ulanish tiklanganda o‘zi sinxronlanadi.',
  },
];

const ROLES = [
  { icon: 'crown-simple', title: 'Do‘kon egasi', desc: 'Hamma narsani ko‘radi va boshqaradi' },
  { icon: 'identification-badge', title: 'Manager', desc: 'Ombor, nasiya, moliya va hisobotlar' },
  { icon: 'cash-register', title: 'Sotuvchi', desc: 'Faqat kassa va chek — ortiqchasi ko‘rinmaydi' },
  { icon: 'handshake', title: 'Diler', desc: 'O‘z qarzi va xaridlarini ko‘radigan alohida portal' },
];

/* Spotlight bo'limlar — asosiy farqlovchi imkoniyatlar */
const SPOTLIGHTS = [
  {
    tag: 'TELEFON DO‘KONLARI',
    title: 'IMEI bo‘yicha to‘liq hisob',
    desc: 'Har bir telefon IMEI raqami bilan yuritiladi. Qaysi telefon kimga, qachon, qancha sotilgani — hammasi bir joyda. Qutidagi barcode’ni skanerlang, tizim o‘zi topadi.',
    points: ['Skanerdan avtomatik kiritish', 'Model, xotira, holat bo‘yicha', 'Har bir dona alohida kuzatiladi'],
    visual: 'imei',
  },
  {
    tag: 'KREDIT SAVDO',
    title: 'Masofadan telefon qulflash',
    desc: 'Nasiyaga sotilgan telefon to‘lov kechiksa masofadan qulflanadi — hech qanday ilova o‘rnatmasdan. To‘lov kelganda avtomatik ochiladi. Bu qarzni qaytarishni kafolatlaydi.',
    points: ['Ilovasiz — Google boshqaruvi orqali', 'Avval ogohlantiradi, keyin qulflaydi', 'To‘langach o‘zi ochiladi'],
    visual: 'lock',
    accent: true,
  },
  {
    tag: 'AQLLI TAHLIL',
    title: 'AI Analitika — do‘koningizni o‘qiydi',
    desc: 'Tizim savdoni tahlil qiladi: qaysi tovar zarar keltiryapti, qaysi biri tugab qolyapti, nasiya qaytmayapti — hammasini o‘zi topib beradi va maslahat beradi.',
    points: ['Zarar va o‘lik tovarni topadi', 'Savdo prognozi', 'Kunlik xulosa Telegram’ga'],
    visual: 'ai',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useRef(null);

  /* Mavzu almashtirgich (oy/quyosh) — login’siz sahifa uchun mustaqil,
     tanlov localStorage’da eslab qolinadi */
  const [dark, setDark] = useState(true);
  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem('mb_theme'); } catch (_) { /* yopiq */ }
    const isLight = saved === 'light';
    setDark(!isLight);
    document.body.classList.toggle('light-mode', isLight);
  }, []);
  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      document.body.classList.toggle('light-mode', !next);
      try { localStorage.setItem('mb_theme', next ? 'dark' : 'light'); } catch (_) { /* yopiq */ }
      return next;
    });
  };

  /* Scroll-reveal — ko'rinishga kirganda animatsiya */
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.reveal') || [];
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.14 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const login = () => navigate('/login');

  return (
    <div ref={rootRef} className="lp">
      <style>{CSS}</style>

      {/* ── Yuqori panel ── */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark"><Icon name="storefront" fill size={18} /></div>
            <span>MyBazzar</span>
          </div>
          <nav className="lp-links">
            <a onClick={() => scrollTo('features')}>Imkoniyatlar</a>
            <a onClick={() => scrollTo('roles')}>Kimlar uchun</a>
            <a onClick={() => scrollTo('cta')}>Boshlash</a>
          </nav>
          <button
            className={`lp-theme ${dark ? 'dark' : 'light'}`}
            onClick={toggleTheme}
            aria-label={dark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
            title={dark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
          >
            <span className="lp-theme-ic sun"><Icon name="sun" fill size={14} /></span>
            <span className="lp-theme-ic moon"><Icon name="moon" fill size={13} /></span>
            <span className="lp-theme-knob" />
          </button>
          <Btn variant="primary" onClick={login}>Tizimga kirish</Btn>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-glow lp-glow-1" />
        <div className="lp-glow lp-glow-2" />
        <div className="lp-hero-grid">
          <div className="lp-hero-copy reveal">
            <div className="lp-badge">
              <Icon name="translate" size={13} />
              To‘liq o‘zbek tilida
            </div>
            <h1 className="lp-h1">
              Do‘koningizni <span className="lp-grad">bitta oynadan</span> boshqaring
            </h1>
            <p className="lp-sub">
              Kassa, ombor, nasiya, mijozlar va hisobotlar — hammasi bir tizimda.
              Telefon do‘konlari uchun IMEI hisobi va masofadan qulflash ham bor.
            </p>
            <div className="lp-cta-row">
              <Btn variant="primary" size="lg" icon="arrow-right" onClick={login}>Tizimga kirish</Btn>
              <Btn variant="secondary" size="lg" icon="caret-down" onClick={() => scrollTo('features')}>
                Imkoniyatlar
              </Btn>
            </div>
            <div className="lp-trust">
              {[
                ['wifi-slash', 'Offline ishlaydi'],
                ['device-mobile', 'IMEI hisobi'],
                ['lock-simple', 'Masofadan qulflash'],
                ['sparkle', 'AI tahlil'],
              ].map(([ic, tx]) => (
                <div key={tx} className="lp-trust-item">
                  <Icon name={ic} size={15} color="var(--color-accent)" />
                  <span>{tx}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-hero-visual reveal">
            <AppPreview />
          </div>
        </div>
      </section>

      {/* ── Spotlight bo'limlar ── */}
      <section className="lp-spot-wrap">
        {SPOTLIGHTS.map((s, i) => (
          <div key={s.title} className={`lp-spot reveal ${i % 2 ? 'rev' : ''}`}>
            <div className="lp-spot-copy">
              <div className={`lp-tag ${s.accent ? 'hot' : ''}`}>{s.tag}</div>
              <h3 className="lp-spot-title">{s.title}</h3>
              <p className="lp-spot-desc">{s.desc}</p>
              <ul className="lp-points">
                {s.points.map((p) => (
                  <li key={p}><Icon name="check-circle" fill size={17} color="var(--color-accent)" /><span>{p}</span></li>
                ))}
              </ul>
            </div>
            <div className="lp-spot-visual"><SpotVisual kind={s.visual} /></div>
          </div>
        ))}
      </section>

      {/* ── Imkoniyatlar ── */}
      <section id="features" className="lp-section">
        <div className="lp-head reveal">
          <h2>Nimalar bor</h2>
          <p>Har bir bo‘lim kundalik ishdan kelib chiqib yasalgan</p>
        </div>
        <div className="lp-feat-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="lp-feat reveal" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="lp-feat-ic"><Icon name={f.icon} size={22} color="var(--color-accent)" /></div>
              <div className="lp-feat-title">{f.title}</div>
              <div className="lp-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rollar ── */}
      <section id="roles" className="lp-section">
        <div className="lp-head reveal">
          <h2>Har kim o‘z ishini ko‘radi</h2>
          <p>Xodimga qaysi bo‘limlar ochiq bo‘lishini o‘zingiz belgilaysiz</p>
        </div>
        <div className="lp-roles">
          {ROLES.map((r, i) => (
            <div key={r.title} className="lp-role reveal" style={{ transitionDelay: `${i * 60}ms` }}>
              <Icon name={r.icon} size={20} color="var(--color-accent)" />
              <div className="lp-role-title">{r.title}</div>
              <div className="lp-role-desc">{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Yakuniy chaqiruv ── */}
      <section id="cta" className="lp-section">
        <div className="lp-final reveal">
          <div className="lp-glow lp-glow-3" />
          <h2 className="lp-final-title">Do‘koningizni tartibga solishga tayyormisiz?</h2>
          <p className="lp-final-sub">
            Do‘kon ochish uchun biz bilan bog‘laning — hisobingiz tayyorlanadi
            va kirish ma’lumotlari beriladi.
          </p>
          <div className="lp-cta-row" style={{ justifyContent: 'center' }}>
            <Btn variant="primary" size="lg" icon="arrow-right" onClick={login}>Tizimga kirish</Btn>
            <a className="lp-tg" href="https://t.me/MyBazzaruzbot" target="_blank" rel="noreferrer">
              <Icon name="telegram-logo" size={18} /> Telegram bot
            </a>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-logo">
          <div className="lp-logo-mark"><Icon name="storefront" fill size={16} /></div>
          <span>MyBazzar</span>
        </div>
        <span className="lp-footer-note">Do‘kon boshqaruv tizimi · mybazzar.uz</span>
      </footer>
    </div>
  );
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Mahsulot ko'rinishi (mock dashboard) ─────────────────────────────── */
function AppPreview() {
  const bars = [42, 58, 47, 71, 63, 88, 76];
  return (
    <div className="lp-window">
      <div className="lp-window-bar">
        <span className="lp-dot" style={{ background: '#ff5f57' }} />
        <span className="lp-dot" style={{ background: '#febc2e' }} />
        <span className="lp-dot" style={{ background: '#28c840' }} />
        <div className="lp-window-url">mybazzar.uz</div>
      </div>
      <div className="lp-app">
        <aside className="lp-app-side">
          <div className="lp-app-brand"><Icon name="storefront" fill size={13} color="var(--color-accent)" /></div>
          {['squares-four', 'cash-register', 'package', 'hand-coins', 'chart-bar'].map((ic, i) => (
            <div key={ic} className={`lp-app-nav ${i === 0 ? 'on' : ''}`}><Icon name={ic} size={14} /></div>
          ))}
        </aside>
        <div className="lp-app-main">
          <div className="lp-app-stats">
            {[['Bugungi savdo', '4 250 000'], ['Cheklar', '37'], ['Foyda', '890 000']].map(([l, v]) => (
              <div key={l} className="lp-app-stat">
                <div className="lp-app-stat-l">{l}</div>
                <div className="lp-app-stat-v">{v}</div>
              </div>
            ))}
          </div>
          <div className="lp-app-card">
            <div className="lp-app-card-h">Haftalik savdo</div>
            <div className="lp-app-chart">
              {bars.map((h, i) => (
                <div key={i} className="lp-app-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="lp-app-list">
            {[['iPhone 13 128GB', '9 800 000'], ['Samsung A55', '4 200 000'], ['Redmi Note 13', '2 950 000']].map(([n, p]) => (
              <div key={n} className="lp-app-row">
                <div className="lp-app-thumb"><Icon name="device-mobile" size={13} color="var(--color-neutral-500)" /></div>
                <span className="lp-app-row-n">{n}</span>
                <span className="lp-app-row-p">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Spotlight vizuallari ─────────────────────────────────────────────── */
function SpotVisual({ kind }) {
  if (kind === 'imei') {
    return (
      <div className="lp-sv">
        <div className="lp-sv-scan">
          <Icon name="barcode" size={40} color="var(--color-accent)" />
          <div className="lp-sv-line" />
        </div>
        <div className="lp-sv-imei">IMEI 353 012 118 472 095</div>
        <div className="lp-sv-chips">
          {['iPhone 13', '128 GB', 'Yangi'].map((c) => <span key={c} className="lp-sv-chip">{c}</span>)}
        </div>
      </div>
    );
  }
  if (kind === 'lock') {
    return (
      <div className="lp-sv lp-sv-lock">
        <div className="lp-phone">
          <div className="lp-phone-lock">
            <Icon name="lock-simple" fill size={30} color="#fff" />
            <div className="lp-phone-t">To‘lov kechikdi</div>
            <div className="lp-phone-s">Do‘konga murojaat qiling</div>
          </div>
        </div>
        <div className="lp-lock-flow">
          <span className="lp-lock-step ok"><Icon name="warning" size={13} /> Ogohlantirish</span>
          <span className="lp-lock-arrow">→</span>
          <span className="lp-lock-step hot"><Icon name="lock-simple" size={13} /> Qulflash</span>
          <span className="lp-lock-arrow">→</span>
          <span className="lp-lock-step ok2"><Icon name="lock-simple-open" size={13} /> Ochish</span>
        </div>
      </div>
    );
  }
  // ai
  return (
    <div className="lp-sv">
      <div className="lp-ai">
        <div className="lp-ai-h"><Icon name="sparkle" fill size={16} color="var(--color-accent)" /> Bugungi xulosa</div>
        {[
          ['warning', 'var(--dang)', '5 nasiya muddati o‘tgan — 15.4 mln'],
          ['trend-down', 'var(--warn)', '“USB kabel” zarariga sotilyapti'],
          ['package', 'var(--color-neutral-400)', '3.3 mln o‘lik tovar — chegirma tavsiya'],
          ['trend-up', 'var(--ok)', 'Bu oy savdo +12% prognoz'],
        ].map(([ic, col, tx]) => (
          <div key={tx} className="lp-ai-row">
            <Icon name={ic} size={14} color={col} />
            <span>{tx}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ Uslub ══════════════════════════════════════════════════════════════ */
const CSS = `
.lp { min-height:100vh; overflow-x:hidden; }
.lp a { cursor:pointer; }

/* nav */
.lp-nav { position:sticky; top:0; z-index:50; backdrop-filter:blur(14px);
  background:color-mix(in srgb, var(--color-bg) 78%, transparent);
  border-bottom:1px solid var(--color-divider); }
.lp-nav-inner { max-width:1120px; margin:0 auto; padding:13px 26px; display:flex; align-items:center; gap:22px; }
.lp-logo { display:flex; align-items:center; gap:10px; font-size:17px; font-weight:600; letter-spacing:-0.01em; }
.lp-logo-mark { width:32px; height:32px; flex:none; border-radius:9px; display:grid; place-items:center;
  color:#fff; background:linear-gradient(135deg, var(--color-accent), var(--color-accent-700)); }
.lp-links { flex:1; display:flex; gap:26px; }
.lp-links a { font-size:14px; color:var(--color-neutral-400); transition:color .15s; }
.lp-links a:hover { color:var(--color-neutral-100); }

/* mavzu almashtirgich (oy/quyosh, on-off) */
.lp-theme { position:relative; width:60px; height:30px; flex:none; padding:0; cursor:pointer;
  border-radius:16px; border:1px solid var(--color-divider); background:var(--color-bg);
  transition:background .2s, border-color .2s; }
.lp-theme:hover { border-color:color-mix(in srgb, var(--color-accent) 45%, transparent); }
.lp-theme-ic { position:absolute; top:50%; transform:translateY(-50%); z-index:3;
  display:grid; place-items:center; transition:opacity .2s; pointer-events:none; }
.lp-theme-ic.sun { left:8px; color:var(--warn); }
.lp-theme-ic.moon { right:8px; color:var(--color-accent); }
.lp-theme-knob { position:absolute; top:3px; width:24px; height:24px; z-index:2; border-radius:50%;
  background:var(--color-surface); box-shadow:0 2px 7px rgba(0,0,0,.4);
  transition:left .26s cubic-bezier(.2,.8,.2,1); }
.lp-theme.light .lp-theme-knob { left:3px; }
.lp-theme.dark  .lp-theme-knob { left:33px; }
.lp-theme.light .lp-theme-ic.moon { opacity:.35; }
.lp-theme.dark  .lp-theme-ic.sun  { opacity:.35; }

/* hero */
.lp-hero { position:relative; max-width:1120px; margin:0 auto; padding:70px 26px 40px; }
.lp-hero-grid { display:grid; grid-template-columns:1.05fr 1fr; gap:44px; align-items:center; }
.lp-glow { position:absolute; border-radius:50%; pointer-events:none; filter:blur(20px); }
.lp-glow-1 { top:-120px; left:-80px; width:520px; height:520px;
  background:radial-gradient(circle, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 68%); }
.lp-glow-2 { top:40px; right:-140px; width:460px; height:460px;
  background:radial-gradient(circle, color-mix(in srgb, #6ec1e4 14%, transparent), transparent 66%); }
.lp-glow-3 { top:-60px; left:50%; transform:translateX(-50%); width:560px; height:320px;
  background:radial-gradient(circle, color-mix(in srgb, var(--color-accent) 20%, transparent), transparent 70%); }

.lp-badge { display:inline-flex; align-items:center; gap:7px; margin-bottom:22px; padding:6px 13px;
  border-radius:20px; font-size:12.5px; color:var(--color-accent);
  border:1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  background:color-mix(in srgb, var(--color-accent) 8%, transparent); }
.lp-h1 { font-size:clamp(34px, 5vw, 54px); line-height:1.08; margin:0 0 18px; letter-spacing:-0.02em; font-weight:650; }
.lp-grad { background:linear-gradient(120deg, var(--color-accent-400), var(--color-accent) 55%, #7fb8e6);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
.lp-sub { font-size:16.5px; color:var(--color-neutral-400); line-height:1.62; max-width:520px; margin:0; }
.lp-cta-row { display:flex; gap:11px; margin-top:30px; flex-wrap:wrap; }
.lp-trust { display:flex; gap:20px; margin-top:34px; flex-wrap:wrap; }
.lp-trust-item { display:flex; align-items:center; gap:7px; font-size:13px; color:var(--color-neutral-400); }

/* mock window */
.lp-hero-visual { perspective:1600px; }
.lp-window { border-radius:14px; overflow:hidden; border:1px solid var(--color-divider);
  background:var(--color-surface); box-shadow:0 40px 90px -40px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.02);
  transform:rotateY(-9deg) rotateX(4deg) translateZ(0); transition:transform .5s ease; }
.lp-hero-visual:hover .lp-window { transform:rotateY(-3deg) rotateX(1deg); }
.lp-window-bar { display:flex; align-items:center; gap:7px; padding:10px 13px;
  background:var(--color-bg); border-bottom:1px solid var(--color-divider); }
.lp-dot { width:10px; height:10px; border-radius:50%; }
.lp-window-url { margin-left:12px; font-size:11px; color:var(--color-neutral-500);
  background:var(--color-surface); padding:3px 12px; border-radius:6px; }
.lp-app { display:flex; height:340px; background:var(--color-bg); }
.lp-app-side { width:46px; flex:none; padding:12px 0; display:flex; flex-direction:column; align-items:center; gap:8px;
  border-right:1px solid var(--color-divider); }
.lp-app-brand { width:26px; height:26px; border-radius:7px; display:grid; place-items:center; margin-bottom:8px;
  background:color-mix(in srgb, var(--color-accent) 14%, transparent); }
.lp-app-nav { width:30px; height:30px; border-radius:8px; display:grid; place-items:center; color:var(--color-neutral-600); }
.lp-app-nav.on { background:color-mix(in srgb, var(--color-accent) 16%, transparent); color:var(--color-accent); }
.lp-app-main { flex:1; padding:14px; display:flex; flex-direction:column; gap:11px; min-width:0; }
.lp-app-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:9px; }
.lp-app-stat { background:var(--color-surface); border:1px solid var(--color-divider); border-radius:9px; padding:9px 11px; }
.lp-app-stat-l { font-size:9.5px; color:var(--color-neutral-500); }
.lp-app-stat-v { font-size:14px; font-weight:600; margin-top:3px; letter-spacing:-.01em; }
.lp-app-card { background:var(--color-surface); border:1px solid var(--color-divider); border-radius:10px; padding:11px 12px; }
.lp-app-card-h { font-size:10.5px; color:var(--color-neutral-500); margin-bottom:9px; }
.lp-app-chart { display:flex; align-items:flex-end; gap:8px; height:74px; }
.lp-app-bar { flex:1; border-radius:4px 4px 0 0; background:linear-gradient(180deg, var(--color-accent), var(--color-accent-700));
  animation:lp-grow .9s cubic-bezier(.2,.8,.2,1) both; }
.lp-app-bar:nth-child(6) { background:linear-gradient(180deg, var(--color-accent-300), var(--color-accent)); }
@keyframes lp-grow { from { height:0 !important; } }
.lp-app-list { display:flex; flex-direction:column; gap:0; background:var(--color-surface);
  border:1px solid var(--color-divider); border-radius:10px; overflow:hidden; }
.lp-app-row { display:flex; align-items:center; gap:9px; padding:8px 11px; border-bottom:1px solid var(--color-divider); }
.lp-app-row:last-child { border-bottom:none; }
.lp-app-thumb { width:22px; height:22px; border-radius:6px; flex:none; display:grid; place-items:center;
  background:var(--color-bg); }
.lp-app-row-n { flex:1; font-size:11.5px; }
.lp-app-row-p { font-size:11.5px; font-weight:600; color:var(--color-accent); }

/* spotlights */
.lp-spot-wrap { max-width:1120px; margin:0 auto; padding:40px 26px; display:flex; flex-direction:column; gap:70px; }
.lp-spot { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
.lp-spot.rev .lp-spot-copy { order:2; }
.lp-tag { display:inline-block; font-size:11px; letter-spacing:.08em; font-weight:600; margin-bottom:14px;
  padding:5px 10px; border-radius:6px; color:var(--color-accent);
  background:color-mix(in srgb, var(--color-accent) 12%, transparent); }
.lp-tag.hot { color:var(--dang); background:color-mix(in srgb, var(--dang) 13%, transparent); }
.lp-spot-title { font-size:clamp(23px,3vw,30px); margin:0 0 12px; letter-spacing:-0.02em; font-weight:640; }
.lp-spot-desc { font-size:15px; color:var(--color-neutral-400); line-height:1.66; margin:0 0 18px; }
.lp-points { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.lp-points li { display:flex; align-items:center; gap:10px; font-size:14px; color:var(--color-neutral-200); }

.lp-spot-visual { display:flex; justify-content:center; }
.lp-sv { width:100%; max-width:380px; background:var(--color-surface); border:1px solid var(--color-divider);
  border-radius:16px; padding:26px; box-shadow:0 30px 70px -44px rgba(0,0,0,.55); }
.lp-sv-scan { position:relative; height:96px; border-radius:12px; display:grid; place-items:center;
  background:var(--color-bg); border:1px solid var(--color-divider); overflow:hidden; }
.lp-sv-line { position:absolute; left:14%; right:14%; height:2px; background:var(--color-accent);
  box-shadow:0 0 12px 2px var(--color-accent); animation:lp-scan 2.2s ease-in-out infinite; }
@keyframes lp-scan { 0%,100%{ top:26px; } 50%{ top:66px; } }
.lp-sv-imei { font-family:var(--font-mono, ui-monospace, monospace); font-size:14px; letter-spacing:.04em;
  text-align:center; margin-top:16px; }
.lp-sv-chips { display:flex; gap:8px; justify-content:center; margin-top:14px; }
.lp-sv-chip { font-size:12px; padding:5px 11px; border-radius:14px; color:var(--color-neutral-300);
  border:1px solid var(--color-divider); background:var(--color-bg); }

.lp-sv-lock { display:flex; flex-direction:column; align-items:center; gap:20px; }
.lp-phone { width:150px; height:200px; border-radius:22px; padding:8px;
  background:linear-gradient(160deg, #2a2c3a, #1a1c28); border:1px solid var(--color-divider);
  box-shadow:0 20px 50px -24px rgba(0,0,0,.7); }
.lp-phone-lock { width:100%; height:100%; border-radius:16px; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:7px; text-align:center; padding:12px;
  background:linear-gradient(160deg, color-mix(in srgb, var(--dang) 82%, #000), color-mix(in srgb, var(--dang) 55%, #000)); }
.lp-phone-t { color:#fff; font-size:13px; font-weight:600; }
.lp-phone-s { color:rgba(255,255,255,.8); font-size:10.5px; line-height:1.4; }
.lp-lock-flow { display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center; }
.lp-lock-step { display:inline-flex; align-items:center; gap:5px; font-size:11.5px; padding:6px 10px; border-radius:14px;
  border:1px solid var(--color-divider); }
.lp-lock-step.ok { color:var(--warn); }
.lp-lock-step.hot { color:var(--dang); }
.lp-lock-step.ok2 { color:var(--ok); }
.lp-lock-arrow { color:var(--color-neutral-600); font-size:13px; }

.lp-ai { width:100%; }
.lp-ai-h { display:flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; margin-bottom:14px; }
.lp-ai-row { display:flex; align-items:center; gap:10px; font-size:12.5px; color:var(--color-neutral-300);
  padding:9px 11px; border-radius:9px; background:var(--color-bg); margin-bottom:8px; }

/* sections */
.lp-section { max-width:1120px; margin:0 auto; padding:54px 26px; }
.lp-head { margin-bottom:28px; }
.lp-head h2 { font-size:clamp(24px,3vw,32px); margin:0 0 8px; letter-spacing:-0.02em; font-weight:640; }
.lp-head p { font-size:14.5px; color:var(--color-neutral-500); margin:0; }

.lp-feat-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:14px; }
.lp-feat { padding:22px; border-radius:14px; border:1px solid var(--color-divider); background:var(--color-surface);
  transition:transform .2s, border-color .2s, box-shadow .2s; }
.lp-feat:hover { transform:translateY(-3px); border-color:color-mix(in srgb, var(--color-accent) 45%, transparent);
  box-shadow:0 18px 40px -28px rgba(0,0,0,.5); }
.lp-feat-ic { width:44px; height:44px; border-radius:11px; display:grid; place-items:center; margin-bottom:14px;
  background:color-mix(in srgb, var(--color-accent) 12%, transparent); }
.lp-feat-title { font-size:15.5px; font-weight:600; margin-bottom:7px; }
.lp-feat-desc { font-size:13.5px; color:var(--color-neutral-400); line-height:1.62; }

.lp-roles { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; }
.lp-role { padding:20px; border-radius:14px; border:1px solid var(--color-divider); background:var(--color-surface);
  display:flex; flex-direction:column; gap:9px; transition:transform .2s, border-color .2s; }
.lp-role:hover { transform:translateY(-3px); border-color:color-mix(in srgb, var(--color-accent) 40%, transparent); }
.lp-role-title { font-size:14.5px; font-weight:600; }
.lp-role-desc { font-size:12.5px; color:var(--color-neutral-500); line-height:1.5; }

/* final cta */
.lp-final { position:relative; overflow:hidden; text-align:center; padding:56px 30px; border-radius:20px;
  border:1px solid var(--color-divider);
  background:linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 8%, var(--color-surface)), var(--color-surface)); }
.lp-final-title { font-size:clamp(24px,3.4vw,34px); margin:0 0 12px; letter-spacing:-0.02em; font-weight:650; position:relative; }
.lp-final-sub { font-size:15px; color:var(--color-neutral-400); max-width:480px; margin:0 auto 26px; line-height:1.6; position:relative; }
.lp-tg { display:inline-flex; align-items:center; gap:8px; padding:0 18px; height:44px; border-radius:10px;
  font-size:14.5px; color:var(--color-neutral-200); border:1px solid var(--color-divider); transition:border-color .2s, color .2s; }
.lp-tg:hover { color:#fff; border-color:color-mix(in srgb, var(--color-accent) 50%, transparent); }

/* footer */
.lp-footer { border-top:1px solid var(--color-divider); padding:26px; max-width:1120px; margin:0 auto;
  display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
.lp-footer-note { font-size:12.5px; color:var(--color-neutral-500); }

/* reveal */
.reveal { opacity:0; transform:translateY(22px); transition:opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1); }
.reveal.in { opacity:1; transform:none; }

/* responsive */
@media (max-width:900px) {
  .lp-hero-grid { grid-template-columns:1fr; gap:36px; }
  .lp-hero-visual { order:2; }
  .lp-window { transform:none; }
  .lp-spot, .lp-spot.rev { grid-template-columns:1fr; gap:28px; }
  .lp-spot.rev .lp-spot-copy { order:0; }
  .lp-links { display:none; }
}
@media (max-width:520px) {
  .lp-nav-inner, .lp-hero, .lp-section, .lp-spot-wrap { padding-left:18px; padding-right:18px; }
  .lp-trust { gap:14px; }
  .lp-app { height:300px; }
}
`;
