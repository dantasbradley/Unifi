// __tests__/App.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CheckButton from '../app/components/CheckButton';
import CustomButton from '../app/components/CustomButton';
import Sidebar from '../app/components/Sidebar';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null
}));

jest.mock('../app/components/Hamburger', () => ({
  useHamburger: () => ({
    isSidebarOpen: true,
    toggleSidebar: jest.fn(),
    closeSidebar: jest.fn(),
  })
}));

describe('Component Tests', () => {
  test('CheckButton toggles state on press', () => {
    const { getByText } = render(<CheckButton text="Test Label" />);
    const label = getByText('Test Label');

    fireEvent.press(label);
    fireEvent.press(label);
  });

  test('CustomButton calls onPress', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <CustomButton title="Click Me" onPress={onPressMock} />
    );
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalled();
  });

  test('Sidebar renders with organization titles', async () => {
    const { getByText } = render(<Sidebar />);

    await waitFor(() => {
      expect(getByText('My Organizations')).toBeTruthy();
    });
  });
});
