/**
 * Monaco Editorをラップしたコンポーネント
 * サクラエディタスタイルのエディタを提供し、様々な機能を統合する
 */
'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
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
 * MonacoEditor Props
 */
interface MonacoEditorProps {
  /** 特定のファイルIDを指定（セカンダリエディタ用） */
  fileId?: string | null;
  /** セカンダリエディタかどうか */
  isSecondary?: boolean;
}

/**
 * Monaco Editorコンポーネント
 * エディタの初期化と状態管理を担当
 */
export function MonacoEditor({ fileId, isSecondary = false }: MonacoEditorProps) {
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
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const currentFileIdRef = useRef<string | null>(null);
  const currentThemeRef = useRef<string | null>(null);
  const fullWidthSpaceDecorationsRef = useRef<string[]>([]);

  const targetFileId = fileId ?? activeFileId;
  const activeFile = files.find(f => f.id === targetFileId);
  currentFileIdRef.current = activeFile?.id ?? null;

  /**
   * エディタのステータス情報を更新
   */
  const syncStatusInfo = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;

    const position = ed.getPosition();
    const model = ed.getModel();

    if (position) {
      updateStatusInfo({
        cursorLine: position.lineNumber,
        cursorColumn: position.column,
      });
    }

    if (model) {
      const eol = model.getEOL();
      updateStatusInfo({
        lineCount: model.getLineCount(),
        charCount: model.getValueLength(),
        language: model.getLanguageId(),
        eol: eol === '\n' ? 'LF' : eol === '\r\n' ? 'CRLF' : 'CR',
      });
    }
  }, [updateStatusInfo]);

  /**
   * エディタが変更されたときのハンドラ（refベースで再生成を防ぐ）
   */
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
    if (!ed || !monaco) return;

    const model = ed.getModel();
    if (!model) return;

    if (settings.showWhitespace === 'none') {
      fullWidthSpaceDecorationsRef.current = ed.deltaDecorations(
        fullWidthSpaceDecorationsRef.current,
        []
      );
      return;
    }

    const content = model.getValue();
    const decorations: editor.IModelDeltaDecoration[] = [];
    const fullWidthSpaceRegex = /\u3000/g;
    let match;

    while ((match = fullWidthSpaceRegex.exec(content)) !== null) {
      const startPos = model.getPositionAt(match.index);
      const endPos = model.getPositionAt(match.index + 1);

      decorations.push({
        range: new monaco.Range(
          startPos.lineNumber,
          startPos.column,
          endPos.lineNumber,
          endPos.column
        ),
        options: {
          inlineClassName: 'full-width-space-highlight',
          hoverMessage: { value: '全角スペース (U+3000)' },
        },
      });
    }

    fullWidthSpaceDecorationsRef.current = ed.deltaDecorations(
      fullWidthSpaceDecorationsRef.current,
      decorations
    );
  }, [settings.showWhitespace]);

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
   * エディタオプション（パフォーマンス最適化済み）
   */
  const editorOptions = useMemo(() => {
    return {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      lineHeight: settings.lineHeight,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      lineNumbers: settings.showLineNumbers ? 'on' : 'off',
      renderWhitespace: settings.showWhitespace,
      selectOnLineNumbers: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        alwaysConsumeMouseWheel: false,
        useShadows: false,
      },
      rulers: [],
      minimap: { enabled: false },
      renderLineHighlight: 'line',
      roundedSelection: false,
      quickSuggestions: false,
      cursorBlinking: 'solid',
      cursorSmoothCaretAnimation: 'off',
      smoothScrolling: false,
      bracketPairColorization: { enabled: false },
      folding: false,
      links: false,
      renderControlCharacters: false,
      renderValidationDecorations: 'off',
      occurrencesHighlight: 'off',
      selectionHighlight: false,
      matchBrackets: 'never',
      codeLens: false,
      lightbulb: { enabled: 'off' },
      hover: { enabled: false },
      parameterHints: { enabled: false },
      suggestOnTriggerCharacters: false,
      acceptSuggestionOnEnter: 'off',
      wordBasedSuggestions: 'off',
      formatOnType: false,
      formatOnPaste: false,
      autoClosingBrackets: 'never',
      autoClosingQuotes: 'never',
      autoSurround: 'never',
      autoIndent: 'none',
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
        eol: eol === '\n' ? 'LF' : eol === '\r\n' ? 'CRLF' : 'CR',
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
  }, [settings.fontSize, settings.fontFamily, settings.lineHeight, settings.tabSize, settings.wordWrap, settings.showLineNumbers, settings.showWhitespace, updateFullWidthSpaceDecorations]);

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
    return `custom-default-${resolvedTheme === 'dark' ? 'dark' : 'light'}`;
  }, [settings.theme, resolvedTheme]);

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
