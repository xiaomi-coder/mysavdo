import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { Sheet, Txt, Tap, Icon } from '../ui';
import { buzz } from '../ui/Feedback';
import { R } from '../theme';

/* Filial tanlash. Tanlangan filial bo'yicha qoldiq, sotuv, smena va
   hisobot ko'rinadi, sotuv ham o'sha filialdan yechiladi. Filialga
   biriktirilgan sotuvchi bu yerga kira olmaydi (More da qulf). */

export default function BranchSheet({ onClose }) {
  const { t } = useTheme();
  const { branches, branch, chooseBranch } = useAuth();

  const pick = (id) => {
    buzz('tap');
    chooseBranch(id);
    onClose?.();
  };

  return (
    <Sheet visible onClose={onClose} title="Filialni tanlang"
      sub="Qoldiq, sotuv va kassa shu filial bo‘yicha">
      <View style={{ gap: 8 }}>
        {branches.map((b) => {
          const on = b.id === branch;
          return (
            <Tap key={b.id} onPress={() => pick(b.id)} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
              borderRadius: R.lg, borderWidth: 1,
              borderColor: on ? t.acc : t.line, backgroundColor: on ? t.inset : 'transparent',
            }}>
              <Icon name="map-pin" size={20} color={on ? t.acc : t.t3} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt size={15} weight="500" numberOfLines={1}>
                  {b.name}{b.is_main ? ' · asosiy' : ''}
                </Txt>
                {b.address ? <Txt size={12} color={t.t3} numberOfLines={1}>{b.address}</Txt> : null}
              </View>
              {on ? <Icon name="check" size={18} color={t.acc} /> : null}
            </Tap>
          );
        })}
      </View>
    </Sheet>
  );
}
