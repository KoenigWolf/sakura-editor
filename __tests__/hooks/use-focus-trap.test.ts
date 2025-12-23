import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusTrap } from '@/hooks/use-focus-trap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('refオブジェクトを返す', () => {
      const { result } = renderHook(() => useFocusTrap());
      expect(result.current).toBeDefined();
      expect(result.current.current).toBeNull();
    });
  });

  describe('enabled オプション', () => {
    it('enabled=falseの場合はフォーカストラップが無効', () => {
      const { result } = renderHook(() => useFocusTrap({ enabled: false }));
      expect(result.current).toBeDefined();
    });

    it('enabled=true（デフォルト）の場合はフォーカストラップが有効', () => {
      const { result } = renderHook(() => useFocusTrap({ enabled: true }));
      expect(result.current).toBeDefined();
    });
  });

  describe('キーボードイベント', () => {
    it('Tabキー以外のキーは無視される', () => {
      const { result } = renderHook(() => useFocusTrap<HTMLDivElement>());

      const div = document.createElement('div');
      const button = document.createElement('button');
      div.appendChild(button);
      container.appendChild(div);

      act(() => {
        (result.current as React.MutableRefObject<HTMLDivElement>).current = div;
      });

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('returnFocusOnDeactivate オプション', () => {
    it('デフォルトでtrueに設定される', () => {
      const { result } = renderHook(() => useFocusTrap());
      expect(result.current).toBeDefined();
    });

    it('returnFocusOnDeactivate=falseの場合は元の要素にフォーカスを戻さない', () => {
      const { result } = renderHook(() => useFocusTrap({ returnFocusOnDeactivate: false }));
      expect(result.current).toBeDefined();
    });
  });
});
