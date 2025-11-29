'use client';

import { memo, useCallback, useRef, useState, useEffect, useMemo, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { IndentRuler } from '@/components/editor/IndentRuler';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore } from '@/lib/store/split-view-store';
import { useSearchStore } from '@/lib/store/search-store';
import { useIndentStore } from '@/lib/store/indent-store';
import { useTheme } from 'next-themes';
import { FileTabs } from '@/components/editor/FileTabs';
import { useTranslation } from 'react-i18next';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import type { CommandItem } from '@/components/editor/CommandPalette';
import {
  Plus,
  Download,
  FolderOpen,
  Search,
  Settings,
  RotateCcw,
  RotateCw,
  Columns2,
  Rows2,
  X,
  Moon,
  Sun,
  Hash,
  Sparkles,
  FileText,
  Code2,
  WrapText,
} from 'lucide-react';

// 重いコンポーネントを遅延読み込み
const MonacoEditor = dynamic(
  () => import('@/components/editor/MonacoEditor').then(mod => ({ default: mod.MonacoEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="mochi-skeleton w-full h-full" />
      </div>
    )
  }
);

const CommandPalette = dynamic(
  () => import('@/components/editor/CommandPalette').then(mod => ({ default: mod.CommandPalette })),
  { ssr: false }
);

const SettingsDialog = dynamic(
  () => import('@/components/settings/SettingsDialog').then(mod => ({ default: mod.SettingsDialog })),
  { ssr: false }
);

// ヘルパー関数: テーマを切り替える
const getNextTheme = (currentTheme: string | undefined): string => {
  if (currentTheme === 'dark') return 'light';
  return 'dark';
};

// ヘルパー関数: テーマアイコンを取得
const getThemeIcon = (currentTheme: string | undefined) => {
  if (currentTheme === 'dark') return Sun;
  return Moon;
};

// ヘルパー関数: テーマラベルキーを取得
const getThemeLabelKey = (currentTheme: string | undefined): string => {
  if (currentTheme === 'dark') return 'status.dark';
  return 'status.light';
};

// ヘルパー関数: ファイル名を取得（アクティブファイルがなければデフォルト値）
const getDisplayFileName = (fileName: string | undefined, fallback: string): string => {
  if (fileName) return fileName;
  return fallback;
};

// ヘルパー関数: スプリット方向に応じたスタイルプロパティ名を取得
const getSplitStyleKey = (direction: 'vertical' | 'horizontal' | null, isPrimary: boolean): 'width' | 'height' => {
  if (direction === 'vertical') {
    return isPrimary ? 'width' : 'height';
  }
  return isPrimary ? 'height' : 'width';
};

// ヘルパー関数: スプリット方向に応じたサイズ値を取得
const getSplitStyleValue = (direction: 'vertical' | 'horizontal' | null, ratio: number): string => {
  if (!direction) return '100%';
  return `${ratio * 100}%`;
};

export const EditorContainer = memo(function EditorContainer() {
  const activeFile = useFileStore((state) => state.files.find(f => f.id === state.activeFileId));
  const files = useFileStore((state) => state.files);
  const statusInfo = useEditorInstanceStore((state) => state.statusInfo);
  const { getEditorInstance } = useEditorInstanceStore();
  const { splitDirection, splitRatio, setSplitRatio, secondaryFileId, setSecondaryFileId, setSplitDirection, closeSplit } = useSplitViewStore();
  const { setIsOpen: setSearchOpen } = useSearchStore();
  const rulerVisible = useIndentStore((state) => state.rulerVisible);
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();

  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { handleNewFile, handleSave, handleOpen, handleGoToLine } = useKeyboardShortcuts({
    onOpenSettings: () => setShowSettings(true),
    onOpenCommandPalette: () => setShowCommandPalette(true),
  });

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

  const commands: CommandItem[] = useMemo(() => [
    // File commands
    {
      id: 'new-file',
      label: t('commandPalette.actions.newFile'),
      shortcut: '⌘+N',
      icon: Plus,
      action: handleNewFile,
      category: 'file',
    },
    {
      id: 'open-file',
      label: t('commandPalette.actions.openFile'),
      shortcut: '⌘+O',
      icon: FolderOpen,
      action: handleOpen,
      category: 'file',
    },
    {
      id: 'save-file',
      label: t('commandPalette.actions.saveFile'),
      shortcut: '⌘+S',
      icon: Download,
      action: handleSave,
      category: 'file',
    },
    // Edit commands
    {
      id: 'undo',
      label: t('commandPalette.actions.undo'),
      shortcut: '⌘+Z',
      icon: RotateCcw,
      action: handleUndo,
      category: 'edit',
    },
    {
      id: 'redo',
      label: t('commandPalette.actions.redo'),
      shortcut: '⌘+Y',
      icon: RotateCw,
      action: handleRedo,
      category: 'edit',
    },
    // Search commands
    {
      id: 'find',
      label: t('commandPalette.actions.find'),
      shortcut: '⌘+F',
      icon: Search,
      action: () => setSearchOpen(true),
      category: 'search',
    },
    {
      id: 'go-to-line',
      label: t('commandPalette.actions.goToLine'),
      shortcut: '⌘+G',
      icon: Hash,
      action: handleGoToLine,
      category: 'search',
    },
    // View commands
    {
      id: 'split-vertical',
      label: t('commandPalette.actions.splitVertical'),
      icon: Columns2,
      action: () => setSplitDirection('vertical'),
      category: 'view',
    },
    {
      id: 'split-horizontal',
      label: t('commandPalette.actions.splitHorizontal'),
      icon: Rows2,
      action: () => setSplitDirection('horizontal'),
      category: 'view',
    },
    ...(splitDirection ? [{
      id: 'close-split',
      label: t('commandPalette.actions.closeSplit'),
      icon: X,
      action: closeSplit,
      category: 'view' as const,
    }] : []),
    {
      id: 'toggle-theme',
      label: t('commandPalette.actions.toggleTheme'),
      icon: getThemeIcon(resolvedTheme),
      action: () => setTheme(getNextTheme(resolvedTheme)),
      category: 'view',
    },
    // Settings commands
    {
      id: 'open-settings',
      label: t('commandPalette.actions.openSettings'),
      shortcut: '⌘+,',
      icon: Settings,
      action: () => setShowSettings(true),
      category: 'settings',
    },
  ], [t, handleNewFile, handleOpen, handleSave, handleUndo, handleRedo, handleGoToLine, setSearchOpen, setSplitDirection, closeSplit, splitDirection, resolvedTheme, setTheme]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Guard: スプリットモードでない場合は何もしない
    if (!splitDirection) return;
    // Guard: 既にセカンダリファイルが設定されている場合は何もしない
    if (secondaryFileId) return;
    // Guard: ファイルが1つ以下の場合はスプリット不可
    if (files.length <= 1) return;

    const otherFile = files.find(f => f.id !== activeFile?.id);
    if (!otherFile) return;

    setSecondaryFileId(otherFile.id);
  }, [splitDirection, secondaryFileId, files, activeFile?.id, setSecondaryFileId]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const ratio = splitDirection === 'vertical'
      ? (e.clientX - rect.left) / rect.width
      : (e.clientY - rect.top) / rect.height;

    setSplitRatio(ratio);
  }, [isDragging, splitDirection, setSplitRatio]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const secondaryFile = files.find(f => f.id === secondaryFileId);

  return (
    <div className="mochi-editor-container flex flex-col h-full w-full max-w-full overflow-hidden">
      <EditorToolbar onOpenSettings={() => setShowSettings(true)} />
      <FileTabs />
      {rulerVisible && <IndentRuler />}

      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden relative min-h-0 min-w-0 flex ${
          splitDirection === 'vertical' ? 'flex-row' : 'flex-col'
        }`}
      >
        <div
          className="overflow-hidden min-w-0 min-h-0"
          style={{
            [getSplitStyleKey(splitDirection, true)]: getSplitStyleValue(splitDirection, splitRatio),
            [getSplitStyleKey(splitDirection, false)]: '100%',
            flexShrink: 0,
          }}
        >
          <MonacoEditor />
        </div>

        {splitDirection && (
          <div
            className={`
              mochi-splitter
              ${splitDirection === 'vertical' ? 'mochi-splitter-vertical' : 'mochi-splitter-horizontal'}
              ${isDragging ? 'mochi-splitter-active' : ''}
            `}
            onMouseDown={handleMouseDown}
          />
        )}

        {splitDirection && (
          <div className="flex-1 overflow-hidden min-w-0 min-h-0">
            <MonacoEditor fileId={secondaryFileId} isSecondary />
          </div>
        )}
      </div>

      {/* デスクトップ用ステータスバー */}
      <div className="mochi-statusbar-modern flex-shrink-0 overflow-x-auto overflow-y-hidden safe-area-bottom hidden sm:flex">
        {/* 左側: ファイル情報 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="mochi-statusbar-item mochi-statusbar-item-clickable gap-1.5"
            title="Command Palette (⌘P)"
          >
            <Sparkles className="h-3 w-3" strokeWidth={1.5} />
            <span className="truncate max-w-[180px] flex items-center gap-1.5 text-[11px]">
              {activeFile?.isDirty && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
              {getDisplayFileName(activeFile?.name, t('status.untitled'))}
            </span>
          </button>

          <div className="h-3 w-px bg-border/30 mx-1" />

          <div className="mochi-statusbar-item gap-1">
            <Code2 className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            <span className="mochi-statusbar-badge">{statusInfo.language}</span>
          </div>

          <div className="mochi-statusbar-item gap-1">
            <WrapText className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[10px]">{statusInfo.eol}</span>
          </div>

          <div className="mochi-statusbar-item">
            <span className="text-muted-foreground text-[10px]">UTF-8</span>
          </div>
        </div>

        {/* 右側: カーソル位置・統計 */}
        <div className="flex items-center gap-1">
          <div className="mochi-statusbar-item gap-0.5 text-[11px] font-mono">
            <span className="text-foreground">{statusInfo.cursorLine}</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-foreground">{statusInfo.cursorColumn}</span>
          </div>

          <div className="h-3 w-px bg-border/30 mx-1" />

          <div className="mochi-statusbar-item gap-1">
            <FileText className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[10px]">{statusInfo.lineCount}</span>
          </div>

          <div className="h-3 w-px bg-border/30 mx-1" />

          <button
            onClick={() => setTheme(getNextTheme(resolvedTheme))}
            className="mochi-statusbar-item mochi-statusbar-item-clickable gap-1"
          >
            {mounted && (
              <>
                {resolvedTheme === 'dark' ? (
                  <Moon className="h-3 w-3" strokeWidth={1.5} />
                ) : (
                  <Sun className="h-3 w-3" strokeWidth={1.5} />
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* モバイル用ミニステータスバー */}
      <div className="mochi-mobile-statusbar sm:hidden">
        <button
          onClick={() => setShowCommandPalette(true)}
          className="mochi-mobile-status-item"
        >
          {activeFile?.isDirty && (
            <span className="mochi-dirty-indicator" />
          )}
          <span className="truncate">{getDisplayFileName(activeFile?.name, t('status.untitled'))}</span>
        </button>

        <div className="mochi-mobile-status-info">
          <span>{statusInfo.cursorLine}:{statusInfo.cursorColumn}</span>
          <span className="mochi-mobile-status-badge">{statusInfo.language}</span>
        </div>

        <button
          onClick={() => setTheme(getNextTheme(resolvedTheme))}
          className="mochi-mobile-status-icon"
        >
          {mounted && (
            resolvedTheme === 'dark' ? (
              <Moon className="h-3.5 w-3.5" />
            ) : (
              <Sun className="h-3.5 w-3.5" />
            )
          )}
        </button>
      </div>

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        commands={commands}
      />

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
});
