'use client';

import { useCallback, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useEditorStore } from '@/lib/store';

interface UseEditorScrollProps {
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
}

export function useEditorScroll({ textareaRef }: UseEditorScrollProps) {
  const lastScrollPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const { settings } = useEditorStore();

  // 現在のスクロール位置を保存
  const saveScrollPosition = useCallback(() => {
    if (textareaRef.current) {
      lastScrollPosition.current = {
        x: textareaRef.current.scrollLeft,
        y: textareaRef.current.scrollTop
      };
    }
  }, [textareaRef]);

  // スクロール位置を復元
  const restoreScrollPosition = useCallback(() => {
    if (textareaRef.current) {
      const { x, y } = lastScrollPosition.current;
      textareaRef.current.scrollTo({
        left: x,
        top: y,
        behavior: 'auto'
      });
    }
  }, [textareaRef]);

  // スムーズスクロール
  const smoothScrollTo = useCallback(
    (options: { x?: number; y?: number }) => {
      if (textareaRef.current) {
        const { x, y } = options;
        textareaRef.current.scrollTo({
          left: x,
          top: y,
          behavior: 'smooth'
        });
      }
    },
    [textareaRef]
  );

  // カーソル位置に基づく自動スクロール
  const handleAutoScroll = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const lineHeight = Number.parseInt(String(settings.lineHeight), 10);
      const bottomThreshold = textarea.clientHeight - lineHeight * 3;

      if (textarea.selectionStart === textarea.value.length) {
        const cursorPosition = textarea.scrollHeight;
        if (cursorPosition > bottomThreshold) {
          smoothScrollTo({
            y: cursorPosition - textarea.clientHeight + lineHeight
          });
        }
      }
    }
  }, [textareaRef, settings.lineHeight, smoothScrollTo]);

  // スクロール状態の監視
  const handleScroll = useCallback(() => {
    if (textareaRef.current) {
      const { scrollLeft, scrollTop } = textareaRef.current;
      lastScrollPosition.current = { x: scrollLeft, y: scrollTop };
    }
  }, [textareaRef]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    smoothScrollTo,
    handleAutoScroll,
    handleScroll
  };
}