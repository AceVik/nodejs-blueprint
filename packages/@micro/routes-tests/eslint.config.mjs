import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const sharedRules = {
  quotes: ['error', 'single', { avoidEscape: true }],
  indent: ['error', 2],
  'object-curly-spacing': ['error', 'always'],
  semi: ['error', 'always'],
  'no-trailing-spaces': 'error',
  'comma-dangle': ['error', 'always-multiline'],
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...sharedRules,
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: null,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...sharedRules,
    },
  },
];