# Ally Dark

An accessibility-first high contrast dark color theme for Visual Studio Code,
built on the `hc-black` base. Every shipped foreground/background pair is verified
against WCAG 2.x AAA at build time, so the theme cannot drift below 7:1 for text or
4.5:1 for UI boundaries, icons and focus rings. The palette starts from VS Code's own
Dark High Contrast defaults and lifts every color that falls short.

## Layout

| Path             | Purpose                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/`           | Theme source of truth in TypeScript (`workbench-colors.ts`, `token-colors.ts`, `theme.ts`) and the `build.ts` emitter.           |
| `scripts/color/` | Pure color math: hex parsing, alpha compositing, luminance, WCAG contrast, contrast nudging, color-vision-deficiency simulation. |
| `scripts/`       | CLIs: `contrast-audit.ts` (build gate, `--fix` repairs), `import-theme.ts` (seed importer).                                      |
| `themes/`        | Generated theme JSON consumed by VS Code. Never edit by hand.                                                                    |
| `test/`          | Vitest unit tests for the color library.                                                                                         |
| `docs/`          | Research reports, the accessibility manual, the seed themes and the contrast report.                                             |

## Development

```sh
corepack enable pnpm            # picks pnpm 11.22.0 from the packageManager field
pnpm install --frozen-lockfile  # exact pins, 15-day minimum release age, no build scripts
pnpm dev                        # regenerate themes/ on every source change
pnpm build                      # generate + contrast gate
pnpm check                      # typecheck + lint + test + build
```

Dependency policy (exact versions, minimum release age, denied build scripts) lives in
`pnpm-workspace.yaml`; the rationale for each pin is in `docs/dependency-versions.md`.

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
