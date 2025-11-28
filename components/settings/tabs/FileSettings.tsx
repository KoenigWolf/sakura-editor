/**
 * ファイル設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <div className="space-y-5">
      {/* エンコーディング */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.file.encoding.title')}</h3>
        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground w-36">{t('settings.file.encoding.label')}</Label>
          <Select defaultValue="utf-8">
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENCODINGS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* 改行コード */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.file.lineEnding.title')}</h3>
        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground w-36">{t('settings.file.lineEnding.label')}</Label>
          <Select defaultValue="lf">
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lf">{t('settings.file.lineEnding.options.lf')}</SelectItem>
              <SelectItem value="crlf">{t('settings.file.lineEnding.options.crlf')}</SelectItem>
              <SelectItem value="cr">{t('settings.file.lineEnding.options.cr')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );
}
