'use client';

import { useCallback, useRef } from 'react';
import type { editor } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '@/lib/store';
import { shouldHighlightFullWidthSpace } from '@/lib/editor/constants';

type Monaco = typeof import('monaco-editor');

interface UseFullWidthSpaceOptions {
  editorRef: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
  monacoRef: React.MutableRefObject<Monaco | null>;
}

/**
 * 全角スペースハイライト管理フック
 */
export const useFullWidthSpace = ({ editorRef, monacoRef }: UseFullWidthSpaceOptions) => {
  const { t } = useTranslation();
  const settings = useEditorStore((state) => state.settings);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 全角スペースをハイライト表示する（内部実装）
   * Monaco の findMatches を使用して効率化
   */
  const updateDecorationsCore = useCallback(() => {
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco) return;

    try {
      const model = ed.getModel();
      if (!model) return;

      if (settings.showFullWidthSpace === 'none') {
        if (decorationsRef.current) {
          decorationsRef.current.clear();
        }
        return;
      }

      // findMatches を使用して効率的に全角スペースを検索
      const matches = model.findMatches('\u3000', false, false, false, null, false);
      const selection = ed.getSelection();
      const decorations: editor.IModelDeltaDecoration[] = [];

      for (const match of matches) {
        const range = match.range;
        const lineContent = model.getLineContent(range.startLineNumber);

        const shouldHighlight = shouldHighlightFullWidthSpace(
          settings.showFullWidthSpace,
          { lineNumber: range.startLineNumber, column: range.startColumn },
          { lineNumber: range.endLineNumber, column: range.endColumn },
          selection,
          lineContent,
          monaco
        );

        if (!shouldHighlight) continue;

        decorations.push({
          range: new monaco.Range(
            range.startLineNumber,
            range.startColumn,
            range.endLineNumber,
            range.endColumn
          ),
          options: {
            inlineClassName: 'full-width-space-highlight',
            hoverMessage: { value: t('editor.fullWidthSpace') },
          },
        });
      }

      if (!decorationsRef.current) {
        decorationsRef.current = ed.createDecorationsCollection(decorations);
      } else {
        decorationsRef.current.set(decorations);
      }
    } catch {
      // エディタがdisposeされた場合は無視
    }
  }, [editorRef, monacoRef, settings.showFullWidthSpace, t]);

  /**
   * 全角スペースをハイライト表示する（デバウンス付き）
   */
  const updateDecorations = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updateDecorationsCore();
    }, 150);
  }, [updateDecorationsCore]);

  /**
   * クリーンアップ
   */
  const cleanup = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (decorationsRef.current) {
      decorationsRef.current.clear();
      decorationsRef.current = null;
    }
  }, []);

  return {
    updateDecorations,
    cleanup,
  };
};
