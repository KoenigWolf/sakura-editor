'use client';

import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
export type Browser = 'safari' | 'chrome' | 'edge' | 'firefox' | 'unknown';

const detectPlatform = (): Platform => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/win/.test(ua)) return 'windows';
  if (/mac/.test(ua)) return 'macos';
  if (/linux/.test(ua)) return 'linux';
  return 'unknown';
};

const detectBrowser = (): Browser => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (/edg/.test(ua)) return 'edge';
  if (/chrome/.test(ua) && !/edg/.test(ua)) return 'chrome';
  if (/safari/.test(ua) && !/chrome/.test(ua)) return 'safari';
  if (/firefox/.test(ua)) return 'firefox';
  return 'unknown';
};

// グローバルにdeferredPromptを保存（イベントは一度しか発火しないため）
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

// 早期にイベントをキャプチャ
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((listener) => listener(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((listener) => listener(null));
  });
}

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    globalDeferredPrompt
  );
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [browser, setBrowser] = useState<Browser>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // プラットフォーム・ブラウザ検出
    setPlatform(detectPlatform());
    setBrowser(detectBrowser());

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    // @ts-ignore - iOS Safari
    if (window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    // グローバルリスナーに登録
    const handlePromptChange = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      if (prompt === null) {
        setIsInstalled(true);
      }
    };
    promptListeners.add(handlePromptChange);

    // 既にキャプチャ済みの場合
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    // 開発環境ではSWを使わない（Hydration mismatch防止）
    if (process.env.NODE_ENV !== 'production') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          if (regs.length === 0) return;
          Promise.all(regs.map((reg) => reg.unregister())).then(() => {
            if (navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
        });
      }
    } else {
      // 本番環境のみSW登録
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            setRegistration(reg);

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
          .catch((e) => {
            console.warn('[PWA] Service Worker registration failed:', e);
          });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      promptListeners.delete(handlePromptChange);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  const triggerInstall = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    if (!deferredPrompt) {
      return 'unavailable';
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      // グローバル変数とローカル状態をクリア
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      return outcome;
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt]);

  const isIOS = platform === 'ios';
  const isMacSafari = platform === 'macos' && browser === 'safari';
  const canInstall = !isInstalled && (!!deferredPrompt || isIOS || isMacSafari);
  const needsManualInstall = isIOS || isMacSafari;

  return {
    isInstalled,
    isOnline,
    hasUpdate,
    applyUpdate,
    registration,
    canInstall,
    needsManualInstall,
    triggerInstall,
    platform,
    browser,
  };
}
