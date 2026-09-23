# A11y Matrix Theme

Accessibility-first high contrast dark color theme for VS Code (`uiTheme: hc-black`, theme type
`hcDark`). The theme source is TypeScript under `src/`, compiled to
`themes/a11y-matrix-dark-color-theme.json` by `src/build.ts`, and gated by a WCAG 2.x AAA contrast audit
that fails the build on any violation. The palette derives from VS Code's Dark High Contrast defaults
(`docs/dark-high-contrast.json`) with the accents remodeled to Matrix Code Green `#00ff41` (highlights),
its 7:1 tier `#00ad2c` (borders) and P3 amber `#ffb000` (focus), and all text moved off pure white onto a
light grey tier (`text.primary` `#d2d2d2` 13.89:1, `text.secondary` `#b3b3b3` 10.02:1) so every glyph
stays within a 2:1 luminance spread of the 7:1 floor; the roles live in `src/palette.ts` and the decision
record in `docs/palette-research.md`. The earlier `dark-2026` seed is kept in `docs/` as
history. Node 24 runs the TypeScript scripts natively (type stripping), so there is no transpiler and
all source must use erasable syntax only.

Read `README.md` for the layout and `docs/` for the research reports, the accessibility manual,
the dependency pinning report and the generated contrast report.

## Commands (pnpm only, never npm or yarn)

| Command                                                  | Purpose                                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `corepack enable pnpm && pnpm install --frozen-lockfile` | Install pinned dependencies.                                                                        |
| `pnpm dev`                                               | Watch `src/` and regenerate `themes/` on every change. Pair with `F5` (Extension Development Host). |
| `pnpm generate`                                          | Emit `themes/a11y-matrix-dark-color-theme.json` once.                                               |
| `pnpm audit:contrast`                                    | Run the contrast gate, write `docs/contrast-report.md`, exit 1 on failure.                          |
| `pnpm audit:contrast --fix`                              | Same, then write minimal color repairs into `src/`. Re-run without `--fix` to confirm.              |
| `pnpm build`                                             | `generate` + `audit:contrast`. This is what `vscode:prepublish` runs.                               |
| `pnpm typecheck`                                         | `tsc --noEmit` with the strict config.                                                              |
| `pnpm lint` / `pnpm lint:fix`                            | ESLint (flat config, type-checked) and Prettier check / fix.                                        |
| `pnpm format`                                            | Prettier write.                                                                                     |
| `pnpm test` / `pnpm test:watch` / `pnpm test:coverage`   | Vitest unit tests.                                                                                  |
| `pnpm check`                                             | typecheck + lint + test + build. Run before every commit.                                           |
| `pnpm package`                                           | `check` then `vsce package` producing the release `.vsix` in the repo root.                         |
| `pnpm publish:marketplace`                               | `check` then `vsce publish`. Prefer `--oidc` or `--azure-credential` over a PAT.                    |
| `pnpm import:seed`                                       | Re-import `docs/dark-high-contrast.json` into `src/`, promoting commented defaults. Destructive.    |

## Color accessibility rules (enforced by the build)

1. The gate runs at `TARGET_LEVEL = 'AAA'` (`scripts/color/contrast.ts`): text 7:1 (WCAG 1.4.6),
   large text 4.5:1, UI boundaries, icons, focus rings, carets, squiggles and chart series 4.5:1
   (project policy; WCAG 1.4.11 has no AAA tier), disabled and ignored items 4.5:1 (`dimmed`, project
   policy for WCAG-exempt content), passive marks 4.5:1 (`mark`: indent guides, rulers, whitespace,
   gutter and overview ruler marks).
2. Every kind also has a ceiling (`CONTRAST_CEILINGS`): text 14:1, UI 15.5:1, dimmed 14:1, marks 7:1.
   A pair passes only inside its band. The text ceiling is twice the floor so the brightest and dimmest
   glyphs on a line stay within a 2:1 luminance spread (surround suppression: a high contrast neighbour
   lowers the perceived contrast of a dimmer one) and under the APCA dark-mode ceiling of Lc 85 to 90
   where halation begins. Pure white text is never used; body text is `text.primary` `#d2d2d2`,
   secondary text (line numbers, descriptions, placeholders, inlay hints, blame) is `text.secondary`
   `#b3b3b3`, syntax tokens target 8:1 to 14:1. Accent outlines may reach 15.5:1 because they are the
   intended brightest element; highlighted text uses `accent.primaryText` `#00f33e` (13.89:1) instead.
   Passive marks stay below the text floor (`mark.passive` `#7c7c7c`, `mark.active` `#949494`).
3. Placeholder text is NOT exempt: it is text, 7:1 to 14:1.
4. Never round, at either edge. 6.99:1 fails the floor and 14.01:1 fails the text ceiling. The audit
   uses the exact WCAG formula from `docs/accessibility-manual-for-web-interfaces.md`.
5. Translucent colors (8-digit hex) are measured after alpha compositing onto the real surface. In
   this High Contrast palette many background ids are unset on purpose, so pairs measure against the
   surface that shows through (`editor.background`). Text selection uses the dark green
   `accent.fill` `#004913` with `text.primary` (7.08:1); hovered rows and tabs are unfilled (the HC hover
   outline shows) because no fill keeps colored labels at 7:1; the fill itself is 1.96:1 on black because a
   fill that carries 7:1 text of luminance L can reach at most (L + 0.05) / 7 - 0.05 against black.
   Highlights use green borders instead of fills, focus rings are amber. Every overlay drawn behind code
   is listed in `TOKEN_OVERLAYS` (`scripts/pairs.ts`), where the gate measures every syntax token on the
   composited layer stack.
6. Terminal ANSI colors are gated as text (7:1 to 14:1) so the AAA claim holds even when the user
   disables `terminal.integrated.minimumContrastRatio` (its default lifts only to 4.5:1). The normal
   tier sits at the floor (red `#ff5e5e`, green `accent.border`, yellow `#c78900`, blue `#8888ff`,
   magenta `#ff29ff`, cyan `#00a6a6`, bright black `#959595`), the bright tier at 10:1 or above
   (bright red `#ff9696`, bright blue `#ababff`, bright magenta `#ff85ff`) or at the ceiling (bright
   green `accent.primaryText`, bright cyan `#00eaea`, bright yellow `#d9d900`, `ansiBrightWhite`
   `text.primary`, `ansiWhite` `text.secondary`). Each hue's two tiers form a `DISTINGUISHABLE_GROUPS`
   entry. `ansiBlack` stays `#000000` and is not gated: it is the terminal's own background and only
   shows as an inverse-video or background color. Extension ids shipped in the theme (`gitlens.*`,
   `errorLens.*`, `markdownAlert.*`) are gated with the same kinds as the core ids they mirror; graph
   lanes and minimap markers are `ui` like chart series.
7. Color is never the only signal. Colors inside a `DISTINGUISHABLE_GROUPS` set must stay apart
   (delta E >= 10) under normal vision and protanopia, deuteranopia and tritanopia simulation. Today
   this is informational (WARN); treat new warnings as defects.
8. Every new workbench color that renders text, an icon or a border gets a pair in `scripts/pairs.ts`
   in the same change. The pair list is the accessibility contract; coverage only grows.
9. Prefer changing a background over a foreground when the foreground is shared across many
   surfaces (for example `editor.foreground`, `foreground`, `focusBorder`).
10. Keep hue when repairing contrast; move lightness only. `nudgeToContrast` raises, `capToContrast`
    lowers; overlays are repaired by lowering alpha, never by changing the text color.
11. APCA numbers may inform design but never replace WCAG 2.x ratios for conformance.
12. `themes/` is generated. Edit `src/workbench-colors.ts` and `src/token-colors.ts`, then `pnpm build`. Neutral
    and accent ids reference the roles in `src/palette.ts` (`text.primary`, `text.secondary`, `mark.passive`,
    `mark.active`, `accent.primary`, `accent.primaryText`, `accent.border`, `accent.secondary`, `accent.fill`);
    change a role there, never by scattering a new literal. No `#ffffff` text anywhere.
13. A pair's pass/fail is `withinBand(ratio, kind)`, never "level is not fail": a pair that reaches AA
    still fails an AAA gate, and a pair that reaches AAA still fails when it exceeds the ceiling.

## Dependency security constraints

- Exact versions only, no `^` or `~`. `.npmrc` sets `save-exact=true`.
- A version must be at least 15 days old before it is adopted. `pnpm-workspace.yaml` enforces this
  for the whole dependency tree with `minimumReleaseAge: 21600` (minutes); `pnpm install` fails on
  younger transitive packages too.
- Waivers to the age rule go in `minimumReleaseAgeExclude` with a dated note here. A waiver always
  selects the first patched release, never the newest; when the first patched release is not the
  newest in its range, pin it with a scoped `overrides` entry. Remove a waiver the day the age rule
  would select the same version on its own. Current waivers: none (as of 2026-09-15).
- `pnpm audit` must report zero findings before every commit that touches the lockfile.
- Dependency build scripts are denied by default. `allowBuilds` in `pnpm-workspace.yaml` lists every
  package that asked to run one and whether it may (`keytar` and `@vscode/vsce-sign` are denied;
  vsce-sign's postinstall downloads a binary over the network and is only needed for publish-time
  signing).
- Prefer the latest major that satisfies the age rule and has no advisory in the GitHub Advisory
  Database or `pnpm audit`. Step down one version at a time until clean.
- No dependency with a known regression on its release page or issue tracker for that exact version.
- Dev dependencies only. The extension ships a JSON file and has no runtime dependencies. Adding a
  runtime dependency requires a written justification in the commit message.
- `strict-peer-dependencies=true`: peer ranges must be satisfied, not silenced.
- Commit `pnpm-lock.yaml`; install with `--frozen-lockfile` in CI and before packaging.
- `package.json` sets `"vsce": { "dependencies": false }` so `node_modules` never enters the `.vsix`.
- Re-verify versions quarterly using the procedure in `docs/dependency-versions.md`.
- GitHub Actions in `.github/workflows/ci.yml` are pinned to full commit SHAs with the tag in a comment, and
  follow the same 15-day age rule. `pnpm/setup` installs pnpm from `packageManager`; Node comes from
  `actions/setup-node` because `vsce` runs `vscode:prepublish` through `npm run` and pnpm's runtime manager
  does not bundle npm.

## Coding conventions

- TypeScript strict, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `.ts` extensions in imports.
- Immutable, specific types: `readonly`, `as const`, template literal types (`HexColor`). No `any`.
- Public functions before private ones in every file. JSDoc on every exported symbol.
- Cyclomatic complexity <= 10, nesting <= 3 (ESLint enforces both).
- Prettier: 120 columns, 4 spaces, LF, single quotes, arrow parens always, trailing commas.
- Conventional Commits, wrapped at 72 columns, no `Co-Authored-By`.
