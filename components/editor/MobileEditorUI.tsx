'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLongPress } from '@/hooks/use-long-press';
import {
  Plus,
  Download,
  FolderOpen,
  Search,
  Settings,
  RotateCcw,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  ChevronUp,
} from 'lucide-react';

const getDisplayFileName = (fileName: string | undefined, fallback: string): string =>
  fileName || fallback;

interface MobileTabButtonProps {
  file: { id: string; name: string; isDirty?: boolean };
  isActive: boolean;
  onPress: () => void;
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
}

export const MobileTabButton = memo(function MobileTabButton({
  file,
  isActive,
  onPress,
  onLongPress,
}: MobileTabButtonProps) {
  const longPressHandlers = useLongPress({
    threshold: 500,
    onLongPress,
    onPress,
  });

  return (
    <button
      type="button"
      className={`mochi-ultra-minimal-tab ${
        isActive ? 'mochi-ultra-minimal-tab-active' : ''
      } ${file.isDirty ? 'mochi-ultra-minimal-tab-dirty' : ''}`}
      {...longPressHandlers}
    >
      {file.name.length > 12 ? `${file.name.slice(0, 10)}...` : file.name}
    </button>
  );
});

interface MobileTopBarProps {
  activeFile?: { name?: string; isDirty?: boolean };
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
  onEnterFocusMode: () => void;
}

export const MobileTopBar = memo(function MobileTopBar({
  activeFile,
  onOpenSettings,
  onOpenCommandPalette,
  onEnterFocusMode,
}: MobileTopBarProps) {
  const { t } = useTranslation();

  return (
    <div className="mochi-mobile-top-bar">
      <button
        type="button"
        onClick={onOpenSettings}
        className="mochi-mobile-icon-btn"
        aria-label={t('toolbar.settings')}
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      <button type="button" onClick={onOpenCommandPalette} className="mochi-mobile-title">
        {activeFile?.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        <span className="truncate max-w-[150px]">
          {getDisplayFileName(activeFile?.name, t('status.untitled'))}
        </span>
      </button>

      <button
        type="button"
        onClick={onEnterFocusMode}
        className="mochi-mobile-icon-btn"
        aria-label={t('toolbar.fullscreen')}
      >
        <Maximize2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>
    </div>
  );
});

interface MobileTabsBarProps {
  files: Array<{ id: string; name: string; isDirty?: boolean }>;
  activeFileId?: string;
  onTabPress: (fileId: string) => void;
  onTabLongPress: (
    fileId: string,
    fileName: string,
    event: React.TouchEvent | React.MouseEvent
  ) => void;
}

export const MobileTabsBar = memo(function MobileTabsBar({
  files,
  activeFileId,
  onTabPress,
  onTabLongPress,
}: MobileTabsBarProps) {
  if (files.length <= 1) return null;

  return (
    <div className="mochi-ultra-minimal-tabs">
      {files.map((file) => (
        <MobileTabButton
          key={file.id}
          file={file}
          isActive={file.id === activeFileId}
          onPress={() => onTabPress(file.id)}
          onLongPress={(e) => onTabLongPress(file.id, file.name, e)}
        />
      ))}
    </div>
  );
});

interface MobileQuickActionsProps {
  visible: boolean;
  onNewFile: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSearch: () => void;
  onUndo: () => void;
}

export const MobileQuickActions = memo(function MobileQuickActions({
  visible,
  onNewFile,
  onOpen,
  onSave,
  onSearch,
  onUndo,
}: MobileQuickActionsProps) {
  const { t } = useTranslation();

  return (
    <div className={`mochi-quick-actions ${visible ? 'visible' : ''}`}>
      <button type="button" onClick={onNewFile} className="mochi-quick-action-btn">
        <Plus strokeWidth={1.5} />
        <span>{t('toolbar.newFile')}</span>
      </button>
      <button type="button" onClick={onOpen} className="mochi-quick-action-btn">
        <FolderOpen strokeWidth={1.5} />
        <span>{t('toolbar.load')}</span>
      </button>
      <button
        type="button"
        onClick={onSave}
        className="mochi-quick-action-btn mochi-quick-action-primary"
      >
        <Download strokeWidth={1.5} />
        <span>{t('toolbar.save')}</span>
      </button>
      <button type="button" onClick={onSearch} className="mochi-quick-action-btn">
        <Search strokeWidth={1.5} />
        <span>{t('toolbar.search')}</span>
      </button>
      <button type="button" onClick={onUndo} className="mochi-quick-action-btn">
        <RotateCcw strokeWidth={1.5} />
        <span>{t('toolbar.undo')}</span>
      </button>
    </div>
  );
});

interface MobileStatusBarProps {
  statusInfo: { cursorLine: number; cursorColumn: number; language: string };
  showQuickActions: boolean;
  resolvedTheme?: string;
  mounted: boolean;
  onToggleQuickActions: () => void;
  onToggleTheme: () => void;
}

export const MobileStatusBar = memo(function MobileStatusBar({
  statusInfo,
  showQuickActions,
  resolvedTheme,
  mounted,
  onToggleQuickActions,
  onToggleTheme,
}: MobileStatusBarProps) {
  const { t } = useTranslation();

  return (
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
          onClick={onToggleQuickActions}
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
          onClick={onToggleTheme}
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
  );
});

interface MobileFocusModeIndicatorProps {
  isDirty?: boolean;
  statusInfo: { cursorLine: number; cursorColumn: number; language: string };
}

export const MobileFocusModeIndicator = memo(function MobileFocusModeIndicator({
  isDirty,
  statusInfo,
}: MobileFocusModeIndicatorProps) {
  return (
    <div className="mochi-mini-indicator">
      {isDirty && <span className="mochi-mini-indicator-dot" />}
      <span className="mochi-mini-indicator-item">
        {statusInfo.cursorLine}:{statusInfo.cursorColumn}
      </span>
      <span className="mochi-mini-indicator-item">{statusInfo.language}</span>
    </div>
  );
});

interface MobileFocusExitButtonProps {
  onExit: () => void;
}

export const MobileFocusExitButton = memo(function MobileFocusExitButton({
  onExit,
}: MobileFocusExitButtonProps) {
  const { t } = useTranslation();

  return (
    <button type="button" onClick={onExit} className="mochi-focus-exit-hint show">
      <Minimize2 className="h-4 w-4" />
      <span>{t('toolbar.exitFocus')}</span>
    </button>
  );
});
