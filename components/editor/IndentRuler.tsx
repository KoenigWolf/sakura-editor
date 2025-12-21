'use client';

import { useCallback, useRef, useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIndentStore } from '@/lib/store/indent-store';
import { useEditorStore } from '@/lib/store';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const CM_TO_PX = 37.795275591;
const RULER_HEIGHT = 18;
const HANDLE_SIZE = 8;

type DragType = 'firstLine' | 'hanging' | 'leftMargin' | 'rightMargin' | 'tabStop' | null;

interface IndentRulerProps {
  className?: string;
}

type HandleVariant = 'firstLine' | 'hanging' | 'leftMargin' | 'rightMargin' | 'tabStop';

interface IndentHandleProps {
  variant: HandleVariant;
  position: number;
  onDragStart: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  label: string;
  value: number;
  onRemove?: () => void;
}

const HANDLE_CONFIGS: Record<HandleVariant, {
  className: string;
  positionProp: 'left' | 'right';
  svg: React.ReactNode;
}> = {
  firstLine: {
    className: 'indent-handle-first-line',
    positionProp: 'left',
    svg: (
      <svg width={HANDLE_SIZE} height={HANDLE_SIZE} viewBox="0 0 10 10">
        <polygon points="0,0 10,0 5,8" fill="currentColor" />
      </svg>
    ),
  },
  hanging: {
    className: 'indent-handle-hanging',
    positionProp: 'left',
    svg: (
      <svg width={HANDLE_SIZE} height={HANDLE_SIZE} viewBox="0 0 10 10">
        <polygon points="0,10 10,10 5,2" fill="currentColor" />
      </svg>
    ),
  },
  leftMargin: {
    className: 'indent-handle-left-margin',
    positionProp: 'left',
    svg: (
      <svg width={HANDLE_SIZE} height={6} viewBox="0 0 10 6">
        <rect x="0" y="0" width="10" height="6" fill="currentColor" />
      </svg>
    ),
  },
  rightMargin: {
    className: 'indent-handle-right-margin',
    positionProp: 'right',
    svg: (
      <svg width={HANDLE_SIZE} height={HANDLE_SIZE} viewBox="0 0 10 10">
        <polygon points="0,10 10,10 5,2" fill="currentColor" />
      </svg>
    ),
  },
  tabStop: {
    className: 'indent-handle-tab-stop',
    positionProp: 'left',
    svg: (
      <svg width={6} height={10} viewBox="0 0 6 10">
        <line x1="3" y1="0" x2="3" y2="10" stroke="currentColor" strokeWidth="2" />
        <line x1="0" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
};

const IndentHandle = memo(({
  variant,
  position,
  onDragStart,
  onKeyDown,
  label,
  value,
  onRemove,
}: IndentHandleProps) => {
  const config = HANDLE_CONFIGS[variant];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`indent-handle ${config.className}`}
          style={{ [config.positionProp]: position }}
          onMouseDown={onDragStart}
          onKeyDown={onKeyDown}
          onDoubleClick={onRemove}
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          tabIndex={0}
        >
          {config.svg}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
});
IndentHandle.displayName = 'IndentHandle';

export const IndentRuler = memo(({ className }: IndentRulerProps) => {
  const { t } = useTranslation();
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<DragType>(null);
  const [dragTabIndex, setDragTabIndex] = useState<number>(-1);
  const [dragOffset, setDragOffset] = useState(0);

  const settings = useIndentStore((state) => state.settings);
  const rulerVisible = useIndentStore((state) => state.rulerVisible);
  const rulerWidth = useIndentStore((state) => state.rulerWidth);
  const updateSettings = useIndentStore((state) => state.updateSettings);
  const setRulerWidth = useIndentStore((state) => state.setRulerWidth);
  const addTabStop = useIndentStore((state) => state.addTabStop);
  const removeTabStop = useIndentStore((state) => state.removeTabStop);
  const clearTabStops = useIndentStore((state) => state.clearTabStops);
  const resetSettings = useIndentStore((state) => state.resetSettings);

  const editorSettings = useEditorStore((state) => state.settings);

  const lineNumberWidth = editorSettings.showLineNumbers ? 50 : 0;

  useEffect(() => {
    const updateWidth = () => {
      if (rulerRef.current) {
        setRulerWidth(rulerRef.current.clientWidth - lineNumberWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [setRulerWidth, lineNumberWidth]);

  const cmToPixels = useCallback((cm: number) => cm * CM_TO_PX, []);
  const pixelsToCm = useCallback((px: number) => px / CM_TO_PX, []);

  const snapToGrid = useCallback((cm: number, gridSize: number = 0.127) => {
    return Math.round(cm / gridSize) * gridSize;
  }, []);

  const handleMouseDown = useCallback((type: DragType, e: React.MouseEvent, tabIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    if (tabIndex !== undefined) {
      setDragTabIndex(tabIndex);
    }

    const rulerRect = rulerRef.current?.getBoundingClientRect();
    if (rulerRect) {
      const clickX = e.clientX - rulerRect.left - lineNumberWidth;
      setDragOffset(clickX);
    }
  }, [lineNumberWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragType || !rulerRef.current) return;

    const rulerRect = rulerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rulerRect.left - lineNumberWidth;
    const maxWidth = rulerWidth;

    let newCm = snapToGrid(pixelsToCm(mouseX));
    newCm = Math.max(0, Math.min(newCm, pixelsToCm(maxWidth)));

    switch (dragType) {
      case 'firstLine':
        updateSettings({ firstLineIndent: newCm - settings.leftMargin });
        break;
      case 'hanging':
        updateSettings({ hangingIndent: newCm - settings.leftMargin });
        break;
      case 'leftMargin':
        updateSettings({
          leftMargin: newCm,
          firstLineIndent: settings.firstLineIndent,
          hangingIndent: settings.hangingIndent,
        });
        break;
      case 'rightMargin':
        const rightCm = pixelsToCm(maxWidth) - newCm;
        updateSettings({ rightMargin: Math.max(0, snapToGrid(rightCm)) });
        break;
      case 'tabStop':
        if (dragTabIndex >= 0) {
          const newTabStops = [...settings.tabStops];
          newTabStops[dragTabIndex] = newCm;
          newTabStops.sort((a, b) => a - b);
          updateSettings({ tabStops: newTabStops });
        }
        break;
    }
  }, [isDragging, dragType, dragTabIndex, settings, rulerWidth, lineNumberWidth, updateSettings, pixelsToCm, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDragTabIndex(-1);
    setDragOffset(0);
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

  const handleRulerClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;

    const rulerRect = rulerRef.current?.getBoundingClientRect();
    if (!rulerRect) return;

    const clickX = e.clientX - rulerRect.left - lineNumberWidth;
    const clickY = e.clientY - rulerRect.top;

    if (clickY > RULER_HEIGHT - 10) {
      const cmPosition = snapToGrid(pixelsToCm(clickX));
      if (!settings.tabStops.includes(cmPosition)) {
        addTabStop(cmPosition);
      }
    }
  }, [isDragging, lineNumberWidth, settings.tabStops, addTabStop, pixelsToCm, snapToGrid]);

  const handleRemoveTabStop = useCallback((position: number) => {
    removeTabStop(position);
  }, [removeTabStop]);

  const STEP_SIZE = 0.127;
  const maxCm = pixelsToCm(rulerWidth);

  const handleKeyDown = useCallback((type: DragType, e: React.KeyboardEvent, tabIndex?: number) => {
    const step = e.shiftKey ? STEP_SIZE * 5 : STEP_SIZE;
    let delta = 0;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        delta = step;
        break;
      case 'Home':
        delta = -Infinity;
        break;
      case 'End':
        delta = Infinity;
        break;
      default:
        return;
    }

    e.preventDefault();

    switch (type) {
      case 'firstLine': {
        const newValue = delta === -Infinity ? -settings.leftMargin :
                         delta === Infinity ? maxCm - settings.leftMargin :
                         snapToGrid(settings.firstLineIndent + delta);
        updateSettings({ firstLineIndent: Math.max(-settings.leftMargin, Math.min(newValue, maxCm - settings.leftMargin)) });
        break;
      }
      case 'hanging': {
        const newValue = delta === -Infinity ? -settings.leftMargin :
                         delta === Infinity ? maxCm - settings.leftMargin :
                         snapToGrid(settings.hangingIndent + delta);
        updateSettings({ hangingIndent: Math.max(-settings.leftMargin, Math.min(newValue, maxCm - settings.leftMargin)) });
        break;
      }
      case 'leftMargin': {
        const newValue = delta === -Infinity ? 0 :
                         delta === Infinity ? maxCm :
                         snapToGrid(settings.leftMargin + delta);
        updateSettings({ leftMargin: Math.max(0, Math.min(newValue, maxCm)) });
        break;
      }
      case 'rightMargin': {
        const newValue = delta === -Infinity ? 0 :
                         delta === Infinity ? maxCm :
                         snapToGrid(settings.rightMargin - delta);
        updateSettings({ rightMargin: Math.max(0, Math.min(newValue, maxCm)) });
        break;
      }
      case 'tabStop': {
        if (tabIndex !== undefined && tabIndex >= 0) {
          const currentValue = settings.tabStops[tabIndex];
          const newValue = delta === -Infinity ? 0 :
                           delta === Infinity ? maxCm :
                           snapToGrid(currentValue + delta);
          const newTabStops = [...settings.tabStops];
          newTabStops[tabIndex] = Math.max(0, Math.min(newValue, maxCm));
          newTabStops.sort((a, b) => a - b);
          updateSettings({ tabStops: newTabStops });
        }
        break;
      }
    }
  }, [settings, maxCm, updateSettings, snapToGrid]);

  const renderTicks = useCallback(() => {
    const ticks: JSX.Element[] = [];
    const maxCm = pixelsToCm(rulerWidth);

    for (let cm = 0; cm <= maxCm; cm += 0.127) {
      const px = cmToPixels(cm);
      const isMajor = Math.abs(cm - Math.round(cm)) < 0.01;
      const isHalf = Math.abs(cm - Math.round(cm) - 0.5) < 0.01 || Math.abs(cm - Math.round(cm) + 0.5) < 0.01;

      if (isMajor) {
        ticks.push(
          <div
            key={`tick-${cm}`}
            className="indent-ruler-tick indent-ruler-tick-major"
            style={{ left: px + lineNumberWidth }}
          >
            <span className="indent-ruler-tick-label">{Math.round(cm)}</span>
          </div>
        );
      } else if (isHalf) {
        ticks.push(
          <div
            key={`tick-${cm}`}
            className="indent-ruler-tick indent-ruler-tick-half"
            style={{ left: px + lineNumberWidth }}
          />
        );
      } else if (Math.round(cm / 0.127) % 2 === 0) {
        ticks.push(
          <div
            key={`tick-${cm}`}
            className="indent-ruler-tick indent-ruler-tick-minor"
            style={{ left: px + lineNumberWidth }}
          />
        );
      }
    }

    return ticks;
  }, [rulerWidth, cmToPixels, pixelsToCm, lineNumberWidth]);

  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  }, []);

  if (!rulerVisible) return null;

  const leftMarginPx = cmToPixels(settings.leftMargin) + lineNumberWidth;
  const firstLineIndentPx = cmToPixels(settings.leftMargin + settings.firstLineIndent) + lineNumberWidth;
  const hangingIndentPx = cmToPixels(settings.leftMargin + settings.hangingIndent) + lineNumberWidth;
  const rightMarginPx = cmToPixels(settings.rightMargin);

  return (
    <>
      <div
        ref={rulerRef}
        className={cn(
          'indent-ruler',
          isDragging && 'indent-ruler-dragging',
          className
        )}
        onClick={handleRulerClick}
        onContextMenu={handleContextMenu}
        role="toolbar"
        aria-label={t('indent.ruler')}
      >
        <div className="indent-ruler-margin-area" style={{ width: lineNumberWidth }} />

        <div className="indent-ruler-content">
          {renderTicks()}

          <div
            className="indent-ruler-text-area"
            style={{
              left: leftMarginPx,
              right: rightMarginPx,
            }}
          />

          <IndentHandle
            variant="firstLine"
            position={firstLineIndentPx - HANDLE_SIZE / 2}
            onDragStart={(e) => handleMouseDown('firstLine', e)}
            onKeyDown={(e) => handleKeyDown('firstLine', e)}
            label={t('indent.firstLineIndent')}
            value={Math.round(settings.firstLineIndent * 10)}
          />

          <IndentHandle
            variant="hanging"
            position={hangingIndentPx - HANDLE_SIZE / 2}
            onDragStart={(e) => handleMouseDown('hanging', e)}
            onKeyDown={(e) => handleKeyDown('hanging', e)}
            label={t('indent.hangingIndent')}
            value={Math.round(settings.hangingIndent * 10)}
          />

          <IndentHandle
            variant="leftMargin"
            position={leftMarginPx - HANDLE_SIZE / 2}
            onDragStart={(e) => handleMouseDown('leftMargin', e)}
            onKeyDown={(e) => handleKeyDown('leftMargin', e)}
            label={t('indent.leftMargin')}
            value={Math.round(settings.leftMargin * 10)}
          />

          <IndentHandle
            variant="rightMargin"
            position={rightMarginPx - HANDLE_SIZE / 2}
            onDragStart={(e) => handleMouseDown('rightMargin', e)}
            onKeyDown={(e) => handleKeyDown('rightMargin', e)}
            label={t('indent.rightMargin')}
            value={Math.round(settings.rightMargin * 10)}
          />

          {settings.tabStops.map((tabStop, index) => (
            <IndentHandle
              key={`tab-${index}`}
              variant="tabStop"
              position={cmToPixels(tabStop) + lineNumberWidth - 3}
              onDragStart={(e) => handleMouseDown('tabStop', e, index)}
              onKeyDown={(e) => handleKeyDown('tabStop', e, index)}
              onRemove={() => handleRemoveTabStop(tabStop)}
              label={`${t('indent.tabStop')}: ${tabStop.toFixed(2)}cm`}
              value={Math.round(tabStop * 10)}
            />
          ))}
        </div>

        {isDragging && (
          <div
            className="indent-ruler-drag-guide"
            style={{ left: dragOffset + lineNumberWidth }}
          />
        )}
      </div>

      <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            style={{
              position: 'fixed',
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              width: 1,
              height: 1,
              pointerEvents: 'none',
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => { clearTabStops(); setContextMenuOpen(false); }}>
            {t('indent.clearTabStops')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { resetSettings(); setContextMenuOpen(false); }}>
            {t('indent.resetIndent')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
});

IndentRuler.displayName = 'IndentRuler';
