'use client';

import { memo, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileStore, type FileData } from '@/lib/store/file-store';
import { X, FileCode2, FileJson2, FileType2, FileText, Code2, Braces } from 'lucide-react';
import { cn } from '@/lib/utils';

const FILE_ICON_MAP: Record<string, React.ElementType> = {
  json: FileJson2,
  ts: Braces,
  tsx: Braces,
  js: Braces,
  jsx: Braces,
  html: Code2,
  xml: Code2,
  md: FileText,
  txt: FileText,
  css: FileType2,
  scss: FileType2,
  less: FileType2,
};

const FILE_COLOR_MAP: Record<string, string> = {
  ts: 'text-blue-500',
  tsx: 'text-blue-500',
  js: 'text-yellow-500',
  jsx: 'text-yellow-500',
  json: 'text-green-500',
  css: 'text-pink-500',
  scss: 'text-pink-500',
  html: 'text-orange-500',
  md: 'text-purple-500',
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return FILE_ICON_MAP[ext] || FileCode2;
};

const getFileColor = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return FILE_COLOR_MAP[ext] || 'text-muted-foreground';
};

interface FileTabItemProps {
  file: FileData;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  closeLabel: string;
}

const FileTabItem = memo(function FileTabItem({
  file,
  isActive,
  isDragging,
  isDragOver,
  onSelect,
  onClose,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  closeLabel,
}: FileTabItemProps) {
  const FileIcon = useMemo(() => getFileIcon(file.name), [file.name]);
  const fileColor = useMemo(() => getFileColor(file.name), [file.name]);

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={cn(
        'mochi-tab group',
        isActive && 'mochi-tab-active',
        file.isDirty && !isActive && 'mochi-tab-dirty',
        isDragging && 'opacity-50 scale-95',
        isDragOver && 'border-primary border-dashed bg-primary/10'
      )}
    >
      <FileIcon className={cn('h-3 w-3 flex-shrink-0', isActive ? fileColor : 'text-muted-foreground')} />
      <span className="truncate max-w-[150px] text-left text-xs font-medium">
        {file.name}
      </span>
      {file.isDirty && isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      )}
      <span
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose(e)}
        className="mochi-tab-close"
        aria-label={closeLabel}
      >
        <X className="h-3 w-3" />
      </span>
    </button>
  );
});

export const FileTabs = memo(function FileTabs() {
  const { t } = useTranslation();
  const files = useFileStore((state) => state.files);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const setActiveFileId = useFileStore((state) => state.setActiveFileId);
  const removeFile = useFileStore((state) => state.removeFile);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleSelect = useCallback((file: FileData) => {
    setActiveFileId(file.id);
  }, [setActiveFileId]);

  const handleClose = useCallback((event: React.MouseEvent | React.KeyboardEvent, file: FileData) => {
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

  const closeLabel = t('common.close');

  return (
    <div className="mochi-tabs-container w-full max-w-full overflow-hidden mochi-fast-scroll">
      <div className="flex items-end gap-0.5 px-1.5 pt-1 overflow-x-auto scrollbar-thin">
        {files.map((file) => (
          <FileTabItem
            key={file.id}
            file={file}
            isActive={file.id === activeFileId}
            isDragging={draggedId === file.id}
            isDragOver={dragOverId === file.id}
            onSelect={() => handleSelect(file)}
            onClose={(e) => handleClose(e, file)}
            onDragStart={(e) => handleDragStart(e, file)}
            onDragOver={(e) => handleDragOver(e, file)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, file)}
            onDragEnd={handleDragEnd}
            closeLabel={closeLabel}
          />
        ))}
      </div>
    </div>
  );
});
