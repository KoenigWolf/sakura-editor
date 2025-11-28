/**
 * ファイル設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EditorSettings } from '@/lib/types/editor';

const ENCODINGS = [
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'shift-jis', label: 'Shift JIS' },
  { value: 'euc-jp', label: 'EUC-JP' },
];

interface FileSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

export function FileSettings({ settings, onSettingsChange }: FileSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.file.encoding.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="encoding">{t('settings.file.encoding.label')}</Label>
            <Select defaultValue="utf-8">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENCODINGS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.file.lineEnding.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="line-ending">{t('settings.file.lineEnding.label')}</Label>
            <Select defaultValue="lf">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lf">{t('settings.file.lineEnding.options.lf')}</SelectItem>
                <SelectItem value="crlf">{t('settings.file.lineEnding.options.crlf')}</SelectItem>
                <SelectItem value="cr">{t('settings.file.lineEnding.options.cr')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}