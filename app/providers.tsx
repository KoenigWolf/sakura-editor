'use client';

import '@/lib/i18n';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { LanguageSync } from '@/components/LanguageSync';
import { LiveAnnouncer } from '@/components/LiveAnnouncer';
import { PWAProvider } from '@/components/pwa/PWAProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <LanguageSync />
        <PWAProvider>{children}</PWAProvider>
        <Toaster />
        <LiveAnnouncer />
      </TooltipProvider>
    </ThemeProvider>
  );
}
