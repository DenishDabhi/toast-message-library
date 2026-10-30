/**
 * Small validation helpers shared by the toast option validation and the
 * ToastProvider prop validation. Every helper throws a TypeError whose message
 * says what is wrong and what is allowed.
 */

export const PREFIX = '[react-native-toast-message-library]';

export function fail(message) {
  throw new TypeError(`${PREFIX} ${message}`);
}

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function checkFunction(options, key) {
  if (options[key] != null && typeof options[key] !== 'function') {
    fail(`"${key}" must be a function, received ${typeof options[key]}.`);
  }
}

export function checkEnum(options, key, allowed) {
  if (options[key] != null && !allowed.includes(options[key])) {
    fail(
      `Invalid ${key} "${String(
        options[key],
      )}". Expected one of: ${allowed.join(', ')}.`,
    );
  }
}

export function checkNonNegativeNumber(options, key, label = key) {
  const value = options[key];
  if (value == null) {
    return;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    fail(`"${label}" must be a finite number >= 0, received ${String(value)}.`);
  }
}

export function checkBoolean(options, key) {
  if (options[key] != null && typeof options[key] !== 'boolean') {
    fail(`"${key}" must be a boolean, received ${typeof options[key]}.`);
  }
}
