/**
 * Appearance settings tab for customizing editor visuals
 */
'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEditorStore } from '@/lib/store';

const FONT_FAMILIES = [
  'monospace',
  'Consolas',
  'Courier New',
  'Source Code Pro',
  'Fira Code',
];

export function AppearanceSettings() {
  const { settings, updateSettings } = useEditorStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Font</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => updateSettings({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                min={8}
                max={32}
                value={settings.fontSize}
                onChange={(e) =>
                  updateSettings({ fontSize: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-line-numbers">Show line numbers</Label>
            <Switch
              id="show-line-numbers"
              checked={settings.showLineNumbers}
              onCheckedChange={(checked) =>
                updateSettings({ showLineNumbers: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-ruler">Show ruler</Label>
            <Switch
              id="show-ruler"
              checked={settings.showRuler}
              onCheckedChange={(checked) =>
                updateSettings({ showRuler: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="word-wrap">Word wrap</Label>
            <Switch
              id="word-wrap"
              checked={settings.wordWrap}
              onCheckedChange={(checked) =>
                updateSettings({ wordWrap: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}