/**
 * SettingsDialogコンポーネント
 * サクラエディタスタイルの非モーダル設定ダイアログ
 * エディタの各種設定をタブ切替形式で表示・編集する
 */
'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GeneralSettings } from './tabs/GeneralSettings';
import { AppearanceSettings } from './tabs/AppearanceSettings';
import { KeyboardSettings } from './tabs/KeyboardSettings';
import { FileSettings } from './tabs/FileSettings';
import { useEditorStore } from '@/lib/store';
import { X } from 'lucide-react';
import { useDraggableDialog } from '@/hooks/useDraggableDialog';

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
  const [tempSettings, setTempSettings] = useState(currentSettings);
  const dialogRef = useRef<HTMLDivElement>(null);

  // ドラッグ可能なダイアログの位置と動作を管理
  const {
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDraggableDialog(open, dialogRef, {
    margin: 10,
    topMargin: 50,
  });

  // グローバル設定が更新された場合に、一時設定を同期する
  useEffect(() => {
    setTempSettings(currentSettings);
  }, [currentSettings]);

  // 保存ボタン押下時の処理
  const handleSave = useCallback(() => {
    updateSettings(tempSettings);
    toast({
      title: t('settings.actions.saved'),
      description: "設定を保存しました",
      duration: 2000,
    });
  }, [tempSettings, updateSettings, toast, t]);

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
      <DialogContent
        ref={dialogRef}
        className={cn(
          "fixed p-0 shadow-lg border border-input rounded-md",
          "backdrop-blur-sm bg-background/95",
          isDragging && "cursor-grabbing"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '600px',
          maxHeight: '80vh',
          opacity: open ? 1 : 0,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="dialog-header flex items-center justify-between p-2 cursor-grab border-b">
            <div className="text-lg font-semibold">エディタ設定</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 rounded-full text-xs hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[calc(80vh-8rem)]">
              <div className="p-4">
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
          </CardContent>

          <div className="flex justify-end gap-2 p-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              リセット
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
