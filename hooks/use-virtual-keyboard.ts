'use client';

import { useState, useEffect, useCallback } from 'react';

interface VirtualKeyboardState {
  /** キーボードが表示されているかどうか */
  isKeyboardVisible: boolean;
  /** キーボードの高さ（ピクセル） */
  keyboardHeight: number;
}

/**
 * 仮想キーボードの表示状態を検出するカスタムフック
 * iOS/Androidの両方に対応
 */
export const useVirtualKeyboard = (): VirtualKeyboardState => {
  const [state, setState] = useState<VirtualKeyboardState>({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    // VirtualKeyboard APIがサポートされている場合（Chrome 94+）
    if ('virtualKeyboard' in navigator) {
      const vk = navigator.virtualKeyboard as {
        overlaysContent: boolean;
        boundingRect: DOMRect;
        addEventListener: (event: string, handler: () => void) => void;
        removeEventListener: (event: string, handler: () => void) => void;
      };

      // overlaysContentをtrueに設定してキーボードのオーバーレイを許可
      vk.overlaysContent = true;

      const handleGeometryChange = () => {
        const rect = vk.boundingRect;
        setState({
          isKeyboardVisible: rect.height > 0,
          keyboardHeight: rect.height,
        });
      };

      vk.addEventListener('geometrychange', handleGeometryChange);
      return () => {
        vk.removeEventListener('geometrychange', handleGeometryChange);
      };
    }

    // フォールバック: ビューポートのリサイズを監視
    let initialHeight = window.innerHeight;
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      // デバウンス処理
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDiff = initialHeight - currentHeight;

        // 高さが150px以上減少した場合、キーボードが表示されたと判断
        const isVisible = heightDiff > 150;

        setState({
          isKeyboardVisible: isVisible,
          keyboardHeight: isVisible ? heightDiff : 0,
        });
      }, 100);
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // 入力要素にフォーカスした場合、少し待ってからリサイズを確認
        setTimeout(() => {
          handleResize();
        }, 300);
      }
    };

    const handleBlur = () => {
      // フォーカスが外れたら、キーボードが閉じたと判断
      setTimeout(() => {
        setState({
          isKeyboardVisible: false,
          keyboardHeight: 0,
        });
      }, 100);
    };

    // visualViewportがサポートされている場合
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      clearTimeout(timeoutId);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  return state;
};
