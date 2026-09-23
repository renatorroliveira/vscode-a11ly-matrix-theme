import { describe, expect, it } from 'vitest';
import { evaluateTheme, resolveBackground } from '../scripts/audit/evaluate.ts';
import { TARGET_LEVEL } from '../scripts/color/contrast.ts';
import type { ColorTheme } from '../src/types.ts';

function themeWith(colors: Record<string, `#${string}`>): ColorTheme {
    return {
        $schema: 'vscode://schemas/color-theme',
        name: 'fixture',
        type: 'hcDark',
        semanticHighlighting: true,
        colors,
        tokenColors: [],
    };
}

describe('evaluateTheme', () => {
    it('fails a pair that reaches AA but not the AAA target', () => {
        expect(TARGET_LEVEL).toBe('AAA');
        const theme = themeWith({
            'statusBar.debuggingForeground': '#ffffff',
            'statusBar.debuggingBackground': '#ba592c',
        });
        const result = evaluateTheme(theme);
        const debugging = result.pairs.find((item) => item.pair.description === 'Status bar while debugging');
        expect(debugging?.level).toBe('AA');
        expect(debugging?.status).toBe('fail');
        expect(result.failures).toBeGreaterThan(0);
    });

    it('fails a text pair above the 14:1 ceiling even though it is AAA', () => {
        const theme = themeWith({ 'editor.foreground': '#ffffff', 'editor.background': '#000000' });
        const result = evaluateTheme(theme);
        const body = result.pairs.find((item) => item.pair.description === 'Editor body text');
        expect(body?.level).toBe('AAA');
        expect(body?.status).toBe('fail');
        expect(body?.maximum).toBe(14);
    });

    it('fails a passive mark that reaches the text tier', () => {
        const theme = themeWith({ 'editorIndentGuide.background1': '#ffffff', 'editor.background': '#000000' });
        const guide = evaluateTheme(theme).pairs.find((item) => item.pair.description === 'Indent guides');
        expect(guide?.pair.kind).toBe('mark');
        expect(guide?.status).toBe('fail');
    });

    it('reports pairs with absent keys as missing', () => {
        const result = evaluateTheme(themeWith({}));
        expect(result.pairs.every((item) => item.status === 'missing')).toBe(true);
    });

    it('fails token foregrounds below the target on the editor background', () => {
        const theme: ColorTheme = {
            ...themeWith({ 'editor.background': '#000000' }),
            tokenColors: [
                { scope: 'comment', settings: { foreground: '#7ca668' } },
                { scope: 'keyword', settings: { foreground: '#000080' } },
                { scope: 'string', settings: { foreground: '#ffffff' } },
                { scope: 'emphasis', settings: { fontStyle: 'italic' } },
            ],
        };
        const tokens = evaluateTheme(theme).tokens;
        expect(tokens.map((item) => item.status)).toEqual(['pass', 'fail', 'fail']);
    });

    it('fails an overlay that pushes the dimmest token below the floor', () => {
        const theme: ColorTheme = {
            ...themeWith({
                'editor.background': '#000000',
                'editor.foreground': '#d2d2d2',
                'chat.findMatchBackground': '#ea5c00aa',
            }),
            tokenColors: [{ scope: 'string', settings: { foreground: '#ff7474' } }],
        };
        const overlay = evaluateTheme(theme).overlays.find(
            (item) => item.overlay.description === 'Chat current find match',
        );
        expect(overlay?.worstForegroundHex).toBe('#ff7474');
        expect(overlay?.status).toBe('fail');
    });

    it('measures a word highlight composited over its line highlight', () => {
        const theme: ColorTheme = {
            ...themeWith({
                'editor.background': '#000000',
                'editor.foreground': '#d2d2d2',
                'mergeEditor.change.background': '#9bb9551d',
                'mergeEditor.change.word.background': '#9ccc2c1b',
            }),
            tokenColors: [{ scope: 'string', settings: { foreground: '#ff7474' } }],
        };
        const overlays = evaluateTheme(theme).overlays;
        const line = overlays.find((item) => item.overlay.description === 'Merge editor changed lines');
        const stacked = overlays.find(
            (item) => item.overlay.layers.length === 2 && item.overlay.layers[0] === 'mergeEditor.change.background',
        );
        expect(line?.status).toBe('pass');
        expect(stacked?.status).toBe('fail');
    });

    it('reports an overlay with an absent layer as missing', () => {
        const overlay = evaluateTheme(themeWith({ 'editor.background': '#000000' })).overlays[0];
        expect(overlay?.status).toBe('missing');
    });
});

describe('resolveBackground', () => {
    it('composites a translucent background onto its backdrop', () => {
        const theme = themeWith({ 'list.hoverBackground': '#ffffff1a', 'sideBar.background': '#000000' });
        const surface = resolveBackground(theme, {
            foreground: 'foreground',
            background: 'list.hoverBackground',
            backdrop: 'sideBar.background',
            kind: 'text',
            description: 'fixture',
        });
        expect(surface?.r).toBeCloseTo(26, 0);
    });

    it('returns undefined when the backdrop is missing', () => {
        const theme = themeWith({ 'list.hoverBackground': '#ffffff1a' });
        const surface = resolveBackground(theme, {
            foreground: 'foreground',
            background: 'list.hoverBackground',
            backdrop: 'sideBar.background',
            kind: 'text',
            description: 'fixture',
        });
        expect(surface).toBeUndefined();
    });
});
