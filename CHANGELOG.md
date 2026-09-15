# Changelog

All notable changes to the A11y Matrix Theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Initial bootstrap generated from the `dark-2026` seed theme.
- Build-time WCAG 2.x contrast gate over curated foreground/background pairs.
- GitHub Actions CI workflow that audits dependencies, runs `pnpm check`, verifies the generated files are
  committed and uploads the packaged VSIX and the contrast report as artifacts.

### Changed

- Accents remodeled to Matrix Code Green `#00ff41` for highlights, find matches and selection, a 7:1 tier
  `#00ad2c` for borders and the integrated terminal's green, and P3 amber `#ffb000` for focus rings, active
  indicators and the terminal's yellow; chosen from 40 measured candidates (`docs/palette-research.md`).
- Accent ids reference named roles in `src/palette.ts` instead of repeated literals.
- Contrast contract grew to 166 pairs (terminal selection and find matches, inactive selection, workbench
  text selection, focus and highlight outlines) plus four accent distinguishability groups.
- Chat "lines added" unified onto the standard added green `#89d185`.
- Palette rebased on VS Code's Dark High Contrast defaults; theme base is now `hc-black`.
- Contrast gate raised from AA to AAA (7:1 text, 4.5:1 UI); 13 seed colors lifted to comply.
- Minimum dependency release age lowered from 30 to 15 days; all age-rule waivers removed.
- Tooling moved to pnpm 12.1.0, ESLint 10.9.1 and typescript-eslint 8.69.0.
- Extension renamed to `vscode-a11ly-matrix-theme` ("A11y Matrix Theme"); the theme is now "A11y Matrix Dark".

### Fixed

- A pair that reached AA was reported as passing regardless of the target level.

### Security

- Resolved seven `pnpm audit` findings (qs, fast-uri, js-yaml) reached through `@vscode/vsce`, with
  dated age-rule waivers on the first patched releases.
