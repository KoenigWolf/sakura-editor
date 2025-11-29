'use client';

import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileStore, type FileData } from '@/lib/store/file-store';
import { X, FileCode2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FileTabs = memo(function FileTabs() {
  const { t } = useTranslation();
  const files = useFileStore((state) => state.files);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const removeFile = useFileStore((state) => state.removeFile);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleSelect = useCallback((file: FileData) => {
    setActiveFile(file.id);
  }, [setActiveFile]);

  const handleClose = useCallback((event: React.MouseEvent, file: FileData) => {
    event.stopPropagation();
    removeFile(file.id);
  }, [removeFile]);

  const handleDragStart = useCallback((e: React.DragEvent, file: FileData) => {
    setDraggedId(file.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file.id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, file: FileData) => {
    e.preventDefault();
    if (draggedId && draggedId !== file.id) {
      setDragOverId(file.id);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetFile: FileData) => {
    e.preventDefault();
    setDragOverId(null);
    setDraggedId(null);

    if (!draggedId || draggedId === targetFile.id) return;

    // Reorder files in the store
    const { files: currentFiles } = useFileStore.getState();
    const draggedIndex = currentFiles.findIndex(f => f.id === draggedId);
    const targetIndex = currentFiles.findIndex(f => f.id === targetFile.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFiles = [...currentFiles];
    const [removed] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(targetIndex, 0, removed);

    useFileStore.setState({ files: newFiles });
  }, [draggedId]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-muted/30 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-0.5 px-1.5 py-1 overflow-x-auto scrollbar-thin">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const isDragging = draggedId === file.id;
          const isDragOver = dragOverId === file.id;

          return (
            <button
              key={file.id}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, file)}
              onDragOver={(e) => handleDragOver(e, file)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, file)}
              onDragEnd={handleDragEnd}
              onClick={() => handleSelect(file)}
              className={cn(
                'group flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-all duration-150',
                'hover:bg-accent hover:text-foreground',
                isActive
                  ? 'bg-background text-foreground border-border shadow-sm'
                  : 'bg-muted/60 text-muted-foreground border-transparent',
                isDragging && 'opacity-50 scale-95',
                isDragOver && 'border-primary border-dashed bg-primary/10'
              )}
            >
              <FileCode2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[180px] flex-1 text-left">
                {file.name}
              </span>
              {file.isDirty ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => handleClose(event, file)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClose(e as unknown as React.MouseEvent, file)}
                  className={cn(
                    'ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center transition-all duration-150',
                    'group-hover:bg-destructive/90 group-hover:text-white',
                    'text-primary'
                  )}
                  aria-label={t('common.close')}
                  title="Unsaved changes"
                >
                  <Circle className="h-2 w-2 fill-current group-hover:hidden" />
                  <X className="h-2.5 w-2.5 stroke-[2.5] hidden group-hover:block" />
                </span>
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => handleClose(event, file)}
                  onKeyDown={(e) => e.key === 'Enter' && handleClose(e as unknown as React.MouseEvent, file)}
                  className={cn(
                    'ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-all duration-150',
                    'hover:bg-destructive/90 hover:text-white',
                    'text-muted-foreground'
                  )}
                  aria-label={t('common.close')}
                >
                  <X className="h-2.5 w-2.5 stroke-[2.5]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
