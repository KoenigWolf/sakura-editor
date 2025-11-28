/**
 * SettingsDialogコンポーネント
 * サクラエディタスタイルの非モーダル設定ダイアログ
 * エディタの各種設定をタブ切替形式で表示・編集する
 * ドラッグで移動可能
 */
'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { GeneralSettings } from './tabs/GeneralSettings';
import { AppearanceSettings } from './tabs/AppearanceSettings';
import { KeyboardSettings } from './tabs/KeyboardSettings';
import { FileSettings } from './tabs/FileSettings';
import { useEditorStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { X } from 'lucide-react';

// タブ定義
const settingsTabs = [
  {
    value: 'general',
    labelKey: 'settings.general.title',
    Component: GeneralSettings,
  },
  {
    value: 'appearance',
    labelKey: 'settings.appearance.title',
    Component: AppearanceSettings,
  },
  {
    value: 'keyboard',
    labelKey: 'settings.keyboard.title',
    Component: KeyboardSettings,
  },
  {
    value: 'file',
    labelKey: 'settings.file.encoding.title',
    Component: FileSettings,
  },
];

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

  // ドラッグ関連のstate
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ダイアログを中央に配置
  useEffect(() => {
    if (open && !isInitialized) {
      const centerX = (window.innerWidth - 672) / 2; // max-w-2xl = 672px
      const centerY = (window.innerHeight - window.innerHeight * 0.8) / 2;
      setPosition({ x: centerX, y: centerY });
      setIsInitialized(true);
    }
    if (!open) {
      setIsInitialized(false);
    }
  }, [open, isInitialized]);

  // グローバル設定が更新された場合に、一時設定を同期する
  useEffect(() => {
    setTempSettings(currentSettings);
  }, [currentSettings]);

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

  // 保存ボタン押下時の処理
  const handleSave = useCallback(() => {
    updateSettings(tempSettings);
    if (tempSettings.theme) {
      setTheme(tempSettings.theme);
    }
    toast({
      title: t('settings.actions.saved'),
      duration: 2000,
    });
  }, [tempSettings, updateSettings, toast, t, setTheme]);

  // リセットボタン押下時の処理
  const handleReset = useCallback(() => {
    setTempSettings(currentSettings);
    toast({
      title: t('settings.actions.resetDone'),
      duration: 2000,
    });
  }, [currentSettings, toast, t]);

  // 各タブの設定変更時のコールバック
  const handleSettingsChange = useCallback((newSettings: Partial<typeof currentSettings>) => {
    setTempSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  }, []);

  if (!open) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />

      {/* ダイアログ */}
      <div
        ref={dialogRef}
        className="fixed z-50 bg-background border rounded-lg shadow-lg max-w-2xl w-full h-[80vh] flex flex-col overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* ドラッグ可能なヘッダー */}
        <div
          className="px-6 pt-6 pb-4 border-b relative shrink-0 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-lg font-semibold pr-8">{t('settings.title')}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <div className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full flex justify-start mb-4">
                {settingsTabs.map(({ value, labelKey }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="flex-1 data-[state=active]:bg-primary/10"
                  >
                    {t(labelKey)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {settingsTabs.map(({ value, Component }) => (
                <TabsContent key={value} value={value}>
                  <Component
                    settings={tempSettings}
                    onSettingsChange={handleSettingsChange}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={handleReset}>
            {t('settings.actions.reset')}
          </Button>
          <Button onClick={handleSave}>
            {t('settings.actions.save')}
          </Button>
        </div>
      </div>
    </>
  );
};
