/**
 * 表示設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import type { EditorSettings } from '@/lib/types/editor';

const FONT_FAMILIES = [
  'monospace',
  'Consolas',
  'Courier New',
  'Source Code Pro',
  'Fira Code',
];

interface AppearanceSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

export function AppearanceSettings({ settings, onSettingsChange }: AppearanceSettingsProps) {
  const { t } = useTranslation();
  const { theme: currentTheme, setTheme } = useTheme();

  // テーマ切り替えハンドラー（即座に反映）
  const handleThemeChange = (value: string) => {
    onSettingsChange({ theme: value });
    setTheme(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.appearance.theme.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme">{t('settings.appearance.theme.label')}</Label>
            <Select
              value={currentTheme || settings.theme}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">
                  {t('settings.appearance.theme.system')}
                </SelectItem>
                <SelectItem value="light">{t('settings.appearance.theme.light')}</SelectItem>
                <SelectItem value="dark">{t('settings.appearance.theme.dark')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.appearance.font.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">{t('settings.appearance.font.family')}</Label>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => onSettingsChange({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">{t('settings.appearance.font.size')}</Label>
              <Input
                id="font-size"
                type="number"
                min={8}
                max={32}
                value={settings.fontSize}
                onChange={(e) =>
                  onSettingsChange({ fontSize: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.appearance.display.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-line-numbers">{t('settings.appearance.display.lineNumbers')}</Label>
            <Switch
              id="show-line-numbers"
              checked={settings.showLineNumbers}
              onCheckedChange={(checked) =>
                onSettingsChange({ showLineNumbers: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-ruler">{t('settings.appearance.display.ruler')}</Label>
            <Switch
              id="show-ruler"
              checked={settings.showRuler}
              onCheckedChange={(checked) =>
                onSettingsChange({ showRuler: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="word-wrap">{t('settings.appearance.display.wordWrap')}</Label>
            <Switch
              id="word-wrap"
              checked={settings.wordWrap}
              onCheckedChange={(checked) =>
                onSettingsChange({ wordWrap: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
