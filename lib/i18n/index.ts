// i18next の初期化設定
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 翻訳データの読み込み
import { en } from './translations/en';
import { ja } from './translations/ja';

// i18n の設定オブジェクト
const config = {
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: 'en',          // 初期言語
  fallbackLng: 'en',  // フォールバック言語
  interpolation: {
    escapeValue: false, // React 側の XSS 対策と重複を避ける
  },
};

// React 用プラグインを使用して初期化
i18n.use(initReactI18next).init(config);

// 初期化済み i18n をエクスポート
export default i18n;
