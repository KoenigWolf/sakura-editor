'use client';

import { useCallback } from 'react';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useIndentStore } from '@/lib/store/indent-store';
import { indentLines, outdentLines } from '@/lib/indent-utils';

export const useEditorActions = () => {
  const getEditorInstance = useEditorInstanceStore((state) => state.getEditorInstance);
  const indentSettings = useIndentStore((state) => state.settings);

  const handleUndo = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;
    editor.trigger('toolbar', 'undo', null);
  }, [getEditorInstance]);

  const handleRedo = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;
    editor.trigger('toolbar', 'redo', null);
  }, [getEditorInstance]);

  const handleIndent = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;
    indentLines(editor, indentSettings);
  }, [getEditorInstance, indentSettings]);

  const handleOutdent = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;
    outdentLines(editor, indentSettings);
  }, [getEditorInstance, indentSettings]);

  return {
    handleUndo,
    handleRedo,
    handleIndent,
    handleOutdent,
  };
};
