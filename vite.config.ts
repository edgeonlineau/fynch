import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';

// Vite 8's rolldown output keeps //#region / //#endregion debug markers in
// the ESM bundle (~2kB raw). They carry no runtime meaning, so strip them.
function stripRegionComments(): Plugin {
  return {
    name: 'strip-region-comments',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk') {
          chunk.code = chunk.code.replace(/^\/\/#(?:region|endregion)[^\n]*\n?/gm, '');
        }
      }
    },
  };
}

// The ESM build is a second pass (BUILD_FORMAT=es) with a higher target:
// bundler environments have supported object spread natively since 2019, and
// building it at es2015 injects ~2kB of transpilation helpers. The IIFE stays
// at es2015 for direct <script>-tag compatibility.
const isEsBuild = process.env.BUILD_FORMAT === 'es';

export default defineConfig({
  plugins: [stripRegionComments()],
  build: {
    lib: {
      entry: 'src/fynch.ts',
      name: 'FynchEventTracking',
      // iife for the CDN <script> tag, es for bundler consumers (tree-shakeable,
      // no FynchEventTracking global). dist/fynch.js keeps its historic name so
      // existing pinned CDN URLs continue to resolve.
      formats: isEsBuild ? ['es'] : ['iife'],
      fileName: (format) => (format === 'es' ? 'fynch.mjs' : 'fynch.js'),
    },
    target: isEsBuild ? 'es2018' : 'es2015',
    // The second pass must not wipe the first pass's output.
    emptyOutDir: !isEsBuild,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // fynch.ts is side-effect-only registration; v8 reports it at 0%
      // because the module cache means it only executes once across the
      // suite, which misleads the aggregate numbers.
      exclude: ['src/types/global.d.ts', 'src/fynch.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
