import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  prettierConfig,
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        jQuery: 'readonly',
        dmAPI: 'readonly',
        HubspotFormsV4: 'readonly',
        dataLayer: 'writable',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        CustomEvent: 'readonly',
      },
    },
  },
);
