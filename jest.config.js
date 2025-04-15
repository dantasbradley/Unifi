module.exports = {
    preset: 'jest-expo',
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!(expo|expo-font|expo-asset|expo-router|expo-modules-core|react-native|@react-native|@expo|@react-navigation)/)',
    ],
    setupFilesAfterEnv: [],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: ['/node_modules/', '/app-example/'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/app/$1',
      '\\.(jpg|jpeg|png|gif|webp|svg|ttf|otf|woff|woff2|eot)$': '<rootDir>/__mocks__/fileMock.js',
    },
  };
  