/**
 * Immutable color value types used by the color library.
 * @module
 */

/** Opaque sRGB color with 8-bit channels. */
export interface Rgb {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

/** sRGB color with 8-bit channels and alpha in the range 0..1. */
export interface Rgba extends Rgb {
    readonly a: number;
}

/** HSL color: hue in degrees 0..360, saturation and lightness 0..1. */
export interface Hsl {
    readonly h: number;
    readonly s: number;
    readonly l: number;
}

/** CIE L*a*b* color used for perceptual difference. */
export interface Lab {
    readonly l: number;
    readonly a: number;
    readonly b: number;
}
