module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/netlify/functions/**/*.test.js'],
  collectCoverageFrom: [
    'netlify/functions/**/*.js',
    '!netlify/functions/**/*.test.js',
  ],
  coverageDirectory: 'coverage/functions',
  verbose: true,
};
