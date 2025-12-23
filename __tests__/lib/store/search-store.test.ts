import { describe, it, expect, beforeEach } from 'vitest';
import { useSearchStore, type SearchMatch } from '@/lib/store/search-store';

describe('SearchStore', () => {
  beforeEach(() => {
    useSearchStore.setState({
      isOpen: false,
      searchTerm: '',
      replaceText: '',
      isRegex: false,
      isCaseSensitive: false,
      isWholeWord: false,
      matches: [],
      currentMatchIndex: -1,
    });
  });

  describe('初期状態', () => {
    it('デフォルト値が正しく設定されている', () => {
      const state = useSearchStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.searchTerm).toBe('');
      expect(state.replaceText).toBe('');
      expect(state.isRegex).toBe(false);
      expect(state.isCaseSensitive).toBe(false);
      expect(state.isWholeWord).toBe(false);
      expect(state.matches).toEqual([]);
      expect(state.currentMatchIndex).toBe(-1);
    });
  });

  describe('setIsOpen', () => {
    it('検索ダイアログの表示状態を変更できる', () => {
      useSearchStore.getState().setIsOpen(true);
      expect(useSearchStore.getState().isOpen).toBe(true);

      useSearchStore.getState().setIsOpen(false);
      expect(useSearchStore.getState().isOpen).toBe(false);
    });
  });

  describe('setSearchTerm', () => {
    it('検索語を設定できる', () => {
      useSearchStore.getState().setSearchTerm('hello');
      expect(useSearchStore.getState().searchTerm).toBe('hello');
    });
  });

  describe('setReplaceText', () => {
    it('置換テキストを設定できる', () => {
      useSearchStore.getState().setReplaceText('world');
      expect(useSearchStore.getState().replaceText).toBe('world');
    });
  });

  describe('検索オプション', () => {
    it('正規表現オプションを切り替えられる', () => {
      useSearchStore.getState().setIsRegex(true);
      expect(useSearchStore.getState().isRegex).toBe(true);
    });

    it('大文字小文字区別オプションを切り替えられる', () => {
      useSearchStore.getState().setIsCaseSensitive(true);
      expect(useSearchStore.getState().isCaseSensitive).toBe(true);
    });

    it('単語単位検索オプションを切り替えられる', () => {
      useSearchStore.getState().setIsWholeWord(true);
      expect(useSearchStore.getState().isWholeWord).toBe(true);
    });
  });

  describe('マッチ操作', () => {
    const sampleMatches: SearchMatch[] = [
      { lineNumber: 1, startIndex: 0, endIndex: 5, text: 'hello' },
      { lineNumber: 3, startIndex: 10, endIndex: 15, text: 'hello' },
      { lineNumber: 5, startIndex: 20, endIndex: 25, text: 'hello' },
    ];

    it('マッチ結果を設定できる', () => {
      useSearchStore.getState().setMatches(sampleMatches);
      expect(useSearchStore.getState().matches).toEqual(sampleMatches);
    });

    it('currentMatchIndexを設定できる', () => {
      useSearchStore.getState().setMatches(sampleMatches);
      useSearchStore.getState().setCurrentMatchIndex(1);
      expect(useSearchStore.getState().currentMatchIndex).toBe(1);
    });
  });

  describe('nextMatch', () => {
    const sampleMatches: SearchMatch[] = [
      { lineNumber: 1, startIndex: 0, endIndex: 5, text: 'hello' },
      { lineNumber: 3, startIndex: 10, endIndex: 15, text: 'hello' },
      { lineNumber: 5, startIndex: 20, endIndex: 25, text: 'hello' },
    ];

    it('次のマッチに移動できる', () => {
      useSearchStore.getState().setMatches(sampleMatches);
      useSearchStore.getState().setCurrentMatchIndex(0);

      useSearchStore.getState().nextMatch();
      expect(useSearchStore.getState().currentMatchIndex).toBe(1);

      useSearchStore.getState().nextMatch();
      expect(useSearchStore.getState().currentMatchIndex).toBe(2);
    });

    it('最後のマッチから最初に戻る', () => {
      useSearchStore.getState().setMatches(sampleMatches);
      useSearchStore.getState().setCurrentMatchIndex(2);

      useSearchStore.getState().nextMatch();
      expect(useSearchStore.getState().currentMatchIndex).toBe(0);
    });

    it('マッチがない場合は何もしない', () => {
      useSearchStore.getState().setMatches([]);
      useSearchStore.getState().setCurrentMatchIndex(-1);

      useSearchStore.getState().nextMatch();
      expect(useSearchStore.getState().currentMatchIndex).toBe(-1);
    });
  });

  describe('previousMatch', () => {
    const sampleMatches: SearchMatch[] = [
      { lineNumber: 1, startIndex: 0, endIndex: 5, text: 'hello' },
      { lineNumber: 3, startIndex: 10, endIndex: 15, text: 'hello' },
      { lineNumber: 5, startIndex: 20, endIndex: 25, text: 'hello' },
    ];

    it('前のマッチに移動できる', () => {
      useSearchStore.getState().setMatches(sampleMatches);
      useSearchStore.getState().setCurrentMatchIndex(2);

      useSearchStore.getState().previousMatch();
      expect(useSearchStore.getState().currentMatchIndex).toBe(1);

      useSearchStore.getState().previousMatch();
      expect(useSearchStore.getState().currentMatchIndex).toBe(0);
    });

    it('最初のマッチから最後に戻る', () => {
      useSearchStore.getState().setMatches(sampleMatches);
      useSearchStore.getState().setCurrentMatchIndex(0);

      useSearchStore.getState().previousMatch();
      expect(useSearchStore.getState().currentMatchIndex).toBe(2);
    });

    it('マッチがない場合は何もしない', () => {
      useSearchStore.getState().setMatches([]);
      useSearchStore.getState().setCurrentMatchIndex(-1);

      useSearchStore.getState().previousMatch();
      expect(useSearchStore.getState().currentMatchIndex).toBe(-1);
    });
  });

  describe('reset', () => {
    it('検索状態をリセットできる', () => {
      useSearchStore.getState().setSearchTerm('hello');
      useSearchStore.getState().setReplaceText('world');
      useSearchStore
        .getState()
        .setMatches([{ lineNumber: 1, startIndex: 0, endIndex: 5, text: 'hello' }]);
      useSearchStore.getState().setCurrentMatchIndex(0);

      useSearchStore.getState().reset();

      const state = useSearchStore.getState();
      expect(state.searchTerm).toBe('');
      expect(state.replaceText).toBe('');
      expect(state.matches).toEqual([]);
      expect(state.currentMatchIndex).toBe(-1);
    });

    it('オプションはリセットされない', () => {
      useSearchStore.getState().setIsRegex(true);
      useSearchStore.getState().setIsCaseSensitive(true);

      useSearchStore.getState().reset();

      expect(useSearchStore.getState().isRegex).toBe(true);
      expect(useSearchStore.getState().isCaseSensitive).toBe(true);
    });
  });
});
