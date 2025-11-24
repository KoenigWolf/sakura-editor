import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { EditorFile, EditorSettings } from './types/editor';
import { DEFAULT_EDITOR_SETTINGS } from './types/editor';
import {
  createEditorFile,
  updateFileContent,
  createHistoryState,
  updateHistoryForUndo,
  updateHistoryForRedo,
} from './utils/editor';
import { BatchProcessor, CacheManager, HistoryLoader } from './utils/batch';

// Initialize utilities
const batchProcessor = new BatchProcessor();
const cacheManager = new CacheManager();
const historyLoader = new HistoryLoader();

/**
 * Main editor state interface including content, file list,
 * history for undo/redo, and configuration settings.
 */
export interface EditorState {
  content: string;
  files: EditorFile[];
  activeFileId: string | null;
  history: {
    past: string[];
    future: string[];
    totalEntries: number;
  };
  settings: EditorSettings;
  isLoading: boolean;

  // State modification functions
  setContent: (content: string) => void;
  addFile: (name: string, content: string) => void;
  updateFile: (id: string, content: string) => void;
  setActiveFile: (id: string) => void;
  updateSettings: (settings: Partial<EditorSettings>) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  loadHistoryEntry: (index: number) => Promise<string | null>;
}

// 履歴状態の初期化
const initialHistory = {
  past: [] as string[],
  future: [] as string[],
  totalEntries: 0,
};

/**
 * Create the editor store with persistence and devtools.
 * The store is responsible for:
 * - Managing the current editor content
 * - Storing the list of files
 * - Keeping track of the active file
 * - Maintaining undo/redo history
 * - Managing editor settings
 */
export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set, get) => ({
        content: '',
        files: [],
        activeFileId: null,
        history: initialHistory,
        settings: DEFAULT_EDITOR_SETTINGS,
        isLoading: false,

        setContent: (newContent: string) => {
          const { content, history } = get();
          if (content === newContent) return;

          // Cache the new content
          cacheManager.set('content', newContent);

          set({
            content: newContent,
            history: {
              past: [...history.past, content],
              future: [],
              totalEntries: history.totalEntries + 1,
            },
          });

          // Update history loader
          historyLoader.setTotalEntries(get().history.totalEntries);
        },

        addFile: (name: string, content: string) => {
          const newFile = createEditorFile(name, content);
          batchProcessor.add(() => {
            set((state) => ({
              files: [...state.files, newFile],
            }));
          });
        },

        updateFile: (id: string, newContent: string) => {
          batchProcessor.add(() => {
            set((state) => {
              const fileIndex = state.files.findIndex((file) => file.id === id);
              if (fileIndex === -1) return state;

              const updatedFile = updateFileContent(state.files[fileIndex], newContent);
              if (updatedFile === state.files[fileIndex]) return state;

              // Cache the updated file content
              cacheManager.set(`file:${id}`, updatedFile);

              const newFiles = [...state.files];
              newFiles[fileIndex] = updatedFile;

              return { files: newFiles };
            });
          });
        },

        setActiveFile: (id: string) => {
          set((state) => {
            if (state.activeFileId === id) return state;
            return { activeFileId: id };
          });
        },

        updateSettings: (newSettings: Partial<EditorSettings>) => {
          set((state) => {
            const hasChanges = Object.entries(newSettings).some(
              ([key, value]) => state.settings[key as keyof EditorSettings] !== value
            );
            if (!hasChanges) return state;

            const updatedSettings = {
              ...state.settings,
              ...newSettings,
            };

            // Cache the updated settings
            cacheManager.set('settings', updatedSettings);

            return { settings: updatedSettings };
          });
        },

        undo: async () => {
          set({ isLoading: true });
          try {
            const { content, history } = get();
            if (history.past.length === 0) {
              set({ isLoading: false });
              return;
            }

            const previousContent = history.past[history.past.length - 1];
            const newHistory = updateHistoryForUndo(content, history);
            
            set({
              content: previousContent,
              history: newHistory,
              isLoading: false,
            });
          } catch (error) {
            console.error('Error during undo:', error);
            set({ isLoading: false });
          }
        },

        redo: async () => {
          set({ isLoading: true });
          try {
            const { content, history } = get();
            if (history.future.length === 0) {
              set({ isLoading: false });
              return;
            }

            const nextContent = history.future[0];
            const newHistory = updateHistoryForRedo(content, history);
            
            set({
              content: nextContent,
              history: newHistory,
              isLoading: false,
            });
          } catch (error) {
            console.error('Error during redo:', error);
            set({ isLoading: false });
          }
        },

        loadHistoryEntry: async (index: number) => {
          return historyLoader.loadEntry(index);
        },
      }),
      {
        name: 'editor-storage',
        partialize: (state) => ({
          settings: state.settings,
          files: state.files.map(({ id, name, content, encoding, lineEnding }) => ({
            id,
            name,
            content,
            encoding,
            lineEnding,
            isDirty: false,
          })),
          history: {
            totalEntries: state.history.totalEntries,
          },
        }),
      }
    )
  )
);
