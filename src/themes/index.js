import light from './light';
import dark from './dark';

const builtIn = { light, dark };

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Recursively merges `override` into `base` without mutating either. */
export function deepMerge(base, override) {
  if (!isPlainObject(override)) {
    return base;
  }
  const result = { ...base };
  Object.keys(override).forEach(key => {
    const value = override[key];
    if (value === undefined) {
      return;
    }
    result[key] =
      isPlainObject(value) && isPlainObject(base[key])
        ? deepMerge(base[key], value)
        : value;
  });
  return result;
}

/**
 * Builds a theme from a built-in base and partial overrides.
 * createTheme('dark', { borderRadius: 4 })
 */
export function createTheme(base = 'light', overrides = {}) {
  const baseTheme = builtIn[base];
  if (!baseTheme) {
    throw new TypeError(
      `[react-native-toast-message-library] Unknown base theme "${String(
        base,
      )}". Expected "light" or "dark".`,
    );
  }
  return deepMerge(baseTheme, overrides);
}

/**
 * Resolves the provider `theme` prop to a complete theme object.
 * - 'light' | 'dark' -> built-in theme
 * - 'system'         -> built-in theme matching `colorScheme`
 * - object           -> merged over the light theme, or over the theme named
 *                       by its optional `extends` key.
 */
export function resolveTheme(theme = 'light', colorScheme = 'light') {
  if (theme === 'system') {
    return colorScheme === 'dark' ? dark : light;
  }
  if (typeof theme === 'string') {
    if (!builtIn[theme]) {
      throw new TypeError(
        `[react-native-toast-message-library] Unknown theme "${theme}". Use "light", "dark", "system" or a theme object.`,
      );
    }
    return builtIn[theme];
  }
  if (isPlainObject(theme)) {
    const { extends: baseName, ...overrides } = theme;
    return createTheme(baseName || 'light', overrides);
  }
  throw new TypeError(
    '[react-native-toast-message-library] "theme" must be "light", "dark", "system" or an object.',
  );
}

export { light, dark };
