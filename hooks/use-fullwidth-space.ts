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

      const content = model.getValue();
      const decorations: editor.IModelDeltaDecoration[] = [];
      const fullWidthSpaceRegex = /\u3000/g;
      const selection = ed.getSelection();
      let match;

      while ((match = fullWidthSpaceRegex.exec(content)) !== null) {
        const startPos = model.getPositionAt(match.index);
        const endPos = model.getPositionAt(match.index + 1);
        const lineContent = model.getLineContent(startPos.lineNumber);

        const shouldHighlight = shouldHighlightFullWidthSpace(
          settings.showFullWidthSpace,
          startPos,
          endPos,
          selection,
          lineContent,
          monaco
        );

        if (!shouldHighlight) continue;

        decorations.push({
          range: new monaco.Range(
            startPos.lineNumber,
            startPos.column,
            endPos.lineNumber,
            endPos.column
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
