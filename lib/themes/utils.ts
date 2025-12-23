/**
 * テーマユーティリティ関数
 */

import type { EditorTheme } from './types';
import { DARK_THEMES } from './dark-themes';
import { LIGHT_THEMES } from './light-themes';

/** すべてのカスタムテーマ */
export const CUSTOM_THEMES: EditorTheme[] = [...DARK_THEMES, ...LIGHT_THEMES];

/** テーマIDからテーマを取得 */
export const getThemeById = (id: string): EditorTheme | undefined => {
  return CUSTOM_THEMES.find((theme) => theme.id === id);
};

/** ライトテーマのみ取得 */
export const getLightThemes = (): EditorTheme[] => {
  return LIGHT_THEMES;
};

/** ダークテーマのみ取得 */
export const getDarkThemes = (): EditorTheme[] => {
  return DARK_THEMES;
};

/** デフォルトのエディタ色（標準テーマ用） */
export const DEFAULT_EDITOR_COLORS = {
  light: {
    background: '#ffffff',
    foreground: '#24292f',
    whitespace: '#0969da70',
    lineNumber: '#8c959f',
    selection: '#0969da33',
    cursor: '#24292f',
  },
  dark: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    whitespace: '#569cd680',
    lineNumber: '#858585',
    selection: '#264f7833',
    cursor: '#d4d4d4',
  },
};
