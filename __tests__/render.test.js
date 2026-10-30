import React from 'react';
import { render, renderHook, screen, fireEvent, act } from '@testing-library/react-native';
import { ToastProvider, useToast, Toast } from '../src';
import useToastInsets from '../src/utils/safeArea';

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

describe('title and description', () => {
  test('shows the default title and the message', async () => {
    await render(<App />);
    await act(async () => {
      api.success('Saved ok');
    });
    expect(screen.getByText('Success')).toBeTruthy();
    expect(screen.getByText('Saved ok')).toBeTruthy();
  });

  test('shows a custom title and a description', async () => {
    await render(<App />);
    await act(async () => {
      api.success({ title: 'Profile saved', description: 'Everyone can see your photo.' });
    });
    expect(screen.getByText('Profile saved')).toBeTruthy();
    expect(screen.getByText('Everyone can see your photo.')).toBeTruthy();
    expect(screen.queryByText('Success')).toBeNull();
  });

  test("title '' hides the default title", async () => {
    await render(<App />);
    await act(async () => {
      api.error('Server down', { title: '' });
    });
    expect(screen.queryByText('Error')).toBeNull();
    expect(screen.getByText('Server down')).toBeTruthy();
  });

  test('a title without a message shows only the title', async () => {
    await render(<App />);
    await act(async () => {
      api.info({ title: 'Sync finished' });
    });
    expect(screen.getByText('Sync finished')).toBeTruthy();
  });

  test('the provider titles prop changes the default titles', async () => {
    await render(<App titles={{ success: 'Done', error: '' }} />);
    await act(async () => {
      api.success('One');
      api.error('Two');
    });
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.queryByText('Success')).toBeNull();
    expect(screen.queryByText('Error')).toBeNull();
    expect(screen.getByText('Two')).toBeTruthy();
  });

  test('updating a toast in place changes its text', async () => {
    await render(<App />);
    await act(async () => {
      api.show({ id: 'upload', type: 'info', title: 'Uploading', description: '0%', duration: 0 });
    });
    expect(screen.getByText('0%')).toBeTruthy();
    await act(async () => {
      api.show({ id: 'upload', type: 'success', title: 'Uploaded', description: 'Ready', duration: 0 });
    });
    expect(screen.queryByText('0%')).toBeNull();
    expect(screen.getByText('Ready')).toBeTruthy();
    expect(screen.getAllByTestId('toast-upload')).toHaveLength(1);
  });

  test('the accessibility label contains the type, the title and the message', async () => {
    await render(<App />);
    await act(async () => {
      api.error('Disk full', { title: 'Storage' });
    });
    expect(screen.getByLabelText('Error. Storage. Disk full')).toBeTruthy();
  });

  test('the type is still announced when the title is hidden', async () => {
    await render(<App />);
    await act(async () => {
      api.error('Disk full', { title: '' });
    });
    expect(screen.getByLabelText('Error. Disk full')).toBeTruthy();
  });
});

describe('invalid input', () => {
  test('an invalid provider position throws instead of silently hiding toasts', async () => {
    await expect(render(<App position="middle" />)).rejects.toThrow(/Invalid position "middle"/);
  });

  test('an invalid provider titles prop throws', async () => {
    await expect(render(<App titles={{ warn: 'x' }} />)).rejects.toThrow(/Unknown key "warn"/);
  });

  test('an empty toast throws', async () => {
    await render(<App />);
    expect(() => api.show({ message: '', title: '' })).toThrow(/would be empty/);
  });

  test('useToast() outside a provider throws a helpful error', async () => {
    function Bad() {
      useToast();
      return null;
    }
    await expect(render(<Bad />)).rejects.toThrow(/outside of a <ToastProvider>/);
  });
});

describe('global API', () => {
  test('Toast.* works with <ToastProvider global>', async () => {
    await render(<App global />);
    await act(async () => {
      Toast.warning('global works');
    });
    expect(screen.getByText('global works')).toBeTruthy();
  });

  test('Toast.* throws when no global provider is mounted', () => {
    expect(() => Toast.info('x')).toThrow(/ToastProvider global/);
  });
});

describe('interaction', () => {
  test('the action button fires once and dismisses with the reason "action"', async () => {
    await render(<App />);
    const onAction = jest.fn();
    const onDismiss = jest.fn();
    await act(async () => {
      api.info('x', { action: { label: 'Undo' }, onAction, onDismiss, duration: 0 });
    });
    await fireEvent.press(screen.getByText('Undo'));
    await fireEvent.press(screen.getByText('Undo'));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('action', expect.any(String));
  });

  test('a throwing onAction is logged and the toast is still dismissed', async () => {
    await render(<App />);
    const onDismiss = jest.fn();
    await act(async () => {
      api.info('x', {
        action: { label: 'Retry' },
        onAction: () => {
          throw new Error('boom');
        },
        onDismiss,
        duration: 0,
      });
    });
    await fireEvent.press(screen.getByText('Retry'));
    expect(console.error).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalledWith('action', expect.any(String));
  });

  test('a throwing onPress is logged and does not break the toast', async () => {
    await render(<App />);
    await act(async () => {
      api.info('Tap me', {
        onPress: () => {
          throw new Error('boom');
        },
        duration: 0,
      });
    });
    await fireEvent.press(screen.getByText('Tap me'));
    expect(console.error).toHaveBeenCalled();
    expect(screen.getByText('Tap me')).toBeTruthy();
  });

  test('the close button dismisses with the reason "close"', async () => {
    await render(<App />);
    const onDismiss = jest.fn();
    await act(async () => {
      api.info('x', { closeButton: true, onDismiss, duration: 0 });
    });
    await fireEvent.press(screen.getByLabelText('Dismiss notification'));
    expect(onDismiss).toHaveBeenCalledWith('close', expect.any(String));
  });

  test('a toast is removed from the tree after its timeout and exit animation', async () => {
    await render(<App />);
    await act(async () => {
      api.info('bye', { duration: 500, animation: 'none' });
    });
    expect(screen.getByText('bye')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.queryByText('bye')).toBeNull();
  });

  test('a toast shown again with the id of an exiting toast is visible again', async () => {
    await render(<App />);
    await act(async () => {
      api.show({ id: 'again', message: 'first', duration: 0, animation: 'none' });
    });
    await act(async () => {
      api.hide('again');
    });
    await act(async () => {
      api.show({ id: 'again', message: 'second', duration: 0, animation: 'none' });
    });
    expect(api.isVisible('again')).toBe(true);
    expect(screen.getByText('second')).toBeTruthy();
  });
});

describe('safe-area insets', () => {
  test('undefined or invalid sides of the insets prop are ignored', async () => {
    const { result } = await renderHook(() =>
      useToastInsets({ top: undefined, bottom: 10, left: NaN, right: -4 }),
    );
    const { top, bottom, left, right } = result.current;
    [top, bottom, left, right].forEach(value => expect(Number.isFinite(value)).toBe(true));
    expect(bottom).toBe(10);
    expect(left).toBe(0);
    expect(right).toBe(0);
  });

  test('valid sides override the detected values', async () => {
    const { result } = await renderHook(() => useToastInsets({ top: 44, bottom: 24 }));
    expect(result.current.top).toBe(44);
    expect(result.current.bottom).toBe(24);
  });
});
