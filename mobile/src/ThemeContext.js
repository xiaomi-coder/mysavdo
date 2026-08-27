import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme } from './theme';

/* Mavzu va akcent rang. Tanlov qurilmada saqlanadi, shuning uchun
   ilova qayta ochilganda o'sha ko'rinishda turadi. */

const Ctx = createContext(null);
const KEY = 'mb.appearance';

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [mode, setMode] = useState(null);      // null = tizimga ergashamiz
  const [accent, setAccent] = useState('binafsha');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) {
        try {
          const v = JSON.parse(raw);
          if (v.mode) setMode(v.mode);
          if (v.accent) setAccent(v.accent);
        } catch {}
      }
      setReady(true);
    });
  }, []);

  const save = (next) => {
    AsyncStorage.setItem(KEY, JSON.stringify({ mode, accent, ...next })).catch(() => {});
  };

  const effective = mode || (system === 'light' ? 'light' : 'dark');
  const t = useMemo(() => buildTheme(effective, accent), [effective, accent]);

  const value = useMemo(() => ({
    t,
    mode: effective,
    followsSystem: mode === null,
    accent,
    toggleMode: () => {
      const next = effective === 'dark' ? 'light' : 'dark';
      setMode(next); save({ mode: next });
    },
    useSystem: () => { setMode(null); save({ mode: null }); },
    setAccent: (a) => { setAccent(a); save({ accent: a }); },
  }), [t, effective, mode, accent]);

  if (!ready) return null;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
