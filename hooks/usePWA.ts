'use client';

import { useEffect, useState } from 'react';

/**
 * PWA Service Worker登録とアップデート管理
 */
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // ブラウザ環境チェック
    if (typeof window === 'undefined') return;
    // 開発環境では Service Worker を使わない（Hydration mismatch/キャッシュ不整合の原因になる）
    if (process.env.NODE_ENV !== 'production') {
      if ('serviceWorker' in navigator) {
        // 既に制御されている場合は登録解除してからリロード（古いJSキャッシュがSSRと食い違うのを防ぐ）
        navigator.serviceWorker.getRegistrations().then((regs) => {
          if (regs.length === 0) return;
          Promise.all(regs.map((reg) => reg.unregister())).then(() => {
            if (navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
        });
      }
      return;
    }

    // オンライン状態
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWAインストール状態チェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    // @ts-ignore - iOS Safari
    if (window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    // Service Worker登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          setRegistration(reg);

          // アップデートチェック
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true);
              }
            });
          });
        })
        .catch(() => {
          // Service Worker registration failed silently
        });

      // コントローラー変更時にリロード
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    isInstalled,
    isOnline,
    hasUpdate,
    applyUpdate,
    registration,
  };
}
