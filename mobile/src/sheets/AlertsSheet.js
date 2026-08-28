import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useData } from '../DataContext';
import { Sheet, Txt, Tap, Icon, EmptyState } from '../ui';
import { money } from '../lib/format';
import { alpha, R } from '../theme';

/* ══════════════════════════════════════════════════════════════════════════
   Ogohlantirishlar

   Asosiy ekrandagi qo'ng'iroq tugmasi shuni ochadi. Qizil nuqta aynan
   shu ro'yxat bo'sh bo'lmaganda yonadi.

   Bu yerda hech qanday "bildirishnoma tarixi" yo'q — do'konning
   HOZIRGI holati ko'rsatiladi: nima tugagan, kimning muddati o'tgan,
   qaysi buyurtma javob kutyapti. Har qatorni bosib to'g'ri o'sha
   joyga o'tiladi.
   ══════════════════════════════════════════════════════════════════════ */

export default function AlertsSheet({ visible, onClose, navigation }) {
  const { t } = useTheme();
  const d = useData();

  const go = (screen, params) => {
    onClose?.();
    navigation.navigate(screen, params);
  };

  const rows = [];

  if (d.pendingOrders.length) {
    rows.push({
      key: 'orders',
      icon: 'tray',
      color: t.blue,
      rgb: t.blueRgb,
      title: `${d.pendingOrders.length} yangi buyurtma`,
      sub: 'Mijoz javob kutyapti',
      go: () => go('Buyurtma'),
    });
  }

  if (d.alerts.overdue.length) {
    const sum = d.alerts.overdue.reduce(
      (s, x) => s + Number(x.amount || 0) - Number(x.paid_amount || 0), 0
    );
    rows.push({
      key: 'debt',
      icon: 'clock',
      color: t.err,
      rgb: t.errRgb,
      title: `${d.alerts.overdue.length} nasiya muddati o‘tgan`,
      sub: `${money(sum)} so‘m qaytarilmagan`,
      go: () => go('Yana', { screen: 'Nasiya' }),
    });
  }

  if (d.alerts.out.length) {
    rows.push({
      key: 'out',
      icon: 'x-circle',
      color: t.err,
      rgb: t.errRgb,
      title: `${d.alerts.out.length} tovar tugagan`,
      sub: d.alerts.out.slice(0, 3).map((p) => p.name).join(', '),
      go: () => go('Ombor', { filter: 'out' }),
    });
  }

  if (d.alerts.low.length) {
    rows.push({
      key: 'low',
      icon: 'warning',
      color: t.warn,
      rgb: t.warnRgb,
      title: `${d.alerts.low.length} tovar kam qoldi`,
      sub: d.alerts.low.slice(0, 3).map((p) => p.name).join(', '),
      go: () => go('Ombor', { filter: 'low' }),
    });
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Ogohlantirishlar">
      {rows.length === 0 ? (
        <EmptyState
          icon="check-circle"
          color={t.ok}
          title="Hammasi joyida"
          text="Diqqat talab qiladigan narsa yo‘q"
          style={{ paddingVertical: 40 }}
        />
      ) : rows.map((r) => (
        <Tap
          key={r.key}
          onPress={r.go}
          activeStyle={{ opacity: 0.7 }}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            padding: 13, marginBottom: 10, borderRadius: R.lg,
            backgroundColor: t.inset,
            borderWidth: 1, borderColor: alpha(r.rgb, 0.35),
          }}
        >
          <Icon name={r.icon} size={21} color={r.color} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt size={14.5} weight="500" color={r.color}>{r.title}</Txt>
            <Txt size={12} color={t.t3} numberOfLines={1} style={{ marginTop: 2 }}>
              {r.sub}
            </Txt>
          </View>
          <Icon name="caret-right" size={16} color={t.t4} />
        </Tap>
      ))}
    </Sheet>
  );
}
