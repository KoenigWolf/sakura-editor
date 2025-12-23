'use client';

import { memo, useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFileStore } from '@/lib/store/file-store';
import { useSplitViewStore, type PaneNode, type PaneSplit } from '@/lib/store/split-view-store';
import { useSplitWithFile } from '@/hooks/use-split-with-file';
import { useTranslation } from 'react-i18next';
import { Columns2, Rows2, X } from 'lucide-react';

const MonacoEditor = dynamic(
  () => import('@/components/editor/MonacoEditor').then((mod) => ({ default: mod.MonacoEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="mochi-skeleton w-full h-full" />
      </div>
    ),
  }
);

interface SplitPaneProps {
  node: PaneNode;
  onRatioChange: (splitId: string, ratio: number) => void;
}

export const SplitPane = memo(function SplitPane({ node, onRatioChange }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSplitId, setDragSplitId] = useState<string | null>(null);
  const { setActivePane, activePaneId, closePane, setPaneFile, root } = useSplitViewStore();
  const { splitPaneWithNewFile } = useSplitWithFile();
  const files = useFileStore((state) => state.files);
  const hasMultiplePanes = root.type === 'split';
  const { t } = useTranslation();

  const handleMouseDown = useCallback((e: React.MouseEvent, splitId: string) => {
    e.preventDefault();
    setIsDragging(true);
    setDragSplitId(splitId);
  }, []);

  useEffect(() => {
    if (!isDragging || !dragSplitId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const split = node as PaneSplit;

      const ratio =
        split.direction === 'vertical'
          ? (e.clientX - rect.left) / rect.width
          : (e.clientY - rect.top) / rect.height;

      onRatioChange(dragSplitId, ratio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragSplitId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragSplitId, node, onRatioChange]);

  if (node.type === 'leaf') {
    const fileId = node.fileId;
    const isActive = node.id === activePaneId;

    return (
      <div
        className={`h-full w-full flex flex-col ${isActive ? 'ring-1 ring-primary/30' : ''}`}
        onClick={() => setActivePane(node.id)}
      >
        {hasMultiplePanes && (
          <div className="flex items-center justify-between px-2 py-1 bg-muted/30 border-b border-border/50 flex-shrink-0">
            <select
              value={fileId || ''}
              onChange={(e) => {
                e.stopPropagation();
                setPaneFile(node.id, e.target.value || null);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={t('split.selectFile')}
              className="text-xs bg-transparent border-none outline-none cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 max-w-[150px] truncate"
            >
              {files.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name}
                  {file.isDirty ? ' •' : ''}
                </option>
              ))}
            </select>
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  splitPaneWithNewFile(node.id, 'vertical');
                }}
                className="p-0.5 rounded hover:bg-muted"
                title={t('split.splitVertical')}
              >
                <Columns2 className="h-3 w-3 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  splitPaneWithNewFile(node.id, 'horizontal');
                }}
                className="p-0.5 rounded hover:bg-muted"
                title={t('split.splitHorizontal')}
              >
                <Rows2 className="h-3 w-3 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closePane(node.id);
                }}
                className="p-0.5 rounded hover:bg-muted"
                title={t('split.closePane')}
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <MonacoEditor fileId={fileId} />
        </div>
      </div>
    );
  }

  const isVertical = node.direction === 'vertical';

  return (
    <div
      ref={containerRef}
      className={`h-full w-full flex ${isVertical ? 'flex-row' : 'flex-col'}`}
    >
      <div
        className="overflow-hidden min-w-0 min-h-0"
        style={{
          [isVertical ? 'width' : 'height']: `${node.ratio * 100}%`,
          [isVertical ? 'height' : 'width']: '100%',
          flexShrink: 0,
        }}
      >
        <SplitPane node={node.first} onRatioChange={onRatioChange} />
      </div>

      <div
        className={`
          mochi-splitter
          ${isVertical ? 'mochi-splitter-vertical' : 'mochi-splitter-horizontal'}
          ${isDragging && dragSplitId === node.id ? 'mochi-splitter-active' : ''}
        `}
        onMouseDown={(e) => handleMouseDown(e, node.id)}
      />

      <div className="flex-1 overflow-hidden min-w-0 min-h-0">
        <SplitPane node={node.second} onRatioChange={onRatioChange} />
      </div>
    </div>
  );
});
