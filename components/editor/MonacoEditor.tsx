/**
 * Monaco Editorをラップしたコンポーネント
 * 高機能エディタを提供し、様々な機能を統合する
 */
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSearchStore } from '@/lib/store/search-store';
import type { editor } from 'monaco-editor';
import { getLanguageFromFilename, getEolLabel } from '@/lib/editor/constants';
import { useEditorOptions } from '@/hooks/use-editor-options';
import { useMonacoTheme } from '@/hooks/use-monaco-theme';
import { useFullWidthSpace } from '@/hooks/use-fullwidth-space';

type Monaco = typeof import('monaco-editor');

interface MonacoEditorProps {
  fileId?: string | null;
  isSecondary?: boolean;
}

export function MonacoEditor({ fileId, isSecondary = false }: MonacoEditorProps) {
  const { t } = useTranslation();
  // 単一セレクタで必要なファイルのみを取得（不要な再レンダーを防止）
  const activeFile = useFileStore(
    useCallback(
      (state) => {
        const targetId = fileId || state.activeFileId;
        return state.files.find((f) => f.id === targetId);
      },
      [fileId]
    )
  );

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const currentFileIdRef = useRef<string | null>(null);
  const disposablesRef = useRef<{ dispose: () => void }[]>([]);

  const { editorOptions, settings } = useEditorOptions();
  const {
    mounted,
    resolvedTheme,
    monacoThemeName,
    isDarkTheme,
    handleBeforeMount,
    applyEditorTheme,
  } = useMonacoTheme();
  const { updateDecorations, cleanup: cleanupFullWidthSpace } = useFullWidthSpace({
    editorRef,
    monacoRef,
  });

  if (activeFile) {
    currentFileIdRef.current = activeFile.id;
  } else {
    currentFileIdRef.current = null;
  }

  const languageMode = getLanguageFromFilename(activeFile?.name || null);

  // クリーンアップ: コンポーネントアンマウント時にリソースを解放
  useEffect(() => {
    return () => {
      disposablesRef.current.forEach((d) => d.dispose());
      disposablesRef.current = [];
      cleanupFullWidthSpace();

      // getState() でアクション関数を取得（サブスクリプション不要）
      const { setEditorInstance, setSecondaryEditorInstance } = useEditorInstanceStore.getState();
      if (isSecondary) {
        setSecondaryEditorInstance(null);
      } else {
        setEditorInstance(null);
      }

      editorRef.current = null;
      monacoRef.current = null;
    };
  }, [isSecondary, cleanupFullWidthSpace]);

  const handleChange = useCallback((value: string | undefined) => {
    const id = currentFileIdRef.current;
    if (id && value !== undefined) {
      useFileStore.getState().updateFile(id, value);
    }
  }, []);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco as Monaco;

      // getState() でアクション関数を取得（依存配列を削減）
      const { setEditorInstance, setSecondaryEditorInstance, updateStatusInfo } =
        useEditorInstanceStore.getState();

      if (isSecondary) {
        setSecondaryEditorInstance(editor);
      } else {
        setEditorInstance(editor);
      }

      applyEditorTheme(monaco as Monaco, editor, settings.theme, isDarkTheme);

      const cursorDisposable = editor.onDidChangeCursorPosition(() => {
        const position = editor.getPosition();
        if (position) {
          useEditorInstanceStore.getState().updateStatusInfo({
            cursorLine: position.lineNumber,
            cursorColumn: position.column,
          });
        }
      });

      const contentDisposable = editor.onDidChangeModelContent(() => {
        const model = editor.getModel();
        if (model) {
          useEditorInstanceStore.getState().updateStatusInfo({
            lineCount: model.getLineCount(),
            charCount: model.getValueLength(),
          });
        }
        updateDecorations();
      });

      disposablesRef.current = [cursorDisposable, contentDisposable];

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
          const { setIsOpen, setSearchTerm } = useSearchStore.getState();
          setIsOpen(true);
          const selection = editor.getSelection();
          if (selection && !selection.isEmpty()) {
            const selectedText = editor.getModel()?.getValueInRange(selection);
            if (selectedText) {
              setSearchTerm(selectedText);
            }
          }
        });
      }

      updateDecorations();
    },
    [settings.theme, isDarkTheme, isSecondary, updateDecorations, applyEditorTheme]
  );

  // テーマ変更時の適用
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    applyEditorTheme(monacoRef.current, editorRef.current, settings.theme, isDarkTheme);
  }, [settings.theme, resolvedTheme, applyEditorTheme, isDarkTheme]);

  // 設定変更時のオプション更新
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
      updateDecorations();
    }
  }, [
    settings.fontSize,
    settings.fontFamily,
    settings.lineHeight,
    settings.tabSize,
    settings.wordWrap,
    settings.showLineNumbers,
    settings.showWhitespace,
    settings.showFullWidthSpace,
    updateDecorations,
  ]);

  // 言語モード変更
  useEffect(() => {
    if (editorRef.current && activeFile && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model && monacoRef.current.editor) {
        monacoRef.current.editor.setModelLanguage(model, getLanguageFromFilename(activeFile.name));
      }
    }
  }, [activeFile]);

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
