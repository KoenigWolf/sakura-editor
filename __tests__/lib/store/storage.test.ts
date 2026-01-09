import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('SafeStorage', () => {
  let originalLocalStorage: Storage;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    originalLocalStorage = global.localStorage;
    mockStorage = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
      }),
      length: 0,
      key: vi.fn(),
    };
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('getItem', () => {
    it('存在するアイテムを取得できる', async () => {
      const { createSafeStorage } = await import('@/lib/store/storage');
      const storage = createSafeStorage()!;

      const testData = JSON.stringify({ state: { test: 'value' }, version: 0 });
      mockStorage['test-key'] = testData;

      const result = storage.getItem('test-key');
      expect(result).toEqual({ state: { test: 'value' }, version: 0 });
    });

    it('存在しないアイテムはnullを返す', async () => {
      const { createSafeStorage } = await import('@/lib/store/storage');
      const storage = createSafeStorage()!;

      const result = storage.getItem('non-existent');
      expect(result).toBeNull();
    });

    it('不正なJSONは削除してnullを返す', async () => {
      const { createSafeStorage } = await import('@/lib/store/storage');
      const storage = createSafeStorage()!;

      mockStorage['corrupted-key'] = 'invalid json {{{';

      const result = storage.getItem('corrupted-key');
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('corrupted-key');
    });
  });

  describe('setItem', () => {
    it('アイテムを保存できる', async () => {
      const { createSafeStorage } = await import('@/lib/store/storage');
      const storage = createSafeStorage()!;

      const testData = { state: { test: 'value' }, version: 0 };
      storage.setItem('test-key', testData);

      expect(localStorage.setItem).toHaveBeenCalled();
      const callArgs = (localStorage.setItem as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(callArgs[0]).toBe('test-key');
    });

    it('5MBを超えるデータは保存しない', async () => {
      const { createSafeStorage } = await import('@/lib/store/storage');
      const storage = createSafeStorage()!;

      const largeData = { state: { data: 'x'.repeat(6 * 1024 * 1024) }, version: 0 };
      storage.setItem('large-key', largeData);

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('アイテムを削除できる', async () => {
      const { createSafeStorage } = await import('@/lib/store/storage');
      const storage = createSafeStorage()!;

      storage.removeItem('test-key');

      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });
});
