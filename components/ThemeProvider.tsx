'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEditorStore } from '@/lib/store';
import { CUSTOM_THEMES, type EditorTheme } from '@/lib/themes';

const applyThemeColors = (theme: EditorTheme) => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
};

const resetThemeColors = () => {
  const root = document.documentElement;
  const cssVars = [
    '--background', '--foreground', '--card', '--card-foreground',
    '--popover', '--popover-foreground', '--primary', '--primary-foreground',
    '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
    '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
    '--border', '--input', '--ring'
  ];
  cssVars.forEach(v => root.style.removeProperty(v));
};

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const editorTheme = useEditorStore((state) => state.settings.theme);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const customTheme = CUSTOM_THEMES.find(t => t.id === editorTheme);
    if (customTheme) {
      // カスタムテーマの場合: ベーステーマ（dark/light）を設定してからCSS変数を適用
      setTheme(customTheme.type);
      // 少し遅延させてdarkクラスが適用されてからCSS変数を上書き
      setTimeout(() => {
        applyThemeColors(customTheme);
      }, 0);
    } else {
      // 標準テーマの場合: CSS変数をリセットしてnext-themesに任せる
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
