'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  HardDriveDownload,
  FolderOpen,
  FilePlus2,
  Settings2,
  Undo2,
  Redo2,
  Search,
  PanelLeftClose,
  PanelTopClose,
  X,
  Command,
  Sparkles,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SearchDialog } from '@/components/editor/SearchDialog';
import { cn } from '@/lib/utils';
import { validateFile, FILE_SECURITY } from '@/lib/security';
import { useToast } from '@/components/ui/use-toast';

// ツールバーボタンコンポーネント
interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({ icon: Icon, label, shortcut, onClick, active, disabled }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'mochi-toolbar-btn h-8 w-8 p-0 shrink-0',
            active && 'mochi-toolbar-btn-active',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="mochi-command-kbd">{shortcut}</kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

interface EditorToolbarProps {
  onOpenSettings?: () => void;
}

export function EditorToolbar({ onOpenSettings }: EditorToolbarProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addFile, getActiveFile } = useFileStore();
  const { setIsOpen: setSearchOpen, isOpen: searchOpen } = useSearchStore();
  const { getEditorInstance } = useEditorInstanceStore();
  const { splitDirection, setSplitDirection, closeSplit } = useSplitViewStore();
  const [isMobile, setIsMobile] = useState(false);

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
    if (!editor) return;
    editor.trigger('toolbar', 'undo', null);
  }, [getEditorInstance]);

  const handleRedo = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;
    editor.trigger('toolbar', 'redo', null);
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
    input.accept = FILE_SECURITY.ALLOWED_EXTENSIONS.join(',');
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // セキュリティバリデーション
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          title: t('error.fileError'),
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      try {
        const text = await file.text();
        addFile({
          name: validation.sanitizedName,
          content: text,
          path: '',
          lastModified: file.lastModified,
        });
      } catch {
        toast({
          title: t('error.fileError'),
          description: t('error.fileReadFailed'),
          variant: 'destructive',
        });
      }
    };
    input.click();
  };

  // モバイル版ツールバー（iPhone最適化 - フローティングピルスタイル）
  if (isMobile) {
    return (
      <>
        {/* コンパクトトップバー */}
        <div className="mochi-mobile-top-bar">
          <button
            type="button"
            onClick={onOpenSettings}
            className="mochi-mobile-icon-btn"
            aria-label={t('toolbar.settings')}
          >
            <Settings2 className="h-[18px] w-[18px]" />
          </button>

          <div className="mochi-mobile-title">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Sakura Editor</span>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mochi-mobile-icon-btn"
            aria-label={t('toolbar.search')}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* フローティングアクションピル（下部） */}
        <div className="mochi-floating-pill">
          <div className="mochi-pill-inner">
            {/* ファイル操作 */}
            <button
              type="button"
              onClick={handleNewFile}
              className="mochi-pill-btn"
              aria-label={t('toolbar.newFile')}
            >
              <FilePlus2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleLoad}
              className="mochi-pill-btn"
              aria-label={t('toolbar.load')}
            >
              <FolderOpen className="h-5 w-5" />
            </button>

            <div className="mochi-pill-divider" />

            {/* 編集操作 */}
            <button
              type="button"
              onClick={handleUndo}
              className="mochi-pill-btn"
              aria-label={t('toolbar.undo')}
            >
              <Undo2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleRedo}
              className="mochi-pill-btn"
              aria-label={t('toolbar.redo')}
            >
              <Redo2 className="h-5 w-5" />
            </button>

            <div className="mochi-pill-divider" />

            {/* 保存（プライマリ） */}
            <button
              type="button"
              onClick={handleSave}
              className="mochi-pill-btn mochi-pill-btn-primary"
              aria-label={t('toolbar.save')}
            >
              <HardDriveDownload className="h-5 w-5" />
            </button>

            {/* 分割ビュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'mochi-pill-btn',
                    splitDirection && 'mochi-pill-btn-active'
                  )}
                  aria-label={t('toolbar.split')}
                >
                  {splitDirection === 'horizontal' ? (
                    <PanelTopClose className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top" sideOffset={12} className="mochi-mobile-menu">
                <DropdownMenuItem onClick={() => setSplitDirection('vertical')} className="mochi-mobile-menu-item">
                  <PanelLeftClose className="h-5 w-5" />
                  <span>{t('toolbar.splitVertical')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSplitDirection('horizontal')} className="mochi-mobile-menu-item">
                  <PanelTopClose className="h-5 w-5" />
                  <span>{t('toolbar.splitHorizontal')}</span>
                </DropdownMenuItem>
                {splitDirection && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={closeSplit} className="mochi-mobile-menu-item text-destructive">
                      <X className="h-5 w-5" />
                      <span>{t('toolbar.closeSplit')}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <SearchDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onSearch={() => {}}
          onReplace={() => {}}
        />
      </>
    );
  }

  // デスクトップ版ツールバー
  return (
    <div className="mochi-toolbar-modern flex items-center gap-1.5 px-3 py-2 w-full overflow-hidden">
      {/* 設定（左端） */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onOpenSettings}
            className="mochi-toolbar-btn h-8 w-8"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>{t('toolbar.settings')}</span>
          <kbd className="mochi-command-kbd">⌘,</kbd>
        </TooltipContent>
      </Tooltip>

      <div className="mochi-toolbar-separator" />

      {/* ファイル操作グループ */}
      <div className="mochi-toolbar-group">
        <ToolbarButton
          icon={FilePlus2}
          label={t('toolbar.newFile')}
          shortcut="⌘N"
          onClick={handleNewFile}
        />
        <ToolbarButton
          icon={HardDriveDownload}
          label={t('toolbar.save')}
          shortcut="⌘S"
          onClick={handleSave}
        />
        <ToolbarButton
          icon={FolderOpen}
          label={t('toolbar.load')}
          shortcut="⌘O"
          onClick={handleLoad}
        />
      </div>

      <div className="mochi-toolbar-separator" />

      {/* 編集操作グループ */}
      <div className="mochi-toolbar-group">
        <ToolbarButton
          icon={Undo2}
          label={t('toolbar.undo')}
          shortcut="⌘Z"
          onClick={handleUndo}
        />
        <ToolbarButton
          icon={Redo2}
          label={t('toolbar.redo')}
          shortcut="⌘Y"
          onClick={handleRedo}
        />
      </div>

      <div className="mochi-toolbar-separator" />

      {/* 検索グループ */}
      <div className="mochi-toolbar-group">
        <ToolbarButton
          icon={Search}
          label={t('toolbar.search')}
          shortcut="⌘F"
          onClick={() => setSearchOpen(true)}
        />
      </div>

      {/* 分割ビュー */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'mochi-toolbar-btn h-8 w-8',
                  splitDirection && 'mochi-toolbar-btn-active'
                )}
              >
                {splitDirection === 'horizontal' ? (
                  <PanelTopClose className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('toolbar.split')}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          <DropdownMenuItem onClick={() => setSplitDirection('vertical')} className="gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
              <PanelLeftClose className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{t('toolbar.splitVertical')}</div>
              <div className="text-xs text-muted-foreground">Split side by side</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSplitDirection('horizontal')} className="gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
              <PanelTopClose className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{t('toolbar.splitHorizontal')}</div>
              <div className="text-xs text-muted-foreground">Split top and bottom</div>
            </div>
          </DropdownMenuItem>
          {splitDirection && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={closeSplit} className="gap-3 text-destructive focus:text-destructive">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10">
                  <X className="h-4 w-4" />
                </div>
                <div className="font-medium">{t('toolbar.closeSplit')}</div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={() => {}}
        onReplace={() => {}}
      />
    </div>
  );
}
