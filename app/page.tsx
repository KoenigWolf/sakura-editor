import { EditorContainer } from '@/components/editor/EditorContainer';

/**
 * サクラエディタWebバージョンのホームページ
 */
export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <EditorContainer />
    </main>
  );
}
