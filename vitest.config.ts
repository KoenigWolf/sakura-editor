import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'out/', '**/*.d.ts', '**/*.config.*', '**/types/'],
      thresholds: {
        'lib/security.ts': {
          statements: 50,
          branches: 50,
          functions: 60,
          lines: 50,
        },
        'lib/utils.ts': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'lib/store/announcer-store.ts': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
        'lib/store/search-store.ts': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
        'lib/store/split-view-store.ts': {
          statements: 90,
          branches: 80,
          functions: 80,
          lines: 90,
        },
        'lib/store/file-store.ts': {
          statements: 90,
          branches: 75,
          functions: 90,
          lines: 90,
        },
        'lib/store/storage.ts': {
          statements: 70,
          branches: 60,
          functions: 50,
          lines: 70,
        },
        'hooks/use-mobile-detection.ts': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
        'hooks/use-focus-trap.ts': {
          statements: 50,
          branches: 50,
          functions: 40,
          lines: 50,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
