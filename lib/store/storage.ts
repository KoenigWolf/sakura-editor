import { createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

const MAX_STORAGE_SIZE = 5 * 1024 * 1024;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const secureStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      const item = localStorage.getItem(name);
      if (item === null) return null;

      JSON.parse(item);
      return item;
    } catch {
      try {
        localStorage.removeItem(name);
      } catch {
      }
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      const newSize = new Blob([value]).size;
      if (newSize > MAX_STORAGE_SIZE) {
        return;
      }

      localStorage.setItem(name, value);
    } catch {
      try {
        localStorage.removeItem(name);
        localStorage.setItem(name, value);
      } catch {
      }
    }
  },

  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
    }
  },
};

export const createSafeStorage = () =>
  createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : secureStorage));
