/**
 * WCAG 2.x relative luminance.
 * @see https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 * @module
 */

import type { Rgb } from './types.ts';

const LINEAR_THRESHOLD = 0.04045;
const LUMA_RED = 0.2126;
const LUMA_GREEN = 0.7152;
const LUMA_BLUE = 0.0722;

/**
 * Converts an 8-bit sRGB channel to linear light.
 * @param channel Value 0..255.
 * @returns Linear value 0..1.
 */
export function channelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= LINEAR_THRESHOLD
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Converts a linear-light channel back to 8-bit sRGB.
 * @param linear Value 0..1.
 * @returns Channel 0..255.
 */
export function linearToChannel(linear: number): number {
  const encoded = linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  return encoded * 255;
}

/**
 * Computes the WCAG relative luminance of an opaque color.
 * @param color Opaque sRGB color.
 * @returns Luminance 0 (black) .. 1 (white).
 */
export function relativeLuminance(color: Rgb): number {
  return (
    LUMA_RED * channelToLinear(color.r) +
    LUMA_GREEN * channelToLinear(color.g) +
    LUMA_BLUE * channelToLinear(color.b)
  );
}
