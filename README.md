# react-native-toast-message-library

Lightweight, customizable toast notifications for React Native.

- Pure JavaScript: no native modules, no linking, no required dependencies.
- Built on the `Animated` API, with a FIFO queue, themes, action buttons, swipe-to-dismiss and accessibility support.
- TypeScript declarations included.

<p align="center">
  <img
    src="https://raw.githubusercontent.com/DenishDabhi/toast-message-library/main/demo/toast-video.gif?v=1.0.2"
    alt="react-native-toast-message-library demo"
    width="320"
  />
</p>

---

## Table of contents

1. [Features](#features)
2. [Compatibility](#compatibility)
3. [Installation](#installation)
4. [Quick start](#quick-start)
5. [Showing toasts](#showing-toasts)
6. [Title and description](#title-and-description)
7. [Positions: top, bottom and more](#positions-top-bottom-and-more)
8. [Safe-area insets and offsets](#safe-area-insets-and-offsets)
9. [Options reference (per toast)](#options-reference-per-toast)
10. [Provider props reference](#provider-props-reference)
11. [Callbacks](#callbacks)
12. [Queue behaviour](#queue-behaviour)
13. [Themes](#themes)
14. [Custom icons and content](#custom-icons-and-content)
15. [Action buttons](#action-buttons)
16. [Animations and reduced motion](#animations-and-reduced-motion)
17. [Accessibility](#accessibility)
18. [TypeScript](#typescript)
19. [Recipes (copy and paste examples)](#recipes-copy-and-paste-examples)
20. [Troubleshooting](#troubleshooting)
21. [Limitations](#limitations)
22. [Development](#development)
23. [Publishing](#publishing)
24. [Contributing](#contributing) · [License](#license)

---

## Features

- Types: `success`, `error`, `warning`, `info`, `custom`
- Seven positions: `top`, `bottom`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right` (chosen per toast)
- Custom **title** and **description**, or remove either one (per toast or for every toast of a type)
- Safe-area aware, with extra `insets`, provider `offset` and per-toast `offsetX` / `offsetY`
- Animations: `fade`, `slide`, `zoom`, `none` (native driver, reduced-motion aware)
- Auto-dismiss, persistent toasts (`duration: 0`); the timer pauses while the user touches or swipes a toast
- FIFO queue with `maxVisible`; dismiss by id, `hideAll()`, `isVisible()`
- Close button, leading icon, action button, progress bar, swipe-to-dismiss, tap handler
- Update a toast in place by re-using its `id` (for example "Uploading…" → "Done")
- `onShow`, `onPress`, `onAction`, `onDismiss(reason)` callbacks
- Light / dark / system themes, `createTheme()`, per-toast style overrides, custom icons and fully custom content
- Accessibility roles and labels, Android live region, throttled iOS announcements
- Optional vibration feedback (`haptics`)

## Compatibility

| What                               | Status                                                                                                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Native 0.88.0 / React 19.3.0 | **Verified**: unit tests (Jest) and Metro bundling for Android and iOS                                                                                                 |
| Real devices / emulators           | **Not verified in this repository's CI environment.** Run the demo app before relying on visuals.                                                                      |
| Other RN / React versions          | **Not verified.** Peer ranges (`react >=18`, `react-native >=0.72`) are lower bounds based on the APIs used (`useSyncExternalStore` needs React 18), not test results. |
| New / Old Architecture             | Not separately tested. No native code is involved.                                                                                                                     |

## Installation

```sh
npm install react-native-toast-message-library

# optional but recommended: exact safe-area insets (notch, status bar, home indicator)
npm install react-native-safe-area-context
```

No pods, no linking, no Gradle changes.

## Quick start

**Step 1 – wrap your app once, near the root.** If you use `react-native-safe-area-context`, put `SafeAreaProvider` outside `ToastProvider`.

```jsx
// App.js
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toast-message-library';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider
        position="top"
        duration={3000}
        animation="slide"
        maxVisible={3}
      >
        <Home />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
```

**Step 2 – show a toast from any component below the provider.**

```jsx
import { Button } from 'react-native';
import { useToast } from 'react-native-toast-message-library';

function Home() {
  const toast = useToast();
  return (
    <Button
      title="Save"
      onPress={() =>
        toast.success({
          title: 'Saved',
          description: 'Your changes have been saved.',
        })
      }
    />
  );
}
```

The provider renders its children followed by the toast overlay inside a wrapper `View` with `flex: 1` (change it with the `style` prop).

## Showing toasts

```js
const toast = useToast();

toast.show(options | 'message');   // -> id
toast.success(message, options);   // -> id   (also: error / warning / info)
toast.hide(id);                    // -> boolean (true if a visible or queued toast was dismissed)
toast.hideAll();                   // -> number of toasts dismissed
toast.isVisible(id?);              // -> boolean (without an id: is any toast visible?)
```

- `success`, `error`, `warning` and `info` accept a string, a number **or** an options object as the first argument. The type is always forced to the method's type.
- Invalid options **throw a `TypeError`** that explains the problem (unknown `position`, negative `duration`, non-function callbacks, nothing to show, …). Nothing is silently ignored.
- `useToast()` outside a `ToastProvider` throws an error telling you to add one.
- The returned object is stable: components that call `useToast()` do not re-render when toasts change.

### Global API (opt-in, for code outside React)

```jsx
import { ToastProvider, Toast } from 'react-native-toast-message-library';

<ToastProvider global>…</ToastProvider>;

// anywhere: services, API clients, interceptors
Toast.error('Network request failed');
```

`global` registers that provider when it mounts and unregisters it on unmount. If no global provider is mounted, `Toast.*` **throws** (it never fails silently). With several global providers the most recently mounted one wins. Prefer the hook inside components.

---

## Title and description

Every toast has two optional text parts:

| Part                        | Option                                                  | Default                                                                      |
| --------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Title** (bold heading)    | `title`                                                 | The type name: `Success`, `Error`, `Warning`, `Info` (no title for `custom`) |
| **Description** (body text) | `message` or `description` (identical; use one of them) | none                                                                         |

### Change them

```js
// 1) Custom title + custom description
toast.success({
  title: 'Profile saved',
  description: 'Everyone can see your new photo.',
});

// 2) Shortcut form: first argument is the description, the title comes from the options
toast.error('Card declined.', { title: 'Payment failed' });

// 3) `message` and `description` are the same thing
toast.info({ title: 'Update', message: 'Version 2.0 is available.' });
```

### Remove them

```js
// Remove the title: pass '' or null. Only the description is shown.
toast.error('Could not reach the server.', { title: '' });

// Remove the description: just leave it out. Only the title is shown.
toast.info({ title: 'Sync finished' });
```

A toast must show something. A toast with an empty title **and** an empty description (and no `render`) throws a `TypeError`.

### Change the default title of every toast of a type

Use the `titles` prop on the provider. This is also the way to translate the default titles.

```jsx
<ToastProvider
  titles={{
    success: 'Done',
    error: 'Something went wrong',
    warning: 'Heads up',
    info: 'FYI',
  }}
/>
```

Hide the default title for all toasts (a per-toast `title` still works):

```jsx
<ToastProvider titles={{ success: '', error: '', warning: '', info: '' }} />
```

Order of priority for the title: **per-toast `title`** → **provider `titles[type]`** → **built-in type name**.

### Style the title and description

```js
toast.success({
  title: 'Saved',
  description: 'All changes are synced.',
  titleStyle: { fontSize: 18, letterSpacing: 0.5 },
  messageStyle: { fontStyle: 'italic' },
  textColor: '#0B3D2E', // colour of both
});
```

Global sizes, weights and fonts are set in the theme: `typography: { titleSize, titleWeight, messageSize, messageWeight, fontFamily }` (see [Themes](#themes)).

### Change the text of a toast that is already visible

Re-use the `id`. The toast is updated in place and its timer (and progress bar) restarts.

```js
const id = toast.show({
  id: 'upload',
  type: 'info',
  title: 'Uploading',
  description: '0%',
  duration: 0,
});
// later
toast.show({
  id: 'upload',
  type: 'success',
  title: 'Uploaded',
  description: 'Your file is ready.',
  duration: 3000,
});
```

> Screen readers: the accessibility label is built as `"<type>. <title>. <description>"`. If you hide the title, the type is still announced. Set `accessibilityLabel` to override it completely.

---

## Positions: top, bottom and more

`position` is chosen per toast (default `'top'`, or the provider's `position`):

| Position                      | Where it appears                  |
| ----------------------------- | --------------------------------- |
| `top`                         | Top edge, centred                 |
| `bottom`                      | Bottom edge, centred              |
| `center`                      | Middle of the screen              |
| `top-left`, `top-right`       | Top edge, aligned left / right    |
| `bottom-left`, `bottom-right` | Bottom edge, aligned left / right |

```js
toast.success('Saved', { position: 'top' });
toast.error('Failed', { position: 'bottom' });
toast.info('Hello', { position: 'bottom-right' });
```

Set a default for all toasts on the provider and override it when needed:

```jsx
<ToastProvider position="bottom">…</ToastProvider>;
toast.info('This one is on top', { position: 'top' });
```

How toasts stack:

- Toasts that share a position stack in the order they were shown (oldest first, newest last). The gap between them is `spacing` (provider prop, default `10`).
- At most `maxVisible` toasts are on screen in total; the rest wait in the [queue](#queue-behaviour).
- Toasts are at most **480 dp** wide and always keep a **16 dp** margin from the screen sides.
- Each position is its own stack, so a `top` toast and a `bottom` toast can be visible at the same time.

---

## Safe-area insets and offsets

Three things control the distance between a toast and the screen edges. They add up.

| Setting                   | Where                                                   | What it does                                                                                                      |
| ------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **`insets`**              | `<ToastProvider insets={{ top, bottom, left, right }}>` | The "unsafe" areas of the screen: status bar / notch at the top, home indicator at the bottom.                    |
| **`offset`**              | `<ToastProvider offset={{ x, y }}>`                     | Extra distance for **every** toast: `y` away from the top or bottom edge, `x` away from the left and right sides. |
| **`offsetX` / `offsetY`** | per toast option                                        | Extra distance for **one** toast, added on top of the provider `offset`.                                          |

Resulting distance from the edge:

```
top toasts:     insets.top    + offset.y + toast.offsetY
bottom toasts:  insets.bottom + offset.y + toast.offsetY
left side:      16 + insets.left  + offset.x (+ toast.offsetX for *-left positions)
right side:     16 + insets.right + offset.x (+ toast.offsetX for *-right positions)
```

Notes: `center` toasts ignore `offsetY` and `offset.y`. For centred positions (`top`, `bottom`, `center`) a per-toast `offsetX` makes the toast narrower on both sides. All offsets must be numbers `>= 0`.

### Where do the insets come from?

In this order:

1. The `insets` prop of `ToastProvider` (any side you pass wins; sides you leave out are taken from the next source).
2. `react-native-safe-area-context`, if it is installed **and** your app is wrapped in `SafeAreaProvider`. This is exact and recommended.
3. A built-in fallback: Android `top` = status-bar height, `bottom` = 0; iOS `top` = 47, `bottom` = 34 (conservative notch values).

### Examples

**Recommended: let safe-area-context do it.** Nothing else is needed.

```jsx
<SafeAreaProvider>
  <ToastProvider>
    <App />
  </ToastProvider>
</SafeAreaProvider>
```

**Set the insets yourself** (no safe-area library):

```jsx
<ToastProvider insets={{ top: 44, bottom: 34 }}>
```

Only one side is fine; the other sides use the automatic value:

```jsx
<ToastProvider insets={{ bottom: 24 }}>
```

**Keep toasts below your own header** (56 dp tall):

```jsx
<ToastProvider offset={{ y: 56 }} position="top">
```

**Keep bottom toasts above a bottom tab bar** (React Navigation example):

```jsx
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

function Screen() {
  const toast = useToast();
  const tabBarHeight = useBottomTabBarHeight();
  const saved = () =>
    toast.success('Saved', { position: 'bottom', offsetY: tabBarHeight });
  // ...
}
```

…or for the whole app, if the tab bar is always visible:

```jsx
<ToastProvider position="bottom" offset={{ y: 64 }}>
```

**Move one toast** away from the edge or side:

```js
toast.info('A bit lower', { position: 'top', offsetY: 24 });
toast.info('Narrower', { position: 'top-right', offsetX: 20 });
```

**More space at the sides for every toast:**

```jsx
<ToastProvider offset={{ x: 8 }}>   // 16 + 8 = 24 dp from each side
```

> The keyboard is not handled automatically. A `bottom` toast can be covered by the keyboard; use `offsetY` (for example the keyboard height from `Keyboard.addListener`) or show the toast at `top`.

---

## Options reference (per toast)

| Option                                                     | Type                                                      | Default                                | Description                                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `id`                                                       | string \| number                                          | generated                              | Re-using the id of a visible or queued toast **updates it in place** and restarts its timer |
| `type`                                                     | `'success' \| 'error' \| 'warning' \| 'info' \| 'custom'` | `'custom'`                             | Controls colours, icon and default title                                                    |
| `title`                                                    | string \| number \| null                                  | type name (or provider `titles[type]`) | `''` or `null` hides the title                                                              |
| `message`                                                  | string \| number                                          | –                                      | The description. At least a title, a message or `render` is needed                          |
| `description`                                              | string \| number                                          | –                                      | Alias of `message`. Do not pass both                                                        |
| `duration`                                                 | number (ms)                                               | `3000`                                 | `0` = persistent                                                                            |
| `position`                                                 | see [Positions](#positions-top-bottom-and-more)           | `'top'`                                |                                                                                             |
| `animation`                                                | `'fade' \| 'slide' \| 'zoom' \| 'none'`                   | `'slide'`                              |                                                                                             |
| `animationDuration`                                        | number (ms)                                               | `250`                                  |                                                                                             |
| `offsetX`, `offsetY`                                       | number (>= 0)                                             | –                                      | Extra distance on top of the provider `offset` ([details](#safe-area-insets-and-offsets))   |
| `icon`                                                     | `false` \| element \| `({type,color,size}) => node`       | built-in glyph                         |                                                                                             |
| `render`                                                   | `({id,type,hide,colors,theme}) => node`                   | –                                      | Replaces icon + title + message                                                             |
| `closeButton`                                              | boolean                                                   | `false`                                | Accessible "Dismiss notification" button                                                    |
| `swipeToDismiss`                                           | boolean                                                   | `true`                                 | Horizontal swipe                                                                            |
| `progress`                                                 | boolean                                                   | `false`                                | Remaining-time bar (only when `duration > 0`)                                               |
| `haptics`                                                  | boolean                                                   | `false`                                | Vibration, see [Limitations](#limitations)                                                  |
| `action`                                                   | `{ label, accessibilityLabel? }`                          | –                                      | Action button                                                                               |
| `dismissOnAction`                                          | boolean                                                   | `true`                                 |                                                                                             |
| `dismissOnPress`                                           | boolean                                                   | `false`                                |                                                                                             |
| `backgroundColor`, `textColor`, `borderColor`, `iconColor` | string                                                    | theme                                  |                                                                                             |
| `borderRadius`, `padding`                                  | number                                                    | theme                                  |                                                                                             |
| `shadow`                                                   | `false` \| `{color,opacity,radius,offsetY,elevation}`     | theme                                  |                                                                                             |
| `containerStyle`, `titleStyle`, `messageStyle`             | style                                                     | –                                      |                                                                                             |
| `accessibilityLabel`, `closeAccessibilityLabel`            | string                                                    | generated                              |                                                                                             |
| `onShow(id)`                                               | function                                                  | –                                      | Called when the toast becomes visible (after any time in the queue)                         |
| `onPress({id,type,hide})`                                  | function                                                  | –                                      | Toast body pressed                                                                          |
| `onAction({id,type,hide})`                                 | function                                                  | –                                      | Action button pressed                                                                       |
| `onDismiss(reason, id)`                                    | function                                                  | –                                      | See [Callbacks](#callbacks)                                                                 |

## Provider props reference

Defaults set on the provider apply to every toast that does not override them. Changing a provider prop affects toasts shown afterwards. Invalid values throw a `TypeError`.

| Prop                                                   | Type                                             | Default              | Description                                   |
| ------------------------------------------------------ | ------------------------------------------------ | -------------------- | --------------------------------------------- |
| `theme`                                                | `'light' \| 'dark' \| 'system' \| object`        | `'light'`            | See [Themes](#themes)                         |
| `position`                                             | position                                         | `'top'`              | Default position                              |
| `duration`                                             | number (ms)                                      | `3000`               | Default duration                              |
| `animation`                                            | animation                                        | `'slide'`            |                                               |
| `animationDuration`                                    | number (ms)                                      | `250`                |                                               |
| `maxVisible`                                           | integer >= 1                                     | `3`                  | Toasts on screen at once; the rest are queued |
| `closeButton`, `swipeToDismiss`, `progress`, `haptics` | boolean                                          | see options          | Defaults for every toast                      |
| `titles`                                               | `{ success?, error?, warning?, info?, custom? }` | –                    | Default title per type; `''` hides it         |
| `spacing`                                              | number                                           | theme `spacing` (10) | Gap between stacked toasts                    |
| `offset`                                               | `{ x?, y? }`                                     | `{ x: 0, y: 0 }`     | Extra distance from the screen edges          |
| `insets`                                               | `{ top?, bottom?, left?, right? }`               | automatic            | Overrides the detected safe-area insets       |
| `global`                                               | boolean                                          | `false`              | Registers this provider for the `Toast` API   |
| `style`                                                | style                                            | `{ flex: 1 }`        | Style of the wrapper `View`                   |

## Callbacks

- `onDismiss(reason, id)` is called **exactly once**, at the moment dismissal starts (before the exit animation), for visible toasts and for toasts cancelled while still queued. `reason` is one of `'timeout' | 'manual' | 'swipe' | 'close' | 'action' | 'press' | 'hideAll'`.
- `onAction` fires once when `dismissOnAction` is `true` (default) even if the button is tapped repeatedly; with `dismissOnAction: false` it fires on every press.
- Exceptions thrown inside callbacks are caught and logged with `console.error`; they cannot corrupt the queue.

## Queue behaviour

- At most `maxVisible` toasts are on screen; further requests wait in a **FIFO** queue.
- A toast occupies its slot until its **exit animation has finished**, then the oldest queued toast is promoted. Its timer starts when it becomes visible, not when it was requested.
- `hide(id)` also cancels a queued toast; `hideAll()` clears the queue and dismisses visible toasts.
- Raising `maxVisible` at runtime promotes queued toasts immediately.
- Generated ids are unique and never collide with ids you pass.

## Themes

```jsx
import { ToastProvider, createTheme } from 'react-native-toast-message-library';

<ToastProvider theme="dark" />                     // 'light' | 'dark' | 'system'

<ToastProvider
  theme={createTheme('dark', {
    borderRadius: 4,
    typography: { fontFamily: 'Inter', titleSize: 16 },
    colors: { success: { background: '#052E1B', text: '#fff' } },
  })}
/>

<ToastProvider theme={{ extends: 'dark', padding: 20 }} />   // a plain object also works
```

A theme object is deep-merged over the light theme (or the one named by `extends`). Every key (`colors.<type>.{background,text,border,icon,iconText}`, `borderRadius`, `borderWidth`, `padding`, `spacing`, `iconSize`, `typography`, `shadow`, `actionColor`, `closeColor`, `progressTrack`) is listed in `src/themes/light.js`.

## Custom icons and content

```jsx
toast.show({
  type: 'custom',
  message: 'Deployed',
  icon: ({ color, size }) => <RocketIcon color={color} size={size} />,
});

toast.success('No icon here', { icon: false });

toast.show({
  type: 'custom',
  render: ({ hide, colors }) => (
    <Text style={{ color: colors.text }} onPress={hide}>
      Fully custom: tap to close
    </Text>
  ),
});
```

## Action buttons

```jsx
toast.show({
  type: 'success',
  title: 'Message deleted',
  duration: 6000,
  action: { label: 'Undo' },
  onAction: () => restoreMessage(),
  onDismiss: reason => reason === 'timeout' && permanentlyDelete(),
});
```

## Animations and reduced motion

All animations animate only `opacity` and `transform`, so they use the native driver. The progress bar animates `width` (a layout property) and therefore runs on the JS thread; it is a 3 dp element. When the system "reduce motion" setting is on, `slide` and `zoom` are replaced by `fade`; `none` stays `none`. After a toast exits, toasts stacked next to it move into place without animation.

## Accessibility

- Each toast is an `alert` (or a `button` when `onPress` is set) with a label such as `"Error. Disk full"`, so the type is available to screen readers and not only conveyed by colour or icon. The decorative icon glyph is hidden from assistive technology.
- Android: `accessibilityLiveRegion="polite"`. iOS: announcements via `announceForAccessibility`, throttled to one per 1.5 s so a burst of queued toasts does not interrupt VoiceOver repeatedly.
- Close and action buttons are labelled and have touch targets of at least 44 dp (including `hitSlop`).
- Text scales with the system font size up to 1.6×.

**Not covered:** the screen-reader behaviour follows platform guidelines but has not been tested on real TalkBack / VoiceOver. Toasts that disappear on a timer can be missed by assistive-technology users; use `duration: 0` plus a close button for important messages.

## TypeScript

Declarations ship in `types/index.d.ts` (checked by `npm run typecheck`).

```ts
import {
  useToast,
  type ToastOptions,
} from 'react-native-toast-message-library';

const opts: ToastOptions = {
  type: 'info',
  title: 'Hello',
  description: 'World',
  position: 'bottom-right',
  offsetY: 12,
};
useToast().show(opts);
```

Exported types include `ToastOptions`, `ToastApi`, `ToastProviderProps`, `ToastTitles`, `ToastTheme`, `ToastThemeOverrides`, `ToastType`, `ToastPosition`, `ToastAnimation`, `ToastDismissReason` and `Insets`.

---

## Recipes (copy and paste examples)

### 1. Result of an API call

```js
async function save() {
  try {
    await api.save();
    toast.success({ title: 'Saved', description: 'Your changes are live.' });
  } catch (error) {
    toast.error(error.message, { title: 'Could not save', duration: 5000 });
  }
}
```

### 2. Loading → success / error with one toast

```js
const ID = 'upload';
toast.show({
  id: ID,
  type: 'info',
  title: 'Uploading…',
  duration: 0,
  closeButton: false,
});
try {
  await upload();
  toast.show({
    id: ID,
    type: 'success',
    title: 'Uploaded',
    description: 'Your file is ready.',
  });
} catch {
  toast.show({
    id: ID,
    type: 'error',
    title: 'Upload failed',
    duration: 0,
    closeButton: true,
  });
}
```

### 3. Undo

```js
toast.show({
  type: 'success',
  title: 'Item deleted',
  action: { label: 'Undo' },
  duration: 6000,
  onAction: restoreItem,
  onDismiss: reason => reason === 'timeout' && deleteForever(),
});
```

### 4. Toast from an API client or Redux middleware (outside React)

```jsx
<ToastProvider global>…</ToastProvider>
```

```js
// api.js
import { Toast } from 'react-native-toast-message-library';

axios.interceptors.response.use(undefined, error => {
  Toast.error(error.message, { title: 'Network error' });
  return Promise.reject(error);
});
```

### 5. Translate or remove all default titles

```jsx
<ToastProvider titles={{ success: 'સફળ', error: 'ભૂલ', warning: 'ચેતવણી', info: 'માહિતી' }} />
<ToastProvider titles={{ success: '', error: '', warning: '', info: '' }} />  {/* no titles */}
```

### 6. Bottom toasts that avoid the home indicator and a tab bar

```jsx
<SafeAreaProvider>
  <ToastProvider position="bottom" offset={{ y: 56 }}>
    …
  </ToastProvider>
</SafeAreaProvider>
```

### 7. Persistent error with a close button and a retry action

```js
toast.error('The server is not reachable.', {
  title: 'Offline',
  duration: 0,
  closeButton: true,
  action: { label: 'Retry' },
  dismissOnAction: false,
  onAction: ({ hide }) => retry().then(hide),
});
```

### 8. Brand-coloured toast

```js
toast.show({
  type: 'custom',
  title: 'Welcome back',
  description: 'Good to see you again.',
  backgroundColor: '#1E1B4B',
  textColor: '#EEF2FF',
  borderColor: '#818CF8',
  iconColor: '#C7D2FE',
  icon: ({ color }) => <Text style={{ color, fontSize: 22 }}>👋</Text>,
});
```

### 9. Theme follows the device

```jsx
<ToastProvider theme="system">…</ToastProvider>
```

---

## Troubleshooting

| Symptom                                                       | Cause / fix                                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `useToast() was called outside of a <ToastProvider>`          | Render the component below the provider (usually in `App.js`).                         |
| `Toast.* was called but no <ToastProvider global> is mounted` | Add the `global` prop, or use `useToast()`.                                            |
| `Invalid position "…"` or another `TypeError`                 | Fix the option or prop; the message lists the allowed values.                          |
| `the toast would be empty`                                    | Give the toast a `message`/`description`, a non-empty `title` or a `render` function.  |
| `use either "message" or "description"`                       | Pass only one of them.                                                                 |
| Toast hidden behind a modal / native screen                   | See [Limitations](#limitations).                                                       |
| Toast under the notch / status bar                            | Install `react-native-safe-area-context` and use `SafeAreaProvider`, or pass `insets`. |
| Toast too close to the header or tab bar                      | Use `offset={{ y }}` on the provider or `offsetY` on the toast.                        |
| Bottom toast hidden by the keyboard                           | Use `offsetY` or show it at `top`.                                                     |
| Nothing vibrates with `haptics`                               | Android needs `<uses-permission android:name="android.permission.VIBRATE" />`.         |
| Layout broken because of the wrapper View                     | Pass `style` to the provider.                                                          |

## Limitations

- Toasts render inside the React tree. They appear **under** React Native `Modal`s and native-presented screens (for example native-stack modal presentations). Render another `ToastProvider` inside such a modal.
- The fallback insets (used without `react-native-safe-area-context`) are approximations. Install the library for exact values.
- The keyboard is not tracked automatically (see the offsets section).
- `center` toasts ignore `offsetY`.
- `haptics` uses the built-in `Vibration` API: Android honours short vibrations (needs the `VIBRATE` permission), iOS ignores the duration and vibrates for a fixed ~0.4 s. It is not a Taptic Engine integration.
- Swipe-to-dismiss uses `PanResponder` (horizontal swipes only). It is implemented but **not covered by automated tests** (gesture simulation is not available in the Jest setup); verify it on a device.
- Visual rendering, animation smoothness and screen-reader behaviour have not been verified on a device or emulator.
- Toasts next to a removed toast jump into position (no layout animation).
- `onDismiss` fires when dismissal starts, not when the exit animation ends.

## Development

The repository root is both the library and a React Native CLI demo app (no Expo). Node.js 22.11 or newer is needed for the demo app's toolchain (React Native 0.88); the published library itself has no Node requirement.

```sh
npm install
npm test               # Jest
npm run lint
npm run typecheck
npm pack --dry-run     # inspect the published file list

npm start              # Metro (terminal 1)
npm run android        # terminal 2; needs Android SDK + JDK
npm run ios            # macOS + Xcode; cd ios && bundle exec pod install first
```

Layout: `src/` (the library: `manager` = queue + timers, `components`, `animations`, `themes`, `utils`), `types/` (TypeScript declarations), `__tests__/`, and `App.js` + `demo/` (the demo app).

## Publishing

Current release: **1.0.2**. Before the first publish of a new version:

```sh
# 1. Update CHANGELOG.md (new version heading + date) and the "version" in package.json
npm ci
npm run validate          # lint + typecheck + tests + npm pack --dry-run
npm pack --dry-run        # should list only src/, types/index.d.ts, README.md, CHANGELOG.md, LICENSE, package.json

# 2. Publish
npm login                 # interactive; never commit tokens
npm publish               # publishConfig.access is already "public"

# 3. Verify, tag and push
npm view react-native-toast-message-library version
git tag v1.0.2 && git push origin v1.0.2
```

For every later release (semantic versioning: patch = fixes, minor = backwards-compatible features, major = breaking changes):

```sh
# update CHANGELOG.md first
npm version patch         # or minor / major; bumps package.json and package-lock.json and creates the git tag
npm publish
git push --follow-tags
```

> An already published version can never be published again. If `npm publish` says "cannot publish over the previously published versions", bump the version first.

### Release checklist

- [ ] `npm run validate` passes
- [ ] `CHANGELOG.md` entry added and dated; `version` bumped in `package.json` (and `package-lock.json`)
- [ ] Demo app run on an Android device/emulator **and** an iOS simulator (swipe, queue, themes, insets, a11y spot check)
- [ ] `repository`, `bugs` and `homepage` fields are filled in `package.json` (they make the npm page link to your GitHub)
- [ ] `npm pack --dry-run` file list reviewed
- [ ] Published, verified with `npm view`, tag pushed

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © Denish Dabhi