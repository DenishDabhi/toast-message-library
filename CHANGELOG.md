# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.1.0] - Unreleased

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
