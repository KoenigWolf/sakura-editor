/**
 * 表示設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Type, Monitor, Sun, Moon, Laptop, Hash, Ruler, WrapText, Space, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorSettings } from '@/lib/types/editor';
import { getLightThemes, getDarkThemes, type EditorTheme } from '@/lib/themes';

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

// テーマ選択ボタン（基本テーマ用）
function BaseThemeButton({
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

// カスタムテーマカード
function ThemeCard({
  theme,
  isActive,
  onClick,
  language,
}: {
  theme: EditorTheme;
  isActive: boolean;
  onClick: () => void;
  language: string;
}) {
  const displayName = language === 'ja' ? theme.nameJa : theme.name;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-xl border-2 transition-all duration-200 overflow-hidden',
        isActive
          ? 'border-primary ring-2 ring-primary/20 shadow-lg'
          : 'border-transparent hover:border-muted-foreground/30 hover:shadow-md bg-card'
      )}
    >
      {/* プレビュー */}
      <div
        className="h-16 w-full relative"
        style={{ backgroundColor: theme.preview.bg }}
      >
        {/* コードプレビュー風の装飾 */}
        <div className="absolute inset-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.preview.accent }}
            />
            <div
              className="h-1.5 rounded-full w-12"
              style={{ backgroundColor: theme.preview.text, opacity: 0.6 }}
            />
          </div>
          <div className="flex items-center gap-1.5 pl-3">
            <div
              className="h-1.5 rounded-full w-8"
              style={{ backgroundColor: theme.preview.accent, opacity: 0.8 }}
            />
            <div
              className="h-1.5 rounded-full w-16"
              style={{ backgroundColor: theme.preview.text, opacity: 0.4 }}
            />
          </div>
          <div className="flex items-center gap-1.5 pl-3">
            <div
              className="h-1.5 rounded-full w-10"
              style={{ backgroundColor: theme.preview.text, opacity: 0.5 }}
            />
          </div>
        </div>

        {/* アクティブチェックマーク */}
        {isActive && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* テーマ名 */}
      <div className="px-2 py-1.5 bg-card">
        <span className={cn(
          'text-xs font-medium truncate block',
          isActive ? 'text-primary' : 'text-foreground'
        )}>
          {displayName}
        </span>
      </div>
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
  const { t, i18n } = useTranslation();

  // テーマ変更はストアの更新のみ。実際の適用はThemeProviderで行う
  const handleThemeChange = (value: string) => {
    onSettingsChange({ theme: value });
  };

  const darkThemes = getDarkThemes();
  const lightThemes = getLightThemes();

  return (
    <div className="space-y-4">
      {/* 基本テーマ */}
      <SettingsSection icon={Palette} title={t('settings.appearance.theme.title')}>
        <div className="space-y-4">
          {/* システム / ライト / ダーク */}
          <div className="flex gap-2">
            <BaseThemeButton
              value="light"
              current={settings.theme}
              icon={Sun}
              label={t('settings.appearance.theme.light')}
              onClick={() => handleThemeChange('light')}
            />
            <BaseThemeButton
              value="dark"
              current={settings.theme}
              icon={Moon}
              label={t('settings.appearance.theme.dark')}
              onClick={() => handleThemeChange('dark')}
            />
            <BaseThemeButton
              value="system"
              current={settings.theme}
              icon={Laptop}
              label={t('settings.appearance.theme.system')}
              onClick={() => handleThemeChange('system')}
            />
          </div>

          {/* ダークテーマ */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Moon className="h-3 w-3" />
              {t('settings.appearance.theme.darkThemes')}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {darkThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={settings.theme === theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  language={i18n.language}
                />
              ))}
            </div>
          </div>

          {/* ライトテーマ */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sun className="h-3 w-3" />
              {t('settings.appearance.theme.lightThemes')}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {lightThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={settings.theme === theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  language={i18n.language}
                />
              ))}
            </div>
          </div>
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
