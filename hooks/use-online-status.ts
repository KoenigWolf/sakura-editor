'use client';

import { useState, useEffect } from 'react';

interface OnlineStatusState {
  /** オンラインかどうか */
  isOnline: boolean;
  /** オフラインからオンラインに復帰したかどうか */
  wasOffline: boolean;
  /** クライアントでマウント済みかどうか */
  mounted: boolean;
}

/**
 * オンライン/オフライン状態を検出するカスタムフック
 */
export const useOnlineStatus = (): OnlineStatusState => {
  // サーバーとクライアントで同じ初期値を使用（ハイドレーションエラー防止）
  const [state, setState] = useState<OnlineStatusState>({
    isOnline: true,
    wasOffline: false,
    mounted: false,
  });

  // マウント後に実際のオンライン状態を設定
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isOnline: navigator.onLine,
      mounted: true,
    }));
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: true,
        wasOffline: !prev.isOnline,
      }));
    };

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: false,
        wasOffline: false,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return state;
};
