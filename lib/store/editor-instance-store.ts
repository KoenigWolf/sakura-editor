import { create } from 'zustand';
import type { editor } from 'monaco-editor';

interface StatusInfo {
  cursorLine: number;
  cursorColumn: number;
  lineCount: number;
  charCount: number;
  language: string;
  eol: string;
}

interface EditorInstanceStore {
  editorInstance: editor.IStandaloneCodeEditor | null;
  statusInfo: StatusInfo;
  setEditorInstance: (instance: editor.IStandaloneCodeEditor | null) => void;
  getEditorInstance: () => editor.IStandaloneCodeEditor | null;
  updateStatusInfo: (info: Partial<StatusInfo>) => void;
}

const defaultStatusInfo: StatusInfo = {
  cursorLine: 1,
  cursorColumn: 1,
  lineCount: 0,
  charCount: 0,
  language: 'plaintext',
  eol: 'LF',
};

export const useEditorInstanceStore = create<EditorInstanceStore>((set, get) => ({
  editorInstance: null,
  statusInfo: defaultStatusInfo,

  setEditorInstance: (instance) => {
    set({ editorInstance: instance });
  },

  getEditorInstance: () => {
    return get().editorInstance;
  },

  updateStatusInfo: (info) => {
    set((state) => ({
      statusInfo: { ...state.statusInfo, ...info },
    }));
  },
}));
