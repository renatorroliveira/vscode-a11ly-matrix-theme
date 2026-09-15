# Pinned Dev Dependency Versions

Research date: 2026-09-15. Runtime: Node v24.21.0, npm 11.19.0, corepack 0.36.0.
Cutoff for rule 1 (published at least 30 days ago): 2026-08-16.

## Selection rules applied

1. Only versions published on or before 2026-08-16 (from `npm view <pkg> time --json`).
2. Latest stable among those, including latest major. No pre-release tags.
3. No known security advisory (npm audit on a scratch project, npm registry bulk
   advisory endpoint, GitHub Advisory Database where rate limits allowed).
4. No widely reported breaking regression for the exact version.
5. Mutually compatible peer dependency ranges.

## Summary table

| Package                | Pinned  | Published  | Latest today                                             | Reason if not latest                                                                                                                                             | Advisory check                                                       | Peer-compat notes                                                                                                        |
| ---------------------- | ------- | ---------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| typescript             | 6.0.3   | 2026-04-16 | 7.0.2 (2026-07-08)                                       | typescript-eslint 8.x peer range is `>=4.8.4 <6.1.0`; TS 7 support closed as "not planned" (typescript-eslint#12518). 7.0.2 also passes rule 1 but fails rule 5. | none                                                                 | Works with @types/vscode 1.125.0 and @types/node 24.13.3 (tsc smoke test passed).                                        |
| @types/node            | 24.13.3 | 2026-07-08 | 26.6.0 (2026-09-15); newest 24.x is 24.13.4 (2026-09-09) | Pinned to the Node 24 line per runtime. 24.13.4 is younger than 30 days.                                                                                         | none                                                                 | vitest peer `>=24.0.0` satisfied.                                                                                        |
| @types/vscode          | 1.125.0 | 2026-06-17 | 1.137.0 (2026-09-09)                                     | 1.137.0, 1.136.x and later are younger than 30 days. Implies `engines.vscode: ^1.125.0`.                                                                         | none                                                                 | No peers.                                                                                                                |
| eslint                 | 10.8.1  | 2026-08-07 | 10.10.0 (2026-09-04)                                     | 10.9.x and 10.10.0 are younger than 30 days.                                                                                                                     | none                                                                 | engines `^20.19.0 \|\| ^22.13.0 \|\| >=24`. Optional peer `jiti` not needed for `.mjs` config.                           |
| @eslint/js             | 10.0.1  | 2026-02-06 | 10.0.1                                                   | Is latest.                                                                                                                                                       | none                                                                 | peer `eslint ^10.0.0` satisfied by 10.8.1.                                                                               |
| typescript-eslint      | 8.67.0  | 2026-08-10 | 8.70.0 (2026-09-07)                                      | 8.68 to 8.70 are younger than 30 days.                                                                                                                           | none                                                                 | peers `eslint ^8.57 \|\| ^9 \|\| ^10` and `typescript >=4.8.4 <6.1.0`; both satisfied.                                   |
| eslint-config-prettier | 10.1.8  | 2025-07-18 | 10.1.8                                                   | Is latest. 10.1.6 and 10.1.7 carried malicious code (GHSA-r568-chxc-crfm, GHSA-f29h-pxvx-f335); 10.1.8 is the clean re-release.                                  | none for 10.1.8                                                      | peer `eslint >=7.0.0`.                                                                                                   |
| prettier               | 3.9.6   | 2026-07-21 | 3.9.6                                                    | Is latest.                                                                                                                                                       | none                                                                 | No peers.                                                                                                                |
| vitest                 | 4.1.11  | 2026-08-18 | 5.0.1 (2026-09-15)                                       | See "Vitest exception" below. 4.1.10 (2026-07-06) meets rule 1 but is vulnerable.                                                                                | none for 4.1.11; 4.1.10 hit GHSA-82fw-gwwq-j7x9 (moderate, CVSS 5.9) | engines `^20 \|\| ^22 \|\| >=24`. Non-optional peer `vite ^6 \|\| ^7 \|\| ^8`, resolved automatically (installed 8.3.0). |
| @vitest/coverage-v8    | 4.1.11  | 2026-08-18 | 5.0.1                                                    | Must match vitest exactly (peer `vitest: 4.1.11`). Keep, do not skip.                                                                                            | none                                                                 | Exact-version peer on vitest.                                                                                            |
| @vscode/vsce           | 3.9.2   | 2026-06-03 | 4.0.0 (2026-09-14)                                       | 4.0.0 is one day old and raises the Node baseline to 22.                                                                                                         | none                                                                 | engines `>= 20`.                                                                                                         |
| globals                | 17.11.0 | 2026-08-12 | 17.12.0 (2026-09-01)                                     | 17.12.0 is younger than 30 days.                                                                                                                                 | none                                                                 | engines `>=18`.                                                                                                          |
| pnpm                   | 11.22.0 | 2026-08-15 | 12.4.2 (2026-09-15)                                      | 12.0.0 was published 2026-08-26; it becomes rule-1 eligible on 2026-09-25.                                                                                       | none                                                                 | engines `node >=22.13`.                                                                                                  |

### Vitest exception (needs a decision)

Rules 1 and 3 conflict for vitest. GHSA-82fw-gwwq-j7x9 (path traversal via
`@vitest/mocker` redirect mock) affects every release from 2.1.0 through 4.1.10.
The first fixed release, 4.1.11, is 27 days old today and satisfies rule 1 on
2026-09-17. Stepping down per rule 3 would land on 2.0.x from 2024, which is not
a serious option. Recommendation: pin 4.1.11 now and record the two-day waiver,
or hold the vitest pair at 4.1.10 for two days and then bump. The advisory is
dev-only and requires a hostile redirect mock during a test run, so real exposure
for a color-theme repo is negligible either way. There is no 4.1.12; 4.1.11 is
the last 4.x release.

### Regression checks performed (rule 4)

- typescript 6.0.3: one open type-checker regression (microsoft/TypeScript#64197,
  excess property checks at reverse-mapped-type inference sites, Prisma-shaped
  types). Not relevant to this repo. No compiler crashes reported.
- eslint 10.8.1: patch release fixing five rule bugs. No regressions reported.
- typescript-eslint 8.67.0: feature release (exports basic globs). No regressions.
- prettier 3.9.6: preserves quotes on methods named `new`, supports `import defer`.
  No later 3.9.x exists, so no post-release fixes were needed.
- vitest 4.1.11: one third-party report of Windows path handling with a
  Solid-specific virtual module after moving 3.2.4 to 4.1.11; not attributed to
  4.1.11 specifically and not applicable here.
- @vscode/vsce 3.9.2, globals 17.11.0, pnpm 11.22.0, @eslint/js 10.0.1,
  eslint-config-prettier 10.1.8: release notes show no regressions or reverts.

## devDependencies block

```json
"devDependencies": {
  "@eslint/js": "10.0.1",
  "@types/node": "24.13.3",
  "@types/vscode": "1.125.0",
  "@vitest/coverage-v8": "4.1.11",
  "@vscode/vsce": "3.9.2",
  "eslint": "10.8.1",
  "eslint-config-prettier": "10.1.8",
  "globals": "17.11.0",
  "prettier": "3.9.6",
  "typescript": "6.0.3",
  "typescript-eslint": "8.67.0",
  "vitest": "4.1.11"
}
```

## packageManager field

Generated by `corepack use pnpm@11.22.0`. Corepack 0.36.0 emits a sha512 hash,
not the legacy sha224. The hex was verified equal to the base64-decoded
`dist.integrity` field from the npm registry for pnpm@11.22.0.

```json
"packageManager": "pnpm@11.22.0+sha512.1ff870c4c6133dfd88fb2afc46dd13d47f09c9794b438c6fdb47ca98caf3bc16381ee0be93a091b8e3824cf01f889f46d7d9e20910fb0be1ab0fb5baa80dd621"
```

## engines block

```json
"engines": {
  "node": ">=24.0.0",
  "vscode": "^1.125.0"
}
```

Node `>=24.0.0` is the intersection of all pinned engines (strictest is pnpm
`>=22.13` and eslint `>=24` for the 24 line). `vscode ^1.125.0` follows from
@types/vscode 1.125.0; the API typings must not exceed the minimum VS Code the
extension declares.

## How this was verified

All work was done in `/tmp/dep-research`; nothing was installed in the repo.

```bash
node --version; npm --version; corepack --version        # v24.21.0, 11.19.0, 0.36.0
npm view <pkg> time --json                              # publish timestamps, all 13 packages
npm view <pkg> dist-tags --json                         # current latest tag
npm view <pkg>@<ver> peerDependencies peerDependenciesMeta engines dist.integrity --json
npm view @types/node time --json                        # filtered to 24.x line
npm view vitest time --json                             # dates for 4.1.10, 4.1.11, 5.0.0, 5.0.1
npm view pnpm time --json                               # dates for 11.22.0, 12.0.0
corepack use pnpm@11.22.0                               # in scratch dir, yields packageManager string
node -e 'Buffer.from(<dist.integrity base64>,"base64").toString("hex")'  # hash cross-check
curl -s "https://api.github.com/advisories?ecosystem=npm&affects=<pkg>@<ver>"  # 0 hits for 12 packages; rate-limited before vitest could be re-queried
curl -s -X POST https://registry.npmjs.org/-/npm/v1/security/advisories/bulk -d '{"<pkg>":["<ver>"],...}'  # second advisory source, not rate-limited
npm install --ignore-scripts && npm audit --json        # scratch project with the exact set
```

Scratch audit results: with vitest 4.1.10 the audit reported 3 moderate findings,
all GHSA-82fw-gwwq-j7x9. With vitest and @vitest/coverage-v8 at 4.1.11 the audit
reported 0 findings.

Toolchain smoke test in the scratch project with the exact pinned set: `tsc
--noEmit` on a file importing `vscode` (TypeScript 6.0.3), `eslint` with a flat
config combining @eslint/js, typescript-eslint, eslint-config-prettier and
globals (ESLint 10.8.1), `prettier --check`, `vitest run --coverage` (1 test
passed, V8 coverage report produced) and `vsce --version` (3.9.2). All ran.

Release notes were read from GitHub release pages and the Prettier CHANGELOG;
regression reports were searched on the web per package and version.

## Re-verification procedure (quarterly)

1. Set `CUTOFF` to today minus 30 days. For each package run
   `npm view <pkg> time --json` and pick the highest `x.y.z` version (no
   pre-release suffix) with a publish date on or before `CUTOFF`. For
   `@types/node`, restrict to the major matching the runtime Node line.
2. Run `npm view <pkg>@<ver> peerDependencies engines --json` for each candidate.
   Confirm typescript-eslint's `typescript` range includes the chosen
   TypeScript, `@eslint/js` and eslint-config-prettier ranges include the chosen
   ESLint, and `@vitest/coverage-v8` equals the vitest version exactly.
3. Create `/tmp/dep-research/audit/package.json` with the candidate set as exact
   `devDependencies`, then run `npm install --ignore-scripts` and
   `npm audit --json`. Require zero findings. Cross-check with the npm bulk
   advisory endpoint shown above. If a version has an advisory, take the first
   patched version; if that is younger than 30 days, record a dated waiver as
   done for vitest above.
4. Read the GitHub release page for each chosen version and search for
   `<pkg> <version> regression`. Skip a version only for a confirmed regression
   in that exact version.
5. Run the smoke test (tsc, eslint, prettier, vitest with coverage, vsce) in the
   scratch project.
6. Run `corepack use pnpm@<ver>` in the scratch project and copy the resulting
   `packageManager` string. Verify the hex matches `npm view pnpm@<ver>
dist.integrity` decoded from base64.
7. Update `engines.vscode` to `^<@types/vscode version>` and update this document.
