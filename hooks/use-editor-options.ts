'use client';

import { useMemo } from 'react';
import type { editor } from 'monaco-editor';
import { useEditorStore } from '@/lib/store';
import { DEFAULT_EDITOR_OPTIONS } from '@/lib/editor/constants';

/**
 * エディタオプションを生成するフック
 */
export const useEditorOptions = () => {
  const settings = useEditorStore((state) => state.settings);

  const editorOptions = useMemo((): editor.IStandaloneEditorConstructionOptions => {
    return {
      ...DEFAULT_EDITOR_OPTIONS,
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      lineHeight: settings.lineHeight,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      lineNumbers: settings.showLineNumbers ? 'on' : 'off',
      renderWhitespace: settings.showWhitespace,
    };
  }, [settings]);

  return { editorOptions, settings };
};
