# Publishing to the VS Code Marketplace and Open VSX

Research date: 2026-11-20. Scope: what it takes to publish this theme (`renatorroliveira.vscode-a11ly-matrix-theme`) to the
Visual Studio Marketplace and the Open VSX Registry from GitHub Actions with OIDC trusted publishing and no long-lived
tokens, plus the toolchain versions that path needs under this repo's 15-day minimum release age. This supersedes the
"Packaging and publishing" section of `vscode-extension-and-theme-research.md` (2026-09-15) where the two disagree.
Every claim cites a source in the References section; version ages were computed by a script against the npm registry
and the GitHub API on the research date. Updated 2026-11-21: the publisher ID is `renatorroliveira`, the same as the
GitHub login, which changes the Open VSX first-release steps.

## Summary

Status 2026-11-21: the toolchain part of this plan has landed. `@vscode/vsce` 4.1.0 and `ovsx` 1.3.0 are pinned,
`pnpm audit` is at zero and the CI action pins are on the versions in section 1. Details are in
`dependency-versions.md`. The findings below are kept as researched on 2026-11-20.

- **`@vscode/vsce` 3.9.2 (pinned at research time) cannot do OIDC.** `--oidc` landed in 4.0.0 (#1291).
    - 4.0.0's token exchange omits `api-version`, so the Marketplace answers `400 No api-version was supplied`. It also
      sends `Bearer` where the Marketplace expects `FederatedToken`.
    - #1337 fixed both and shipped in 4.1.0. Its PR says live end-to-end publishing was untested, but a public
      extension pinned to `^4.1.0` has since published through OIDC [8].
    - 4.1.0 is therefore the minimum working version. It is also the newest one the 15-day rule allows today; 4.1.1
      becomes eligible on 2026-11-27 [1][2][3][4].
- **`ovsx` 1.3.0 is the newest eligible ovsx and requires `@vscode/vsce ^4.0.0`.** Pairing it with the current 3.9.2
  pin would install a second vsce. Bump both together: `@vscode/vsce` 4.1.0 + `ovsx` 1.3.0 [5].
- **`pnpm audit` failed on `main` on 2026-11-20: 45 advisories (15 high), all published after CI last passed on
  2026-09-23.** Cleared on 2026-11-21 by the toolchain upgrade and a scoped `minimatch` override (section 2).
- **Global Azure DevOps PATs now retire on 2027-01-27, not 2026-12-01.** The VS Code publishing page (updated
  2026-11-18) still says 2026-12-01; the Azure DevOps blog post records the postponement. Neither date matters for the
  OIDC path, which uses no PAT [6][7].
- **The first-ever version of an extension can be published through OIDC.** A public test on 2026-11-05 published a
  brand-new extension's first version with `vsce publish --oidc`. That version was a pre-release, and the stable
  publish right after it was lost (see the next point), so a stable first publish through OIDC is not yet proven [8].
- **`vsce publish` can print "Published" when the Marketplace actually rejected the upload** (open issue #1354,
  root cause in `typed-rest-client`). The release workflow must confirm the version exists afterwards [8][9].
- **Listing gaps:** no `icon` (the Marketplace shows a default), and the README embeds `docs/screenshot.png`, which
  does not exist, so the listing would show a broken image. `"private": true` does not block vsce; vsce has no check
  for it, and it keeps `npm publish` from ever uploading the repo to npm [10].
- **Open VSX trusted publishing is live (GitHub Actions only, ovsx 1.2.0 or later), but it can't make the first
  upload.**
    - The first version must be published the ordinary way: `ovsx` with an access token (tokens now expire after 90
      days) or the browser upload on open-vsx.org. Because the namespace equals the GitHub login, the browser upload
      also creates the namespace, so the first release needs no token. The trusted-publishing page only names the
      token route; that a browser upload satisfies its "existing active version" prerequisite is inferred [17][22][28].
    - OIDC also requires verified namespace ownership, which is claimed through a GitHub issue once something has been
      published [28].
- **The first Open VSX upload should happen before the first Marketplace publish.**
    - Since 2026-10, a first upload is quarantined when the extension, or by the scanner code's reading any extension of
      the same publisher name, exists on the Marketplace and the Open VSX namespace isn't owned.
    - `ovsx` still exits 0 when that happens [23].
- Package once, then publish the **same `.vsix`** to both registries.

## 1. Toolchain versions

Ages are measured against 2026-11-20 and the 21600-minute rule in `pnpm-workspace.yaml`. The "Pinned" columns show
the state after the 2026-11-21 upgrade.

### npm packages

| Package        | Pinned | Latest | Newest eligible | Notes                                                                                |
| -------------- | ------ | ------ | --------------- | ------------------------------------------------------------------------------------ |
| `@vscode/vsce` | 4.1.0  | 4.1.1  | 4.1.0           | 4.1.0 published 2026-10-28; 4.1.1 (2026-11-12) only bumps `vsce-sign` and a dev dep. |
| `ovsx`         | 1.3.0  | 1.4.0  | 1.3.0           | 1.3.0 published 2026-10-16; 1.4.0 (2026-11-09) eligible on 2026-11-24.               |

What changes from vsce 3.9 to 4.1 [2][3]:

- Node.js baseline raised to 22 (repo runs 24).
- `keytar` replaced by `@napi-rs/keyring` (prebuilt binaries, no install script), with a prompted migration of legacy
  stored PATs. The dead `keytar: false` entry was removed from `allowBuilds` on 2026-11-21.
- `@vscode/vsce-sign` is still a hard dependency with a `postinstall`; keep it denied. Issue #1353 asks to make it
  optional [11].
- `glob`, `chalk`, `form-data`, `leven`, `parse-semver`, `cheerio` and `markdown-it` are gone from the tree, which
  removes most of today's audit findings (`undici`, `fast-uri`, `markdown-it`, `glob`, `@azure/msal-node`).
- No advisories exist in the GitHub Advisory Database for `@vscode/vsce`, `ovsx`, `@vscode/vsce-sign` or
  `@napi-rs/keyring` [12].

Known defects on the vsce tracker (none is a regression introduced in 4.1.0):

- #1354 (open): false "Published" success on a server 404, all versions [9].
- #1349 (closed, user error): the 400 exchange failure reported against "4.1.0" was really 4.0.0 [4].

### GitHub Actions

| Action                            | Pinned in `ci.yml` | Latest | Newest eligible | Full SHA of newest eligible                |
| --------------------------------- | ------------------ | ------ | --------------- | ------------------------------------------ |
| `actions/checkout`                | v7.0.1             | v7.0.1 | v7.0.1          | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node`              | v7.1.0             | v7.1.0 | v7.1.0          | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| `pnpm/setup`                      | v3.1.2             | v3.2.0 | v3.1.2          | `fa36a5ef7dcdefc3a7cb25655c122e00cf6e636e` |
| `actions/upload-artifact`         | v7.0.2             | v7.0.2 | v7.0.2          | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |
| `actions/download-artifact`       | none               | v8.0.2 | v8.0.2          | `9000827ccba6bdab643e8b6fd33ac0654aef8333` |
| `actions/attest-build-provenance` | none               | v4.2.2 | v4.2.2          | `4d101475d8b20a2381f78447822ac1eab6504dd8` |

`pnpm/setup` v3.0.0 (2026-09-20) is a major with two breaking changes: the run id is now part of the cache key, and
Node.js version files are detected automatically. v3.2.0 becomes eligible on 2026-11-27. Several cache-scoping issues
are open against v3 (#101, #102, #103). They don't affect a release job that disables the cache, which it should
anyway to avoid cache poisoning [13]. `ci.yml` moved to v3.1.2 on 2026-11-21; the repo has no Node.js version file, so
v3's detection installs nothing next to `actions/setup-node`.

## 2. Repository gaps before the first publish

1. **Audit was red (cleared 2026-11-21).** Measured on a scratch copy of the lockfile on 2026-11-20:

    | State                                                  | Advisories | Severity               |
    | ------------------------------------------------------ | ---------- | ---------------------- |
    | Current `pnpm-lock.yaml`                               | 45         | 7 low, 23 mod, 15 high |
    | `@vscode/vsce` 4.1.0 + `ovsx` 1.3.0                    | 14         | 1 low, 9 mod, 4 high   |
    | Same, then `pnpm update --lockfile-only` (age-limited) | 3          | 3 moderate             |

    The 3 left are `@vitest/mocker` 4.1.11 (GHSA-qxg6-89mg-rqv8, GHSA-xp26-3454-mjgp; fixed by pinning `vitest` and
    `@vitest/coverage-v8` to 4.1.12, published 2026-10-15) and `minimatch` 10.2.6 (GHSA-g3hv-75wg-m249, medium,
    `>=7.0.0 <11.0.1`).
    - No 10.x backport exists, and vsce 4.1.0 and ESLint both declare `^10`, so clearing it needs a scoped
      `overrides` entry onto 11.x.
    - 11.0.1, the first patched release, is already past the age rule, so no waiver is involved. The general "latest
      eligible" rule would pick the newest eligible 11.x instead (11.0.5 when checked).
    - Resolution on 2026-11-21: a fresh resolution with vitest 5.1.0 left only the `minimatch` finding, and the
      override `minimatch@<11.0.1` -> 11.0.5 cleared it. With and without the override, ESLint linted the same 34
      files with the same results and `vsce package` produced a byte-identical VSIX.

2. **No icon.** Add a PNG of at least 128x128 px and `"icon"` in `package.json`. SVG is rejected [10].
3. **Broken README image.** `README.md` line 15 embeds `docs/screenshot.png`, which is still a TODO. vsce rewrites the
   relative path to `https://github.com/<owner>/<repo>/raw/HEAD/docs/screenshot.png` (confirmed in the existing
   0.1.0 VSIX, built with vsce 3.9.2), so the listing would show a broken image. Capture the screenshot or drop the line before publishing.
4. **README badges are fine.** `img.shields.io` is on vsce's trusted SVG host list, and the CI badge matches vsce's
   GitHub workflow badge pattern [14]. All other images must be HTTPS and not SVG.
5. **Link base.** Relative README links resolve against `HEAD`. Passing `--githubBranch v<version>` at package time
   would pin listing links to the released tag instead.
6. **Scripts.** `publish:marketplace` runs `vsce publish` locally, which needs a PAT or `--azure-credential`. With
   OIDC chosen, publishing belongs to the release workflow; the local script can stay as a break-glass path or go.
7. **Version.** `0.1.0` has an odd minor. That only matters if the pre-release channel is ever used: Microsoft
   recommends `major.EVEN.patch` for releases and `major.ODD.patch` for pre-releases, because VS Code auto-updates to
   the highest version [10].

## 3. Visual Studio Marketplace

### One-time setup (manual, in a browser)

1. Sign in at `https://marketplace.visualstudio.com/manage` with a Microsoft account and create the publisher whose ID
   equals `package.json` `publisher` (`renatorroliveira`, the GitHub login, chosen 2026-11-21). **The ID cannot be
   changed afterwards**; the display name can, but
   changing it revokes a verified badge [10]. If the publisher already exists, skip this step.
2. In the publisher, open **Trusted Publishing**, expand **Create** and fill in [10]:
    - Policy name: free text, for example `Release workflow`.
    - Repository owner: exact GitHub login (`renatorroliveira`).
    - Repository: `vscode-a11ly-matrix-theme`.
    - Workflow: the file name under `.github/workflows/`, for example `release.yml`.
    - Environment: the exact GitHub environment name, for example `marketplace`, or empty. Set it. The policy has no
      branch or tag field, so the environment's deployment rules are the only way to stop non-release refs from
      publishing.
3. A policy for a **private** repository must be used within 48 hours or it lapses; the first successful exchange
   activates it permanently. This repo is public, so that limit doesn't apply [10].
4. No Azure DevOps organization or PAT is needed on this path. The PAT section of the docs is the only place that
   mentions creating an organization [10].

### How OIDC publishing behaves

- The job needs `permissions: id-token: write`. vsce requests a GitHub token for the audience
  `marketplace.visualstudio.com` and exchanges it at
  `POST /_apis/gallery/token?api-version=7.2-preview.1` with `Authorization: FederatedToken <jwt>` [1][15].
- The Marketplace credential lasts 15 minutes, and each GitHub token can be exchanged only once [10].
- vsce never falls back to a PAT when OIDC fails [15].
- GitHub Actions is the only supported OIDC provider. Entra ID (`--azure-credential`) setup is documented under "Publish
  from Azure Pipelines"; no GitHub Actions recipe is given for it [10].
- `vsce publish --packagePath <file.vsix>` publishes a prebuilt package without re-running `vscode:prepublish`.
  `--skip-duplicate` makes re-runs idempotent.

### Known failure to guard against

vsce#1354 and vsmarketplace#2316: on 2026-11-05 a stable version printed `Published ...` but never appeared, because
the server answered `404 ExtensionDoesNotExistException` and `typed-rest-client` swallowed the rejection. The root cause
on the server side was still under investigation on 2026-11-10. Verify after publishing with `vsce show <id> --json`
until the version is listed, and fail the job if it never appears [8][9].

### Listing and lifecycle rules [10]

- `name` must be unique on the Marketplace, and so must `displayName`.
- Images in the README and CHANGELOG must be HTTPS and not SVG, unless they come from a trusted badge provider. vsce
  refuses to package user-provided SVGs.
- **Unpublish** hides the extension but keeps its stats; it can be republished from the portal. **Remove** is
  irreversible and permanently reserves the name, even for the original publisher. A deleted version number can't be
  reused, and the latest version can't be deleted.
- Pre-release: `--pre-release` on `vsce package` or `vsce publish`; needs `engines.vscode >= 1.63.0`; semver
  pre-release tags (`1.0.0-beta`) are not supported.
- Verified publisher: needs one or more extensions on the Marketplace for at least 6 months, plus a domain (not a
  subdomain such as `*.github.io`) registered for at least 6 months, served over HTTPS, answering `HEAD` with 200, and
  proven with a DNS TXT record. Review takes up to 5 business days. The earliest possible date is 6 months after the
  first publish.
- Signing: the publishing page doesn't say whether the Marketplace signs uploads. The Azure DevOps extensions publishing
  overview says Microsoft virus-scans every new and updated package. That page covers Azure DevOps extensions, and the
  claim was not re-verified for VS Code extensions.
- Package managers: the docs and vsce README list npm and yarn v1 only. `"vsce": { "dependencies": false }` (already
  set) is what makes pnpm work.

### PAT retirement, for the record

The VS Code page says: "On December 1, 2026, global Personal Access Tokens (PATs) in Azure DevOps are retired." The
Azure DevOps blog post (2025-12-12, with later updates) lists "December 1, 2026 January 27, 2027 – All existing global
PATs will be fully decommissioned" and an "Update 10/23" saying the retirement was postponed. Treat 2027-01-27 as
current, and the VS Code page as stale [6][7].

## 4. Open VSX Registry

The project moved from `eclipse/openvsx` to `eclipse-openvsx/openvsx` (old URLs redirect). The publishing guide for the
open-vsx.org instance lives in the `EclipseFdn/open-vsx.org` wiki. Neither that page nor the upstream "Publishing
Extensions" page mentions trusted publishing; only the upstream "Trusted-Publishing" page does. `https://open-vsx.org/api/version` reported registry `v1.4.0-ef.1` with a trusted-publishing
audience of `https://open-vsx.org` on the research date [16][17].

### Accounts and agreement

1. Create an eclipse.org account and fill in its **GitHub Username** field with the same GitHub account you will log in
   with on open-vsx.org [17].
    - A bug from late July 2026 made the signup confirmation link show a 500 page even though the account was created.
      One user reported that logging in with the email address, not the username, worked. Eclipse staff announced a fix
      on 2026-11-11, which has not been re-tested [18].
2. Log in to open-vsx.org with GitHub, then **Log in with Eclipse** in the profile and accept the **Publisher
   Agreement**.
    - The live text is "Version 1.1 – September 2025".
    - Signing the Eclipse Contributor Agreement on the Eclipse site is not the same and doesn't count [17][19].
    - The agreement makes MIT the default license when none is specified. This repo already declares MIT [19].

### Namespace

- The namespace equals `publisher`: `renatorroliveira`, which is also the GitHub login. For a namespace that matches the
  GitHub ID, the browser upload at `https://open-vsx.org/user-settings/extensions` (**Publish** > **Publish Extension**)
  creates it during the first publish; `ovsx create-namespace renatorroliveira -p <token>` is the CLI route [17][22].
  The creator becomes a **contributor**, not the verified owner. The ovsx README sentence "everyone will be able to publish" is stale [20].
- Users see unverified versions with a warning icon ("That user account is not a verified publisher of the namespace").
- Ownership is claimed by **opening a GitHub issue** with the `claim-namespace-ownership` template in
  `EclipseFdn/open-vsx.org`, not through the site UI. The old research doc gets this wrong.
    - The "Managing Namespaces" wiki says you "need to create the namespace and publish an extension to it" before
      claiming. The template requires a requesting GitHub account with at least 12 months of public history.
    - Validation option 1 covers a Marketplace publisher with a repo: prove repo ownership or link a commit.
    - Option 3 (namespace equals GitHub ID) holds here, but it is titled "Not a VS Code Marketplace Publisher". Once
      the Marketplace listing exists, option 1 is the one that fits.
    - Recent claims closed fast: median 6.3 h over the 100 newest closed issues, a sample biased toward fast closes.
      37 were still open, the oldest from 2026-08-02 [21][22].

### Marketplace namespace check (affects the first release)

Since 2026-10, if an extension's publisher exists on the VS Code Marketplace and you don't own the matching Open VSX
namespace, the Open VSX upload is **quarantined "under review", and the CLI still exits 0**. A green job doesn't prove
the version is public [17][23].

- Production config: `namespace-ownership-check` is `enforced: true`, with `check-active-extensions: false`, so only an
  extension's first publish is checked [24].
- The scanner source says the check is namespace-wide and looks for Marketplace extensions under the same publisher
  name. The wiki and blog describe a per-extension match.
- Inference from the code, not tested: a Marketplace publisher with no public extensions does not trigger it.

Versions are immutable. A deleted or quarantined version number can never be published again without an admin purge,
so a bad first upload burns its version number [25].

### Authentication

- **Access tokens** are created at `https://open-vsx.org/user-settings/tokens`.
    - They carry the prefix `ovsxat_` and expire after 90 days.
    - Since registry 1.3.0 they can be scoped to a namespace or extension and limited to publishing [24][26].
    - The wiki's "valid until deleted" is outdated.
- **Trusted publishing (OIDC) is live, GitHub Actions only** [27][28].
    - CLI support first shipped in ovsx 1.2.0, despite the CHANGELOG listing it under 1.1.0.
    - Private repositories need ovsx 1.4.0 and a registration code; this repo is public, so 1.3.0 is enough.
- Trusted publishing prerequisites [28]:
    - **Verified namespace ownership.** Being a contributor is not enough.
    - A signed Publisher Agreement.
    - **The extension must already exist with an active version.** "The first version has to be published the ordinary
      way, with an access token."
    - One trusted publisher per extension.
- Registration is under **Settings > Trusted Publishers**.
    - Fields: GitHub owner, repository, workflow file name, and an optional environment.
    - Like the Marketplace policy, it has no branch or tag field.
    - It can't be edited, only deleted and recreated.
    - It's dropped automatically if its creator stops being an owner. It silently stops working if every version of the
      extension is deleted [28].
    - The wiki still lists a known limitation that `publisher` must match the namespace's case exactly (#2279). Registry
      1.3.0 fixed it, and it's moot here because both are `renatorroliveira`.
- Workflow requirements [28][29]:
    - The job needs `id-token: write`. Run `ovsx publish <file.vsix> --trusted-publishing`; the flag is enabled
      automatically when CI provides an ID token and no access token is given.
    - **A `--pat` or `OVSX_PAT` always takes precedence**, so leave the secret out of the workflow or it keeps
      publishing with the token.
    - The issued token lasts about five minutes and is scoped to one extension.
    - `--skip-duplicate` exists in 1.3.0.

### CLI behaviour

- `ovsx publish <file.vsix>` publishes the prebuilt package. It never runs `vscode:prepublish` or vsce's dependency
  walk, which sidesteps the pnpm problem [20].
    - `@vscode/vsce` is still installed as an ovsx dependency, since ovsx imports `createVSIX` from it at load time.
- 1.3.0 behaviour changes [29]:
    - Moved to vsce 4 (`createVSIX` API unchanged).
    - commander 14 rejects surplus arguments.
    - Tokens are sent as `Authorization: Bearer` headers.
- No regression reports were found for publishing a prebuilt VSIX with 1.3.0 or 1.4.0. Fixed on `main` but unreleased:
  a stored-token mix-up between registries (#2450), which doesn't affect token-less OIDC.
- Avoid `HaaLeo/publish-vscode-extension`, which the wiki recommends: v2.1.0 depends on `ovsx ^0.10.1`. That has no
  trusted publishing and predates the fix for leaking the token into error messages [30].

### Server-side checks and signing

- Every upload goes through checks before activation [17][31]:
    - blocklist
    - secret detection
    - ClamAV
    - YARA
    - the asynchronous Argus scanner, with a 30-minute timeout
    - the Marketplace namespace check
- A clean publish normally activates in seconds. A slow asynchronous scan may delay it (inferred from code).
- Open VSX **signs extensions itself**: the API exposes `signature` and `publicKey` files, and `ovsx verify` checks them.
  Publishers have no signing step.

### Order of operations for the first release

Trusted publishing can't make the first Open VSX upload, and a Marketplace listing published first would put that
upload into quarantine. So the first release publishes to Open VSX **before** the Marketplace:

1. Push the release tag. The workflow packages the VSIX and pauses at the `marketplace` environment approval. The
   `openvsx` job is disabled by a repository variable for now.
2. Download that run's VSIX from the run page's **Artifacts** section, or with `gh run download <run-id> -n vsix`.
   Upload it on open-vsx.org with **Publish** > **Publish Extension**; the upload creates the `renatorroliveira`
   namespace because it matches the GitHub login. CLI fallback: a short-lived token and
   `pnpm exec ovsx publish <file>.vsix`. Confirm the version shows as active, not under review, on open-vsx.org.
3. Approve the `marketplace` environment. The Marketplace job publishes the same bytes through OIDC.
4. File the namespace ownership claim (validation option 1, now that the Marketplace listing exists).
5. Once the namespace is verified, register the trusted publisher (`release.yml`, environment `openvsx`), set the
   variable `OPENVSX_TRUSTED_PUBLISHING=true`, and delete the token if step 2 used one.

From the second release on, both registries publish from the workflow with no stored secret.

## 5. Proposed release workflow (sketch, not committed)

Trigger on a `v*` tag. The workflow packages once, publishes the same VSIX to both registries from separate jobs (so a
failure in one can be re-run alone), verifies the Marketplace publish, then creates a GitHub Release carrying the VSIX.
Action pins use the newest eligible versions from section 1, the same ones `ci.yml` uses. The cache is disabled in every
job.

The jobs install the pinned toolchain from the lockfile instead of the docs' `npx @vscode/vsce` and `npx ovsx`, which
would fetch unpinned versions outside the age rule.

```yaml
# .github/workflows/release.yml
name: Release

on:
    push:
        tags:
            - 'v*.*.*'

permissions: {}

concurrency:
    group: release
    cancel-in-progress: false

jobs:
    package:
        name: Check and package
        runs-on: ubuntu-latest
        timeout-minutes: 15
        permissions:
            contents: read
        steps:
            - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
              with:
                  persist-credentials: false
            - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
              with:
                  node-version: 24
            - uses: pnpm/setup@fa36a5ef7dcdefc3a7cb25655c122e00cf6e636e # v3.1.2
              with:
                  cache: false
                  require-lockfile: true
            - run: pnpm audit
            - run: pnpm check
            - run: git diff --exit-code -- themes docs/contrast-report.md
            - name: Require the tag to match package.json
              run: test "v$(node -p "require('./package.json').version")" = "$GITHUB_REF_NAME"
            # --out treats the path as a directory only if it already exists.
            - run: mkdir -p dist && pnpm exec vsce package --githubBranch "$GITHUB_REF_NAME" --out dist/
            - uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
              with:
                  name: vsix
                  path: dist/*.vsix
                  if-no-files-found: error

    marketplace:
        name: Publish to the VS Code Marketplace
        needs: package
        runs-on: ubuntu-latest
        timeout-minutes: 30
        environment: marketplace
        permissions:
            contents: read
            id-token: write
        steps:
            - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
              with:
                  persist-credentials: false
            - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
              with:
                  node-version: 24
            - uses: pnpm/setup@fa36a5ef7dcdefc3a7cb25655c122e00cf6e636e # v3.1.2
              with:
                  cache: false
                  require-lockfile: true
            - uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2
              with:
                  name: vsix
                  path: dist
            - run: pnpm exec vsce publish --oidc --skip-duplicate --packagePath dist/*.vsix
            # vsce#1354: vsce can report success on a server-side 404, so confirm the listing.
            - name: Confirm the version is listed
              run: |
                  version="${GITHUB_REF_NAME#v}"
                  # New versions can sit in "Verifying..." for about 10 minutes (vsmarketplace#2316).
                  for attempt in $(seq 1 40); do
                    if pnpm exec vsce show renatorroliveira.vscode-a11ly-matrix-theme --json | node -e '
                      let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () =>
                        process.exit(JSON.parse(s).versions.some((v) => v.version === process.argv[1]) ? 0 : 1));
                    ' "$version"; then exit 0; fi
                    sleep 30
                  done
                  echo "::error::$version is not listed on the Marketplace after 20 minutes"
                  exit 1

    openvsx:
        name: Publish to Open VSX
        needs: package
        if: vars.OPENVSX_TRUSTED_PUBLISHING == 'true'
        runs-on: ubuntu-latest
        timeout-minutes: 20
        environment: openvsx
        permissions:
            contents: read
            id-token: write
        steps:
            - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
              with:
                  persist-credentials: false
            - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
              with:
                  node-version: 24
            - uses: pnpm/setup@fa36a5ef7dcdefc3a7cb25655c122e00cf6e636e # v3.1.2
              with:
                  cache: false
                  require-lockfile: true
            - uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2
              with:
                  name: vsix
                  path: dist
            # No OVSX_PAT anywhere: a token would take precedence over the OIDC exchange.
            - run: pnpm exec ovsx publish dist/*.vsix --trusted-publishing --skip-duplicate

    github-release:
        name: Attach the VSIX to a GitHub Release
        needs: [marketplace, openvsx]
        if: ${{ !cancelled() && needs.marketplace.result == 'success' && needs.openvsx.result != 'failure' }}
        runs-on: ubuntu-latest
        timeout-minutes: 10
        permissions:
            contents: write
        steps:
            - uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2
              with:
                  name: vsix
                  path: dist
            - run: gh release create "$GITHUB_REF_NAME" dist/*.vsix --repo "$GITHUB_REPOSITORY" --verify-tag --notes "See CHANGELOG.md."
              env:
                  GH_TOKEN: ${{ github.token }}
```

Notes on the sketch:

- **Environments.** Create `marketplace` and `openvsx` with deployment rules limited to tags matching `v*`, and bind
  both trusted-publisher registrations to them. Neither registry's policy can restrict by ref, so this is the ref
  filter. A required reviewer on `marketplace` also provides the pause the first release needs.
- **Not run.** The sketch has never been executed. What was checked against the vsce 4.1.0 source:
    - `--out` appends the default file name only when the path is an existing directory.
    - `show --json` prints the Gallery extension object with `versions[].version`. An unknown extension prints
      `undefined`, which makes the parse throw and the loop retry.
- **No cache.** Release jobs never restore a cache, so a poisoned cache from a PR run can't reach the publishing jobs.
- **Provenance (optional).** `actions/attest-build-provenance` in the `package` job (needs `attestations: write` and
  `id-token: write`) would let users verify the GitHub Release VSIX with `gh attestation verify`. Neither registry
  consumes it.

## 6. First release checklist

1. Done on 2026-11-21: the lockfile is refreshed and `pnpm audit` reports zero findings (`dependency-versions.md`).
2. Add the icon, fix or drop the screenshot, and set the release version and CHANGELOG entry.
3. Create (or confirm) the Marketplace publisher `renatorroliveira`, and the Trusted Publishing policy bound to `release.yml`
   and environment `marketplace`.
4. Create the Eclipse account with the GitHub username filled in, log in to open-vsx.org, and sign the Publisher
   Agreement (section 4).
5. In GitHub > Settings > Environments, create `marketplace` (with yourself as required reviewer) and `openvsx`.
   Limit both to tags matching `v*`. Don't create `OPENVSX_TRUSTED_PUBLISHING` yet.
6. Commit `release.yml` and push a `v<version>` tag that matches `package.json`. Follow "Order of operations for the
   first release" in section 4: Open VSX by hand first, then approve the Marketplace job and watch the verify step.
7. Claim the Open VSX namespace, register the trusted publisher, set the variable, and delete the token if one was
   made.
8. Confirm the extension installs from both registries: run
   `code --install-extension renatorroliveira.vscode-a11ly-matrix-theme`, then install it in an Open VSX consumer such as
   VSCodium.

## 7. Open uncertainties

- Whether the display name "A11y Matrix Theme" is free on the Marketplace. Not checked, to avoid sending the project
  name to outside services during research. The first publish fails if it is taken.
- Whether a first Open VSX version uploaded through the browser satisfies trusted publishing's "existing active version"
  prerequisite. Inferred from the prerequisite's wording; the page only describes the token route.
- The Marketplace-side cause of the 404 in vsmarketplace#2316, still under investigation on 2026-11-10.
- Whether the Marketplace signs packages on upload. The docs read don't say.
- The scope of the Open VSX Marketplace namespace check. The code says namespace-wide, the wiki and blog say
  per-extension. The research also didn't confirm that a Marketplace publisher with no public extensions leaves the
  first Open VSX upload alone (inferred from the scanner code). The first-release order in section 4 avoids depending on
  either answer.
- Whether a namespace can be claimed before its first publish. The "Managing Namespaces" wiki says to publish first.
- Whether `vsce show` lists a version while the hub still shows it as "Verifying". If it doesn't, the verify loop
  waits up to 20 minutes. If verification takes longer, the job goes red even though the publish succeeded; re-running
  is safe because of `--skip-duplicate`.
- How long the asynchronous Argus scan delays activation in practice.
- The 90-day Open VSX token expiry comes from the production configuration file, not a live check.

## References

1. vsce PR #1291, "auth: support OIDC trusted publishing", merged 2026-07-23. https://github.com/microsoft/vscode-vsce/pull/1291
2. vsce release v4.0.0 notes (#1291 OIDC, #1297 OIDC hidden from help, #1308 Node 22, #1329 PAT migration). https://github.com/microsoft/vscode-vsce/releases/tag/v4.0.0
3. vsce PR #1337, "oidc: align token exchange with the Marketplace contract", merged 2026-09-29, shipped in v4.1.0. https://github.com/microsoft/vscode-vsce/pull/1337 and https://github.com/microsoft/vscode-vsce/releases/tag/v4.1.0
4. vsce issue #1349, `--oidc` 400 "No api-version was supplied", closed 2026-10-29 (reporter was on 4.0.0). https://github.com/microsoft/vscode-vsce/issues/1349
5. npm registry metadata for `ovsx` 1.2.0, 1.3.0 and 1.4.0 (dependencies, publish times), retrieved 2026-11-20. https://registry.npmjs.org/ovsx
6. VS Code, "Publishing Extensions" (page footer 2026-11-18). https://code.visualstudio.com/api/working-with-extensions/publishing-extension
7. Azure DevOps Blog, "Retirement of Global Personal Access Tokens in Azure DevOps" (2025-12-12, updated). https://devblogs.microsoft.com/devops/retirement-of-global-personal-access-tokens-in-azure-devops/
8. microsoft/vsmarketplace issue #2316, "Published extension doesn't show up in hub", opened 2026-11-05. https://github.com/microsoft/vsmarketplace/issues/2316
9. vsce issue #1354, false "Published" success on a Gallery 404, open. https://github.com/microsoft/vscode-vsce/issues/1354
10. VS Code, "Publishing Extensions", sections on trusted publishing, publisher creation, verification, listing rules, pre-release, unpublish and remove. https://code.visualstudio.com/api/working-with-extensions/publishing-extension
11. vsce issue #1353, make `@vscode/vsce-sign` optional. https://github.com/microsoft/vscode-vsce/issues/1353
12. GitHub Advisory Database queries (`ecosystem=npm&affects=<pkg>`), 2026-11-20. https://github.com/advisories
13. pnpm/setup releases v3.0.0 to v3.2.0 and issues #101 to #103. https://github.com/pnpm/setup/releases
14. `@vscode/vsce` 4.1.0 published tarball, `out/package.js` (`TrustedSVGSources`, `isGitHubBadge`, no `private` check). https://registry.npmjs.org/@vscode/vsce/-/vsce-4.1.0.tgz
15. `@vscode/vsce` README, "Trusted publishing", and `out/oidc.js` in the 4.1.0 tarball. https://github.com/microsoft/vscode-vsce
16. Open VSX registry version endpoint, retrieved 2026-11-20. https://open-vsx.org/api/version
17. open-vsx.org wiki, "Publishing Extensions" (last edited 2026-09-28). https://github.com/EclipseFdn/open-vsx.org/wiki/Publishing-Extensions
18. eclipse-openvsx/openvsx issue #2440 (two accounts, signup 500 bug), 2026-11-11. https://github.com/eclipse-openvsx/openvsx/issues/2440
19. Open VSX Publisher Agreement, Version 1.1, September 2025. https://open-vsx.org/api/publisher-agreement
20. `ovsx` CLI README and `src/publish.ts`. https://github.com/eclipse-openvsx/openvsx/tree/main/cli
21. Claim namespace ownership issue template (updated 2026-11-13). https://github.com/EclipseFdn/open-vsx.org/blob/aws-main/.github/ISSUE_TEMPLATE/claim-namespace-ownership.yml
22. open-vsx.org wiki, "Managing Namespaces"; upstream wiki, "Namespace Access". https://github.com/EclipseFdn/open-vsx.org/wiki/Managing-Namespaces and https://github.com/eclipse-openvsx/openvsx/wiki/Namespace-Access
23. Eclipse Foundation blog, "Stronger safety nets: VS Code Marketplace namespace matching on Open VSX", 2026-10-15. https://blogs.eclipse.org/post/brian-king/stronger-safety-nets-vs-code-marketplace-namespace-matching-open-vsx
24. open-vsx.org production configuration (`namespace-ownership-check`, `similarity`, `trusted-publishing`, token `prefix` and `expiration`). https://github.com/EclipseFdn/open-vsx.org/blob/aws-main/configuration/application-production.yml
25. Upstream wiki, "Deleting Extensions" (immutable versions since registry 1.1.0). https://github.com/eclipse-openvsx/openvsx/wiki/Deleting-Extensions
26. Open VSX server configuration reference (token expiration default `P90D` since 0.33.0). https://github.com/eclipse-openvsx/openvsx/blob/main/doc/configuration.md
27. Eclipse Foundation blog, "Trusted publishing on Open VSX", 2026-09-30. https://blogs.eclipse.org/post/tamas-cservenak/trusted-publishing-open-vsx
28. Upstream wiki, "Trusted Publishing". https://github.com/eclipse-openvsx/openvsx/wiki/Trusted-Publishing
29. `ovsx` CLI CHANGELOG and the published 1.2.0, 1.3.0 and 1.4.0 tarballs (`lib/main.js` flags `--trusted-publishing`, `--skip-duplicate`). https://github.com/eclipse-openvsx/openvsx/blob/main/cli/CHANGELOG.md
30. `HaaLeo/publish-vscode-extension` v2.1.0 `package.json` (`ovsx ^0.10.1`). https://github.com/HaaLeo/publish-vscode-extension
31. Eclipse Foundation blog, "Strengthening supply chain security in Open VSX", 2026-01-28. https://blogs.eclipse.org/post/christopher-guindon/strengthening-supply-chain-security-open-vsx
