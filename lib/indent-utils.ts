import type { editor } from 'monaco-editor';
import type { IndentSettings } from '@/lib/store/indent-store';

interface IndentResult {
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
