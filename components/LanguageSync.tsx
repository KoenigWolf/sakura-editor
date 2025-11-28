'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/lib/store';
import i18n from '@/lib/i18n';

export function LanguageSync() {
  const { settings } = useEditorStore();
  const lang = settings.language ?? 'en';

  useEffect(() => {
    i18n.changeLanguage(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return null;
}
