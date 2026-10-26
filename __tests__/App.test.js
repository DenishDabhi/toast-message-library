import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

test('the demo app renders and can show a toast', async () => {
  await render(<App />);
  await fireEvent.press(screen.getByText('Show success'));
  await act(async () => {});
  expect(screen.getByText('Your changes have been saved.')).toBeTruthy();
});
