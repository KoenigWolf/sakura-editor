'use client';

import { useEffect, useState } from 'react';
import { EditorContainer } from '@/components/editor/EditorContainer';
import { useFileStore } from '@/lib/store/file-store';

/**
 * サクラエディタWebバージョンのホームページ
 */
export default function Home() {
  const { files, addFile } = useFileStore();
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setMounted(true);
  }, []);

  // 初期ファイルが存在しない場合、デフォルトファイルを作成
  useEffect(() => {
    if (mounted && files.length === 0) {
      addFile({
        name: 'untitled.txt',
        content: '',
        path: '',
        lastModified: Date.now(),
      });
    }
  }, [mounted, files.length, addFile]);

  if (!mounted) {
    return (
      <main className="h-full flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full flex flex-col overflow-hidden">
      <EditorContainer />
    </main>
  );
}
