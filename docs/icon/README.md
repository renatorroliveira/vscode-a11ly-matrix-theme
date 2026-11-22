# Icon source

`images/icon.png` is design `m2` ("Phosphor CRT") from `icons.js`, rendered at 256 x 256. Every design draws on a
canvas in a 256-unit space with a seeded random generator, so a render is reproducible. `icons.js` also keeps the five
designs that weren't picked (`m1`, `m3`, `c1`, `c2`, `c3`).

To re-render, from the repository root:

```sh
node docs/icon/render.mjs <outdir> 256 m2   # writes <outdir>/m2-256.png; copy it over images/icon.png
```

- `render.mjs` loads `render.html` in headless Edge and decodes the canvas data URL that the page writes into its DOM.
  Set `BROWSER` to another Chromium executable on a machine without Edge at the default Windows path.
- The page loads VT323 and JetBrains Mono from Google Fonts, so rendering needs network access. The script fails if
  either font is missing instead of writing a fallback-font icon.
- On 2026-11-21 the re-render was byte-identical to the shipped PNG. A different browser build may antialias
  differently.
- Don't use ImageMagick's `convert` on Windows: on `PATH` it resolves to the System32 disk converter.
