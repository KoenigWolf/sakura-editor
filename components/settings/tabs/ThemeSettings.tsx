/**
 * テーマ設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Palette, Sun, Moon, Laptop, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorSettings } from '@/lib/types/editor';
import { getLightThemes, getDarkThemes, type EditorTheme } from '@/lib/themes';

interface ThemeSettingsProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

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

const BaseThemeButton = ({
  value,
  current,
  icon: Icon,
  label,
  onClick
}: {
  value: string;
  current: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all flex-1',
        isActive
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20'
      )}
    >
      <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const ThemeCard = ({
  theme,
  isActive,
  onClick,
  language,
}: {
  theme: EditorTheme;
  isActive: boolean;
  onClick: () => void;
  language: string;
}) => {
  const displayName = language === 'ja' ? theme.nameJa : theme.name;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-xl border-2 transition-all duration-200 overflow-hidden',
        isActive
          ? 'border-primary ring-2 ring-primary/20 shadow-lg'
          : 'border-transparent hover:border-muted-foreground/30 hover:shadow-md bg-card'
      )}
    >
      <div
        className="h-16 w-full relative"
        style={{ backgroundColor: theme.preview.bg }}
      >
        <div className="absolute inset-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.preview.accent }}
            />
            <div
              className="h-1.5 rounded-full w-12"
              style={{ backgroundColor: theme.preview.text, opacity: 0.6 }}
            />
          </div>
          <div className="flex items-center gap-1.5 pl-3">
            <div
              className="h-1.5 rounded-full w-8"
              style={{ backgroundColor: theme.preview.accent, opacity: 0.8 }}
            />
            <div
              className="h-1.5 rounded-full w-16"
              style={{ backgroundColor: theme.preview.text, opacity: 0.4 }}
            />
          </div>
          <div className="flex items-center gap-1.5 pl-3">
            <div
              className="h-1.5 rounded-full w-10"
              style={{ backgroundColor: theme.preview.text, opacity: 0.5 }}
            />
          </div>
        </div>

        {isActive && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="px-2 py-1.5 bg-card">
        <span className={cn(
          'text-xs font-medium truncate block',
          isActive ? 'text-primary' : 'text-foreground'
        )}>
          {displayName}
        </span>
      </div>
    </button>
  );
};

export function ThemeSettings({ settings, onSettingsChange }: ThemeSettingsProps) {
  const { t, i18n } = useTranslation();

  const handleThemeChange = (value: string) => {
    onSettingsChange({ theme: value });
  };

  const darkThemes = getDarkThemes();
  const lightThemes = getLightThemes();

  return (
    <div className="space-y-4">
      <SettingsSection icon={Palette} title={t('settings.theme.title')}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t('settings.theme.baseTheme')}</p>
            <div className="flex gap-2">
              <BaseThemeButton
                value="light"
                current={settings.theme}
                icon={Sun}
                label={t('settings.theme.light')}
                onClick={() => handleThemeChange('light')}
              />
              <BaseThemeButton
                value="dark"
                current={settings.theme}
                icon={Moon}
                label={t('settings.theme.dark')}
                onClick={() => handleThemeChange('dark')}
              />
              <BaseThemeButton
                value="system"
                current={settings.theme}
                icon={Laptop}
                label={t('settings.theme.system')}
                onClick={() => handleThemeChange('system')}
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Moon className="h-3 w-3" />
              {t('settings.theme.darkThemes')}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {darkThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={settings.theme === theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  language={i18n.language}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sun className="h-3 w-3" />
              {t('settings.theme.lightThemes')}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {lightThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={settings.theme === theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  language={i18n.language}
                />
              ))}
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
