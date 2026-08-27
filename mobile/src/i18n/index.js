import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeTranslator, DICTS } from './translate';
import { setLocale } from '../lib/format';

/* Tillar: o'zbekcha, ruscha, inglizcha.

   Matnlarning o'zi ekranlarda emas, komponentlar ichida tarjima
   qilinadi (Txt, Btn, Chip, Input...). Shu sababli ekran fayllarida
   birorta t('...') chaqiruvi yo'q — kod o'zbekcha o'qilishda qoladi.

   Tarjima qoidasi translate.js da. */

export const LANGS = [
  { key: 'uz', label: "O'zbekcha", short: 'UZ' },
  { key: 'ru', label: 'Русский', short: 'RU' },
  { key: 'en', label: 'English', short: 'EN' },
];

const KEY = 'mb.lang';
const Ctx = createContext({ lang: 'uz', tr: (s) => s, setLang: () => {} });

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('uz');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v && (v === 'uz' || DICTS[v])) { setLang(v); setLocale(v); }
      setReady(true);
    });
  }, []);

  const value = useMemo(() => ({
    lang,
    tr: makeTranslator(lang),
    setLang: (next) => {
      setLang(next);
      setLocale(next);              // sana va "5 daq oldin" ham o'zgaradi
      AsyncStorage.setItem(KEY, next).catch(() => {});
    },
  }), [lang]);

  if (!ready) return null;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

/** Faqat tarjimon kerak bo'lganda — komponentlar shuni ishlatadi */
export const useTr = () => useContext(Ctx).tr;

export { makeTranslator };
