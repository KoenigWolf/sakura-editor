import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IndentSettings {
  leftMargin: number;
  rightMargin: number;
  firstLineIndent: number;
  hangingIndent: number;
  tabStops: number[];
  defaultTabStop: number;
  useSpaces: boolean;
  indentSize: number;
}

interface IndentState {
  settings: IndentSettings;
  rulerVisible: boolean;
  rulerWidth: number;
  updateSettings: (settings: Partial<IndentSettings>) => void;
  setRulerVisible: (visible: boolean) => void;
  setRulerWidth: (width: number) => void;
  addTabStop: (position: number) => void;
  removeTabStop: (position: number) => void;
  clearTabStops: () => void;
  resetSettings: () => void;
}

const defaultSettings: IndentSettings = {
  leftMargin: 0,
  rightMargin: 0,
  firstLineIndent: 0,
  hangingIndent: 0,
  tabStops: [],
  defaultTabStop: 1.27,
  useSpaces: true,
  indentSize: 2,
};

export const useIndentStore = create<IndentState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      rulerVisible: true,
      rulerWidth: 0,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setRulerVisible: (visible) => set({ rulerVisible: visible }),

      setRulerWidth: (width) => set({ rulerWidth: width }),

      addTabStop: (position) =>
        set((state) => ({
          settings: {
            ...state.settings,
            tabStops: [...state.settings.tabStops, position].sort((a, b) => a - b),
          },
        })),

      removeTabStop: (position) =>
        set((state) => ({
          settings: {
            ...state.settings,
            tabStops: state.settings.tabStops.filter((t) => t !== position),
          },
        })),

      clearTabStops: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            tabStops: [],
          },
        })),

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'mochi-indent-settings',
      partialize: (state) => ({ settings: state.settings, rulerVisible: state.rulerVisible }),
    }
  )
);
