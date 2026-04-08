import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/fynch.ts',
      name: 'Fynch Event Tracking',
      formats: ['umd'],
      fileName: () => `fynch.js`,
    },
    target: 'es2015'
  }
})
