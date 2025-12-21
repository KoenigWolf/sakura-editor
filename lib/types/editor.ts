/**
 * Configuration settings for the editor.
 */
export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  autoSave: boolean;
  autoSaveInterval: number;
  createBackup: boolean;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showRuler: boolean;
  showWhitespace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
  showFullWidthSpace: 'none' | 'boundary' | 'selection' | 'trailing' | 'all';
  theme: 'system' | 'light' | 'dark' | string;
  language: 'en' | 'ja';
}

/**
 * Default editor settings
 */
export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  fontSize: 14,
  fontFamily: 'monospace',
  lineHeight: 1.5,
  tabSize: 2,
  autoSave: true,
  autoSaveInterval: 30,
  createBackup: true,
  wordWrap: true,
  showLineNumbers: true,
  showRuler: true,
  showWhitespace: 'all',
  showFullWidthSpace: 'all',
  theme: 'system',
  language: 'en',
}; 
