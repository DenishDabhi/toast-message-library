import { DEFAULT_CONFIG } from './constants';
import validateToastOptions from './validateToastOptions';

/**
 * Converts the argument passed to `show()` (string or object) into a fully
 * resolved options object by applying the provider defaults. The result is a
 * new object; the caller's input is never mutated.
 *
 * @param {string|number|object} input
 * @param {object} defaults provider-level defaults
 */
export default function normalizeToastOptions(input, defaults = {}) {
  const raw =
    typeof input === 'string' || typeof input === 'number'
      ? { message: String(input) }
      : input;

  validateToastOptions(raw);

  const base = { ...DEFAULT_CONFIG, ...defaults };
  const resolved = { ...raw };

  resolved.type = raw.type || 'custom';
  ['position', 'animation', 'animationDuration', 'duration'].forEach(key => {
    resolved[key] = raw[key] != null ? raw[key] : base[key];
  });
  ['closeButton', 'swipeToDismiss', 'progress', 'haptics'].forEach(key => {
    resolved[key] = raw[key] != null ? raw[key] : base[key];
  });
  resolved.dismissOnPress = raw.dismissOnPress === true;
  resolved.dismissOnAction = raw.dismissOnAction !== false;
  resolved.offsetX = raw.offsetX != null ? raw.offsetX : base.offsetX;
  resolved.offsetY = raw.offsetY != null ? raw.offsetY : base.offsetY;
  if (raw.message != null) {
    resolved.message = String(raw.message);
  }
  if (raw.title != null) {
    resolved.title = String(raw.title);
  }

  return resolved;
}
