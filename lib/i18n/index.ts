import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './translations/en';
import { ja } from './translations/ja';

const config = {
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
    format: (value: string | number | Date, format?: string, lng?: string) => {
      if (format === 'number' && typeof value === 'number') {
        return new Intl.NumberFormat(lng).format(value);
      }
      if (value instanceof Date) {
        if (format === 'relative') {
          const rtf = new Intl.RelativeTimeFormat(lng, { numeric: 'auto' });
          const diff = value.getTime() - Date.now();
          const days = Math.round(diff / (1000 * 60 * 60 * 24));
          if (Math.abs(days) < 1) {
            const hours = Math.round(diff / (1000 * 60 * 60));
            if (Math.abs(hours) < 1) {
              const minutes = Math.round(diff / (1000 * 60));
              return rtf.format(minutes, 'minute');
            }
            return rtf.format(hours, 'hour');
          }
          return rtf.format(days, 'day');
        }
        return new Intl.DateTimeFormat(lng, {
          dateStyle: format === 'short' ? 'short' : 'medium',
          timeStyle: format === 'time' ? 'short' : undefined,
        }).format(value);
      }
      return String(value);
    },
  },
  pluralSeparator: '_',
  returnNull: false,
};

i18n.use(initReactI18next).init(config);

export default i18n;
