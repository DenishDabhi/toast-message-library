import { DEFAULT_CONFIG, TYPE_LABELS } from './constants';
import validateToastOptions from './validateToastOptions';
import { fail } from './validation';

/**
 * Resolves the title of a toast.
 * Priority: per-toast `title` > provider `titles[type]` > built-in type name.
 * `''` or `null` hides the title. Returns the title and where it came from.
 */
function resolveTitle(raw, type, titles) {
  if (raw.title !== undefined) {
    return {
      title: raw.title === null ? '' : String(raw.title),
      titleSource: 'option',
    };
  }
  if (titles && typeof titles[type] === 'string') {
    return { title: titles[type], titleSource: 'provider' };
  }
  return { title: TYPE_LABELS[type] || '', titleSource: 'default' };
}

/**
 * Converts the argument passed to `show()` (string, number or object) into a
 * fully resolved options object by applying the provider defaults. The result
 * is a new object; the caller's input is never mutated.
 *
 * - `description` is an alias of `message`; the result only has `message`.
 * - `title` is always a string in the result ('' means "no title").
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

  const body = raw.message != null ? raw.message : raw.description;
  delete resolved.description;
  resolved.message = body != null ? String(body) : undefined;

  const { title, titleSource } = resolveTitle(
    raw,
    resolved.type,
    base.titles,
  );
  resolved.title = title;
  resolved.titleSource = titleSource;

  const hasMessage = resolved.message !== undefined && resolved.message !== '';
  if (!hasMessage && title === '' && typeof raw.render !== 'function') {
    fail(
      'the toast would be empty. Provide a "message" (or "description"), a non-empty "title" or a "render" function.',
    );
  }

  return resolved;
}
