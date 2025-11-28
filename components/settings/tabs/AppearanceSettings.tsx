/**
 * 表示設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const handleThemeChange = (value: string) => {
    onSettingsChange({ theme: value });
    setTheme(value);
  };

  return (
    <div className="space-y-5">
      {/* テーマ */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.appearance.theme.title')}</h3>
        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground w-28">{t('settings.appearance.theme.label')}</Label>
          <Select value={currentTheme || settings.theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t('settings.appearance.theme.system')}</SelectItem>
              <SelectItem value="light">{t('settings.appearance.theme.light')}</SelectItem>
              <SelectItem value="dark">{t('settings.appearance.theme.dark')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* フォント */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.appearance.font.title')}</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground w-28">{t('settings.appearance.font.family')}</Label>
            <Select value={settings.fontFamily} onValueChange={(value) => onSettingsChange({ fontFamily: value })}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground w-28">{t('settings.appearance.font.size')}</Label>
            <Input
              type="number"
              min={8}
              max={32}
              value={settings.fontSize}
              onChange={(e) => onSettingsChange({ fontSize: Number(e.target.value) })}
              className="w-20 h-8"
            />
          </div>
        </div>
      </section>

      {/* 表示オプション */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.appearance.display.title')}</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm">{t('settings.appearance.display.lineNumbers')}</Label>
            <Switch
              checked={settings.showLineNumbers}
              onCheckedChange={(checked) => onSettingsChange({ showLineNumbers: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm">{t('settings.appearance.display.ruler')}</Label>
            <Switch
              checked={settings.showRuler}
              onCheckedChange={(checked) => onSettingsChange({ showRuler: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm">{t('settings.appearance.display.wordWrap')}</Label>
            <Switch
              checked={settings.wordWrap}
              onCheckedChange={(checked) => onSettingsChange({ wordWrap: checked })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
