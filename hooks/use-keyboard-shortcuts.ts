'use client';

import { useEffect, useCallback } from 'react';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore } from '@/lib/store/split-view-store';
import { useFileOperations } from '@/hooks/use-file-operations';

interface UseKeyboardShortcutsOptions {
  onOpenSettings?: () => void;
  onOpenCommandPalette?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { removeFile, files, activeFileId, setActiveFileId } = useFileStore();
  const { getEditorInstance } = useEditorInstanceStore();
  const { toggleSplit, closeSplit } = useSplitViewStore();
  const { handleNewFile, handleSave, handleOpen } = useFileOperations();

  const handleCloseTab = useCallback(() => {
    if (!activeFileId) return;
    if (files.length <= 1) return;

    removeFile(activeFileId);
  }, [activeFileId, files.length, removeFile]);

  const handleNextTab = useCallback(() => {
    if (files.length <= 1) return;

    const currentIndex = files.findIndex(f => f.id === activeFileId);
    const nextIndex = (currentIndex + 1) % files.length;
    setActiveFileId(files[nextIndex].id);
  }, [files, activeFileId, setActiveFileId]);

  const handlePrevTab = useCallback(() => {
    if (files.length <= 1) return;

    const currentIndex = files.findIndex(f => f.id === activeFileId);
    const prevIndex = (currentIndex - 1 + files.length) % files.length;
    setActiveFileId(files[prevIndex].id);
  }, [files, activeFileId, setActiveFileId]);

  const handleGoToLine = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;

    editor.trigger('keyboard', 'editor.action.gotoLine', null);
  }, [getEditorInstance]);

  const handleToggleSplit = useCallback(() => {
    toggleSplit();
  }, [toggleSplit]);

  const handleCloseSplit = useCallback(() => {
    closeSplit();
  }, [closeSplit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
        return;
      }

      if (isMod && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      if (isMod && e.key === 'o') {
        e.preventDefault();
        handleOpen();
        return;
      }

      if (isMod && e.key === 'w') {
        e.preventDefault();
        handleCloseTab();
        return;
      }

      if (isMod && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        handleNextTab();
        return;
      }

      if (isMod && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        handlePrevTab();
        return;
      }

      if (isMod && e.key === 'g') {
        e.preventDefault();
        handleGoToLine();
        return;
      }

      if (isMod && e.key === 'p') {
        e.preventDefault();
        options.onOpenCommandPalette?.();
        return;
      }

      if (isMod && e.key === ',') {
        e.preventDefault();
        options.onOpenSettings?.();
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        options.onOpenCommandPalette?.();
        return;
      }

      if (isMod && e.key === '\\') {
        e.preventDefault();
        handleToggleSplit();
        return;
      }

      if (isMod && e.shiftKey && e.key === '|') {
        e.preventDefault();
        handleCloseSplit();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNewFile,
    handleSave,
    handleOpen,
    handleCloseTab,
    handleNextTab,
    handlePrevTab,
    handleGoToLine,
    handleToggleSplit,
    handleCloseSplit,
    options,
  ]);

  return {
    handleNewFile,
    handleSave,
    handleOpen,
    handleCloseTab,
    handleNextTab,
    handlePrevTab,
    handleGoToLine,
    handleToggleSplit,
    handleCloseSplit,
  };
}
