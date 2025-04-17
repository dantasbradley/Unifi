// jestSetup.js

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
  );
  
  process.env.EXPO_OS = 'ios';
  
  jest.mock('react-native-reanimated', () =>
    require('react-native-reanimated/mock')
  );
  
  jest.mock('expo-asset', () => ({
    Asset: {
      fromModule: () => ({
        downloadAsync: async () => {},
      }),
    },
  }));
  
  jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useGlobalSearchParams: () => ({}),
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
    Link: 'Link',
    Stack: () => null,
    Slot: () => null,
    Tabs: () => null,
    Redirect: () => null,
  }));
  