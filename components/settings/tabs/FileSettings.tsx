/**
 * File settings tab for managing file encoding and line endings
 */
'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EditorState } from '@/lib/store';

const ENCODINGS = [
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'shift-jis', label: 'Shift JIS' },
  { value: 'euc-jp', label: 'EUC-JP' },
];

const LINE_ENDINGS = [
  { value: 'lf', label: 'LF (Unix/macOS)' },
  { value: 'crlf', label: 'CRLF (Windows)' },
  { value: 'cr', label: 'CR (Classic Mac)' },
];

interface FileSettingsProps {
  settings: EditorState['settings'];
  onSettingsChange: (settings: Partial<EditorState['settings']>) => void;
}

export function FileSettings({ settings, onSettingsChange }: FileSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">File Encoding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="encoding">Default Encoding</Label>
            <Select defaultValue="utf-8">
              <SelectTrigger>
                <SelectValue placeholder="Select encoding" />
              </SelectTrigger>
              <SelectContent>
                {ENCODINGS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Line Endings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="line-ending">Default Line Ending</Label>
            <Select defaultValue="lf">
              <SelectTrigger>
                <SelectValue placeholder="Select line ending" />
              </SelectTrigger>
              <SelectContent>
                {LINE_ENDINGS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}