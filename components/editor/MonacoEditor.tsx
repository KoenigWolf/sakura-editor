/**
 * Monaco Editorをラップしたコンポーネント
 * サクラエディタスタイルのエディタを提供し、様々な機能を統合する
 */
'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorStore } from '@/lib/store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSearchStore } from '@/lib/store/search-store';
import { useTheme } from 'next-themes';
import type { editor } from 'monaco-editor';

// 以下の型は、monacoの型参照のために必要
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
 * Monaco Editorコンポーネント
 * エディタの初期化と状態管理を担当
 */
export function MonacoEditor() {
  const { t } = useTranslation();
  const activeFile = useFileStore((state) => state.files.find(f => f.id === state.activeFileId));
  const updateFile = useFileStore((state) => state.updateFile);
  const settings = useEditorStore((state) => state.settings);
  const setEditorInstance = useEditorInstanceStore((state) => state.setEditorInstance);
  const updateStatusInfo = useEditorInstanceStore((state) => state.updateStatusInfo);
  const setSearchOpen = useSearchStore((state) => state.setIsOpen);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const activeFileIdRef = useRef<string | null>(null);

  // activeFileのIDをrefで保持（handleChangeで最新を参照するため）
  activeFileIdRef.current = activeFile?.id ?? null;

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
    const id = activeFileIdRef.current;
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
   * モナコエディタのオプション設定（高速化のための最適化済み）
   */
  const editorOptions = useMemo(() => {
    return {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      lineHeight: settings.lineHeight,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      minimap: { enabled: false }, // 高速化: ミニマップ無効
      lineNumbers: settings.showLineNumbers ? 'on' : 'off',
      renderLineHighlight: 'line', // 高速化: 行全体ではなく行番号のみ
      roundedSelection: false, // 高速化: 角丸無効
      selectOnLineNumbers: true,
      quickSuggestions: false, // 高速化: 自動サジェスト無効
      scrollBeyondLastLine: false,
      cursorBlinking: 'solid', // 高速化: アニメーション無効
      cursorSmoothCaretAnimation: 'off', // 高速化: カーソルアニメーション無効
      smoothScrolling: false, // 高速化: スムーススクロール無効
      automaticLayout: true,
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        alwaysConsumeMouseWheel: false,
        useShadows: false, // 高速化: 影無効
      },
      renderWhitespace: 'none', // 高速化: 空白表示無効
      rulers: [],
      bracketPairColorization: { enabled: false }, // 高速化: ブラケット色分け無効
      folding: false, // 高速化: 折りたたみ無効
      links: false, // 高速化: リンク検出無効
      renderControlCharacters: false, // 高速化: 制御文字表示無効
      renderValidationDecorations: 'off', // 高速化: バリデーション装飾無効
      occurrencesHighlight: 'off', // 高速化: 出現箇所ハイライト無効
      selectionHighlight: false, // 高速化: 選択ハイライト無効
      matchBrackets: 'never', // 高速化: ブラケットマッチ無効
      codeLens: false, // 高速化: CodeLens無効
      lightbulb: { enabled: 'off' }, // 高速化: 提案アイコン無効
      hover: { enabled: false }, // 高速化: ホバー無効
      parameterHints: { enabled: false }, // 高速化: パラメータヒント無効
      suggestOnTriggerCharacters: false, // 高速化: トリガー文字でのサジェスト無効
      acceptSuggestionOnEnter: 'off', // 高速化: Enterでのサジェスト確定無効
      wordBasedSuggestions: 'off', // 高速化: 単語ベースサジェスト無効
      formatOnType: false, // 高速化: 入力時フォーマット無効
      formatOnPaste: false, // 高速化: ペースト時フォーマット無効
      autoClosingBrackets: 'never', // 高速化: 自動括弧閉じ無効
      autoClosingQuotes: 'never', // 高速化: 自動引用符閉じ無効
      autoSurround: 'never', // 高速化: 自動囲み無効
      autoIndent: 'none', // 高速化: 自動インデント無効
    } as editor.IStandaloneEditorConstructionOptions;
  }, [settings]);

  /**
   * エディタの初期化時に呼ばれるマウントハンドラ
   */
  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco as Monaco;

    // ストアにエディターインスタンスを保存
    setEditorInstance(editor);

    // エディタのスタイルを設定
    const editorDom = editor.getDomNode();
    if (editorDom) {
      const themeClass = resolvedTheme === 'dark' ? 'dark-editor' : 'light-editor';
      editorDom.classList.add(themeClass);
    }

    // イベントリスナーでステータス情報を更新（ポーリング不要）
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
    });

    // 初期ステータス情報を設定
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

    // キーボードショートカットの設定（Ctrl+F で検索ダイアログを開く）
    if (monaco.KeyMod && monaco.KeyCode) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
        setSearchOpen(true);

        // 選択テキストがあれば検索語として設定
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel()?.getValueInRange(selection);
          if (selectedText) {
            setSearchTerm(selectedText);
          }
        }
      });
    }
  }, [resolvedTheme, updateStatusInfo, setEditorInstance, setSearchOpen, setSearchTerm]);

  /**
   * テーマ変更時の処理
   */
  useEffect(() => {
    if (editorRef.current) {
      const isDark = resolvedTheme === 'dark';
      editorRef.current.updateOptions({
        theme: isDark ? 'vs-dark' : 'vs-light'
      });

      const editorDom = editorRef.current.getDomNode();
      if (editorDom) {
        editorDom.classList.remove('dark-editor', 'light-editor');
        editorDom.classList.add(isDark ? 'dark-editor' : 'light-editor');
      }
    }
  }, [resolvedTheme]);

  /**
   * 設定変更時にエディタオプションを更新
   */
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        lineHeight: settings.lineHeight,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap ? 'on' : 'off',
        lineNumbers: settings.showLineNumbers ? 'on' : 'off',
      });
    }
  }, [settings.fontSize, settings.fontFamily, settings.lineHeight, settings.tabSize, settings.wordWrap, settings.showLineNumbers]);

  /**
   * アクティブファイル変更時の処理
   */
  useEffect(() => {
    if (editorRef.current && activeFile && monacoRef.current) {
      // ファイルが変わったら言語モードを更新
      const model = editorRef.current.getModel();
      if (model && monacoRef.current.editor) {
        monacoRef.current.editor.setModelLanguage(
          model,
          getLanguageFromFilename(activeFile.name)
        );
      }
    }
  }, [activeFile]);

  return (
    <div className="relative h-full w-full">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage={languageMode}
        language={languageMode}
        value={activeFile?.content || ''}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light'}
        options={editorOptions}
        loading={<div className="text-center p-4">{t('editor.loading')}</div>}
      />
    </div>
  );
} 
