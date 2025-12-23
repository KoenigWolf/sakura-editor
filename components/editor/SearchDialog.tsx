'use client';

import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchStore, type SearchMatch } from '@/lib/store/search-store';
import { cn } from '@/lib/utils';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { useSearchLogic, type SearchOptions } from '@/hooks/use-search-logic';
import {
  X,
  ChevronDown,
  ChevronUp,
  Regex,
  CaseSensitive,
  WholeWord,
  Search,
  ChevronRight,
} from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace?: (query: string, replacement: string, options: SearchOptions) => void;
}

const SearchResultItem = memo(
  ({
    match,
    isActive,
    onClick,
  }: {
    match: SearchMatch;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      className={cn(
        'w-full text-left text-xs px-2 py-1.5 rounded transition-colors',
        'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
        isActive && 'bg-accent text-accent-foreground'
      )}
      onClick={onClick}
    >
      <span className="font-mono text-muted-foreground mr-2">L{match.lineNumber}</span>
      <span className="truncate">
        {match.text.substring(0, 60)}
        {match.text.length > 60 ? '…' : ''}
      </span>
    </button>
  )
);
SearchResultItem.displayName = 'SearchResultItem';

const OptionButton = memo(
  ({
    active,
    onClick,
    icon: Icon,
    label,
    shortcut,
  }: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    shortcut?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      className={cn(
        'h-6 w-6 rounded flex items-center justify-center transition-colors',
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
    </button>
  )
);
OptionButton.displayName = 'OptionButton';

export const SearchDialog = memo(
  ({ open, onOpenChange, onSearch, onReplace }: SearchDialogProps) => {
    const { t } = useTranslation();
    const { searchTerm } = useSearchStore();

    const {
      matches,
      currentMatchIndex,
      isRegex,
      isCaseSensitive,
      isWholeWord,
      setIsRegex,
      setIsCaseSensitive,
      setIsWholeWord,
      performSearch,
      handleNextMatch,
      handlePreviousMatch,
      handleReplace,
      handleReplaceAll,
      goToMatch,
      cleanup,
      resetState,
    } = useSearchLogic(onSearch, onReplace);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const focusTrapRef = useFocusTrap<HTMLDivElement>({
      enabled: open,
      initialFocusRef: searchInputRef as React.RefObject<HTMLElement>,
    });

    const [query, setQuery] = useState(searchTerm);
    const [replacement, setReplacement] = useState('');
    const [showReplace, setShowReplace] = useState(true);
    const [showResults, setShowResults] = useState(true);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const { isMobile } = useMobileDetection();

    useEffect(() => {
      if (open) {
        if (isMobile) {
          setPosition({ x: 0, y: 0 });
        } else {
          const x = window.innerWidth - 420;
          setPosition({ x: Math.max(10, x), y: 60 });
        }
        requestAnimationFrame(() => setIsVisible(true));
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      } else {
        setIsVisible(false);
      }
    }, [open, isMobile]);

    useEffect(() => {
      if (open && searchTerm && searchTerm !== query) {
        setQuery(searchTerm);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, searchTerm]);

    const handleQueryChange = useCallback(
      (value: string) => {
        setQuery(value);
        performSearch(value);
      },
      [performSearch]
    );

    const onNextMatch = useCallback(() => handleNextMatch(query), [handleNextMatch, query]);
    const onPreviousMatch = useCallback(
      () => handlePreviousMatch(query),
      [handlePreviousMatch, query]
    );
    const onReplaceClick = useCallback(
      () => handleReplace(query, replacement),
      [handleReplace, query, replacement]
    );
    const onReplaceAllClick = useCallback(
      () => handleReplaceAll(query, replacement),
      [handleReplaceAll, query, replacement]
    );

    useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onOpenChange(false);
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) onPreviousMatch();
          else onNextMatch();
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
          e.preventDefault();
          setShowReplace((prev) => !prev);
          return;
        }

        if (e.key === 'F3') {
          e.preventDefault();
          if (e.shiftKey) onPreviousMatch();
          else onNextMatch();
          return;
        }

        if (e.altKey && e.key === 'c') {
          e.preventDefault();
          setIsCaseSensitive(!isCaseSensitive);
          performSearch(query, true);
          return;
        }

        if (e.altKey && e.key === 'r') {
          e.preventDefault();
          setIsRegex(!isRegex);
          performSearch(query, true);
          return;
        }

        if (e.altKey && e.key === 'w') {
          e.preventDefault();
          setIsWholeWord(!isWholeWord);
          performSearch(query, true);
          return;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
      open,
      onOpenChange,
      onNextMatch,
      onPreviousMatch,
      isCaseSensitive,
      isRegex,
      isWholeWord,
      setIsCaseSensitive,
      setIsRegex,
      setIsWholeWord,
      performSearch,
      query,
    ]);

    const handleDragStart = useCallback(
      (e: React.MouseEvent) => {
        if (isMobile) return;
        if ((e.target as HTMLElement).closest('input, button')) return;
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
      },
      [position, isMobile]
    );

    useEffect(() => {
      if (!isDragging) return;

      const handleMove = (e: MouseEvent) => {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y)),
        });
      };

      const handleUp = () => setIsDragging(false);

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
    }, [isDragging, dragOffset]);

    useEffect(() => {
      if (!open) resetState();
    }, [open, resetState]);

    useEffect(() => {
      return () => cleanup();
    }, [cleanup]);

    useEffect(() => {
      if (open && query) {
        performSearch(query, true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCaseSensitive, isRegex, isWholeWord]);

    if (!open) return null;

    const mobileStyles = isMobile
      ? {
          position: 'fixed' as const,
          bottom: 0,
          left: 0,
          right: 0,
          top: 'auto',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '85vh',
        }
      : { position: 'fixed' as const, left: position.x, top: position.y, width: 420 };

    return (
      <>
        {isMobile && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => onOpenChange(false)} />
        )}

        <div
          ref={focusTrapRef}
          role="dialog"
          aria-label={t('search.title')}
          aria-modal="true"
          className={cn(
            'z-50 bg-background border shadow-lg flex flex-col',
            'transition-opacity duration-150',
            isVisible ? 'opacity-100' : 'opacity-0',
            isMobile ? 'rounded-t-xl' : 'rounded-lg',
            !isVisible && isMobile && 'translate-y-full',
            isDragging && 'cursor-grabbing select-none'
          )}
          style={mobileStyles}
        >
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-3 py-2 border-b bg-muted/30',
              !isMobile && 'cursor-grab rounded-t-lg'
            )}
            onMouseDown={handleDragStart}
          >
            {isMobile && (
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-muted-foreground/20 rounded-full" />
            )}

            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium">{t('search.title')}</span>
              {matches.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {currentMatchIndex + 1}/{matches.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={onPreviousMatch}
                disabled={matches.length === 0}
                className="h-7 w-7 rounded hover:bg-muted disabled:opacity-40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`${t('search.actions.previous')} (Shift+Enter)`}
              >
                <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={onNextMatch}
                disabled={matches.length === 0}
                className="h-7 w-7 rounded hover:bg-muted disabled:opacity-40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`${t('search.actions.next')} (Enter)`}
              >
                <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-7 w-7 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-1"
                aria-label={`${t('search.close')} (Esc)`}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Search Content */}
          <div className="p-3 space-y-2">
            <div className="relative">
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    if (!showReplace) {
                      setShowReplace(true);
                      setTimeout(() => replaceInputRef.current?.focus(), 0);
                    } else {
                      replaceInputRef.current?.focus();
                    }
                  }
                }}
                placeholder={t('search.placeholder')}
                className="h-9 text-sm pr-20"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                <OptionButton
                  active={isCaseSensitive}
                  onClick={() => {
                    setIsCaseSensitive(!isCaseSensitive);
                    performSearch(query, true);
                  }}
                  icon={CaseSensitive}
                  label={t('search.options.caseSensitive')}
                  shortcut="Alt+C"
                />
                <OptionButton
                  active={isWholeWord}
                  onClick={() => {
                    setIsWholeWord(!isWholeWord);
                    performSearch(query, true);
                  }}
                  icon={WholeWord}
                  label={t('search.options.wholeWord')}
                  shortcut="Alt+W"
                />
                <OptionButton
                  active={isRegex}
                  onClick={() => {
                    setIsRegex(!isRegex);
                    performSearch(query, true);
                  }}
                  icon={Regex}
                  label={t('search.options.useRegex')}
                  shortcut="Alt+R"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReplace((prev) => !prev)}
                className={cn(
                  'text-xs px-2 py-1 rounded transition-colors',
                  showReplace
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {showReplace ? t('search.hideReplace') : t('search.showReplace')}
              </button>
              {query && matches.length === 0 && (
                <span className="text-xs text-muted-foreground">{t('search.results.empty')}</span>
              )}
            </div>

            {showReplace && (
              <div className="space-y-2 pt-2 border-t">
                <Input
                  ref={replaceInputRef}
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && e.shiftKey) {
                      e.preventDefault();
                      searchInputRef.current?.focus();
                    }
                  }}
                  placeholder={t('search.replacePlaceholder')}
                  className="h-9 text-sm"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReplaceClick}
                    className="h-8 flex-1 text-xs"
                  >
                    {t('search.actions.replace')}
                  </Button>
                  <Button size="sm" onClick={onReplaceAllClick} className="h-8 flex-1 text-xs">
                    {t('search.actions.replaceAll')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {matches.length > 0 && (
            <div className="border-t">
              <button
                type="button"
                onClick={() => setShowResults((prev) => !prev)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <span>{t('search.results.found', { count: matches.length })}</span>
                <ChevronRight
                  className={cn('h-3.5 w-3.5 transition-transform', showResults && 'rotate-90')}
                  strokeWidth={1.5}
                />
              </button>

              {showResults && (
                <div
                  className={cn('overflow-y-auto px-1 pb-1', isMobile ? 'max-h-32' : 'max-h-40')}
                >
                  {matches.slice(0, 50).map((match, index) => (
                    <SearchResultItem
                      key={`${match.lineNumber}-${match.startIndex}`}
                      match={match}
                      isActive={index === currentMatchIndex}
                      onClick={() => goToMatch(index)}
                    />
                  ))}
                  {matches.length > 50 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      +{matches.length - 50} {t('search.moreResults')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isMobile && <div className="h-safe-area-inset-bottom" />}
        </div>
      </>
    );
  }
);
SearchDialog.displayName = 'SearchDialog';
