/**
 * 一般設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Globe, Save, Clock, HardDrive, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorSettings } from '@/lib/types/editor';

interface GeneralSettingsProps {
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

// スイッチ付き設定行
function SettingRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 flex-1">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex flex-col">
          <Label className="text-sm cursor-pointer">{label}</Label>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// 言語選択ボタン
function LanguageButton({
  value,
  current,
  label,
  flag,
  onClick
}: {
  value: string;
  current: string;
  label: string;
  flag: string;
  onClick: () => void;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all flex-1',
        isActive
          ? 'border-primary bg-primary/10'
          : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20'
      )}
    >
      <span className="text-lg">{flag}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value: 'en' | 'ja') => {
    onSettingsChange({ language: value });
    i18n.changeLanguage(value);
  };

  return (
    <div className="space-y-4">
      {/* 言語 */}
      <SettingsSection icon={Globe} title={t('settings.general.language.label')}>
        <div className="flex gap-2">
          <LanguageButton
            value="ja"
            current={settings.language}
            label={t('settings.general.language.options.ja')}
            flag="🇯🇵"
            onClick={() => handleLanguageChange('ja')}
          />
          <LanguageButton
            value="en"
            current={settings.language}
            label={t('settings.general.language.options.en')}
            flag="🇺🇸"
            onClick={() => handleLanguageChange('en')}
          />
        </div>
      </SettingsSection>

      {/* 自動保存 */}
      <SettingsSection icon={Save} title={t('settings.general.autoSave.label')}>
        <div className="space-y-3">
          <SettingRow
            icon={Clock}
            label={t('settings.general.autoSave.label')}
            checked={settings.autoSave}
            onCheckedChange={(checked) => onSettingsChange({ autoSave: checked })}
          />
          <div className={cn(
            'flex items-center gap-3 pl-6 transition-opacity',
            !settings.autoSave && 'opacity-50 pointer-events-none'
          )}>
            <Timer className="h-4 w-4 text-muted-foreground shrink-0" />
            <Label className="text-sm text-muted-foreground shrink-0">
              {t('settings.general.autoSave.interval')}
            </Label>
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="range"
                min={5}
                max={300}
                step={5}
                value={settings.autoSaveInterval}
                onChange={(e) => onSettingsChange({ autoSaveInterval: Number(e.target.value) })}
                className="flex-1 h-2 cursor-pointer"
                disabled={!settings.autoSave}
              />
              <span className="text-sm font-mono w-14 text-center bg-muted rounded px-2 py-1">
                {settings.autoSaveInterval}{t('settings.general.autoSave.unit')}
              </span>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* バックアップ */}
      <SettingsSection icon={HardDrive} title={t('settings.backup.title')}>
        <SettingRow
          icon={HardDrive}
          label={t('settings.general.backup.createBackup')}
          description={t('settings.general.backup.description')}
          checked={settings.createBackup}
          onCheckedChange={(checked) => onSettingsChange({ createBackup: checked })}
        />
      </SettingsSection>
    </div>
  );
}
