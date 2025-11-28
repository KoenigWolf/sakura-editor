'use client';

import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileStore, type FileData } from '@/lib/store/file-store';
import { X, FileCode2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FileTabs = memo(function FileTabs() {
  const { t } = useTranslation();
  const files = useFileStore((state) => state.files);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const removeFile = useFileStore((state) => state.removeFile);

  const handleSelect = useCallback((file: FileData) => {
    setActiveFile(file.id);
  }, [setActiveFile]);

  const handleClose = useCallback((event: React.MouseEvent, file: FileData) => {
    event.stopPropagation();
    removeFile(file.id);
  }, [removeFile]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-muted/30">
      <div className="flex items-center gap-0.5 px-1.5 py-1 overflow-x-auto scrollbar-thin">
        {files.map((file) => (
          <button
            key={file.id}
            type="button"
            onClick={() => handleSelect(file)}
            className={cn(
              'group flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors',
              'hover:bg-accent hover:text-foreground',
              file.id === activeFileId
                ? 'bg-background text-foreground border-border'
                : 'bg-muted/60 text-muted-foreground border-transparent'
            )}
          >
            <FileCode2 className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[180px] flex-1 text-left">{file.name}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => handleClose(event, file)}
              onKeyDown={(e) => e.key === 'Enter' && handleClose(e as unknown as React.MouseEvent, file)}
              className={cn(
                'ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center',
                'opacity-0 group-hover:opacity-100 transition-all duration-150',
                'hover:bg-destructive/90 hover:text-white',
                'text-muted-foreground'
              )}
              aria-label={t('common.close')}
            >
              <X className="h-2.5 w-2.5 stroke-[2.5]" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});
