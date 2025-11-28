'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEditorStore } from '@/lib/store';
import { CUSTOM_THEMES, type EditorTheme } from '@/lib/themes';

// camelCase を kebab-case に変換
const camelToKebab = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

// テーマで使用するすべてのCSS変数
const ALL_CSS_VARS = [
  '--background', '--foreground',
  '--card', '--card-foreground',
  '--popover', '--popover-foreground',
  '--primary', '--primary-foreground',
  '--secondary', '--secondary-foreground',
  '--muted', '--muted-foreground',
  '--accent', '--accent-foreground',
  '--destructive', '--destructive-foreground',
  '--border', '--input', '--ring'
];

const applyThemeColors = (theme: EditorTheme) => {
  const root = document.documentElement;

  // まず既存のカスタムスタイルをクリア
  ALL_CSS_VARS.forEach(v => root.style.removeProperty(v));

  // 新しいテーマの色を適用
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${camelToKebab(key)}`;
    root.style.setProperty(cssVar, value);
  });
};

const resetThemeColors = () => {
  const root = document.documentElement;
  ALL_CSS_VARS.forEach(v => root.style.removeProperty(v));
};

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const editorTheme = useEditorStore((state) => state.settings.theme);
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const prevThemeRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    // 同じテーマの場合はスキップ
    if (prevThemeRef.current === editorTheme) return;
    prevThemeRef.current = editorTheme;

    const customTheme = CUSTOM_THEMES.find(t => t.id === editorTheme);

    if (customTheme) {
      // カスタムテーマの場合
      // まずCSS変数をリセット
      resetThemeColors();

      // ベーステーマ（dark/light）を設定
      setTheme(customTheme.type);

      // requestAnimationFrameを使用して、DOMの更新後にCSS変数を適用
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          applyThemeColors(customTheme);
        });
      });
    } else {
      // 標準テーマ（light/dark/system）の場合
      resetThemeColors();
      setTheme(editorTheme);
    }
  }, [editorTheme, mounted, setTheme]);

  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeInitializer>{children}</ThemeInitializer>
    </NextThemesProvider>
  );
}
