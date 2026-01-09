'use client';

import { createContext, ReactNode } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { PWAInstallPrompt, OfflineIndicator, UpdateNotification } from './PWAInstallPrompt';

interface PWAContextValue {
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  applyUpdate: () => void;
}

const PWAContext = createContext<PWAContextValue | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  const pwa = usePWA();

  return (
    <PWAContext.Provider value={pwa}>
      {children}
      <OfflineIndicator />
      <UpdateNotification />
      <PWAInstallPrompt />
    </PWAContext.Provider>
  );
}
