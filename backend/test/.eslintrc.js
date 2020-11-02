const exports = {
  env: {
    mocha: true,
  },
  rules: {
    'no-unusued-vars': ['error', { varsIgnorePattern: 'should|expect' }],
  },
};

export default exports;
