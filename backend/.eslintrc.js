module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-process-exit': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'global-require': 'off',
    'no-plusplus': 'off',
    'dot-notation': 'off',
  },
};
