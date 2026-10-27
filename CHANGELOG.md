# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.3] - 2026-10-27

### Changed

- README: improved the structure, wording and clarity of the documentation.
- package.json: updated the `keywords` so the package is easier to find in npm search.
- Version bumped to 1.0.3. No code or API changes.

## [1.0.2] - 2026-10-26

### Changed

- README: updated the animated demo GIF (`demo/toast-video-letest.gif`) shown at the top of the page.
- Version bumped to 1.0.2. No code or API changes.

## [1.0.1] - 2026-10-26

### Added

- README: animated demo GIF (`demo/toast-video.gif`) shown at the top of the page, so the toasts can be previewed on GitHub and npm.

### Changed

- Version bumped to 1.0.1. No code or API changes.

## [1.0.0] - 2026-10-24

First stable release. The public API (`ToastProvider`, `useToast`, `Toast`, `createTheme`,
toast options and provider props) follows semantic versioning from now on.

### Added

- `description` option: an alias of `message` (use one of them, not both).
- `titles` provider prop: change or hide the default title per toast type, e.g.
  `titles={{ success: 'Done', error: '' }}`.
- Validation of `<ToastProvider>` props (`position`, `animation`, `duration`, `maxVisible`, `offset`, `titles`, ...).
- Unit and render tests for the manager, option handling, offsets, insets and titles.
- Demo app sections for title/description and offsets.
- Rewritten README: title and description, top/bottom positions, safe-area insets and offsets, full option tables and copy-paste recipes.

### Fixed

- Per-toast `offsetX` / `offsetY` were documented and validated but never applied.
- An invalid provider `position` / `animation` made toasts "visible" but never drawn; it now throws a clear `TypeError`.
- `insets={{ top: undefined }}` produced `NaN` positions; undefined / non-numeric insets are now ignored.
- The progress bar did not restart when a toast was updated in place by re-using its `id`.
- A toast that had been swiped away and was then shown again with the same `id` stayed off screen.
- A toast with an empty title and an empty message rendered as an empty box; it now throws a `TypeError`.
- `ToastApi.success/error/warning/info` types now accept numbers and the full options object.
- Toast width can no longer become negative with very large offsets.

### Changed

- Removed the `engines.node` field. It described the demo app's toolchain and produced warnings for library users on older Node versions.

## [0.1.0] - 2026-10-24

### Added

- `ToastProvider`, `useToast()` and an opt-in global `Toast` API.
- Toast types: success, error, warning, info, custom.
- Seven positions, safe-area aware, with provider and per-toast offsets.
- `fade`, `slide`, `zoom` and `none` animations (native driver) with reduced-motion fallback.
- Auto-dismiss, persistent toasts (`duration: 0`), pause/resume while interacting.
- FIFO queue with `maxVisible`, unique ids, update-in-place for repeated ids.
- Close button, leading icon, action button, progress bar, swipe-to-dismiss (built-in `PanResponder`).
- `onShow`, `onPress`, `onAction`, `onDismiss(reason)` callbacks.
- Light, dark and system themes, `createTheme()`, per-toast style overrides.
- Accessibility roles/labels, live regions, throttled iOS announcements.
- TypeScript declarations in `types/index.d.ts`.
