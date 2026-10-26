import { DEFAULT_CONFIG } from '../utils/constants';
import generateToastId from '../utils/generateToastId';
import normalizeToastOptions from '../utils/normalizeToastOptions';

/**
 * ToastManager is a framework-agnostic store. It owns:
 *  - the list of toasts currently rendered ("entries", visible or exiting),
 *  - the FIFO queue of toasts waiting for a free slot,
 *  - the auto-dismiss timers (including pause / resume).
 *
 * React components only render snapshots and report animation completion via
 * `remove(id)`. Keeping all timing logic here makes it deterministic and testable.
 *
 * Slot rules: a toast occupies one of the `maxVisible` slots from the moment it
 * is activated until its exit animation has finished (`remove`). A queued toast
 * is promoted as soon as a slot frees up.
 */

// Extra time (ms) after which an exiting toast is force-removed if the view
// never reported that its exit animation finished (e.g. the view was unmounted).
const EXIT_SAFETY_MARGIN = 400;

function reportError(error) {
  // Errors thrown by user callbacks must not corrupt the manager state.
  console.error('[react-native-toast-message-library] Error in toast callback:', error);
}

function safeCall(fn, ...args) {
  if (typeof fn !== 'function') {
    return;
  }
  try {
    fn(...args);
  } catch (error) {
    reportError(error);
  }
}

export default class ToastManager {
  constructor(config = {}) {
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._entries = [];
    this._queue = [];
    this._autoTimers = new Map();
    this._exitTimers = new Map();
    this._listeners = new Set();
    this._destroyed = false;
    this._snapshot = Object.freeze({ toasts: [], queued: 0 });

    this.subscribe = this.subscribe.bind(this);
    this.getSnapshot = this.getSnapshot.bind(this);
  }

  // ---------------------------------------------------------------- store API

  subscribe(listener) {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  getSnapshot() {
    return this._snapshot;
  }

  _emit() {
    this._snapshot = Object.freeze({
      toasts: this._entries.slice(),
      queued: this._queue.length,
    });
    Array.from(this._listeners).forEach(listener => listener());
  }

  // ------------------------------------------------------------ configuration

  configure(config = {}) {
    const previousMax = this._config.maxVisible;
    this._config = { ...this._config, ...config };
    if (this._config.maxVisible > previousMax && this._promote()) {
      this._emit();
    }
  }

  getConfig() {
    return this._config;
  }

  // -------------------------------------------------------------- public API

  /**
   * Shows (or queues) a toast.
   * @returns {string|null} the toast id, or null when the manager was destroyed
   * @throws {TypeError} when the options are invalid
   */
  show(input) {
    const options = normalizeToastOptions(input, this._config);

    if (this._destroyed) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn(
          '[react-native-toast-message-library] A toast was requested after its ToastProvider unmounted. It was ignored.',
        );
      }
      return null;
    }

    const id = this._resolveId(options.id);
    options.id = id;

    // Showing an id that already exists updates that toast in place.
    const entryIndex = this._entries.findIndex(entry => entry.id === id);
    if (entryIndex !== -1) {
      this._clearExitTimer(id);
      this._clearAutoTimer(id);
      this._entries[entryIndex] = this._createEntry(id, options);
      this._startAutoTimer(this._entries[entryIndex]);
      this._emit();
      return id;
    }

    const queueIndex = this._queue.findIndex(item => item.id === id);
    if (queueIndex !== -1) {
      this._queue[queueIndex] = { id, options };
      return id;
    }

    if (this._entries.length < this._config.maxVisible) {
      this._activate({ id, options });
      this._emit();
    } else {
      this._queue.push({ id, options });
      this._emit();
    }
    return id;
  }

  /**
   * Dismisses a toast by id. Works for visible and queued toasts.
   * @returns {boolean} true if a toast was dismissed by this call
   */
  hide(id, reason = 'manual') {
    if (id == null) {
      return false;
    }
    const key = String(id);

    const queueIndex = this._queue.findIndex(item => item.id === key);
    if (queueIndex !== -1) {
      const [removed] = this._queue.splice(queueIndex, 1);
      this._emit();
      safeCall(removed.options.onDismiss, reason, key);
      return true;
    }

    const entry = this._entries.find(item => item.id === key);
    if (!entry || entry.status !== 'visible') {
      return false;
    }
    this._beginExit(entry, reason);
    return true;
  }

  /**
   * Dismisses every visible and queued toast.
   * @returns {number} how many toasts were dismissed
   */
  hideAll() {
    const queued = this._queue;
    this._queue = [];
    const visible = this._entries.filter(entry => entry.status === 'visible');

    visible.forEach(entry => this._beginExit(entry, 'hideAll', false));
    this._emit();

    queued.forEach(item =>
      safeCall(item.options.onDismiss, 'hideAll', item.id),
    );
    visible.forEach(entry =>
      safeCall(entry.options.onDismiss, 'hideAll', entry.id),
    );
    return queued.length + visible.length;
  }

  /** true if the toast `id` (or any toast, when omitted) is currently shown. */
  isVisible(id) {
    if (id == null) {
      return this._entries.some(entry => entry.status === 'visible');
    }
    const key = String(id);
    return this._entries.some(
      entry => entry.id === key && entry.status === 'visible',
    );
  }

  /** Whether `id` is waiting in the queue. */
  isQueued(id) {
    const key = String(id);
    return this._queue.some(item => item.id === key);
  }

  getQueueLength() {
    return this._queue.length;
  }

  // ------------------------------------------------- view <-> manager contract

  /** Pauses the auto-dismiss countdown (user is interacting with the toast). */
  pause(id) {
    const key = String(id);
    const index = this._entries.findIndex(entry => entry.id === key);
    const entry = this._entries[index];
    const timer = this._autoTimers.get(key);
    if (!entry || entry.status !== 'visible' || entry.paused || !timer) {
      return;
    }
    clearTimeout(timer.handle);
    timer.handle = null;
    timer.remaining = Math.max(
      0,
      timer.remaining - (Date.now() - timer.startedAt),
    );
    this._entries[index] = {
      ...entry,
      paused: true,
      remaining: timer.remaining,
    };
    this._emit();
  }

  /** Resumes the countdown with the time that was left when it was paused. */
  resume(id) {
    const key = String(id);
    const index = this._entries.findIndex(entry => entry.id === key);
    const entry = this._entries[index];
    const timer = this._autoTimers.get(key);
    if (!entry || entry.status !== 'visible' || !entry.paused || !timer) {
      return;
    }
    this._entries[index] = { ...entry, paused: false };
    this._armTimer(key, timer);
    this._emit();
  }

  /**
   * Called by the view once the exit animation has finished. Frees the slot
   * and promotes the next queued toast. Safe to call more than once.
   */
  remove(id) {
    const key = String(id);
    const index = this._entries.findIndex(entry => entry.id === key);
    if (index === -1 || this._entries[index].status !== 'exiting') {
      return;
    }
    this._clearExitTimer(key);
    this._clearAutoTimer(key);
    this._entries.splice(index, 1);
    this._promote();
    this._emit();
  }

  /** Re-enables a destroyed manager (React StrictMode re-runs effects). */
  revive() {
    this._destroyed = false;
  }

  /** Clears every timer and listener. Called when the provider unmounts. */
  destroy() {
    this._autoTimers.forEach(timer => clearTimeout(timer.handle));
    this._exitTimers.forEach(handle => clearTimeout(handle));
    this._autoTimers.clear();
    this._exitTimers.clear();
    this._entries = [];
    this._queue = [];
    this._listeners.clear();
    this._destroyed = true;
    this._snapshot = Object.freeze({ toasts: [], queued: 0 });
  }

  // ------------------------------------------------------------------ internals

  _resolveId(requested) {
    if (requested != null) {
      return String(requested);
    }
    let id = generateToastId();
    while (this._hasId(id)) {
      id = generateToastId();
    }
    return id;
  }

  _hasId(id) {
    return (
      this._entries.some(entry => entry.id === id) ||
      this._queue.some(item => item.id === id)
    );
  }

  _createEntry(id, options) {
    return {
      id,
      options,
      status: 'visible',
      paused: false,
      remaining: options.duration,
    };
  }

  _activate(item) {
    const entry = this._createEntry(item.id, item.options);
    this._entries.push(entry);
    this._startAutoTimer(entry);
    // onShow runs after the state is consistent.
    safeCall(item.options.onShow, item.id);
  }

  _promote() {
    let promoted = false;
    while (
      this._queue.length > 0 &&
      this._entries.length < this._config.maxVisible
    ) {
      this._activate(this._queue.shift());
      promoted = true;
    }
    return promoted;
  }

  _startAutoTimer(entry) {
    if (!(entry.options.duration > 0)) {
      return;
    }
    const timer = {
      handle: null,
      remaining: entry.options.duration,
      startedAt: 0,
    };
    this._autoTimers.set(entry.id, timer);
    this._armTimer(entry.id, timer);
  }

  _armTimer(id, timer) {
    timer.startedAt = Date.now();
    timer.handle = setTimeout(() => {
      // Ignore timers that were replaced or cleared in the meantime.
      if (this._autoTimers.get(id) !== timer) {
        return;
      }
      this._autoTimers.delete(id);
      this.hide(id, 'timeout');
    }, timer.remaining);
  }

  _clearAutoTimer(id) {
    const timer = this._autoTimers.get(id);
    if (timer) {
      clearTimeout(timer.handle);
      this._autoTimers.delete(id);
    }
  }

  _clearExitTimer(id) {
    const handle = this._exitTimers.get(id);
    if (handle != null) {
      clearTimeout(handle);
      this._exitTimers.delete(id);
    }
  }

  _beginExit(entry, reason, notify = true) {
    this._clearAutoTimer(entry.id);
    const index = this._entries.indexOf(entry);
    if (index === -1) {
      return;
    }
    this._entries[index] = {
      ...entry,
      status: 'exiting',
      paused: false,
      reason,
    };

    const wait = (entry.options.animationDuration || 0) + EXIT_SAFETY_MARGIN;
    this._clearExitTimer(entry.id);
    this._exitTimers.set(
      entry.id,
      setTimeout(() => {
        this._exitTimers.delete(entry.id);
        this.remove(entry.id);
      }, wait),
    );

    if (notify) {
      this._emit();
      safeCall(entry.options.onDismiss, reason, entry.id);
    }
  }
}
