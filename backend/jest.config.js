module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'daos/**/*.js',
    'server.js'
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html']
}; 