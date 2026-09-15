import { describe, expect, it } from 'vitest';
import { deltaE, rgbToLab, simulateCvd } from '../scripts/color/cvd.ts';
import { parseHex } from '../scripts/color/hex.ts';

describe('rgbToLab', () => {
    it('maps white and black to the L* extremes', () => {
        expect(rgbToLab({ r: 255, g: 255, b: 255 }).l).toBeCloseTo(100, 1);
        expect(rgbToLab({ r: 0, g: 0, b: 0 }).l).toBeCloseTo(0, 6);
    });

    it('places red at positive a*', () => {
        expect(rgbToLab({ r: 255, g: 0, b: 0 }).a).toBeGreaterThan(50);
    });
});

describe('deltaE', () => {
    it('is zero for identical colors and symmetric', () => {
        const a = parseHex('#86cf86');
        const b = parseHex('#ef8773');
        expect(deltaE(a, a)).toBe(0);
        expect(deltaE(a, b)).toBeCloseTo(deltaE(b, a), 9);
    });
});

describe('simulateCvd', () => {
    it('collapses red and green for deuteranopia', () => {
        const red = parseHex('#ef8773');
        const green = parseHex('#86cf86');
        const normal = deltaE(red, green);
        const deutan = deltaE(simulateCvd(red, 'deuteranopia'), simulateCvd(green, 'deuteranopia'));
        expect(deutan).toBeLessThan(normal / 4);
    });

    it('keeps greys nearly unchanged', () => {
        const grey = { r: 128, g: 128, b: 128 };
        for (const type of ['protanopia', 'deuteranopia', 'tritanopia'] as const) {
            expect(deltaE(grey, simulateCvd(grey, type))).toBeLessThan(3);
        }
    });

    it('clamps to the sRGB gamut', () => {
        const result = simulateCvd({ r: 255, g: 0, b: 255 }, 'tritanopia');
        expect(result.r).toBeLessThanOrEqual(255);
        expect(result.b).toBeGreaterThanOrEqual(0);
    });
});
