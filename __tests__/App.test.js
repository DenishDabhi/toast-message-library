import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

test('the demo app renders and can show a toast', async () => {
  await render(<App />);

  await act(async () => {
    // do not await the press: the demo handler runs a long timed sequence
    fireEvent.press(screen.getByText('Start Toast Demo'));
    // the first toast appears after the demo's 300 ms delay
    await new Promise(resolve => setTimeout(resolve, 600));
  });

  expect(screen.getByText('Top toast layout')).toBeTruthy();

  // stop the toast animations and the demo sequence inside act
  await act(async () => {
    screen.unmount();
  });
}, 15000);