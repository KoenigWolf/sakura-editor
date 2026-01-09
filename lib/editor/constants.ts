/**
 * Monaco Editor utility constants and functions
 */

import type { editor } from 'monaco-editor';

type Monaco = typeof import('monaco-editor');

/**
 * Monaco Editorで利用可能な言語モードのマッピング
 */
const LANGUAGE_MAPPINGS: Record<string, string> = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.jsx': 'javascript',
  '.tsx': 'typescript',
  '.html': 'html',
  '.css': 'css',
  '.json': 'json',
  '.md': 'markdown',
  '.py': 'python',
  '.rb': 'ruby',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cs': 'csharp',
  '.php': 'php',
  '.go': 'go',
  '.rs': 'rust',
  '.sql': 'sql',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.txt': 'plaintext',
};

/**
 * ファイル拡張子から言語モードを判定する
 */
export const getLanguageFromFilename = (filename: string | null): string => {
  if (!filename) return 'plaintext';

  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return LANGUAGE_MAPPINGS[extension] || 'plaintext';
};

/**
 * EOL文字列から表示用ラベルを取得
 */
export const getEolLabel = (eol: string): string => {
  if (eol === '\n') return 'LF';
  if (eol === '\r\n') return 'CRLF';
  return 'CR';
};

/**
 * 全角スペースをハイライトすべきか判定
 */
export const shouldHighlightFullWidthSpace = (
  mode: string,
  startPos: { lineNumber: number; column: number },
  endPos: { lineNumber: number; column: number },
  selection: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  } | null,
  lineContent: string,
  monaco: Monaco
): boolean => {
  if (mode === 'all') return true;
  if (mode === 'boundary') return true;

  if (mode === 'selection' && selection) {
    const range = new monaco.Range(
      startPos.lineNumber,
      startPos.column,
      endPos.lineNumber,
      endPos.column
    );
    return monaco.Range.areIntersectingOrTouching(selection, range);
  }

  if (mode === 'trailing') {
    const afterSpace = lineContent.substring(startPos.column - 1);
    return afterSpace.trim().length === 0;
  }

  return false;
};

/**
 * デフォルトのエディタオプション（パフォーマンス最大化）
 */
export const DEFAULT_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  // パフォーマンス最適化
  automaticLayout: true,
  scrollBeyondLastLine: false,
  scrollBeyondLastColumn: 5,
  minimap: { enabled: false },

  // スクロール最適化
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    alwaysConsumeMouseWheel: false,
    useShadows: false,
    vertical: 'auto',
    horizontal: 'auto',
  },
  mouseWheelScrollSensitivity: 1,
  fastScrollSensitivity: 5,
  smoothScrolling: false,
  revealHorizontalRightPadding: 30,

  // レンダリング最適化（不要な機能を無効化）
  renderLineHighlight: 'none',
  roundedSelection: false,
  cursorBlinking: 'solid',
  cursorSmoothCaretAnimation: 'off',
  cursorStyle: 'line',
  cursorWidth: 2,

  // 重い機能を無効化
  bracketPairColorization: { enabled: false },
  folding: false,
  foldingStrategy: 'indentation',
  showFoldingControls: 'never',
  links: false,
  colorDecorators: false,
  renderControlCharacters: false,
  renderValidationDecorations: 'off',

  // 検索・ハイライト無効化
  occurrencesHighlight: 'off',
  selectionHighlight: false,
  matchBrackets: 'never',

  // インテリセンス無効化
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: 'off',
  wordBasedSuggestions: 'off',
  parameterHints: { enabled: false },

  // コードレンズ・ライトバルブ無効化
  codeLens: false,
  // @ts-expect-error Monaco types mismatch - 'off' is valid but not in type definition
  lightbulb: { enabled: 'off' },

  // ホバー無効化
  hover: { enabled: false },

  // フォーマット無効化
  formatOnType: false,
  formatOnPaste: false,

  // 自動補完無効化
  autoClosingBrackets: 'never',
  autoClosingQuotes: 'never',
  autoClosingDelete: 'never',
  autoSurround: 'never',
  autoIndent: 'none',

  // ドラッグ&ドロップ無効化
  dragAndDrop: false,

  // その他最適化
  rulers: [],
  selectOnLineNumbers: true,
  glyphMargin: false,
  lineDecorationsWidth: 4,
  lineNumbersMinChars: 3,
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,

  // エディタ内パディング
  padding: { top: 4, bottom: 4 },

  // アクセシビリティ（スクリーンリーダー検出時に有効化）
  accessibilitySupport: 'auto',

  // 大規模ファイル対応
  largeFileOptimizations: true,
  maxTokenizationLineLength: 5000,
  stopRenderingLineAfter: 10000,
};
