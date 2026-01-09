'use client';

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
import { useSplitViewStore, useIsSplit } from '@/lib/store/split-view-store';
import { useFileStore } from '@/lib/store/file-store';
import { useIndentStore } from '@/lib/store/indent-store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useFileOperations } from '@/hooks/use-file-operations';
import { useEditorActions } from '@/hooks/use-editor-actions';

const SearchDialog = dynamic(
  () => import('@/components/editor/SearchDialog').then((mod) => ({ default: mod.SearchDialog })),
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

const ToolbarButton = ({
  icon: Icon,
  label,
  shortcut,
  onClick,
  active,
  disabled,
}: ToolbarButtonProps) => {
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
          <Icon
            className="h-[14px] w-[14px] transition-transform duration-150 group-hover:scale-110 group-active:scale-95"
            strokeWidth={1.5}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="mochi-tooltip">
        <span>{label}</span>
        {shortcut && <kbd className="mochi-kbd">{shortcut}</kbd>}
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
  const { reset, splitActive } = useSplitViewStore();
  const isSplit = useIsSplit();
  const activeFile = useFileStore((state) => state.files.find((f) => f.id === state.activeFileId));
  const addFile = useFileStore((state) => state.addFile);
  const rulerVisible = useIndentStore((state) => state.rulerVisible);
  const setRulerVisible = useIndentStore((state) => state.setRulerVisible);
  const { isMobile, mounted } = useMobileDetection();
  const { handleNewFile, handleSave, handleOpen } = useFileOperations({ showToast: false });
  const { handleUndo, handleRedo, handleIndent, handleOutdent } = useEditorActions();

  const showMobileUI = mounted && isMobile;

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
              <Settings
                className="h-[14px] w-[14px] transition-all duration-200 group-hover:rotate-45"
                strokeWidth={1.5}
              />
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
            onClick={() => setRulerVisible(!rulerVisible)}
            active={rulerVisible}
          />
        </div>

        <div className="mochi-toolbar-group">
          <ToolbarButton
            icon={Columns2}
            label={t('toolbar.splitVertical')}
            shortcut="⌘\\"
            onClick={() => {
              if (!activeFile) return;
              const newFileId = addFile({
                name: `${activeFile.name} (copy)`,
                content: activeFile.content,
                path: '',
                lastModified: Date.now(),
              });
              splitActive('vertical', newFileId);
            }}
          />
          <ToolbarButton
            icon={Rows2}
            label={t('toolbar.splitHorizontal')}
            onClick={() => {
              if (!activeFile) return;
              const newFileId = addFile({
                name: `${activeFile.name} (copy)`,
                content: activeFile.content,
                path: '',
                lastModified: Date.now(),
              });
              splitActive('horizontal', newFileId);
            }}
          />
          {isSplit && <ToolbarButton icon={X} label={t('toolbar.closeSplit')} onClick={reset} />}
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
