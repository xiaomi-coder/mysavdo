import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Icon, Btn } from '../components/UI';

/* ══════════════════════════════════════════════════════════════════════════
   Ochiq sahifa (landing)

   Dizayn maketida bu ekran chizilmagan — Nocturne tokenlari asosida
   qolgan sahifalarga mos qilib yasaldi.
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

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Yuqori panel ── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 26px', maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 34, height: 34, flex: 'none', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-accent)', color: 'var(--color-accent)',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name="storefront" fill size={19} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>MyBazzar</span>
        </div>
        <Btn variant="primary" onClick={() => navigate('/login')}>Tizimga kirish</Btn>
      </header>

      {/* ── Hero ── */}
      <section style={{
        maxWidth: 1100, margin: '0 auto', padding: '64px 26px 56px', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '-30%', left: '10%', width: 640, height: 640,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 65%)',
        }} />

        <div style={{ position: 'relative', maxWidth: 720 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 20,
            padding: '5px 12px', borderRadius: 16, fontSize: 12,
            border: '1px solid var(--color-accent)', color: 'var(--color-accent)',
          }}>
            <Icon name="translate" size={13} />
            To‘liq o‘zbek tilida
          </div>

          <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: '0 0 16px' }}>
            Do‘koningizni bitta<br />oynadan boshqaring
          </h1>

          <p style={{ fontSize: 16, color: 'var(--color-neutral-400)', lineHeight: 1.6, maxWidth: 560 }}>
            Kassa, ombor, nasiya, mijozlar va hisobotlar — hammasi bir tizimda.
            Telefon do‘konlari uchun IMEI bo‘yicha hisob yuritish ham bor.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
            <Btn variant="primary" size="lg" icon="arrow-right" onClick={() => navigate('/login')}>
              Tizimga kirish
            </Btn>
            <Btn variant="secondary" size="lg" icon="caret-down"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Imkoniyatlar
            </Btn>
          </div>
        </div>
      </section>

      {/* ── Imkoniyatlar ── */}
      <section id="features" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 26px 56px' }}>
        <h2 style={{ marginBottom: 6 }}>Nimalar bor</h2>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 26 }}>
          Har bir bo‘lim kundalik ishdan kelib chiqib yasalgan
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {FEATURES.map(f => (
            <Card key={f.title} padding="var(--space-6)" gap={10}>
              <Icon name={f.icon} size={24} color="var(--color-accent)" />
              <div style={{ fontSize: 15, fontWeight: 500 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', lineHeight: 1.6 }}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Rollar ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 26px 56px' }}>
        <h2 style={{ marginBottom: 6 }}>Har kim o‘z ishini ko‘radi</h2>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 26 }}>
          Xodimga qaysi bo‘limlar ochiq bo‘lishini o‘zingiz belgilaysiz
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {ROLES.map(r => (
            <Card key={r.title} padding="var(--space-6)" gap={8}>
              <Icon name={r.icon} size={20} color="var(--color-accent)" />
              <div style={{ fontSize: 14, fontWeight: 500 }}>{r.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>{r.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Yakuniy chaqiruv ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 26px 80px' }}>
        <Card elev="md" padding="var(--space-8)" gap={14}
          style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 500 }}>Boshlashga tayyormisiz?</div>
          <div style={{ fontSize: 13.5, color: 'var(--color-neutral-400)', maxWidth: 460 }}>
            Do‘kon ochish uchun biz bilan bog‘laning — hisobingiz tayyorlanadi
            va kirish ma’lumotlari beriladi.
          </div>
          <Btn variant="primary" size="lg" icon="arrow-right" onClick={() => navigate('/login')}>
            Tizimga kirish
          </Btn>
        </Card>
      </section>

      <footer style={{
        borderTop: '1px solid var(--color-divider)', padding: '20px 26px',
        textAlign: 'center', fontSize: 12, color: 'var(--color-neutral-500)',
      }}>
        MyBazzar · mybazzar.uz
      </footer>
    </div>
  );
}
