/**
 * 検索と置換機能を提供するダイアログコンポーネント
 * サクラエディタの検索・置換ダイアログを再現し、テキスト検索と置換機能を提供する
 */
'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchStore } from '@/lib/store/search-store';
import { cn } from '@/lib/utils';
import type { editor as MonacoEditorType } from 'monaco-editor';

// Monacoエディタのインスタンスを取得するための型定義
interface WindowWithMonaco extends Window {
  __MONACO_EDITOR_INSTANCE__?: MonacoEditorType.IStandaloneCodeEditor;
}

/**
 * 検索位置（前方向/後ろ方向）を指定する型
 */
type SearchDirection = 'forward' | 'backward';

/**
 * 検索マッチ情報を表す型
 */
interface SearchMatch {
  lineNumber: number;
  column: number;
  length: number; // マッチした文字列の長さ
}

/**
 * 検索用正規表現を作成するヘルパー関数
 *
 * @param term - 検索する文字列
 * @param isCaseSensitive - 大文字小文字を区別するか
 * @param isWholeWord - 単語単位で検索するか
 * @returns 検索用のRegExpオブジェクト
 */
const createSearchRegex = (
  term: string, 
  isCaseSensitive: boolean,
  isWholeWord: boolean
): RegExp => {
  // 特殊文字をエスケープ
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 単語境界を追加（単語単位検索の場合）
  const pattern = isWholeWord ? `\\b${escapedTerm}\\b` : escapedTerm;
  // フラグを設定
  const flags = isCaseSensitive ? 'g' : 'gi';
  
  return new RegExp(pattern, flags);
};

export function SearchDialog() {
  const { t } = useTranslation();
  const {
    isOpen,
    searchTerm,
    replaceText,
    isCaseSensitive,
    isWholeWord,
    setIsOpen,
    setSearchTerm,
    setReplaceText,
    setIsCaseSensitive,
    setIsWholeWord,
  } = useSearchStore();
  
  // エディタとダイアログの状態管理
  const [editorInstance, setEditorInstance] = useState<MonacoEditorType.IStandaloneCodeEditor | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'search' | 'replace'>('search');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  /**
   * モナコエディターのインスタンスを取得
   */
  useEffect(() => {
    const win = window as WindowWithMonaco;
    const activeEditor = win.__MONACO_EDITOR_INSTANCE__;
    if (activeEditor) {
      setEditorInstance(activeEditor);
    }
  }, []);

  /**
   * 検索ダイアログが開かれたときに初期位置を設定
   */
  useEffect(() => {
    if (isOpen) {
      // ダイアログが表示された後にサイズを取得するため、setTimeout を使用
      setTimeout(() => {
        if (!dialogRef.current) return;
        
        const rect = dialogRef.current.getBoundingClientRect();
        const dialogWidth = rect.width;
        const dialogHeight = rect.height;
        
        // 画面の中央に配置
        const x = (window.innerWidth - dialogWidth) / 2;
        const y = (window.innerHeight - dialogHeight) / 2;
        
        // 画面からはみ出さないように調整
        const adjustedX = Math.max(0, Math.min(x, window.innerWidth - dialogWidth - 20));
        const adjustedY = Math.max(0, Math.min(y, window.innerHeight - dialogHeight - 20));
        
        setPosition({ x: adjustedX, y: adjustedY });
        
        // エディタがアクティブな場合、現在選択されているテキストを検索ボックスに設定
        if (editorInstance) {
          const selection = editorInstance.getSelection();
          if (selection && !selection.isEmpty()) {
            const selectedText = editorInstance.getModel()?.getValueInRange(selection);
            if (selectedText && selectedText.length > 0) {
              setSearchTerm(selectedText);
            }
          }
        }
      }, 50);
    }
  }, [isOpen, editorInstance, setSearchTerm]);

  /**
   * ウィンドウサイズ変更時に検索ダイアログの位置を調整
   */
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && dialogRef.current) {
        const rect = dialogRef.current.getBoundingClientRect();
        
        // 画面外にはみ出していないか確認し、必要に応じて位置を調整
        let newX = position.x;
        let newY = position.y;
        
        if (newX + rect.width > window.innerWidth) {
          newX = Math.max(0, window.innerWidth - rect.width - 20);
        }
        
        if (newY + rect.height > window.innerHeight) {
          newY = Math.max(0, window.innerHeight - rect.height - 20);
        }
        
        if (newX !== position.x || newY !== position.y) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, position]);

  /**
   * 文書内の全マッチを検索し、結果を保存する
   */
  const findAllMatches = useCallback(() => {
    if (!editorInstance || !searchTerm) {
      setMatches([]);
      setMatchCount(0);
      setCurrentMatchIndex(-1);
      return [];
    }

    const model = editorInstance.getModel();
    if (!model) {
      setMatches([]);
      setMatchCount(0);
      setCurrentMatchIndex(-1);
      return [];
    }

    // 検索用正規表現を作成
    const searchRegex = createSearchRegex(searchTerm, isCaseSensitive, isWholeWord);

    const newMatches: SearchMatch[] = [];
    const text = model.getValue();
    
    // 正規表現を使った検索
    let execResult: RegExpExecArray | null;
    searchRegex.lastIndex = 0; // 検索開始位置をリセット
    
    // 検索結果をすべて処理
    while ((execResult = searchRegex.exec(text)) !== null) {
      if (execResult.index !== undefined) {
        const position = model.getPositionAt(execResult.index);
        if (position) {
          newMatches.push({
            lineNumber: position.lineNumber,
            column: position.column,
            length: execResult[0].length
          });
        }
      }
      
      // 無限ループ防止（グローバルフラグがない場合）
      if (searchRegex.lastIndex === 0) {
        break;
      }
    }

    setMatches(newMatches);
    setMatchCount(newMatches.length);
    
    return newMatches;
  }, [editorInstance, searchTerm, isCaseSensitive, isWholeWord]);

  /**
   * カーソル位置を指定のマッチ位置に移動し、テキストを選択する
   */
  const goToMatch = useCallback((match: SearchMatch) => {
    if (!editorInstance) return;
    
    // 該当位置にカーソルを移動し、テキストを選択状態にする
    editorInstance.setSelection({
      startLineNumber: match.lineNumber,
      startColumn: match.column,
      endLineNumber: match.lineNumber,
      endColumn: match.column + match.length
    });
    
    // 選択位置が画面内に表示されるようスクロール
    editorInstance.revealPositionInCenter({
      lineNumber: match.lineNumber,
      column: match.column,
    });
    
    // フォーカスを戻す
    editorInstance.focus();
  }, [editorInstance]);

  /**
   * 検索を実行し、最初のマッチに移動する
   */
  const handleSearch = useCallback(() => {
    if (!searchTerm) return;

    const foundMatches = findAllMatches();
    if (foundMatches.length > 0) {
      setCurrentMatchIndex(0);
      goToMatch(foundMatches[0]);
    }
  }, [searchTerm, findAllMatches, goToMatch]);

  /**
   * 指定方向の次のマッチに移動する
   */
  const goToNextMatch = useCallback((direction: SearchDirection = 'forward') => {
    if (matches.length === 0) {
      handleSearch();
      return;
    }
    
    let nextIndex = currentMatchIndex;
    
    if (direction === 'forward') {
      nextIndex = (currentMatchIndex + 1) % matches.length;
    } else {
      nextIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    }
    
    setCurrentMatchIndex(nextIndex);
    goToMatch(matches[nextIndex]);
  }, [matches, currentMatchIndex, handleSearch, goToMatch]);

  /**
   * 現在選択している文字列を置換する
   */
  const handleReplaceOne = useCallback(() => {
    if (!editorInstance || !searchTerm) return;

    const model = editorInstance.getModel();
    if (!model) return;

    // 現在の選択範囲を取得
    const selection = editorInstance.getSelection();
    if (!selection) return;

    // 選択されたテキストを取得
    const selectedText = model.getValueInRange(selection);
    
    // 選択テキストが検索テキストにマッチするか確認
    const searchRegex = new RegExp(searchTerm, isCaseSensitive ? '' : 'i');
    if (searchRegex.test(selectedText)) {
      // 現在の選択範囲を置換テキストで置き換え
      editorInstance.executeEdits('', [
        {
          range: selection,
          text: replaceText,
          forceMoveMarkers: true
        }
      ]);
      
      // 置換後に再検索して次のマッチに移動
      setTimeout(() => {
        const newMatches = findAllMatches();
        if (newMatches.length > 0) {
          // 現在のインデックスが有効範囲内かチェック
          const validIndex = Math.min(currentMatchIndex, newMatches.length - 1);
          if (validIndex >= 0) {
            setCurrentMatchIndex(validIndex);
            goToMatch(newMatches[validIndex]);
          }
        }
      }, 0);
    } else {
      // マッチしていない場合は、次のマッチを検索
      goToNextMatch();
    }
  }, [editorInstance, searchTerm, isCaseSensitive, replaceText, currentMatchIndex, findAllMatches, goToMatch, goToNextMatch]);

  /**
   * 全てのマッチを置換する
   */
  const handleReplaceAll = useCallback(() => {
    if (!editorInstance || !searchTerm) return;

    const model = editorInstance.getModel();
    if (!model) return;

    const searchRegex = createSearchRegex(searchTerm, isCaseSensitive, isWholeWord);
    const text = model.getValue();
    const newText = text.replace(searchRegex, replaceText);
    
    // 変更があった場合のみモデルを更新
    if (text !== newText) {
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: newText
          }
        ],
        () => null
      );
      
      // 置換後に再検索
      setTimeout(() => {
        findAllMatches();
      }, 0);
    }
  }, [editorInstance, searchTerm, isCaseSensitive, isWholeWord, replaceText, findAllMatches]);

  /**
   * Enterキーで検索を実行
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Enterで前方向検索
        goToNextMatch('backward');
      } else {
        // Enterで通常検索（次へ）
        goToNextMatch('forward');
      }
    } else if (e.key === 'F3') {
      e.preventDefault();
      if (e.shiftKey) {
        goToNextMatch('backward');
      } else {
        goToNextMatch('forward');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  }, [goToNextMatch, setIsOpen]);

  /**
   * ドラッグ開始処理
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.dialog-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  /**
   * ドラッグ中の移動処理
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      // ツールバーの高さを考慮
      const toolbarHeight = 40;
      
      // 画面の境界を超えないように調整
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - (dialogRef.current?.offsetWidth || 300)));
      const newY = Math.max(toolbarHeight, Math.min(e.clientY - dragStart.y, window.innerHeight - (dialogRef.current?.offsetHeight || 200)));
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  }, [isDragging, dragStart]);

  /**
   * ドラッグ終了処理
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        ref={dialogRef}
        className={cn(
          "fixed p-3 shadow-lg border border-input rounded-md search-dialog",
          isDragging && "cursor-grabbing"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '380px',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="dialog-header flex items-center justify-between mb-2 bg-muted py-1 px-2 rounded-sm">
          <h3 className="text-sm font-medium">{t('search.title')}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 rounded-full text-xs"
          >
            ×
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'search' | 'replace')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="search">検索</TabsTrigger>
            <TabsTrigger value="replace">置換</TabsTrigger>
          </TabsList>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="search" className="w-16 text-xs">検索文字列:</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="検索する文字列を入力"
                className="h-7 text-sm"
                autoFocus
              />
            </div>

            {activeTab === 'replace' && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="replace" className="w-16 text-xs">置換文字列:</Label>
                <Input
                  id="replace"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="置換する文字列を入力"
                  className="h-7 text-sm"
                />
              </div>
            )}

            <div className="flex items-center space-x-4 px-2">
              <div className="flex items-center space-x-1">
                <Checkbox
                  id="caseSensitive"
                  checked={isCaseSensitive}
                  onCheckedChange={(checked) => setIsCaseSensitive(checked as boolean)}
                  className="h-3 w-3"
                />
                <Label htmlFor="caseSensitive" className="text-xs">大小区別</Label>
              </div>

              <div className="flex items-center space-x-1">
                <Checkbox
                  id="wholeWord"
                  checked={isWholeWord}
                  onCheckedChange={(checked) => setIsWholeWord(checked as boolean)}
                  className="h-3 w-3"
                />
                <Label htmlFor="wholeWord" className="text-xs">単語単位</Label>
              </div>
            </div>

            {matchCount > 0 && (
              <div className="text-xs text-center text-muted-foreground">
                {currentMatchIndex + 1}/{matchCount}件 見つかりました
              </div>
            )}

            <div className="flex justify-between gap-1 mt-3">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handleSearch()}
                className="text-xs h-7"
              >
                検索
              </Button>
              
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => goToNextMatch('backward')}
                  className="text-xs h-7 px-2"
                  disabled={matches.length === 0}
                >
                  ↑
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => goToNextMatch('forward')}
                  className="text-xs h-7 px-2"
                  disabled={matches.length === 0}
                >
                  ↓
                </Button>
              </div>
              
              {activeTab === 'replace' && (
                <>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleReplaceOne}
                    className="text-xs h-7"
                    disabled={matches.length === 0}
                  >
                    置換
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleReplaceAll}
                    className="text-xs h-7"
                  >
                    すべて置換
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="text-xs h-7"
              >
                閉じる
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
