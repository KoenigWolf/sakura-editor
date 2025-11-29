import { createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

// ストレージの最大サイズ（5MB - ブラウザの一般的な制限より少なめ）
const MAX_STORAGE_SIZE = 5 * 1024 * 1024;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

/**
 * セキュアなローカルストレージラッパー
 * - エラーハンドリング
 * - サイズ制限のチェック
 * - 不正なデータの検証
 */
const secureStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      const item = localStorage.getItem(name);
      if (item === null) return null;

      // JSONとして解析可能か検証
      JSON.parse(item);
      return item;
    } catch {
      // 不正なデータの場合は削除してnullを返す
      try {
        localStorage.removeItem(name);
      } catch {
        // 削除も失敗した場合は無視
      }
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      // サイズチェック
      const newSize = new Blob([value]).size;
      if (newSize > MAX_STORAGE_SIZE) {
        console.warn(`Storage limit exceeded for key "${name}": ${newSize} bytes`);
        return;
      }

      localStorage.setItem(name, value);
    } catch (error) {
      // QuotaExceededErrorなどのエラーをハンドリング
      if (error instanceof Error) {
        console.warn(`Failed to save to localStorage: ${error.message}`);
      }
      // ストレージがいっぱいの場合、古いデータをクリアして再試行
      try {
        localStorage.removeItem(name);
        localStorage.setItem(name, value);
      } catch {
        // 再試行も失敗した場合は無視
      }
    }
  },

  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // 削除失敗は無視
    }
  },
};

/**
 * SSR安全なローカルストレージ
 * サーバー環境ではno-opストレージを使うことで、`localStorage`未定義エラーを回避する。
 * クライアント側ではセキュアなラッパーを使用。
 */
export const createSafeStorage = () =>
  createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : secureStorage));
