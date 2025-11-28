import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { EditorSettings } from './types/editor';
import { DEFAULT_EDITOR_SETTINGS } from './types/editor';
import { createSafeStorage } from '@/lib/store/storage';

/**
 * エディタ設定ストアのインターフェース
 */
export interface EditorSettingsState {
  settings: EditorSettings;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  resetSettings: () => void;
}

/**
 * エディタ設定を管理するストア
 * 永続化機能付き
 */
export const useEditorStore = create<EditorSettingsState>()(
  devtools(
    persist(
      (set) => ({
        settings: DEFAULT_EDITOR_SETTINGS,

        updateSettings: (newSettings: Partial<EditorSettings>) => {
          set((state) => {
            const hasChanges = Object.entries(newSettings).some(
              ([key, value]) => state.settings[key as keyof EditorSettings] !== value
            );
            if (!hasChanges) return state;

            return {
              settings: {
                ...state.settings,
                ...newSettings,
              },
            };
          });
        },

        resetSettings: () => {
          set({ settings: DEFAULT_EDITOR_SETTINGS });
        },
      }),
      {
        name: 'mochi-editor-settings',
        storage: createSafeStorage(),
      }
    )
  )
);

