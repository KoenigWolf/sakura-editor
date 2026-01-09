/**
 * テーマモジュール
 * カスタムテーマとユーティリティのエクスポート
 */

// 型定義
export type { ThemeColors, EditorTheme } from './types';

// ユーティリティ
export {
  CUSTOM_THEMES,
  getThemeById,
  getLightThemes,
  getDarkThemes,
  DEFAULT_EDITOR_COLORS,
} from './utils';
