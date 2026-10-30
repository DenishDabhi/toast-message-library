# Contributing

Thanks for helping improve react-native-toast-message-library.

## Reporting bugs and requesting features

Open an issue on [GitHub Issues](https://github.com/DenishDabhi/toast-message-library/issues). For bugs, please include:

- Library version, React Native version and platform (Android or iOS)
- A minimal code example that reproduces the problem
- What you expected to happen and what happened instead

## Setup

Node.js 22.11 or newer is needed for the demo app toolchain (React Native 0.88). The published library itself has no Node requirement.

```sh
git clone https://github.com/DenishDabhi/toast-message-library.git
cd toast-message-library
npm install
```

## Checks (run before opening a pull request)

```sh
npm run lint
npm run typecheck        # validates types/index.d.ts
npm test
npm pack --dry-run       # only src/, types/index.d.ts, README, CHANGELOG, LICENSE should ship
```

You can run all of them at once with `npm run validate`.

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
- Every user-facing option needs: implementation, validation (`src/utils/validateToastOptions.js` for toast options,
  `src/utils/validateProviderProps.js` for `ToastProvider` props), a type in `types/index.d.ts`, a test and a README entry.
- Timing logic lives in `src/manager/ToastManager.js` and must be testable with Jest fake timers.
- Use [Conventional Commits](https://www.conventionalcommits.org/) and update `CHANGELOG.md`.

## Releasing (maintainers)

1. Make sure `npm run validate` passes.
2. Update `CHANGELOG.md` and bump the version with `npm version patch` (or `minor` / `major`).
3. Publish with `npm publish`.
4. Push the commit and tag with `git push --follow-tags`.
