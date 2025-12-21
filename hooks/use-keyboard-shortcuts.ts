'use client';

import { useEffect, useCallback } from 'react';
import { useFileStore } from '@/lib/store/file-store';
import { useSearchStore } from '@/lib/store/search-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore } from '@/lib/store/split-view-store';
import { validateFile, FILE_SECURITY } from '@/lib/security';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface UseKeyboardShortcutsOptions {
  onOpenSettings?: () => void;
  onOpenCommandPalette?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addFile, getActiveFile, removeFile, files, activeFileId, setActiveFileId } = useFileStore();
  const { setIsOpen: setSearchOpen } = useSearchStore();
  const { getEditorInstance } = useEditorInstanceStore();
  const { toggleSplit, closeSplit, splitDirection } = useSplitViewStore();

  const handleNewFile = useCallback(() => {
    addFile({
      name: 'untitled.txt',
      content: '',
      path: '',
      lastModified: Date.now(),
    });
  }, [addFile]);

  const handleSave = useCallback(async () => {
    const activeFile = getActiveFile();
    if (!activeFile) return;

    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t('toolbar.save'),
      description: activeFile.name,
      duration: 2000,
    });
  }, [getActiveFile, toast, t]);

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = FILE_SECURITY.ALLOWED_EXTENSIONS.join(',');

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: t('error.fileError'),
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      try {
        const text = await file.text();
        addFile({
          name: validation.sanitizedName,
          content: text,
          path: '',
          lastModified: file.lastModified,
        });
      } catch {
        toast({
          title: t('error.fileError'),
          description: t('error.fileReadFailed'),
          variant: 'destructive',
        });
      }
    };

    input.click();
  }, [addFile, toast, t]);

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
