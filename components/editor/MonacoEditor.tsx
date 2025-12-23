/**
 * Monaco Editorをラップしたコンポーネント
 * 高機能エディタを提供し、様々な機能を統合する
 */
'use client';

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@monaco-editor/react';
import type { OnMount, BeforeMount } from '@monaco-editor/react';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorStore } from '@/lib/store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSearchStore } from '@/lib/store/search-store';
import { useTheme } from 'next-themes';
import type { editor } from 'monaco-editor';
import { getThemeById, DEFAULT_EDITOR_COLORS, CUSTOM_THEMES } from '@/lib/themes';

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
 * @param filename ファイル名
 * @returns 言語モード文字列
 */
const getLanguageFromFilename = (filename: string | null): string => {
  if (!filename) return 'plaintext';

  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return LANGUAGE_MAPPINGS[extension] || 'plaintext';
};

/**
 * EOL文字列から表示用ラベルを取得
 * @param eol 改行コード
 * @returns ラベル文字列
 */
const getEolLabel = (eol: string): string => {
  if (eol === '\n') return 'LF';
  if (eol === '\r\n') return 'CRLF';
  return 'CR';
};

/**
 * 全角スペースをハイライトすべきか判定
 */
const shouldHighlightFullWidthSpace = (
  mode: string,
  startPos: { lineNumber: number; column: number },
  endPos: { lineNumber: number; column: number },
  selection: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number } | null,
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
 * MonacoEditor Props
 */
interface MonacoEditorProps {
  /** 特定のファイルIDを指定 */
  fileId?: string | null;
  /** ペインID */
  paneId?: string;
  /** セカンダリエディタかどうか（後方互換性） */
  isSecondary?: boolean;
}

/**
 * Monaco Editorコンポーネント
 * エディタの初期化と状態管理を担当
 */
export function MonacoEditor({ fileId, paneId, isSecondary = false }: MonacoEditorProps) {
  const { t } = useTranslation();
  const files = useFileStore((state) => state.files);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const updateFile = useFileStore((state) => state.updateFile);
  const settings = useEditorStore((state) => state.settings);
  const setEditorInstance = useEditorInstanceStore((state) => state.setEditorInstance);
  const setSecondaryEditorInstance = useEditorInstanceStore((state) => state.setSecondaryEditorInstance);
  const updateStatusInfo = useEditorInstanceStore((state) => state.updateStatusInfo);
  const setSearchOpen = useSearchStore((state) => state.setIsOpen);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const currentFileIdRef = useRef<string | null>(null);
  const currentThemeRef = useRef<string | null>(null);
  const fullWidthSpaceDecorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const targetFileId = fileId || activeFileId;
  const activeFile = files.find(f => f.id === targetFileId);

  if (activeFile) {
    currentFileIdRef.current = activeFile.id;
  } else {
    currentFileIdRef.current = null;
  }

  const handleChange = useCallback((value: string | undefined) => {
    const id = currentFileIdRef.current;
    if (id && value !== undefined) {
      updateFile(id, value);
    }
  }, [updateFile]);

  /**
   * 言語モードを設定
   */
  const languageMode = useMemo(() => {
    return getLanguageFromFilename(activeFile?.name || null);
  }, [activeFile]);

  /**
   * 全角スペースをハイライト表示する
   */
  const updateFullWidthSpaceDecorations = useCallback(() => {
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed) return;
    if (!monaco) return;

    const model = ed.getModel();
    if (!model) return;

    // ハイライト無効の場合はクリアして終了
    if (settings.showFullWidthSpace === 'none') {
      if (fullWidthSpaceDecorationsRef.current) {
        fullWidthSpaceDecorationsRef.current.clear();
      }
      return;
    }

    const content = model.getValue();
    const decorations: editor.IModelDeltaDecoration[] = [];
    const fullWidthSpaceRegex = /\u3000/g;
    const selection = ed.getSelection();
    let match;

    while ((match = fullWidthSpaceRegex.exec(content)) !== null) {
      const startPos = model.getPositionAt(match.index);
      const endPos = model.getPositionAt(match.index + 1);
      const lineContent = model.getLineContent(startPos.lineNumber);

      const shouldHighlight = shouldHighlightFullWidthSpace(
        settings.showFullWidthSpace,
        startPos,
        endPos,
        selection,
        lineContent,
        monaco
      );

      if (!shouldHighlight) continue;

      decorations.push({
        range: new monaco.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column
        ),
        options: {
          inlineClassName: 'full-width-space-highlight',
          hoverMessage: { value: t('editor.fullWidthSpace') },
        },
      });
    }

    if (!fullWidthSpaceDecorationsRef.current) {
      fullWidthSpaceDecorationsRef.current = ed.createDecorationsCollection(decorations);
    } else {
      fullWidthSpaceDecorationsRef.current.set(decorations);
    }
  }, [settings.showFullWidthSpace]);

  /**
   * Monaco Editorがマウントされる前にすべてのカスタムテーマを定義
   */
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    CUSTOM_THEMES.forEach((theme) => {
      const monacoThemeName = `custom-${theme.id}`;
      const baseTheme = theme.type === 'dark' ? 'vs-dark' : 'vs';

      monaco.editor.defineTheme(monacoThemeName, {
        base: baseTheme,
        inherit: true,
        rules: [],
        colors: {
          'editor.background': theme.editor.background,
          'editor.foreground': theme.editor.foreground,
          'editorWhitespace.foreground': theme.editor.whitespace,
          'editorLineNumber.foreground': theme.editor.lineNumber,
          'editor.selectionBackground': theme.editor.selection,
          'editorCursor.foreground': theme.editor.cursor,
        },
      });
    });

    monaco.editor.defineTheme('custom-default-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': DEFAULT_EDITOR_COLORS.dark.background,
        'editor.foreground': DEFAULT_EDITOR_COLORS.dark.foreground,
        'editorWhitespace.foreground': DEFAULT_EDITOR_COLORS.dark.whitespace,
        'editorLineNumber.foreground': DEFAULT_EDITOR_COLORS.dark.lineNumber,
        'editor.selectionBackground': DEFAULT_EDITOR_COLORS.dark.selection,
        'editorCursor.foreground': DEFAULT_EDITOR_COLORS.dark.cursor,
      },
    });

    monaco.editor.defineTheme('custom-default-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': DEFAULT_EDITOR_COLORS.light.background,
        'editor.foreground': DEFAULT_EDITOR_COLORS.light.foreground,
        'editorWhitespace.foreground': DEFAULT_EDITOR_COLORS.light.whitespace,
        'editorLineNumber.foreground': DEFAULT_EDITOR_COLORS.light.lineNumber,
        'editor.selectionBackground': DEFAULT_EDITOR_COLORS.light.selection,
        'editorCursor.foreground': DEFAULT_EDITOR_COLORS.light.cursor,
      },
    });
  }, []);

  /**
   * カスタムMonacoテーマを適用（テーマ変更時用）
   */
  const applyEditorTheme = useCallback((monaco: Monaco, ed: editor.IStandaloneCodeEditor, themeId: string, darkMode: boolean) => {
    const customTheme = getThemeById(themeId);
    const monacoThemeName = customTheme
      ? `custom-${customTheme.id}`
      : `custom-default-${darkMode ? 'dark' : 'light'}`;

    monaco.editor.setTheme(monacoThemeName);
    currentThemeRef.current = themeId;

    const actualIsDark = customTheme ? customTheme.type === 'dark' : darkMode;
    const editorDom = ed.getDomNode();
    if (editorDom) {
      editorDom.classList.remove('dark-editor', 'light-editor');
      editorDom.classList.add(actualIsDark ? 'dark-editor' : 'light-editor');
    }
  }, []);

  /**
   * エディタオプション（パフォーマンス最大化）
   */
  const editorOptions = useMemo(() => {
    return {
      // 基本設定
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      lineHeight: settings.lineHeight,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      lineNumbers: settings.showLineNumbers ? 'on' : 'off',
      renderWhitespace: settings.showWhitespace,

      // パフォーマンス最適化
      automaticLayout: true,
      scrollBeyondLastLine: false,
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

      // アクセシビリティ（パフォーマンス向け調整）
      accessibilitySupport: 'off',

      // 大規模ファイル対応
      largeFileOptimizations: true,
      maxTokenizationLineLength: 5000,
      stopRenderingLineAfter: 10000,
    } as editor.IStandaloneEditorConstructionOptions;
  }, [settings]);

  /**
   * エディタの初期化時に呼ばれるマウントハンドラ
   */
  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco as Monaco;

    if (isSecondary) {
      setSecondaryEditorInstance(editor);
    } else {
      setEditorInstance(editor);
    }

    const customTheme = getThemeById(settings.theme);
    const isDark = customTheme ? customTheme.type === 'dark' : resolvedTheme === 'dark';
    applyEditorTheme(monaco as Monaco, editor, settings.theme, isDark);

    editor.onDidChangeCursorPosition(() => {
      const position = editor.getPosition();
      if (position) {
        updateStatusInfo({
          cursorLine: position.lineNumber,
          cursorColumn: position.column,
        });
      }
    });

    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (model) {
        updateStatusInfo({
          lineCount: model.getLineCount(),
          charCount: model.getValueLength(),
        });
      }
      updateFullWidthSpaceDecorations();
    });

    const model = editor.getModel();
    const position = editor.getPosition();
    if (model && position) {
      const eol = model.getEOL();
      updateStatusInfo({
        cursorLine: position.lineNumber,
        cursorColumn: position.column,
        lineCount: model.getLineCount(),
        charCount: model.getValueLength(),
        language: model.getLanguageId(),
        eol: getEolLabel(eol),
      });
    }

    if (monaco.KeyMod && monaco.KeyCode) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
        setSearchOpen(true);
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel()?.getValueInRange(selection);
          if (selectedText) {
            setSearchTerm(selectedText);
          }
        }
      });
    }

    updateFullWidthSpaceDecorations();
  }, [resolvedTheme, settings.theme, updateStatusInfo, setEditorInstance, setSecondaryEditorInstance, isSecondary, setSearchOpen, setSearchTerm, updateFullWidthSpaceDecorations, applyEditorTheme]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const customTheme = getThemeById(settings.theme);
    const isDark = customTheme ? customTheme.type === 'dark' : resolvedTheme === 'dark';

    applyEditorTheme(monacoRef.current, editorRef.current, settings.theme, isDark);
  }, [settings.theme, resolvedTheme, applyEditorTheme]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        lineHeight: settings.lineHeight,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap ? 'on' : 'off',
        lineNumbers: settings.showLineNumbers ? 'on' : 'off',
        renderWhitespace: settings.showWhitespace,
      });
      updateFullWidthSpaceDecorations();
    }
  }, [settings.fontSize, settings.fontFamily, settings.lineHeight, settings.tabSize, settings.wordWrap, settings.showLineNumbers, settings.showWhitespace, settings.showFullWidthSpace, updateFullWidthSpaceDecorations]);

  useEffect(() => {
    if (editorRef.current && activeFile && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model && monacoRef.current.editor) {
        monacoRef.current.editor.setModelLanguage(
          model,
          getLanguageFromFilename(activeFile.name)
        );
      }
    }
  }, [activeFile]);

  const monacoThemeName = useMemo(() => {
    const customTheme = getThemeById(settings.theme);
    if (customTheme) return `custom-${customTheme.id}`;
    const isDark = mounted ? resolvedTheme === 'dark' : false;
    return `custom-default-${isDark ? 'dark' : 'light'}`;
  }, [settings.theme, resolvedTheme, mounted]);

  if (!mounted) {
    return (
      <div className="relative h-full w-full overflow-hidden flex items-center justify-center bg-background">
        <div className="text-center p-4 text-muted-foreground">{t('editor.loading')}</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage={languageMode}
        language={languageMode}
        value={activeFile?.content || ''}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        theme={monacoThemeName}
        options={editorOptions}
        loading={<div className="text-center p-4">{t('editor.loading')}</div>}
      />
    </div>
  );
} 
