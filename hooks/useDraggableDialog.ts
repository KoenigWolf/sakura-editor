/**
 * ドラッグ可能なダイアログの位置と動作を管理するカスタムフック
 * 
 * このフックは以下の機能を提供します：
 * 1. ダイアログの初期位置の計算と設定
 * 2. ドラッグ操作の状態管理
 * 3. ウィンドウリサイズ時の位置調整
 * 4. 画面境界での位置制限
 * 
 * @param isOpen - ダイアログの表示状態
 * @param dialogRef - ダイアログ要素への参照
 * @param options - オプション設定
 * @returns ダイアログの位置と操作に関する状態と関数
 */
import { useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DragOffset {
  x: number;
  y: number;
}

interface DraggableDialogOptions {
  /** 画面端からの最小マージン（ピクセル） */
  margin?: number;
  /** 上端からの最小マージン（ピクセル） */
  topMargin?: number;
  /** 初期表示時の位置調整関数 */
  getInitialPosition?: (dialogWidth: number, dialogHeight: number) => Position;
}

export const useDraggableDialog = (
  isOpen: boolean,
  dialogRef: RefObject<HTMLDivElement>,
  options: DraggableDialogOptions = {}
) => {
  const {
    margin = 10,
    topMargin = 50,
    getInitialPosition = (width, height) => ({
      x: Math.max(margin, (window.innerWidth - width) / 2),
      y: Math.max(topMargin, (window.innerHeight - height) / 2),
    }),
  } = options;

  // ダイアログの現在位置
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  // ドラッグ操作の状態
  const [isDragging, setIsDragging] = useState(false);
  // ドラッグ開始時のオフセット
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });

  /**
   * 画面内に収まるように位置を制限する
   */
  const clampPosition = useCallback((pos: Position): Position => {
    if (!dialogRef.current) return pos;

    const maxX = window.innerWidth - dialogRef.current.offsetWidth - margin;
    const maxY = window.innerHeight - dialogRef.current.offsetHeight - margin;

    return {
      x: Math.max(margin, Math.min(pos.x, maxX)),
      y: Math.max(topMargin, Math.min(pos.y, maxY)),
    };
  }, [dialogRef, margin, topMargin]);

  /**
   * ダイアログ表示時に初期位置を設定
   */
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      const initialPos = getInitialPosition(rect.width, rect.height);
      setPosition(clampPosition(initialPos));
    }
  }, [isOpen, dialogRef, getInitialPosition, clampPosition]);

  /**
   * ウィンドウリサイズ時の位置調整
   */
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        setPosition(prev => clampPosition(prev));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, clampPosition]);

  /**
   * ドラッグ開始時の処理
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const header = (e.target as HTMLElement).closest('.dialog-header');
    if (header && dialogRef.current) {
      setIsDragging(true);
      const rect = dialogRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [dialogRef]);

  /**
   * ドラッグ中の処理
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newPos = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };
      setPosition(clampPosition(newPos));
    }
  }, [isDragging, dragOffset, clampPosition]);

  /**
   * ドラッグ終了時の処理
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}; 