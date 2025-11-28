'use client';

import { useState, useCallback, useEffect } from 'react';
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
  SplitSquareHorizontal,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFileStore } from '@/lib/store/file-store';
import { useSearchStore } from '@/lib/store/search-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore } from '@/lib/store/split-view-store';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { SearchDialog } from '@/components/editor/SearchDialog';
import { cn } from '@/lib/utils';

// ツールバーボタンの共通スタイル
const toolbarButtonClass = "h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary shrink-0";

export function EditorToolbar() {
  const { t } = useTranslation();
  const { addFile, getActiveFile } = useFileStore();
  const { setIsOpen: setSearchOpen, isOpen: searchOpen } = useSearchStore();
  const { getEditorInstance } = useEditorInstanceStore();
  const { splitDirection, setSplitDirection, closeSplit } = useSplitViewStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 480);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // モバイル表示
  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-2 py-1.5 border-b bg-muted/40 w-full overflow-hidden">
        {/* 左側: 主要アクション */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={handleNewFile}>
            <FilePlus2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={handleSave}>
            <HardDriveDownload className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={handleLoad}>
            <FolderOpen className="h-4 w-4" />
          </Button>
        </div>

        {/* 中央: 検索 */}
        <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={() => setSearchOpen(true)}>
          <SearchCheck className="h-4 w-4" />
        </Button>

        {/* 右側: メニュー */}
        <div className="flex items-center gap-0.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={toolbarButtonClass}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleUndo}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('toolbar.undo')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRedo}>
                <RotateCw className="h-4 w-4 mr-2" />
                {t('toolbar.redo')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSplitDirection('vertical')}>
                <SplitSquareVertical className="h-4 w-4 mr-2" />
                {t('toolbar.splitVertical')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSplitDirection('horizontal')}>
                <SplitSquareHorizontal className="h-4 w-4 mr-2" />
                {t('toolbar.splitHorizontal')}
              </DropdownMenuItem>
              {splitDirection && (
                <DropdownMenuItem onClick={closeSplit}>
                  <X className="h-4 w-4 mr-2" />
                  {t('toolbar.closeSplit')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={() => setShowSettings(true)}>
            <Cog className="h-4 w-4" />
          </Button>
        </div>

        <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
        <SearchDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onSearch={() => {}}
          onReplace={() => {}}
        />
      </div>
    );
  }

  // デスクトップ表示
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/40 w-full overflow-hidden">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={handleNewFile}>
            <FilePlus2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.newFile')} (Ctrl+N)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={handleSave}>
            <HardDriveDownload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.save')} (Ctrl+S)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={handleLoad}>
            <FolderOpen className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.load')} (Ctrl+O)</TooltipContent>
      </Tooltip>

      <div className="w-px h-5 bg-border mx-1.5 shrink-0" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={handleUndo}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.undo')} (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={handleRedo}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.redo')} (Ctrl+Y)</TooltipContent>
      </Tooltip>

      <div className="w-px h-5 bg-border mx-1.5 shrink-0" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={() => setSearchOpen(true)}>
            <SearchCheck className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.search')} (Ctrl+F)</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(toolbarButtonClass, splitDirection && 'bg-primary/10 text-primary')}
              >
                {splitDirection === 'horizontal' ? (
                  <SplitSquareHorizontal className="h-4 w-4" />
                ) : (
                  <SplitSquareVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{t('toolbar.split')}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setSplitDirection('vertical')}>
            <SplitSquareVertical className="h-4 w-4 mr-2" />
            {t('toolbar.splitVertical')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSplitDirection('horizontal')}>
            <SplitSquareHorizontal className="h-4 w-4 mr-2" />
            {t('toolbar.splitHorizontal')}
          </DropdownMenuItem>
          {splitDirection && (
            <DropdownMenuItem onClick={closeSplit}>
              <X className="h-4 w-4 mr-2" />
              {t('toolbar.closeSplit')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 min-w-0" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={toolbarButtonClass} onClick={() => setShowSettings(true)}>
            <Cog className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('toolbar.settings')}</TooltipContent>
      </Tooltip>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={() => {}}
        onReplace={() => {}}
      />
    </div>
  );
}
