'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEditorStore } from '@/lib/store';
import { CUSTOM_THEMES, type EditorTheme } from '@/lib/themes';

const camelToKebab = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * カスタムテーマのCSS変数を適用（!importantでglobals.cssを上書き）
 */
const applyThemeColors = (theme: EditorTheme) => {
  const root = document.documentElement;

  let styleEl = document.getElementById('custom-theme-vars') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-theme-vars';
    document.head.appendChild(styleEl);
  }

  const cssVars = Object.entries(theme.colors)
    .map(([key, value]) => `--${camelToKebab(key)}: ${value} !important;`)
    .join('\n  ');

  styleEl.textContent = `:root { ${cssVars} } .dark { ${cssVars} }`;
  root.setAttribute('data-custom-theme', theme.id);
};

const resetThemeColors = () => {
  const styleEl = document.getElementById('custom-theme-vars');
  if (styleEl) styleEl.remove();
  document.documentElement.removeAttribute('data-custom-theme');
};

const ThemeInitializer = ({ children }: { children: ReactNode }) => {
  const editorTheme = useEditorStore((state) => state.settings.theme);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const prevThemeRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (prevThemeRef.current === editorTheme) return;
    prevThemeRef.current = editorTheme;

    const customTheme = CUSTOM_THEMES.find(t => t.id === editorTheme);

    if (customTheme) {
      setTheme(customTheme.type);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => applyThemeColors(customTheme));
      });
    } else {
      resetThemeColors();
      setTheme(editorTheme);
    }
  }, [editorTheme, mounted, setTheme]);

  useEffect(() => {
    if (!mounted) return;
    const customTheme = CUSTOM_THEMES.find(t => t.id === editorTheme);
    if (customTheme) {
      requestAnimationFrame(() => applyThemeColors(customTheme));
    }
  }, [resolvedTheme, editorTheme, mounted]);

  return <>{children}</>;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeInitializer>{children}</ThemeInitializer>
    </NextThemesProvider>
  );
}
