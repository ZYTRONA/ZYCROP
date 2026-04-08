module.exports = {
  root: true,
  extends: ['expo'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: false,
    node: true,
    es2021: true,
  },
  rules: {
    // Enforce real bugs only — keep it practical
    'no-undef': 'error',
    'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react/display-name': 'off',
    // Style: warnings only
    'no-extra-semi': 'warn',
    'eqeqeq': ['warn', 'always', { null: 'ignore' }],
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', '.expo/', 'dist/'],
}
