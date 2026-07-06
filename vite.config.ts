/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/fynch.ts',
      name: 'FynchEventTracking',
      // iife for the CDN <script> tag, es for bundler consumers (tree-shakeable,
      // no FynchEventTracking global). dist/fynch.js keeps its historic name so
      // existing pinned CDN URLs continue to resolve.
      formats: ['iife', 'es'],
      fileName: (format) => (format === 'es' ? 'fynch.mjs' : 'fynch.js'),
    },
    target: 'es2015',
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/types/global.d.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
