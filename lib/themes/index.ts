/**
 * カスタムテーマ定義
 * モダンで美しいエディタテーマのコレクション
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
}

export const CUSTOM_THEMES: EditorTheme[] = [
  // ========== Dark Themes ==========
  {
    id: 'midnight-aurora',
    name: 'Midnight Aurora',
    nameJa: 'ミッドナイトオーロラ',
    type: 'dark',
    monacoTheme: 'vs-dark',
    preview: {
      bg: '#0f0f23',
      accent: '#64ffda',
      text: '#ccd6f6',
    },
    colors: {
      background: '234 30% 7%',
      foreground: '220 20% 88%',
      card: '234 25% 10%',
      cardForeground: '220 20% 88%',
      popover: '234 25% 10%',
      popoverForeground: '220 20% 88%',
      primary: '166 100% 70%',
      primaryForeground: '234 30% 7%',
      secondary: '234 20% 18%',
      secondaryForeground: '220 20% 88%',
      muted: '234 20% 15%',
      mutedForeground: '220 15% 55%',
      accent: '270 60% 60%',
      accentForeground: '220 20% 98%',
      destructive: '0 70% 50%',
      destructiveForeground: '220 20% 98%',
      border: '234 20% 18%',
      input: '234 20% 18%',
      ring: '166 100% 70%',
    },
  },
  {
    id: 'synthwave-84',
    name: 'Synthwave \'84',
    nameJa: 'シンセウェーブ \'84',
    type: 'dark',
    monacoTheme: 'vs-dark',
    preview: {
      bg: '#262335',
      accent: '#ff7edb',
      text: '#f4eeff',
    },
    colors: {
      background: '265 25% 17%',
      foreground: '270 100% 97%',
      card: '265 25% 14%',
      cardForeground: '270 100% 97%',
      popover: '265 25% 14%',
      popoverForeground: '270 100% 97%',
      primary: '313 100% 68%',
      primaryForeground: '265 25% 10%',
      secondary: '265 20% 25%',
      secondaryForeground: '270 100% 97%',
      muted: '265 20% 22%',
      mutedForeground: '270 30% 65%',
      accent: '190 100% 60%',
      accentForeground: '265 25% 10%',
      destructive: '0 70% 50%',
      destructiveForeground: '270 100% 97%',
      border: '265 20% 25%',
      input: '265 20% 25%',
      ring: '313 100% 68%',
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    nameJa: 'トーキョーナイト',
    type: 'dark',
    monacoTheme: 'vs-dark',
    preview: {
      bg: '#1a1b26',
      accent: '#7aa2f7',
      text: '#c0caf5',
    },
    colors: {
      background: '235 25% 13%',
      foreground: '231 70% 88%',
      card: '235 25% 11%',
      cardForeground: '231 70% 88%',
      popover: '235 25% 11%',
      popoverForeground: '231 70% 88%',
      primary: '224 80% 72%',
      primaryForeground: '235 25% 10%',
      secondary: '235 20% 20%',
      secondaryForeground: '231 70% 88%',
      muted: '235 20% 18%',
      mutedForeground: '231 30% 55%',
      accent: '339 70% 68%',
      accentForeground: '231 70% 98%',
      destructive: '0 70% 55%',
      destructiveForeground: '231 70% 98%',
      border: '235 20% 20%',
      input: '235 20% 20%',
      ring: '224 80% 72%',
    },
  },
  {
    id: 'nord-deep',
    name: 'Nord Deep',
    nameJa: 'ノルドディープ',
    type: 'dark',
    monacoTheme: 'vs-dark',
    preview: {
      bg: '#242933',
      accent: '#88c0d0',
      text: '#eceff4',
    },
    colors: {
      background: '220 20% 17%',
      foreground: '218 27% 94%',
      card: '220 20% 14%',
      cardForeground: '218 27% 94%',
      popover: '220 20% 14%',
      popoverForeground: '218 27% 94%',
      primary: '193 43% 67%',
      primaryForeground: '220 20% 10%',
      secondary: '220 16% 25%',
      secondaryForeground: '218 27% 94%',
      muted: '220 16% 22%',
      mutedForeground: '219 20% 60%',
      accent: '179 25% 65%',
      accentForeground: '220 20% 10%',
      destructive: '354 42% 56%',
      destructiveForeground: '218 27% 94%',
      border: '220 16% 25%',
      input: '220 16% 25%',
      ring: '193 43% 67%',
    },
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    nameJa: 'GitHub ダーク',
    type: 'dark',
    monacoTheme: 'vs-dark',
    preview: {
      bg: '#0d1117',
      accent: '#58a6ff',
      text: '#c9d1d9',
    },
    colors: {
      background: '215 28% 7%',
      foreground: '212 15% 81%',
      card: '215 25% 10%',
      cardForeground: '212 15% 81%',
      popover: '215 25% 10%',
      popoverForeground: '212 15% 81%',
      primary: '212 100% 67%',
      primaryForeground: '215 28% 7%',
      secondary: '215 20% 18%',
      secondaryForeground: '212 15% 81%',
      muted: '215 20% 15%',
      mutedForeground: '212 12% 55%',
      accent: '130 50% 50%',
      accentForeground: '215 28% 7%',
      destructive: '0 70% 55%',
      destructiveForeground: '212 15% 95%',
      border: '215 20% 18%',
      input: '215 20% 18%',
      ring: '212 100% 67%',
    },
  },
  {
    id: 'dracula-pro',
    name: 'Dracula Pro',
    nameJa: 'ドラキュラプロ',
    type: 'dark',
    monacoTheme: 'vs-dark',
    preview: {
      bg: '#22212c',
      accent: '#ff80bf',
      text: '#f8f8f2',
    },
    colors: {
      background: '250 15% 15%',
      foreground: '60 30% 96%',
      card: '250 15% 12%',
      cardForeground: '60 30% 96%',
      popover: '250 15% 12%',
      popoverForeground: '60 30% 96%',
      primary: '330 100% 75%',
      primaryForeground: '250 15% 10%',
      secondary: '250 12% 22%',
      secondaryForeground: '60 30% 96%',
      muted: '250 12% 20%',
      mutedForeground: '250 10% 60%',
      accent: '135 60% 60%',
      accentForeground: '250 15% 10%',
      destructive: '0 70% 55%',
      destructiveForeground: '60 30% 96%',
      border: '250 12% 22%',
      input: '250 12% 22%',
      ring: '330 100% 75%',
    },
  },

  // ========== Light Themes ==========
  {
    id: 'sakura-blossom',
    name: 'Sakura Blossom',
    nameJa: 'さくらブロッサム',
    type: 'light',
    monacoTheme: 'vs',
    preview: {
      bg: '#fef7f9',
      accent: '#e85d8c',
      text: '#4a3f47',
    },
    colors: {
      background: '345 60% 98%',
      foreground: '330 12% 27%',
      card: '345 50% 99%',
      cardForeground: '330 12% 27%',
      popover: '345 50% 99%',
      popoverForeground: '330 12% 27%',
      primary: '340 75% 58%',
      primaryForeground: '345 60% 98%',
      secondary: '340 30% 93%',
      secondaryForeground: '330 12% 27%',
      muted: '340 25% 94%',
      mutedForeground: '330 10% 50%',
      accent: '330 60% 70%',
      accentForeground: '330 12% 20%',
      destructive: '0 70% 50%',
      destructiveForeground: '345 60% 98%',
      border: '340 25% 90%',
      input: '340 25% 90%',
      ring: '340 75% 58%',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    nameJa: 'オーシャンブリーズ',
    type: 'light',
    monacoTheme: 'vs',
    preview: {
      bg: '#f5fafc',
      accent: '#0891b2',
      text: '#1e3a4f',
    },
    colors: {
      background: '195 45% 98%',
      foreground: '205 45% 22%',
      card: '195 40% 99%',
      cardForeground: '205 45% 22%',
      popover: '195 40% 99%',
      popoverForeground: '205 45% 22%',
      primary: '188 90% 37%',
      primaryForeground: '195 45% 98%',
      secondary: '195 30% 92%',
      secondaryForeground: '205 45% 22%',
      muted: '195 25% 94%',
      mutedForeground: '205 25% 45%',
      accent: '168 70% 45%',
      accentForeground: '205 45% 15%',
      destructive: '0 70% 50%',
      destructiveForeground: '195 45% 98%',
      border: '195 25% 88%',
      input: '195 25% 88%',
      ring: '188 90% 37%',
    },
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    nameJa: 'GitHub ライト',
    type: 'light',
    monacoTheme: 'vs',
    preview: {
      bg: '#ffffff',
      accent: '#0969da',
      text: '#24292f',
    },
    colors: {
      background: '0 0% 100%',
      foreground: '210 12% 16%',
      card: '0 0% 100%',
      cardForeground: '210 12% 16%',
      popover: '0 0% 100%',
      popoverForeground: '210 12% 16%',
      primary: '212 92% 45%',
      primaryForeground: '0 0% 100%',
      secondary: '210 15% 95%',
      secondaryForeground: '210 12% 16%',
      muted: '210 15% 96%',
      mutedForeground: '210 10% 45%',
      accent: '130 50% 40%',
      accentForeground: '0 0% 100%',
      destructive: '0 70% 50%',
      destructiveForeground: '0 0% 100%',
      border: '210 15% 90%',
      input: '210 15% 90%',
      ring: '212 92% 45%',
    },
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    nameJa: 'ミントフレッシュ',
    type: 'light',
    monacoTheme: 'vs',
    preview: {
      bg: '#f5fdf8',
      accent: '#10b981',
      text: '#1f3d2e',
    },
    colors: {
      background: '145 50% 98%',
      foreground: '150 35% 18%',
      card: '145 45% 99%',
      cardForeground: '150 35% 18%',
      popover: '145 45% 99%',
      popoverForeground: '150 35% 18%',
      primary: '160 84% 39%',
      primaryForeground: '145 50% 98%',
      secondary: '150 30% 92%',
      secondaryForeground: '150 35% 18%',
      muted: '150 25% 94%',
      mutedForeground: '150 20% 45%',
      accent: '175 70% 40%',
      accentForeground: '150 35% 10%',
      destructive: '0 70% 50%',
      destructiveForeground: '145 50% 98%',
      border: '150 25% 88%',
      input: '150 25% 88%',
      ring: '160 84% 39%',
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    nameJa: 'サンセットグロウ',
    type: 'light',
    monacoTheme: 'vs',
    preview: {
      bg: '#fffbf5',
      accent: '#f97316',
      text: '#44321f',
    },
    colors: {
      background: '36 100% 98%',
      foreground: '30 40% 20%',
      card: '36 80% 99%',
      cardForeground: '30 40% 20%',
      popover: '36 80% 99%',
      popoverForeground: '30 40% 20%',
      primary: '25 95% 53%',
      primaryForeground: '36 100% 98%',
      secondary: '30 35% 92%',
      secondaryForeground: '30 40% 20%',
      muted: '30 30% 94%',
      mutedForeground: '30 20% 45%',
      accent: '350 80% 55%',
      accentForeground: '36 100% 98%',
      destructive: '0 70% 50%',
      destructiveForeground: '36 100% 98%',
      border: '30 30% 88%',
      input: '30 30% 88%',
      ring: '25 95% 53%',
    },
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    nameJa: 'ラベンダードリーム',
    type: 'light',
    monacoTheme: 'vs',
    preview: {
      bg: '#faf8ff',
      accent: '#8b5cf6',
      text: '#3b2e5a',
    },
    colors: {
      background: '260 60% 99%',
      foreground: '260 35% 27%',
      card: '260 50% 100%',
      cardForeground: '260 35% 27%',
      popover: '260 50% 100%',
      popoverForeground: '260 35% 27%',
      primary: '262 83% 66%',
      primaryForeground: '260 60% 99%',
      secondary: '260 30% 93%',
      secondaryForeground: '260 35% 27%',
      muted: '260 25% 95%',
      mutedForeground: '260 15% 50%',
      accent: '290 70% 60%',
      accentForeground: '260 35% 20%',
      destructive: '0 70% 50%',
      destructiveForeground: '260 60% 99%',
      border: '260 25% 90%',
      input: '260 25% 90%',
      ring: '262 83% 66%',
    },
  },
];

// テーマIDからテーマを取得
export const getThemeById = (id: string): EditorTheme | undefined => {
  return CUSTOM_THEMES.find(theme => theme.id === id);
};

// ライトテーマのみ取得
export const getLightThemes = (): EditorTheme[] => {
  return CUSTOM_THEMES.filter(theme => theme.type === 'light');
};

// ダークテーマのみ取得
export const getDarkThemes = (): EditorTheme[] => {
  return CUSTOM_THEMES.filter(theme => theme.type === 'dark');
};
