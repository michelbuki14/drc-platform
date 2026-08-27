'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface I18nContextType {
  locale: string;
  setLocale: (lng: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nCtx = createContext<I18nContextType | null>(null);

function lookup(messages: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return '';
    }
  }
  return typeof cur === 'string' ? cur : '';
}

function interp(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{([^}]+)\}/g, (_, k) => {
    const v = params[k];
    return v !== undefined ? String(v) : `{${k}}`;
  });
}

// ── SSR-safe hook ───────────────────────────────────────────────────────────
// During SSR (or before the provider mounts on the client), we return a
// safe no-op so components don't crash. The I18nProvider will take over
// on the client side once it hydrates.
export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) {
    // Safe SSR/client-no-provider fallback — renders the key as-is.
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key: string, params?: Record<string, string | number>) => interp(key, params),
    };
  }
  return ctx;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>('en');
  const [messages, setMessages] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const stored = localStorage.getItem('cc-locale') || 'en';
    setLocale(stored);
    import(`../lib/messages/${stored}.json`).then(mod => {
      setMessages((mod as { default: Record<string, unknown> }).default);
    }).catch(() => {
      import(`../lib/messages/en.json`).then(mod => {
        setMessages((mod as { default: Record<string, unknown> }).default);
      });
    });
  }, []);

  const setLng = useCallback((lng: string) => {
    localStorage.setItem('cc-locale', lng);
    setLocale(lng);
    import(`../lib/messages/${lng}.json`).then(mod => {
      setMessages((mod as { default: Record<string, unknown> }).default);
    }).catch(() => {
      import(`../lib/messages/en.json`).then(mod => {
        setMessages((mod as { default: Record<string, unknown> }).default);
      });
    });
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return interp(lookup(messages, key) || key, params);
  }, [messages]);

  return (
    <I18nCtx.Provider value={{ locale, setLocale: setLng, t }}>
      {children}
    </I18nCtx.Provider>
  );
}
