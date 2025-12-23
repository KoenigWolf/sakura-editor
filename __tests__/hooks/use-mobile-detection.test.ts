import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

describe('useMobileDetection', () => {
  const originalInnerWidth = window.innerWidth;

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    setWindowWidth(originalInnerWidth);
    vi.useRealTimers();
  });

  describe('初期状態', () => {
    it('mountedがtrueになる', () => {
      setWindowWidth(1024);
      const { result } = renderHook(() => useMobileDetection());

      expect(result.current.mounted).toBe(true);
    });
  });

  describe('デバイス検出', () => {
    it('モバイル幅の場合isMobile=trueを返す', () => {
      setWindowWidth(375);
      const { result } = renderHook(() => useMobileDetection());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('タブレット幅の場合isTablet=trueを返す', () => {
      setWindowWidth(768);
      const { result } = renderHook(() => useMobileDetection());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it('デスクトップ幅の場合isDesktop=trueを返す', () => {
      setWindowWidth(1200);
      const { result } = renderHook(() => useMobileDetection());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });
  });

  describe('カスタムブレークポイント', () => {
    it('カスタムモバイルブレークポイントを使用できる', () => {
      setWindowWidth(500);
      const { result } = renderHook(() => useMobileDetection({ mobileBreakpoint: 600 }));

      expect(result.current.isMobile).toBe(true);
    });

    it('カスタムタブレットブレークポイントを使用できる', () => {
      setWindowWidth(900);
      const { result } = renderHook(() => useMobileDetection({ tabletBreakpoint: 1000 }));

      expect(result.current.isTablet).toBe(true);
    });
  });

  describe('リサイズハンドリング', () => {
    it('リサイズイベントでデバイス状態が更新される', () => {
      setWindowWidth(1200);
      const { result } = renderHook(() => useMobileDetection({ debounceMs: 100 }));

      expect(result.current.isDesktop).toBe(true);

      act(() => {
        setWindowWidth(375);
        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isMobile).toBe(true);
    });

    it('デバウンスが適用される', () => {
      setWindowWidth(1200);
      const { result } = renderHook(() => useMobileDetection({ debounceMs: 200 }));

      expect(result.current.isDesktop).toBe(true);

      act(() => {
        setWindowWidth(375);
        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(50);
      });

      expect(result.current.isDesktop).toBe(true);

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.isMobile).toBe(true);
    });
  });

  describe('クリーンアップ', () => {
    it('アンマウント時にイベントリスナーが削除される', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useMobileDetection());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
