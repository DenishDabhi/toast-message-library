import ToastManager from '../src/manager/ToastManager';
import createToastApi from '../src/manager/createToastApi';

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('queue', () => {
  test('keeps at most maxVisible toasts and promotes the next one after the exit', () => {
    const manager = new ToastManager({ maxVisible: 2 });
    const a = manager.show('a');
    const b = manager.show('b');
    const c = manager.show('c');

    expect(manager.getSnapshot().toasts.map(t => t.id)).toEqual([a, b]);
    expect(manager.getQueueLength()).toBe(1);

    manager.hide(a);
    // The slot stays taken until the exit animation has finished.
    expect(manager.getQueueLength()).toBe(1);

    manager.remove(a);
    expect(manager.getSnapshot().toasts.map(t => t.id)).toEqual([b, c]);
    expect(manager.getQueueLength()).toBe(0);
  });

  test('raising maxVisible promotes queued toasts immediately', () => {
    const manager = new ToastManager({ maxVisible: 1 });
    manager.show('a');
    manager.show('b');
    manager.configure({ maxVisible: 2 });
    expect(manager.getSnapshot().toasts).toHaveLength(2);
  });

  test('hide() cancels a queued toast and reports the dismissal', () => {
    const manager = new ToastManager({ maxVisible: 1 });
    const onDismiss = jest.fn();
    manager.show('first');
    const queuedId = manager.show({ message: 'second', onDismiss });
    expect(manager.hide(queuedId)).toBe(true);
    expect(onDismiss).toHaveBeenCalledWith('manual', queuedId);
    expect(manager.getQueueLength()).toBe(0);
  });

  test('hideAll() counts visible and queued toasts and calls onDismiss for each', () => {
    const manager = new ToastManager({ maxVisible: 1 });
    const onDismiss = jest.fn();
    manager.show({ message: 'a', onDismiss });
    manager.show({ message: 'b', onDismiss });
    expect(manager.hideAll()).toBe(2);
    expect(onDismiss).toHaveBeenCalledTimes(2);
    expect(onDismiss).toHaveBeenCalledWith('hideAll', expect.any(String));
    expect(manager.getQueueLength()).toBe(0);
  });

  test('generated ids never collide with ids passed by the caller', () => {
    const manager = new ToastManager({ maxVisible: 10 });
    manager.show({ id: 'toast-1', message: 'mine' });
    const generated = manager.show('generated');
    expect(generated).not.toBe('toast-1');
    expect(manager.getSnapshot().toasts).toHaveLength(2);
  });
});

describe('timers', () => {
  test('auto-dismisses after the duration and calls onDismiss exactly once', () => {
    const manager = new ToastManager();
    const onDismiss = jest.fn();
    const id = manager.show({ message: 'x', duration: 1000, onDismiss });

    jest.advanceTimersByTime(999);
    expect(onDismiss).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('timeout', id);

    manager.hide(id);
    jest.advanceTimersByTime(5000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('duration 0 keeps the toast until it is dismissed', () => {
    const manager = new ToastManager();
    const id = manager.show({ message: 'sticky', duration: 0 });
    jest.advanceTimersByTime(60000);
    expect(manager.isVisible(id)).toBe(true);
  });

  test('pause() and resume() keep the remaining time', () => {
    const manager = new ToastManager();
    const id = manager.show({ message: 'x', duration: 1000 });
    jest.advanceTimersByTime(400);
    manager.pause(id);
    jest.advanceTimersByTime(5000);
    expect(manager.isVisible(id)).toBe(true);

    manager.resume(id);
    jest.advanceTimersByTime(599);
    expect(manager.isVisible(id)).toBe(true);
    jest.advanceTimersByTime(2);
    expect(manager.isVisible(id)).toBe(false);
  });

  test('an exiting toast is force-removed if the view never reports the end of the animation', () => {
    const manager = new ToastManager();
    const id = manager.show({ message: 'x', animationDuration: 250 });
    manager.hide(id);
    expect(manager.getSnapshot().toasts).toHaveLength(1);
    jest.advanceTimersByTime(250 + 400 + 1);
    expect(manager.getSnapshot().toasts).toHaveLength(0);
  });
});

describe('updating a toast in place', () => {
  test('showing an existing id replaces its content and restarts the timer', () => {
    const manager = new ToastManager();
    manager.show({ id: 'upload', message: 'one', duration: 1000 });
    jest.advanceTimersByTime(900);
    manager.show({ id: 'upload', message: 'two', duration: 1000 });
    jest.advanceTimersByTime(900);

    expect(manager.isVisible('upload')).toBe(true);
    expect(manager.getSnapshot().toasts[0].options.message).toBe('two');
  });

  test('every update gets a new revision so the progress bar can restart', () => {
    const manager = new ToastManager();
    manager.show({ id: 'upload', message: 'one', duration: 1000 });
    const first = manager.getSnapshot().toasts[0].revision;
    manager.show({ id: 'upload', message: 'two', duration: 1000 });
    const second = manager.getSnapshot().toasts[0].revision;
    expect(second).not.toBe(first);
  });

  test('showing the id of an exiting toast brings it back as visible', () => {
    const manager = new ToastManager();
    manager.show({ id: 'again', message: 'one' });
    manager.hide('again', 'swipe');
    expect(manager.getSnapshot().toasts[0].status).toBe('exiting');

    manager.show({ id: 'again', message: 'two' });
    const [entry] = manager.getSnapshot().toasts;
    expect(entry.status).toBe('visible');
    expect(manager.isVisible('again')).toBe(true);

    // The old exit timer must not remove the toast that was just shown again.
    jest.advanceTimersByTime(1000);
    expect(manager.getSnapshot().toasts).toHaveLength(1);
    expect(manager.isVisible('again')).toBe(true);
  });
});

describe('callbacks', () => {
  test('errors thrown by callbacks are logged and do not corrupt the manager', () => {
    const manager = new ToastManager();
    const id = manager.show({
      message: 'a',
      onDismiss: () => {
        throw new Error('boom');
      },
    });
    expect(() => manager.hide(id)).not.toThrow();
    jest.advanceTimersByTime(1000);
    expect(manager.getSnapshot().toasts).toHaveLength(0);
    expect(console.error).toHaveBeenCalled();
  });

  test('onShow runs when a queued toast becomes visible, not when it is requested', () => {
    const manager = new ToastManager({ maxVisible: 1 });
    const onShow = jest.fn();
    const first = manager.show('first');
    manager.show({ message: 'second', onShow });
    expect(onShow).not.toHaveBeenCalled();
    manager.hide(first);
    manager.remove(first);
    expect(onShow).toHaveBeenCalledTimes(1);
  });
});

describe('lifecycle', () => {
  test('a destroyed manager ignores new toasts and revive() re-enables it', () => {
    const manager = new ToastManager();
    manager.destroy();
    expect(manager.show('ignored')).toBeNull();
    manager.revive();
    expect(manager.show('works')).not.toBeNull();
  });
});

describe('toast API', () => {
  test('success() accepts a number, a string or an options object', () => {
    const manager = new ToastManager({ maxVisible: 10 });
    const api = createToastApi(manager);
    api.success(42);
    api.error('text', { title: 'Failed' });
    api.info({ title: 'Update', description: 'Version 2.0' });

    const toasts = manager.getSnapshot().toasts.map(t => t.options);
    expect(toasts[0]).toMatchObject({ type: 'success', message: '42' });
    expect(toasts[1]).toMatchObject({ type: 'error', title: 'Failed', message: 'text' });
    expect(toasts[2]).toMatchObject({ type: 'info', title: 'Update', message: 'Version 2.0' });
  });

  test('the type is always forced to the type of the method', () => {
    const manager = new ToastManager();
    createToastApi(manager).warning({ type: 'error', message: 'x' });
    expect(manager.getSnapshot().toasts[0].options.type).toBe('warning');
  });
});
