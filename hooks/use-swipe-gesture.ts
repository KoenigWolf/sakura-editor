'use client';

import { useCallback, useRef } from 'react';

interface SwipeGestureOptions {
  /** スワイプと判定する最小距離（ピクセル） */
  threshold?: number;
  /** 垂直方向の移動が水平移動を上回った場合にキャンセルする */
  preventVertical?: boolean;
  /** 左スワイプ時のコールバック */
  onSwipeLeft?: () => void;
  /** 右スワイプ時のコールバック */
  onSwipeRight?: () => void;
}

interface SwipeGestureHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}

/**
 * 水平スワイプジェスチャーを検出するカスタムフック
 */
export const useSwipeGesture = ({
  threshold = 50,
  preventVertical = true,
  onSwipeLeft,
  onSwipeRight,
}: SwipeGestureOptions): SwipeGestureHandlers => {
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isCancelledRef = useRef(false);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    isCancelledRef.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!startPosRef.current || isCancelledRef.current) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - startPosRef.current.x;
      const deltaY = touch.clientY - startPosRef.current.y;

      // 垂直方向の移動が水平移動より大きい場合はスワイプをキャンセル
      if (preventVertical && Math.abs(deltaY) > Math.abs(deltaX)) {
        isCancelledRef.current = true;
      }
    },
    [preventVertical]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!startPosRef.current || isCancelledRef.current) {
        startPosRef.current = null;
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startPosRef.current.x;
      const deltaY = touch.clientY - startPosRef.current.y;

      // 垂直方向の移動が水平移動より大きい場合は無視
      if (preventVertical && Math.abs(deltaY) > Math.abs(deltaX)) {
        startPosRef.current = null;
        return;
      }

      // スワイプ判定
      if (deltaX > threshold) {
        onSwipeRight?.();
      } else if (deltaX < -threshold) {
        onSwipeLeft?.();
      }

      startPosRef.current = null;
    },
    [threshold, preventVertical, onSwipeLeft, onSwipeRight]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
