/**
 * SettingsDialogコンポーネント
 * 非モーダル設定ダイアログ
 * エディタの各種設定をタブ切替形式で表示・編集する
 * モバイル: フルスクリーンボトムシート
 * デスクトップ: ドラッグ&リサイズ可能なフローティングダイアログ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ThemeSettings } from './tabs/ThemeSettings';
import { EditorSettings } from './tabs/EditorSettings';
import { FileSettings } from './tabs/FileSettings';
import { GeneralSettings } from './tabs/GeneralSettings';
import { useEditorStore } from '@/lib/store';
import { CloseButton } from '@/components/ui/close-button';
import { cn } from '@/lib/utils';
import { Palette, Type, FileText, Settings2 } from 'lucide-react';

// タブ定義（アイコン追加）
const settingsTabs = [
  {
    value: 'theme',
    labelKey: 'settings.tabs.theme',
    Component: ThemeSettings,
    Icon: Palette,
  },
  {
    value: 'editor',
    labelKey: 'settings.tabs.editor',
    Component: EditorSettings,
    Icon: Type,
  },
  {
    value: 'file',
    labelKey: 'settings.tabs.file',
    Component: FileSettings,
    Icon: FileText,
  },
  {
    value: 'general',
    labelKey: 'settings.tabs.general',
    Component: GeneralSettings,
    Icon: Settings2,
  },
];

// サイズの制限
const MIN_WIDTH = 400;
const MIN_HEIGHT = 400;
const DEFAULT_WIDTH = 560;
const DEFAULT_HEIGHT = 640;

// ブレークポイント
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ヘルパー関数: デバイスタイプを判定
const getDeviceType = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width < TABLET_BREAKPOINT) return 'tablet';
  return 'desktop';
};

// ヘルパー関数: ダイアログの初期位置とサイズを計算
const calculateInitialLayout = (deviceType: 'mobile' | 'tablet' | 'desktop') => {
  if (deviceType === 'mobile') {
    return {
      position: { x: 0, y: 0 },
      size: { width: window.innerWidth, height: window.innerHeight },
    };
  }

  if (deviceType === 'tablet') {
    const width = Math.min(DEFAULT_WIDTH, window.innerWidth * 0.9);
    const height = Math.min(DEFAULT_HEIGHT, window.innerHeight * 0.9);
    return {
      position: {
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - height) / 2,
      },
      size: { width, height },
    };
  }

  // desktop
  return {
    position: {
      x: (window.innerWidth - DEFAULT_WIDTH) / 2,
      y: (window.innerHeight - DEFAULT_HEIGHT) / 2,
    },
    size: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
  };
};

// ヘルパー関数: リサイズ後の新しい幅を計算
const calculateNewWidth = (
  direction: ResizeDirection,
  currentWidth: number,
  currentX: number,
  deltaX: number
): { width: number; x: number } => {
  if (!direction) return { width: currentWidth, x: currentX };

  if (direction.includes('e')) {
    return {
      width: Math.max(MIN_WIDTH, currentWidth + deltaX),
      x: currentX,
    };
  }

  if (direction.includes('w')) {
    const potentialWidth = currentWidth - deltaX;
    if (potentialWidth >= MIN_WIDTH) {
      return {
        width: potentialWidth,
        x: currentX + deltaX,
      };
    }
  }

  return { width: currentWidth, x: currentX };
};

// ヘルパー関数: リサイズ後の新しい高さを計算
const calculateNewHeight = (
  direction: ResizeDirection,
  currentHeight: number,
  currentY: number,
  deltaY: number
): { height: number; y: number } => {
  if (!direction) return { height: currentHeight, y: currentY };

  if (direction.includes('s')) {
    return {
      height: Math.max(MIN_HEIGHT, currentHeight + deltaY),
      y: currentY,
    };
  }

  if (direction.includes('n')) {
    const potentialHeight = currentHeight - deltaY;
    if (potentialHeight >= MIN_HEIGHT) {
      return {
        height: potentialHeight,
        y: currentY + deltaY,
      };
    }
  }

  return { height: currentHeight, y: currentY };
};

// ヘルパー関数: ダイアログのスタイルを生成
const getDialogStyles = (
  isMobile: boolean,
  position: { x: number; y: number },
  size: { width: number; height: number }
): React.CSSProperties => {
  if (isMobile) {
    return {
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%',
    };
  }

  return {
    position: 'fixed',
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
  };
};

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings: currentSettings, updateSettings } = useEditorStore();
  const [tempSettings, setTempSettings] = useState(currentSettings);
  const [originalSettings, setOriginalSettings] = useState(currentSettings);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      const deviceType = getDeviceType(window.innerWidth);
      setIsMobile(deviceType === 'mobile');
      setIsTablet(deviceType === 'tablet');
    };
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  useEffect(() => {
    // Guard: ダイアログが閉じられた場合は初期化フラグをリセット
    if (!open) {
      setIsInitialized(false);
      return;
    }

    // Guard: 既に初期化済みの場合は何もしない
    if (isInitialized) return;

    // デバイスタイプに応じた初期レイアウトを計算
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    const layout = calculateInitialLayout(deviceType);

    setPosition(layout.position);
    setSize(layout.size);
    setIsInitialized(true);
    setOriginalSettings(currentSettings);
    setTempSettings(currentSettings);
  }, [open, isInitialized, currentSettings, isMobile, isTablet]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Guard: モバイル・タブレットではドラッグ無効
    if (isMobile) return;
    if (isTablet) return;
    // Guard: ダイアログ参照がない場合は何もしない
    if (!dialogRef.current) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position, isMobile, isTablet]);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    // Guard: モバイル・タブレットではリサイズ無効
    if (isMobile) return;
    if (isTablet) return;

    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    });
  }, [size, position, isMobile, isTablet]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    // Guard: リサイズ中でない場合は何もしない
    if (!isResizing) return;
    // Guard: リサイズ方向が指定されていない場合は何もしない
    if (!resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      const widthResult = calculateNewWidth(
        resizeDirection,
        resizeStart.width,
        resizeStart.posX,
        deltaX
      );

      const heightResult = calculateNewHeight(
        resizeDirection,
        resizeStart.height,
        resizeStart.posY,
        deltaY
      );

      setSize({ width: widthResult.width, height: heightResult.height });
      setPosition({ x: widthResult.x, y: heightResult.y });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, resizeStart]);

  const handleSave = useCallback(() => {
    setOriginalSettings(tempSettings);
    updateSettings(tempSettings);
    toast({ title: t('settings.actions.saved'), duration: 2000 });
    onOpenChange(false);
  }, [tempSettings, updateSettings, toast, t, onOpenChange]);

  const handleReset = useCallback(() => {
    setTempSettings(originalSettings);
    updateSettings(originalSettings);
    toast({ title: t('settings.actions.resetDone'), duration: 2000 });
  }, [originalSettings, updateSettings, toast, t]);

  const handleSettingsChange = useCallback((newSettings: Partial<typeof currentSettings>) => {
    setTempSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    updateSettings(newSettings);
  }, [updateSettings]);

  const handleClose = useCallback(() => {
    // 設定が変更されている場合は元に戻す
    const hasChanges = JSON.stringify(tempSettings) !== JSON.stringify(originalSettings);
    if (hasChanges) {
      updateSettings(originalSettings);
      setTempSettings(originalSettings);
    }
    onOpenChange(false);
  }, [tempSettings, originalSettings, updateSettings, onOpenChange]);

  if (!open) return null;

  const resizeHandleBase = 'absolute z-10';
  const resizeHandleEdge = 'bg-transparent hover:bg-primary/20 transition-colors';
  const resizeHandleCorner = 'w-3 h-3 bg-transparent hover:bg-primary/30 transition-colors rounded-sm';

  const dialogStyles = getDialogStyles(isMobile, position, size);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleClose}
      />

      <div
        ref={dialogRef}
        className={cn(
          'fixed z-50 bg-background border shadow-lg flex flex-col overflow-hidden',
          isMobile ? 'rounded-none' : 'rounded-lg',
        )}
        style={dialogStyles}
      >
        {!isMobile && !isTablet && (
          <>
            <div
              className={cn(resizeHandleBase, resizeHandleEdge, 'top-0 left-3 right-3 h-1 cursor-n-resize')}
              onMouseDown={(e) => handleResizeStart(e, 'n')}
            />
            <div
              className={cn(resizeHandleBase, resizeHandleEdge, 'bottom-0 left-3 right-3 h-1 cursor-s-resize')}
              onMouseDown={(e) => handleResizeStart(e, 's')}
            />
            <div
              className={cn(resizeHandleBase, resizeHandleEdge, 'left-0 top-3 bottom-3 w-1 cursor-w-resize')}
              onMouseDown={(e) => handleResizeStart(e, 'w')}
            />
            <div
              className={cn(resizeHandleBase, resizeHandleEdge, 'right-0 top-3 bottom-3 w-1 cursor-e-resize')}
              onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
            <div
              className={cn(resizeHandleBase, resizeHandleCorner, 'top-0 left-0 cursor-nw-resize')}
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
            />
            <div
              className={cn(resizeHandleBase, resizeHandleCorner, 'top-0 right-0 cursor-ne-resize')}
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
            />
            <div
              className={cn(resizeHandleBase, resizeHandleCorner, 'bottom-0 left-0 cursor-sw-resize')}
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
            />
            <div
              className={cn(resizeHandleBase, resizeHandleCorner, 'bottom-0 right-0 cursor-se-resize')}
              onMouseDown={(e) => handleResizeStart(e, 'se')}
            />
          </>
        )}

        <div
          className={cn(
            'px-4 py-3 border-b shrink-0 select-none flex items-center justify-between',
            !isMobile && !isTablet && 'cursor-move'
          )}
          onMouseDown={handleMouseDown}
        >
          {isMobile && (
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-muted-foreground/30 rounded-full" />
          )}
          <h2 className={cn('font-semibold', isMobile ? 'text-lg mt-2' : 'text-base')}>
            {t('settings.title')}
          </h2>
          <CloseButton
            onClick={handleClose}
            size={isMobile ? 'md' : 'sm'}
            variant="default"
          />
        </div>

        <Tabs defaultValue="theme" className="flex-1 min-h-0 flex flex-col">
          <TabsList className={cn(
            'shrink-0 w-full flex bg-transparent border-b',
            isMobile ? 'justify-around px-0 py-1' : 'justify-start px-4 pt-2'
          )}>
            {settingsTabs.map(({ value, labelKey, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  'data-[state=active]:bg-primary/10',
                  isMobile
                    ? 'flex-1 flex flex-col items-center gap-1 py-2 px-1 text-xs'
                    : 'flex-1 text-sm'
                )}
              >
                {isMobile && <Icon className="h-5 w-5" />}
                <span className={isMobile ? 'truncate max-w-full' : ''}>
                  {t(labelKey)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className={cn(
            'flex-1 min-h-0 overflow-auto',
            isMobile ? 'px-4 py-4' : 'px-4 py-3'
          )}>
            {settingsTabs.map(({ value, Component }) => (
              <TabsContent key={value} value={value} className="mt-0">
                <Component
                  settings={tempSettings}
                  onSettingsChange={handleSettingsChange}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className={cn(
          'flex justify-end gap-3 border-t shrink-0',
          isMobile ? 'px-4 py-4 pb-safe' : 'px-4 py-3'
        )}>
          <Button
            variant="outline"
            size={isMobile ? 'default' : 'sm'}
            onClick={handleReset}
            className={isMobile ? 'flex-1' : ''}
          >
            {t('settings.actions.reset')}
          </Button>
          <Button
            size={isMobile ? 'default' : 'sm'}
            onClick={handleSave}
            className={isMobile ? 'flex-1' : ''}
          >
            {t('settings.actions.save')}
          </Button>
        </div>
      </div>
    </>
  );
};
