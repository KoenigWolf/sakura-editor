'use client';

import { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSearchStore, type SearchMatch } from '@/lib/store/search-store';
import { cn } from '@/lib/utils';
import { X, ChevronDown, ChevronUp, Regex, CaseSensitive, WholeWord, Replace, Search, ChevronRight } from 'lucide-react';

interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace?: (query: string, replacement: string, options: SearchOptions) => void;
  initialQuery?: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SearchResultItem = memo(({
  match,
  isActive,
  onClick
}: {
  match: SearchMatch;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={cn(
      'w-full text-left text-xs px-2 py-1.5 rounded transition-colors',
      'hover:bg-accent/50 focus:bg-accent/50 focus:outline-none',
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
));
SearchResultItem.displayName = 'SearchResultItem';

const OptionButton = memo(({
  active,
  onClick,
  icon: Icon,
  label,
  shortcut,
  showLabel = false
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  showLabel?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    className={cn(
      'h-7 rounded flex items-center justify-center transition-colors gap-1',
      'hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring',
      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      showLabel ? 'px-2' : 'w-7'
    )}
  >
    <Icon className="h-3.5 w-3.5 shrink-0" />
    {showLabel && <span className="text-xs hidden sm:inline">{label}</span>}
  </button>
));
OptionButton.displayName = 'OptionButton';

export const SearchDialog = memo(({
  open,
  onOpenChange,
  onSearch,
  onReplace,
}: SearchDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getEditorInstance } = useEditorInstanceStore();
  const {
    matches,
    currentMatchIndex,
    setMatches,
    setCurrentMatchIndex,
    searchTerm,
    setSearchTerm,
    isRegex,
    isCaseSensitive,
    isWholeWord,
    setIsRegex,
    setIsCaseSensitive,
    setIsWholeWord,
  } = useSearchStore();

  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const decorationsRef = useRef<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState(searchTerm);
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const options = useMemo(() => ({
    caseSensitive: isCaseSensitive,
    useRegex: isRegex,
    wholeWord: isWholeWord,
  }), [isCaseSensitive, isRegex, isWholeWord]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryを依存配列に入れると無限ループになる
  }, [open, searchTerm]);

  
  const applyHighlights = useCallback((matchList: SearchMatch[], activeIndex: number) => {
    const editor = getEditorInstance();
    if (!editor) return;

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      matchList.map((match, index) => ({
        range: {
          startLineNumber: match.lineNumber,
          startColumn: match.startIndex,
          endLineNumber: match.lineNumber,
          endColumn: match.endIndex,
        },
        options: {
          inlineClassName: index === activeIndex ? 'search-match-active' : 'search-match-highlight',
        },
      }))
    );
  }, [getEditorInstance]);

  
  const clearHighlights = useCallback(() => {
    const editor = getEditorInstance();
    if (editor && decorationsRef.current.length > 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  }, [getEditorInstance]);

  
  const goToMatch = useCallback((index: number, targetMatches?: SearchMatch[]) => {
    const editor = getEditorInstance();
    const list = targetMatches ?? matches;
    if (!editor || list.length === 0) return;

    const safeIndex = ((index % list.length) + list.length) % list.length;
    const match = list[safeIndex];

    editor.setSelection({
      startLineNumber: match.lineNumber,
      startColumn: match.startIndex,
      endLineNumber: match.lineNumber,
      endColumn: match.endIndex,
    });
    editor.revealLineInCenter(match.lineNumber);
    setCurrentMatchIndex(safeIndex);
    applyHighlights(list, safeIndex);
  }, [applyHighlights, getEditorInstance, matches, setCurrentMatchIndex]);

  
  const performSearch = useCallback((searchQuery: string, immediate = false) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const doSearch = () => {
      const normalizedQuery = searchQuery.trim();
      if (!normalizedQuery) {
        setMatches([]);
        setCurrentMatchIndex(-1);
        clearHighlights();
        return;
      }

      const editor = getEditorInstance();
      const model = editor?.getModel();
      if (!editor || !model) return;

      try {
        const isRegexMode = isRegex || isWholeWord;
        const searchString = isRegex
          ? normalizedQuery
          : isWholeWord
            ? `\\b${escapeRegExp(normalizedQuery)}\\b`
            : normalizedQuery;

        const foundMatches = model.findMatches(
          searchString,
          false,
          isRegexMode,
          isCaseSensitive,
          null,
          false
        );

        const parsedMatches = foundMatches.map((match) => ({
          lineNumber: match.range.startLineNumber,
          startIndex: match.range.startColumn,
          endIndex: match.range.endColumn,
          text: match.matches?.[0] || model.getValueInRange(match.range),
        }));

        setMatches(parsedMatches);
        setSearchTerm(normalizedQuery);

        if (parsedMatches.length > 0) {
          goToMatch(0, parsedMatches);
        } else {
          setCurrentMatchIndex(-1);
          applyHighlights([], -1);
        }

        onSearch(normalizedQuery, options);
      } catch {
        
      }
    };

    if (immediate) {
      doSearch();
    } else {
      searchTimeoutRef.current = setTimeout(doSearch, 100);
    }
  }, [getEditorInstance, isRegex, isWholeWord, isCaseSensitive, setMatches, setSearchTerm, setCurrentMatchIndex, goToMatch, applyHighlights, clearHighlights, onSearch, options]);

  
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    performSearch(value);
  }, [performSearch]);

  
  const handleNextMatch = useCallback(() => {
    if (matches.length === 0) {
      performSearch(query, true);
      return;
    }
    goToMatch((currentMatchIndex + 1) % matches.length);
  }, [currentMatchIndex, goToMatch, matches.length, performSearch, query]);

  const handlePreviousMatch = useCallback(() => {
    if (matches.length === 0) {
      performSearch(query, true);
      return;
    }
    goToMatch(currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1);
  }, [currentMatchIndex, goToMatch, matches.length, performSearch, query]);

  
  const handleReplace = useCallback(() => {
    if (!onReplace || !query.trim()) return;

    const editor = getEditorInstance();
    const model = editor?.getModel();
    if (!editor || !model) return;

    const selection = editor.getSelection();
    if (!selection || selection.isEmpty()) {
      handleNextMatch();
      return;
    }

    const selectedText = model.getValueInRange(selection);
    let replaceText = replacement;

    if (isRegex) {
      try {
        const regex = new RegExp(query, isCaseSensitive ? 'g' : 'gi');
        replaceText = selectedText.replace(regex, replacement);
      } catch {
        replaceText = selectedText.replace(query, replacement);
      }
    } else {
      replaceText = selectedText.replace(
        isCaseSensitive ? query : new RegExp(escapeRegExp(query), 'gi'),
        replacement
      );
    }

    editor.executeEdits('replace', [{ range: selection, text: replaceText }]);
    onReplace(query, replacement, options);
    performSearch(query, true);
  }, [query, replacement, isRegex, isCaseSensitive, getEditorInstance, onReplace, options, performSearch, handleNextMatch]);

  
  const handleReplaceAll = useCallback(() => {
    if (!onReplace || !query.trim()) return;

    const editor = getEditorInstance();
    const model = editor?.getModel();
    if (!editor || !model) return;

    const isRegexMode = isRegex || isWholeWord;
    const searchString = isRegex
      ? query
      : isWholeWord
        ? `\\b${escapeRegExp(query)}\\b`
        : query;

    const foundMatches = model.findMatches(
      searchString,
      false,
      isRegexMode,
      isCaseSensitive,
      null,
      false
    );

    if (foundMatches.length === 0) return;

    const count = foundMatches.length;
    const edits = foundMatches.map((match) => ({
      range: match.range,
      text: replacement,
    }));

    editor.executeEdits('replaceAll', edits);
    onReplace(query, replacement, options);

    toast({
      title: t('search.replaced', { count }),
      duration: 2000,
    });

    performSearch(query, true);
  }, [query, replacement, isRegex, isWholeWord, isCaseSensitive, getEditorInstance, onReplace, options, performSearch, toast, t]);

  
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
        if (e.shiftKey) {
          handlePreviousMatch();
        } else {
          handleNextMatch();
        }
        return;
      }

      
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowReplace(prev => !prev);
        return;
      }

      
      if (e.key === 'F3') {
        e.preventDefault();
        if (e.shiftKey) {
          handlePreviousMatch();
        } else {
          handleNextMatch();
        }
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
  }, [open, onOpenChange, handleNextMatch, handlePreviousMatch, isCaseSensitive, isRegex, isWholeWord, setIsCaseSensitive, setIsRegex, setIsWholeWord, performSearch, query]);

  
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isMobile) return;
    if ((e.target as HTMLElement).closest('input, button')) return;
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position, isMobile]);

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
    if (!open) {
      clearHighlights();
      setMatches([]);
      setCurrentMatchIndex(-1);
    }
  }, [open, clearHighlights, setMatches, setCurrentMatchIndex]);

  useEffect(() => {
    return () => {
      clearHighlights();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [clearHighlights]);

  
  useEffect(() => {
    if (open && query) {
      performSearch(query, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- オプション変更時のみ発火させる
  }, [isCaseSensitive, isRegex, isWholeWord]);

  if (!open) return null;

  
  const mobileStyles = isMobile ? {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    top: 'auto',
    width: '100%',
    maxWidth: '100%',
    borderRadius: '12px 12px 0 0',
    maxHeight: '70vh',
  } : {
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    width: 400,
  };

  return (
    <>
      {/* オーバーレイ（モバイルのみ） */}
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => onOpenChange(false)}
        />
      )}

      <div
        ref={dialogRef}
        className={cn(
          'z-50 bg-background border shadow-xl flex flex-col',
          'transition-all duration-150 ease-out',
          isVisible ? 'opacity-100' : 'opacity-0',
          isMobile ? 'translate-y-0' : 'rounded-lg',
          !isVisible && isMobile && 'translate-y-full',
          isDragging && 'cursor-grabbing select-none'
        )}
        style={mobileStyles}
      >
        {/* ヘッダー */}
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2 border-b bg-muted/50',
            !isMobile && 'cursor-grab rounded-t-lg'
          )}
          onMouseDown={handleDragStart}
        >
          {/* モバイル用ハンドル */}
          {isMobile && (
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-muted-foreground/30 rounded-full" />
          )}

          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('search.title')}</span>
            {matches.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {currentMatchIndex + 1}/{matches.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePreviousMatch}
              disabled={matches.length === 0}
              className="h-8 w-8 sm:h-6 sm:w-6 rounded hover:bg-accent disabled:opacity-50 flex items-center justify-center"
              title={`${t('search.actions.previous')} (Shift+Enter)`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMatch}
              disabled={matches.length === 0}
              className="h-8 w-8 sm:h-6 sm:w-6 rounded hover:bg-accent disabled:opacity-50 flex items-center justify-center"
              title={`${t('search.actions.next')} (Enter)`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 sm:h-6 sm:w-6 rounded hover:bg-accent flex items-center justify-center ml-1"
              title={`${t('search.close')} (Esc)`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 検索入力 */}
        <div className="p-2 sm:p-2 space-y-2">
          {/* 検索フィールド */}
          <div className="flex gap-1 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={t('search.placeholder')}
                className="h-10 sm:h-8 text-base sm:text-sm pr-2 sm:pr-24"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
              {/* デスクトップ: オプションボタンを入力欄内に */}
              <div className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 gap-0.5">
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
          </div>

          {/* モバイル: オプションボタンを別行に */}
          <div className="flex sm:hidden gap-1 flex-wrap">
            <OptionButton
              active={isCaseSensitive}
              onClick={() => {
                setIsCaseSensitive(!isCaseSensitive);
                performSearch(query, true);
              }}
              icon={CaseSensitive}
              label="Aa"
              showLabel
            />
            <OptionButton
              active={isWholeWord}
              onClick={() => {
                setIsWholeWord(!isWholeWord);
                performSearch(query, true);
              }}
              icon={WholeWord}
              label="単語"
              showLabel
            />
            <OptionButton
              active={isRegex}
              onClick={() => {
                setIsRegex(!isRegex);
                performSearch(query, true);
              }}
              icon={Regex}
              label="正規"
              showLabel
            />
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setShowReplace(prev => !prev)}
              className={cn(
                'h-7 px-2 rounded flex items-center gap-1 transition-colors text-xs',
                showReplace ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              <Replace className="h-3.5 w-3.5" />
              {t('search.actions.replace')}
            </button>
          </div>

          {/* 置換入力 */}
          {showReplace && (
            <div className="flex gap-1 flex-col sm:flex-row">
              <div className="flex-1">
                <Input
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder={t('search.replacePlaceholder')}
                  className="h-10 sm:h-8 text-base sm:text-sm"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReplace}
                  className="h-10 sm:h-8 flex-1 sm:flex-none sm:px-2"
                >
                  <Replace className="h-3.5 w-3.5 sm:mr-0 mr-1" />
                  <span className="sm:hidden">{t('search.actions.replace')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReplaceAll}
                  className="h-10 sm:h-8 flex-1 sm:flex-none sm:px-2 text-xs"
                >
                  {t('search.actions.replaceAll')}
                </Button>
              </div>
            </div>
          )}

          {/* デスクトップ: 置換トグル & 結果なし表示 */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReplace(prev => !prev)}
              className={cn(
                'text-xs px-2 py-1 rounded transition-colors',
                showReplace ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {showReplace ? t('search.hideReplace') : t('search.showReplace')}
            </button>
            {query && matches.length === 0 && (
              <span className="text-xs text-muted-foreground">{t('search.results.empty')}</span>
            )}
          </div>

          {/* モバイル: 結果なし表示 */}
          {isMobile && query && matches.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-1">
              {t('search.results.empty')}
            </div>
          )}
        </div>

        {/* 検索結果リスト */}
        {matches.length > 0 && (
          <div className="border-t flex flex-col">
            {/* 結果ヘッダー */}
            <button
              type="button"
              onClick={() => setShowResults(prev => !prev)}
              className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/50 text-xs text-muted-foreground"
            >
              <span>{t('search.results.found', { count: matches.length })}</span>
              <ChevronRight className={cn('h-3 w-3 transition-transform', showResults && 'rotate-90')} />
            </button>

            {/* 結果リスト */}
            {showResults && (
              <div className={cn('overflow-y-auto', isMobile ? 'max-h-32' : 'max-h-40')}>
                <div className="p-1">
                  {matches.slice(0, 50).map((match, index) => (
                    <SearchResultItem
                      key={`${match.lineNumber}-${match.startIndex}`}
                      match={match}
                      index={index}
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
              </div>
            )}
          </div>
        )}

        {/* モバイル用セーフエリア */}
        {isMobile && <div className="h-safe-area-inset-bottom" />}
      </div>
    </>
  );
});
SearchDialog.displayName = 'SearchDialog';
