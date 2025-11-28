import { create } from 'zustand';
import type { editor } from 'monaco-editor';

interface EditorInstanceStore {
  editorInstance: editor.IStandaloneCodeEditor | null;
  setEditorInstance: (instance: editor.IStandaloneCodeEditor | null) => void;
  getEditorInstance: () => editor.IStandaloneCodeEditor | null;
}

export const useEditorInstanceStore = create<EditorInstanceStore>((set, get) => ({
  editorInstance: null,

  setEditorInstance: (instance) => {
    set({ editorInstance: instance });
  },

  getEditorInstance: () => {
    return get().editorInstance;
  },
}));
