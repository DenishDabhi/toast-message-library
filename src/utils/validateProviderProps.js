import { ANIMATIONS, POSITIONS, TOAST_TYPES } from './constants';
import {
  checkBoolean,
  checkEnum,
  checkNonNegativeNumber,
  fail,
  isPlainObject,
} from './validation';

/**
 * Validates the props of <ToastProvider>. Throws a TypeError with an
 * actionable message on the first problem found, so a typo such as
 * `position="middle"` fails loudly instead of producing toasts that are
 * "visible" but never drawn.
 *
 * `theme` is validated by `resolveTheme`, which already throws.
 */
export default function validateProviderProps(props) {
  checkEnum(props, 'position', POSITIONS);
  checkEnum(props, 'animation', ANIMATIONS);
  checkNonNegativeNumber(props, 'duration');
  checkNonNegativeNumber(props, 'animationDuration');
  checkNonNegativeNumber(props, 'spacing');

  const { maxVisible } = props;
  if (maxVisible != null && (!Number.isInteger(maxVisible) || maxVisible < 1)) {
    fail(`"maxVisible" must be an integer >= 1, received ${String(maxVisible)}.`);
  }

  ['closeButton', 'swipeToDismiss', 'progress', 'haptics', 'global'].forEach(
    key => checkBoolean(props, key),
  );

  const { offset, insets, titles } = props;

  if (offset != null) {
    if (!isPlainObject(offset)) {
      fail('"offset" must be an object like { x: 8, y: 56 }.');
    }
    checkNonNegativeNumber(offset, 'x', 'offset.x');
    checkNonNegativeNumber(offset, 'y', 'offset.y');
  }

  if (insets != null && !isPlainObject(insets)) {
    fail('"insets" must be an object like { top: 44, bottom: 34 }.');
  }

  if (titles != null) {
    if (!isPlainObject(titles)) {
      fail('"titles" must be an object like { success: "Done", error: "" }.');
    }
    Object.keys(titles).forEach(key => {
      if (!TOAST_TYPES.includes(key)) {
        fail(
          `Unknown key "${key}" in "titles". Expected one of: ${TOAST_TYPES.join(
            ', ',
          )}.`,
        );
      }
      if (titles[key] != null && typeof titles[key] !== 'string') {
        fail(
          `"titles.${key}" must be a string (use '' to hide the title), received ${typeof titles[
            key
          ]}.`,
        );
      }
    });
  }
}
