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
  // 汎用
  { value: 'monospace', label: 'monospace (システム)' },
  // Windows
  { value: 'Consolas', label: 'Consolas' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'MS Gothic', label: 'MS ゴシック' },
  { value: 'MS Mincho', label: 'MS 明朝' },
  { value: 'Meiryo', label: 'メイリオ' },
  { value: 'Yu Gothic', label: '游ゴシック' },
  { value: 'BIZ UDGothic', label: 'BIZ UDゴシック' },
  // macOS
  { value: 'Menlo', label: 'Menlo' },
  { value: 'Monaco', label: 'Monaco' },
  { value: 'SF Mono', label: 'SF Mono' },
  { value: 'Hiragino Kaku Gothic ProN', label: 'ヒラギノ角ゴ ProN' },
  { value: 'Hiragino Mincho ProN', label: 'ヒラギノ明朝 ProN' },
  // プログラミング用フォント
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Cascadia Code', label: 'Cascadia Code' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono' },
  { value: 'Hack', label: 'Hack' },
  { value: 'Roboto Mono', label: 'Roboto Mono' },
  // Linux
  { value: 'DejaVu Sans Mono', label: 'DejaVu Sans Mono' },
  { value: 'Ubuntu Mono', label: 'Ubuntu Mono' },
  { value: 'Noto Sans Mono CJK JP', label: 'Noto Sans Mono CJK JP' },
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
              <SelectTrigger className="w-48 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {FONT_FAMILIES.map(({ value, label }) => (
                  <SelectItem key={value} value={value} style={{ fontFamily: value }}>
                    {label}
                  </SelectItem>
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
