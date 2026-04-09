/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/fynch.ts',
      name: 'Fynch Event Tracking',
      formats: ['umd'],
      fileName: () => `fynch.js`,
    },
    target: 'es2015',
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/global.d.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
