/**
 * Represents a single file in the editor.
 */
export interface EditorFile {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
  encoding: 'utf-8' | 'shift-jis' | 'euc-jp';
  lineEnding: 'crlf' | 'lf' | 'cr';
}

/**
 * Maintains undo/redo history for editor content.
 */
export interface HistoryState {
  past: string[];
  future: string[];
  totalEntries: number;
}

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
  theme: 'system',
  language: 'en',
}; 
