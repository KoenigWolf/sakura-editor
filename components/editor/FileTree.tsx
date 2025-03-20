'use client';

import { useFileStore, type FileData } from '@/lib/store/file-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileIcon, FolderIcon, XIcon } from 'lucide-react';

interface FileTreeProps {
  className?: string;
}

export function FileTree({ className }: FileTreeProps) {
  const { files, activeFileId, setActiveFile, removeFile } = useFileStore();

  const handleFileClick = (file: FileData) => {
    setActiveFile(file.id);
  };

  const handleFileRemove = (e: React.MouseEvent, file: FileData) => {
    e.stopPropagation();
    removeFile(file.id);
  };

  return (
    <ScrollArea className={cn('h-full w-64 border-r', className)}>
      <div className="p-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
          ファイル
        </h2>
        <div className="space-y-1">
          {files.map((file) => (
            <Button
              key={file.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2',
                file.id === activeFileId && 'bg-accent'
              )}
              onClick={() => handleFileClick(file)}
            >
              <FileIcon className="h-4 w-4" />
              <span className="flex-1 truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 opacity-0 group-hover:opacity-100"
                onClick={(e) => handleFileRemove(e, file)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </Button>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
} 