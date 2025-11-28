/**
 * キーボード設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Keyboard, Save, Search, Undo2, Redo2, RotateCcw } from 'lucide-react';

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

// ショートカット行
function ShortcutRow({
  icon: Icon,
  label,
  shortcut
}: {
  icon: React.ElementType;
  label: string;
  shortcut: string;
}) {
  const keys = shortcut.split(' + ');

  return (
    <div className="flex items-center justify-between py-2.5 px-2 rounded hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index}>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted border rounded shadow-sm">
              {key}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-muted-foreground mx-0.5">+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function KeyboardSettings() {
  const { t } = useTranslation();

  const KEYBOARD_SHORTCUTS = [
    { icon: Save, labelKey: 'settings.keyboard.saveFile', shortcut: 'Ctrl + S' },
    { icon: Search, labelKey: 'settings.keyboard.find', shortcut: 'Ctrl + F' },
    { icon: Undo2, labelKey: 'settings.keyboard.undo', shortcut: 'Ctrl + Z' },
    { icon: Redo2, labelKey: 'settings.keyboard.redo', shortcut: 'Ctrl + Y' },
  ];

  return (
    <div className="space-y-4">
      {/* ショートカット一覧 */}
      <SettingsSection icon={Keyboard} title={t('settings.keyboard.title')}>
        <div className="space-y-0.5">
          {KEYBOARD_SHORTCUTS.map(({ icon, labelKey, shortcut }) => (
            <ShortcutRow
              key={labelKey}
              icon={icon}
              label={t(labelKey)}
              shortcut={shortcut}
            />
          ))}
        </div>
      </SettingsSection>

      {/* リセットボタン */}
      <Button variant="outline" className="w-full gap-2">
        <RotateCcw className="h-4 w-4" />
        {t('settings.keyboard.reset')}
      </Button>
    </div>
  );
}
