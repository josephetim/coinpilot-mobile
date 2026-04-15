/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-native|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|expo-router|@react-navigation/.*|@shopify/flash-list|react-native-svg|react-native-gifted-charts|gifted-charts-core)',
  ],
};
