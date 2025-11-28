/**
 * SettingsDialogコンポーネント
 * サクラエディタスタイルの非モーダル設定ダイアログ
 * エディタの各種設定をタブ切替形式で表示・編集する
 * ドラッグで移動可能、リサイズ可能
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
import { useTheme } from 'next-themes';
import { CloseButton } from '@/components/ui/close-button';
import { cn } from '@/lib/utils';

// タブ定義
const settingsTabs = [
  {
    value: 'theme',
    labelKey: 'settings.tabs.theme',
    Component: ThemeSettings,
  },
  {
    value: 'editor',
    labelKey: 'settings.tabs.editor',
    Component: EditorSettings,
  },
  {
    value: 'file',
    labelKey: 'settings.tabs.file',
    Component: FileSettings,
  },
  {
    value: 'general',
    labelKey: 'settings.tabs.general',
    Component: GeneralSettings,
  },
];

// サイズの制限
const MIN_WIDTH = 400;
const MIN_HEIGHT = 400;
const DEFAULT_WIDTH = 560;
const DEFAULT_HEIGHT = 640;

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings: currentSettings, updateSettings } = useEditorStore();
  const { setTheme } = useTheme();
  const [tempSettings, setTempSettings] = useState(currentSettings);
  // ダイアログを開いた時点の設定を保存（リセット用）
  const [originalSettings, setOriginalSettings] = useState(currentSettings);

  // ドラッグ関連のstate
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ダイアログを中央に配置 & 開いた時点の設定を保存
  useEffect(() => {
    if (open && !isInitialized) {
      const centerX = (window.innerWidth - DEFAULT_WIDTH) / 2;
      const centerY = (window.innerHeight - DEFAULT_HEIGHT) / 2;
      setPosition({ x: centerX, y: centerY });
      setSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      setIsInitialized(true);
      // ダイアログを開いた時点の設定を保存
      setOriginalSettings(currentSettings);
      setTempSettings(currentSettings);
    }
    if (!open) {
      setIsInitialized(false);
    }
  }, [open, isInitialized, currentSettings]);

  // ドラッグ開始
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (dialogRef.current) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position]);

  // リサイズ開始
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
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
  }, [size, position]);

  // ドラッグ中
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

  // リサイズ中
  useEffect(() => {
    if (!isResizing || !resizeDirection) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.posX;
      let newY = resizeStart.posY;

      // 横方向のリサイズ
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        const potentialWidth = resizeStart.width - deltaX;
        if (potentialWidth >= MIN_WIDTH) {
          newWidth = potentialWidth;
          newX = resizeStart.posX + deltaX;
        }
      }

      // 縦方向のリサイズ
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, resizeStart.height + deltaY);
      }
      if (resizeDirection.includes('n')) {
        const potentialHeight = resizeStart.height - deltaY;
        if (potentialHeight >= MIN_HEIGHT) {
          newHeight = potentialHeight;
          newY = resizeStart.posY + deltaY;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
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

  // 保存ボタン押下時の処理（保存して閉じる）
  const handleSave = useCallback(() => {
    // 現在の設定をoriginalSettingsに保存
    setOriginalSettings(tempSettings);
    updateSettings(tempSettings);
    toast({
      title: t('settings.actions.saved'),
      duration: 2000,
    });
    // ダイアログを閉じる
    onOpenChange(false);
  }, [tempSettings, updateSettings, toast, t, onOpenChange]);

  // リセットボタン押下時の処理（ダイアログを開いた時点の設定に戻す）
  const handleReset = useCallback(() => {
    setTempSettings(originalSettings);
    // テーマも元に戻す（リアルタイムプレビュー）
    updateSettings(originalSettings);
    toast({
      title: t('settings.actions.resetDone'),
      duration: 2000,
    });
  }, [originalSettings, updateSettings, toast, t]);

  // 各タブの設定変更時のコールバック（リアルタイムプレビュー）
  const handleSettingsChange = useCallback((newSettings: Partial<typeof currentSettings>) => {
    setTempSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      return updated;
    });
    // ストアも即座に更新してリアルタイムプレビュー
    updateSettings(newSettings);
  }, [updateSettings]);

  // ダイアログを閉じる時の処理
  const handleClose = useCallback(() => {
    // 保存されていない変更を破棄（元の設定に戻す）
    if (JSON.stringify(tempSettings) !== JSON.stringify(originalSettings)) {
      updateSettings(originalSettings);
      setTempSettings(originalSettings);
    }
    onOpenChange(false);
  }, [tempSettings, originalSettings, updateSettings, onOpenChange]);

  if (!open) return null;

  // リサイズハンドルのスタイル
  const resizeHandleBase = 'absolute z-10';
  const resizeHandleEdge = 'bg-transparent hover:bg-primary/20 transition-colors';
  const resizeHandleCorner = 'w-3 h-3 bg-transparent hover:bg-primary/30 transition-colors rounded-sm';

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* ダイアログ */}
      <div
        ref={dialogRef}
        className="fixed z-50 bg-background border rounded-lg shadow-lg flex flex-col overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
        }}
      >
        {/* リサイズハンドル - 上 */}
        <div
          className={cn(resizeHandleBase, resizeHandleEdge, 'top-0 left-3 right-3 h-1 cursor-n-resize')}
          onMouseDown={(e) => handleResizeStart(e, 'n')}
        />
        {/* リサイズハンドル - 下 */}
        <div
          className={cn(resizeHandleBase, resizeHandleEdge, 'bottom-0 left-3 right-3 h-1 cursor-s-resize')}
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
        {/* リサイズハンドル - 左 */}
        <div
          className={cn(resizeHandleBase, resizeHandleEdge, 'left-0 top-3 bottom-3 w-1 cursor-w-resize')}
          onMouseDown={(e) => handleResizeStart(e, 'w')}
        />
        {/* リサイズハンドル - 右 */}
        <div
          className={cn(resizeHandleBase, resizeHandleEdge, 'right-0 top-3 bottom-3 w-1 cursor-e-resize')}
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />
        {/* リサイズハンドル - 左上 */}
        <div
          className={cn(resizeHandleBase, resizeHandleCorner, 'top-0 left-0 cursor-nw-resize')}
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        {/* リサイズハンドル - 右上 */}
        <div
          className={cn(resizeHandleBase, resizeHandleCorner, 'top-0 right-0 cursor-ne-resize')}
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        {/* リサイズハンドル - 左下 */}
        <div
          className={cn(resizeHandleBase, resizeHandleCorner, 'bottom-0 left-0 cursor-sw-resize')}
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        {/* リサイズハンドル - 右下 */}
        <div
          className={cn(resizeHandleBase, resizeHandleCorner, 'bottom-0 right-0 cursor-se-resize')}
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />

        {/* ドラッグ可能なヘッダー */}
        <div
          className="px-4 py-3 border-b shrink-0 cursor-move select-none flex items-center justify-between"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-base font-semibold">{t('settings.title')}</h2>
          <CloseButton
            onClick={handleClose}
            size="sm"
            variant="default"
          />
        </div>

        <Tabs defaultValue="theme" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="shrink-0 w-full flex justify-start px-4 pt-2 bg-transparent">
            {settingsTabs.map(({ value, labelKey }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 text-sm data-[state=active]:bg-primary/10"
              >
                {t(labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 min-h-0 overflow-auto px-4 py-3">
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

        <div className="flex justify-end gap-3 px-4 py-3 border-t shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset}>
            {t('settings.actions.reset')}
          </Button>
          <Button size="sm" onClick={handleSave}>
            {t('settings.actions.save')}
          </Button>
        </div>
      </div>
    </>
  );
};
