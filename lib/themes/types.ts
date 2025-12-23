/**
 * テーマ型定義
 */

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface EditorTheme {
  id: string;
  name: string;
  nameJa: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
  monacoTheme: 'vs' | 'vs-dark' | 'hc-black';
  preview: {
    bg: string;
    accent: string;
    text: string;
  };
  // Monaco Editor用の追加カラー
  editor: {
    background: string; // エディタ背景色 (hex)
    foreground: string; // エディタ前景色 (hex)
    whitespace: string; // 空白文字の色 (hex)
    lineNumber: string; // 行番号の色 (hex)
    selection: string; // 選択範囲の色 (hex)
    cursor: string; // カーソルの色 (hex)
  };
}
