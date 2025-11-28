'use client';

import { useEffect } from 'react';
import { EditorContainer } from '@/components/editor/EditorContainer';
import { useFileStore } from '@/lib/store/file-store';

export default function Home() {
  const { files, addFile } = useFileStore();

  useEffect(() => {
    if (files.length === 0) {
      addFile({
        name: 'untitled.txt',
        content: '',
        path: '',
        lastModified: Date.now(),
      });
    }
  }, [files.length, addFile]);

  return (
    <main className="h-full flex flex-col overflow-hidden">
      <EditorContainer />
    </main>
  );
}
