/**
 * Keyboard settings tab for customizing shortcuts and key bindings
 */
'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const KEYBOARD_SHORTCUTS = [
  { label: 'Save File', shortcut: 'Ctrl + S' },
  { label: 'Find', shortcut: 'Ctrl + F' },
  { label: 'Undo', shortcut: 'Ctrl + Z' },
  { label: 'Redo', shortcut: 'Ctrl + Y' },
];

export function KeyboardSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {KEYBOARD_SHORTCUTS.map(({ label, shortcut }) => (
            <div key={label} className="flex items-center justify-between">
              <Label>{label}</Label>
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
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}