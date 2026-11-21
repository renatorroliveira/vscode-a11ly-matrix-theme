# Pinned Dev Dependency Versions

Last refresh: 2026-11-21. Runtime: Node v24.22.3, pnpm 12.18.0, corepack 0.36.0. The 15-day cutoff for the
refresh was 2026-11-06T22:00Z, measured to the minute like pnpm does. The first research ran on 2026-09-15; its
sections are kept below, marked as history.

## Selection rules applied

1. Only versions published at least 15 days ago (from the npm registry `time` field).
2. Latest stable among those, including latest major. No pre-release tags.
3. No known security advisory (`pnpm audit`, which queries the npm bulk advisory endpoint, plus the GitHub Advisory
   Database).
4. No widely reported breaking regression for the exact version.
5. Mutually compatible peer dependency ranges.

## Summary table (2026-11-21)

| Package                | Pinned  | Published  | Latest today         | Reason if not latest                                                                                     | Peer and engine notes                                                                            |
| ---------------------- | ------- | ---------- | -------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| typescript             | 6.0.3   | 2026-04-16 | 7.0.2 (2026-07-08)   | typescript-eslint 8.72.1 still declares `typescript >=4.8.4 <6.1.0` (rule 5). 6.0.3 is the newest 6.0.x. | Works with @types/node 24.19.2.                                                                  |
| @types/node            | 24.19.2 | 2026-10-09 | 26.6.6 (2026-10-28)  | Pinned to the Node 24 line per runtime. 24.19.2 is the newest 24.x.                                      | vitest 5.1.0 peer `^22.0.0 \|\| >=24.0.0`.                                                       |
| eslint                 | 10.14.0 | 2026-10-30 | 10.15.0 (2026-11-13) | 10.15.0 is eligible on 2026-11-28.                                                                       | engines `^20.19.0 \|\| ^22.13.0 \|\| >=24`. Optional peer `jiti` not needed.                     |
| @eslint/js             | 10.0.1  | 2026-02-06 | 10.0.1               | Is latest.                                                                                               | peer `eslint ^10.0.0`.                                                                           |
| typescript-eslint      | 8.72.1  | 2026-10-26 | 8.73.0 (2026-11-16)  | 8.72.2 is eligible on 2026-11-24, 8.73.0 on 2026-12-01.                                                  | peers `eslint ^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` and `typescript >=4.8.4 <6.1.0`.                 |
| eslint-config-prettier | 10.1.8  | 2025-07-18 | 10.1.8               | Is latest. 10.1.6 and 10.1.7 carried malicious code (GHSA-r568-chxc-crfm, GHSA-f29h-pxvx-f335).          | peer `eslint >=7.0.0`.                                                                           |
| prettier               | 3.9.10  | 2026-10-10 | 3.10.1 (2026-11-12)  | 3.10.0 is eligible on 2026-11-26, 3.10.1 on 2026-11-27.                                                  | No peers. Reformatted nothing in the repo.                                                       |
| vitest                 | 5.1.0   | 2026-11-02 | 5.1.1 (2026-11-18)   | 5.1.1 is eligible on 2026-12-03.                                                                         | engines `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` (excludes Node 25). Peer `vite` resolved to 8.3.6. |
| @vitest/coverage-v8    | 5.1.0   | 2026-11-02 | 5.1.1                | Must equal vitest exactly (peer `vitest: 5.1.0`).                                                        | Exact-version peer on vitest.                                                                    |
| @vscode/vsce           | 4.1.0   | 2026-10-28 | 4.1.1 (2026-11-12)   | 4.1.1 is eligible on 2026-11-27. 4.1.0 is also the first release whose `--oidc` works.                   | engines `>= 22`.                                                                                 |
| ovsx                   | 1.3.0   | 2026-10-16 | 1.4.0 (2026-11-09)   | 1.4.0 is eligible on 2026-11-24.                                                                         | engines `>=22.0.0`. Depends on `@vscode/vsce ^4`, deduped onto 4.1.0.                            |
| globals                | 17.14.0 | 2026-11-01 | 17.14.0              | Is latest.                                                                                               | No peers.                                                                                        |
| pnpm                   | 12.18.0 | 2026-11-05 | 12.22.0 (2026-11-17) | 12.19.0 is eligible on 2026-11-25; 12.20.0, 12.21.0 and 12.22.0 later.                                   | engines `node >=18`.                                                                             |
| minimatch (override)   | 11.0.5  | 2026-11-05 | 11.0.9 (2026-11-16)  | Forced through `overrides`; see below. 11.0.6 is eligible on 2026-11-25.                                 | engines `20 \|\| >=22`. Parents still declare `^10.2.6`.                                         |

Advisory check: `pnpm audit` reports zero findings, and the GitHub Advisory Database has no advisory for any version
above, nor for the transitive `@vitest/mocker` 5.1.0, `vite` 8.3.6 and `@vscode/vsce-sign` 2.1.0.

### Refresh 2026-11-21

`pnpm audit` on the 2026-09-15 lockfile reported 45 advisories (7 low, 23 moderate, 15 high). All of them were published
after CI last passed on 2026-09-23, so CI's audit step failed on the next run. The refresh pinned every package in the
table to its newest eligible version, added `ovsx` for publishing, and re-resolved the whole tree from an empty lockfile
so every transitive package also moved to its newest eligible version.

What moved: @types/node 24.13.3 to 24.19.2, eslint 10.9.1 to 10.14.0, typescript-eslint 8.69.0 to 8.72.1, prettier
3.9.6 to 3.9.10, vitest and @vitest/coverage-v8 4.1.11 to 5.1.0 (major), @vscode/vsce 3.9.2 to 4.1.0 (major), globals
17.11.0 to 17.14.0, pnpm 12.1.0 to 12.18.0, and ovsx 1.3.0 added. Unchanged: typescript 6.0.3, @eslint/js 10.0.1,
eslint-config-prettier 10.1.8.

- **One finding was left after the fresh resolution:** `minimatch` 10.2.6, GHSA-g3hv-75wg-m249 (medium, denial of
  service via globparts amplification, `>=7.0.0 <11.0.1`).
    - It is reached through ESLint (`@eslint/config-array`), typescript-estree and @vscode/vsce, all of which declare
      `^10.2.6`. No 10.x backport exists.
    - It is cleared by the scoped override `'minimatch@<11.0.1': 11.0.5` in `pnpm-workspace.yaml`. 11.0.5 is the newest
      eligible 11.x; the first patched release, 11.0.1, is also past the age rule, so no waiver is involved.
- **minimatch 11 is a breaking major, and the override was checked to be neutral here.**
    - 11.0 removes `makeRe()`, `Minimatch#regexp`, `matchOne()`, the `AST` class and the `debug` option. All three
      consumers only call `minimatch(path, pattern, opts)` or `new Minimatch(pattern, opts).match(path)`, which 11.x
      keeps.
    - With and without the override, `eslint .` linted the same 34 files with the same zero counts, `vsce ls` listed the
      same 5 files, and `vsce package` produced a VSIX whose 7 entries were byte-identical.
    - Remove the override once ESLint and vsce both accept `^11`.
- **`allowBuilds`:** vsce 4 replaced `keytar` with `@napi-rs/keyring`, which ships prebuilt binaries and has no install
  script, so the `keytar: false` entry was removed. `@vscode/vsce-sign` is still a dependency with a network
  `postinstall` and stays denied.
- **Deprecation, not an advisory:** pnpm warns that `@secretlint/secretlint-rule-preset-recommend` 10.2.2, reached
  through @vscode/vsce 4.1.0, is deprecated.
- **engines:** vitest 5.1.0 is the only package in the tree whose Node range excludes a release line (Node 25), so
  `engines.node` moved from `>=24.0.0` to `^24.0.0 || >=26.0.0`.
- **CI:** `actions/setup-node` v7.0.0 to v7.1.0, `actions/upload-artifact` v7.0.1 to v7.0.2 and `pnpm/setup` v2.1.0 to
  v3.1.2 (major). v3 keeps the `cache` and `require-lockfile` inputs. Its automatic Node.js version-file detection finds
  nothing in this repo, so Node still comes only from `actions/setup-node`.
- **Correction:** the 2026-09-15 table listed `@types/vscode` 1.125.0, but it was never added to `package.json`. The
  theme ships no extension code, so it isn't needed.

### Advisories outside the database (2026-11-21)

Some maintainers publish repository advisories that have not yet reached the global GitHub Advisory Database, so
`pnpm audit` can't see them. The refresh clears two that hit the old pins:

- GHSA-jg5c-8mvg-5wph (critical): pnpm `>=12.0.0 <12.10.0`, a path traversal that only applies with
  `enableGlobalVirtualStore`. The old pin was 12.1.0.
- GHSA-4cm8-f57v-mqm6 (medium): prettier `>=3.9.0 <=3.9.9`, quadratic CPU on GFM tables. The old pin was 3.9.6.

Three minimatch repository advisories still cover the pinned 11.0.5. **No waiver was taken**, because no eligible
release is free of them and none can be triggered here:

| Advisory            | Affected            | Fixed in | Why it doesn't apply here                                                    |
| ------------------- | ------------------- | -------- | ---------------------------------------------------------------------------- |
| GHSA-cf2h-pxjq-68xw | `>=11.0.0 <=11.0.6` | 11.0.7   | Quadratic compile time for patterns with thousands of `*` parts.             |
| GHSA-hqmv-qgp3-jx75 | `>=11.0.3 <=11.0.7` | 11.0.8   | The pattern cache grows only with untrusted patterns; ours come from config. |
| GHSA-c859-jr93-m5j4 | `>=7.4.0 <=11.0.7`  | 11.0.8   | Bugs in `minimatch.escape()`; none of the three consumers calls it.          |

- They also cover 10.2.6, the version the override replaces, for GHSA-c859.
- 11.0.8 fixes all three and becomes eligible on 2026-11-26T09:50Z. Move the override to it then; no waiver is needed.
- If the global database ingests these advisories before that date, `pnpm audit` and CI fail until the move.

### Regression checks (rule 4, 2026-11-21)

Each version's release notes and every later release were read, and its issue tracker was searched for the version
with "regression". None of the regressions found applies to this repo, which follows the 2026-09-15 precedent of
keeping TypeScript 6.0.3 despite an open regression that didn't apply.

- **typescript-eslint 8.72.1:** issue #13109 (open, triage) reports duplicated Programs and higher memory in
  single-run mode when tsconfigs overlap. It is unfixed in 8.73.0. The triggers are overlapping or referenced
  tsconfigs, shebang files, and linted files outside their tsconfig. This repo has one tsconfig, no shebangs, and its
  two config files use `disableTypeChecked`.
- **minimatch 11.0.5:** issue #343 (open). Since 11.0.5, a numeric brace range of 100 or more values inside `!()`,
  `*()` or `+()` matches the wrong strings. No pattern in the repo or its tools' configs uses one.
- **vitest 5.1.0:** four regressions are fixed in 5.1.1, which is still too new: `vi.spyOn` on `WeakMap.prototype`,
  a `.d.ts` import that breaks with Vite 7, webdriverio and browser mode. This repo runs node tests with v8 coverage
  on Vite 8.3.6 and uses none of them.
    - The 5.0 breaking changes that matter for a node setup (`clearMocks` on by default, unawaited `resolves`/`rejects`
      failing, removed `test.sequential`) touch no test here; all 80 pass.
- **eslint 10.14.0:** the release-tracking issue (#21425) was closed with no regressions reported.
- **prettier 3.9.10:** a single security fix. It inherits open #20199 from 3.9.9 (Markdown `$…$` is no longer parsed
  as math); the repo's formatted Markdown has no `$` outside code, and `prettier --check` passes unchanged.
- **pnpm 12.18.0:** no regression in the features used here. Later releases fix bugs that 12.1.0 also had, and none of
  them affects this setup.
    - #17723: a spurious `ERR_PNPM_NO_MATCHING_VERSION` under `minimumReleaseAge`, fixed in 12.19.0.
    - #18184: `pnpm audit` dropping string-id advisories, which only affects custom registries.
- **pnpm/setup v3.1.2:** open issues #101 to #103 and #110 are about cache efficiency, not correctness. With `cache`
  enabled, #110 probably re-saves the store on every run.
- **globals 17.14.0** (data only), **@types/node 24.19.2**, **actions/setup-node v7.1.0**,
  **actions/upload-artifact v7.0.2**, **ovsx 1.3.0** and **@vscode/vsce 4.1.0**: nothing found beyond vsce#1354,
  which affects every vsce version (see `20261120-publishing.md`).

### Vitest exception (closed, history)

Under the original 30-day rule, rules 1 and 3 conflicted for vitest: GHSA-82fw-gwwq-j7x9 (path traversal via
`@vitest/mocker` redirect mock) affects every release from 2.1.0 through 4.1.10, and the first fixed release, 4.1.11,
was 27 days old. 4.1.11 was pinned with a dated waiver. The 15-day policy made 4.1.11 eligible outright, so the waiver
was removed the same day.

### Transitive advisories (resolved 2026-09-15, history)

`pnpm audit` on the first lockfile reported seven findings, all reached only through `@vscode/vsce` 3.9.2 and all
caused by rule 1: the patched releases were younger than 30 days, so `minimumReleaseAge` held the tree on vulnerable
versions.

| Package  | Vulnerable | Path                                             | Advisories                                                                         | First patched | Published  |
| -------- | ---------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------- | ---------- |
| fast-uri | 3.1.5      | vsce > @secretlint/node > ajv                    | GHSA-5jgf-p345-68v8, GHSA-f65p-4m7j-42xc, GHSA-fph4-wmhf-6fwf, GHSA-jqff-g426-hqxp | 3.1.6         | 2026-08-23 |
| js-yaml  | 4.3.1      | vsce > @secretlint/node > rc-config-loader       | GHSA-2883-xcg3-v3hh                                                                | 4.3.2         | 2026-08-26 |
| qs       | 6.15.3     | vsce > azure-devops-node-api > typed-rest-client | GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g                                           | 6.16.0        | 2026-08-29 |

They were first fixed with dated `minimumReleaseAgeExclude` waivers plus a scoped `overrides: 'fast-uri@3': 3.1.6`
entry, because a bare waiver selects the newest release (fast-uri 3.1.8, published the same day) rather than the first
patched one. Under the 15-day policy all three patched releases satisfied rule 1, so the waivers and the override were
removed.

### Policy change to 15 days (2026-09-15, history)

Lowering `minimumReleaseAge` from 43200 to 21600 minutes moved the cutoff to 2026-08-31T18:18Z. eslint moved 10.8.1 to
10.9.1, typescript-eslint 8.67.0 to 8.69.0 and pnpm 11.22.0 to 12.1.0, and all four age waivers and the fast-uri
override were removed. pnpm 12.0.0 rejects unrecognised `pnpm-workspace.yaml` settings, drops
`--frozen-lockfile false` in favour of `--no-frozen-lockfile`, and its `pnpm audit` no longer accepts `--prod=false`;
the default already covers devDependencies.

## devDependencies block

```json
"devDependencies": {
    "@eslint/js": "10.0.1",
    "@types/node": "24.19.2",
    "@vitest/coverage-v8": "5.1.0",
    "@vscode/vsce": "4.1.0",
    "eslint": "10.14.0",
    "eslint-config-prettier": "10.1.8",
    "globals": "17.14.0",
    "ovsx": "1.3.0",
    "prettier": "3.9.10",
    "typescript": "6.0.3",
    "typescript-eslint": "8.72.1",
    "vitest": "5.1.0"
}
```

## pnpm-workspace.yaml overrides

```yaml
overrides:
    'minimatch@<11.0.1': 11.0.5
```

## packageManager field

The hex is the base64-decoded `dist.integrity` field from the npm registry for pnpm@12.18.0
(`npm view pnpm@12.18.0 dist.integrity`), the same sha512 format that `corepack use` emits. The same decoding
reproduces the previous 12.1.0 pin exactly.

```json
"packageManager": "pnpm@12.18.0+sha512.9d7882d5dc82147ecfc4e062aa34834e0ad0296710a1837a1115ae012127d36b7109e321ac1598a1dd0a65597681b1e99917e12ed0d749eae91187943363beb3"
```

## engines block

```json
"engines": {
    "vscode": "^1.125.0",
    "node": "^24.0.0 || >=26.0.0"
}
```

The Node range is the intersection of the engines in the lockfile with the repo's Node 24 floor (native type
stripping): vitest 5.1.0 is the only package that excludes a line, Node 25. `vscode ^1.125.0` is the minimum VS Code
the theme declares; there is no `@types/vscode` to keep in step with it.

## How this was verified (2026-11-21)

- Versions and ages: a script read each package's `time` field from the npm registry and compared every stable release
  with the 21600-minute rule. A second script did the same for the GitHub Actions releases and resolved each tag to
  its commit SHA through the GitHub API.
- Peer and engine ranges: `npm view <pkg>@<ver> peerDependencies engines --json` for every candidate, and a scan of
  every `engines.node` in `pnpm-lock.yaml` with `semver` against Node 24.0.0, 24.22.3, 25.0.0 and 26.0.0.
- Resolution: the candidate set was first resolved in a scratch copy, then in the repo from an empty lockfile with
  pnpm 12.18.0. `pnpm install` enforces the age rule on the whole tree ("Lockfile passes supply-chain policies").
- Advisories: `pnpm audit` (zero findings) and
  `gh api "advisories?ecosystem=npm&affects=<pkg>@<ver>"` for every pinned version (zero).
- Override check: the ESLint JSON report, `vsce ls` and the VSIX contents were captured with and without the
  override and compared with `diff` and `cmp`.
- Gate: `pnpm check` (typecheck, lint, 80 tests, build with the contrast audit), `pnpm test:coverage` and
  `vsce package` all pass, and the generated `themes/` and `docs/contrast-report.md` are unchanged.

## Re-verification procedure (quarterly)

1. Set `CUTOFF` to now minus 15 days, to the minute. For each package, pick the highest `x.y.z` version (no
   pre-release suffix) published on or before `CUTOFF`. For `@types/node`, restrict to the major matching the runtime
   Node line. Do the same for every action in `.github/workflows/` and resolve the tag to its commit SHA.
2. Run `npm view <pkg>@<ver> peerDependencies engines --json` for each candidate. Confirm typescript-eslint's
   `typescript` range includes the chosen TypeScript, `@eslint/js` and eslint-config-prettier ranges include the chosen
   ESLint, and `@vitest/coverage-v8` equals the vitest version exactly.
3. In a scratch copy of `package.json`, `pnpm-workspace.yaml` and `.npmrc`, pin the candidate set, delete the lockfile
   and run `pnpm install --lockfile-only`, then `pnpm audit`. Require zero findings and cross-check each version in the
   GitHub Advisory Database. If a version has an advisory, take the first patched version; if that is younger than 15
   days, record a dated waiver and, if it is not the newest in its range, a scoped `overrides` entry.
4. Re-check every entry under `overrides`: remove it when the parents' declared ranges accept the patched version.
5. Read the GitHub release page for each chosen version and search its issue tracker for that version together with
   "regression". Skip a version only for a confirmed regression in that exact version.
6. Apply the set in the repo, delete `pnpm-lock.yaml`, run `pnpm install`, then `pnpm audit`, `pnpm check`,
   `pnpm test:coverage` and `pnpm exec vsce package`.
7. For a new pnpm, decode `npm view pnpm@<ver> dist.integrity` from base64 to hex for the `packageManager` string, and
   check that the same decoding reproduces the current pin.
8. Re-derive `engines.node` from the lockfile's engine ranges and update this document and the dated notes in
   `CLAUDE.md`.
