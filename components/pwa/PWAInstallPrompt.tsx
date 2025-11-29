'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Download, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // PWAがインストール済みかチェック
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      // @ts-ignore - navigator.standalone は iOS Safari のみ
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    if (checkInstalled()) return;

    // iOS判定
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // インストールプロンプトイベントをキャプチャ
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // 前回非表示にしてから24時間経過していなければ表示しない
      const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed, 10);
        if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
          return;
        }
      }

      // 少し遅延させて表示
      setTimeout(() => setShowPrompt(true), 3000);
    };

    // インストール完了イベント
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOSの場合、初回訪問時にインストール案内を表示
    if (isIOSDevice && !localStorage.getItem('ios-install-shown')) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
        localStorage.setItem('ios-install-shown', 'true');
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  }, []);

  // インストール済み or 非表示の場合は何も表示しない
  if (isInstalled || !showPrompt) return null;

  // iOS向けインストール手順
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-background rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">iOSでインストール</h3>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">共有ボタンをタップ</p>
                <p className="text-sm text-muted-foreground">
                  画面下部の共有アイコン（□に↑）をタップ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">「ホーム画面に追加」を選択</p>
                <p className="text-sm text-muted-foreground">
                  スクロールして「ホーム画面に追加」をタップ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">「追加」をタップ</p>
                <p className="text-sm text-muted-foreground">
                  右上の「追加」をタップして完了
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium"
          >
            わかりました
          </button>
        </div>
      </div>
    );
  }

  // 標準のインストールプロンプト
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-background border border-border rounded-2xl shadow-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            {isIOS ? (
              <Smartphone className="h-6 w-6 text-primary" />
            ) : (
              <Monitor className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">アプリをインストール</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ホーム画面に追加してオフラインでも使えます
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="閉じる"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors"
          >
            後で
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            インストール
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * オフラインインジケーター
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-amber-950 text-center py-1 text-xs font-medium z-50">
      オフラインモード - 変更はローカルに保存されます
    </div>
  );
}

/**
 * アプリ更新通知
 */
export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdate(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, [registration]);

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-primary text-primary-foreground rounded-2xl shadow-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">新しいバージョンが利用可能です</p>
        </div>
        <button
          onClick={handleUpdate}
          className="w-full py-2.5 text-sm font-medium rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors"
        >
          更新する
        </button>
      </div>
    </div>
  );
}
