import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useFileStore } from '@/lib/store/file-store';

describe('FileStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useFileStore.setState({
      files: [],
      activeFileId: null,
      _hasHydrated: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初期状態', () => {
    it('デフォルト値が正しく設定されている', () => {
      const state = useFileStore.getState();
      expect(state.files).toEqual([]);
      expect(state.activeFileId).toBeNull();
    });
  });

  describe('addFile', () => {
    it('ファイルを追加できる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      expect(fileId).toBeDefined();
      expect(useFileStore.getState().files).toHaveLength(1);
      expect(useFileStore.getState().files[0].name).toBe('test.txt');
    });

    it('追加したファイルがアクティブになる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      expect(useFileStore.getState().activeFileId).toBe(fileId);
    });

    it('追加したファイルはisDirty=falseで初期化される', () => {
      useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      expect(useFileStore.getState().files[0].isDirty).toBe(false);
    });

    it('originalContentが設定される', () => {
      useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      expect(useFileStore.getState().files[0].originalContent).toBe('Hello World');
    });
  });

  describe('updateFile', () => {
    it('ファイル内容を更新できる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().updateFile(fileId, 'Updated Content');
      vi.runAllTimers();

      expect(useFileStore.getState().files[0].content).toBe('Updated Content');
    });

    it('内容変更時にisDirtyがtrueになる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().updateFile(fileId, 'Changed');
      vi.runAllTimers();

      expect(useFileStore.getState().files[0].isDirty).toBe(true);
    });

    it('元の内容に戻すとisDirtyがfalseになる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().updateFile(fileId, 'Changed');
      vi.runAllTimers();
      expect(useFileStore.getState().files[0].isDirty).toBe(true);

      useFileStore.getState().updateFile(fileId, 'Hello World');
      vi.runAllTimers();
      expect(useFileStore.getState().files[0].isDirty).toBe(false);
    });

    it('lastModifiedが更新される', () => {
      const initialTime = Date.now();
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: initialTime,
      });

      vi.advanceTimersByTime(1000);
      useFileStore.getState().updateFile(fileId, 'Updated');
      vi.runAllTimers();

      expect(useFileStore.getState().files[0].lastModified).toBeGreaterThan(initialTime);
    });
  });

  describe('removeFile', () => {
    it('ファイルを削除できる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().removeFile(fileId);

      expect(useFileStore.getState().files).toHaveLength(0);
    });

    it('アクティブファイルを削除するとactiveFileIdがnullになる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().removeFile(fileId);

      expect(useFileStore.getState().activeFileId).toBeNull();
    });

    it('非アクティブファイルを削除してもactiveFileIdは変わらない', () => {
      const fileId1 = useFileStore.getState().addFile({
        name: 'test1.txt',
        content: 'Hello',
        path: '/test1.txt',
        lastModified: Date.now(),
      });

      const fileId2 = useFileStore.getState().addFile({
        name: 'test2.txt',
        content: 'World',
        path: '/test2.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().removeFile(fileId1);

      expect(useFileStore.getState().activeFileId).toBe(fileId2);
    });
  });

  describe('setActiveFileId', () => {
    it('アクティブファイルを切り替えられる', () => {
      const fileId1 = useFileStore.getState().addFile({
        name: 'test1.txt',
        content: 'Hello',
        path: '/test1.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().addFile({
        name: 'test2.txt',
        content: 'World',
        path: '/test2.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().setActiveFileId(fileId1);

      expect(useFileStore.getState().activeFileId).toBe(fileId1);
    });
  });

  describe('getActiveFile', () => {
    it('アクティブファイルを取得できる', () => {
      useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      const activeFile = useFileStore.getState().getActiveFile();

      expect(activeFile?.name).toBe('test.txt');
    });

    it('ファイルがない場合はundefinedを返す', () => {
      const activeFile = useFileStore.getState().getActiveFile();

      expect(activeFile).toBeUndefined();
    });
  });

  describe('markAsSaved', () => {
    it('ファイルを保存済みとしてマークできる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().updateFile(fileId, 'Changed');
      vi.runAllTimers();
      expect(useFileStore.getState().files[0].isDirty).toBe(true);

      useFileStore.getState().markAsSaved(fileId);

      expect(useFileStore.getState().files[0].isDirty).toBe(false);
      expect(useFileStore.getState().files[0].originalContent).toBe('Changed');
    });
  });

  describe('renameFile', () => {
    it('ファイル名を変更できる', () => {
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: Date.now(),
      });

      useFileStore.getState().renameFile(fileId, 'renamed.txt');

      expect(useFileStore.getState().files[0].name).toBe('renamed.txt');
    });

    it('リネーム時にlastModifiedが更新される', () => {
      const initialTime = Date.now();
      const fileId = useFileStore.getState().addFile({
        name: 'test.txt',
        content: 'Hello World',
        path: '/test.txt',
        lastModified: initialTime,
      });

      vi.advanceTimersByTime(1000);
      useFileStore.getState().renameFile(fileId, 'renamed.txt');

      expect(useFileStore.getState().files[0].lastModified).toBeGreaterThan(initialTime);
    });
  });

  describe('setHasHydrated', () => {
    it('hydration状態を設定できる', () => {
      useFileStore.getState().setHasHydrated(true);

      expect(useFileStore.getState()._hasHydrated).toBe(true);
    });
  });
});
