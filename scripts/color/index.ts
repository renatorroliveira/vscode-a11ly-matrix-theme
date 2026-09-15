/**
 * Public surface of the color library.
 * @module
 */

export { fadeOverlayToContrast, nudgeToContrast, type NudgeResult } from './adjust.ts';
export { compositeOver, flattenHex } from './composite.ts';
export {
    classifyContrast,
    contrastRatio,
    contrastRatioHex,
    minimumRatio,
    TARGET_LEVEL,
    WCAG_THRESHOLDS,
    type ConformanceLevel,
    type ContentKind,
} from './contrast.ts';
export { deltaE, rgbToLab, simulateCvd, type CvdType } from './cvd.ts';
export { clamp, formatHex, isHexColor, parseHex } from './hex.ts';
export { hslToRgb, rgbToHsl } from './hsl.ts';
export { channelToLinear, linearToChannel, relativeLuminance } from './luminance.ts';
export type { Hsl, Lab, Rgb, Rgba } from './types.ts';
