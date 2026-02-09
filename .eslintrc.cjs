module.exports = {
  env: {
    es2022: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: ['eslint:recommended'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'web/dist/', 'web/build/']
};
