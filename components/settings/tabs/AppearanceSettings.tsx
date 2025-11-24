/**
 * Appearance settings tab for customizing editor visuals
 */
'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EditorState } from '@/lib/store';

const FONT_FAMILIES = [
  'monospace',
  'Consolas',
  'Courier New',
  'Source Code Pro',
  'Fira Code',
];

interface AppearanceSettingsProps {
  settings: EditorState['settings'];
  onSettingsChange: (settings: Partial<EditorState['settings']>) => void;
}

export function AppearanceSettings({ settings, onSettingsChange }: AppearanceSettingsProps) {

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
                onValueChange={(value) => onSettingsChange({ fontFamily: value })}
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
                  onSettingsChange({ fontSize: Number(e.target.value) })
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
                onSettingsChange({ showLineNumbers: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-ruler">Show ruler</Label>
            <Switch
              id="show-ruler"
              checked={settings.showRuler}
              onCheckedChange={(checked) =>
                onSettingsChange({ showRuler: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="word-wrap">Word wrap</Label>
            <Switch
              id="word-wrap"
              checked={settings.wordWrap}
              onCheckedChange={(checked) =>
                onSettingsChange({ wordWrap: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}