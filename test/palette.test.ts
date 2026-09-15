import { describe, expect, it } from 'vitest';
import { contrastRatioHex, minimumRatio, WCAG_THRESHOLDS } from '../scripts/color/contrast.ts';
import { deltaE, simulateCvd, type CvdType } from '../scripts/color/cvd.ts';
import { parseHex } from '../scripts/color/hex.ts';
import type { Rgb } from '../scripts/color/types.ts';
import { accent, SEMANTIC_ADDED_GREEN, SURFACE } from '../src/palette.ts';

const VISIONS: readonly ('normal' | CvdType)[] = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];
const MINIMUM_SEPARATION = 10;

function worstSeparation(first: string, second: string): number {
    const perceive = (hex: string, vision: 'normal' | CvdType): Rgb => {
        const { r, g, b } = parseHex(hex);
        return vision === 'normal' ? { r, g, b } : simulateCvd({ r, g, b }, vision);
    };
    return Math.min(...VISIONS.map((vision) => deltaE(perceive(first, vision), perceive(second, vision))));
}

describe('accent palette', () => {
    it('reaches AAA text contrast on the black surface for every text-capable accent', () => {
        for (const hex of [accent.primary, accent.border, accent.secondary]) {
            expect(contrastRatioHex(hex, SURFACE), hex).toBeGreaterThanOrEqual(minimumRatio('text'));
        }
    });

    it('keeps the fill as visible as 7:1 white text allows, just under the 3:1 UI AA floor', () => {
        expect(contrastRatioHex('#ffffff', accent.fill)).toBeGreaterThanOrEqual(minimumRatio('text'));
        expect(contrastRatioHex(accent.fill, SURFACE)).toBeGreaterThan(WCAG_THRESHOLDS.ui.AA - 0.01);
        expect(contrastRatioHex(accent.fill, SURFACE)).toBeLessThan(WCAG_THRESHOLDS.ui.AA);
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
