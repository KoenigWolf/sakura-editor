'use client';

import { useCallback } from 'react';
import { useFileStore } from '@/lib/store/file-store';
import { useSplitViewStore, type SplitDirection } from '@/lib/store/split-view-store';

const generateUniqueFileName = (existingNames: string[]): string => {
  let counter = 2;
  let name = 'Untitled-2';
  while (existingNames.includes(name)) {
    counter++;
    name = `Untitled-${counter}`;
  }
  return name;
};

export const useSplitWithFile = () => {
  const files = useFileStore((state) => state.files);
  const addFile = useFileStore((state) => state.addFile);
  const { splitPane, splitActive } = useSplitViewStore();

  const splitPaneWithNewFile = useCallback(
    (paneId: string, direction: SplitDirection) => {
      const newFileName = generateUniqueFileName(files.map((f) => f.name));
      const newFileId = addFile({
        name: newFileName,
        content: '',
        path: '',
        lastModified: Date.now(),
      });
      splitPane(paneId, direction, newFileId);
    },
    [files, addFile, splitPane]
  );

  const splitActiveWithNewFile = useCallback(
    (direction: SplitDirection) => {
      const newFileName = generateUniqueFileName(files.map((f) => f.name));
      const newFileId = addFile({
        name: newFileName,
        content: '',
        path: '',
        lastModified: Date.now(),
      });
      splitActive(direction, newFileId);
    },
    [files, addFile, splitActive]
  );

  return { splitPaneWithNewFile, splitActiveWithNewFile };
};
