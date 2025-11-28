/**
 * キーボード設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function KeyboardSettings() {
  const { t } = useTranslation();

  const KEYBOARD_SHORTCUTS = [
    { labelKey: 'settings.keyboard.saveFile', shortcut: 'Ctrl + S' },
    { labelKey: 'settings.keyboard.find', shortcut: 'Ctrl + F' },
    { labelKey: 'settings.keyboard.undo', shortcut: 'Ctrl + Z' },
    { labelKey: 'settings.keyboard.redo', shortcut: 'Ctrl + Y' },
  ];

  return (
    <div className="space-y-5">
      {/* ショートカット一覧 */}
      <section>
        <h3 className="text-sm font-medium mb-3">{t('settings.keyboard.title')}</h3>
        <div className="space-y-1">
          {KEYBOARD_SHORTCUTS.map(({ labelKey, shortcut }) => (
            <div key={labelKey} className="flex items-center justify-between py-1.5">
              <Label className="text-sm">{t(labelKey)}</Label>
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{shortcut}</code>
            </div>
          ))}
        </div>
      </section>

      {/* リセットボタン */}
      <Button variant="outline" size="sm" className="w-full">
        {t('settings.keyboard.reset')}
      </Button>
    </div>
  );
}
