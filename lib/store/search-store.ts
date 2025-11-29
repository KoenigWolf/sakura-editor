import { create } from 'zustand';

export interface SearchMatch {
  lineNumber: number;
  startIndex: number;
  endIndex: number;
  text: string;
}

interface SearchStore {
  isOpen: boolean;
  searchTerm: string;
  replaceText: string;
  isRegex: boolean;
  isCaseSensitive: boolean;
  isWholeWord: boolean;
  matches: SearchMatch[];
  currentMatchIndex: number;
  setIsOpen: (isOpen: boolean) => void;
  setSearchTerm: (term: string) => void;
  setReplaceText: (text: string) => void;
  setIsRegex: (isRegex: boolean) => void;
  setIsCaseSensitive: (isCaseSensitive: boolean) => void;
  setIsWholeWord: (isWholeWord: boolean) => void;
  setMatches: (matches: SearchMatch[]) => void;
  setCurrentMatchIndex: (index: number) => void;
  nextMatch: () => void;
  previousMatch: () => void;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  isOpen: false,
  searchTerm: '',
  replaceText: '',
  isRegex: false,
  isCaseSensitive: false,
  isWholeWord: false,
  matches: [],
  currentMatchIndex: -1,

  setIsOpen: (isOpen) => set({ isOpen }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setReplaceText: (text) => set({ replaceText: text }),
  setIsRegex: (isRegex) => set({ isRegex }),
  setIsCaseSensitive: (isCaseSensitive) => set({ isCaseSensitive }),
  setIsWholeWord: (isWholeWord) => set({ isWholeWord }),
  setMatches: (matches) => set({ matches }),
  setCurrentMatchIndex: (index) => set({ currentMatchIndex: index }),

  nextMatch: () => {
    const { matches, currentMatchIndex } = get();
    // Guard: マッチがない場合は何もしない
    if (matches.length === 0) return;

    const nextIndex = (currentMatchIndex + 1) % matches.length;
    set({ currentMatchIndex: nextIndex });
  },

  previousMatch: () => {
    const { matches, currentMatchIndex } = get();
    // Guard: マッチがない場合は何もしない
    if (matches.length === 0) return;

    // 現在のインデックスが0以下なら最後に戻る
    const isAtStart = currentMatchIndex <= 0;
    const prevIndex = isAtStart ? matches.length - 1 : currentMatchIndex - 1;
    set({ currentMatchIndex: prevIndex });
  },

  reset: () => set({
    searchTerm: '',
    replaceText: '',
    matches: [],
    currentMatchIndex: -1,
  }),
})); 
