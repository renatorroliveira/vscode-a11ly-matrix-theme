// Usage: node docs/icon/render.mjs <outdir> [size] [id]
// Renders the icon designs in icons.js through a headless Chromium browser and writes <id>-<size>.png files.
// The shipped images/icon.png is design m2 at 256: node docs/icon/render.mjs <outdir> 256 m2
// Set BROWSER to a Chrome or Edge executable to override the default Windows Edge path.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [outDir, size = '256', id = ''] = process.argv.slice(2);
if (!outDir) throw new Error('usage: node docs/icon/render.mjs <outdir> [size] [id]');
mkdirSync(outDir, { recursive: true });
const browser = process.env.BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = `${pathToFileURL(join(here, 'render.html')).href}?size=${size}${id ? `&id=${id}` : ''}`;
const profile = mkdtempSync(join(tmpdir(), 'a11y-icon-'));
let dom;
try {
    dom = execFileSync(
        browser,
        [
            '--headless=new',
            '--disable-gpu',
            '--no-first-run',
            '--no-default-browser-check',
            `--user-data-dir=${profile}`,
            '--virtual-time-budget=15000',
            '--dump-dom',
            url,
        ],
        { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 120000 },
    );
} finally {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
}
const pre = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
if (!pre) throw new Error('no output block in the dumped DOM');
const lines = pre[1]
    .trim()
    .split('\n')
    .map((line) => line.trim());
if (lines[0] !== 'fonts ok') throw new Error(`${lines[0]}: the Google Fonts stylesheet did not load`);
for (const line of lines.slice(1)) {
    const [name, dataUrl] = line.split(' ');
    const file = join(outDir, `${name}-${size}.png`);
    writeFileSync(file, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
    console.log('wrote', file);
}
