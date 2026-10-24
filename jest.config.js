module.exports = {
  preset: '@react-native/jest-preset',
  // Only look at these folders. This keeps Jest fast: it does not crawl
  // android/, ios/, build output or .git.
  roots: ['<rootDir>/src', '<rootDir>/__tests__', '<rootDir>/demo'],
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  // The first run has a cold Babel cache and can be slow on Windows.
  testTimeout: 60000,
  collectCoverageFrom: ['src/**/*.js'],
};
