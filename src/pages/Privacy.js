import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/UI';

/* ══════════════════════════════════════════════════════════════════════════
   Maxfiylik siyosati — ochiq sahifa (/maxfiylik)

   Google Play va App Store ilovani chiqarish uchun shu havolani talab
   qiladi. Matn tizim HAQIQATDA qanday ishlashini yozadi — va'da emas.
   Tizimga o'zgarish kiritilsa (yangi tashqi xizmat, saqlash joyi),
   shu sahifa ham yangilanishi shart.
   ══════════════════════════════════════════════════════════════════════ */

const UPDATED = '19-sentabr, 2026';

const SECTIONS = [
  {
    title: 'Biz kim',
    body: [
      'MyBazzar — do‘konlar uchun savdo, ombor, nasiya va hisobot yuritish platformasi (veb ilova mybazzar.uz va MyBazzar mobil ilovasi).',
      'Platformadan do‘kon egalari va ularning xodimlari foydalanadi. Do‘konning xaridorlari haqidagi ma’lumotni do‘kon o‘zi kiritadi va unga o‘zi javobgar; MyBazzar bu ma’lumotni faqat do‘kon nomidan, uning ishini yuritish uchun saqlaydi va qayta ishlaydi.',
    ],
  },
  {
    title: 'Qanday ma’lumot yig‘iladi',
    list: [
      'Xodim hisobi: ism, email, telefon raqami, rol va ruxsatlar.',
      'Do‘kon ma’lumoti: nomi, manzili, telefoni, STIR (kiritilgan bo‘lsa).',
      'Savdo ma’lumoti: tovarlar, narxlar, qoldiqlar, cheklar, qaytarishlar, kassa smenalari.',
      'Do‘kon kiritgan xaridor ma’lumoti: ism, telefon raqami, xaridlar tarixi, nasiya qarzlari.',
      'Nasiyaga sotilgan telefonlar: model, IMEI, to‘lov jadvali va qulf holati.',
      'Onlayn katalog orqali buyurtma bergan xaridor: ism va telefon raqami.',
    ],
  },
  {
    title: 'Ma’lumot nima uchun ishlatiladi',
    list: [
      'Do‘konning savdo, ombor, nasiya va hisobotlarini yuritish.',
      'Tizimga kirish va har bir xodimga faqat ruxsat berilgan bo‘limlarni ko‘rsatish.',
      'Do‘kon egasiga Telegram orqali hisobot va ogohlantirish yuborish (egasi o‘zi ulasa).',
      'Nasiya to‘lovi kechikkanda do‘kon belgilagan tartibda telefonni cheklash.',
    ],
    note: 'Ma’lumot reklama uchun ishlatilmaydi, sotilmaydi va uchinchi shaxslarga berilmaydi — quyida sanalgan xizmatlardan tashqari.',
  },
  {
    title: 'Qayerda saqlanadi',
    body: [
      'Barcha ma’lumot O‘zbekiston Respublikasi hududida joylashgan serverda saqlanadi.',
      'Har kuni zaxira nusxa olinadi. Zaxiralar 30 kungacha saqlanadi va faqat ma’lumotni tiklash uchun ishlatiladi.',
    ],
  },
  {
    title: 'Qanday himoyalanadi',
    list: [
      'Parollar ochiq holda saqlanmaydi — bir tomonlama shifrlangan (bcrypt) ko‘rinishda. Uni hech kim, jumladan biz ham, o‘qiy olmaydi.',
      'Har bir do‘kon faqat o‘z ma’lumotini ko‘radi — bu server darajasida cheklangan.',
      'Serverga ulanish shifrlangan (HTTPS).',
      'Tizimga kirish vaqtinchalik kalit (token) orqali; u muddati tugagach yaroqsiz bo‘ladi.',
    ],
  },
  {
    title: 'Tashqi xizmatlar',
    list: [
      'Google — nasiyaga sotilgan Android telefonlarni boshqarish va qulflash uchun (faqat shu funksiyadan foydalanadigan do‘konlarda). Google’ga telefonning texnik ma’lumoti uzatiladi.',
      'Telegram — do‘kon egasi botni o‘zi ulagan bo‘lsa, unga hisobot va ogohlantirishlar yuboriladi.',
      'Expo — mobil ilova yangilanishlarini yetkazish uchun. Bu xizmatga foydalanuvchi ma’lumoti uzatilmaydi.',
      'Sentry — ilovada texnik xato yuz berganda uni avtomatik xabar qiladi (serverlari Yevropa Ittifoqida). Yuboriladi: xato matni, sahifa manzili, brauzer turi, do‘kon nomi va foydalanuvchi roli. Yuborilmaydi: parol, kirish tokeni, mijoz ismi va telefoni, savdo summalari.',
      'AI maslahat (Anthropic Claude yoki Google Gemini) — "AI Analitika" bo‘limida do‘kon egasi tugmani bosganda ishlaydi. Yuboriladi: savdo summalari, tovar nomlari va qoldiq raqamlari. Yuborilmaydi: mijoz ismi, telefoni, IMEI, xodim ma’lumoti. Javob do‘kon uchun kuniga bir marta hisoblanadi va bazada saqlanadi.',
    ],
  },
  {
    title: 'Mobil ilova ruxsatlari',
    list: [
      'Kamera — barcode va IMEI skanerlash, tovar suratini olish uchun.',
      'Galereya — tovar suratini tanlash uchun.',
    ],
    note: 'Ilova joylashuvni, kontaktlarni va mikrofonni ishlatmaydi.',
  },
  {
    title: 'Sizning huquqlaringiz',
    body: [
      'Siz o‘zingiz haqingizdagi ma’lumotni ko‘rish, tuzatish yoki o‘chirishni so‘rashingiz mumkin. Xodim hisobini do‘kon egasi o‘chiradi; do‘kon hisobini butunlay o‘chirish uchun biz bilan bog‘laning.',
      'Do‘kon xaridori bo‘lsangiz, o‘z ma’lumotingiz bo‘yicha avval o‘sha do‘konga murojaat qiling — ma’lumotni do‘kon kiritgan va u boshqaradi.',
      'Hisob o‘chirilgach ma’lumot 30 kun ichida asosiy bazadan, zaxiralardan esa ularning muddati tugashi bilan o‘chadi.',
    ],
  },
  {
    title: 'Bolalar',
    body: ['Platforma bizneslar uchun mo‘ljallangan va 16 yoshgacha bo‘lgan shaxslardan ataylab ma’lumot yig‘maydi.'],
  },
  {
    title: 'O‘zgarishlar',
    body: ['Siyosat o‘zgarsa, shu sahifada yangilanadi va yuqoridagi sana o‘zgaradi.'],
  },
];

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{
        maxWidth: 820, margin: '0 auto', padding: '18px 22px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center',
            color: '#fff', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-700))',
          }}>
            <Icon name="storefront" fill size={16} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600 }}>MyBazzar</span>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '10px 22px 60px' }}>
        <h1 style={{ fontSize: 'clamp(26px,4vw,34px)', margin: '8px 0 6px', letterSpacing: '-0.02em' }}>
          Maxfiylik siyosati
        </h1>
        <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginBottom: 28 }}>
          Oxirgi yangilanish: {UPDATED}
        </div>

        {SECTIONS.map((s, i) => (
          <section key={s.title} style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 18, margin: '0 0 10px', fontWeight: 600 }}>
              {i + 1}. {s.title}
            </h2>
            {(s.body || []).map(p => (
              <p key={p} style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--color-neutral-300)', margin: '0 0 8px' }}>{p}</p>
            ))}
            {s.list && (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {s.list.map(li => (
                  <li key={li} style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--color-neutral-300)', marginBottom: 4 }}>{li}</li>
                ))}
              </ul>
            )}
            {s.note && (
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-400)', margin: '10px 0 0' }}>{s.note}</p>
            )}
          </section>
        ))}

        <section style={{
          marginTop: 30, padding: 18, borderRadius: 12,
          border: '1px solid var(--color-divider)', background: 'var(--color-surface)',
        }}>
          <h2 style={{ fontSize: 18, margin: '0 0 8px', fontWeight: 600 }}>Bog‘lanish</h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--color-neutral-300)', margin: 0 }}>
            Maxfiylik bo‘yicha savol yoki so‘rov bo‘lsa, Telegram orqali yozing:{' '}
            <a href="https://t.me/MyBazzaruzbot" target="_blank" rel="noreferrer"
              style={{ color: 'var(--color-accent)' }}>@MyBazzaruzbot</a>
          </p>
        </section>
      </main>
    </div>
  );
}
