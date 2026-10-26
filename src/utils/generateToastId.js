let counter = 0;

/**
 * Returns an id that is unique for the lifetime of the JS runtime.
 * A monotonically increasing counter is enough because ids never leave the app.
 */
export default function generateToastId() {
  counter += 1;
  return `toast-${counter}`;
}
