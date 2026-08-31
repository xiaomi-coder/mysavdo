import React from 'react';
import { Icon, Btn } from './UI';

/* ══════════════════════════════════════════════════════════════════════════
   Sahifa xato chegarasi

   Bitta bo'limdagi xato butun ilovani o'chirib qo'ymasligi kerak.
   Ilgari shunday bo'lgan: AI Analitikada bitta maydon yo'q bo'lgani uchun
   butun ekran qorayib qolgan — menyu ham, yuqori panel ham yo'qolgan,
   foydalanuvchi boshqa bo'limga o'ta olmagan.

   Endi xato faqat shu sahifa doirasida qoladi. Marshrut o'zgarganda
   chegara `key` orqali qayta tiklanadi (Layout shuni beradi).
   ══════════════════════════════════════════════════════════════════════ */

export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Brauzer konsolida to'liq iz qoladi — nosozlikni topish uchun
    console.error('Sahifa xatosi:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={{ padding: 'var(--space-7, 28px)', maxWidth: 720 }}>
        <div className="card elev-sm" style={{ padding: 'var(--space-6, 22px)', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="warning-circle" fill size={22} color="var(--dang)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Bu bo‘limda xatolik yuz berdi</div>
              <div style={{
                fontSize: 13, color: 'var(--color-neutral-400)',
                marginTop: 5, lineHeight: 1.6,
              }}>
                Ma’lumotlaringiz saqlangan — hech narsa yo‘qolmadi. Boshqa
                bo‘limlar ishlayapti, chapdagi menyudan o‘tishingiz mumkin.
              </div>
            </div>
          </div>

          <details style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>
            <summary style={{ cursor: 'pointer' }}>Texnik tafsilot</summary>
            <pre style={{
              marginTop: 8, padding: 10, borderRadius: 8, overflowX: 'auto',
              background: 'var(--color-bg)', fontSize: 11.5, lineHeight: 1.5,
            }}>
              {String(error?.message || error)}
            </pre>
          </details>

          <div style={{ display: 'flex', gap: 9 }}>
            <Btn variant="primary" icon="arrows-clockwise"
              onClick={() => this.setState({ error: null })}>
              Qayta urinish
            </Btn>
            <Btn variant="secondary" onClick={() => window.location.reload()}>
              Sahifani yangilash
            </Btn>
          </div>
        </div>
      </div>
    );
  }
}
