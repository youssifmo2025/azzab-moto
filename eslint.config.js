// ESLint flat config — ESLint 9+ format
// Plugins: security, jsx-a11y, prettier
// typescript-eslint and eslint-plugin-react-hooks are NOT yet installed.
// Add them in Phase 1 alongside the TypeScript migration.
// See docs/ADR/ADR-007-linting.md for the linting strategy decision.

import js from '@eslint/js'
import security from 'eslint-plugin-security'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    files: ['**/*.{js,mjs,cjs}'],
  },
  // Base JS recommended rules
  js.configs.recommended,

  // Security rules — flags eval, dangerouslySetInnerHTML, object injection, etc.
  security.configs.recommended,

  // Accessibility rules for JSX
  jsxA11y.flatConfigs.recommended,

  // Project-specific overrides
  {
    rules: {
      // Prevent eval — security requirement
      'no-eval': 'error',
      'no-implied-eval': 'error',
      // Unused vars with _ prefix allowed
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        CustomEvent: 'readonly',
        MutationObserver: 'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Node: 'readonly',
        NodeList: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Symbol: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        JSON: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        Error: 'readonly',
        TypeError: 'readonly',
        RangeError: 'readonly',
        RegExp: 'readonly',
        Array: 'readonly',
        Object: 'readonly',
        String: 'readonly',
        Number: 'readonly',
        Boolean: 'readonly',
        BigInt: 'readonly',
        parseInt: 'readonly',
        parseFloat: 'readonly',
        isNaN: 'readonly',
        isFinite: 'readonly',
        encodeURIComponent: 'readonly',
        decodeURIComponent: 'readonly',
        encodeURI: 'readonly',
        decodeURI: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        crypto: 'readonly',
        performance: 'readonly',
        queueMicrotask: 'readonly',
        structuredClone: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
      },
    },
  },

  // Disable ESLint formatting rules that conflict with Prettier — MUST be last
  prettierConfig,

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'vite.config.ts',
      'vitest.config.ts',
      'eslint.config.js',
    ],
  },
]
