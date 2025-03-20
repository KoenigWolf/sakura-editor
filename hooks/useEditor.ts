import { useCallback, useMemo } from 'react';
import { useEditorStore } from '../lib/store';
import type { EditorFile, EditorSettings } from '../lib/types/editor';

/**
 * Custom hook for memoized editor operations
 */
export const useEditor = () => {
  const store = useEditorStore();

  // Memoize file operations
  const activeFile = useMemo(
    () => store.files.find((file) => file.id === store.activeFileId),
    [store.files, store.activeFileId]
  );

  const dirtyFiles = useMemo(
    () => store.files.filter((file) => file.isDirty),
    [store.files]
  );

  // Memoize callbacks
  const setContent = useCallback(
    (content: string) => {
      store.setContent(content);
    },
    [store]
  );

  const addFile = useCallback(
    (name: string, content: string) => {
      store.addFile(name, content);
    },
    [store]
  );

  const updateFile = useCallback(
    (id: string, content: string) => {
      store.updateFile(id, content);
    },
    [store]
  );

  const setActiveFile = useCallback(
    (id: string) => {
      store.setActiveFile(id);
    },
    [store]
  );

  const updateSettings = useCallback(
    (settings: Partial<EditorSettings>) => {
      store.updateSettings(settings);
    },
    [store]
  );

  const undo = useCallback(
    async () => {
      await store.undo();
    },
    [store]
  );

  const redo = useCallback(
    async () => {
      await store.redo();
    },
    [store]
  );

  const loadHistoryEntry = useCallback(
    async (index: number) => {
      return store.loadHistoryEntry(index);
    },
    [store]
  );

  // Memoize computed values
  const canUndo = useMemo(() => store.history.past.length > 0, [store.history.past]);
  const canRedo = useMemo(() => store.history.future.length > 0, [store.history.future]);

  return {
    // State
    content: store.content,
    files: store.files,
    activeFile,
    dirtyFiles,
    settings: store.settings,
    isLoading: store.isLoading,
    canUndo,
    canRedo,

    // Actions
    setContent,
    addFile,
    updateFile,
    setActiveFile,
    updateSettings,
    undo,
    redo,
    loadHistoryEntry,
  };
}; 