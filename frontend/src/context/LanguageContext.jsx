import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export const STORAGE_LANG_KEY = 'infobay_language';

/**
 * LanguageProvider manages the application language ('id' | 'en')
 * Default language: 'id' (Bahasa Indonesia) as required by project specification.
 */
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      return saved === 'en' || saved === 'id' ? saved : 'id';
    } catch {
      return 'id';
    }
  });

  const setLanguage = useCallback((lang) => {
    if (lang === 'en' || lang === 'id') {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_LANG_KEY, lang);
      } catch (err) {
        console.error('Failed to persist language in localStorage:', err);
      }
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'id' ? 'en' : 'id';
      try {
        localStorage.setItem(STORAGE_LANG_KEY, next);
      } catch (err) {
        console.error('Failed to persist language in localStorage:', err);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key, fallback = '') => {
    if (!key) return fallback;
    const currentDict = translations[language] || {};
    if (currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to Indonesian if missing in English dictionary
    if (language !== 'id' && translations.id && translations.id[key] !== undefined) {
      return translations.id[key];
    }
    return fallback || key;
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    isIndonesian: language === 'id',
    isEnglish: language === 'en',
    setLanguage,
    toggleLanguage,
    t,
  }), [language, setLanguage, toggleLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'id',
      isIndonesian: true,
      isEnglish: false,
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key, fallback = '') => fallback || key,
    };
  }
  return context;
}

export default LanguageContext;
