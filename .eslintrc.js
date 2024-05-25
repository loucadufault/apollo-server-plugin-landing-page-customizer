/* eslint-env node */
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    'import/order': [
      'error',
      {
        'newlines-between': 'never',
      },
    ],
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
        allowSeparatedGroups: true,
      },
    ],
    'import/no-unresolved': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-console': 'error',
  },
  overrides: [
    {
      files: ['*-test.[jt]s', '*.spec.[jt]s'],
      rules: {
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['./**/*.ts'],
      rules: {
        // todo: manually check that all violations of disabled rules are indeed safe
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-return': 'warn',
        // we intentionally do this and so have to ignore it 4 times
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        // imposes the use of additional runtime typeguards or `in` checks
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
      extends: ['plugin:@typescript-eslint/strict-type-checked'],
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    {
      files: ['public/esm/**/wrapper.mjs'],
      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
  reportUnusedDisableDirectives: true,
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: 'tsconfig.json',
      },
    },
  },
  root: true,
}
