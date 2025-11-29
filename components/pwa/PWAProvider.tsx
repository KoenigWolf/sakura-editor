'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { PWAInstallPrompt, OfflineIndicator, UpdateNotification } from './PWAInstallPrompt';

interface PWAContextValue {
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  applyUpdate: () => void;
}

const PWAContext = createContext<PWAContextValue | null>(null);

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within PWAProvider');
  }
  return context;
}

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
