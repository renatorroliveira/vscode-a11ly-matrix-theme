/**
 * Alpha compositing of translucent colors over an opaque backdrop.
 * Contrast can only be measured on opaque colors, so every translucent
 * theme value is flattened first.
 * @module
 */

import { parseHex } from './hex.ts';
import type { Rgb, Rgba } from './types.ts';

/**
 * Composites a source color over an opaque backdrop using the "over" operator.
 * @param source Foreground with alpha.
 * @param backdrop Opaque background; its alpha is ignored.
 * @returns The resulting opaque color.
 */
export function compositeOver(source: Rgba, backdrop: Rgb): Rgb {
  const blend = (top: number, bottom: number): number => top * source.a + bottom * (1 - source.a);
  return { r: blend(source.r, backdrop.r), g: blend(source.g, backdrop.g), b: blend(source.b, backdrop.b) };
}

/**
 * Parses two hex literals and flattens the foreground onto the background.
 * @param foregroundHex Possibly translucent foreground.
 * @param backgroundHex Background; if translucent it is first flattened on black.
 * @returns The opaque foreground as it would render.
 */
export function flattenHex(foregroundHex: string, backgroundHex: string): Rgb {
  const background = compositeOver(parseHex(backgroundHex), { r: 0, g: 0, b: 0 });
  return compositeOver(parseHex(foregroundHex), background);
}
