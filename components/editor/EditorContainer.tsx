'use client';

import { memo, useCallback, useRef, useState, useEffect, useMemo } from 'react';
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
import { useMobileDetection } from '@/hooks/use-mobile-detection';
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
  Maximize2,
  Minimize2,
  ChevronUp,
} from 'lucide-react';

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

const getNextTheme = (currentTheme: string | undefined): string => {
  if (currentTheme === 'dark') return 'light';
  return 'dark';
};

const getThemeIcon = (currentTheme: string | undefined) => {
  if (currentTheme === 'dark') return Sun;
  return Moon;
};

const getDisplayFileName = (fileName: string | undefined, fallback: string): string => {
  if (fileName) return fileName;
  return fallback;
};

const getSplitStyleKey = (direction: 'vertical' | 'horizontal' | null, isPrimary: boolean): 'width' | 'height' => {
  if (direction === 'vertical') {
    return isPrimary ? 'width' : 'height';
  }
  return isPrimary ? 'height' : 'width';
};

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
  const [focusMode, setFocusMode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isMobile, mounted } = useMobileDetection();

  const handleEditorAreaClick = useCallback(() => {
    if (!isMobile) return;

    if (focusMode) {
      setFocusMode(false);
      setShowQuickActions(false);
    } else {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      focusTimeoutRef.current = setTimeout(() => {
        setFocusMode(true);
      }, 2000);
    }
  }, [isMobile, focusMode]);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  const toggleQuickActions = useCallback(() => {
    setShowQuickActions(prev => !prev);
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
    {
      id: 'split-vertical',
      label: t('commandPalette.actions.splitVertical'),
      shortcut: '⌘+\\',
      icon: Columns2,
      action: () => setSplitDirection('vertical'),
      category: 'view',
    },
    {
      id: 'split-horizontal',
      label: t('commandPalette.actions.splitHorizontal'),
      shortcut: '⌘+\\',
      icon: Rows2,
      action: () => setSplitDirection('horizontal'),
      category: 'view',
    },
    ...(splitDirection ? [{
      id: 'close-split',
      label: t('commandPalette.actions.closeSplit'),
      shortcut: '⇧⌘+\\',
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
    if (!splitDirection) return;
    if (secondaryFileId) return;

    if (files.length > 1) {
      const otherFile = files.find(f => f.id !== activeFile?.id);
      if (otherFile) {
        setSecondaryFileId(otherFile.id);
        return;
      }
    }

    const currentActiveId = activeFile?.id;
    const existingNames = files.map(f => f.name);
    let newFileName = 'Untitled-2';
    let counter = 2;
    while (existingNames.includes(newFileName)) {
      counter++;
      newFileName = `Untitled-${counter}`;
    }

    useFileStore.getState().addFile({
      name: newFileName,
      content: '',
      path: '',
      lastModified: Date.now(),
    });

    const newActiveId = useFileStore.getState().activeFileId;
    if (newActiveId && newActiveId !== currentActiveId) {
      setSecondaryFileId(newActiveId);
      if (currentActiveId) {
        useFileStore.getState().setActiveFileId(currentActiveId);
      }
    }
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

  const showMobileUI = mounted && isMobile;

  return (
    <div className={`mochi-editor-container flex flex-col h-full w-full max-w-full overflow-hidden ${showMobileUI && focusMode ? 'mochi-focus-mode' : ''}`}>
      {!showMobileUI && <EditorToolbar onOpenSettings={() => setShowSettings(true)} />}

      {showMobileUI && !focusMode && (
        <div className="mochi-mobile-top-bar">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="mochi-mobile-icon-btn"
            aria-label={t('toolbar.settings')}
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={() => setShowCommandPalette(true)}
            className="mochi-mobile-title"
          >
            {activeFile?.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
            <span className="truncate max-w-[150px]">
              {getDisplayFileName(activeFile?.name, t('status.untitled'))}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFocusMode(true)}
            className="mochi-mobile-icon-btn"
            aria-label={t('toolbar.fullscreen')}
          >
            <Maximize2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* モバイル: ウルトラミニマルタブ（フォーカスモード以外） */}
      {showMobileUI && !focusMode && files.length > 1 && (
        <div className="mochi-ultra-minimal-tabs">
          {files.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => useFileStore.getState().setActiveFileId(file.id)}
              className={`mochi-ultra-minimal-tab ${
                file.id === activeFile?.id ? 'mochi-ultra-minimal-tab-active' : ''
              } ${file.isDirty ? 'mochi-ultra-minimal-tab-dirty' : ''}`}
            >
              {file.name.length > 12 ? `${file.name.slice(0, 10)}...` : file.name}
            </button>
          ))}
        </div>
      )}

      {/* デスクトップ: 通常タブ */}
      {!showMobileUI && <FileTabs />}

      {/* ルーラー（デスクトップのみ） */}
      {!showMobileUI && rulerVisible && <IndentRuler />}

      {/* エディターエリア */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden relative min-h-0 min-w-0 flex ${
          splitDirection === 'vertical' ? 'flex-row' : 'flex-col'
        } ${showMobileUI && focusMode ? 'mochi-editor-fullscreen' : ''}`}
        onClick={handleEditorAreaClick}
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

      {/* モバイル: フォーカスモード時のミニインジケーター */}
      {showMobileUI && focusMode && (
        <div className="mochi-mini-indicator">
          {activeFile?.isDirty && <span className="mochi-mini-indicator-dot" />}
          <span className="mochi-mini-indicator-item">
            {statusInfo.cursorLine}:{statusInfo.cursorColumn}
          </span>
          <span className="mochi-mini-indicator-item">{statusInfo.language}</span>
        </div>
      )}

      {/* モバイル: クイックアクションバー */}
      {showMobileUI && (
        <div className={`mochi-quick-actions ${showQuickActions ? 'visible' : ''}`}>
          <button
            type="button"
            onClick={handleNewFile}
            className="mochi-quick-action-btn"
          >
            <Plus strokeWidth={1.5} />
            <span>{t('toolbar.newFile')}</span>
          </button>
          <button
            type="button"
            onClick={handleOpen}
            className="mochi-quick-action-btn"
          >
            <FolderOpen strokeWidth={1.5} />
            <span>{t('toolbar.load')}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="mochi-quick-action-btn mochi-quick-action-primary"
          >
            <Download strokeWidth={1.5} />
            <span>{t('toolbar.save')}</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mochi-quick-action-btn"
          >
            <Search strokeWidth={1.5} />
            <span>{t('toolbar.search')}</span>
          </button>
          <button
            type="button"
            onClick={handleUndo}
            className="mochi-quick-action-btn"
          >
            <RotateCcw strokeWidth={1.5} />
            <span>{t('toolbar.undo')}</span>
          </button>
        </div>
      )}

      {/* モバイル: ウルトラミニマルステータスバー */}
      {showMobileUI && !focusMode && (
        <div className="mochi-ultra-minimal-status">
          <div className="mochi-ultra-minimal-status-left">
            <span className="mochi-ultra-status-text">
              {statusInfo.cursorLine}:{statusInfo.cursorColumn}
            </span>
            <span className="mochi-ultra-status-text">{statusInfo.language}</span>
          </div>
          <div className="mochi-ultra-minimal-status-right">
            <button
              type="button"
              onClick={toggleQuickActions}
              className="mochi-ultra-status-btn"
            >
              <ChevronUp className={`h-4 w-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setTheme(getNextTheme(resolvedTheme))}
              className="mochi-ultra-status-btn"
            >
              {mounted && (resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />)}
            </button>
          </div>
        </div>
      )}

      {/* モバイル: フォーカスモード解除ボタン */}
      {showMobileUI && focusMode && (
        <button
          type="button"
          onClick={() => setFocusMode(false)}
          className="mochi-focus-exit-hint show"
        >
          <Minimize2 className="h-4 w-4" />
          <span>{t('toolbar.exitFocus')}</span>
        </button>
      )}

      {/* デスクトップ用ステータスバー */}
      <div className="mochi-statusbar-modern flex-shrink-0 overflow-x-auto overflow-y-hidden safe-area-bottom hidden sm:flex">
        {/* 左側: ファイル情報 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCommandPalette(true)}
            className="mochi-statusbar-item mochi-statusbar-item-clickable gap-1.5"
            title={`${t('commandPalette.actions.openSettings')} (⌘P)`}
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
            <span className="text-muted-foreground text-[10px]">{t('status.encoding')}</span>
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


      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        commands={commands}
      />

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
});
