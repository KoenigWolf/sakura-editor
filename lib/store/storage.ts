import { createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

/**
 * SSR安全なローカルストレージ
 * サーバー環境ではno-opストレージを使うことで、`localStorage`未定義エラーを回避する。
 */
export const createSafeStorage = () =>
  createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : localStorage));
