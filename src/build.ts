/**
 * Emits the theme document to `themes/ally-dark-color-theme.json`.
 *
 * Usage: `node src/build.ts`
 * @module
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { THEME_FILE_NAME, theme } from './theme.ts';

const OUTPUT_DIR = resolve(import.meta.dirname, '..', 'themes');

/**
 * Serializes the theme and writes it to the output directory.
 * @returns Absolute path of the written theme file.
 */
export function buildTheme(): string {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    const outputPath = resolve(OUTPUT_DIR, THEME_FILE_NAME);
    writeFileSync(outputPath, `${JSON.stringify(theme, null, 4)}\n`);
    return outputPath;
}

console.log(`theme written: ${buildTheme()}`);
