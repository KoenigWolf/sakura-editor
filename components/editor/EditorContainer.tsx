'use client';

import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { MonacoEditor } from '@/components/editor/MonacoEditor';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore } from '@/lib/store/split-view-store';
import { useTheme } from 'next-themes';
import { FileTabs } from '@/components/editor/FileTabs';
import { useTranslation } from 'react-i18next';

export const EditorContainer = memo(function EditorContainer() {
  const activeFile = useFileStore((state) => state.files.find(f => f.id === state.activeFileId));
  const files = useFileStore((state) => state.files);
  const statusInfo = useEditorInstanceStore((state) => state.statusInfo);
  const { splitDirection, splitRatio, setSplitRatio, secondaryFileId, setSecondaryFileId } = useSplitViewStore();
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 分割時に別のファイルを自動選択
  useEffect(() => {
    if (splitDirection && !secondaryFileId && files.length > 1) {
      const otherFile = files.find(f => f.id !== activeFile?.id);
      if (otherFile) {
        setSecondaryFileId(otherFile.id);
      }
    }
  }, [splitDirection, secondaryFileId, files, activeFile?.id, setSecondaryFileId]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let ratio: number;

    if (splitDirection === 'vertical') {
      ratio = (e.clientX - rect.left) / rect.width;
    } else {
      ratio = (e.clientY - rect.top) / rect.height;
    }

    setSplitRatio(ratio);
  }, [isDragging, splitDirection, setSplitRatio]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const secondaryFile = files.find(f => f.id === secondaryFileId);

  return (
    <div className="sakura-editor-container flex flex-col h-full">
      {/* ツールバー */}
      <EditorToolbar />

      {/* ファイルタブ */}
      <FileTabs />

      {/* メインエリア */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden relative min-h-0 flex ${
          splitDirection === 'vertical' ? 'flex-row' : 'flex-col'
        }`}
      >
        {/* プライマリエディタ */}
        <div
          className="overflow-hidden"
          style={{
            [splitDirection === 'vertical' ? 'width' : 'height']: splitDirection
              ? `${splitRatio * 100}%`
              : '100%',
            flexShrink: 0,
          }}
        >
          <MonacoEditor />
        </div>

        {/* スプリッター */}
        {splitDirection && (
          <div
            className={`
              ${splitDirection === 'vertical' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'}
              bg-border hover:bg-primary/50 transition-colors flex-shrink-0
              ${isDragging ? 'bg-primary' : ''}
            `}
            onMouseDown={handleMouseDown}
          />
        )}

        {/* セカンダリエディタ */}
        {splitDirection && (
          <div className="flex-1 overflow-hidden min-w-0 min-h-0">
            <MonacoEditor
              fileId={secondaryFileId}
              isSecondary
            />
          </div>
        )}
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
