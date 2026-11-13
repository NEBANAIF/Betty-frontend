import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  getLanguage, initialLanguage, onLanguageChange, patchNativeDialogs, primeLanguage, setLanguage, tr,
} from './translate.js';
import { startDomTranslation, stopDomTranslation } from './dom.js';

// Decide the language before the first paint so there is no English flash.
primeLanguage(initialLanguage());
patchNativeDialogs();

const I18nContext = createContext({ lang: 'en', setLang: () => {}, t: (s) => s });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getLanguage());

  useEffect(() => onLanguageChange(setLangState), []);

  // Layout effect: translate before the browser paints, so there is no flash of English.
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    if (lang === 'am') startDomTranslation();
    else stopDomTranslation();
    return () => stopDomTranslation();
  }, [lang]);

  const setLang = useCallback((code) => setLanguage(code), []);
  // `t` changes with the language so components that call it re-render.
  const t = useCallback((s) => tr(s), [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
