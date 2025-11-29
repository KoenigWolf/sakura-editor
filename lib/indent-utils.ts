import type { editor } from 'monaco-editor';
import type { IndentSettings } from '@/lib/store/indent-store';

type Monaco = typeof import('monaco-editor');

export interface IndentResult {
  success: boolean;
  affectedLines: number;
}

const createIndentString = (settings: IndentSettings): string => {
  if (settings.useSpaces) {
    return ' '.repeat(settings.indentSize);
  }
  return '\t';
};

const getLineIndentation = (line: string): { count: number; text: string } => {
  const match = line.match(/^(\s*)/);
  if (match) {
    return { count: match[1].length, text: match[1] };
  }
  return { count: 0, text: '' };
};

export const indentLines = (
  editor: editor.IStandaloneCodeEditor,
  settings: IndentSettings
): IndentResult => {
  const model = editor.getModel();
  const selection = editor.getSelection();

  if (!model || !selection) {
    return { success: false, affectedLines: 0 };
  }

  const startLine = selection.startLineNumber;
  const endLine = selection.endLineNumber;
  const indentStr = createIndentString(settings);
  const edits: editor.IIdentifiedSingleEditOperation[] = [];

  for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
    const lineContent = model.getLineContent(lineNum);

    if (lineContent.trim().length === 0 && startLine !== endLine) {
      continue;
    }

    edits.push({
      range: {
        startLineNumber: lineNum,
        startColumn: 1,
        endLineNumber: lineNum,
        endColumn: 1,
      },
      text: indentStr,
    });
  }

  if (edits.length > 0) {
    editor.executeEdits('indent', edits);
    return { success: true, affectedLines: edits.length };
  }

  return { success: false, affectedLines: 0 };
};

export const outdentLines = (
  editor: editor.IStandaloneCodeEditor,
  settings: IndentSettings
): IndentResult => {
  const model = editor.getModel();
  const selection = editor.getSelection();

  if (!model || !selection) {
    return { success: false, affectedLines: 0 };
  }

  const startLine = selection.startLineNumber;
  const endLine = selection.endLineNumber;
  const indentSize = settings.useSpaces ? settings.indentSize : 1;
  const edits: editor.IIdentifiedSingleEditOperation[] = [];

  for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
    const lineContent = model.getLineContent(lineNum);
    const { count, text } = getLineIndentation(lineContent);

    if (count === 0) continue;

    let removeCount = 0;
    if (settings.useSpaces) {
      removeCount = Math.min(indentSize, count);
      for (let i = 0; i < removeCount; i++) {
        if (text[i] === '\t') {
          removeCount = i + 1;
          break;
        }
      }
    } else {
      if (text[0] === '\t') {
        removeCount = 1;
      } else {
        removeCount = Math.min(indentSize, count);
      }
    }

    if (removeCount > 0) {
      edits.push({
        range: {
          startLineNumber: lineNum,
          startColumn: 1,
          endLineNumber: lineNum,
          endColumn: removeCount + 1,
        },
        text: '',
      });
    }
  }

  if (edits.length > 0) {
    editor.executeEdits('outdent', edits);
    return { success: true, affectedLines: edits.length };
  }

  return { success: false, affectedLines: 0 };
};

export const applyFirstLineIndent = (
  editor: editor.IStandaloneCodeEditor,
  settings: IndentSettings
): IndentResult => {
  const model = editor.getModel();
  const position = editor.getPosition();

  if (!model || !position) {
    return { success: false, affectedLines: 0 };
  }

  const lineNum = position.lineNumber;
  const lineContent = model.getLineContent(lineNum);
  const { count } = getLineIndentation(lineContent);

  const targetIndent = Math.max(0, Math.round(settings.firstLineIndent / 0.127));
  const currentIndent = settings.useSpaces ? count : count * settings.indentSize;

  if (targetIndent === currentIndent) {
    return { success: false, affectedLines: 0 };
  }

  const newIndentStr = settings.useSpaces
    ? ' '.repeat(targetIndent)
    : '\t'.repeat(Math.ceil(targetIndent / settings.indentSize));

  editor.executeEdits('firstLineIndent', [{
    range: {
      startLineNumber: lineNum,
      startColumn: 1,
      endLineNumber: lineNum,
      endColumn: count + 1,
    },
    text: newIndentStr,
  }]);

  return { success: true, affectedLines: 1 };
};

export const applyParagraphIndent = (
  editor: editor.IStandaloneCodeEditor,
  settings: IndentSettings,
  monaco: Monaco
): IndentResult => {
  const model = editor.getModel();
  const selection = editor.getSelection();

  if (!model || !selection) {
    return { success: false, affectedLines: 0 };
  }

  const startLine = selection.startLineNumber;
  const endLine = selection.endLineNumber;
  const edits: editor.IIdentifiedSingleEditOperation[] = [];

  const paragraphs = findParagraphs(model, startLine, endLine);

  for (const para of paragraphs) {
    const firstLineIndent = Math.max(0, Math.round((settings.leftMargin + settings.firstLineIndent) / 0.127));
    const hangingIndent = Math.max(0, Math.round((settings.leftMargin + settings.hangingIndent) / 0.127));

    for (let lineNum = para.start; lineNum <= para.end; lineNum++) {
      const lineContent = model.getLineContent(lineNum);
      const { count } = getLineIndentation(lineContent);
      const isFirstLine = lineNum === para.start;
      const targetIndent = isFirstLine ? firstLineIndent : hangingIndent;

      const newIndentStr = settings.useSpaces
        ? ' '.repeat(targetIndent)
        : '\t'.repeat(Math.ceil(targetIndent / settings.indentSize));

      edits.push({
        range: {
          startLineNumber: lineNum,
          startColumn: 1,
          endLineNumber: lineNum,
          endColumn: count + 1,
        },
        text: newIndentStr,
      });
    }
  }

  if (edits.length > 0) {
    editor.executeEdits('paragraphIndent', edits);
    return { success: true, affectedLines: edits.length };
  }

  return { success: false, affectedLines: 0 };
};

interface ParagraphRange {
  start: number;
  end: number;
}

const findParagraphs = (
  model: editor.ITextModel,
  startLine: number,
  endLine: number
): ParagraphRange[] => {
  const paragraphs: ParagraphRange[] = [];
  let paraStart = startLine;

  for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
    const lineContent = model.getLineContent(lineNum);
    const isEmpty = lineContent.trim().length === 0;

    if (isEmpty) {
      if (lineNum > paraStart) {
        paragraphs.push({ start: paraStart, end: lineNum - 1 });
      }
      paraStart = lineNum + 1;
    } else if (lineNum === endLine) {
      paragraphs.push({ start: paraStart, end: lineNum });
    }
  }

  return paragraphs;
};

export const insertTabAtPosition = (
  editor: editor.IStandaloneCodeEditor,
  settings: IndentSettings
): boolean => {
  const position = editor.getPosition();
  const model = editor.getModel();

  if (!position || !model) {
    return false;
  }

  const lineContent = model.getLineContent(position.lineNumber);
  const lineStartContent = lineContent.substring(0, position.column - 1);

  const textWidthApprox = lineStartContent.length * 0.127;

  let nextTabStop = settings.defaultTabStop;
  for (const tabStop of settings.tabStops) {
    if (tabStop > textWidthApprox) {
      nextTabStop = tabStop;
      break;
    }
  }

  const spacesToInsert = Math.max(1, Math.round((nextTabStop - textWidthApprox) / 0.127));
  const insertText = settings.useSpaces ? ' '.repeat(spacesToInsert) : '\t';

  editor.executeEdits('insertTab', [{
    range: {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    },
    text: insertText,
  }]);

  return true;
};

export const removeTabAtPosition = (
  editor: editor.IStandaloneCodeEditor,
  settings: IndentSettings
): boolean => {
  const position = editor.getPosition();
  const model = editor.getModel();

  if (!position || !model) {
    return false;
  }

  const lineContent = model.getLineContent(position.lineNumber);
  const beforeCursor = lineContent.substring(0, position.column - 1);

  if (beforeCursor.length === 0) {
    return false;
  }

  let removeCount = 0;
  for (let i = beforeCursor.length - 1; i >= 0 && removeCount < settings.indentSize; i--) {
    const char = beforeCursor[i];
    if (char === ' ') {
      removeCount++;
    } else if (char === '\t') {
      removeCount = beforeCursor.length - i;
      break;
    } else {
      break;
    }
  }

  if (removeCount > 0) {
    editor.executeEdits('removeTab', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column - removeCount,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      },
      text: '',
    }]);
    return true;
  }

  return false;
};

export const calculateVisualIndent = (
  settings: IndentSettings,
  charWidth: number
): { leftMargin: number; firstLine: number; hanging: number; rightMargin: number } => {
  const cmToPixels = (cm: number) => cm * 37.795275591;

  return {
    leftMargin: cmToPixels(settings.leftMargin),
    firstLine: cmToPixels(settings.leftMargin + settings.firstLineIndent),
    hanging: cmToPixels(settings.leftMargin + settings.hangingIndent),
    rightMargin: cmToPixels(settings.rightMargin),
  };
};
