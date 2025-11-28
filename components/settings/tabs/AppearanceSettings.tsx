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
import { Palette, Type, Monitor, Sun, Moon, Laptop, Hash, Ruler, WrapText, Space } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorSettings } from '@/lib/types/editor';

// フォント一覧
const FONT_FAMILIES = [
  // 汎用
  { value: 'monospace', labelKey: 'settings.appearance.font.system' },
  // Windows
  { value: 'Consolas' },
  { value: 'Courier New' },
  { value: 'MS Gothic' },
  { value: 'MS Mincho' },
  { value: 'Meiryo' },
  { value: 'Yu Gothic' },
  { value: 'BIZ UDGothic' },
  // macOS
  { value: 'Menlo' },
  { value: 'Monaco' },
  { value: 'SF Mono' },
  { value: 'Hiragino Kaku Gothic ProN' },
  { value: 'Hiragino Mincho ProN' },
  // プログラミング用フォント
  { value: 'Source Code Pro' },
  { value: 'Fira Code' },
  { value: 'JetBrains Mono' },
  { value: 'Cascadia Code' },
  { value: 'IBM Plex Mono' },
  { value: 'Hack' },
  { value: 'Roboto Mono' },
  // Linux
  { value: 'DejaVu Sans Mono' },
  { value: 'Ubuntu Mono' },
  { value: 'Noto Sans Mono CJK JP' },
];

interface AppearanceSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

// セクションカードのラッパー
function SettingsSection({
  icon: Icon,
  title,
  children
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}

// テーマ選択ボタン
function ThemeButton({
  value,
  current,
  icon: Icon,
  label,
  onClick
}: {
  value: string;
  current: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all flex-1',
        isActive
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20'
      )}
    >
      <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

// スイッチ付き設定行
function SettingRow({
  icon: Icon,
  label,
  checked,
  onCheckedChange
}: {
  icon: React.ElementType;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm cursor-pointer">{label}</Label>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function AppearanceSettings({ settings, onSettingsChange }: AppearanceSettingsProps) {
  const { t } = useTranslation();
  const { theme: currentTheme, setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    onSettingsChange({ theme: value });
    setTheme(value);
  };

  return (
    <div className="space-y-4">
      {/* テーマ */}
      <SettingsSection icon={Palette} title={t('settings.appearance.theme.title')}>
        <div className="flex gap-2">
          <ThemeButton
            value="light"
            current={currentTheme || settings.theme}
            icon={Sun}
            label={t('settings.appearance.theme.light')}
            onClick={() => handleThemeChange('light')}
          />
          <ThemeButton
            value="dark"
            current={currentTheme || settings.theme}
            icon={Moon}
            label={t('settings.appearance.theme.dark')}
            onClick={() => handleThemeChange('dark')}
          />
          <ThemeButton
            value="system"
            current={currentTheme || settings.theme}
            icon={Laptop}
            label={t('settings.appearance.theme.system')}
            onClick={() => handleThemeChange('system')}
          />
        </div>
      </SettingsSection>

      {/* フォント */}
      <SettingsSection icon={Type} title={t('settings.appearance.font.title')}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground w-24 shrink-0">
              {t('settings.appearance.font.family')}
            </Label>
            <Select value={settings.fontFamily} onValueChange={(value) => onSettingsChange({ fontFamily: value })}>
              <SelectTrigger className="flex-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.labelKey ? t(font.labelKey) : font.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground w-24 shrink-0">
              {t('settings.appearance.font.size')}
            </Label>
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="range"
                min={8}
                max={24}
                value={settings.fontSize}
                onChange={(e) => onSettingsChange({ fontSize: Number(e.target.value) })}
                className="flex-1 h-2 cursor-pointer"
              />
              <span className="text-sm font-mono w-12 text-center bg-muted rounded px-2 py-1">
                {settings.fontSize}px
              </span>
            </div>
          </div>
          {/* フォントプレビュー */}
          <div
            className="mt-2 p-3 rounded-md bg-muted/50 border text-sm"
            style={{ fontFamily: settings.fontFamily, fontSize: settings.fontSize }}
          >
            {t('settings.appearance.font.preview.alphabet')}<br />
            {t('settings.appearance.font.preview.japanese')}
          </div>
        </div>
      </SettingsSection>

      {/* 表示オプション */}
      <SettingsSection icon={Monitor} title={t('settings.appearance.display.title')}>
        <div className="space-y-3">
          <div className="space-y-1">
            <SettingRow
              icon={Hash}
              label={t('settings.appearance.display.lineNumbers')}
              checked={settings.showLineNumbers}
              onCheckedChange={(checked) => onSettingsChange({ showLineNumbers: checked })}
            />
            <SettingRow
              icon={Ruler}
              label={t('settings.appearance.display.ruler')}
              checked={settings.showRuler}
              onCheckedChange={(checked) => onSettingsChange({ showRuler: checked })}
            />
            <SettingRow
              icon={WrapText}
              label={t('settings.appearance.display.wordWrap')}
              checked={settings.wordWrap}
              onCheckedChange={(checked) => onSettingsChange({ wordWrap: checked })}
            />
          </div>
          <div className="flex items-center gap-3 py-2 px-1">
            <Space className="h-4 w-4 text-muted-foreground shrink-0" />
            <Label className="text-sm shrink-0">
              {t('settings.appearance.display.whitespace.label')}
            </Label>
            <Select
              value={settings.showWhitespace}
              onValueChange={(value) => onSettingsChange({ showWhitespace: value as EditorSettings['showWhitespace'] })}
            >
              <SelectTrigger className="flex-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('settings.appearance.display.whitespace.options.none')}</SelectItem>
                <SelectItem value="boundary">{t('settings.appearance.display.whitespace.options.boundary')}</SelectItem>
                <SelectItem value="selection">{t('settings.appearance.display.whitespace.options.selection')}</SelectItem>
                <SelectItem value="trailing">{t('settings.appearance.display.whitespace.options.trailing')}</SelectItem>
                <SelectItem value="all">{t('settings.appearance.display.whitespace.options.all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
