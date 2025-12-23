'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import type { editor } from 'monaco-editor';
import type { BeforeMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useEditorStore } from '@/lib/store';
import { getThemeById, DEFAULT_EDITOR_COLORS, CUSTOM_THEMES } from '@/lib/themes';

type Monaco = typeof import('monaco-editor');

/**
 * Monaco Editorのテーマ管理フック
 */
export const useMonacoTheme = () => {
  const { resolvedTheme } = useTheme();
  const settings = useEditorStore((state) => state.settings);
  const [mounted, setMounted] = useState(false);
  const currentThemeRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Monaco Editorがマウントされる前にすべてのカスタムテーマを定義
   */
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    CUSTOM_THEMES.forEach((theme) => {
      const monacoThemeName = `custom-${theme.id}`;
      const baseTheme = theme.type === 'dark' ? 'vs-dark' : 'vs';

      monaco.editor.defineTheme(monacoThemeName, {
        base: baseTheme,
        inherit: true,
        rules: [],
        colors: {
          'editor.background': theme.editor.background,
          'editor.foreground': theme.editor.foreground,
          'editorWhitespace.foreground': theme.editor.whitespace,
          'editorLineNumber.foreground': theme.editor.lineNumber,
          'editor.selectionBackground': theme.editor.selection,
          'editorCursor.foreground': theme.editor.cursor,
        },
      });
    });

    monaco.editor.defineTheme('custom-default-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': DEFAULT_EDITOR_COLORS.dark.background,
        'editor.foreground': DEFAULT_EDITOR_COLORS.dark.foreground,
        'editorWhitespace.foreground': DEFAULT_EDITOR_COLORS.dark.whitespace,
        'editorLineNumber.foreground': DEFAULT_EDITOR_COLORS.dark.lineNumber,
        'editor.selectionBackground': DEFAULT_EDITOR_COLORS.dark.selection,
        'editorCursor.foreground': DEFAULT_EDITOR_COLORS.dark.cursor,
      },
    });

    monaco.editor.defineTheme('custom-default-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': DEFAULT_EDITOR_COLORS.light.background,
        'editor.foreground': DEFAULT_EDITOR_COLORS.light.foreground,
        'editorWhitespace.foreground': DEFAULT_EDITOR_COLORS.light.whitespace,
        'editorLineNumber.foreground': DEFAULT_EDITOR_COLORS.light.lineNumber,
        'editor.selectionBackground': DEFAULT_EDITOR_COLORS.light.selection,
        'editorCursor.foreground': DEFAULT_EDITOR_COLORS.light.cursor,
      },
    });
  }, []);

  /**
   * カスタムMonacoテーマを適用（テーマ変更時用）
   */
  const applyEditorTheme = useCallback(
    (monaco: Monaco, ed: editor.IStandaloneCodeEditor, themeId: string, darkMode: boolean) => {
      const customTheme = getThemeById(themeId);
      const monacoThemeName = customTheme
        ? `custom-${customTheme.id}`
        : `custom-default-${darkMode ? 'dark' : 'light'}`;

      monaco.editor.setTheme(monacoThemeName);
      currentThemeRef.current = themeId;

      const actualIsDark = customTheme ? customTheme.type === 'dark' : darkMode;
      const editorDom = ed.getDomNode();
      if (editorDom) {
        editorDom.classList.remove('dark-editor', 'light-editor');
        editorDom.classList.add(actualIsDark ? 'dark-editor' : 'light-editor');
      }
    },
    []
  );

  /**
   * 現在のMonacoテーマ名を計算
   */
  const monacoThemeName = useMemo(() => {
    const customTheme = getThemeById(settings.theme);
    if (customTheme) return `custom-${customTheme.id}`;
    const isDark = mounted ? resolvedTheme === 'dark' : false;
    return `custom-default-${isDark ? 'dark' : 'light'}`;
  }, [settings.theme, resolvedTheme, mounted]);

  /**
   * 現在のテーマがダークかどうかを判定
   */
  const isDarkTheme = useMemo(() => {
    const customTheme = getThemeById(settings.theme);
    return customTheme ? customTheme.type === 'dark' : resolvedTheme === 'dark';
  }, [settings.theme, resolvedTheme]);

  return {
    mounted,
    resolvedTheme,
    themeId: settings.theme,
    monacoThemeName,
    isDarkTheme,
    handleBeforeMount,
    applyEditorTheme,
  };
};
