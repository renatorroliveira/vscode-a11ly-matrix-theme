# Changelog

All notable changes to the Ally Dark theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Initial bootstrap generated from the `dark-2026` seed theme.
- Build-time WCAG 2.x contrast gate over curated foreground/background pairs.

### Changed

- Palette rebased on VS Code's Dark High Contrast defaults; theme base is now `hc-black`.
- Contrast gate raised from AA to AAA (7:1 text, 4.5:1 UI); 13 seed colors lifted to comply.
- Minimum dependency release age lowered from 30 to 15 days; all age-rule waivers removed.
- Tooling moved to pnpm 12.1.0, ESLint 10.9.1 and typescript-eslint 8.69.0.

### Fixed

- A pair that reached AA was reported as passing regardless of the target level.

### Security

- Resolved seven `pnpm audit` findings (qs, fast-uri, js-yaml) reached through `@vscode/vsce`, with
  dated age-rule waivers on the first patched releases.
