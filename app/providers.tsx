'use client';

import '@/lib/i18n';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { LanguageSync } from '@/components/LanguageSync';
import { LiveAnnouncer } from '@/components/LiveAnnouncer';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { WebVitalsReporter } from '@/components/WebVitalsReporter';
import { SkipLink } from '@/components/SkipLink';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <SkipLink />
        <LanguageSync />
        <PWAProvider>{children}</PWAProvider>
        <Toaster />
        <LiveAnnouncer />
        <WebVitalsReporter />
      </TooltipProvider>
    </ThemeProvider>
  );
}
