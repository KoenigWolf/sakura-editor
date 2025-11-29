'use client';

import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileStore, type FileData } from '@/lib/store/file-store';
import { X, FileCode2, FileJson2, FileType2, FileText, Code2, Braces } from 'lucide-react';
import { cn } from '@/lib/utils';

// ファイル拡張子に応じたアイコンを取得
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'json':
      return FileJson2;
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return Braces;
    case 'html':
    case 'xml':
      return Code2;
    case 'md':
    case 'txt':
      return FileText;
    case 'css':
    case 'scss':
    case 'less':
      return FileType2;
    default:
      return FileCode2;
  }
};

// ファイル拡張子に応じた色を取得
const getFileColor = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'text-blue-500';
    case 'js':
    case 'jsx':
      return 'text-yellow-500';
    case 'json':
      return 'text-green-500';
    case 'css':
    case 'scss':
      return 'text-pink-500';
    case 'html':
      return 'text-orange-500';
    case 'md':
      return 'text-purple-500';
    default:
      return 'text-muted-foreground';
  }
};

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
    <div className="mochi-tabs-container w-full max-w-full overflow-hidden">
      <div className="flex items-end gap-1 px-2 pt-2 overflow-x-auto scrollbar-thin">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          const isDragging = draggedId === file.id;
          const isDragOver = dragOverId === file.id;
          const FileIcon = getFileIcon(file.name);
          const fileColor = getFileColor(file.name);

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
                'mochi-tab group',
                isActive && 'mochi-tab-active',
                file.isDirty && !isActive && 'mochi-tab-dirty',
                isDragging && 'opacity-50 scale-95',
                isDragOver && 'border-primary border-dashed bg-primary/10'
              )}
            >
              <FileIcon className={cn('h-3.5 w-3.5 flex-shrink-0', isActive ? fileColor : 'text-muted-foreground')} />
              <span className="truncate max-w-[150px] text-left text-xs font-medium">
                {file.name}
              </span>
              {file.isDirty && isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => handleClose(event, file)}
                onKeyDown={(e) => e.key === 'Enter' && handleClose(e as unknown as React.MouseEvent, file)}
                className="mochi-tab-close"
                aria-label={t('common.close')}
              >
                <X className="h-3 w-3" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
