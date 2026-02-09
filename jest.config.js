/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  transform: {},
  collectCoverageFrom: [
    'src/ai/DecisionEngine.js',
    'src/storage/IPFSClient.js',
    'src/storage/Logger.js',
    'src/blockchain/networks.js'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  }
};
