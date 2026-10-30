/**
 * Runs the examples from README.md against the real code, so the documentation
 * cannot drift away from the implementation again.
 */
import React from 'react';
import { Button, Dimensions, StyleSheet, Text } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider, Toast, createTheme, lightTheme, darkTheme, useToast } from '../src';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

let api;
function Grab() {
  api = useToast();
  return null;
}

function App(props) {
  return (
    <ToastProvider {...props}>
      <Grab />
    </ToastProvider>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function wrapperStyle(id) {
  // host Animated.View -> wrapper View that carries the per-toast margins
  return StyleSheet.flatten(screen.getByTestId(`toast-${id}`).parent.props.style);
}

test('Quick start: provider props and a button that shows a toast', async () => {
  function Home() {
    const toast = useToast();
    return (
      <Button
        title="Save"
        onPress={() =>
          toast.success({
            title: 'Saved',
            description: 'Your changes have been saved.',
          })
        }
      />
    );
  }

  await render(
    <SafeAreaProvider>
      <ToastProvider position="top" duration={3000} animation="slide" maxVisible={3}>
        <Home />
      </ToastProvider>
    </SafeAreaProvider>,
  );
  await fireEvent.press(screen.getByText('Save'));
  expect(screen.getByText('Saved')).toBeTruthy();
  expect(screen.getByText('Your changes have been saved.')).toBeTruthy();
});

test('Showing toasts: return values of show, hide, hideAll and isVisible', async () => {
  await render(<App />);
  let id;
  await act(async () => {
    id = api.show('message');
  });
  expect(typeof id).toBe('string');
  expect(api.isVisible()).toBe(true);
  expect(api.isVisible(id)).toBe(true);
  expect(api.hide(id)).toBe(true);
  expect(api.hide('does-not-exist')).toBe(false);
  await act(async () => {
    api.show('a');
    api.show('b');
  });
  expect(api.hideAll()).toBe(2);
});

test('Title and description: the three ways to set them', async () => {
  await render(<App />);
  await act(async () => {
    api.success({ title: 'Profile saved', description: 'Everyone can see your new photo.' });
    api.error('Card declined.', { title: 'Payment failed' });
    api.info({ title: 'Update', message: 'Version 2.0 is available.' });
  });
  ['Profile saved', 'Everyone can see your new photo.', 'Payment failed', 'Card declined.', 'Update', 'Version 2.0 is available.'].forEach(
    text => expect(screen.getByText(text)).toBeTruthy(),
  );
});

test('Title and description: removing them', async () => {
  await render(<App />);
  await act(async () => {
    api.error('Could not reach the server.', { title: '' });
    api.info({ title: 'Sync finished' });
  });
  expect(screen.queryByText('Error')).toBeNull();
  expect(screen.getByText('Could not reach the server.')).toBeTruthy();
  expect(screen.getByText('Sync finished')).toBeTruthy();
});

test('Title and description: the titles prop (translate and hide)', async () => {
  const { rerender } = await render(
    <App titles={{ success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Información' }} />,
  );
  await act(async () => {
    api.success('Guardado');
    api.warning('Cuidado');
  });
  expect(screen.getByText('Éxito')).toBeTruthy();
  expect(screen.getByText('Advertencia')).toBeTruthy();

  await act(async () => {
    api.hideAll();
    jest.advanceTimersByTime(1000);
  });
  await rerender(<App titles={{ success: '', error: '', warning: '', info: '' }} />);
  await act(async () => {
    api.success('No title here');
  });
  expect(screen.queryByText('Success')).toBeNull();
  expect(screen.getByText('No title here')).toBeTruthy();
});

test('Title and description: style options are applied', async () => {
  await render(<App />);
  await act(async () => {
    api.success({
      title: 'Saved',
      description: 'All changes are synced.',
      titleStyle: { fontSize: 18, letterSpacing: 0.5 },
      messageStyle: { fontStyle: 'italic' },
      textColor: '#0B3D2E',
    });
  });
  const title = StyleSheet.flatten(screen.getByText('Saved').props.style);
  const message = StyleSheet.flatten(screen.getByText('All changes are synced.').props.style);
  expect(title).toMatchObject({ fontSize: 18, letterSpacing: 0.5, color: '#0B3D2E' });
  expect(message).toMatchObject({ fontStyle: 'italic', color: '#0B3D2E' });
});

test('Title and description: update the text of a visible toast by re-using the id', async () => {
  await render(<App />);
  await act(async () => {
    api.show({ id: 'upload', type: 'info', title: 'Uploading', description: '0%', duration: 0 });
  });
  await act(async () => {
    api.show({ id: 'upload', type: 'success', title: 'Uploaded', description: 'Your file is ready.', duration: 3000 });
  });
  expect(screen.getByText('Uploaded')).toBeTruthy();
  expect(screen.queryByText('Uploading')).toBeNull();
});

test('Positions: every documented position renders', async () => {
  const positions = ['top', 'bottom', 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
  await render(<App maxVisible={10} />);
  await act(async () => {
    positions.forEach(position => api.info(position, { position, duration: 0 }));
  });
  positions.forEach(position => expect(screen.getByText(position)).toBeTruthy());
});

test('Offsets: a per-toast offsetY and offsetX are applied', async () => {
  await render(<App />);
  await act(async () => {
    api.info('lower', { id: 'low', position: 'top', offsetY: 24, duration: 0 });
    api.info('narrow', { id: 'narrow', position: 'top-right', offsetX: 20, duration: 0 });
    api.info('bottom', { id: 'bot', position: 'bottom', offsetY: 40, duration: 0 });
  });
  expect(wrapperStyle('low').marginTop).toBe(24);
  expect(wrapperStyle('narrow').marginRight).toBe(20);
  expect(wrapperStyle('bot').marginBottom).toBe(40);
});

test('Offsets: a per-toast offsetX narrows a centred toast on both sides', async () => {
  const windowWidth = Dimensions.get('window').width;
  await render(<App />);
  await act(async () => {
    api.info('narrow', { id: 'centered', position: 'top', offsetX: 200, duration: 0 });
  });
  const { width } = StyleSheet.flatten(screen.getByTestId('toast-centered').props.style);
  expect(width).toBe(Math.min(480, windowWidth - 32 - 2 * 200));
});

test('Insets and offset props on the provider are accepted', async () => {
  await render(<App insets={{ top: 44, bottom: 34 }} offset={{ y: 56 }} position="top" />);
  await act(async () => {
    api.info('ok');
  });
  expect(screen.getByText('ok')).toBeTruthy();
  await render(<App insets={{ bottom: 24 }} offset={{ x: 8 }} />);
});

test('Stacking: toasts at one position are separated by spacing', async () => {
  await render(<App spacing={14} />);
  await act(async () => {
    api.info('one', { id: 'one', duration: 0 });
    api.info('two', { id: 'two', duration: 0 });
  });
  expect(wrapperStyle('one').marginTop).toBe(0);
  expect(wrapperStyle('two').marginTop).toBe(14);
});

test('Callbacks: onDismiss reasons', async () => {
  await render(<App />);
  const reasons = [];
  await act(async () => {
    api.show({ id: 'a', message: 'timeout', duration: 100, onDismiss: r => reasons.push(r) });
    api.show({ id: 'b', message: 'manual', duration: 0, onDismiss: r => reasons.push(r) });
  });
  await act(async () => {
    jest.advanceTimersByTime(200);
  });
  await act(async () => {
    api.hide('b');
  });
  expect(reasons).toEqual(['timeout', 'manual']);
});

test('Themes: names, createTheme, extends and system', async () => {
  expect(lightTheme.name).toBe('light');
  expect(darkTheme.name).toBe('dark');
  const custom = createTheme('dark', {
    borderRadius: 4,
    typography: { fontFamily: 'Inter', titleSize: 16 },
    colors: { success: { background: '#052E1B', text: '#fff' } },
  });
  expect(custom.borderRadius).toBe(4);
  expect(custom.typography.fontFamily).toBe('Inter');
  expect(custom.colors.success.background).toBe('#052E1B');
  // untouched values come from the dark theme
  expect(custom.colors.error).toEqual(darkTheme.colors.error);

  for (const theme of ['light', 'dark', 'system', custom, { extends: 'dark', padding: 20 }]) {
    const { unmount } = await render(<App theme={theme} />);
    await act(async () => {
      api.success('themed');
    });
    expect(screen.getByText('themed')).toBeTruthy();
    await unmount();
  }
  await expect(render(<App theme="neon" />)).rejects.toThrow(/Unknown theme "neon"/);
});

test('Custom icons and content', async () => {
  await render(<App />);
  await act(async () => {
    api.show({ type: 'custom', message: 'Deployed', icon: ({ color }) => <Text style={{ color }}>ROCKET</Text> });
    api.success('No icon here', { icon: false });
    api.show({
      type: 'custom',
      duration: 0,
      render: ({ hide, colors }) => (
        <Text style={{ color: colors.text }} onPress={hide}>
          Fully custom: tap to close
        </Text>
      ),
    });
  });
  expect(screen.getByText('ROCKET')).toBeTruthy();
  expect(screen.getByText('No icon here')).toBeTruthy();
  await fireEvent.press(screen.getByText('Fully custom: tap to close'));
  expect(api.isVisible()).toBe(true); // the other toasts are still there
});

test('Recipe: loading -> success with one toast (same id)', async () => {
  await render(<App />);
  await act(async () => {
    api.show({ id: 'upload', type: 'info', title: 'Uploading…', duration: 0, closeButton: false });
  });
  await act(async () => {
    api.show({ id: 'upload', type: 'success', title: 'Uploaded', description: 'Your file is ready.' });
  });
  expect(screen.getByText('Uploaded')).toBeTruthy();
  expect(screen.getAllByTestId('toast-upload')).toHaveLength(1);
});

test('Recipe: undo snackbar', async () => {
  await render(<App />);
  const restoreItem = jest.fn();
  const deleteForever = jest.fn();
  await act(async () => {
    api.show({
      type: 'success',
      title: 'Item deleted',
      action: { label: 'Undo' },
      duration: 6000,
      onAction: restoreItem,
      onDismiss: reason => reason === 'timeout' && deleteForever(),
    });
  });
  await fireEvent.press(screen.getByText('Undo'));
  expect(restoreItem).toHaveBeenCalledTimes(1);
  expect(deleteForever).not.toHaveBeenCalled();
});

test('Recipe: persistent error with a retry action (hides when the retry succeeds)', async () => {
  await render(<App />);
  const retry = jest.fn(() => Promise.resolve());
  await act(async () => {
    api.error('The server is not reachable.', {
      title: 'Offline',
      duration: 0,
      closeButton: true,
      action: { label: 'Retry' },
      dismissOnAction: false,
      onAction: ({ hide }) => retry().then(hide).catch(() => {}),
    });
  });
  expect(screen.getByLabelText('Dismiss notification')).toBeTruthy();
  await fireEvent.press(screen.getByText('Retry'));
  expect(retry).toHaveBeenCalledTimes(1);
  expect(api.isVisible()).toBe(false);
});

test('Recipe: persistent error with a retry action (stays when the retry fails)', async () => {
  await render(<App />);
  const retry = jest.fn(() => Promise.reject(new Error('still offline')));
  await act(async () => {
    api.error('The server is not reachable.', {
      title: 'Offline',
      duration: 0,
      action: { label: 'Retry' },
      dismissOnAction: false,
      onAction: ({ hide }) => retry().then(hide).catch(() => {}),
    });
  });
  await fireEvent.press(screen.getByText('Retry'));
  await fireEvent.press(screen.getByText('Retry'));
  // dismissOnAction is false, so the action fires on every press
  expect(retry).toHaveBeenCalledTimes(2);
  expect(api.isVisible()).toBe(true);
});

test('Recipe: the global Toast API works outside React components', async () => {
  await render(<App global />);
  await act(async () => {
    Toast.error('Network request failed', { title: 'Network error' });
  });
  expect(screen.getByText('Network error')).toBeTruthy();
  expect(screen.getByText('Network request failed')).toBeTruthy();
});

test('Recipe: brand-coloured toast', async () => {
  await render(<App />);
  await act(async () => {
    api.show({
      type: 'custom',
      title: 'Welcome back',
      description: 'Good to see you again.',
      backgroundColor: '#1E1B4B',
      textColor: '#EEF2FF',
      borderColor: '#818CF8',
      iconColor: '#C7D2FE',
      icon: ({ color }) => <Text style={{ color }}>HI</Text>,
    });
  });
  expect(StyleSheet.flatten(screen.getByText('Welcome back').props.style).color).toBe('#EEF2FF');
});

test('Provider: queue with maxVisible and progress bar', async () => {
  await render(<App maxVisible={1} />);
  await act(async () => {
    api.info('first', { duration: 0, progress: true });
    api.info('second', { duration: 0 });
  });
  expect(screen.getByText('first')).toBeTruthy();
  expect(screen.queryByText('second')).toBeNull();
});

test('Provider: wrapper style prop is applied', async () => {
  await render(
    <ToastProvider style={{ backgroundColor: 'red' }}>
      <Text>child</Text>
    </ToastProvider>,
  );
  expect(StyleSheet.flatten(screen.toJSON().props.style)).toMatchObject({
    flex: 1,
    backgroundColor: 'red',
  });
});
