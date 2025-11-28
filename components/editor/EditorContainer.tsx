'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useTheme } from 'next-themes';
import { FileTabs } from '@/components/editor/FileTabs';

export function EditorContainer() {
  const { getActiveFile } = useFileStore();
  const { getEditorInstance } = useEditorInstanceStore();
  const { resolvedTheme } = useTheme();
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [documentInfo, setDocumentInfo] = useState({ lines: 0, chars: 0 });
  const [encoding, setEncoding] = useState('UTF-8');
  const [eolMode, setEolMode] = useState('LF');
  const [language, setLanguage] = useState('plaintext');
  const activeFile = getActiveFile();
  const themeLabel = resolvedTheme === 'dark' ? 'ダークモード' : 'ライトモード';

  const lastUpdateRef = useRef({
    cursorLine: 1,
    cursorColumn: 1,
    lines: 0,
    chars: 0,
    lang: 'plaintext',
    eol: 'LF'
  });

  const updateStatusInfo = useCallback(() => {
    const editorInstance = getEditorInstance();
    if (!editorInstance) return;
    
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
  }, [getEditorInstance]);
  
  useEffect(() => {
    updateStatusInfo();
    
    const interval = setInterval(() => {
      updateStatusInfo();
    }, 250);
    
    return () => clearInterval(interval);
  }, [updateStatusInfo]);
  
  useEffect(() => {
    if (activeFile) {
      setTimeout(updateStatusInfo, 50);
    }
  }, [activeFile, updateStatusInfo]);

  return (
    <div className="sakura-editor-container flex flex-col h-full">
      {/* ツールバー */}
      <EditorToolbar />

      {/* ファイルタブ */}
      <FileTabs />
      
      {/* メインエリア */}
      <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <MonacoEditor />
        </div>
      </div>
      
      {/* ステータスバー */}
      <div className="sakura-editor-statusbar text-xs flex-shrink-0">
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
        <div className="sakura-editor-statusbar-item ml-auto" suppressHydrationWarning>
          {themeLabel}
        </div>
      </div>
    </div>
  );
}
