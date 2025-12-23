'use client';

import { useState, useEffect, useCallback } from 'react';

interface OnlineStatusState {
  /** オンラインかどうか */
  isOnline: boolean;
  /** オフラインからオンラインに復帰したかどうか */
  wasOffline: boolean;
}

/**
 * オンライン/オフライン状態を検出するカスタムフック
 */
export const useOnlineStatus = (): OnlineStatusState => {
  const [state, setState] = useState<OnlineStatusState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
  });

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        isOnline: true,
        wasOffline: !prev.isOnline,
      }));
    };

    const handleOffline = () => {
      setState({
        isOnline: false,
        wasOffline: false,
      });
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
