/**
 * 一般設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EditorSettings } from '@/lib/types/editor';

interface GeneralSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

export function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value: 'en' | 'ja') => {
    onSettingsChange({ language: value });
    i18n.changeLanguage(value);
  };

  return (
    <div className="space-y-5">
      {/* 言語 */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.general.title')}</h3>
        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground w-28">{t('settings.general.language.label')}</Label>
          <Select value={settings.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('settings.general.language.options.en')}</SelectItem>
              <SelectItem value="ja">{t('settings.general.language.options.ja')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* 自動保存 */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.general.autoSave.label')}</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm">{t('settings.general.autoSave.label')}</Label>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => onSettingsChange({ autoSave: checked })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground w-32">{t('settings.general.autoSave.interval')}</Label>
            <Input
              type="number"
              min={1}
              value={settings.autoSaveInterval}
              onChange={(e) => onSettingsChange({ autoSaveInterval: Number(e.target.value) })}
              className="w-20 h-8"
            />
          </div>
        </div>
      </section>

      {/* バックアップ */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.backup.title')}</h3>
        <div className="flex items-center justify-between py-1">
          <Label className="text-sm">{t('settings.general.backup.createBackup')}</Label>
          <Switch
            checked={settings.createBackup}
            onCheckedChange={(checked) => onSettingsChange({ createBackup: checked })}
          />
        </div>
      </section>
    </div>
  );
}
