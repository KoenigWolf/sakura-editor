'use client';

import { useCallback, useRef } from 'react';

interface LongPressOptions {
  /** 長押しと判定するまでの時間（ミリ秒） */
  threshold?: number;
  /** 長押し時のコールバック */
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
  /** 短いタップ時のコールバック */
  onPress?: (event: React.TouchEvent | React.MouseEvent) => void;
  /** 長押し中に移動した場合にキャンセルする距離（ピクセル） */
  moveThreshold?: number;
}

interface LongPressHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
}

/**
 * 長押しジェスチャーを検出するカスタムフック
 */
export const useLongPress = ({
  threshold = 500,
  onLongPress,
  onPress,
  moveThreshold = 10,
}: LongPressOptions): LongPressHandlers => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      isLongPressRef.current = false;

      // タッチイベントの場合
      if ('touches' in event) {
        const touch = event.touches[0];
        startPosRef.current = { x: touch.clientX, y: touch.clientY };
      } else {
        startPosRef.current = { x: event.clientX, y: event.clientY };
      }

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress(event);
      }, threshold);
    },
    [onLongPress, threshold]
  );

  const move = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (!startPosRef.current || !timerRef.current) return;

      let currentX: number;
      let currentY: number;

      if ('touches' in event) {
        const touch = event.touches[0];
        currentX = touch.clientX;
        currentY = touch.clientY;
      } else {
        currentX = event.clientX;
        currentY = event.clientY;
      }

      const deltaX = Math.abs(currentX - startPosRef.current.x);
      const deltaY = Math.abs(currentY - startPosRef.current.y);

      // 移動が閾値を超えたらキャンセル
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    [moveThreshold]
  );

  const end = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // 長押しでなければ通常のタップとして処理
      if (!isLongPressRef.current && onPress) {
        onPress(event);
      }

      startPosRef.current = null;
    },
    [onPress]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
    onMouseLeave: cancel,
  };
};
