import { describe, expect, it } from 'vitest';
import { theme } from '../src/theme.ts';
import { evaluateTheme } from '../scripts/audit/evaluate.ts';
import { CONTRAST_PAIRS, DISTINGUISHABLE_GROUPS } from '../scripts/pairs.ts';
import { isHexColor } from '../scripts/color/hex.ts';
import manifest from '../package.json' with { type: 'json' };

describe('theme document', () => {
    it('declares the required top-level fields', () => {
        expect(theme.$schema).toBe('vscode://schemas/color-theme');
        expect(theme.name).toBe('A11y Matrix Dark');
        expect(theme.type).toBe('hcDark');
        expect(theme.semanticHighlighting).toBe(true);
    });

    it('matches the manifest base theme', () => {
        const contributed = manifest.contributes.themes[0];
        expect(contributed?.label).toBe(theme.name);
        expect(contributed?.uiTheme).toBe('hc-black');
        expect(contributed?.path).toBe('./themes/a11y-matrix-dark-color-theme.json');
    });

    it('only contains valid hex colors', () => {
        for (const [key, value] of Object.entries(theme.colors)) {
            expect(isHexColor(value), `${key} = ${value}`).toBe(true);
        }
        for (const rule of theme.tokenColors) {
            if (rule.settings.foreground !== undefined) {
                expect(isHexColor(rule.settings.foreground)).toBe(true);
            }
        }
    });
});

describe('contrast contract', () => {
    it('references only color ids that exist in the theme', () => {
        const keys = new Set(Object.keys(theme.colors));
        for (const pair of CONTRAST_PAIRS) {
            expect(keys.has(pair.foreground), pair.foreground).toBe(true);
            expect(keys.has(pair.background), pair.background).toBe(true);
            if (pair.backdrop !== undefined) {
                expect(keys.has(pair.backdrop), pair.backdrop).toBe(true);
            }
        }
        for (const members of Object.values(DISTINGUISHABLE_GROUPS)) {
            for (const member of members) {
                expect(keys.has(member), member).toBe(true);
            }
        }
    });

    it('gates every ANSI color except the terminal background', () => {
        const gated = new Set(CONTRAST_PAIRS.map((pair) => pair.foreground));
        const ansi = Object.keys(theme.colors).filter((key) => key.startsWith('terminal.ansi'));
        expect(ansi).toHaveLength(16);
        for (const key of ansi.filter((candidate) => candidate !== 'terminal.ansiBlack')) {
            expect(gated.has(key), key).toBe(true);
        }
        expect(gated.has('terminal.ansiBlack')).toBe(false);
    });

    it('gates every extension foreground the theme ships', () => {
        const gated = new Set(CONTRAST_PAIRS.map((pair) => pair.foreground));
        const shipped = Object.keys(theme.colors).filter(
            (key) => /^(gitlens|errorLens|markdownAlert)\./.test(key) && !/Background|background/.test(key),
        );
        for (const key of shipped) {
            expect(gated.has(key), key).toBe(true);
        }
    });

    it('passes every WCAG AA check', () => {
        const result = evaluateTheme(theme);
        const failing = [
            ...result.pairs.filter((item) => item.status !== 'pass').map((item) => item.pair.description),
            ...result.tokens.filter((item) => item.status === 'fail').map((item) => item.scope),
        ];
        expect(failing).toEqual([]);
        expect(result.failures).toBe(0);
    });
});
