import { ANIMATIONS, POSITIONS, TOAST_TYPES } from './constants';
import {
  checkBoolean,
  checkEnum,
  checkFunction,
  checkNonNegativeNumber,
  fail,
  isPlainObject,
} from './validation';

/**
 * Validates the shape of an options object (after strings have been converted
 * to objects). Throws a TypeError with an actionable message on the first
 * problem found.
 *
 * Whether the toast would be empty is checked later, in
 * normalizeToastOptions, because it depends on the resolved title (the
 * per-toast title, the provider `titles` or the built-in type name).
 */
export default function validateToastOptions(options) {
  if (!isPlainObject(options)) {
    fail(
      'toast options must be a string, a number or an object, e.g. toast.show({ message: "Saved" }).',
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

  ['title', 'message', 'description'].forEach(key => {
    const value = options[key];
    if (
      value != null &&
      typeof value !== 'string' &&
      typeof value !== 'number'
    ) {
      fail(`"${key}" must be a string or number, received ${typeof value}.`);
    }
  });

  if (options.message != null && options.description != null) {
    fail(
      'use either "message" or "description", not both. They are the same option.',
    );
  }

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

  return options;
}
