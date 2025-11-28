'use client';

import { memo } from 'react';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useTheme } from 'next-themes';
import { FileTabs } from '@/components/editor/FileTabs';
import { useTranslation } from 'react-i18next';

export const EditorContainer = memo(function EditorContainer() {
  const activeFile = useFileStore((state) => state.files.find(f => f.id === state.activeFileId));
  const statusInfo = useEditorInstanceStore((state) => state.statusInfo);
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();

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
          {activeFile?.name || t('status.untitled')}
        </div>
        <div className="sakura-editor-statusbar-item">
          {t('status.position', { line: statusInfo.cursorLine, col: statusInfo.cursorColumn })}
        </div>
        <div className="sakura-editor-statusbar-item">
          {t('status.document', { lines: statusInfo.lineCount, chars: statusInfo.charCount })}
        </div>
        <div className="sakura-editor-statusbar-item">
          UTF-8
        </div>
        <div className="sakura-editor-statusbar-item">
          {statusInfo.eol}
        </div>
        <div className="sakura-editor-statusbar-item">
          {statusInfo.language}
        </div>
        <div className="sakura-editor-statusbar-item ml-auto" suppressHydrationWarning>
          {resolvedTheme === 'dark' ? t('status.dark') : t('status.light')}
        </div>
      </div>
    </div>
  );
});
