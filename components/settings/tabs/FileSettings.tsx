'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { FileCode, CornerDownLeft, Save, HardDrive, Clock, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorSettings } from '@/lib/types/editor';
import { SettingsSection } from '../SettingsSection';

const ENCODING_VALUES = ['utf-8', 'utf-8-bom', 'shift-jis', 'euc-jp'] as const;
const LINE_ENDING_VALUES = ['lf', 'crlf', 'cr'] as const;

interface FileSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

const SelectionCard = ({
  value,
  current,
  label,
  description,
  onClick
}: {
  value: string;
  current: string;
  label: string;
  description: string;
  onClick: () => void;
}) => {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left w-full',
        isActive
          ? 'border-primary bg-primary/10'
          : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20'
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
};

const SettingRow = ({
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
}) => {
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
};

export function FileSettings({ settings, onSettingsChange }: FileSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <SettingsSection icon={Save} title={t('settings.file.autoSave.title')}>
        <div className="space-y-3">
          <SettingRow
            icon={Clock}
            label={t('settings.file.autoSave.enable')}
            checked={settings.autoSave}
            onCheckedChange={(checked) => onSettingsChange({ autoSave: checked })}
          />
          <div className={cn(
            'flex items-center gap-3 pl-6 transition-opacity',
            !settings.autoSave && 'opacity-50 pointer-events-none'
          )}>
            <Timer className="h-4 w-4 text-muted-foreground shrink-0" />
            <Label className="text-sm text-muted-foreground shrink-0">
              {t('settings.file.autoSave.interval')}
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
                {settings.autoSaveInterval}{t('settings.file.autoSave.unit')}
              </span>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={HardDrive} title={t('settings.file.backup.title')}>
        <SettingRow
          icon={HardDrive}
          label={t('settings.file.backup.enable')}
          description={t('settings.file.backup.description')}
          checked={settings.createBackup}
          onCheckedChange={(checked) => onSettingsChange({ createBackup: checked })}
        />
      </SettingsSection>

      <SettingsSection icon={FileCode} title={t('settings.file.encoding.title')}>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            {t('settings.file.encoding.label')}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {ENCODING_VALUES.map((value) => (
              <SelectionCard
                key={value}
                value={value}
                current="utf-8"
                label={t(`settings.file.encoding.options.${value}.label`)}
                description={t(`settings.file.encoding.options.${value}.description`)}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection icon={CornerDownLeft} title={t('settings.file.lineEnding.title')}>
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            {t('settings.file.lineEnding.label')}
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {LINE_ENDING_VALUES.map((value) => (
              <SelectionCard
                key={value}
                value={value}
                current="lf"
                label={t(`settings.file.lineEnding.options.${value}.label`)}
                description={t(`settings.file.lineEnding.options.${value}.description`)}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
