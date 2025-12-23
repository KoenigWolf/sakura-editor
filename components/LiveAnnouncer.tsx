'use client';

import { useAnnouncerStore } from '@/lib/store/announcer-store';

/**
 * スクリーンリーダー向けのライブアナウンサー
 * 動的なコンテンツ変更を読み上げるための非表示領域
 */
export function LiveAnnouncer() {
  const message = useAnnouncerStore((state) => state.message);
  const politeness = useAnnouncerStore((state) => state.politeness);

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeness === 'polite' ? message : ''}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {politeness === 'assertive' ? message : ''}
      </div>
    </>
  );
}
