/**
 * テーマモジュール
 * カスタムテーマとユーティリティのエクスポート
 */

// 型定義
export type { ThemeColors, EditorTheme } from './types';

// テーマ定義
export { DARK_THEMES } from './dark-themes';
export { LIGHT_THEMES } from './light-themes';

// ユーティリティ
export {
  CUSTOM_THEMES,
  getThemeById,
  getLightThemes,
  getDarkThemes,
  DEFAULT_EDITOR_COLORS,
} from './utils';
