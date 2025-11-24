import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addFile: (file: Omit<FileData, 'id'>) => void;
  updateFile: (id: string, content: string) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  getActiveFile: () => FileData | undefined;
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      files: [],
      activeFileId: null,

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
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id
              ? { ...file, content, lastModified: Date.now() }
              : file
          ),
        }));
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
      name: 'sakura-editor-files',
    }
  )
); 