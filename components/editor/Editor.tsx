'use client';

import { useCallback, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditorStore } from '@/lib/store';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorScroll } from '@/hooks/use-editor-scroll';
import { cn } from '@/lib/utils';
import { Highlight, themes, type Language, type Token } from 'prism-react-renderer';
import { useTheme } from 'next-themes';

interface EditorProps {
  className?: string;
}

/**
 * エディタコンポーネント
 * テキスト編集、シンタックスハイライト、行番号表示、スクロール管理を行う
 */
export function Editor({ className }: EditorProps) {
  const { settings } = useEditorStore();
  const { getActiveFile, updateFile } = useFileStore();
  const { theme } = useTheme();
  const activeFile = getActiveFile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { saveScrollPosition, restoreScrollPosition, handleAutoScroll, handleScroll } = useEditorScroll({ textareaRef });

  // テキスト変更時の処理
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (activeFile) {
        updateFile(activeFile.id, e.target.value);
      }
    },
    [activeFile, updateFile]
  );

  // Undo/Redoショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        saveScrollPosition();
        useEditorStore.getState().undo();
        setTimeout(restoreScrollPosition, 0);
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        saveScrollPosition();
        useEditorStore.getState().redo();
        setTimeout(restoreScrollPosition, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveScrollPosition, restoreScrollPosition]);

  // ファイルが選択されていない場合の表示
  if (!activeFile) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        ファイルを選択してください
      </div>
    );
  }

  const content = activeFile.content;
  const lines = content.split('\n');
  const language: Language = 'typescript';
  const lineHeightEm = settings.lineHeight;
  const lineHeightPx = `${lineHeightEm * settings.fontSize}px`;

  return (
    <ScrollArea
      className={cn('relative w-full h-full rounded-md border', className)}
      aria-label="エディター"
    >
      <div className="relative">
        {/* 行番号エリア */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 text-muted-foreground font-mono text-right pr-2"
          style={{ fontSize: settings.fontSize, lineHeight: lineHeightEm }}
        >
          {lines.map((_, i) => (
            <div
              key={`line-${i}`}
              style={{
                height: lineHeightPx,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
        {/* シンタックスハイライトエリア */}
        <div className="relative ml-12">
          <Highlight
            theme={theme === 'dark' ? themes.vsDark : themes.vsLight}
            code={content}
            language={language}
          >
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre
                style={{
                  fontSize: settings.fontSize,
                  lineHeight: lineHeightEm,
                  fontFamily: settings.fontFamily,
                  margin: 0,
                  padding: '1rem',
                }}
              >
                {tokens.map((line: Token[], i: number) => (
                  <div key={`syntax-${i}`} {...getLineProps({ line })} style={{ height: lineHeightPx }}>
                    {line.map((token: Token, j: number) => (
                      <span key={`token-${i}-${j}`} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
          {/* 透明テキストエリア（入力用） */}
          <TextareaAutosize
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onInput={handleAutoScroll}
            onScroll={handleScroll}
            aria-multiline="true"
            role="textbox"
            aria-label="テキストエディター"
            className={cn(
              'absolute inset-0 w-full min-h-[500px] p-4 font-mono resize-none focus:outline-none',
              'bg-transparent text-transparent caret-foreground selection:bg-primary/20',
              'overflow-x-auto whitespace-pre scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent'
            )}
            style={{
              fontSize: settings.fontSize,
              lineHeight: lineHeightEm,
              fontFamily: settings.fontFamily,
              tabSize: settings.tabSize,
            }}
          />
        </div>
      </div>
    </ScrollArea>
  );
}
