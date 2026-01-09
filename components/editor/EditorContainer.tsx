'use client';

import { memo, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { IndentRuler } from '@/components/editor/IndentRuler';
import { SplitPane } from '@/components/editor/SplitPane';
import { EditorStatusBar } from '@/components/editor/EditorStatusBar';
import {
  MobileTopBar,
  MobileTabsBar,
  MobileQuickActions,
  MobileStatusBar,
  MobileFocusModeIndicator,
  MobileFocusExitButton,
} from '@/components/editor/MobileEditorUI';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore, useIsSplit } from '@/lib/store/split-view-store';
import { useSplitWithFile } from '@/hooks/use-split-with-file';
import { useSearchStore } from '@/lib/store/search-store';
import { useIndentStore } from '@/lib/store/indent-store';
import { useTheme } from 'next-themes';
import { FileTabs } from '@/components/editor/FileTabs';
import { useTranslation } from 'react-i18next';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useEditorActions } from '@/hooks/use-editor-actions';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { useVirtualKeyboard } from '@/hooks/use-virtual-keyboard';
import { TabContextMenu } from '@/components/editor/TabContextMenu';
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
} from 'lucide-react';

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

const getNextTheme = (currentTheme: string | undefined): string =>
  currentTheme === 'dark' ? 'light' : 'dark';

const getThemeIcon = (currentTheme: string | undefined) => (currentTheme === 'dark' ? Sun : Moon);

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
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    fileId: string;
    fileName: string;
  }>({ isOpen: false, position: { x: 0, y: 0 }, fileId: '', fileName: '' });
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isMobile, mounted } = useMobileDetection();
  const { isKeyboardVisible } = useVirtualKeyboard();

  const handleTabLongPress = useCallback(
    (fileId: string, fileName: string, event: React.TouchEvent | React.MouseEvent) => {
      let x: number;
      let y: number;

      if ('touches' in event) {
        const touch = event.touches[0] || event.changedTouches[0];
        x = touch.clientX;
        y = touch.clientY;
      } else {
        x = event.clientX;
        y = event.clientY;
      }

      setContextMenu({ isOpen: true, position: { x, y }, fileId, fileName });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCloseTab = useCallback(() => {
    if (contextMenu.fileId) {
      useFileStore.getState().removeFile(contextMenu.fileId);
    }
  }, [contextMenu.fileId]);

  const handleCloseOtherTabs = useCallback(() => {
    const allFiles = useFileStore.getState().files;
    allFiles.forEach((file) => {
      if (file.id !== contextMenu.fileId) {
        useFileStore.getState().removeFile(file.id);
      }
    });
  }, [contextMenu.fileId]);

  const handleCloseAllTabs = useCallback(() => {
    useFileStore.getState().files.forEach((file) => {
      useFileStore.getState().removeFile(file.id);
    });
  }, []);

  const handleDuplicateTab = useCallback(() => {
    if (contextMenu.fileId) {
      const file = useFileStore.getState().files.find((f) => f.id === contextMenu.fileId);
      if (file) {
        useFileStore.getState().addFile({
          name: `${file.name} (copy)`,
          content: file.content,
          path: '',
          lastModified: Date.now(),
        });
      }
    }
  }, [contextMenu.fileId]);

  const handleRenameTab = useCallback(() => {
    if (contextMenu.fileId) {
      const newName = prompt(t('tabMenu.rename'), contextMenu.fileName);
      if (newName && newName.trim()) {
        useFileStore.getState().renameFile(contextMenu.fileId, newName.trim());
      }
    }
  }, [contextMenu.fileId, contextMenu.fileName, t]);

  const switchToNextFile = useCallback(() => {
    const currentIndex = files.findIndex((f) => f.id === activeFileId);
    if (currentIndex < files.length - 1) {
      useFileStore.getState().setActiveFileId(files[currentIndex + 1].id);
    }
  }, [files, activeFileId]);

  const switchToPrevFile = useCallback(() => {
    const currentIndex = files.findIndex((f) => f.id === activeFileId);
    if (currentIndex > 0) {
      useFileStore.getState().setActiveFileId(files[currentIndex - 1].id);
    }
  }, [files, activeFileId]);

  const swipeHandlers = useSwipeGesture({
    threshold: 80,
    preventVertical: true,
    onSwipeLeft: switchToNextFile,
    onSwipeRight: switchToPrevFile,
  });

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
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = setTimeout(() => setFocusMode(true), 2000);
    }
  }, [isMobile, focusMode]);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, []);

  const toggleQuickActions = useCallback(() => setShowQuickActions((prev) => !prev), []);
  // resolvedTheme を依存から除外し、呼び出し時に取得（commands の依存を削減）
  const resolvedThemeRef = useRef(resolvedTheme);
  resolvedThemeRef.current = resolvedTheme;
  const toggleTheme = useCallback(
    () => setTheme(getNextTheme(resolvedThemeRef.current)),
    [setTheme]
  );

  // 安定したコールバック（commands の依存を削減）
  const openSearch = useCallback(() => setSearchOpen(true), [setSearchOpen]);
  const openSettings = useCallback(() => setShowSettings(true), []);
  const splitVertical = useCallback(
    () => splitActiveWithNewFile('vertical'),
    [splitActiveWithNewFile]
  );
  const splitHorizontal = useCallback(
    () => splitActiveWithNewFile('horizontal'),
    [splitActiveWithNewFile]
  );

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
        action: openSearch,
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
        action: splitVertical,
        category: 'view',
      },
      {
        id: 'split-horizontal',
        label: t('commandPalette.actions.splitHorizontal'),
        shortcut: '⌘+\\',
        icon: Rows2,
        action: splitHorizontal,
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
        action: toggleTheme,
        category: 'view',
      },
      {
        id: 'open-settings',
        label: t('commandPalette.actions.openSettings'),
        shortcut: '⌘+,',
        icon: Settings,
        action: openSettings,
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
      openSearch,
      openSettings,
      splitVertical,
      splitHorizontal,
      reset,
      isSplit,
      resolvedTheme,
      toggleTheme,
    ]
  );

  const showMobileUI = mounted && isMobile;

  return (
    <div
      className={`mochi-editor-container flex flex-col h-full w-full max-w-full overflow-hidden ${showMobileUI && focusMode ? 'mochi-focus-mode' : ''}`}
      role="application"
      aria-label={t('editor.title')}
    >
      <a href="#main-editor" className="skip-link sr-only-focusable">
        {t('accessibility.skipToContent')}
      </a>

      {!showMobileUI && (
        <header role="banner">
          <EditorToolbar onOpenSettings={() => setShowSettings(true)} />
        </header>
      )}

      {showMobileUI && !focusMode && (
        <MobileTopBar
          activeFile={activeFile}
          onOpenSettings={() => setShowSettings(true)}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onEnterFocusMode={() => setFocusMode(true)}
        />
      )}

      {showMobileUI && !focusMode && (
        <MobileTabsBar
          files={files}
          activeFileId={activeFile?.id}
          onTabPress={(id) => useFileStore.getState().setActiveFileId(id)}
          onTabLongPress={handleTabLongPress}
        />
      )}

      {!showMobileUI && <FileTabs />}
      {!showMobileUI && rulerVisible && <IndentRuler />}

      <main
        id="main-editor"
        className={`flex-1 overflow-hidden relative min-h-0 min-w-0 ${showMobileUI && focusMode ? 'mochi-editor-fullscreen' : ''}`}
        onClick={handleEditorAreaClick}
        role="region"
        aria-label={t('accessibility.mainEditor')}
        {...(showMobileUI && files.length > 1 ? swipeHandlers : {})}
      >
        <SplitPane node={root} onRatioChange={setRatio} />
      </main>

      {showMobileUI && focusMode && (
        <MobileFocusModeIndicator isDirty={activeFile?.isDirty} statusInfo={statusInfo} />
      )}

      {showMobileUI && !isKeyboardVisible && (
        <MobileQuickActions
          visible={showQuickActions}
          onNewFile={handleNewFile}
          onOpen={handleOpen}
          onSave={handleSave}
          onSearch={() => setSearchOpen(true)}
          onUndo={handleUndo}
        />
      )}

      {showMobileUI && !focusMode && !isKeyboardVisible && (
        <MobileStatusBar
          statusInfo={statusInfo}
          showQuickActions={showQuickActions}
          resolvedTheme={resolvedTheme}
          mounted={mounted}
          onToggleQuickActions={toggleQuickActions}
          onToggleTheme={toggleTheme}
        />
      )}

      {showMobileUI && focusMode && !isKeyboardVisible && (
        <MobileFocusExitButton onExit={() => setFocusMode(false)} />
      )}

      <EditorStatusBar
        activeFile={activeFile}
        statusInfo={statusInfo}
        resolvedTheme={resolvedTheme}
        mounted={mounted}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onToggleTheme={toggleTheme}
      />

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        commands={commands}
      />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      <TabContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        fileId={contextMenu.fileId}
        fileName={contextMenu.fileName}
        onClose={closeContextMenu}
        onCloseTab={handleCloseTab}
        onCloseOtherTabs={handleCloseOtherTabs}
        onCloseAllTabs={handleCloseAllTabs}
        onDuplicate={handleDuplicateTab}
        onRename={handleRenameTab}
      />
    </div>
  );
});
