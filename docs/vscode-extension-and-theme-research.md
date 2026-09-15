# VS Code Extension and Color Theme Development: Technical Reference

Research date: 2026-09-15. Current stable VS Code: 1.137 (released 2026-09-09). Scope: what a theme-only extension such as Ally Dark (`oliveren.ally-dark`) needs to know about the extension manifest, the color theme file format, the development workflow, packaging and publishing, 2026 TypeScript tooling, accessibility, and common pitfalls. Every claim below is traced to a source in the References section; source code claims cite the `microsoft/vscode` `main` branch as read on the research date.

## Executive summary

A color theme extension is purely declarative. Its `package.json` needs `name`, `version`, `publisher`, `engines.vscode`, `categories: ["Themes"]`, and a `contributes.themes` array whose entries carry `id`, `label`, `uiTheme` and `path`. It does not need `main`, `browser`, `activationEvents`, `@types/vscode`, or any runtime dependency. Because it has no `main`, VS Code treats it as safe in Restricted Mode and in virtual workspaces without further declarations, and it always runs as a UI extension in remote scenarios [1][2][3][4].

The theme file is JSONC. VS Code parses it with its own parser configured to accept comments and trailing commas, and any parse error rejects the entire theme. The loader reads `include`, `colors`, `tokenColors` (array or `.tmTheme` path), `semanticHighlighting` and `semanticTokenColors`. It does not read `type`; the base theme comes from `uiTheme` in the manifest. The authoritative list of workbench color ids is the Theme Color reference, which as of 1.137 already includes `chat.*`, `inlineChat.*` and an "Agent Session colors" group (`agentSessionReadIndicator.foreground`, `agentStatusIndicator.background`, and others) [5][6][7].

Packaging uses `@vscode/vsce` 4.0.0 (Node 22 or later). vsce officially supports only npm and yarn v1, so a pnpm repo must pass `--no-dependencies` or set `"vsce": { "dependencies": false }` in `package.json`. Azure DevOps global Personal Access Tokens are retired on 2026-12-01, so new publishing pipelines should use Microsoft Entra ID (`--azure-credential`) or GitHub Actions OIDC (`vsce publish --oidc`). Open VSX publishing uses `ovsx` 1.2.0 with a namespace equal to the `publisher` field [8][9][10][11].

For the build script, Node 24 runs `.ts` files natively; type stripping is Stability 2 (Stable) since Node 24.12 / 25.2, and needs `erasableSyntaxOnly` plus `verbatimModuleSyntax` in `tsconfig.json`. One 2026-specific caution: TypeScript 7.0 (the Go-native compiler) is the npm `latest`, but `typescript-eslint` 8.70 declares a peer range of `typescript >=4.8.4 <6.1.0`, so typed linting requires pinning TypeScript 6.0.x until typescript-eslint supports the 7.1 API [12][13][14].

## 1. Extension anatomy for a theme-only extension

### Required manifest fields

| Field                | Requirement          | Notes                                                                                                                                                                                                                                                                                                 |
| -------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`               | Required             | Lowercase, no spaces; unique per publisher on the Marketplace [1].                                                                                                                                                                                                                                    |
| `version`            | Required             | SemVer `major.minor.patch`; pre-release tags such as `1.0.0-beta` are not supported by the Marketplace [8].                                                                                                                                                                                           |
| `publisher`          | Required             | Publisher id created at `marketplace.visualstudio.com/manage`; also the Open VSX namespace [8][11].                                                                                                                                                                                                   |
| `engines.vscode`     | Required             | Compatible VS Code version range such as `^1.137.0`. The manifest reference states it "Cannot be `*`" [1].                                                                                                                                                                                            |
| `categories`         | Recommended          | Allowed values include `Themes`, `Programming Languages`, `Snippets`, `Linters`, `Debuggers`, `Formatters`, `Keymaps`, `SCM Providers`, `Other`, `Extension Packs`, `Language Packs`, `Data Science`, `Machine Learning`, `Visualization`, `Notebooks`, `Education`, `Testing` [1]. Use `["Themes"]`. |
| `contributes.themes` | Required for a theme | See below.                                                                                                                                                                                                                                                                                            |

### `contributes.themes` entries

The contribution point schema in `themeExtensionPoints.ts` defines four properties. `path` and `uiTheme` are required [7].

| Property  | Meaning                                                                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`      | "Id of the color theme as used in the user settings." This is the value stored in `workbench.colorTheme`. If omitted, VS Code falls back to `label`. Renaming `id` after publishing silently breaks users' saved settings. |
| `label`   | "Label of the color theme as shown in the UI."                                                                                                                                                                             |
| `uiTheme` | Base theme for the workbench: `vs` (light), `vs-dark` (dark), `hc-black` (dark high contrast), `hc-light` (light high contrast).                                                                                           |
| `path`    | Path to the theme file, relative to the extension root.                                                                                                                                                                    |

```json
{
    "name": "ally-dark",
    "displayName": "Ally Dark",
    "description": "Accessible dark color theme with WCAG AA verified contrast.",
    "version": "0.1.0",
    "publisher": "oliveren",
    "license": "SEE LICENSE IN LICENSE",
    "engines": { "vscode": "^1.137.0" },
    "categories": ["Themes"],
    "keywords": ["theme", "dark", "accessible", "wcag", "high contrast"],
    "icon": "images/icon.png",
    "galleryBanner": { "color": "#191a1b", "theme": "dark" },
    "extensionKind": ["ui", "workspace"],
    "capabilities": {
        "untrustedWorkspaces": { "supported": true },
        "virtualWorkspaces": true
    },
    "contributes": {
        "themes": [
            {
                "id": "Ally Dark",
                "label": "Ally Dark",
                "uiTheme": "vs-dark",
                "path": "./themes/ally-dark-color-theme.json"
            }
        ]
    }
}
```

### Optional fields that matter for Marketplace presentation

- `displayName` and `description`: shown on the Marketplace listing. The color theme guide advises including the word "theme" in the description for discoverability [5].
- `icon`: relative path to a PNG of at least 128x128 pixels (256x256 for high-DPI). SVG icons are rejected [1][8].
- `galleryBanner`: `{ "color": "#rrggbb", "theme": "dark" | "light" }` controls the banner behind the listing header [1].
- `keywords`: capped at 30 entries [1][8].
- `repository`, `bugs`, `homepage`: when `repository` points to a public GitHub repo, vsce rewrites relative README links against the `main` branch (`--githubBranch` overrides) [8].
- `preview`, `pricing` (`Free` default), `sponsor.url`, `qna`, `badges` (approved providers only), `markdown` (`github` default): all optional [1].

### Trust, virtual workspaces and remote execution

- `capabilities.untrustedWorkspaces`: the Workspace Trust guide states that "If an extension does not have a `main` entry point (for example themes and language grammars), the extension does not require Workspace Trust." Declaring `{ "supported": true }` is harmless and self-documenting [2].
- `capabilities.virtualWorkspaces`: `true` is the default for all extensions, and "When an extension has no executable code but is purely declarative like themes, keybindings, snippets, or grammar extensions, it can run in a virtual workspace and no modification is necessary" [3].
- `extensionKind`: allowed values are `"ui"` and `"workspace"`. The remote development guide lists themes among UI extensions, which "are always run on the user's local machine" [4]. Declaring `["ui", "workspace"]` is the conventional way to let a theme install on either side without a warning.

### What is not needed

- No `main` or `browser` entry point, and therefore no `activationEvents` [2][3].
- No `@types/vscode` dev dependency and no runtime `dependencies`. vsce warns if `vscode` appears in `dependencies` [15].
- No bundler. The only shipped artifacts are the manifest, the theme JSON, the README, CHANGELOG, LICENSE and icon.

## 2. Color theme file format

### Top-level properties

| Property               | Read by VS Code | Behavior                                                                                                                                                                                                                                                                             |
| ---------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `$schema`              | Editor only     | `vscode://schemas/color-theme` enables validation, hover documentation and color pickers in the editor. The loader ignores it [5][6].                                                                                                                                                |
| `name`                 | No              | Descriptive only. The theme picker uses `label` from the manifest.                                                                                                                                                                                                                   |
| `type`                 | No              | The `Generate Color Theme From Current Settings` command emits it as `theme.type`, whose values are the `ColorScheme` enum strings `dark`, `light`, `hcDark`, `hcLight`. The loader in `colorThemeData.ts` never reads `contentValue.type`; the base theme is `uiTheme` [6][16][17]. |
| `include`              | Yes             | Relative path to another theme file. The included file is loaded first, recursively, and the including file's values override it. Built-in `dark_modern.json` includes `./dark_plus.json` [6][18].                                                                                   |
| `colors`               | Yes             | Object of workbench color id to hex string. Non-object values reject the theme. A value equal to the default sentinel removes an inherited color so VS Code's default applies [6].                                                                                                   |
| `tokenColors`          | Yes             | Either an array of TextMate rules or a string path (relative to the theme file) to a `.tmTheme` plist. Anything else rejects the theme [6][19].                                                                                                                                      |
| `semanticHighlighting` | Yes             | Boolean. ORed across `include` chains, so an included theme that enables it cannot be disabled by the includer [6].                                                                                                                                                                  |
| `semanticTokenColors`  | Yes             | Object of semantic selectors to color string or style object [6][20].                                                                                                                                                                                                                |

### `tokenColors` rule shape

```jsonc
{
    "name": "Comments", // optional, documentation only
    "scope": ["comment", "punctuation.definition.comment"],
    "settings": {
        "foreground": "#8b949e",
        "fontStyle": "italic", // "", italic, bold, underline, strikethrough, or combinations
    },
}
```

The schema documents `foreground`, `fontStyle`, `fontFamily`, `fontSize` (multiplier) and `lineHeight` (multiplier). `background` carries the deprecation message "Token background colors are currently not supported." The empty string for `fontStyle` unsets inherited styles [19]. Scope selectors follow TextMate rules: `scope` may be a string with comma-separated or space-separated (descendant) selectors, or an array. For each style property the most specific matching rule wins [21].

### Semantic tokens

`semanticTokenColors` keys use the selector grammar `(*|tokenType)(.tokenModifier)*(:tokenLanguage)?`. Values are a hex string or an object with `foreground`, `bold`, `italic`, `underline` [20]:

```json
"semanticTokenColors": {
  "variable.readonly:java": "#ff0011",
  "*.declaration": { "bold": true },
  "class:java": { "foreground": "#0f0", "italic": true }
}
```

Standard token types: `namespace`, `class`, `enum`, `interface`, `struct`, `typeParameter`, `type`, `parameter`, `variable`, `property`, `enumMember`, `decorator`, `event`, `function`, `method`, `macro`, `label`, `comment`, `string`, `keyword`, `number`, `regexp`, `operator`. Standard modifiers: `declaration`, `definition`, `readonly`, `static`, `deprecated`, `abstract`, `async`, `modification`, `documentation`, `defaultLibrary` [20].

Resolution order in `colorThemeData.ts`: theme `semanticTokenRules`, then user `customSemanticTokenRules`. If no semantic rule matches, the token's default definition supplies TextMate `scopesToProbe` (for example `variable.readonly` probes `variable.other.constant`) and the theme's `tokenColors` rules are consulted [6][20]. The user setting `editor.semanticHighlighting.enabled` defaults to `configuredByTheme`; users can force a theme on with `"editor.semanticTokenColorCustomizations": { "[Ally Dark]": { "enabled": true } }` [22].

### JSONC support and limits

`_loadColorTheme` calls `Json.parse(content, errors)` from `vs/base/common/json.ts`. That parser's `ParseOptions.DEFAULT` is `{ allowTrailingComma: true }` and comments are permitted unless `disallowComments` is set, so both `//` and `/* */` comments and trailing commas are legal in theme files. Any reported parse error rejects the whole theme with "Problems parsing JSON theme file" [6][23]. The generated theme emits inherited defaults as commented lines of the form `//"id": "#hex",` on purpose [16].

There is no documented cap on the number of color ids or token rules. Unknown color ids are accepted silently, so typos are not reported at load time; the `$schema` in the editor is the only guard.

### Where the color ids live and how to discover new ones

- The Theme Color reference at `code.visualstudio.com/api/references/theme-color` is regenerated with each release (the page footer showed 9/9/2026 on the research date, matching 1.137). Its groups include Contrast colors, Base colors, Lists and trees, Editor colors, Diff editor, Chat colors, Inline Chat colors, Panel Chat colors, Integrated Terminal, Debug, Testing, Source Control Graph, Settings Editor, Gauge, Markdown, Agent Session colors and Extension colors [24].
- Agent-related ids present in 1.137: `agentSessionReadIndicator.foreground`, `agentSessionSelectedBadge.border`, `agentSessionSelectedUnfocusedBadge.border`, `agentStatusIndicator.background`, `aiCustomizationManagement.sashBorder`, `chatManagement.sashBorder`. Chat ids include `chat.requestBorder`, `chat.requestBackground`, `chat.requestBubbleBackground`, `chat.requestBubbleHoverBackground`, `chat.requestCodeBorder`, `chat.slashCommandBackground`, `chat.slashCommandForeground`, `chat.avatarBackground`, `chat.avatarForeground`, `chat.editedFileForeground`, `chat.linesAddedForeground`, `chat.linesRemovedForeground`, `chat.checkpointSeparator`, `chat.thinkingShimmer`, plus `inlineChat.*`, `inlineChatInput.*`, `inlineChatDiff.*` [24].
- Discovery mechanisms: (a) the monthly release notes at `code.visualstudio.com/updates/v1_NNN` list new theme colors in their "Theming" or feature sections; (b) IntelliSense inside `workbench.colorCustomizations` and inside a `*-color-theme.json` file, backed by `vscode://schemas/workbench-colors`, exposes every registered id including ones contributed by installed extensions; (c) the `Developer: Generate Color Theme From Current Settings` command dumps every registered id, with the ones the theme does not set commented out [5][16][24].
- Extensions can register their own ids via `contributes.colors` with `id`, `description` and `defaults.{light,dark,highContrast,highContrastLight}`. These appear in the same IntelliSense and can be themed by any theme [25].

## 3. Theme development workflow

1. **Prototype in settings.** Switch to the base theme you intend to modify and edit `workbench.colorCustomizations` and `editor.tokenColorCustomizations`. The guide states changes "are applied live to your VS Code instance and no refreshing or reloading is necessary" [5].
2. **Export.** Run `Developer: Generate Color Theme From Current Settings` (`workbench.action.generateColorTheme`). It opens an untitled `jsonc` document containing `$schema`, `type`, every `colors` id (unset ones commented) and the active `tokenColors` filtered to rules that have a `scope` [16].
3. **Inspect tokens.** `Developer: Inspect Editor Tokens and Scopes` (`editor.action.inspectTMScopes`) shows the TextMate scope stack, the semantic token type and modifiers, and which theme rule produced the foreground [21].
4. **Run in the Extension Development Host.** Press F5 with a `.vscode/launch.json` such as the one in the official theme sample [26]:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Extension",
            "type": "extensionHost",
            "request": "launch",
            "runtimeExecutable": "${execPath}",
            "args": ["--extensionDevelopmentPath=${workspaceRoot}"],
            "stopOnEntry": false
        }
    ]
}
```

5. **Edit with live reload.** `workbenchThemeService.ts` installs a file watcher on the active theme's location when `theme.watch` is set or `environmentService.isExtensionDevelopment` is true, and calls `theme.reload()` on `FileChangeType.UPDATED`. In practice, saving the theme JSON while the Extension Development Host has it selected re-applies it without a reload [5][27]. For a generated theme this means the build script must write the file in place; regenerating it from TypeScript on a watcher gives the same live loop.
6. **Enable semantic highlighting for testing.** Either set `"semanticHighlighting": true` in the theme, or during prototyping use `"editor.tokenColorCustomizations": { "[Theme Name]": { "semanticHighlighting": true } }` [5][20].
7. **Name the file with the `-color-theme.json` suffix.** The guide recommends this so the editor associates the schema automatically and offers hovers and color decorators [5].

## 4. Packaging and publishing

### vsce basics

- Install: `npm install -g @vscode/vsce` or run through `pnpm dlx @vscode/vsce`. Current release: 4.0.0 (published 2026-09-14), `engines.node >= 22` [8][15].
- `vsce package` creates `<name>-<version>.vsix` in the extension root. `vsce ls` lists the files that would be packaged. `vsce publish` uploads; `vsce publish minor` or `vsce publish 1.1.0` bumps `package.json` first and, in a git repo, creates a version commit and tag through `npm version` [8].
- `vsce package --pre-release` / `vsce publish --pre-release` mark a build as pre-release. Requirements: `engines.vscode` of at least `>=1.63.0`, and distinct versions between pre-release and release. Microsoft recommends `major.EVEN.patch` for releases and `major.ODD.patch` for pre-releases (for example `0.2.x` release, `0.3.x` pre-release) because VS Code auto-updates users to the highest available version [8].
- `vscode:prepublish` in `scripts` runs on every `vsce package` and `vsce publish` before files are collected. vsce invokes it with `npm run` unless it detects yarn [8][15]. For this repo the hook should be the theme build (for example `node src/build.ts`) so the VSIX always contains a freshly generated theme.
- `.vscodeignore` is a list of glob patterns (one per line, `!` negates) excluded from the package. `devDependencies` are ignored automatically. Everything not needed at runtime should be listed: `src/**`, `scripts/**`, `test/**`, `docs/**`, `.vscode/**`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `pnpm-lock.yaml`, `**/*.ts`, `coverage/**` [8].
- Useful flags: `--out <path>`, `--target <platform>` (not relevant to themes), `--allow-missing-repository`, `--skip-license`, `--readme-path`, `--changelog-path`, `--baseContentUrl`, `--baseImagesUrl`, `--githubBranch`. Flags can also be persisted under a `"vsce"` object in `package.json` [15].

### pnpm caveat

vsce documents "Supported package managers: `npm >=6`, `yarn >=1 <2`". Dependency collection runs `npm list --production --parseable --depth=99999`, which fails under pnpm's symlinked virtual store with `npm ERR! missing:` errors. The maintainer-endorsed workaround is `--no-dependencies`, which makes `getDependencies` return only the extension root and skips `npm list` entirely [9][15][28]. For a theme extension with no runtime dependencies this loses nothing. Persist it with:

```json
"vsce": { "dependencies": false }
```

Scripts then read `pnpm exec vsce package` and `pnpm exec vsce publish`. Because `vscode:prepublish` is executed via `npm run`, keep that script free of pnpm-only syntax (plain `node src/build.ts` is safe).

### VSIX structure

A VSIX is a ZIP following the Open Packaging Conventions. vsce writes `extension.vsixmanifest` (XML metadata derived from `package.json`), `[Content_Types].xml`, and an `extension/` folder that contains `package.json`, `extension/readme.md`, `extension/changelog.md`, the license, the icon, and every non-ignored file such as `themes/ally-dark-color-theme.json` [15][29]. Users install with `code --install-extension ally-dark-0.1.0.vsix` or "Install from VSIX..." in the Extensions view [8].

### Marketplace authentication

1. Create a publisher at `marketplace.visualstudio.com/manage` (the id is permanent).
2. Personal Access Token flow (legacy): Azure DevOps > User settings > Personal access tokens > New Token, Organization = "All accessible organizations", Scopes = Marketplace > Manage. Then `vsce login <publisher>` or `vsce publish -p <token>` [8].
3. Retirement: the publishing guide states "On December 1, 2026, global Personal Access Tokens (PATs) in Azure DevOps are retired." Recommended replacements are Microsoft Entra ID with workload identity federation (`vsce publish --azure-credential`) and, for GitHub Actions, trusted publishing with `vsce publish --oidc`, which exchanges a GitHub OIDC token for the `marketplace.visualstudio.com` audience [8][10][15]. A publish pipeline created today should not depend on a PAT.
4. Extension names are reserved permanently once removed, and "Remove" (unlike "Unpublish") is irreversible [8].

### Open VSX

- Tooling: `ovsx` 1.2.0, `engines.node >= 22.0.0` [11][30].
- Create an access token at open-vsx.org (avatar > Settings > Access Tokens). Pass it with `-p <token>` or the `OVSX_PAT` environment variable [11].
- The `publisher` field is the namespace. Create it once: `ovsx create-namespace oliveren`. Creating a namespace does not grant exclusive rights; claim ownership through the open-vsx.org UI for verified status [11].
- Publish an existing package: `ovsx publish ally-dark-0.1.0.vsix -p $OVSX_PAT`. Without a file argument, `ovsx publish` invokes vsce to package first, which reintroduces the pnpm problem, so always pass the prebuilt `.vsix` [11][30].
- Open VSX also supports short-lived tokens through OIDC "trusted publishers" registered by the namespace owner, and `ovsx unpublish` [30].

## 5. Recommended tooling in 2026 for a TypeScript build script

### Node.js native TypeScript execution

The Node.js `Modules: TypeScript` documentation history table [12]:

| Node version     | Change                                                     |
| ---------------- | ---------------------------------------------------------- |
| 22.6.0           | `--experimental-strip-types` added                         |
| 22.7.0           | `--experimental-transform-types` added (enums, namespaces) |
| 23.6.0 / 22.18.0 | Type stripping enabled by default                          |
| 24.3.0 / 22.18.0 | Experimental warning removed                               |
| 25.2.0 / 24.12.0 | Type stripping marked Stability 2, Stable                  |
| 26.0.0           | `--experimental-transform-types` removed                   |

Consequences for `node src/build.ts` on Node 24 LTS (this host runs 24.21.0):

- Only erasable syntax is allowed: no `enum`, no `namespace` with runtime code, no parameter properties, no `import x = require()` aliases, no legacy decorators. Use `as const` objects instead of enums [12].
- Type-only imports must use `import type` or inline `type` modifiers, or Node emits a runtime error trying to load a value that does not exist [12].
- Node does not read `tsconfig.json`, so `paths`, downleveling and similar are unavailable; relative imports must include the `.ts` extension. Node refuses to strip `.ts` files inside `node_modules` [12].
- No type checking occurs at run time. Keep `tsc --noEmit` in CI. The recommended `tsconfig.json` is `target: esnext`, `module: nodenext`, `rewriteRelativeImportExtensions: true`, `erasableSyntaxOnly: true`, `verbatimModuleSyntax: true`, `noEmit: true` [12]. The repo's existing `tsconfig.json` already matches this shape.

### TypeScript compiler

- npm `latest` is TypeScript 7.0.2, the Go-native compiler ("tsgo" during preview). It reports 8x to 12x faster builds but ships without a stable programmatic API until 7.1 [13][31].
- `typescript-eslint` 8.70.0 declares `peerDependencies.typescript: ">=4.8.4 <6.1.0"` and `eslint: "^8.57.0 || ^9.0.0 || ^10.0.0"` [14]. Installing TypeScript 7 alongside it produces a peer conflict and unsupported typed linting. Pin `typescript@~6.0.3` (the last JavaScript-based line) for now and revisit when typescript-eslint publishes TypeScript 7 support.

### ESLint

- ESLint 10.10.0 is current. ESLint 10.0.0 (2026-02-06) removed the eslintrc system entirely; only `eslint.config.{js,mjs,cjs,ts}` is read, and `ESLINT_USE_FLAT_CONFIG` is no longer honored. Node support is `^20.19.0 || ^22.13.0 || >=24` [32][33].
- typescript-eslint's getting-started example now uses `defineConfig` from `eslint/config` with `extends: [js.configs.recommended, tseslint.configs.recommended]`; `tseslint.config()` still works but is no longer the documented entry point. Typed presets (`strictTypeChecked`, `stylisticTypeChecked`) require `parserOptions.projectService: true` [34].

### Test runner and formatter

- Vitest 5.0.1 (5.0.0 released 2026-09-03) requires Node `^22.12.0 || ^24.0.0 || >=26.0.0` and Vite 6.4+/7/8. It runs `.ts` tests without a separate compile step and provides v8 coverage through `@vitest/coverage-v8` at the same version [35].
- Prettier 3.9.6 is current; 4.0 is still alpha. `eslint-config-prettier` 10.1.8 disables conflicting stylistic rules [36].

## 6. Accessibility considerations documented by VS Code

- **High contrast base themes.** `uiTheme: "hc-black"` and `"hc-light"` select the high contrast dark and light bases. The theme generator records the matching `type` as `hcDark` or `hcLight`. `window.autoDetectHighContrast` switches to the theme named in `workbench.preferredHighContrastColorTheme` or `workbench.preferredHighContrastLightColorTheme` when the OS enters high contrast mode [7][17][22].
- **Contrast borders.** `contrastBorder` ("An extra border around elements to separate them from others for greater contrast") and `contrastActiveBorder` are "typically only set for high contrast themes." Setting them in a regular dark theme draws borders around most controls, which is a deliberate design choice rather than a default [24].
- **Selection foreground.** `editor.selectionForeground` is documented as "Color of the selected text for high contrast" and is only honored by the high contrast bases; a `vs-dark` theme cannot force selected-text color [24].
- **Terminal minimum contrast.** `terminal.integrated.minimumContrastRatio` defaults to 4.5, accepts 1 to 21, and adjusts the luminance of terminal foreground colors until the ratio is met or pure white/black is reached. It does not apply to powerline glyphs, and colored text may lose saturation. Setting it to 1 disables the feature. A theme's `terminal.ansi*` palette should therefore meet 4.5:1 against `terminal.background` on its own, so users who disable the feature keep readable output [37][38].
- **Color vision deficiency guidance.** The accessibility guide recommends themes designed for deuteranopia, protanopia, tritanopia and monochromia, points users to `workbench.colorCustomizations` for `editorError.foreground`, `editorWarning.foreground`, `editorInfo.foreground` and their `background` variants, and advises complementary hues for status colors [38].
- **No WCAG mandate.** The VS Code docs do not require WCAG ratios of theme authors and do not verify them at packaging time. The only automated contrast enforcement in the product is the terminal setting above. A build-time WCAG AA check, as this repo implements, is therefore additive and not duplicated by VS Code.

## 7. Common pitfalls

- **Alpha channel.** Colors accept `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`; missing alpha means `ff`. The reference states "Some colors should not be opaque in order to not cover other annotations." Ids explicitly marked "The color must not be opaque so as not to hide underlying decorations" include `editor.inactiveSelectionBackground`, `editor.selectionHighlightBackground`, `editor.wordHighlightBackground`, `editor.wordHighlightStrongBackground`, `editor.wordHighlightTextBackground`, `editor.findMatchHighlightBackground`, `editor.findRangeHighlightBackground`, `editor.hoverHighlightBackground`, `editor.rangeHighlightBackground`, `editor.symbolHighlightBackground` and `editor.foldBackground` [24].
- **Selection compositing.** `editor.selectionBackground` is painted as a layer between `editor.background` and the text, and the highlight decorations above are painted on top of it with their own alpha. An opaque selection color hides find and word highlights; a translucent one changes the effective color the text is read against. Contrast checks for selected text must be computed against the composited result of `editor.background` + `editor.selectionBackground` (+ any highlight), not against the raw selection hex [24].
- **List selection states.** `list.activeSelectionBackground` and `list.activeSelectionForeground` apply when the list or tree has keyboard focus; `list.inactiveSelectionBackground` applies when it does not; `list.focusBackground` marks the focused (not necessarily selected) row. Themes that set only the active variant leave the inactive state at the base theme default, which often has lower contrast [24].
- **Semantic versus TextMate precedence.** When `semanticHighlighting` is on and a language server provides tokens, a matching `semanticTokenColors` rule wins over any `tokenColors` rule. If no semantic rule matches, VS Code probes the default TextMate scopes for that token type against `tokenColors`. A theme that carefully styles `variable.other.constant` but sets `"variable": "#..."` in `semanticTokenColors` overrides that TextMate styling for constants too [6][20].
- **Token backgrounds.** `settings.background` in `tokenColors` is deprecated and ignored ("Token background colors are currently not supported") [19].
- **`type` is cosmetic.** Because the loader ignores `type`, declaring `"type": "dark"` while shipping `uiTheme: "hc-black"` produces a high contrast workbench. Keep `uiTheme` and `type` in agreement [6][7].
- **Whole-file failure.** One malformed value, an unbalanced brace, or a non-object `colors` property rejects the entire theme; VS Code falls back to the base theme with an error notification. Comments and trailing commas are fine [6][23].
- **`include` ordering.** Included files load first; the including file overrides. `semanticHighlighting` cannot be turned off by an includer once an included file enables it [6].
- **Unknown ids.** Misspelled color ids are accepted silently. Validate generated output against `vscode://schemas/workbench-colors` or against the reference page at build time [24].
- **Manifest id stability.** Changing `contributes.themes[].id` (or `label`, when `id` is absent) after release orphans every user's `workbench.colorTheme` setting [7].
- **pnpm and vsce.** Forgetting `--no-dependencies` (or the `vsce.dependencies` manifest option) causes `npm list` failures during `vsce package` [9][15].
- **Pre-release versions.** Semver pre-release tags are rejected; use the odd/even minor convention [8].

## Recommendations for this repo

1. **Manifest.** Add `package.json` with the fields shown in section 1, `"vsce": { "dependencies": false }`, and scripts `build` = `node src/build.ts`, `vscode:prepublish` = `node src/build.ts`, `package` = `pnpm exec vsce package`, `publish:marketplace` = `pnpm exec vsce publish`, `publish:openvsx` = `pnpm exec ovsx publish *.vsix`. Set `engines.vscode` to `^1.137.0` or the oldest version whose color ids the theme relies on (the agent session ids are new, so older engines would simply ignore them).
2. **Theme `id`.** Set `contributes.themes[0].id` explicitly to `"Ally Dark"` now, so later label changes do not break saved settings.
3. **Types.** `src/types.ts` currently allows `background` in `TokenColorSettings`; VS Code ignores it, so remove it or the build gives a false sense of coverage. Consider adding the schema's `fontFamily`, `fontSize` and `lineHeight` only if the theme intends to use them.
4. **Contrast checks.** Extend the WCAG AA check to composite `editor.selectionBackground`, `editor.inactiveSelectionBackground` and the word/find highlight layers over `editor.background` before comparing against `editor.foreground`, and to cover `list.inactiveSelectionBackground` and `terminal.ansi*` against `terminal.background` at 4.5:1.
5. **Build-time id validation.** Fetch or vendor the id list from the Theme Color reference (or `vscode://schemas/workbench-colors` via a small VS Code task) and fail the build on unknown ids; this catches typos that VS Code will never report.
6. **Tooling pins.** Pin `typescript` to `~6.0.3` while `typescript-eslint` caps at `<6.1.0`; keep ESLint 10.x, typescript-eslint 8.70+, Vitest 5.x, Prettier 3.9.x, `@vscode/vsce` 4.x, `ovsx` 1.2.x; require Node `>=24.12` in `engines.node` so type stripping is stable and warning-free. Optionally migrate `eslint.config.js` to `defineConfig` from `eslint/config`.
7. **`.vscodeignore`.** Exclude `src/`, `scripts/`, `test/`, `docs/`, `.vscode/`, config files, lockfile and coverage; verify with `pnpm exec vsce ls`.
8. **Publishing.** Do not create an Azure DevOps PAT. Set up GitHub Actions trusted publishing (`vsce publish --oidc`) or Entra ID federation, and an Open VSX namespace `oliveren` with an OIDC trusted publisher.
9. **Live-reload loop.** Add the `extensionHost` launch configuration from section 3 and a watch task that reruns `node src/build.ts` on changes under `src/`; the Extension Development Host re-applies the regenerated theme file automatically.

## References

1. Extension Manifest reference. https://code.visualstudio.com/api/references/extension-manifest
2. Workspace Trust extension guide. https://code.visualstudio.com/api/extension-guides/workspace-trust
3. Virtual Workspaces extension guide. https://code.visualstudio.com/api/extension-guides/virtual-workspaces
4. Supporting Remote Development and GitHub Codespaces. https://code.visualstudio.com/api/advanced-topics/remote-extensions
5. Color Theme extension guide. https://code.visualstudio.com/api/extension-guides/color-theme
6. `colorThemeData.ts` (theme loader: `_loadColorTheme`, `include`, JSON parsing, semantic rule resolution). https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/colorThemeData.ts
7. `themeExtensionPoints.ts` (`contributes.themes` schema). https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/themeExtensionPoints.ts
8. Publishing Extensions. https://code.visualstudio.com/api/working-with-extensions/publishing-extension
9. Stack Overflow, "vsce publish fails - VS Code Extension using pnpm/yarn" (maintainer-referenced workaround). https://stackoverflow.com/questions/59798905/vsce-publish-fails-vs-code-extension-using-pnpm-yarn
10. Retirement of global PATs discussion and links to trusted publishing. https://github.com/vscode-neovim/vscode-neovim/issues/2677
11. Open VSX wiki, Publishing Extensions. https://github.com/eclipse/openvsx/wiki/Publishing-Extensions
12. Node.js documentation, Modules: TypeScript. https://nodejs.org/api/typescript.html
13. InfoQ, "Microsoft Releases TypeScript 7.0 with a Native Go Compiler". https://www.infoq.com/news/2026/08/typescript-7-released/
14. npm registry metadata for `typescript-eslint@8.70.0` (`peerDependencies`), retrieved with `npm view` on 2026-09-15. https://www.npmjs.com/package/typescript-eslint
15. `@vscode/vsce` README and `src/package.ts` / `src/npm.ts`. https://github.com/microsoft/vscode-vsce
16. `themes.contribution.ts` (`workbench.action.generateColorTheme`). https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/themes/browser/themes.contribution.ts
17. `theme.ts` (`ColorScheme` enum). https://github.com/microsoft/vscode/blob/main/src/vs/platform/theme/common/theme.ts
18. Built-in `dark_modern.json`. https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_modern.json
19. `colorThemeSchema.ts` (token settings schema). https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/colorThemeSchema.ts
20. Semantic Highlight Guide. https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide
21. Syntax Highlight Guide (theming, scope inspector). https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide
22. Color Themes user documentation (semantic settings, OS auto-detection). https://code.visualstudio.com/docs/configure/themes
23. `json.ts` (`ParseOptions.DEFAULT`). https://github.com/microsoft/vscode/blob/main/src/vs/base/common/json.ts
24. Theme Color reference. https://code.visualstudio.com/api/references/theme-color
25. `colorExtensionPoint.ts` (`contributes.colors`). https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/colorExtensionPoint.ts
26. Theme sample `launch.json`. https://github.com/microsoft/vscode-extension-samples/blob/main/theme-sample/.vscode/launch.json
27. `workbenchThemeService.ts` (theme file watcher). https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/browser/workbenchThemeService.ts
28. Open Science Labs, "Packaging a VS Code Extension Using pnpm and VSCE". https://opensciencelabs.org/blog/packaging-a-vs-code-extension-using-pnpm-and-vsce/
29. Microsoft Learn, "What is a Visual Studio VSIX package file?" (OPC layout shared with VS Code VSIX). https://learn.microsoft.com/en-us/visualstudio/extensibility/anatomy-of-a-vsix-package
30. `ovsx` CLI README. https://github.com/eclipse-openvsx/openvsx/blob/main/cli/README.md
31. TypeScript blog, "Announcing TypeScript 7.0 Beta". https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/
32. ESLint blog, "ESLint v10.0.0-alpha.0 released" (eslintrc removal). https://eslint.org/blog/2025/11/eslint-v10.0.0-alpha.0-released/
33. InfoQ, "ESLint v10: Flat Config Completion and JSX Tracking". https://www.infoq.com/news/2026/04/eslint-10-release/
34. typescript-eslint Getting Started. https://typescript-eslint.io/getting-started/
35. npm registry metadata for `vitest@5.0.1` (`engines`, `peerDependencies`, publish time), retrieved 2026-09-15. https://www.npmjs.com/package/vitest
36. npm registry metadata for `prettier` and `eslint-config-prettier`, retrieved 2026-09-15. https://www.npmjs.com/package/prettier
37. Terminal Appearance (minimum contrast ratio). https://code.visualstudio.com/docs/terminal/appearance
38. Accessibility user documentation. https://code.visualstudio.com/docs/editor/accessibility
39. VS Code 1.136 and 1.137 release notes (agent sessions and chat theming context). https://code.visualstudio.com/updates/v1_136 and https://code.visualstudio.com/updates/v1_137
