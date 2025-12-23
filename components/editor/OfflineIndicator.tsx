'use client';

import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

export const OfflineIndicator = memo(function OfflineIndicator() {
  const { t } = useTranslation();
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  // オンライン状態で復帰通知も不要なら表示しない
  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={`mochi-offline-indicator ${isOnline ? 'mochi-offline-indicator-online' : ''}`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" aria-hidden="true" />
          <span>{t('pwa.status.online')}</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          <span>{t('pwa.status.offline')}</span>
        </>
      )}
    </div>
  );
});
