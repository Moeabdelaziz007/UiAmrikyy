module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Map @/ to src/
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest', // Ensure JS/JSX files are also transformed
  },
  testPathIgnorePatterns: [
    '<rootDir>/backend/node_modules/', // Ignore backend node_modules
    '<rootDir>/e2e/', // Ignore playwright e2e tests
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(framer-motion|lucide-react)/)', //