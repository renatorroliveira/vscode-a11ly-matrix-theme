# Ally Dark

An accessibility-first dark color theme for Visual Studio Code. Every shipped
foreground/background pair is verified against WCAG 2.x AA at build time, so the
theme cannot drift below 4.5:1 for text or 3:1 for UI boundaries and focus rings.

## Layout

| Path | Purpose |
| --- | --- |
| `src/` | Theme source of truth in TypeScript (`workbench-colors.ts`, `token-colors.ts`, `theme.ts`) and the `build.ts` emitter. |
| `scripts/color/` | Pure color math: hex parsing, alpha compositing, luminance, WCAG contrast, contrast nudging, color-vision-deficiency simulation. |
| `scripts/` | CLIs: `contrast-audit.ts` (build gate), `import-theme.ts` (seed importer). |
| `themes/` | Generated theme JSON consumed by VS Code. Never edit by hand. |
| `test/` | Vitest unit tests for the color library. |
| `docs/` | Research reports, the accessibility manual, the original seed theme and the contrast report. |

## Development

```sh
corepack enable pnpm
pnpm install
pnpm dev          # regenerate themes/ on every source change
pnpm build        # generate + contrast gate
pnpm check        # typecheck + lint + test + build
```

Press `F5` in VS Code to launch the Extension Development Host with the theme
loaded. Edits under `src/` regenerate the theme through `pnpm dev`, and the host
reloads the theme file automatically.

## Packaging

```sh
pnpm package      # produces ally-dark-<version>.vsix
```

## Accessibility rules

See `CLAUDE.md` for the color rules enforced by the build and
`docs/accessibility-manual-for-web-interfaces.md` for the underlying guidance.
