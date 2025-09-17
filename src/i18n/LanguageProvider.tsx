'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import arDict from '@/locales/ar.json';
import enDict from '@/locales/en.json';

export type Locale = 'en' | 'ar';
type Dict = Record<string, unknown>;

type I18nContextValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: (path: string) => string;
  setLocale: (l: Locale) => void;
};

// ------- helpers -------
function getString(obj: Dict, path: string): string {
  const val = path.split('.').reduce<any>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) return acc[key];
    return undefined;
  }, obj);
  return typeof val === 'string' ? val : path; // fallback: show key if missing
}

function pickDict(locale: Locale): Dict {
  return locale === 'ar' ? (arDict as Dict) : (enDict as Dict);
}

function readPersistedLocale(): Locale | null {
  try {
    if (typeof document !== 'undefined') {
      // cookie first (set by us)
      const m = document.cookie.match(/(?:^|;\s*)locale=(en|ar)/);
      if (m && (m[1] === 'en' || m[1] === 'ar')) return m[1] as Locale;
    }
    if (typeof window !== 'undefined') {
      const ls = window.localStorage.getItem('locale');
      if (ls === 'en' || ls === 'ar') return ls;
    }
  } catch {}
  return null;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ---------------------------------------------

export function LanguageProvider({
  children,
  initialLocale, // optional; if you later want to pass it from server
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  // IMPORTANT: First render must NOT read window/localStorage.
  const [locale, setLocale] = useState<Locale>(initialLocale ?? 'en');
  const [dict, setDict] = useState<Dict>(() => pickDict(initialLocale ?? 'en'));

  // After mount, reconcile with persisted value (if different).
  useEffect(() => {
    const saved = readPersistedLocale();
    if (saved && saved !== locale) {
      // This update runs AFTER hydration, so no mismatch.
      setLocale(saved);
      setDict(pickDict(saved));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep <html lang/dir>, cookie, and localStorage in sync whenever locale changes.
  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', locale);
      document.documentElement.setAttribute('dir', dir);
      document.cookie = `locale=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('locale', locale);
    }
    setDict(pickDict(locale));
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      t: (path: string) => getString(dict, path),
      setLocale: (l: Locale) => setLocale(l),
    }),
    [locale, dict]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider');
  return ctx;
}
