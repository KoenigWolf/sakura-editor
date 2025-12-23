'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Download, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorSettings } from '@/lib/types/editor';
import { SettingsSection } from '../SettingsSection';
import { usePWA } from '@/hooks/usePWA';

interface GeneralSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

const LanguageButton = ({
  value,
  current,
  label,
  flag,
  onClick,
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
  const { isInstalled, canInstall, needsManualInstall, triggerInstall } = usePWA();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleLanguageChange = (value: 'en' | 'ja') => {
    onSettingsChange({ language: value });
    i18n.changeLanguage(value);
  };

  const handleInstall = async () => {
    if (needsManualInstall) {
      setShowInstructions(true);
    } else {
      await triggerInstall();
    }
  };

  return (
    <div className="space-y-4">
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

      <SettingsSection icon={Download} title={t('settings.general.pwa.title')}>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t('settings.general.pwa.description')}</p>
          {isInstalled ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t('settings.general.pwa.installed')}</span>
            </div>
          ) : canInstall ? (
            <button
              type="button"
              onClick={handleInstall}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'text-sm font-medium'
              )}
            >
              <Download className="h-4 w-4" />
              {needsManualInstall
                ? t('settings.general.pwa.showInstructions')
                : t('settings.general.pwa.installButton')}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground/70">{t('pwa.browser.default')}</p>
          )}
          {showInstructions && needsManualInstall && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-2">{t('pwa.ios.steps')}</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>{t('pwa.ios.step1.title')}</li>
                <li>{t('pwa.ios.step2.title')}</li>
                <li>{t('pwa.ios.step3.title')}</li>
              </ol>
            </div>
          )}
        </div>
      </SettingsSection>
    </div>
  );
}
