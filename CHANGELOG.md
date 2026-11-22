# Changelog

All notable changes to the A11y Matrix Theme are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-11-21

First release.

### Added

- **A11y Matrix Dark**, a high contrast dark theme on the `hc-black` base, built from VS Code's own Dark High
  Contrast defaults.
- WCAG 2.x AAA contrast, checked on every build: text sits between 7:1 and 14:1, and UI boundaries, icons,
  focus rings, carets and squiggles reach at least 4.5:1. Every syntax token is also measured on each
  highlight drawn behind code. The measured pairs and their ratios are in `docs/contrast-report.md`.
- Light grey body text `#d2d2d2` instead of pure white, so the brightest and dimmest glyphs on a line stay
  within a 2:1 luminance spread.
- Matrix Code Green `#00ff41` highlights, `#00ad2c` borders and P3 amber `#ffb000` focus rings. Comments
  are green `#21b947`.
- States marked by shape as well as color: selection is a dark green fill, hover and highlights are
  outlines, and no light background sits behind text. The one exception is the SCM graph ref badge.
- Terminal ANSI colors that meet AAA even with `terminal.integrated.minimumContrastRatio` disabled.
- Git states, diagnostics, chart series, graph lanes and ANSI hues that stay distinguishable under
  protanopia, deuteranopia and tritanopia simulation.
- Colors for GitLens, Error Lens and Markdown alerts, held to the same contrast rules.

[Unreleased]: https://github.com/renatorroliveira/vscode-a11ly-matrix-theme/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/renatorroliveira/vscode-a11ly-matrix-theme/releases/tag/v0.1.0
