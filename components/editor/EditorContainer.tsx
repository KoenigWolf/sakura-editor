/**
 * エディタコンテナコンポーネント
 * サクラエディタのUIを模したレイアウトでエディタを提供する
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { SearchDialog } from '@/components/editor/SearchDialog';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { useFileStore } from '@/lib/store/file-store';
import { useTheme } from 'next-themes';
import type { editor } from 'monaco-editor';

/**
 * Monaco Editorインスタンスへの型定義
 */
interface WindowWithMonaco extends Window {
  __MONACO_EDITOR_INSTANCE__?: editor.IStandaloneCodeEditor;
}

/**
 * Monaco Editorインスタンスをグローバルに取得する
 */
const getMonacoEditorInstance = (): editor.IStandaloneCodeEditor | undefined => {
  return (window as WindowWithMonaco).__MONACO_EDITOR_INSTANCE__;
};

/**
 * エディタコンテナコンポーネント
 * ツールバー、エディタ本体、ステータスバーを含む
 */
export function EditorContainer() {
  const { getActiveFile } = useFileStore();
  const { theme } = useTheme();
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [documentInfo, setDocumentInfo] = useState({ lines: 0, chars: 0 });
  const [encoding, setEncoding] = useState('UTF-8');
  const [eolMode, setEolMode] = useState('LF');
  const [language, setLanguage] = useState('plaintext');
  const activeFile = getActiveFile();
  
  // 前回の更新情報を記憶するためのref
  const lastUpdateRef = useRef({
    cursorLine: 1,
    cursorColumn: 1,
    lines: 0,
    chars: 0,
    lang: 'plaintext',
    eol: 'LF'
  });

  /**
   * ステータスバー情報を更新
   * 変更があった場合のみstate更新して再レンダリングを最小限に抑える
   */
  const updateStatusInfo = useCallback(() => {
    const editorInstance = getMonacoEditorInstance();
    if (!editorInstance) return;
    
    // カーソル位置
    const position = editorInstance.getPosition();
    if (position) {
      const line = position.lineNumber;
      const column = position.column;
      
      // 前回と異なる場合のみ更新
      if (line !== lastUpdateRef.current.cursorLine || 
          column !== lastUpdateRef.current.cursorColumn) {
        setCursorPosition({ line, column });
        lastUpdateRef.current.cursorLine = line;
        lastUpdateRef.current.cursorColumn = column;
      }
    }
    
    // ドキュメント情報
    const model = editorInstance.getModel();
    if (model) {
      const lineCount = model.getLineCount();
      const charCount = model.getValueLength();
      
      // 前回と異なる場合のみ更新
      if (lineCount !== lastUpdateRef.current.lines || 
          charCount !== lastUpdateRef.current.chars) {
        setDocumentInfo({ lines: lineCount, chars: charCount });
        lastUpdateRef.current.lines = lineCount;
        lastUpdateRef.current.chars = charCount;
      }
      
      // 言語モード
      const langId = model.getLanguageId();
      if (langId !== lastUpdateRef.current.lang) {
        setLanguage(langId);
        lastUpdateRef.current.lang = langId;
      }
      
      // 改行コード
      const eol = model.getEOL();
      const eolType = eol === '\n' ? 'LF' : (eol === '\r\n' ? 'CRLF' : 'CR');
      if (eolType !== lastUpdateRef.current.eol) {
        setEolMode(eolType);
        lastUpdateRef.current.eol = eolType;
      }
    }
  }, []);
  
  /**
   * エディタの変更を監視（性能に配慮して更新頻度を制限）
   */
  useEffect(() => {
    // 最初の更新
    updateStatusInfo();
    
    // 定期的な更新（250msごと）
    const interval = setInterval(() => {
      updateStatusInfo();
    }, 250);
    
    return () => clearInterval(interval);
  }, [updateStatusInfo]);
  
  /**
   * アクティブファイルが変更された時に情報を更新
   */
  useEffect(() => {
    if (activeFile) {
      // ファイルが変わったらステータス情報を即時更新
      setTimeout(updateStatusInfo, 50);
    }
  }, [activeFile, updateStatusInfo]);

  return (
    <div className="sakura-editor-container">
      {/* ツールバー */}
      <EditorToolbar />
      
      {/* エディタ本体 */}
      <div className="flex-1 overflow-hidden relative">
        <MonacoEditor />
      </div>
      
      {/* ステータスバー */}
      <div className="sakura-editor-statusbar text-xs">
        <div className="sakura-editor-statusbar-item">
          {activeFile?.name || 'untitled.txt'}
        </div>
        <div className="sakura-editor-statusbar-item">
          {`${cursorPosition.line}行, ${cursorPosition.column}列`}
        </div>
        <div className="sakura-editor-statusbar-item">
          {`${documentInfo.lines}行 / ${documentInfo.chars}文字`}
        </div>
        <div className="sakura-editor-statusbar-item">
          {encoding}
        </div>
        <div className="sakura-editor-statusbar-item">
          {eolMode}
        </div>
        <div className="sakura-editor-statusbar-item">
          {language}
        </div>
        <div className="sakura-editor-statusbar-item ml-auto">
          {theme === 'dark' ? 'ダークモード' : 'ライトモード'}
        </div>
      </div>
    </div>
  );
} 