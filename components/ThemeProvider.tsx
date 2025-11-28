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

/**
 * カスタムテーマのCSS変数を適用
 * !important を使用してglobals.cssの.darkクラスを上書き
 */
const applyThemeColors = (theme: EditorTheme) => {
  const root = document.documentElement;

  // カスタムテーマ用のstyle要素を取得または作成
  let styleEl = document.getElementById('custom-theme-vars') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-theme-vars';
    document.head.appendChild(styleEl);
  }

  // CSS変数を生成
  const cssVars = Object.entries(theme.colors)
    .map(([key, value]) => `--${camelToKebab(key)}: ${value} !important;`)
    .join('\n  ');

  // :root と .dark 両方に適用して確実に上書き
  styleEl.textContent = `
:root {
  ${cssVars}
}
.dark {
  ${cssVars}
}
`;

  // data属性でカスタムテーマを識別
  root.setAttribute('data-custom-theme', theme.id);
};

/**
 * カスタムテーマのCSS変数をリセット
 */
const resetThemeColors = () => {
  const root = document.documentElement;

  // カスタムstyle要素を削除
  const styleEl = document.getElementById('custom-theme-vars');
  if (styleEl) {
    styleEl.remove();
  }

  // data属性を削除
  root.removeAttribute('data-custom-theme');
};

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const editorTheme = useEditorStore((state) => state.settings.theme);
  const { setTheme, resolvedTheme } = useTheme();
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
      // ベーステーマ（dark/light）を設定
      setTheme(customTheme.type);

      // CSS変数を適用（複数フレーム待機して確実に適用）
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

  // resolvedThemeが変更された時もカスタムテーマを再適用
  React.useEffect(() => {
    if (!mounted) return;

    const customTheme = CUSTOM_THEMES.find(t => t.id === editorTheme);
    if (customTheme) {
      // resolvedThemeが変更されたら再適用
      requestAnimationFrame(() => {
        applyThemeColors(customTheme);
      });
    }
  }, [resolvedTheme, editorTheme, mounted]);

  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeInitializer>{children}</ThemeInitializer>
    </NextThemesProvider>
  );
}
