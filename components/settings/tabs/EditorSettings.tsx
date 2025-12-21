'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, Monitor, Hash, Ruler, WrapText, Space } from 'lucide-react';
import type { EditorSettings as EditorSettingsType } from '@/lib/types/editor';
import { SettingsSection } from '../SettingsSection';

const FONT_FAMILIES = [
  { value: 'monospace', labelKey: 'settings.editor.font.system' },
  { value: 'Consolas' },
  { value: 'Courier New' },
  { value: 'MS Gothic' },
  { value: 'MS Mincho' },
  { value: 'Meiryo' },
  { value: 'Yu Gothic' },
  { value: 'BIZ UDGothic' },
  { value: 'Menlo' },
  { value: 'Monaco' },
  { value: 'SF Mono' },
  { value: 'Hiragino Kaku Gothic ProN' },
  { value: 'Hiragino Mincho ProN' },
  { value: 'Source Code Pro' },
  { value: 'Fira Code' },
  { value: 'JetBrains Mono' },
  { value: 'Cascadia Code' },
  { value: 'IBM Plex Mono' },
  { value: 'Hack' },
  { value: 'Roboto Mono' },
  { value: 'DejaVu Sans Mono' },
  { value: 'Ubuntu Mono' },
  { value: 'Noto Sans Mono CJK JP' },
];

interface EditorSettingsProps {
  settings: EditorSettingsType;
  onSettingsChange: (settings: Partial<EditorSettingsType>) => void;
}

const SettingRow = ({
  icon: Icon,
  label,
  checked,
  onCheckedChange
}: {
  icon: React.ElementType;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => {
  return (
    <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm cursor-pointer">{label}</Label>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

export function EditorSettings({ settings, onSettingsChange }: EditorSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <SettingsSection icon={Type} title={t('settings.editor.font.title')}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground w-24 shrink-0">
              {t('settings.editor.font.family')}
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
              {t('settings.editor.font.size')}
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
          <div
            className="mt-2 p-3 rounded-md bg-muted/50 border text-sm"
            style={{ fontFamily: settings.fontFamily, fontSize: settings.fontSize }}
          >
            {t('settings.editor.font.preview.alphabet')}<br />
            {t('settings.editor.font.preview.japanese')}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={Monitor} title={t('settings.editor.display.title')}>
        <div className="space-y-3">
          <div className="space-y-1">
            <SettingRow
              icon={Hash}
              label={t('settings.editor.display.lineNumbers')}
              checked={settings.showLineNumbers}
              onCheckedChange={(checked) => onSettingsChange({ showLineNumbers: checked })}
            />
            <SettingRow
              icon={Ruler}
              label={t('settings.editor.display.ruler')}
              checked={settings.showRuler}
              onCheckedChange={(checked) => onSettingsChange({ showRuler: checked })}
            />
            <SettingRow
              icon={WrapText}
              label={t('settings.editor.display.wordWrap')}
              checked={settings.wordWrap}
              onCheckedChange={(checked) => onSettingsChange({ wordWrap: checked })}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={Space} title={t('settings.editor.whitespace.title')}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-1">
            <Label className="text-sm text-muted-foreground shrink-0">
              {t('settings.editor.whitespace.label')}
            </Label>
            <Select
              value={settings.showWhitespace}
              onValueChange={(value) => onSettingsChange({ showWhitespace: value as EditorSettingsType['showWhitespace'] })}
            >
              <SelectTrigger className="flex-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('settings.editor.whitespace.options.none')}</SelectItem>
                <SelectItem value="boundary">{t('settings.editor.whitespace.options.boundary')}</SelectItem>
                <SelectItem value="selection">{t('settings.editor.whitespace.options.selection')}</SelectItem>
                <SelectItem value="trailing">{t('settings.editor.whitespace.options.trailing')}</SelectItem>
                <SelectItem value="all">{t('settings.editor.whitespace.options.all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 py-1">
            <Label className="text-sm text-muted-foreground shrink-0">
              {t('settings.editor.whitespace.fullWidthLabel')}
            </Label>
            <Select
              value={settings.showFullWidthSpace}
              onValueChange={(value) => onSettingsChange({ showFullWidthSpace: value as EditorSettingsType['showFullWidthSpace'] })}
            >
              <SelectTrigger className="flex-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('settings.editor.whitespace.options.none')}</SelectItem>
                <SelectItem value="boundary">{t('settings.editor.whitespace.options.boundary')}</SelectItem>
                <SelectItem value="selection">{t('settings.editor.whitespace.options.selection')}</SelectItem>
                <SelectItem value="trailing">{t('settings.editor.whitespace.options.trailing')}</SelectItem>
                <SelectItem value="all">{t('settings.editor.whitespace.options.all')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
