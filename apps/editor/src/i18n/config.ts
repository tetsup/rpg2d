import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import jaCommon from './locales/ja/common.json';
import enCommon from './locales/en/common.json';

export const supportedLngs = {
  en: 'English',
  ja: '日本語',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ja',
    supportedLngs: Object.keys(supportedLngs),
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ja: { common: jaCommon },
      en: { common: enCommon },
    },
  });

export default i18n;
