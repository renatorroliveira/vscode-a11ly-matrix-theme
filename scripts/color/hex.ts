/**
 * Hex color parsing and formatting for `#rgb`, `#rgba`, `#rrggbb` and `#rrggbbaa`.
 * @module
 */

import type { Rgba } from './types.ts';

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const MAX_CHANNEL = 255;

/**
 * Tests whether a string is a valid CSS hex color.
 * @param value Candidate string.
 * @returns True when the value is a hex color literal.
 */
export function isHexColor(value: string): boolean {
  return HEX_PATTERN.test(value);
}

/**
 * Parses a hex color literal into channel values.
 * @param hex Hex literal such as `#3994bcb3`.
 * @returns Channels 0..255 and alpha 0..1.
 * @throws {RangeError} When the literal is malformed.
 */
export function parseHex(hex: string): Rgba {
  if (!isHexColor(hex)) {
    throw new RangeError(`Invalid hex color: ${hex}`);
  }
  const digits = expandShorthand(hex.slice(1));
  const channel = (index: number): number => Number.parseInt(digits.slice(index, index + 2), 16);
  const alpha = digits.length === 8 ? channel(6) / MAX_CHANNEL : 1;
  return { r: channel(0), g: channel(2), b: channel(4), a: alpha };
}

/**
 * Formats channels as a lowercase hex literal, omitting alpha when opaque.
 * @param color Channels 0..255 and alpha 0..1.
 * @returns `#rrggbb` or `#rrggbbaa`.
 */
export function formatHex(color: Rgba): string {
  const pair = (value: number): string =>
    Math.round(clamp(value, 0, MAX_CHANNEL)).toString(16).padStart(2, '0');
  const base = `#${pair(color.r)}${pair(color.g)}${pair(color.b)}`;
  return color.a >= 1 ? base : `${base}${pair(color.a * MAX_CHANNEL)}`;
}

/**
 * Clamps a number into an inclusive range.
 * @param value Input number.
 * @param min Lower bound.
 * @param max Upper bound.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function expandShorthand(digits: string): string {
  if (digits.length === 6 || digits.length === 8) {
    return digits;
  }
  return [...digits].map((digit) => digit + digit).join('');
}
