/**
 * WCAG 2.x contrast ratio and conformance classification.
 * @see https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 * @module
 */

import { flattenHex } from './composite.ts';
import { relativeLuminance } from './luminance.ts';
import type { Rgb } from './types.ts';

/** Kind of content a color pair renders, which selects the WCAG threshold. */
export type ContentKind = 'text' | 'large-text' | 'ui' | 'dimmed';

/** WCAG conformance levels a ratio can satisfy. */
export type ConformanceLevel = 'AAA' | 'AA' | 'fail';

/**
 * Minimum ratios per success criterion 1.4.3, 1.4.6 and 1.4.11.
 * `dimmed` is the project policy for disabled and ignored items, which WCAG
 * exempts but low-vision users still need to read.
 */
export const WCAG_THRESHOLDS: Readonly<Record<ContentKind, { readonly AA: number; readonly AAA: number }>> = {
  text: { AA: 4.5, AAA: 7 },
  'large-text': { AA: 3, AAA: 4.5 },
  ui: { AA: 3, AAA: 3 },
  dimmed: { AA: 3, AAA: 4.5 },
};

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
 * Returns the AA minimum ratio for a content kind.
 * @param kind Content kind.
 * @returns Minimum ratio.
 */
export function minimumRatio(kind: ContentKind): number {
  return WCAG_THRESHOLDS[kind].AA;
}
