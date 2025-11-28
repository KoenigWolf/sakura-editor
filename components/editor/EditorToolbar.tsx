'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  HardDriveDownload,
  FolderOpen,
  FilePlus2,
  Cog,
  RotateCcw,
  RotateCw,
  SearchCheck,
  SplitSquareVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFileStore } from '@/lib/store/file-store';
import { useSearchStore } from '@/lib/store/search-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { SearchDialog } from '@/components/editor/SearchDialog';

export function EditorToolbar() {
  const { t } = useTranslation();
  const { addFile, getActiveFile } = useFileStore();
  const { setIsOpen: setSearchOpen, isOpen: searchOpen } = useSearchStore();
  const { getEditorInstance } = useEditorInstanceStore();

  const handleUndo = useCallback(() => {
    const editor = getEditorInstance();
    if (editor) {
      editor.trigger('toolbar', 'undo', null);
    }
  }, [getEditorInstance]);

  const handleRedo = useCallback(() => {
    const editor = getEditorInstance();
    if (editor) {
      editor.trigger('toolbar', 'redo', null);
    }
  }, [getEditorInstance]);
  const [showSettings, setShowSettings] = useState(false);

  const handleNewFile = () => {
    addFile({
      name: 'untitled.txt',
      content: '',
      path: '',
      lastModified: Date.now(),
    });
  };

  const handleSave = async () => {
    const activeFile = getActiveFile();
    if (!activeFile) return;

    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.js,.ts,.jsx,.tsx,.json,.html,.css';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      addFile({
        name: file.name,
        content: text,
        path: '',
        lastModified: file.lastModified,
      });
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/40">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleNewFile}>
            <FilePlus2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.newFile')} (Ctrl+N)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleSave}>
            <HardDriveDownload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.save')} (Ctrl+S)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleLoad}>
            <FolderOpen className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.load')} (Ctrl+O)</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-2" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleUndo}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.undo')} (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleRedo}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.redo')} (Ctrl+Y)</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-2" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
            <SearchCheck className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.search')} (Ctrl+F)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <SplitSquareVertical className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.split')}</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Cog className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.settings')}</TooltipContent>
      </Tooltip>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <SearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
        onSearch={(query, options) => {
          // 検索処理はSearchDialog内で実装済み
        }}
        onReplace={(query, replacement, options) => {
          // 置換処理はSearchDialog内で実装済み
        }}
      />

    </div>
  );
}
