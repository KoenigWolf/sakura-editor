/**
 * キーボード設定タブ
 */
'use client';

import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function KeyboardSettings() {
  const { t } = useTranslation();

  const KEYBOARD_SHORTCUTS = [
    { labelKey: 'settings.keyboard.saveFile', shortcut: 'Ctrl + S' },
    { labelKey: 'settings.keyboard.find', shortcut: 'Ctrl + F' },
    { labelKey: 'settings.keyboard.undo', shortcut: 'Ctrl + Z' },
    { labelKey: 'settings.keyboard.redo', shortcut: 'Ctrl + Y' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.keyboard.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {KEYBOARD_SHORTCUTS.map(({ labelKey, shortcut }) => (
            <div key={labelKey} className="flex items-center justify-between">
              <Label>{t(labelKey)}</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={shortcut}
                  readOnly
                  className="w-32 text-center font-mono"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <Button variant="secondary" className="w-full">
            {t('settings.keyboard.reset')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}