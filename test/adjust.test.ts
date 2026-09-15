import { describe, expect, it } from 'vitest';
import { fadeOverlayToContrast, nudgeToContrast } from '../scripts/color/adjust.ts';
import { contrastRatioHex } from '../scripts/color/contrast.ts';
import { parseHex } from '../scripts/color/hex.ts';
import { rgbToHsl } from '../scripts/color/hsl.ts';

describe('nudgeToContrast', () => {
    it('leaves passing colors untouched', () => {
        const result = nudgeToContrast('#bbbebf', '#121314', 4.5);
        expect(result.changed).toBe(false);
        expect(result.satisfied).toBe(true);
        expect(result.adjusted).toBe('#bbbebf');
    });

    it('lightens a dark foreground on a dark background just past the target', () => {
        const result = nudgeToContrast('#555555', '#202122', 4.5);
        expect(result.changed).toBe(true);
        expect(result.ratioAfter).toBeGreaterThanOrEqual(4.5);
        expect(result.ratioAfter).toBeLessThan(4.7);
        expect(contrastRatioHex(result.adjusted, '#202122')).toBe(result.ratioAfter);
    });

    it('preserves hue while adjusting lightness', () => {
        const result = nudgeToContrast('#646695', '#121314', 4.5);
        const before = rgbToHsl(parseHex('#646695'));
        const after = rgbToHsl(parseHex(result.adjusted));
        expect(Math.abs(before.h - after.h)).toBeLessThan(2);
    });

    it('reverses direction when the natural direction cannot reach the target', () => {
        const result = nudgeToContrast('#0d1117', '#121314', 4.5);
        expect(result.satisfied).toBe(true);
        expect(result.ratioAfter).toBeGreaterThanOrEqual(4.5);
    });

    it('darkens the foreground when lightening cannot reach the target', () => {
        const result = nudgeToContrast('#ffffff', '#f48771', 4.5);
        expect(result.satisfied).toBe(true);
        expect(parseHex(result.adjusted).r).toBeLessThan(128);
    });

    it('reports unreachable targets without changing the color', () => {
        const result = nudgeToContrast('#ffffff', '#808080', 21);
        expect(result.satisfied).toBe(false);
        expect(result.changed).toBe(false);
        expect(result.adjusted).toBe('#ffffff');
    });

    it('flattens translucent foregrounds and returns opaque colors', () => {
        const result = nudgeToContrast('#ffffff40', '#121314', 4.5);
        expect(parseHex(result.adjusted).a).toBe(1);
        expect(result.ratioAfter).toBeGreaterThanOrEqual(4.5);
    });
});

describe('fadeOverlayToContrast', () => {
    it('keeps passing overlays', () => {
        const result = fadeOverlayToContrast('#ffffff0a', '#121314', '#bbbebf', 4.5);
        expect(result.changed).toBe(false);
    });

    it('lowers alpha until text on the overlay passes', () => {
        const result = fadeOverlayToContrast('#276782dd', '#121314', '#bbbebf', 4.5);
        expect(result.changed).toBe(true);
        expect(result.satisfied).toBe(true);
        expect(parseHex(result.adjusted).a).toBeLessThan(parseHex('#276782dd').a);
        expect(result.adjusted.startsWith('#276782')).toBe(true);
    });
});
