import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  // Main source files (ts, tsx)
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/setupTests.ts'],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // Unit test files
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/setupTests.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // E2E test files
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
