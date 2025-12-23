'use client';

import { useCallback, useRef } from 'react';
import type { editor } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSearchStore, type SearchMatch } from '@/lib/store/search-store';
import { validateSearchQuery, escapeRegExp } from '@/lib/security';
import { useAnnouncerStore } from '@/lib/store/announcer-store';

export interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
}

export const useSearchLogic = (
  onSearch: (query: string, options: SearchOptions) => void,
  onReplace?: (query: string, replacement: string, options: SearchOptions) => void
) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getEditorInstance } = useEditorInstanceStore();
  const {
    matches,
    currentMatchIndex,
    setMatches,
    setCurrentMatchIndex,
    setSearchTerm,
    isRegex,
    isCaseSensitive,
    isWholeWord,
    setIsRegex,
    setIsCaseSensitive,
    setIsWholeWord,
  } = useSearchStore();
  const announce = useAnnouncerStore((state) => state.announce);

  const decorationsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const options: SearchOptions = {
    caseSensitive: isCaseSensitive,
    useRegex: isRegex,
    wholeWord: isWholeWord,
  };

  const applyHighlights = useCallback(
    (matchList: SearchMatch[], activeIndex: number) => {
      const editorInstance = getEditorInstance();
      if (!editorInstance) return;

      const decorations = matchList.map((match, index) => ({
        range: {
          startLineNumber: match.lineNumber,
          startColumn: match.startIndex,
          endLineNumber: match.lineNumber,
          endColumn: match.endIndex,
        },
        options: {
          inlineClassName: index === activeIndex ? 'search-match-active' : 'search-match-highlight',
        },
      }));

      if (!decorationsCollectionRef.current) {
        decorationsCollectionRef.current = editorInstance.createDecorationsCollection(decorations);
      } else {
        decorationsCollectionRef.current.set(decorations);
      }
    },
    [getEditorInstance]
  );

  const clearHighlights = useCallback(() => {
    if (decorationsCollectionRef.current) {
      decorationsCollectionRef.current.clear();
    }
  }, []);

  const goToMatch = useCallback(
    (index: number, targetMatches?: SearchMatch[]) => {
      const editor = getEditorInstance();
      if (!editor) return;

      const list = targetMatches || matches;
      if (list.length === 0) return;

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
    },
    [applyHighlights, getEditorInstance, matches, setCurrentMatchIndex]
  );

  const performSearch = useCallback(
    (searchQuery: string, immediate = false) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      const doSearch = () => {
        if (!searchQuery) {
          setMatches([]);
          setCurrentMatchIndex(-1);
          clearHighlights();
          return;
        }

        const validation = validateSearchQuery(searchQuery, isRegex);
        if (!validation.valid) {
          toast({
            title: t('error.fileError'),
            description: validation.error,
            variant: 'destructive',
          });
          setMatches([]);
          setCurrentMatchIndex(-1);
          clearHighlights();
          return;
        }

        const editor = getEditorInstance();
        if (!editor) return;

        const model = editor.getModel();
        if (!model) return;

        try {
          const isRegexMode = isRegex || isWholeWord;

          let searchString: string;
          if (isRegex) {
            searchString = searchQuery;
          } else if (isWholeWord) {
            searchString = `\\b${escapeRegExp(searchQuery)}\\b`;
          } else {
            searchString = searchQuery;
          }

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
          setSearchTerm(searchQuery);

          if (parsedMatches.length > 0) {
            goToMatch(0, parsedMatches);
            announce(t('search.found', { count: parsedMatches.length }));
          } else {
            setCurrentMatchIndex(-1);
            applyHighlights([], -1);
            announce(t('search.noResults'));
          }

          onSearch(searchQuery, options);
        } catch {
          // Invalid regex - ignore
        }
      };

      if (immediate) {
        doSearch();
      } else {
        searchTimeoutRef.current = setTimeout(doSearch, 100);
      }
    },
    [
      getEditorInstance,
      isRegex,
      isWholeWord,
      isCaseSensitive,
      setMatches,
      setSearchTerm,
      setCurrentMatchIndex,
      goToMatch,
      applyHighlights,
      clearHighlights,
      onSearch,
      options,
      toast,
      t,
      announce,
    ]
  );

  const handleNextMatch = useCallback(
    (query: string) => {
      if (matches.length === 0) {
        performSearch(query, true);
        return;
      }
      goToMatch((currentMatchIndex + 1) % matches.length);
    },
    [currentMatchIndex, goToMatch, matches.length, performSearch]
  );

  const handlePreviousMatch = useCallback(
    (query: string) => {
      if (matches.length === 0) {
        performSearch(query, true);
        return;
      }
      goToMatch(currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1);
    },
    [currentMatchIndex, goToMatch, matches.length, performSearch]
  );

  const handleReplace = useCallback(
    (query: string, replacement: string) => {
      if (!query) return;

      const editor = getEditorInstance();
      if (!editor) return;

      const model = editor.getModel();
      if (!model) return;

      const selection = editor.getSelection();
      if (!selection || selection.isEmpty()) {
        handleNextMatch(query);
        return;
      }

      editor.executeEdits('replace', [{ range: selection, text: replacement }]);

      if (onReplace) {
        onReplace(query, replacement, options);
      }

      performSearch(query, true);
    },
    [getEditorInstance, onReplace, options, performSearch, handleNextMatch]
  );

  const handleReplaceAll = useCallback(
    (query: string, replacement: string) => {
      if (!query) return;

      const editor = getEditorInstance();
      if (!editor) return;

      const model = editor.getModel();
      if (!model) return;

      let searchString: string;
      if (isRegex) {
        searchString = query;
      } else if (isWholeWord) {
        searchString = `\\b${escapeRegExp(query)}\\b`;
      } else {
        searchString = escapeRegExp(query);
      }

      const foundMatches = model.findMatches(
        searchString,
        false,
        true,
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

      if (onReplace) {
        onReplace(query, replacement, options);
      }

      toast({
        title: t('search.replaced', { count }),
        duration: 2000,
      });

      performSearch(query, true);
    },
    [
      isRegex,
      isWholeWord,
      isCaseSensitive,
      getEditorInstance,
      onReplace,
      options,
      performSearch,
      toast,
      t,
    ]
  );

  const cleanup = useCallback(() => {
    clearHighlights();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, [clearHighlights]);

  const resetState = useCallback(() => {
    clearHighlights();
    setMatches([]);
    setCurrentMatchIndex(-1);
  }, [clearHighlights, setMatches, setCurrentMatchIndex]);

  return {
    matches,
    currentMatchIndex,
    options,
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
  };
};
