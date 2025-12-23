import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAnnouncerStore } from '@/lib/store/announcer-store';

describe('AnnouncerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAnnouncerStore.setState({
      message: '',
      politeness: 'polite',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初期状態', () => {
    it('デフォルト値が正しく設定されている', () => {
      const state = useAnnouncerStore.getState();
      expect(state.message).toBe('');
      expect(state.politeness).toBe('polite');
    });
  });

  describe('announce', () => {
    it('メッセージをアナウンスできる', () => {
      useAnnouncerStore.getState().announce('テスト通知');

      vi.advanceTimersByTime(50);

      expect(useAnnouncerStore.getState().message).toBe('テスト通知');
      expect(useAnnouncerStore.getState().politeness).toBe('polite');
    });

    it('assertiveモードでアナウンスできる', () => {
      useAnnouncerStore.getState().announce('緊急通知', 'assertive');

      vi.advanceTimersByTime(50);

      expect(useAnnouncerStore.getState().message).toBe('緊急通知');
      expect(useAnnouncerStore.getState().politeness).toBe('assertive');
    });

    it('アナウンス前にメッセージがクリアされる', () => {
      useAnnouncerStore.setState({ message: '既存メッセージ' });

      useAnnouncerStore.getState().announce('新しいメッセージ');

      expect(useAnnouncerStore.getState().message).toBe('');

      vi.advanceTimersByTime(50);

      expect(useAnnouncerStore.getState().message).toBe('新しいメッセージ');
    });
  });

  describe('clear', () => {
    it('メッセージをクリアできる', () => {
      useAnnouncerStore.setState({ message: 'テストメッセージ' });

      useAnnouncerStore.getState().clear();

      expect(useAnnouncerStore.getState().message).toBe('');
    });
  });
});
