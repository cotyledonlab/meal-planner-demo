import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    pool: 'threads',
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/dist/**',
        '**/.next/**',
        'src/app/**/layout.tsx',
        'src/app/**/page.tsx',
        'src/app/api/**/route.ts',
        'src/env.js',
        'prisma/**',
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});
