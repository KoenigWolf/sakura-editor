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
  secondaryEditorInstance: editor.IStandaloneCodeEditor | null;
  statusInfo: StatusInfo;
  setEditorInstance: (instance: editor.IStandaloneCodeEditor | null) => void;
  setSecondaryEditorInstance: (instance: editor.IStandaloneCodeEditor | null) => void;
  getEditorInstance: () => editor.IStandaloneCodeEditor | null;
  getSecondaryEditorInstance: () => editor.IStandaloneCodeEditor | null;
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

let pendingUpdate: Partial<StatusInfo> | null = null;
let rafId: number | null = null;

export const useEditorInstanceStore = create<EditorInstanceStore>((set, get) => ({
  editorInstance: null,
  secondaryEditorInstance: null,
  statusInfo: defaultStatusInfo,

  setEditorInstance: (instance) => {
    set({ editorInstance: instance });
  },

  setSecondaryEditorInstance: (instance) => {
    set({ secondaryEditorInstance: instance });
  },

  getEditorInstance: () => {
    return get().editorInstance;
  },

  getSecondaryEditorInstance: () => {
    return get().secondaryEditorInstance;
  },

  updateStatusInfo: (info) => {
    if (pendingUpdate) {
      pendingUpdate = { ...pendingUpdate, ...info };
    } else {
      pendingUpdate = info;
    }

    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      if (!pendingUpdate) {
        rafId = null;
        return;
      }

      const current = get().statusInfo;
      const hasChanges = Object.entries(pendingUpdate).some(
        ([key, value]) => current[key as keyof StatusInfo] !== value
      );

      if (hasChanges) {
        const update = pendingUpdate;
        set((state) => ({
          statusInfo: { ...state.statusInfo, ...update },
        }));
      }

      pendingUpdate = null;
      rafId = null;
    });
  },
}));
