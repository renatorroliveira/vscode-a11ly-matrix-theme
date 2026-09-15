import { describe, expect, it } from 'vitest';
import { classifyContrast, contrastRatio, contrastRatioHex, minimumRatio } from '../scripts/color/contrast.ts';
import { channelToLinear, linearToChannel, relativeLuminance } from '../scripts/color/luminance.ts';

describe('relativeLuminance', () => {
    it('matches the WCAG endpoints', () => {
        expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
        expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 6);
    });

    it('uses the low-range linear segment', () => {
        expect(channelToLinear(10)).toBeCloseTo(10 / 255 / 12.92, 9);
    });

    it('round-trips channel linearization', () => {
        for (const channel of [0, 3, 10, 128, 200, 255]) {
            expect(linearToChannel(channelToLinear(channel))).toBeCloseTo(channel, 6);
        }
    });
});

describe('contrastRatio', () => {
    it('reproduces WebAIM reference values', () => {
        expect(contrastRatioHex('#000000', '#ffffff')).toBeCloseTo(21, 6);
        expect(contrastRatioHex('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
        expect(contrastRatioHex('#999999', '#ffffff')).toBeCloseTo(2.85, 2);
        expect(contrastRatioHex('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
    });

    it('is symmetric', () => {
        const a = { r: 0x12, g: 0x13, b: 0x14 };
        const b = { r: 0xbb, g: 0xbe, b: 0xbf };
        expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
    });

    it('flattens translucent foregrounds before measuring', () => {
        const opaqueWhite = contrastRatioHex('#ffffff', '#121314');
        const faintWhite = contrastRatioHex('#ffffff18', '#121314');
        expect(faintWhite).toBeLessThan(opaqueWhite);
        expect(faintWhite).toBeGreaterThan(1);
    });
});

describe('classifyContrast', () => {
    it('never rounds up at the AA boundary', () => {
        expect(classifyContrast(4.4999, 'text')).toBe('fail');
        expect(classifyContrast(4.5, 'text')).toBe('AA');
        expect(classifyContrast(7, 'text')).toBe('AAA');
    });

    it('applies the non-text and large-text thresholds', () => {
        expect(classifyContrast(3, 'ui')).toBe('AAA');
        expect(classifyContrast(2.99, 'ui')).toBe('fail');
        expect(classifyContrast(3, 'large-text')).toBe('AA');
        expect(classifyContrast(4.5, 'large-text')).toBe('AAA');
        expect(classifyContrast(3, 'dimmed')).toBe('AA');
    });

    it('exposes the AA minimum per kind', () => {
        expect(minimumRatio('text')).toBe(4.5);
        expect(minimumRatio('ui')).toBe(3);
        expect(minimumRatio('dimmed')).toBe(3);
    });
});
