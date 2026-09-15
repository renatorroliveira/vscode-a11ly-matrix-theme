/**
 * Minimal-change contrast repair: moves a foreground's lightness away from
 * the background until a target ratio is met, keeping hue and saturation.
 * @module
 */

import { compositeOver, flattenHex } from './composite.ts';
import { contrastRatio } from './contrast.ts';
import { formatHex, parseHex } from './hex.ts';
import { hslToRgb, rgbToHsl } from './hsl.ts';
import { relativeLuminance } from './luminance.ts';
import type { Hsl, Rgb } from './types.ts';

const SEARCH_ITERATIONS = 24;

/** Result of a contrast repair attempt. */
export interface NudgeResult {
    readonly original: string;
    readonly adjusted: string;
    readonly ratioBefore: number;
    readonly ratioAfter: number;
    readonly changed: boolean;
    readonly satisfied: boolean;
}

/**
 * Finds the closest lightness of the foreground that reaches the target ratio.
 * Translucent foregrounds are flattened first and returned opaque.
 * @param foregroundHex Foreground to repair.
 * @param backgroundHex Background it renders on.
 * @param targetRatio Minimum acceptable ratio.
 * @returns The adjusted color and the ratios before and after.
 */
export function nudgeToContrast(foregroundHex: string, backgroundHex: string, targetRatio: number): NudgeResult {
    const background = flattenHex(backgroundHex, '#000000');
    const foreground = flattenHex(foregroundHex, backgroundHex);
    const ratioBefore = contrastRatio(foreground, background);
    if (ratioBefore >= targetRatio) {
        return {
            original: foregroundHex,
            adjusted: foregroundHex,
            ratioBefore,
            ratioAfter: ratioBefore,
            changed: false,
            satisfied: true,
        };
    }
    const adjusted = searchLightness(foreground, background, targetRatio);
    if (adjusted === undefined) {
        return {
            original: foregroundHex,
            adjusted: foregroundHex,
            ratioBefore,
            ratioAfter: ratioBefore,
            changed: false,
            satisfied: false,
        };
    }
    const ratioAfter = contrastRatio(adjusted, background);
    return {
        original: foregroundHex,
        adjusted: formatHex({ ...adjusted, a: 1 }),
        ratioBefore,
        ratioAfter,
        changed: true,
        satisfied: true,
    };
}

function searchLightness(foreground: Rgb, background: Rgb, targetRatio: number): Rgb | undefined {
    const hsl = rgbToHsl(foreground);
    const lighten = relativeLuminance(foreground) >= relativeLuminance(background);
    const preferred = lighten ? 1 : 0;
    return (
        searchTowards(hsl, preferred, background, targetRatio) ??
        searchTowards(hsl, 1 - preferred, background, targetRatio)
    );
}

function searchTowards(hsl: Hsl, bound: number, background: Rgb, targetRatio: number): Rgb | undefined {
    const extreme = quantize(hslToRgb({ ...hsl, l: bound }));
    if (contrastRatio(extreme, background) < targetRatio) {
        return undefined;
    }
    let near = hsl.l;
    let far = bound;
    for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
        const mid = (near + far) / 2;
        const candidate = quantize(hslToRgb({ ...hsl, l: mid }));
        if (contrastRatio(candidate, background) >= targetRatio) {
            far = mid;
        } else {
            near = mid;
        }
    }
    return quantize(hslToRgb({ ...hsl, l: far }));
}

function quantize(color: Rgb): Rgb {
    return { r: Math.round(color.r), g: Math.round(color.g), b: Math.round(color.b) };
}

/**
 * Lowers the alpha of a translucent overlay until text on top of it reaches
 * the target ratio. Used for selection and highlight backgrounds, where
 * changing the text color would be the wrong repair.
 * @param overlayHex Translucent overlay such as `editor.selectionBackground`.
 * @param backdropHex Opaque surface the overlay is drawn on.
 * @param foregroundHex Text color drawn over the overlay.
 * @param targetRatio Minimum acceptable ratio.
 * @returns The overlay with reduced alpha and the ratios before and after.
 */
export function fadeOverlayToContrast(
    overlayHex: string,
    backdropHex: string,
    foregroundHex: string,
    targetRatio: number,
): NudgeResult {
    const overlay = parseHex(overlayHex);
    const backdrop = flattenHex(backdropHex, '#000000');
    const ratioAt = (alpha: number): number =>
        contrastRatio(flattenHex(foregroundHex, backdropHex), compositeOver({ ...overlay, a: alpha }, backdrop));
    const ratioBefore = ratioAt(overlay.a);
    if (ratioBefore >= targetRatio) {
        return {
            original: overlayHex,
            adjusted: overlayHex,
            ratioBefore,
            ratioAfter: ratioBefore,
            changed: false,
            satisfied: true,
        };
    }
    let passing = 0;
    let failing = overlay.a;
    for (let i = 0; i < SEARCH_ITERATIONS; i += 1) {
        const mid = (passing + failing) / 2;
        if (ratioAt(quantizeAlpha(mid)) >= targetRatio) {
            passing = mid;
        } else {
            failing = mid;
        }
    }
    const alpha = quantizeAlpha(passing);
    const ratioAfter = ratioAt(alpha);
    return {
        original: overlayHex,
        adjusted: formatHex({ ...overlay, a: alpha }),
        ratioBefore,
        ratioAfter,
        changed: true,
        satisfied: ratioAfter >= targetRatio,
    };
}

function quantizeAlpha(alpha: number): number {
    return Math.floor(alpha * 255) / 255;
}
