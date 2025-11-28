/**
 * ファイル設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, FileCode, CornerDownLeft } from 'lucide-react';
import type { EditorSettings } from '@/lib/types/editor';

// エンコーディングと改行コードの値リスト（ラベルは翻訳から取得）
const ENCODING_VALUES = ['utf-8', 'utf-8-bom', 'shift-jis', 'euc-jp'] as const;
const LINE_ENDING_VALUES = ['lf', 'crlf', 'cr'] as const;

interface FileSettingsProps {
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

// 選択カード
function SelectionCard({
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
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left w-full ${
        isActive
          ? 'border-primary bg-primary/10'
          : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

export function FileSettings({ settings, onSettingsChange }: FileSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* エンコーディング */}
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

      {/* 改行コード */}
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

      {/* プレビュー */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          <span>{t('settings.file.preview')}</span>
        </div>
      </div>
    </div>
  );
}
