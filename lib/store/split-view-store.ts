'use client';

import { create } from 'zustand';

export type SplitDirection = 'horizontal' | 'vertical';

export interface PaneLeaf {
  type: 'leaf';
  id: string;
  fileId: string | null;
}

export interface PaneSplit {
  type: 'split';
  id: string;
  direction: SplitDirection;
  ratio: number;
  first: PaneNode;
  second: PaneNode;
}

export type PaneNode = PaneLeaf | PaneSplit;

const DEFAULT_SPLIT_RATIO = 0.5;
const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;
const INITIAL_PANE_ID = 'pane-initial';

let idCounter = 0;
const generateId = (prefix: string): string =>
  `${prefix}-${++idCounter}-${Math.random().toString(36).slice(2, 6)}`;

const createLeaf = (fileId: string | null = null, id?: string): PaneLeaf => ({
  type: 'leaf',
  id: id ?? generateId('pane'),
  fileId,
});

const createSplit = (
  direction: SplitDirection,
  first: PaneNode,
  second: PaneNode,
  ratio = DEFAULT_SPLIT_RATIO
): PaneSplit => ({
  type: 'split',
  id: generateId('split'),
  direction,
  ratio,
  first,
  second,
});

const mapTree = (node: PaneNode, fn: (n: PaneNode) => PaneNode): PaneNode => {
  const result = fn(node);
  if (result.type === 'split') {
    return {
      ...result,
      first: mapTree(result.first, fn),
      second: mapTree(result.second, fn),
    };
  }
  return result;
};

const findNode = (root: PaneNode, id: string): PaneNode | null => {
  if (root.id === id) return root;
  if (root.type === 'split') {
    return findNode(root.first, id) ?? findNode(root.second, id);
  }
  return null;
};

const findParent = (root: PaneNode, targetId: string): PaneSplit | null => {
  if (root.type !== 'split') return null;
  if (root.first.id === targetId || root.second.id === targetId) return root;
  return findParent(root.first, targetId) ?? findParent(root.second, targetId);
};

const replaceNode = (root: PaneNode, targetId: string, replacement: PaneNode): PaneNode => {
  if (root.id === targetId) return replacement;
  if (root.type === 'split') {
    return {
      ...root,
      first: replaceNode(root.first, targetId, replacement),
      second: replaceNode(root.second, targetId, replacement),
    };
  }
  return root;
};

const countLeaves = (node: PaneNode): number =>
  node.type === 'leaf' ? 1 : countLeaves(node.first) + countLeaves(node.second);

const getFirstLeaf = (node: PaneNode): PaneLeaf =>
  node.type === 'leaf' ? node : getFirstLeaf(node.first);

const getAllLeaves = (node: PaneNode): PaneLeaf[] => {
  if (node.type === 'leaf') return [node];
  return [...getAllLeaves(node.first), ...getAllLeaves(node.second)];
};

interface SplitViewState {
  root: PaneNode;
  activePaneId: string;

  splitPane: (
    paneId: string,
    direction: SplitDirection,
    newFileId?: string | null
  ) => string | null;
  closePane: (paneId: string) => void;
  setRatio: (splitId: string, ratio: number) => void;
  setPaneFile: (paneId: string, fileId: string | null) => void;
  setActivePane: (paneId: string) => void;
  reset: () => void;
  splitActive: (direction: SplitDirection, newFileId?: string | null) => string | null;

  isSplit: () => boolean;
  getPaneCount: () => number;
  getLeaves: () => PaneLeaf[];
}

const createInitialState = () => ({
  root: createLeaf(null, INITIAL_PANE_ID) as PaneNode,
  activePaneId: INITIAL_PANE_ID,
});

export const useSplitViewStore = create<SplitViewState>((set, get) => ({
  ...createInitialState(),

  splitPane: (paneId, direction, newFileId = null) => {
    const { root } = get();
    const targetPane = findNode(root, paneId);

    if (!targetPane || targetPane.type !== 'leaf') {
      return null;
    }

    const newLeaf = createLeaf(newFileId);
    const newSplit = createSplit(direction, targetPane, newLeaf);
    const newRoot = replaceNode(root, paneId, newSplit);

    set({ root: newRoot, activePaneId: newLeaf.id });
    return newLeaf.id;
  },

  closePane: (paneId) => {
    const { root, activePaneId } = get();
    if (countLeaves(root) <= 1) return;

    const parent = findParent(root, paneId);
    if (!parent) return;

    const sibling = parent.first.id === paneId ? parent.second : parent.first;
    const newRoot = replaceNode(root, parent.id, sibling);
    const newActiveId = paneId === activePaneId ? getFirstLeaf(sibling).id : activePaneId;

    set({ root: newRoot, activePaneId: newActiveId });
  },

  setRatio: (splitId, ratio) => {
    const clamped = Math.max(MIN_RATIO, Math.min(MAX_RATIO, ratio));
    set((state) => ({
      root: mapTree(state.root, (node) =>
        node.id === splitId && node.type === 'split' ? { ...node, ratio: clamped } : node
      ),
    }));
  },

  setPaneFile: (paneId, fileId) => {
    set((state) => ({
      root: mapTree(state.root, (node) =>
        node.id === paneId && node.type === 'leaf' ? { ...node, fileId } : node
      ),
    }));
  },

  setActivePane: (paneId) => {
    if (findNode(get().root, paneId)) {
      set({ activePaneId: paneId });
    }
  },

  reset: () => {
    idCounter = 0;
    set(createInitialState());
  },

  splitActive: (direction, newFileId = null) => {
    return get().splitPane(get().activePaneId, direction, newFileId);
  },

  isSplit: () => get().root.type === 'split',
  getPaneCount: () => countLeaves(get().root),
  getLeaves: () => getAllLeaves(get().root),
}));

export const useIsSplit = () => useSplitViewStore((state) => state.root.type === 'split');
export const usePaneCount = () => useSplitViewStore((state) => countLeaves(state.root));
export const useActivePane = () => useSplitViewStore((state) => state.activePaneId);
