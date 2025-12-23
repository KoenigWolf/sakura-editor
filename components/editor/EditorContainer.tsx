'use client';

import { memo, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { IndentRuler } from '@/components/editor/IndentRuler';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import {
  useSplitViewStore,
  useIsSplit,
  type PaneNode,
  type PaneSplit,
} from '@/lib/store/split-view-store';
import { useSplitWithFile } from '@/hooks/use-split-with-file';
import { useSearchStore } from '@/lib/store/search-store';
import { useIndentStore } from '@/lib/store/indent-store';
import { useTheme } from 'next-themes';
import { FileTabs } from '@/components/editor/FileTabs';
import { useTranslation } from 'react-i18next';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useEditorActions } from '@/hooks/use-editor-actions';
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
  () => import('@/components/editor/MonacoEditor').then((mod) => ({ default: mod.MonacoEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="mochi-skeleton w-full h-full" />
      </div>
    ),
  }
);

const CommandPalette = dynamic(
  () =>
    import('@/components/editor/CommandPalette').then((mod) => ({ default: mod.CommandPalette })),
  { ssr: false }
);

const SettingsDialog = dynamic(
  () =>
    import('@/components/settings/SettingsDialog').then((mod) => ({ default: mod.SettingsDialog })),
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

interface SplitPaneProps {
  node: PaneNode;
  onRatioChange: (splitId: string, ratio: number) => void;
}

const SplitPane = memo(function SplitPane({ node, onRatioChange }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSplitId, setDragSplitId] = useState<string | null>(null);
  const { setActivePane, activePaneId, closePane, setPaneFile, root } = useSplitViewStore();
  const { splitPaneWithNewFile } = useSplitWithFile();
  const files = useFileStore((state) => state.files);
  const hasMultiplePanes = root.type === 'split';
  const { t } = useTranslation();

  const handleMouseDown = useCallback((e: React.MouseEvent, splitId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDragSplitId(splitId);
  }, []);

  useEffect(() => {
    if (!isDragging || !dragSplitId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const split = node as PaneSplit;

      const ratio =
        split.direction === 'vertical'
          ? (e.clientX - rect.left) / rect.width
          : (e.clientY - rect.top) / rect.height;

      onRatioChange(dragSplitId, ratio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragSplitId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragSplitId, node, onRatioChange]);

  if (node.type === 'leaf') {
    const fileId = node.fileId;
    const isActive = node.id === activePaneId;

    return (
      <div
        className={`h-full w-full flex flex-col ${isActive ? 'ring-1 ring-primary/30' : ''}`}
        onClick={() => setActivePane(node.id)}
      >
        {hasMultiplePanes && (
          <div className="flex items-center justify-between px-2 py-1 bg-muted/30 border-b border-border/50 flex-shrink-0">
            <select
              value={fileId || ''}
              onChange={(e) => {
                e.stopPropagation();
                setPaneFile(node.id, e.target.value || null);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={t('split.selectFile')}
              className="text-xs bg-transparent border-none outline-none cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 max-w-[150px] truncate"
            >
              {files.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name}
                  {file.isDirty ? ' •' : ''}
                </option>
              ))}
            </select>
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  splitPaneWithNewFile(node.id, 'vertical');
                }}
                className="p-0.5 rounded hover:bg-muted"
                title={t('split.splitVertical')}
              >
                <Columns2 className="h-3 w-3 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  splitPaneWithNewFile(node.id, 'horizontal');
                }}
                className="p-0.5 rounded hover:bg-muted"
                title={t('split.splitHorizontal')}
              >
                <Rows2 className="h-3 w-3 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closePane(node.id);
                }}
                className="p-0.5 rounded hover:bg-muted"
                title={t('split.closePane')}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <MonacoEditor fileId={fileId} />
        </div>
      </div>
    );
  }

  const isVertical = node.direction === 'vertical';

  return (
    <div
      ref={containerRef}
      className={`h-full w-full flex ${isVertical ? 'flex-row' : 'flex-col'}`}
    >
      <div
        className="overflow-hidden min-w-0 min-h-0"
        style={{
          [isVertical ? 'width' : 'height']: `${node.ratio * 100}%`,
          [isVertical ? 'height' : 'width']: '100%',
          flexShrink: 0,
        }}
      >
        <SplitPane node={node.first} onRatioChange={onRatioChange} />
      </div>

      <div
        className={`
          mochi-splitter
          ${isVertical ? 'mochi-splitter-vertical' : 'mochi-splitter-horizontal'}
          ${isDragging && dragSplitId === node.id ? 'mochi-splitter-active' : ''}
        `}
        onMouseDown={(e) => handleMouseDown(e, node.id)}
      />

      <div className="flex-1 overflow-hidden min-w-0 min-h-0">
        <SplitPane node={node.second} onRatioChange={onRatioChange} />
      </div>
    </div>
  );
});

export const EditorContainer = memo(function EditorContainer() {
  const activeFile = useFileStore((state) => state.files.find((f) => f.id === state.activeFileId));
  const files = useFileStore((state) => state.files);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const statusInfo = useEditorInstanceStore((state) => state.statusInfo);
  const { root, setRatio, setPaneFile, reset } = useSplitViewStore();
  const { splitActiveWithNewFile } = useSplitWithFile();
  const isSplit = useIsSplit();
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

  useEffect(() => {
    if (root.type === 'leaf' && root.fileId === null && activeFileId) {
      setPaneFile(root.id, activeFileId);
    }
  }, [root, activeFileId, setPaneFile]);

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
    setShowQuickActions((prev) => !prev);
  }, []);

  const { handleNewFile, handleSave, handleOpen, handleGoToLine } = useKeyboardShortcuts({
    onOpenSettings: () => setShowSettings(true),
    onOpenCommandPalette: () => setShowCommandPalette(true),
  });
  const { handleUndo, handleRedo } = useEditorActions();

  const commands: CommandItem[] = useMemo(
    () => [
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
        action: () => splitActiveWithNewFile('vertical'),
        category: 'view',
      },
      {
        id: 'split-horizontal',
        label: t('commandPalette.actions.splitHorizontal'),
        shortcut: '⌘+\\',
        icon: Rows2,
        action: () => splitActiveWithNewFile('horizontal'),
        category: 'view',
      },
      ...(isSplit
        ? [
            {
              id: 'close-split',
              label: t('commandPalette.actions.closeSplit'),
              shortcut: '⇧⌘+\\',
              icon: X,
              action: reset,
              category: 'view' as const,
            },
          ]
        : []),
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
    ],
    [
      t,
      handleNewFile,
      handleOpen,
      handleSave,
      handleUndo,
      handleRedo,
      handleGoToLine,
      setSearchOpen,
      splitActiveWithNewFile,
      reset,
      isSplit,
      resolvedTheme,
      setTheme,
    ]
  );

  const showMobileUI = mounted && isMobile;

  return (
    <div
      className={`mochi-editor-container flex flex-col h-full w-full max-w-full overflow-hidden ${showMobileUI && focusMode ? 'mochi-focus-mode' : ''}`}
      role="application"
      aria-label={t('editor.title')}
    >
      {!showMobileUI && (
        <header role="banner">
          <EditorToolbar onOpenSettings={() => setShowSettings(true)} />
        </header>
      )}

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
            {activeFile?.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
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

      {!showMobileUI && <FileTabs />}

      {!showMobileUI && rulerVisible && <IndentRuler />}

      <div
        className={`flex-1 overflow-hidden relative min-h-0 min-w-0 ${showMobileUI && focusMode ? 'mochi-editor-fullscreen' : ''}`}
        onClick={handleEditorAreaClick}
      >
        <SplitPane node={root} onRatioChange={setRatio} />
      </div>

      {showMobileUI && focusMode && (
        <div className="mochi-mini-indicator">
          {activeFile?.isDirty && <span className="mochi-mini-indicator-dot" />}
          <span className="mochi-mini-indicator-item">
            {statusInfo.cursorLine}:{statusInfo.cursorColumn}
          </span>
          <span className="mochi-mini-indicator-item">{statusInfo.language}</span>
        </div>
      )}

      {showMobileUI && (
        <div className={`mochi-quick-actions ${showQuickActions ? 'visible' : ''}`}>
          <button type="button" onClick={handleNewFile} className="mochi-quick-action-btn">
            <Plus strokeWidth={1.5} />
            <span>{t('toolbar.newFile')}</span>
          </button>
          <button type="button" onClick={handleOpen} className="mochi-quick-action-btn">
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
          <button type="button" onClick={handleUndo} className="mochi-quick-action-btn">
            <RotateCcw strokeWidth={1.5} />
            <span>{t('toolbar.undo')}</span>
          </button>
        </div>
      )}

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
              aria-label={t('accessibility.toggleQuickActions')}
              aria-expanded={showQuickActions}
            >
              <ChevronUp
                className={`h-4 w-4 transition-transform ${showQuickActions ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => setTheme(getNextTheme(resolvedTheme))}
              className="mochi-ultra-status-btn"
              aria-label={t('accessibility.toggleTheme')}
            >
              {mounted &&
                (resolvedTheme === 'dark' ? (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ))}
            </button>
          </div>
        </div>
      )}

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

      <div className="mochi-statusbar-modern flex-shrink-0 overflow-x-auto overflow-y-hidden safe-area-bottom hidden sm:flex">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCommandPalette(true)}
            className="mochi-statusbar-item mochi-statusbar-item-clickable gap-1.5"
            title={`${t('commandPalette.actions.openSettings')} (⌘P)`}
            aria-label={t('accessibility.openCommandPalette')}
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
            type="button"
            onClick={() => setTheme(getNextTheme(resolvedTheme))}
            className="mochi-statusbar-item mochi-statusbar-item-clickable gap-1"
            aria-label={t('accessibility.toggleTheme')}
          >
            {mounted && (
              <>
                {resolvedTheme === 'dark' ? (
                  <Moon className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Sun className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
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
