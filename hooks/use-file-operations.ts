'use client';

import { useCallback } from 'react';
import { useFileStore } from '@/lib/store/file-store';
import { validateFile, FILE_SECURITY } from '@/lib/security';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface UseFileOperationsOptions {
  showToast?: boolean;
}

export const useFileOperations = (options: UseFileOperationsOptions = {}) => {
  const { showToast = true } = options;
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addFile, getActiveFile } = useFileStore();

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

    if (showToast) {
      toast({
        title: t('toolbar.save'),
        description: activeFile.name,
        duration: 2000,
      });
    }
  }, [getActiveFile, toast, t, showToast]);

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

  return {
    handleNewFile,
    handleSave,
    handleOpen,
  };
};
