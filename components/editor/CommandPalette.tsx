'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import {
  Command,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
  category: 'file' | 'edit' | 'view' | 'search' | 'settings';
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandItem[];
}

const categoryOrder = ['file', 'edit', 'view', 'search', 'settings'] as const;

export function CommandPalette({ open, onOpenChange, commands }: CommandPaletteProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobileDetection();

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return categoryOrder
      .filter(cat => groups[cat]?.length > 0)
      .map(cat => ({ category: cat, commands: groups[cat] }));
  }, [filteredCommands]);

  const flatCommands = useMemo(() =>
    groupedCommands.flatMap(g => g.commands),
    [groupedCommands]
  );

  const executeCommand = useCallback((cmd: CommandItem) => {
    onOpenChange(false);
    setQuery('');
    requestAnimationFrame(() => {
      cmd.action();
    });
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, flatCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            executeCommand(flatCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, flatCommands, executeCommand, onOpenChange]);

  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  let itemIndex = -1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-150"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette */}
      <div className={cn(
        'fixed z-50 animate-in fade-in slide-in-from-top-4 duration-200',
        isMobile
          ? 'inset-x-0 bottom-0 top-auto'
          : 'left-1/2 top-[15%] -translate-x-1/2 w-full max-w-xl'
      )}>
        <div className={cn(
          'bg-background border shadow-xl overflow-hidden',
          isMobile ? 'rounded-t-xl' : 'rounded-lg mx-4'
        )}>
          {/* Handle for Mobile */}
          {isMobile && (
            <div className="flex justify-center pt-2">
              <div className="w-8 h-1 bg-muted-foreground/20 rounded-full" />
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Command className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('commandPalette.placeholder')}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Command List */}
          <div ref={listRef} className={cn(
            'overflow-y-auto p-2',
            isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'
          )}>
            {flatCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {t('commandPalette.noResults')}
              </div>
            ) : (
              groupedCommands.map(({ category, commands: cmds }) => (
                <div key={category} className="mb-2 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t(`commandPalette.categories.${category}`)}
                  </div>
                  {cmds.map((cmd) => {
                    itemIndex++;
                    const isSelected = itemIndex === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        data-selected={isSelected}
                        onClick={() => executeCommand(cmd)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                          'hover:bg-muted focus:bg-muted focus:outline-none',
                          isSelected && 'bg-accent'
                        )}
                      >
                        <div className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-md shrink-0',
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}>
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{cmd.label}</div>
                          {cmd.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        {cmd.shortcut && !isMobile && (
                          <div className="flex items-center gap-1 shrink-0">
                            {cmd.shortcut.split('+').map((key, i) => (
                              <kbd
                                key={i}
                                className="h-5 min-w-[20px] inline-flex items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                        {isSelected && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="hidden sm:flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-background border text-[10px]">↑</kbd>
                <kbd className="px-1 py-0.5 rounded bg-background border text-[10px]">↓</kbd>
                {t('commandPalette.navigate')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-background border text-[10px]">↵</kbd>
                {t('commandPalette.select')}
              </span>
            </div>
            <span>{flatCommands.length} {t('commandPalette.commands')}</span>
          </div>

          {/* Safe Area for Mobile */}
          {isMobile && <div className="h-safe-area-inset-bottom" />}
        </div>
      </div>
    </>
  );
}

export { type CommandItem };
