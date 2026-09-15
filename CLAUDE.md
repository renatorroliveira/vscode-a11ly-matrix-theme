# Ally Dark

Accessibility-first dark color theme for VS Code. The theme source is TypeScript under `src/`,
compiled to `themes/ally-dark-color-theme.json` by `src/build.ts`, and gated by a WCAG 2.x AA
contrast audit that fails the build on any violation. Node 24 runs the TypeScript scripts natively
(type stripping), so there is no transpiler and all source must use erasable syntax only.

Read `README.md` for the layout and `docs/` for the research reports, the accessibility manual,
the dependency pinning report and the generated contrast report.

## Commands (pnpm only, never npm or yarn)

| Command                                                  | Purpose                                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `corepack enable pnpm && pnpm install --frozen-lockfile` | Install pinned dependencies.                                                                        |
| `pnpm dev`                                               | Watch `src/` and regenerate `themes/` on every change. Pair with `F5` (Extension Development Host). |
| `pnpm generate`                                          | Emit `themes/ally-dark-color-theme.json` once.                                                      |
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
| `pnpm import:seed`                                       | Re-import `docs/dark-2026.json` into `src/`. Destructive: overwrites hand edits.                    |

## Color accessibility rules (enforced by the build)

1. Text on its background must reach 4.5:1 (WCAG 1.4.3 AA). Large text may use 3:1.
2. UI boundaries, icons, focus rings, carets, gutter markers and chart series must reach 3:1 against
   every surface they sit on (WCAG 1.4.11).
3. Disabled and ignored items are WCAG-exempt but must still reach 3:1 (project policy, `dimmed`).
4. Placeholder text is NOT exempt: 4.5:1.
5. Never round up. 4.49:1 fails. The audit uses the exact WCAG formula from
   `docs/accessibility-manual-for-web-interfaces.md`.
6. Translucent colors (8-digit hex) are measured after alpha compositing onto the real surface.
   Overlay backgrounds (selection, find match, hover) are checked with `editor.foreground` on top;
   repair them by lowering alpha, never by changing the text color.
7. Color is never the only signal. Colors inside a `DISTINGUISHABLE_GROUPS` set must stay apart
   (delta E >= 10) under normal vision and protanopia, deuteranopia and tritanopia simulation. Today
   this is informational (WARN); treat new warnings as defects.
8. Every new workbench color that renders text, an icon or a border gets a pair in `scripts/pairs.ts`
   in the same change. The pair list is the accessibility contract; coverage only grows.
9. Prefer changing a background over a foreground when the foreground is shared across many
   surfaces (for example `editor.foreground`, `foreground`, `focusBorder`).
10. Keep hue when repairing contrast; move lightness only. `nudgeToContrast` does this.
11. APCA numbers may inform design but never replace WCAG 2.x ratios for conformance.
12. `themes/` is generated. Edit `src/workbench-colors.ts` and `src/token-colors.ts`, then `pnpm build`.

## Dependency security constraints

- Exact versions only, no `^` or `~`. `.npmrc` sets `save-exact=true`.
- A version must be at least 30 days old before it is adopted. `pnpm-workspace.yaml` enforces this
  for the whole dependency tree with `minimumReleaseAge: 43200` (minutes); `pnpm install` fails on
  younger transitive packages too.
- Waivers to the age rule go in `minimumReleaseAgeExclude` with a dated note here. Current waiver:
  `vitest` and `@vitest/*` 4.1.11 (published 2026-08-18) because every older release since 2.1.0
  carries GHSA-82fw-gwwq-j7x9. The waiver is unnecessary from 2026-09-17; remove it then.
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

## Coding conventions

- TypeScript strict, `erasableSyntaxOnly`, `verbatimModuleSyntax`, `.ts` extensions in imports.
- Immutable, specific types: `readonly`, `as const`, template literal types (`HexColor`). No `any`.
- Public functions before private ones in every file. JSDoc on every exported symbol.
- Cyclomatic complexity <= 10, nesting <= 3 (ESLint enforces both).
- Prettier: 120 columns, 4 spaces, LF, single quotes, arrow parens always, trailing commas.
- Conventional Commits, wrapped at 72 columns, no `Co-Authored-By`.
