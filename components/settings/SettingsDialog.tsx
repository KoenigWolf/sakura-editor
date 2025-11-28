/**
 * SettingsDialogコンポーネント
 * サクラエディタスタイルの非モーダル設定ダイアログ
 * エディタの各種設定をタブ切替形式で表示・編集する
 */
'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GeneralSettings } from './tabs/GeneralSettings';
import { AppearanceSettings } from './tabs/AppearanceSettings';
import { KeyboardSettings } from './tabs/KeyboardSettings';
import { FileSettings } from './tabs/FileSettings';
import { useEditorStore } from '@/lib/store';
import { useTheme } from 'next-themes';

// タブ定義
const settingsTabs = [
  {
    value: 'general',
    label: '一般',
    Component: GeneralSettings,
  },
  {
    value: 'appearance',
    label: '表示',
    Component: AppearanceSettings,
  },
  {
    value: 'keyboard',
    label: 'キーボード',
    Component: KeyboardSettings,
  },
  {
    value: 'file',
    label: 'ファイル',
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

  // グローバル設定が更新された場合に、一時設定を同期する
  useEffect(() => {
    setTempSettings(currentSettings);
  }, [currentSettings]);

  // 保存ボタン押下時の処理
  const handleSave = useCallback(() => {
    updateSettings(tempSettings);
    if (tempSettings.theme) {
      setTheme(tempSettings.theme);
    }
    toast({
      title: t('settings.actions.saved'),
      description: "設定を保存しました",
      duration: 2000,
    });
  }, [tempSettings, updateSettings, toast, t, setTheme]);

  // リセットボタン押下時の処理
  const handleReset = useCallback(() => {
    setTempSettings(currentSettings);
    toast({
      title: "設定をリセットしました",
      duration: 2000,
    });
  }, [currentSettings, toast]);

  // 各タブの設定変更時のコールバック
  const handleSettingsChange = useCallback((newSettings: Partial<typeof currentSettings>) => {
    setTempSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b relative">
          <DialogTitle className="text-lg font-semibold pr-8">エディタ設定</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(80vh-8rem)]">
          <div className="p-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full flex justify-start mb-4">
                {settingsTabs.map(({ value, label }) => (
                  <TabsTrigger 
                    key={value} 
                    value={value}
                    className="flex-1 data-[state=active]:bg-primary/10"
                  >
                    {label}
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
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            リセット
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
