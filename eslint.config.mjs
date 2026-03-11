import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'prisma/**'],
  },
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
    },
  },
  {
    files: ['src/**/*.test.ts'],
    rules: {
      // Vitest matcher chains (expect().toBe() etc.) use complex generics that
      // TypeScript's project service cannot fully resolve — these rules produce
      // false positives on every assertion.
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      // Test callbacks and helper functions don't need explicit return types.
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
)
