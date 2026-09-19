import { describe, expect, it } from 'vitest';
import { contrastRatioHex, maximumRatio, minimumRatio, withinBand } from '../scripts/color/contrast.ts';
import { deltaE, simulateCvd, type CvdType } from '../scripts/color/cvd.ts';
import { parseHex } from '../scripts/color/hex.ts';
import type { Rgb } from '../scripts/color/types.ts';
import { accent, mark, SEMANTIC_ADDED_GREEN, SURFACE, text } from '../src/palette.ts';

const VISIONS: readonly ('normal' | CvdType)[] = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];
const MINIMUM_SEPARATION = 10;

function worstSeparation(first: string, second: string): number {
    const perceive = (hex: string, vision: 'normal' | CvdType): Rgb => {
        const { r, g, b } = parseHex(hex);
        return vision === 'normal' ? { r, g, b } : simulateCvd({ r, g, b }, vision);
    };
    return Math.min(...VISIONS.map((vision) => deltaE(perceive(first, vision), perceive(second, vision))));
}

describe('neutral text and mark tiers', () => {
    it('keeps every text role inside the 7:1 to 14:1 text band, never pure white', () => {
        for (const hex of Object.values(text)) {
            expect(withinBand(contrastRatioHex(hex, SURFACE), 'text'), hex).toBe(true);
            expect(hex).not.toBe('#ffffff');
        }
    });

    it('keeps the primary and secondary text within a 2:1 luminance spread of the floor', () => {
        expect(contrastRatioHex(text.primary, SURFACE) / minimumRatio('text')).toBeLessThanOrEqual(2);
        expect(contrastRatioHex(text.secondary, SURFACE)).toBeGreaterThanOrEqual(8);
    });

    it('keeps passive marks between the UI floor and the text floor', () => {
        for (const hex of Object.values(mark)) {
            expect(withinBand(contrastRatioHex(hex, SURFACE), 'mark'), hex).toBe(true);
        }
        expect(contrastRatioHex(mark.active, SURFACE)).toBeGreaterThan(contrastRatioHex(mark.passive, SURFACE));
    });
});

describe('accent palette', () => {
    it('reaches AAA text contrast on the black surface for every text-capable accent', () => {
        for (const hex of [accent.primary, accent.border, accent.secondary]) {
            expect(contrastRatioHex(hex, SURFACE), hex).toBeGreaterThanOrEqual(minimumRatio('text'));
        }
    });

    it('keeps the fill as light as 7:1 primary text allows', () => {
        expect(contrastRatioHex(text.primary, accent.fill)).toBeGreaterThanOrEqual(minimumRatio('text'));
        expect(contrastRatioHex(text.primary, accent.fill)).toBeLessThan(minimumRatio('text') + 0.1);
    });

    it('keeps the highlighted text variant of the primary inside the text band', () => {
        expect(withinBand(contrastRatioHex(accent.primaryText, SURFACE), 'text')).toBe(true);
        expect(contrastRatioHex(accent.primary, SURFACE)).toBeLessThanOrEqual(maximumRatio('ui'));
    });

    it('keeps every accent distinguishable from the others and from the semantic added green', () => {
        const members = [accent.primary, accent.border, accent.secondary, SEMANTIC_ADDED_GREEN];
        for (const [i, first] of members.entries()) {
            for (const second of members.slice(i + 1)) {
                expect(worstSeparation(first, second), `${first} vs ${second}`).toBeGreaterThanOrEqual(
                    MINIMUM_SEPARATION,
                );
            }
        }
    });
});
