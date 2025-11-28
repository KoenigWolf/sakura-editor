'use client';

import { useFileStore, type FileData } from '@/lib/store/file-store';
import { XIcon, FileCode2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FileTabs() {
  const { files, activeFileId, setActiveFile, removeFile } = useFileStore();

  const handleSelect = (file: FileData) => {
    setActiveFile(file.id);
  };

  const handleClose = (event: React.MouseEvent, file: FileData) => {
    event.stopPropagation();
    removeFile(file.id);
  };

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
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => handleClose(event, file)}
              className="ml-auto h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
            >
              <XIcon className="h-2.5 w-2.5" />
            </Button>
          </button>
        ))}
      </div>
    </div>
  );
}
