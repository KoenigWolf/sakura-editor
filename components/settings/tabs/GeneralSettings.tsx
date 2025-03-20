/**
 * General settings tab including auto-save, backup, and basic editor behavior
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { EditorState } from '@/lib/store';

interface GeneralSettingsProps {
  settings: EditorState['settings'];
  onSettingsChange: (settings: Partial<EditorState['settings']>) => void;
}

export function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value: 'en' | 'ja') => {
    onSettingsChange({ language: value });
    i18n.changeLanguage(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.general.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings.general.language.label')}</Label>
            <Select
              value={settings.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('settings.general.language.options.en')}</SelectItem>
                <SelectItem value="ja">{t('settings.general.language.options.ja')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.general.autoSave.label')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save">{t('settings.general.autoSave.label')}</Label>
            <Switch
              id="auto-save"
              checked={settings.autoSave}
              onCheckedChange={(checked) => onSettingsChange({ autoSave: checked })}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="auto-save-interval">{t('settings.general.autoSave.interval')}</Label>
            <Input
              id="auto-save-interval"
              type="number"
              min={1}
              value={settings.autoSaveInterval}
              onChange={(e) => onSettingsChange({ autoSaveInterval: Number(e.target.value) })}
              className="w-24"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.backup.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="create-backup">{t('settings.general.backup.createBackup')}</Label>
            <Switch
              id="create-backup"
              checked={settings.createBackup}
              onCheckedChange={(checked) => onSettingsChange({ createBackup: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}