import { describe, it, expect, beforeEach } from 'vitest';
import { useSplitViewStore } from '@/lib/store/split-view-store';

describe('SplitViewStore', () => {
  beforeEach(() => {
    useSplitViewStore.getState().reset();
  });

  describe('初期状態', () => {
    it('単一ペインで初期化される', () => {
      const state = useSplitViewStore.getState();
      expect(state.root.type).toBe('leaf');
      expect(state.root.id).toBe('pane-initial');
      expect(state.activePaneId).toBe('pane-initial');
    });

    it('isSplitはfalseを返す', () => {
      expect(useSplitViewStore.getState().isSplit()).toBe(false);
    });

    it('getPaneCountは1を返す', () => {
      expect(useSplitViewStore.getState().getPaneCount()).toBe(1);
    });
  });

  describe('splitPane', () => {
    it('垂直分割できる', () => {
      const newPaneId = useSplitViewStore.getState().splitPane('pane-initial', 'vertical');

      expect(newPaneId).not.toBeNull();
      expect(useSplitViewStore.getState().isSplit()).toBe(true);
      expect(useSplitViewStore.getState().getPaneCount()).toBe(2);
    });

    it('水平分割できる', () => {
      const newPaneId = useSplitViewStore.getState().splitPane('pane-initial', 'horizontal');

      expect(newPaneId).not.toBeNull();
      expect(useSplitViewStore.getState().isSplit()).toBe(true);
      expect(useSplitViewStore.getState().getPaneCount()).toBe(2);
    });

    it('分割後にアクティブペインが新しいペインに切り替わる', () => {
      const newPaneId = useSplitViewStore.getState().splitPane('pane-initial', 'vertical');

      expect(useSplitViewStore.getState().activePaneId).toBe(newPaneId);
    });

    it('分割時にファイルIDを指定できる', () => {
      useSplitViewStore.getState().splitPane('pane-initial', 'vertical', 'file-123');

      const leaves = useSplitViewStore.getState().getLeaves();
      const newLeaf = leaves.find((leaf) => leaf.fileId === 'file-123');
      expect(newLeaf).toBeDefined();
    });

    it('存在しないペインを分割しようとするとnullを返す', () => {
      const result = useSplitViewStore.getState().splitPane('non-existent', 'vertical');
      expect(result).toBeNull();
    });

    it('複数回分割できる', () => {
      useSplitViewStore.getState().splitPane('pane-initial', 'vertical');
      const newPaneId = useSplitViewStore.getState().splitActive('horizontal');

      expect(newPaneId).not.toBeNull();
      expect(useSplitViewStore.getState().getPaneCount()).toBe(3);
    });
  });

  describe('closePane', () => {
    it('分割されたペインを閉じられる', () => {
      const newPaneId = useSplitViewStore.getState().splitPane('pane-initial', 'vertical');

      useSplitViewStore.getState().closePane(newPaneId!);

      expect(useSplitViewStore.getState().isSplit()).toBe(false);
      expect(useSplitViewStore.getState().getPaneCount()).toBe(1);
    });

    it('最後のペインは閉じられない', () => {
      useSplitViewStore.getState().closePane('pane-initial');

      expect(useSplitViewStore.getState().getPaneCount()).toBe(1);
    });

    it('アクティブペインを閉じると別のペインがアクティブになる', () => {
      useSplitViewStore.getState().splitPane('pane-initial', 'vertical');
      const activePaneId = useSplitViewStore.getState().activePaneId;

      useSplitViewStore.getState().closePane(activePaneId);

      expect(useSplitViewStore.getState().activePaneId).not.toBe(activePaneId);
      expect(useSplitViewStore.getState().activePaneId).toBe('pane-initial');
    });
  });

  describe('setRatio', () => {
    it('分割比率を設定できる', () => {
      useSplitViewStore.getState().splitPane('pane-initial', 'vertical');
      const root = useSplitViewStore.getState().root;

      if (root.type === 'split') {
        useSplitViewStore.getState().setRatio(root.id, 0.5);
        const updatedRoot = useSplitViewStore.getState().root;
        if (updatedRoot.type === 'split') {
          expect(updatedRoot.ratio).toBe(0.5);
        }
      }
    });

    it('比率は0.2〜0.8にクランプされる', () => {
      useSplitViewStore.getState().splitPane('pane-initial', 'vertical');
      const root = useSplitViewStore.getState().root;

      if (root.type === 'split') {
        useSplitViewStore.getState().setRatio(root.id, 0.1);
        let updatedRoot = useSplitViewStore.getState().root;
        if (updatedRoot.type === 'split') {
          expect(updatedRoot.ratio).toBe(0.2);
        }

        useSplitViewStore.getState().setRatio(root.id, 0.9);
        updatedRoot = useSplitViewStore.getState().root;
        if (updatedRoot.type === 'split') {
          expect(updatedRoot.ratio).toBe(0.8);
        }
      }
    });
  });

  describe('setPaneFile', () => {
    it('ペインにファイルを割り当てられる', () => {
      useSplitViewStore.getState().setPaneFile('pane-initial', 'file-123');

      const leaves = useSplitViewStore.getState().getLeaves();
      const leaf = leaves.find((l) => l.id === 'pane-initial');
      expect(leaf?.fileId).toBe('file-123');
    });

    it('ファイルをnullに設定できる', () => {
      useSplitViewStore.getState().setPaneFile('pane-initial', 'file-123');
      useSplitViewStore.getState().setPaneFile('pane-initial', null);

      const leaves = useSplitViewStore.getState().getLeaves();
      const leaf = leaves.find((l) => l.id === 'pane-initial');
      expect(leaf?.fileId).toBeNull();
    });
  });

  describe('setActivePane', () => {
    it('アクティブペインを切り替えられる', () => {
      useSplitViewStore.getState().splitPane('pane-initial', 'vertical');

      useSplitViewStore.getState().setActivePane('pane-initial');
      expect(useSplitViewStore.getState().activePaneId).toBe('pane-initial');
    });

    it('存在しないペインには切り替わらない', () => {
      const initialActive = useSplitViewStore.getState().activePaneId;

      useSplitViewStore.getState().setActivePane('non-existent');
      expect(useSplitViewStore.getState().activePaneId).toBe(initialActive);
    });
  });

  describe('splitActive', () => {
    it('アクティブペインを分割できる', () => {
      const newPaneId = useSplitViewStore.getState().splitActive('vertical');

      expect(newPaneId).not.toBeNull();
      expect(useSplitViewStore.getState().getPaneCount()).toBe(2);
    });
  });

  describe('getLeaves', () => {
    it('すべてのリーフペインを取得できる', () => {
      useSplitViewStore.getState().splitPane('pane-initial', 'vertical');

      const leaves = useSplitViewStore.getState().getLeaves();
      expect(leaves).toHaveLength(2);
      expect(leaves.every((leaf) => leaf.type === 'leaf')).toBe(true);
    });
  });

  describe('reset', () => {
    it('初期状態にリセットできる', () => {
      useSplitViewStore.getState().splitPane('pane-initial', 'vertical');
      useSplitViewStore.getState().splitActive('horizontal');

      useSplitViewStore.getState().reset();

      expect(useSplitViewStore.getState().isSplit()).toBe(false);
      expect(useSplitViewStore.getState().getPaneCount()).toBe(1);
      expect(useSplitViewStore.getState().activePaneId).toBe('pane-initial');
    });
  });
});
