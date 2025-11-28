'use client';

import '@/lib/i18n';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { LanguageSync } from '@/components/LanguageSync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <LanguageSync />
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
