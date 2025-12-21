/**
 * 一般設定タブ
 * 言語設定のみ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorSettings } from '@/lib/types/editor';

interface GeneralSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

// セクションカードのラッパー
const SettingsSection = ({
  icon: Icon,
  title,
  children
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => {
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
};

// 言語選択ボタン
const LanguageButton = ({
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
}) => {
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
};

export function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value: 'en' | 'ja') => {
    onSettingsChange({ language: value });
    i18n.changeLanguage(value);
  };

  return (
    <div className="space-y-4">
      {/* 言語 */}
      <SettingsSection icon={Globe} title={t('settings.general.language.title')}>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t('settings.general.language.label')}</p>
          <div className="flex gap-2">
            <LanguageButton
              value="ja"
              current={settings.language}
              label={t('settings.general.language.options.ja.label')}
              flag={t('settings.general.language.options.ja.flag')}
              onClick={() => handleLanguageChange('ja')}
            />
            <LanguageButton
              value="en"
              current={settings.language}
              label={t('settings.general.language.options.en.label')}
              flag={t('settings.general.language.options.en.flag')}
              onClick={() => handleLanguageChange('en')}
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
