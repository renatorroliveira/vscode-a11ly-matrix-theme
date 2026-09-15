import { describe, expect, it } from 'vitest';
import { extractCommentedEntries, parseJsonc } from '../scripts/jsonc.ts';

const SAMPLE = `{
    "$schema": "vscode://schemas/color-theme",
    "colors": {
        "a.b": "#112233",
        //"c.d": "#445566",
        // "e.f": "#77889980",
        "g.h": "#000000",
    },
}`;

describe('parseJsonc', () => {
    it('drops full-line comments and trailing commas without touching URLs', () => {
        const parsed = parseJsonc(SAMPLE) as { $schema: string; colors: Record<string, string> };
        expect(parsed.$schema).toBe('vscode://schemas/color-theme');
        expect(parsed.colors).toEqual({ 'a.b': '#112233', 'g.h': '#000000' });
    });
});

describe('extractCommentedEntries', () => {
    it('collects commented key/value lines in order', () => {
        expect(extractCommentedEntries(SAMPLE)).toEqual([
            { key: 'c.d', value: '#445566' },
            { key: 'e.f', value: '#77889980' },
        ]);
    });
});
