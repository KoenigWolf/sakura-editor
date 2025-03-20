'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Save,
  FileUp,
  FilePlus,
  Settings,
  Sun,
  Moon,
  Undo,
  Redo,
  Search,
  SplitSquareVertical,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEditorStore } from '@/lib/store';
import { useFileStore } from '@/lib/store/file-store';
import { useSearchStore } from '@/lib/store/search-store';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { SearchDialog } from '@/components/editor/SearchDialog';

/**
 * Editor toolbar with actions and settings
 */
export function EditorToolbar() {
  const { theme, setTheme } = useTheme();
  const { undo, redo } = useEditorStore();
  const { addFile, getActiveFile, updateFile } = useFileStore();
  const { setIsOpen: setSearchOpen, isOpen: searchOpen } = useSearchStore();
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
    <div className="flex items-center gap-2 p-2 border-b">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleNewFile}>
            <FilePlus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>New File (Ctrl+N)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleSave}>
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save (Ctrl+S)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleLoad}>
            <FileUp className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Load File (Ctrl+O)</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-2" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={undo}>
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={redo}>
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
      </Tooltip>

      <div className="w-px h-6 bg-border mx-2" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Find (Ctrl+F)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <SplitSquareVertical className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Split Editor</TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <SearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
        onSearch={(query, options) => {
          // 検索処理を実装
          console.log('Search:', query, options);
        }}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle Theme</TooltipContent>
      </Tooltip>
    </div>
  );
}