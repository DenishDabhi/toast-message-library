# react-native-toast-message-library

Lightweight, customizable toast notifications for React Native. Pure JavaScript (no native modules, no
required dependencies), built on the `Animated` API, with a FIFO queue, themes, actions, swipe-to-dismiss
and accessibility support. TypeScript declarations included.

## Features

- Types: `success`, `error`, `warning`, `info`, `custom`
- Seven positions: `top`, `bottom`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right` (per toast)
- Animations: `fade`, `slide`, `zoom`, `none` (native driver; reduced-motion aware)
- Auto-dismiss, persistent toasts (`duration: 0`), timer pauses while the user touches or swipes a toast
- FIFO queue with `maxVisible`; dismiss by id, `hideAll()`, `isVisible()`
- Close button, leading icon, action button, progress bar, swipe-to-dismiss, tap handler
- `onShow`, `onPress`, `onAction`, `onDismiss(reason)` callbacks
- Light / dark / system themes, `createTheme()`, per-toast style overrides, custom icons and content
- Safe-area aware (optional `react-native-safe-area-context`)
- Accessibility roles and labels, Android live region, throttled iOS announcements
- Optional vibration feedback (`haptics`)

## Compatibility

| What | Status |
| --- | --- |
| React Native 0.88.0 / React 19.3.0 | **Verified**: unit tests (Jest) and Metro bundling for Android and iOS |
| Real devices / emulators | **Not verified in this repository's CI environment** (no Android SDK or macOS available when it was built). Run the demo app before relying on visuals. |
| Other RN / React versions | **Not verified.** Peer ranges (`react >=18`, `react-native >=0.72`) reflect the APIs used (`useSyncExternalStore` needs React 18) and are lower bounds, not test results. |
| New Architecture / Old Architecture | Not separately tested. No native code is involved. |

## Installation

```sh
npm install react-native-toast-message-library
# optional, recommended: exact safe-area insets
npm install react-native-safe-area-context
```

No pods, no linking, no Gradle changes. If you use `react-native-safe-area-context`, wrap your app in its
`SafeAreaProvider`; without it the library falls back to the Android status-bar height and conservative
iOS notch values (47 top / 34 bottom).

## Quick start

```jsx
import { ToastProvider, useToast } from 'react-native-toast-message-library';

export default function App() {
  return (
    <ToastProvider position="top" duration={3000} animation="slide" maxVisible={3}>
      <Home />
    </ToastProvider>
  );
}

function Home() {
  const toast = useToast();
  return (
    <Button
      title="Save"
      onPress={() => toast.success('Your changes have been saved.')}
    />
  );
}
```

The provider renders its children followed by the toast overlay in a wrapper `View` with `flex: 1`
(change with the `style` prop). Place it near the root, inside `SafeAreaProvider` if you use one.

## Toast methods

```js
const toast = useToast();

toast.show(options | 'message');        // -> id
toast.success(message, options);        // -> id   (also error / warning / info)
toast.hide(id);                         // -> boolean (true if a visible or queued toast was dismissed)
toast.hideAll();                        // -> number of toasts dismissed
toast.isVisible(id?);                   // -> boolean (no id: is any toast visible?)
```

- `success/error/warning/info` accept a string **or** an options object as the first argument; the type is
  always forced to the method's type. By default they show a title ("Success", "Error", …); pass
  `title: ''` to hide it.
- Invalid options **throw a `TypeError`** with an explanation (unknown `position`, negative `duration`,
  non-function callbacks, no `message`/`title`/`render`, …). Nothing is silently ignored.
- `useToast()` outside a `ToastProvider` throws an error telling you to add one.
- The returned object is stable: components using `useToast()` do not re-render when toasts change.

### Global API (opt-in)

```jsx
import { ToastProvider, Toast } from 'react-native-toast-message-library';

<ToastProvider global>…</ToastProvider>

Toast.error('Network request failed');   // usable from services, outside React
```

`global` registers that provider when it mounts and unregisters on unmount. If no global provider is
mounted, `Toast.*` **throws** (it never fails silently). With several global providers the most recently
mounted one wins. Prefer the hook inside components.

## Options (per toast)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string \| number | generated | Reusing the id of a visible/queued toast **updates it in place** and restarts its timer |
| `type` | `'success' \| 'error' \| 'warning' \| 'info' \| 'custom'` | `'custom'` | Controls colours, icon and default title |
| `title` | string \| null | type label | `''`/`null` hides the title |
| `message` | string | – | At least one of `message`, `title`, `render` is required |
| `duration` | number (ms) | `3000` | `0` = persistent |
| `position` | see Positions | `'top'` | |
| `animation` | `'fade' \| 'slide' \| 'zoom' \| 'none'` | `'slide'` | |
| `animationDuration` | number (ms) | `250` | |
| `offsetX`, `offsetY` | number | – | Extra margin on top of the provider `offset` |
| `icon` | `false` \| element \| `({type,color,size}) => node` | built-in glyph | |
| `render` | `({id,type,hide,colors,theme}) => node` | – | Replaces icon + title + message |
| `closeButton` | boolean | `false` | Accessible "Dismiss notification" button |
| `swipeToDismiss` | boolean | `true` | Horizontal swipe |
| `progress` | boolean | `false` | Remaining-time bar (only when `duration > 0`) |
| `haptics` | boolean | `false` | Vibration, see Limitations |
| `action` | `{ label, accessibilityLabel? }` | – | Action button |
| `dismissOnAction` | boolean | `true` | |
| `dismissOnPress` | boolean | `false` | |
| `backgroundColor`, `textColor`, `borderColor`, `iconColor` | string | theme | |
| `borderRadius`, `padding` | number | theme | |
| `shadow` | `false` \| `{color,opacity,radius,offsetY,elevation}` | theme | |
| `containerStyle`, `titleStyle`, `messageStyle` | style | – | |
| `accessibilityLabel`, `closeAccessibilityLabel` | string | generated | |
| `onShow(id)` | function | – | Called when the toast becomes visible (after any time in the queue) |
| `onPress({id,type,hide})` | function | – | Toast body pressed |
| `onAction({id,type,hide})` | function | – | Action button pressed |
| `onDismiss(reason, id)` | function | – | See below |

Provider props: `theme`, `position`, `duration`, `animation`, `animationDuration`, `maxVisible` (3),
`closeButton`, `swipeToDismiss`, `progress`, `haptics`, `spacing`, `offset={{x,y}}`, `insets`, `global`, `style`.
Defaults set on the provider apply to every toast that does not override them; changing a provider prop
affects toasts shown afterwards.

### Callbacks

- `onDismiss(reason, id)` is called **exactly once**, at the moment dismissal starts (before the exit
  animation), for visible toasts and for toasts cancelled while still queued. `reason` is one of
  `'timeout' | 'manual' | 'swipe' | 'close' | 'action' | 'press' | 'hideAll'`.
- `onAction` fires once when `dismissOnAction` is true (default) even if the button is tapped repeatedly;
  with `dismissOnAction: false` it fires on every press.
- Exceptions thrown inside callbacks are caught and logged with `console.error`; they cannot corrupt the queue.

## Positions

`top`, `bottom`, `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`. Each toast can choose its
own; toasts sharing a position stack (oldest first). Toasts are at most 480 dp wide and always keep a
16 dp side margin. Insets come from the `insets` prop, else `react-native-safe-area-context`, else the
fallback described above.

## Queue behaviour

- At most `maxVisible` toasts are on screen; further requests wait in a **FIFO** queue.
- A toast occupies its slot until its **exit animation has finished**, then the oldest queued toast is promoted.
  Its timer starts when it becomes visible, not when it was requested.
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
    typography: { fontFamily: 'Inter' },
    colors: { success: { background: '#052E1B', text: '#fff' } },
  })}
/>

<ToastProvider theme={{ extends: 'dark', padding: 20 }} />  // plain object also works
```

A theme object is deep-merged over the light theme (or the one named by `extends`). See `src/themes/light.js`
for every key (`colors.<type>.{background,text,border,icon,iconText}`, `borderRadius`, `borderWidth`,
`padding`, `spacing`, `iconSize`, `typography`, `shadow`, `actionColor`, `closeColor`, `progressTrack`).

## Custom icons and content

```jsx
toast.show({
  type: 'custom',
  message: 'Deployed',
  icon: ({ color, size }) => <RocketIcon color={color} size={size} />,
});

toast.show({
  type: 'custom',
  render: ({ hide, colors }) => (
    <Text style={{ color: colors.text }} onPress={hide}>Fully custom — tap to close</Text>
  ),
});
```

## Action buttons

```jsx
toast.show({
  type: 'success',
  message: 'Message deleted',
  duration: 6000,
  action: { label: 'Undo' },
  onAction: () => restoreMessage(),
  onDismiss: reason => reason === 'timeout' && permanentlyDelete(),
});
```

## Animations and reduced motion

All animations animate only `opacity` and `transform`, so they use the native driver. The progress bar
animates `width` (a layout property) and therefore runs on the JS thread; it is a 3 dp element. When the
system "reduce motion" setting is on, `slide` and `zoom` are replaced by `fade`; `none` stays `none`.
After a toast exits, toasts stacked below it move into place without animation.

## Accessibility

- Each toast is an `alert` (or a `button` when `onPress` is set) with a label such as
  `"Error. Disk full"`, so the type is available to screen readers and not only conveyed by colour/icon.
  The decorative icon glyph is hidden from assistive technology.
- Android: `accessibilityLiveRegion="polite"`. iOS: announcements via `announceForAccessibility`, throttled
  to one per 1.5 s so a burst of queued toasts does not interrupt VoiceOver repeatedly.
- Close and action buttons are labelled and have ≥ 44 dp touch targets (including `hitSlop`).
- Text scales with the system font size up to 1.6×.

**Not covered:** the screen-reader behaviour has been implemented following platform guidelines but has not
been tested on real TalkBack/VoiceOver. Toasts that disappear on a timer can be missed by assistive
technology users; use `duration: 0` plus a close button for important messages.

## TypeScript

Declarations ship in `types/index.d.ts` (checked by `npm run typecheck`).

```ts
import { useToast, type ToastOptions } from 'react-native-toast-message-library';

const opts: ToastOptions = { type: 'info', message: 'Hi', position: 'bottom-right' };
useToast().show(opts);
```

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `useToast() was called outside of a <ToastProvider>` | Render the component below the provider (usually in `App.js`). |
| `Toast.* was called but no <ToastProvider global> is mounted` | Add the `global` prop, or use `useToast()`. |
| `Invalid position "…"` / other `TypeError` | Fix the option; the message lists the allowed values. |
| Toast hidden behind a modal / native screen | See Limitations. |
| Toast under the notch / status bar | Install `react-native-safe-area-context` and use `SafeAreaProvider`, or pass `insets`. |
| Nothing vibrates with `haptics` | Android needs `<uses-permission android:name="android.permission.VIBRATE" />`. |
| Layout broken because of the wrapper View | Pass `style` to the provider. |

## Limitations

- Toasts render inside the React tree. They appear **under** React Native `Modal`s and native-presented
  screens (e.g. native-stack modal presentations). Render another `ToastProvider` inside such a modal.
- `haptics` uses the built-in `Vibration` API: Android honours short vibrations (needs the `VIBRATE`
  permission), iOS ignores the duration and vibrates for a fixed ~0.4 s. It is not a Taptic Engine integration.
- Swipe-to-dismiss uses `PanResponder` (horizontal swipes only). It is implemented but **not covered by
  automated tests** (gesture simulation is not available in the Jest setup); verify it on a device.
- Visual rendering, animation smoothness, and screen-reader behaviour have not been verified on a device or emulator.
- Toasts below a removed toast jump into position (no layout animation).
- `onDismiss` fires when dismissal starts, not when the exit animation ends.

## Development

The repository root is both the library and a React Native CLI demo app (no Expo).

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

Layout: `src/` (the library: `manager` = queue + timers, `components`, `animations`, `themes`, `utils`),
`types/` (TypeScript declarations), `__tests__/`, and `App.js` + `demo/` (the demo app).

## Publishing

```sh
# 0. one-time: set repository/bugs/homepage in package.json
npm ci
npm run validate                   # lint + typecheck + tests + npm pack --dry-run
npm pack --dry-run                 # should list only src/, types/, README.md, CHANGELOG.md, LICENSE, package.json

npm login                          # interactive; never commit tokens
npm publish                        # scoped public packages: npm publish --access public (already set in publishConfig)

npm view <your-package-name> version     # verify
git tag v0.1.0 && git push origin v0.1.0
```

Future releases (semantic versioning: patch = fixes, minor = backwards-compatible features, major = breaking):

```sh
# update CHANGELOG.md first
npm version patch   # or minor / major — bumps package.json and creates the git tag
npm publish
git push --follow-tags
```

### Release checklist

- [ ] `npm view react-native-toast-message-library` still returns 404 (name free)
- [ ] `npm run validate` passes
- [ ] Example app run on an Android device/emulator **and** an iOS simulator (swipe, queue, themes, a11y spot check)
- [ ] `CHANGELOG.md` entry dated; version bumped
- [ ] `repository`, `bugs`, `homepage` fields filled in `package.json`
- [ ] `npm pack --dry-run` file list reviewed
- [ ] Published, verified with `npm view`, tag pushed

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © Denish Dabhi
