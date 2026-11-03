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
npm run build
npm run lint
npm run typecheck
npm test
npm pack --dry-run
```

The build command compiles the source files from `src/` into `dist/` using Babel.

The package dry run verifies that the published package includes `src/`, `dist/`, `types/index.d.ts`, README, CHANGELOG and LICENSE.

You can run all checks at once with:

```sh
npm run validate
```

## Running the demo app

The repository root is a React Native CLI app (`App.js`, `demo/`, `android/`, `ios/`) that imports the library from `./src`, so edits to `src/` hot-reload in the app.

```sh
npm start                 # Metro (terminal 1)
npm run android           # terminal 2 (Android SDK + JDK required)
npm run ios               # macOS only: cd ios && bundle exec pod install first
```

## Guidelines

- Keep the library dependency-free at runtime (React and React Native only; `react-native-safe-area-context` stays optional).
- Babel and other build tools must remain development dependencies.
- Keep the compiled `dist/` output in sync with `src/`. Generate it using `npm run build` rather than editing compiled files manually.
- Ensure the published package includes both `src/` and `dist/`, with package entry points referencing `dist/`.
- Every user-facing option needs: implementation, validation (`src/utils/validateToastOptions.js` for toast options, `src/utils/validateProviderProps.js` for `ToastProvider` props), a type in `types/index.d.ts`, a test and a README entry.
- Timing logic lives in `src/manager/ToastManager.js` and must be testable with Jest fake timers.
- Use [Conventional Commits](https://www.conventionalcommits.org/) and update `CHANGELOG.md`.

## Releasing (maintainers)

1. Make sure `npm run validate` passes.
2. Verify that the `dist/` directory is generated correctly and included in the npm package.
3. Test the generated package in a React Native application on Android and iOS.
4. Update `CHANGELOG.md` and bump the version with `npm version patch` (or `minor` / `major`).
5. Publish with `npm publish`.
6. Push the commit and tag with `git push --follow-tags`.
