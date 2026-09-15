/**
 * Conversions between sRGB and HSL, used to adjust lightness while
 * preserving hue and saturation.
 * @module
 */

import type { Hsl, Rgb } from './types.ts';

/**
 * Converts an sRGB color to HSL.
 * @param color Opaque sRGB color.
 * @returns HSL with hue in degrees.
 */
export function rgbToHsl(color: Rgb): Hsl {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: hueOf(r, g, b, max, delta), s, l };
}

/**
 * Converts an HSL color to sRGB.
 * @param color HSL with hue in degrees.
 * @returns Opaque sRGB color with fractional channels.
 */
export function hslToRgb(color: Hsl): Rgb {
  const c = (1 - Math.abs(2 * color.l - 1)) * color.s;
  const hPrime = (((color.h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  const [r1, g1, b1] = sectorRgb(hPrime, c, x);
  const m = color.l - c / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

function hueOf(r: number, g: number, b: number, max: number, delta: number): number {
  if (delta === 0) {
    return 0;
  }
  let hue: number;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }
  return ((hue * 60) + 360) % 360;
}

function sectorRgb(hPrime: number, c: number, x: number): readonly [number, number, number] {
  const sectors: readonly (readonly [number, number, number])[] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  return sectors[Math.floor(hPrime) % 6] ?? [0, 0, 0];
}
