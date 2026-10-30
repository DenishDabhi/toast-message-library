import normalizeToastOptions from '../src/utils/normalizeToastOptions';
import validateProviderProps from '../src/utils/validateProviderProps';

const TITLES = { success: 'Done', error: '', info: 'FYI' };

describe('title', () => {
  test('defaults to the built-in type name', () => {
    expect(normalizeToastOptions({ type: 'success', message: 'x' }).title).toBe('Success');
    expect(normalizeToastOptions({ type: 'custom', message: 'x' }).title).toBe('');
  });

  test('the provider titles replace the built-in names', () => {
    const options = normalizeToastOptions({ type: 'success', message: 'x' }, { titles: TITLES });
    expect(options.title).toBe('Done');
  });

  test('an empty provider title hides the title', () => {
    const options = normalizeToastOptions({ type: 'error', message: 'x' }, { titles: TITLES });
    expect(options.title).toBe('');
  });

  test('a per-toast title wins over the provider titles', () => {
    const options = normalizeToastOptions(
      { type: 'success', title: 'Saved', message: 'x' },
      { titles: TITLES },
    );
    expect(options.title).toBe('Saved');
  });

  test("title '' and title null hide the title, even when the provider has titles", () => {
    ['', null].forEach(title => {
      const options = normalizeToastOptions(
        { type: 'success', title, message: 'x' },
        { titles: TITLES },
      );
      expect(options.title).toBe('');
    });
  });

  test('a numeric title is converted to a string', () => {
    expect(normalizeToastOptions({ title: 7, message: 'x' }).title).toBe('7');
  });
});

describe('message and description', () => {
  test('description is an alias of message', () => {
    const options = normalizeToastOptions({ title: 'Saved', description: 'Done.' });
    expect(options.message).toBe('Done.');
    expect(options.description).toBeUndefined();
  });

  test('description alone is valid for a typed toast', () => {
    expect(() => normalizeToastOptions({ type: 'info', description: 'Only text' })).not.toThrow();
  });

  test('passing both message and description throws', () => {
    expect(() => normalizeToastOptions({ message: 'a', description: 'b' })).toThrow(
      /either "message" or "description"/,
    );
  });

  test('strings and numbers are accepted as the whole argument', () => {
    expect(normalizeToastOptions('Saved').message).toBe('Saved');
    expect(normalizeToastOptions(42).message).toBe('42');
  });

  test('the input object is never mutated', () => {
    const input = Object.freeze({ type: 'info', description: 'x' });
    expect(() => normalizeToastOptions(input)).not.toThrow();
  });
});

describe('empty toasts', () => {
  test('throw when there is no message, no title and no render function', () => {
    expect(() => normalizeToastOptions({})).toThrow(/would be empty/);
    expect(() => normalizeToastOptions({ type: 'custom' })).toThrow(/would be empty/);
    expect(() => normalizeToastOptions({ message: '', title: '' })).toThrow(/would be empty/);
    expect(() => normalizeToastOptions('')).toThrow(/would be empty/);
  });

  test('a typed toast with only a message is fine', () => {
    expect(() => normalizeToastOptions({ type: 'error', message: 'x' })).not.toThrow();
  });

  test('a typed toast with an empty message still has its default title', () => {
    expect(() => normalizeToastOptions({ type: 'error', message: '' })).not.toThrow();
  });

  test('hiding the default title of a typed toast without a message throws', () => {
    expect(() => normalizeToastOptions({ type: 'error', title: '' })).toThrow(/would be empty/);
  });

  test('a render function is enough content', () => {
    expect(() => normalizeToastOptions({ render: () => null })).not.toThrow();
  });
});

describe('invalid options', () => {
  test.each([
    [{ message: 'x', position: 'middle' }, /Invalid position/],
    [{ message: 'x', animation: 'spin' }, /Invalid animation/],
    [{ message: 'x', type: 'danger' }, /Invalid type/],
    [{ message: 'x', duration: -1 }, /"duration" must be a finite number/],
    [{ message: 'x', offsetY: NaN }, /"offsetY" must be a finite number/],
    [{ message: 'x', onPress: 'nope' }, /"onPress" must be a function/],
    [{ message: 'x', closeButton: 'yes' }, /"closeButton" must be a boolean/],
    [{ message: 'x', action: { label: ' ' } }, /"action.label"/],
    [{ message: 'x', id: {} }, /"id" must be a string or a number/],
    [{ message: {} }, /"message" must be a string or number/],
    [{ description: [] }, /"description" must be a string or number/],
    [null, /must be a string, a number or an object/],
  ])('%j throws %s', (input, pattern) => {
    expect(() => normalizeToastOptions(input)).toThrow(TypeError);
    expect(() => normalizeToastOptions(input)).toThrow(pattern);
  });
});

describe('provider props', () => {
  test('accept valid values', () => {
    expect(() =>
      validateProviderProps({
        position: 'bottom-right',
        animation: 'zoom',
        duration: 0,
        animationDuration: 100,
        maxVisible: 2,
        closeButton: true,
        titles: { success: 'Done', error: '' },
        spacing: 8,
        offset: { x: 4, y: 56 },
        insets: { top: 44 },
        global: true,
      }),
    ).not.toThrow();
  });

  test.each([
    [{ position: 'middle' }, /Invalid position/],
    [{ animation: 'spin' }, /Invalid animation/],
    [{ duration: -5 }, /"duration"/],
    [{ maxVisible: 0 }, /"maxVisible" must be an integer >= 1/],
    [{ maxVisible: 1.5 }, /"maxVisible" must be an integer >= 1/],
    [{ closeButton: 'yes' }, /"closeButton" must be a boolean/],
    [{ offset: 5 }, /"offset" must be an object/],
    [{ offset: { y: -1 } }, /"offset.y"/],
    [{ insets: 'big' }, /"insets" must be an object/],
    [{ titles: 'Done' }, /"titles" must be an object/],
    [{ titles: { warn: 'x' } }, /Unknown key "warn"/],
    [{ titles: { success: 5 } }, /"titles.success" must be a string/],
  ])('%j throws %s', (props, pattern) => {
    expect(() => validateProviderProps(props)).toThrow(TypeError);
    expect(() => validateProviderProps(props)).toThrow(pattern);
  });
});
