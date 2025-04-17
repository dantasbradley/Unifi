// jestSetup.js

// ✅ Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
  );
  
  // ✅ Prevent "EXPO_OS not defined" error
  process.env.EXPO_OS = 'ios';
  
  // ✅ Mock react-native-reanimated
  jest.mock('react-native-reanimated', () =>
    require('react-native-reanimated/mock')
  );
  
  // ✅ Mock expo-asset (commonly used in image imports)
  jest.mock('expo-asset', () => ({
    Asset: {
      fromModule: () => ({
        downloadAsync: async () => {},
      }),
    },
  }));
  
  // ✅ Mock expo-router if you're using it in tests
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
  