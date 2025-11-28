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

// 更新をバッチ化するためのキュー
let pendingUpdate: Partial<StatusInfo> | null = null;
let rafId: number | null = null;

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
    // 更新をマージ
    pendingUpdate = pendingUpdate ? { ...pendingUpdate, ...info } : info;

    // 既にスケジュール済みならスキップ
    if (rafId !== null) return;

    // 次のフレームでバッチ更新
    rafId = requestAnimationFrame(() => {
      if (pendingUpdate) {
        const current = get().statusInfo;
        // 実際に変更がある場合のみ更新
        const hasChanges = Object.entries(pendingUpdate).some(
          ([key, value]) => current[key as keyof StatusInfo] !== value
        );
        if (hasChanges) {
          set((state) => ({
            statusInfo: { ...state.statusInfo, ...pendingUpdate! },
          }));
        }
      }
      pendingUpdate = null;
      rafId = null;
    });
  },
}));
