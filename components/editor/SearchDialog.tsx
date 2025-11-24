/**
 * SearchDialogコンポーネント
 * 
 * 高性能な検索機能を提供するダイアログコンポーネント
 * 
 * 主な機能:
 * - リアルタイム検索
 * - 正規表現対応
 * - 大文字小文字区別オプション
 * - 検索履歴管理
 * - キーボードショートカット
 * - 検索結果のハイライト表示
 * - アクセシビリティ対応
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useDraggableDialog } from '@/hooks/useDraggableDialog';
import { cn } from '@/lib/utils';
import { Search, Replace, ChevronDown, ChevronUp, X, Regex, CaseSensitive } from 'lucide-react';
import type { SearchMatch } from '@/lib/store/search-store';

// 型定義
interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
}

interface SearchHistory {
  query: string;
  options: SearchOptions;
  timestamp: number;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace?: (query: string, replacement: string, options: SearchOptions) => void;
  initialQuery?: string;
}

// 定数
const MAX_HISTORY = 10;
const HISTORY_STORAGE_KEY = 'search-history';

// ユーティリティ関数
const loadSearchHistory = (): SearchHistory[] => {
  try {
    const history = localStorage.getItem(HISTORY_STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const saveSearchHistory = (history: SearchHistory[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
};

export const SearchDialog = ({
  open,
  onOpenChange,
  onSearch,
  onReplace,
  initialQuery = '',
}: SearchDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [replacement, setReplacement] = useState('');
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    useRegex: false,
    wholeWord: false,
  });
  const [history, setHistory] = useState<SearchHistory[]>(loadSearchHistory());
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showReplace, setShowReplace] = useState(false);

  // ドラッグ可能なダイアログの位置と動作を管理
  const {
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDraggableDialog(open, dialogRef, {
    margin: 10,
    topMargin: 50,
  });

  // 検索履歴を更新
  const updateHistory = useCallback((newQuery: string, newOptions: SearchOptions) => {
    const newHistory: SearchHistory = {
      query: newQuery,
      options: newOptions,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const filtered = prev.filter(h => h.query !== newQuery);
      const updated = [newHistory, ...filtered].slice(0, MAX_HISTORY);
      saveSearchHistory(updated);
      return updated;
    });
  }, []);

  // 検索を実行
  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      toast({
        title: t('search.errors.emptyQuery'),
        description: t('search.errors.enterQuery'),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Monaco Editorの検索機能を使用
      const win = window as any;
      const editor = win.__MONACO_EDITOR_INSTANCE__;
      if (editor) {
        const model = editor.getModel();
        if (model) {
          // 検索オプションを設定
          const searchOptions: any = {
            isRegex: options.useRegex,
            matchCase: options.caseSensitive,
            wholeWord: options.wholeWord,
          };

          // 検索を実行
          const matches = model.findMatches(query, false, searchOptions.isRegex, searchOptions.matchCase, searchOptions.wholeWord, false);
          
          // 検索結果をストアに保存
          const searchStore = require('@/lib/store/search-store').useSearchStore.getState();
          searchStore.setMatches(matches.map((match: any) => ({
            lineNumber: match.range.startLineNumber,
            startIndex: match.range.startColumn,
            endIndex: match.range.endColumn,
            text: match.matches[0] || '',
          })));
          
          if (matches.length > 0) {
            // 最初のマッチに移動
            editor.setPosition({ lineNumber: matches[0].range.startLineNumber, column: matches[0].range.startColumn });
            editor.revealLineInCenter(matches[0].range.startLineNumber);
            searchStore.setCurrentMatchIndex(0);
          }
        }
      }
      
      onSearch(query, options);
      updateHistory(query, options);
    } catch (error) {
      toast({
        title: t('search.errors.searchFailed'),
        description: error instanceof Error ? error.message : t('search.errors.unknown'),
        variant: 'destructive',
      });
    }
  }, [query, options, onSearch, updateHistory, toast, t]);

  // 置換を実行
  const handleReplace = useCallback(() => {
    if (!onReplace) return;

    if (!query.trim()) {
      toast({
        title: t('search.errors.emptyQuery'),
        description: t('search.errors.enterQuery'),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Monaco Editorの置換機能を使用
      const win = window as any;
      const editor = win.__MONACO_EDITOR_INSTANCE__;
      if (editor) {
        const model = editor.getModel();
        if (model) {
          const selection = editor.getSelection();
          if (selection && !selection.isEmpty()) {
            // 選択範囲を置換
            const selectedText = model.getValueInRange(selection);
            let replaceText = replacement;
            
            if (options.useRegex) {
              try {
                const regex = new RegExp(query, options.caseSensitive ? 'g' : 'gi');
                replaceText = selectedText.replace(regex, replacement);
              } catch (e) {
                // 正規表現エラーの場合は通常の置換
                replaceText = selectedText.replace(query, replacement);
              }
            } else {
              if (options.caseSensitive) {
                replaceText = selectedText.replace(query, replacement);
              } else {
                const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                replaceText = selectedText.replace(regex, replacement);
              }
            }
            
            editor.executeEdits('replace', [{
              range: selection,
              text: replaceText,
            }]);
          }
        }
      }
      
      onReplace(query, replacement, options);
      updateHistory(query, options);
    } catch (error) {
      toast({
        title: t('search.errors.replaceFailed'),
        description: error instanceof Error ? error.message : t('search.errors.unknown'),
        variant: 'destructive',
      });
    }
  }, [query, replacement, options, onReplace, updateHistory, toast, t]);

  // 検索履歴をナビゲート
  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    if (history.length === 0) return;

    setHistoryIndex(prev => {
      const newIndex = direction === 'up'
        ? (prev + 1) % history.length
        : (prev - 1 + history.length) % history.length;

      const item = history[newIndex];
      setQuery(item.query);
      setOptions(item.options);
      return newIndex;
    });
  }, [history]);

  // キーボードショートカットの処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Enter: 検索実行
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      }

      // Esc: ダイアログを閉じる
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }

      // Ctrl/Cmd + H: 置換モードの切り替え
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowReplace(prev => !prev);
      }

      // Ctrl/Cmd + G: 次の検索結果
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        handleSearch();
      }

      // Ctrl/Cmd + Shift + G: 前の検索結果
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'g') {
        e.preventDefault();
        handleSearch();
      }

      // 上下キー: 検索履歴のナビゲート
      if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        navigateHistory('up');
      }
      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        navigateHistory('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleSearch, navigateHistory, onOpenChange]);

  // ダイアログが開かれたときに検索入力欄にフォーカス
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        customPosition
        className={cn(
          "fixed p-0 shadow-lg border border-input rounded-lg",
          "backdrop-blur-sm bg-background/95",
          "transition-all duration-200 ease-in-out",
          isDragging && "cursor-grabbing"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '600px',
          maxHeight: '80vh',
          opacity: open ? 1 : 0,
          transform: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">{t('search.title')}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
              aria-label={t('search.close')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 検索入力エリア */}
            <div className="p-3 border-b">
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="pl-8 pr-24 h-9"
                  aria-label={t('search.searchInput')}
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateHistory('up')}
                    className="h-6 w-6 hover:bg-muted"
                    aria-label={t('search.previousHistory')}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateHistory('down')}
                    className="h-6 w-6 hover:bg-muted"
                    aria-label={t('search.nextHistory')}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 置換入力エリア */}
            {showReplace && (
              <div className="p-3 border-b bg-muted/30">
                <div className="relative">
                  <Input
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    placeholder={t('search.replacePlaceholder')}
                    className="pl-8 h-9"
                    aria-label={t('search.replaceInput')}
                  />
                  <Replace className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* 検索オプション */}
            <div className="p-3 border-b bg-muted/20">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="case-sensitive"
                    checked={options.caseSensitive}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, caseSensitive: checked }))}
                  />
                  <Label htmlFor="case-sensitive" className="flex items-center gap-1 text-sm">
                    <CaseSensitive className="h-3.5 w-3.5" />
                    {t('search.options.caseSensitive')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="use-regex"
                    checked={options.useRegex}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, useRegex: checked }))}
                  />
                  <Label htmlFor="use-regex" className="flex items-center gap-1 text-sm">
                    <Regex className="h-3.5 w-3.5" />
                    {t('search.options.useRegex')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="whole-word"
                    checked={options.wholeWord}
                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, wholeWord: checked }))}
                  />
                  <Label htmlFor="whole-word" className="text-sm">
                    {t('search.options.wholeWord')}
                  </Label>
                </div>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReplace(prev => !prev)}
                  className="h-8 w-8 hover:bg-muted"
                  aria-label={t('search.toggleReplace')}
                >
                  <Replace className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 検索結果エリア */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* 検索結果の表示エリア */}
                {(() => {
                  const win = window as any;
                  const searchStore = win.__SEARCH_STORE__ || require('@/lib/store/search-store').useSearchStore.getState();
                  const matches = searchStore.matches || [];
                  const currentIndex = searchStore.currentMatchIndex || -1;
                  
                  if (matches.length === 0 && query) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        {t('search.results.empty')}
                      </div>
                    );
                  }
                  
                  if (matches.length > 0) {
                    return (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          {t('search.results.found', { count: matches.length })}
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {matches.map((match: SearchMatch, index: number) => (
                            <div
                              key={index}
                              className={cn(
                                'text-xs p-2 rounded cursor-pointer hover:bg-accent',
                                index === currentIndex && 'bg-accent'
                              )}
                              onClick={() => {
                                const editor = win.__MONACO_EDITOR_INSTANCE__;
                                if (editor) {
                                  editor.setPosition({ lineNumber: match.lineNumber, column: match.startIndex });
                                  editor.revealLineInCenter(match.lineNumber);
                                  searchStore.setCurrentMatchIndex(index);
                                }
                              }}
                            >
                              {match.lineNumber}: {match.text.substring(0, 50)}
                              {match.text.length > 50 ? '...' : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                })()}
              </div>
            </ScrollArea>

            {/* アクションボタン */}
            <div className="flex justify-end gap-2 p-3 border-t bg-muted/50">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('search.actions.cancel')}
              </Button>
              {showReplace && onReplace ? (
                <Button onClick={handleReplace}>
                  {t('search.actions.replace')}
                </Button>
              ) : (
                <Button onClick={handleSearch}>
                  {t('search.actions.search')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
