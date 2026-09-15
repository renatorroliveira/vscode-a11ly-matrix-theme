import { describe, expect, it } from 'vitest';
import { formatHex, parseHex } from '../scripts/color/hex.ts';
import { hslToRgb, rgbToHsl } from '../scripts/color/hsl.ts';

describe('rgbToHsl / hslToRgb', () => {
    it('converts primaries', () => {
        expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, l: 0.5 });
        expect(rgbToHsl({ r: 0, g: 255, b: 0 }).h).toBe(120);
        expect(rgbToHsl({ r: 0, g: 0, b: 255 }).h).toBe(240);
    });

    it('treats greys as zero saturation', () => {
        expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 128 / 255 });
    });

    it('round-trips theme colors', () => {
        for (const hex of ['#3994bc', '#f48771', '#86cf86', '#121314', '#e0b97f', '#ad80d7']) {
            expect(formatHex({ ...hslToRgb(rgbToHsl(parseHex(hex))), a: 1 })).toBe(hex);
        }
    });

    it('normalizes hue outside 0..360', () => {
        expect(hslToRgb({ h: 360, s: 1, l: 0.5 }).r).toBeCloseTo(255);
        expect(hslToRgb({ h: -120, s: 1, l: 0.5 }).b).toBeCloseTo(255);
    });
});
