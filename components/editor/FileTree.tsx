'use client';

import { useFileStore, type FileData } from '@/lib/store/file-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileIcon, FolderIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FileTreeProps {
  className?: string;
}

export function FileTree({ className }: FileTreeProps) {
  const { t } = useTranslation();
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
          {t('fileTree.title')}
        </h2>
        <div className="space-y-1">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                'group flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm hover:bg-accent',
                file.id === activeFileId && 'bg-accent'
              )}
            >
              <Button
                variant="ghost"
                className={cn(
                  'flex-1 justify-start gap-2 h-auto p-0 font-normal hover:bg-transparent',
                  file.id === activeFileId && 'bg-transparent'
                )}
                onClick={() => handleFileClick(file)}
              >
                <FileIcon className="h-4 w-4" />
                <span className="flex-1 truncate">{file.name}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => handleFileRemove(e, file)}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
} 