/**
 * WCAG 2.x contrast ratio and conformance classification, plus the project's
 * contrast ceilings.
 * @see https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 * @module
 */

import { flattenHex } from './composite.ts';
import { relativeLuminance } from './luminance.ts';
import type { Rgb } from './types.ts';

/**
 * Kind of content a color pair renders, which selects the WCAG threshold.
 * `mark` is passive structure (indent guides, rulers, whitespace, gutter and
 * overview ruler marks) that must stay below the text tier.
 */
export type ContentKind = 'text' | 'large-text' | 'ui' | 'dimmed' | 'mark';

/** WCAG conformance levels a ratio can satisfy. */
export type ConformanceLevel = 'AAA' | 'AA' | 'fail';

/**
 * Minimum ratios per success criterion 1.4.3, 1.4.6 and 1.4.11.
 * WCAG defines no AAA tier for non-text; the `ui` and `mark` AAA value of
 * 4.5 is the project policy for a high contrast theme. `dimmed` is the
 * project policy for disabled and ignored items, which WCAG exempts but
 * low-vision users still need to read.
 */
export const WCAG_THRESHOLDS: Readonly<Record<ContentKind, { readonly AA: number; readonly AAA: number }>> = {
    'text': { AA: 4.5, AAA: 7 },
    'large-text': { AA: 3, AAA: 4.5 },
    'ui': { AA: 3, AAA: 4.5 },
    'dimmed': { AA: 3, AAA: 4.5 },
    'mark': { AA: 3, AAA: 4.5 },
};

/**
 * Maximum ratios, a project policy WCAG does not have. Text stays within a
 * 2:1 luminance spread of the 7:1 floor so bright glyphs do not suppress the
 * perceived contrast of dimmer ones on the same line, and below the APCA
 * dark-mode ceiling of about Lc 85 to 90 where halation starts. Accent
 * outlines may reach 15.5:1 because they are the intended brightest element.
 * Passive marks stay under the text floor.
 */
export const CONTRAST_CEILINGS: Readonly<Record<ContentKind, number>> = {
    'text': 14,
    'large-text': 14,
    'ui': 15.5,
    'dimmed': 14,
    'mark': 7,
};

/** Conformance level the build gate enforces. */
export const TARGET_LEVEL: Exclude<ConformanceLevel, 'fail'> = 'AAA';

/**
 * Computes the contrast ratio between two opaque colors.
 * @param first One color.
 * @param second The other color; order does not matter.
 * @returns Ratio in the range 1..21.
 */
export function contrastRatio(first: Rgb, second: Rgb): number {
    const l1 = relativeLuminance(first);
    const l2 = relativeLuminance(second);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Computes the contrast ratio of two hex literals, flattening any alpha
 * onto the background first.
 * @param foregroundHex Foreground, possibly translucent.
 * @param backgroundHex Background, possibly translucent (flattened on black).
 * @returns Ratio in the range 1..21.
 */
export function contrastRatioHex(foregroundHex: string, backgroundHex: string): number {
    const foreground = flattenHex(foregroundHex, backgroundHex);
    const background = flattenHex(backgroundHex, '#000000');
    return contrastRatio(foreground, background);
}

/**
 * Classifies a ratio against the thresholds for a content kind.
 * Ratios are never rounded up: 4.49 fails text AA.
 * @param ratio Contrast ratio.
 * @param kind Content kind that selects the thresholds.
 * @returns The highest level the ratio satisfies.
 */
export function classifyContrast(ratio: number, kind: ContentKind): ConformanceLevel {
    const thresholds = WCAG_THRESHOLDS[kind];
    if (ratio >= thresholds.AAA) {
        return 'AAA';
    }
    return ratio >= thresholds.AA ? 'AA' : 'fail';
}

/**
 * Returns the minimum ratio a content kind must reach at the target level.
 * @param kind Content kind.
 * @returns Minimum ratio.
 */
export function minimumRatio(kind: ContentKind): number {
    return WCAG_THRESHOLDS[kind][TARGET_LEVEL];
}

/**
 * Returns the maximum ratio a content kind may reach.
 * @param kind Content kind.
 * @returns Maximum ratio.
 */
export function maximumRatio(kind: ContentKind): number {
    return CONTRAST_CEILINGS[kind];
}

/**
 * Tells whether a ratio lies inside the band for a content kind:
 * `minimum <= ratio <= maximum`, never rounded.
 * @param ratio Contrast ratio.
 * @param kind Content kind.
 * @returns True when the ratio satisfies both the floor and the ceiling.
 */
export function withinBand(ratio: number, kind: ContentKind): boolean {
    return ratio >= minimumRatio(kind) && ratio <= maximumRatio(kind);
}
