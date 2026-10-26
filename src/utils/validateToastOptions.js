import { ANIMATIONS, POSITIONS, TOAST_TYPES } from './constants';

const PREFIX = '[react-native-toast-message-library]';

function fail(message) {
  throw new TypeError(`${PREFIX} ${message}`);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkFunction(options, key) {
  if (options[key] != null && typeof options[key] !== 'function') {
    fail(`"${key}" must be a function, received ${typeof options[key]}.`);
  }
}

function checkEnum(options, key, allowed) {
  if (options[key] != null && !allowed.includes(options[key])) {
    fail(
      `Invalid ${key} "${String(
        options[key],
      )}". Expected one of: ${allowed.join(', ')}.`,
    );
  }
}

function checkNonNegativeNumber(options, key) {
  const value = options[key];
  if (value == null) {
    return;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    fail(`"${key}" must be a finite number >= 0, received ${String(value)}.`);
  }
}

function checkBoolean(options, key) {
  if (options[key] != null && typeof options[key] !== 'boolean') {
    fail(`"${key}" must be a boolean, received ${typeof options[key]}.`);
  }
}

/**
 * Validates an options object (after strings have been converted to objects).
 * Throws a TypeError with an actionable message on the first problem found.
 */
export default function validateToastOptions(options) {
  if (!isPlainObject(options)) {
    fail(
      'toast options must be a string or an object, e.g. toast.show({ message: "Saved" }).',
    );
  }

  checkEnum(options, 'type', TOAST_TYPES);
  checkEnum(options, 'position', POSITIONS);
  checkEnum(options, 'animation', ANIMATIONS);
  checkNonNegativeNumber(options, 'duration');
  checkNonNegativeNumber(options, 'animationDuration');
  checkNonNegativeNumber(options, 'offsetX');
  checkNonNegativeNumber(options, 'offsetY');

  if (
    options.id != null &&
    typeof options.id !== 'string' &&
    typeof options.id !== 'number'
  ) {
    fail('"id" must be a string or a number.');
  }

  ['title', 'message'].forEach(key => {
    const value = options[key];
    if (
      value != null &&
      typeof value !== 'string' &&
      typeof value !== 'number'
    ) {
      fail(`"${key}" must be a string or number, received ${typeof value}.`);
    }
  });

  ['onPress', 'onDismiss', 'onAction', 'onShow', 'render'].forEach(key =>
    checkFunction(options, key),
  );

  [
    'closeButton',
    'swipeToDismiss',
    'progress',
    'haptics',
    'dismissOnPress',
    'dismissOnAction',
  ].forEach(key => checkBoolean(options, key));

  if (options.action != null) {
    if (!isPlainObject(options.action)) {
      fail('"action" must be an object like { label: "Undo" }.');
    }
    if (
      typeof options.action.label !== 'string' ||
      options.action.label.trim() === ''
    ) {
      fail('"action.label" must be a non-empty string.');
    }
  }

  if (
    options.shadow != null &&
    options.shadow !== false &&
    !isPlainObject(options.shadow)
  ) {
    fail('"shadow" must be false or an object.');
  }

  const hasContent =
    options.message != null ||
    (options.title != null && options.title !== '') ||
    typeof options.render === 'function';
  if (!hasContent) {
    fail(
      'a toast needs at least a "message", a "title" or a "render" function.',
    );
  }

  return options;
}
