/**
 * Monaco Editorをラップしたコンポーネント
 * サクラエディタスタイルのエディタを提供し、様々な機能を統合する
 */
'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Editor } from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import type { editor } from 'monaco-editor';

/**
 * Monaco Editorインスタンスをグローバルに保存するためのWindow拡張型
 */
interface WindowWithMonaco extends Window {
  __MONACO_EDITOR_INSTANCE__?: editor.IStandaloneCodeEditor;
}

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
  const { getActiveFile, updateFile } = useFileStore();
  const { settings } = useEditorStore();
  const { theme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const activeFile = getActiveFile();

  /**
   * エディタ内のカーソル位置を表示するためのステータスバー更新
   */
  const updateEditorStatus = useCallback(() => {
    if (!editorRef.current) return;
    
    const position = editorRef.current.getPosition();
    if (!position) return;
    
    const lineCount = editorRef.current.getModel()?.getLineCount() || 0;
    const currentLine = position.lineNumber;
    const currentColumn = position.column;
    
    // ステータスバーの更新は別途実装される想定
    console.log(`行: ${currentLine}/${lineCount} 列: ${currentColumn}`);
  }, []);

  /**
   * エディタが変更されたときのハンドラ
   */
  const handleChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFile(activeFile.id, value);
    }
  }, [activeFile, updateFile]);

  /**
   * 言語モードを設定
   */
  const languageMode = useMemo(() => {
    return getLanguageFromFilename(activeFile?.name || null);
  }, [activeFile]);

  /**
   * モナコエディタのオプション設定
   */
  const editorOptions = useMemo(() => {
    return {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      lineHeight: settings.lineHeight,
      tabSize: settings.tabSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      minimap: {
        enabled: true, // 設定値が無ければデフォルトでは表示する
        scale: 1,
        showSlider: 'mouseover',
      },
      lineNumbers: settings.showLineNumbers ? 'on' : 'off',
      renderLineHighlight: 'all',
      roundedSelection: true,
      selectOnLineNumbers: true,
      quickSuggestions: true,
      scrollBeyondLastLine: false,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      automaticLayout: true,
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
        alwaysConsumeMouseWheel: false,
      },
      renderWhitespace: 'none',
      rulers: [], // 設定値が無ければデフォルトでは非表示
      bracketPairColorization: {
        enabled: true,
      },
    } as editor.IStandaloneEditorConstructionOptions;
  }, [settings]);

  /**
   * エディタの初期化時に呼ばれるマウントハンドラ
   */
  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco as Monaco;
    
    // グローバル変数にエディターインスタンスを保存（ダイアログとの連携用）
    const win = window as WindowWithMonaco;
    win.__MONACO_EDITOR_INSTANCE__ = editor;

    // エディタのスタイルを設定
    const editorDom = editor.getDomNode();
    if (editorDom) {
      // エディタの親要素にスタイルクラスを追加
      editorDom.classList.add(theme === 'dark' ? 'dark-editor' : 'light-editor');
    }

    // カーソル位置変更時のイベントハンドラを設定
    editor.onDidChangeCursorPosition(() => {
      updateEditorStatus();
    });

    // 初期ステータスを更新
    updateEditorStatus();

    // キーボードショートカットの設定（Ctrl+F で検索ダイアログを開く）
    if (monaco.KeyMod && monaco.KeyCode) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
        // 検索ダイアログを開く
        try {
          const searchStore = require('@/lib/store/search-store').useSearchStore.getState();
          searchStore.setIsOpen(true);
          
          // 選択テキストがあれば検索語として設定
          const selection = editor.getSelection();
          if (selection && !selection.isEmpty()) {
            const selectedText = editor.getModel()?.getValueInRange(selection);
            if (selectedText) {
              searchStore.setSearchTerm(selectedText);
            }
          }
        } catch (error) {
          console.error('検索ダイアログの起動に失敗しました:', error);
        }
      });
    }
  }, [theme, updateEditorStatus]);

  /**
   * テーマ変更時の処理
   */
  useEffect(() => {
    if (editorRef.current) {
      const isDark = theme === 'dark';
      editorRef.current.updateOptions({
        theme: isDark ? 'vs-dark' : 'vs-light'
      });
      
      // エディタのDOM要素のクラスを更新
      const editorDom = editorRef.current.getDomNode();
      if (editorDom) {
        editorDom.classList.remove('dark-editor', 'light-editor');
        editorDom.classList.add(isDark ? 'dark-editor' : 'light-editor');
      }
    }
  }, [theme]);

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
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        options={editorOptions}
        loading={<div className="text-center p-4">エディタを読み込み中...</div>}
      />
    </div>
  );
} 