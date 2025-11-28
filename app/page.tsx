'use client';

import { useEffect } from 'react';
import { EditorContainer } from '@/components/editor/EditorContainer';
import { useFileStore } from '@/lib/store/file-store';

export default function Home() {
  const { files, addFile, _hasHydrated } = useFileStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (files.length > 0) return;

    addFile({
      name: 'untitled.txt',
      content: '',
      path: '',
      lastModified: Date.now(),
    });
  }, [_hasHydrated, files.length, addFile]);

  return (
    <main className="h-full w-full max-w-full flex flex-col overflow-hidden">
      <EditorContainer />
    </main>
  );
}
