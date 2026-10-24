# Contributing

Thanks for helping improve react-native-toast-message-library.

## Setup

```sh
git clone <your fork>
cd react-native-toast-message-library
npm install
```

## Checks (run before opening a pull request)

```sh
npm run lint
npm run typecheck        # validates types/index.d.ts
npm test
npm pack --dry-run       # only src/, types/index.d.ts, README, CHANGELOG, LICENSE should ship
```

## Running the demo app

The repository root is a React Native CLI app (`App.js`, `demo/`, `android/`, `ios/`) that imports the
library from `./src`, so edits to `src/` hot-reload in the app.

```sh
npm start                 # Metro (terminal 1)
npm run android           # terminal 2 (Android SDK + JDK required)
npm run ios               # macOS only: cd ios && bundle exec pod install first
```

## Guidelines

- Keep the library dependency-free (React and React Native only; `react-native-safe-area-context` stays optional).
- Every user-facing option needs: implementation, validation in `src/utils/validateToastOptions.js`,
  a type in `types/index.d.ts`, a test and a README entry.
- Timing logic lives in `src/manager/ToastManager.js` and must be testable with Jest fake timers.
- Use [Conventional Commits](https://www.conventionalcommits.org/) and update `CHANGELOG.md`.

## Releasing (maintainers)

See "Publishing" in the README.
