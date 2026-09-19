<div align="center">

# A11y Matrix Theme

**An accessibility-first high contrast dark theme for Visual Studio Code, verified against WCAG 2.x AAA on every build.**

[![CI](https://github.com/renatorroliveira/vscode-a11ly-matrix-theme/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/renatorroliveira/vscode-a11ly-matrix-theme/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Contrast gate: WCAG 2.x AAA](https://img.shields.io/badge/WCAG_2.x-AAA-brightgreen)](docs/contrast-report.md)
[![Visual Studio Marketplace version](https://img.shields.io/visual-studio-marketplace/v/oliveren.vscode-a11ly-matrix-theme)](https://marketplace.visualstudio.com/items?itemName=oliveren.vscode-a11ly-matrix-theme)
[![Visual Studio Marketplace installs](https://img.shields.io/visual-studio-marketplace/i/oliveren.vscode-a11ly-matrix-theme)](https://marketplace.visualstudio.com/items?itemName=oliveren.vscode-a11ly-matrix-theme)

<!-- TODO: capture docs/screenshot.png from the Extension Development Host (editor, terminal, sidebar and a diff view). -->

![A11y Matrix Dark applied to a TypeScript file, the integrated terminal and the Explorer sidebar](docs/screenshot.png)

</div>

## Why this theme

- **High contrast by construction.** The theme is built on the `hc-black` base and starts from VS Code's own Dark High
  Contrast defaults, then lifts every color that falls short of AAA.
- **Verified, not eyeballed.** Every shipped foreground/background pair is measured with the exact WCAG 2.x formula at
  build time. A single pair below 7:1 for text or 4.5:1 for UI fails the build, so the palette cannot drift.
- **Bounded, not maximal.** Text also has a ceiling of 14:1, twice the floor, so the brightest and dimmest glyphs on a
  line stay within a 2:1 luminance spread. Body text is light grey `#d2d2d2`, never pure white: white next to a 7:1
  keyword is three times as luminous and suppresses its perceived contrast, and it is the strongest halation case on
  OLED and high contrast panels.
- **Matrix green, measured.** Borders and highlights are Matrix Code Green, focus rings are P3 amber phosphor, the
  pairing that shipped on VT220 tubes. Both were chosen from 40 candidates by contrast and color-vision-deficiency
  separation; see [`docs/palette-research.md`](docs/palette-research.md).
- **Color is never the only signal.** Selection and hover are a dark green fill under light grey text, highlights use
  outlines instead of fills, and semantically related colors are checked for separation under protanopia,
  deuteranopia and tritanopia simulation.
- **Nothing but a JSON file.** The extension has no runtime code and no runtime dependencies. It works in Restricted Mode,
  virtual workspaces and remote sessions.

## Installation

**From the Marketplace**

1. Open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Search for **A11y Matrix Theme** and click **Install**.
3. Select **A11y Matrix Dark** from _Preferences: Color Theme_ (`Ctrl+K Ctrl+T` / `Cmd+K Cmd+T`).

Or from a terminal:

```sh
code --install-extension oliveren.vscode-a11ly-matrix-theme
```

**From a VSIX**

Every CI run on `main` publishes a `vsix` artifact on the
[Actions tab](https://github.com/renatorroliveira/vscode-a11ly-matrix-theme/actions/workflows/ci.yml). Download it,
unzip the archive and install the file inside:

```sh
code --install-extension vscode-a11ly-matrix-theme-<version>.vsix
```

## Accessibility rules

The build enforces these thresholds and fails on the first violation. The full list of measured pairs and their ratios is
regenerated into [`docs/contrast-report.md`](docs/contrast-report.md) on every build.

| Content                                                                  | Minimum ratio | Maximum ratio | Basis                                                        |
| ------------------------------------------------------------------------ | ------------- | ------------- | ------------------------------------------------------------ |
| Text, including placeholder text                                         | 7:1           | 14:1          | WCAG 1.4.6 (AAA); ceiling is project policy, twice the floor |
| Large text                                                               | 4.5:1         | 14:1          | WCAG 1.4.6 (AAA)                                             |
| UI boundaries, icons, focus rings, carets, squiggles and chart series    | 4.5:1         | 15.5:1        | Project policy (WCAG 1.4.11 has no AAA tier)                 |
| Disabled and ignored items                                               | 4.5:1         | 14:1          | Project policy (WCAG exempts disabled content)               |
| Passive marks: indent guides, rulers, whitespace, gutter and ruler marks | 4.5:1         | 7:1           | Project policy; marks stay below every text color            |

Additional rules:

- Ratios are never rounded at either edge. 6.99:1 fails the floor, 14.01:1 fails the text ceiling.
- No text is pure white. Body text is `#d2d2d2` (13.89:1), secondary text `#b3b3b3` (10.02:1), syntax tokens sit
  between 8:1 and 14:1. The ceiling follows the surround suppression literature (Chubb, Sperling and Solomon 1989) and
  the APCA dark-mode guidance of Lc 85 to 90 as the comfortable maximum; see
  [`docs/palette-research.md`](docs/palette-research.md).
- Translucent colors are composited onto the surface they actually render on before being measured.
- Colors inside a distinguishable group must stay at least delta E 10 apart under normal vision and under protanopia,
  deuteranopia and tritanopia simulation.
- Terminal ANSI colors are the one exception: VS Code enforces `terminal.integrated.minimumContrastRatio` on them at
  render time.

The underlying guidance is collected in
[`docs/accessibility-manual-for-web-interfaces.md`](docs/accessibility-manual-for-web-interfaces.md).

## Repository layout

| Path             | Purpose                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `src/`           | Theme source of truth in TypeScript (`palette.ts`, `workbench-colors.ts`, `token-colors.ts`, `theme.ts`) and the `build.ts` emitter. |
| `scripts/color/` | Pure color math: hex parsing, alpha compositing, luminance, WCAG contrast, contrast nudging, color-vision-deficiency simulation.     |
| `scripts/`       | CLIs: `contrast-audit.ts` (build gate, `--fix` repairs), `import-theme.ts` (seed importer), `pairs.ts` (the contrast contract).      |
| `themes/`        | Generated theme JSON consumed by VS Code. Never edit by hand.                                                                        |
| `test/`          | Vitest unit tests for the color library.                                                                                             |
| `docs/`          | Research reports, the accessibility manual, the seed themes and the generated contrast report.                                       |
| `.github/`       | GitHub Actions CI: audit, typecheck, lint, test, build and package on every push and pull request.                                   |

## Development

Requires Node.js 24 or later; the TypeScript sources run natively through type stripping, so there is no transpile step.

```sh
corepack enable pnpm            # picks pnpm 12.1.0 from the packageManager field
pnpm install --frozen-lockfile  # exact pins, 15-day minimum release age, no build scripts
pnpm dev                        # regenerate themes/ on every source change
pnpm build                      # generate + contrast gate
pnpm check                      # typecheck + lint + test + build
```

Press `F5` in VS Code to launch the Extension Development Host with the theme loaded. Edits under `src/` regenerate the
theme through `pnpm dev`, and the host reloads the theme file automatically.

Other useful commands:

| Command                     | Purpose                                                                          |
| --------------------------- | -------------------------------------------------------------------------------- |
| `pnpm audit:contrast`       | Run the contrast gate alone and rewrite `docs/contrast-report.md`.               |
| `pnpm audit:contrast --fix` | Write minimal, hue-preserving color repairs into `src/`. Re-run without `--fix`. |
| `pnpm lint` / `pnpm format` | ESLint plus Prettier check, or Prettier write.                                   |
| `pnpm test:watch`           | Vitest in watch mode.                                                            |

Dependency policy (exact versions, minimum release age, denied build scripts) lives in `pnpm-workspace.yaml`; the
rationale for each pin is in [`docs/dependency-versions.md`](docs/dependency-versions.md). Continuous integration runs
the same `pnpm check` plus `pnpm audit`, verifies that the generated files are committed, and uploads the packaged VSIX
and the contrast report as artifacts.

## Packaging

```sh
pnpm package      # runs pnpm check, then produces vscode-a11ly-matrix-theme-<version>.vsix
```

Publishing uses `pnpm publish:marketplace`. Prefer `vsce publish --oidc` or `--azure-credential` over a Personal Access
Token; Azure DevOps global PATs are retired on 2026-12-01.

## License

[MIT](LICENSE)
