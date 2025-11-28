import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafeStorage } from '@/lib/store/storage';

export interface FileData {
  id: string;
  name: string;
  content: string;
  path: string;
  lastModified: number;
}

interface FileStore {
  files: FileData[];
  activeFileId: string | null;
  _hasHydrated: boolean;
  addFile: (file: Omit<FileData, 'id'>) => void;
  updateFile: (id: string, content: string) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  getActiveFile: () => FileData | undefined;
  setHasHydrated: (state: boolean) => void;
}

// updateFileのデバウンス用
let pendingUpdates: Map<string, string> = new Map();
let updateRafId: number | null = null;

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],
      activeFileId: null,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      addFile: (file) => {
        const newFile = {
          ...file,
          id: typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          files: [...state.files, newFile],
          activeFileId: newFile.id,
        }));
      },

      updateFile: (id, content) => {
        // 更新をキューに追加
        pendingUpdates.set(id, content);

        // 既にスケジュール済みならスキップ
        if (updateRafId !== null) return;

        // 次のフレームでバッチ更新
        updateRafId = requestAnimationFrame(() => {
          const updates = pendingUpdates;
          pendingUpdates = new Map();
          updateRafId = null;

          set((state) => ({
            files: state.files.map((file) => {
              const newContent = updates.get(file.id);
              if (newContent !== undefined && newContent !== file.content) {
                return { ...file, content: newContent, lastModified: Date.now() };
              }
              return file;
            }),
          }));
        });
      },

      removeFile: (id) => {
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
          activeFileId: state.activeFileId === id ? null : state.activeFileId,
        }));
      },

      setActiveFile: (id) => {
        set({ activeFileId: id });
      },

      getActiveFile: () => {
        const { files, activeFileId } = get();
        return files.find((file) => file.id === activeFileId);
      },
    }),
    {
      name: 'mochi-editor-files',
      storage: createSafeStorage(),
      partialize: (state) => ({
        files: state.files,
        activeFileId: state.activeFileId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
