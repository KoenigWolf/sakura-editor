'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  Zap,
  WifiOff,
  Sparkles,
  Share,
  PlusSquare,
  ChevronRight,
  Laptop,
  Apple,
  Chrome,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
type Browser = 'safari' | 'chrome' | 'edge' | 'firefox' | 'unknown';

// プラットフォーム検出
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

// ブラウザ検出
const detectBrowser = (): Browser => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();

  if (/edg/.test(ua)) return 'edge';
  if (/chrome/.test(ua) && !/edg/.test(ua)) return 'chrome';
  if (/safari/.test(ua) && !/chrome/.test(ua)) return 'safari';
  if (/firefox/.test(ua)) return 'firefox';
  return 'unknown';
};

// メリットアイテム
const benefits = [
  { icon: Zap, label: '高速起動', description: 'ネイティブアプリ並みの速度' },
  { icon: WifiOff, label: 'オフライン対応', description: 'ネット接続なしで動作' },
  { icon: Sparkles, label: '自動更新', description: '常に最新バージョン' },
];

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installStep, setInstallStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const platform = useMemo(() => detectPlatform(), []);
  const browser = useMemo(() => detectBrowser(), []);
  const isIOS = platform === 'ios';
  const isMac = platform === 'macos';
  const isDesktop = platform === 'windows' || platform === 'macos' || platform === 'linux';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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

      // アニメーション付きで表示
      setTimeout(() => {
        setShowPrompt(true);
        setIsAnimating(true);
      }, 2000);
    };

    // インストール完了イベント
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      // 成功フィードバック
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS/Safariの場合、初回訪問時にインストール案内を表示
    if (isIOS && browser === 'safari' && !localStorage.getItem('ios-install-shown')) {
      setTimeout(() => {
        setShowPrompt(true);
        setIsAnimating(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [mounted, isIOS, browser]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      if (isIOS || (isMac && browser === 'safari')) {
        setShowInstructions(true);
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
  }, [deferredPrompt, isIOS, isMac, browser]);

  const handleDismiss = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowPrompt(false);
      setShowInstructions(false);
    }, 200);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  }, []);

  const handleNextStep = useCallback(() => {
    setInstallStep(prev => prev + 1);
  }, []);

  // インストール済み or 非表示の場合は何も表示しない
  if (!mounted || isInstalled || !showPrompt) return null;

  // プラットフォーム別インストール手順
  const getInstructions = () => {
    if (isIOS) {
      return [
        {
          icon: Share,
          title: '共有ボタンをタップ',
          description: '画面下部の共有アイコン（□に↑）をタップ',
          highlight: '下部中央のアイコン',
        },
        {
          icon: PlusSquare,
          title: '「ホーム画面に追加」を選択',
          description: 'メニューをスクロールして見つけてください',
          highlight: 'スクロールが必要な場合も',
        },
        {
          icon: CheckCircle2,
          title: '「追加」をタップ',
          description: '右上の「追加」ボタンで完了です',
          highlight: '右上のボタン',
        },
      ];
    }

    if (isMac && browser === 'safari') {
      return [
        {
          icon: Share,
          title: '共有ボタンをクリック',
          description: 'ツールバーの共有アイコンをクリック',
          highlight: 'アドレスバー付近',
        },
        {
          icon: PlusSquare,
          title: '「Dockに追加」を選択',
          description: 'メニューから「Dockに追加」を選択',
          highlight: 'macOS Sonoma以降',
        },
        {
          icon: CheckCircle2,
          title: '「追加」をクリック',
          description: 'ダイアログで「追加」をクリックして完了',
          highlight: '',
        },
      ];
    }

    return [];
  };

  const instructions = getInstructions();

  // インストール手順モーダル
  if (showInstructions) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-[100] flex items-end sm:items-center justify-center",
          "bg-black/60 backdrop-blur-sm",
          "transition-opacity duration-300",
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={(e) => e.target === e.currentTarget && handleDismiss()}
      >
        <div
          className={cn(
            "bg-background w-full max-w-md mx-4 sm:mx-auto",
            "rounded-t-3xl sm:rounded-2xl shadow-2xl",
            "transform transition-all duration-300 ease-out",
            isAnimating ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
          )}
        >
          {/* ヘッダー */}
          <div className="relative px-6 pt-6 pb-4">
            {/* ドラッグハンドル（モバイル） */}
            <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/30 rounded-full" />

            <div className="flex items-start justify-between mt-2 sm:mt-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                  {isIOS ? (
                    <Apple className="h-6 w-6 text-white" />
                  ) : (
                    <Laptop className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {isIOS ? 'iPhoneに追加' : 'Macに追加'}
                  </h3>
                  <p className="text-sm text-muted-foreground">3ステップで完了</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* ステップ表示 */}
          <div className="px-6 pb-2">
            <div className="flex items-center gap-2">
              {instructions.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    idx <= installStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </div>

          {/* 現在のステップ */}
          <div className="px-6 py-6">
            {instructions[installStep] && (
              <div
                key={installStep}
                className="flex flex-col items-center text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  {(() => {
                    const Icon = instructions[installStep].icon;
                    return <Icon className="h-10 w-10 text-primary" />;
                  })()}
                </div>
                <div>
                  <p className="text-2xl font-bold mb-2">
                    {instructions[installStep].title}
                  </p>
                  <p className="text-muted-foreground">
                    {instructions[installStep].description}
                  </p>
                  {instructions[installStep].highlight && (
                    <p className="text-xs text-primary mt-2 font-medium">
                      💡 {instructions[installStep].highlight}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="px-6 pb-6 pt-2 space-y-3">
            {installStep < instructions.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors active:scale-[0.98]"
              >
                次へ
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleDismiss}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg hover:bg-primary/90 transition-colors active:scale-[0.98]"
              >
                完了
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
            >
              後でインストールする
            </button>
          </div>

          {/* Safe area padding */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      </div>
    );
  }

  // メインのインストールプロンプト
  return (
    <div
      className={cn(
        "fixed z-[100]",
        isDesktop
          ? "bottom-6 right-6 w-[380px]"
          : "bottom-0 left-0 right-0 pb-safe-area-inset-bottom",
        "transition-all duration-500 ease-out",
        isAnimating
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      )}
    >
      <div
        className={cn(
          "bg-background shadow-2xl",
          isDesktop
            ? "rounded-2xl border border-border/50"
            : "rounded-t-3xl",
          "overflow-hidden"
        )}
      >
        {/* モバイルのドラッグハンドル */}
        {!isDesktop && (
          <div className="pt-3 pb-1 flex justify-center">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>
        )}

        <div className="p-5">
          {/* ヘッダー */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              {/* パルスアニメーション */}
              <div className="absolute inset-0 rounded-2xl bg-pink-500/30 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight">
                Sakura Editorをインストール
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isDesktop ? 'デスクトップアプリとして使用' : 'ホーム画面に追加'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 -mr-2 -mt-1 rounded-xl hover:bg-muted transition-colors"
              aria-label="閉じる"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* メリット一覧 */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/50"
              >
                <benefit.icon className="h-5 w-5 text-primary mb-1.5" />
                <span className="text-xs font-medium">{benefit.label}</span>
              </div>
            ))}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3.5 text-sm font-semibold rounded-xl border-2 border-border hover:bg-muted transition-all active:scale-[0.98]"
            >
              後で
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
            >
              <Download className="h-4 w-4" />
              インストール
            </button>
          </div>

          {/* プラットフォーム情報 */}
          <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
            {isIOS && <Apple className="h-3 w-3" />}
            {browser === 'chrome' && <Chrome className="h-3 w-3" />}
            {isDesktop && !isIOS && <Monitor className="h-3 w-3" />}
            {!isDesktop && !isIOS && <Smartphone className="h-3 w-3" />}
            {isIOS
              ? 'Safari経由でインストール'
              : isDesktop
                ? `${browser === 'chrome' ? 'Chrome' : browser === 'edge' ? 'Edge' : 'ブラウザ'}からインストール`
                : 'ブラウザからインストール'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * オフラインインジケーター - モダンデザイン
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!mounted) return null;

  // 再接続通知
  if (showReconnected) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
        <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          オンラインに復帰しました
        </div>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-amber-500 text-amber-950 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        オフラインモード
      </div>
    </div>
  );
}

/**
 * アプリ更新通知 - モダンデザイン
 */
export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
    setIsUpdating(true);
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, [registration]);

  const handleDismiss = useCallback(() => {
    setShowUpdate(false);
  }, []);

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-2xl shadow-emerald-500/25 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">アップデートがあります</p>
          <p className="text-sm text-white/80">最新機能を利用できます</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            後で
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-4 py-2 bg-white text-emerald-600 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                更新中...
              </>
            ) : (
              '今すぐ更新'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
