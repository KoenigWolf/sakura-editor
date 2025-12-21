'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Download,
  FolderOpen,
  Plus,
  Settings,
  RotateCcw,
  RotateCw,
  Search,
  Columns2,
  Rows2,
  X,
  TextCursorInput,
  AlignLeft,
  Scaling,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchStore } from '@/lib/store/search-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore } from '@/lib/store/split-view-store';
import { useIndentStore } from '@/lib/store/indent-store';
import { indentLines, outdentLines } from '@/lib/indent-utils';
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
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useFileOperations } from '@/hooks/use-file-operations';

const SearchDialog = dynamic(
  () => import('@/components/editor/SearchDialog').then(mod => ({ default: mod.SearchDialog })),
  { ssr: false }
);

interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

const ToolbarButton = ({ icon: Icon, label, shortcut, onClick, active, disabled }: ToolbarButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            'mochi-toolbar-btn group',
            active && 'mochi-toolbar-btn-active',
            disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
          )}
        >
          <Icon className="h-[14px] w-[14px] transition-transform duration-150 group-hover:scale-110 group-active:scale-95" strokeWidth={1.5} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="mochi-tooltip">
        <span>{label}</span>
        {shortcut && (
          <kbd className="mochi-kbd">{shortcut}</kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

interface EditorToolbarProps {
  onOpenSettings?: () => void;
}

export function EditorToolbar({ onOpenSettings }: EditorToolbarProps) {
  const { t } = useTranslation();
  const { setIsOpen: setSearchOpen, isOpen: searchOpen } = useSearchStore();
  const { getEditorInstance } = useEditorInstanceStore();
  const { splitDirection, setSplitDirection, closeSplit } = useSplitViewStore();
  const indentSettings = useIndentStore((state) => state.settings);
  const rulerVisible = useIndentStore((state) => state.rulerVisible);
  const setRulerVisible = useIndentStore((state) => state.setRulerVisible);
  const { isMobile, mounted } = useMobileDetection();
  const { handleNewFile, handleSave, handleOpen } = useFileOperations({ showToast: false });

  const showMobileUI = mounted && isMobile;

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

  const handleIndent = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;
    indentLines(editor, indentSettings);
  }, [getEditorInstance, indentSettings]);

  const handleOutdent = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;
    outdentLines(editor, indentSettings);
  }, [getEditorInstance, indentSettings]);

  const handleToggleRuler = useCallback(() => {
    setRulerVisible(!rulerVisible);
  }, [rulerVisible, setRulerVisible]);

  if (showMobileUI) {
    return (
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={() => {}}
        onReplace={() => {}}
      />
    );
  }

  return (
    <>
    <div className="mochi-toolbar-modern flex items-center gap-1.5 px-2 py-1 w-full overflow-hidden">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label={t('toolbar.settings')}
            className="mochi-toolbar-btn group"
          >
            <Settings className="h-[14px] w-[14px] transition-all duration-200 group-hover:rotate-45" strokeWidth={1.5} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="mochi-tooltip">
          <span>{t('toolbar.settings')}</span>
          <kbd className="mochi-kbd">⌘,</kbd>
        </TooltipContent>
      </Tooltip>

      <div className="mochi-toolbar-separator" />

      <div className="mochi-toolbar-group">
        <ToolbarButton
          icon={Plus}
          label={t('toolbar.newFile')}
          shortcut="⌘N"
          onClick={handleNewFile}
        />
        <ToolbarButton
          icon={Download}
          label={t('toolbar.save')}
          shortcut="⌘S"
          onClick={handleSave}
        />
        <ToolbarButton
          icon={FolderOpen}
          label={t('toolbar.load')}
          shortcut="⌘O"
          onClick={handleOpen}
        />
      </div>

      <div className="mochi-toolbar-separator" />

      <div className="mochi-toolbar-group">
        <ToolbarButton
          icon={RotateCcw}
          label={t('toolbar.undo')}
          shortcut="⌘Z"
          onClick={handleUndo}
        />
        <ToolbarButton
          icon={RotateCw}
          label={t('toolbar.redo')}
          shortcut="⌘Y"
          onClick={handleRedo}
        />
      </div>

      <div className="mochi-toolbar-separator" />

      <div className="mochi-toolbar-group">
        <ToolbarButton
          icon={Search}
          label={t('toolbar.search')}
          shortcut="⌘F"
          onClick={() => setSearchOpen(true)}
        />
      </div>

      <div className="mochi-toolbar-separator" />

      <div className="mochi-toolbar-group">
        <ToolbarButton
          icon={AlignLeft}
          label={t('toolbar.outdent')}
          shortcut="⇧Tab"
          onClick={handleOutdent}
        />
        <ToolbarButton
          icon={TextCursorInput}
          label={t('toolbar.indent')}
          shortcut="Tab"
          onClick={handleIndent}
        />
        <ToolbarButton
          icon={Scaling}
          label={t('toolbar.ruler')}
          onClick={handleToggleRuler}
          active={rulerVisible}
        />
      </div>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t('toolbar.split')}
                className={cn(
                  'mochi-toolbar-btn group',
                  splitDirection && 'mochi-toolbar-btn-active'
                )}
              >
                {splitDirection === 'horizontal' ? (
                  <Rows2 className="h-[14px] w-[14px] transition-transform duration-150 group-hover:scale-110" strokeWidth={1.5} />
                ) : (
                  <Columns2 className="h-[14px] w-[14px] transition-transform duration-150 group-hover:scale-110" strokeWidth={1.5} />
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="mochi-tooltip">{t('toolbar.split')}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="mochi-dropdown">
          <DropdownMenuItem onClick={() => setSplitDirection('vertical')} className="mochi-dropdown-item">
            <div className="mochi-dropdown-icon">
              <Columns2 className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-medium text-sm">{t('toolbar.splitVertical')}</div>
              <div className="text-[10px] text-muted-foreground">{t('split.vertical')}</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSplitDirection('horizontal')} className="mochi-dropdown-item">
            <div className="mochi-dropdown-icon">
              <Rows2 className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-medium text-sm">{t('toolbar.splitHorizontal')}</div>
              <div className="text-[10px] text-muted-foreground">{t('split.horizontal')}</div>
            </div>
          </DropdownMenuItem>
          {splitDirection && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={closeSplit} className="mochi-dropdown-item text-destructive focus:text-destructive">
                <div className="mochi-dropdown-icon bg-destructive/10">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="font-medium text-sm">{t('toolbar.closeSplit')}</div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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
