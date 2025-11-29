'use client';

import { create } from 'zustand';

export type SplitDirection = 'horizontal' | 'vertical' | null;

interface SplitViewState {
  splitDirection: SplitDirection;
  splitRatio: number;
  secondaryFileId: string | null;
  setSplitDirection: (direction: SplitDirection) => void;
  setSplitRatio: (ratio: number) => void;
  setSecondaryFileId: (fileId: string | null) => void;
  toggleSplit: () => void;
  closeSplit: () => void;
}

export const useSplitViewStore = create<SplitViewState>((set, get) => ({
  splitDirection: null,
  splitRatio: 0.5,
  secondaryFileId: null,

  setSplitDirection: (direction) => set({ splitDirection: direction }),

  setSplitRatio: (ratio) => set({ splitRatio: Math.max(0.2, Math.min(0.8, ratio)) }),

  setSecondaryFileId: (fileId) => set({ secondaryFileId: fileId }),

  toggleSplit: () => {
    const { splitDirection } = get();

    // スプリットモードでない場合は縦分割を開始
    if (splitDirection === null) {
      set({ splitDirection: 'vertical' });
      return;
    }

    // 縦分割の場合は横分割に切り替え
    if (splitDirection === 'vertical') {
      set({ splitDirection: 'horizontal' });
      return;
    }

    // 横分割の場合はスプリットを閉じる
    set({ splitDirection: null, secondaryFileId: null });
  },

  closeSplit: () => set({ splitDirection: null, secondaryFileId: null }),
}));
