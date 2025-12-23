'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center"
    >
      <AlertTriangle className="h-16 w-16 text-destructive" aria-hidden="true" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-muted-foreground">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="mt-4 max-w-lg overflow-auto rounded-md bg-muted p-4 text-left text-xs">
            {error.message}
          </pre>
        )}
      </div>
      <div className="flex gap-4">
        <Button onClick={reset} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="outline">
          <Home className="mr-2 h-4 w-4" aria-hidden="true" />
          Home
        </Button>
      </div>
    </div>
  );
}
