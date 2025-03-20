import type { EditorFile, HistoryState } from '../types/editor';

/**
 * Creates a new editor file with default values
 */
export const createEditorFile = (name: string, content: string): EditorFile => ({
  id: crypto.randomUUID(),
  name,
  content,
  isDirty: false,
  encoding: 'utf-8',
  lineEnding: 'lf',
});

/**
 * Updates the content of a file and marks it as dirty
 */
export const updateFileContent = (file: EditorFile, newContent: string): EditorFile => 
  file.content === newContent ? file : {
    ...file,
    content: newContent,
    isDirty: true,
  };

/**
 * Creates a new history state
 */
export const createHistoryState = (): HistoryState => ({
  past: [],
  future: [],
  totalEntries: 0,
});

/**
 * Maximum number of history entries to keep
 */
const MAX_HISTORY_LENGTH = 100;

/**
 * Updates history state for undo operation
 */
export const updateHistoryForUndo = (
  currentContent: string,
  history: HistoryState
): HistoryState => {
  if (history.past.length === 0) return history;
  
  const previousContent = history.past[history.past.length - 1];
  if (previousContent === currentContent) return history;

  return {
    past: history.past.slice(0, -1),
    future: [currentContent, ...history.future].slice(0, MAX_HISTORY_LENGTH),
    totalEntries: history.totalEntries,
  };
};

/**
 * Updates history state for redo operation
 */
export const updateHistoryForRedo = (
  currentContent: string,
  history: HistoryState
): HistoryState => {
  if (history.future.length === 0) return history;
  
  const nextContent = history.future[0];
  if (nextContent === currentContent) return history;

  return {
    past: [...history.past, currentContent].slice(-MAX_HISTORY_LENGTH),
    future: history.future.slice(1),
    totalEntries: history.totalEntries,
  };
}; 