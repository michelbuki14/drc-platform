'use client';

import { ReactNode } from 'react';
import { I18nProvider } from '@/hooks/useI18n';

export default function I18nWrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
