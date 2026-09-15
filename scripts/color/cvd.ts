/**
 * Color vision deficiency simulation (Machado, Oliveira & Fernandes 2009,
 * severity 1.0 matrices) and perceptual color difference (CIE76 delta E),
 * used to check that semantically distinct colors remain distinguishable.
 * @module
 */

import { channelToLinear, linearToChannel } from './luminance.ts';
import type { Lab, Rgb } from './types.ts';

/** Supported dichromacy types. */
export type CvdType = 'protanopia' | 'deuteranopia' | 'tritanopia';

type Matrix3 = readonly [
    readonly [number, number, number],
    readonly [number, number, number],
    readonly [number, number, number],
];

const CVD_MATRICES: Readonly<Record<CvdType, Matrix3>> = {
    protanopia: [
        [0.152286, 1.052583, -0.204868],
        [0.114503, 0.786281, 0.099216],
        [-0.003882, -0.048116, 1.051998],
    ],
    deuteranopia: [
        [0.367322, 0.860646, -0.227968],
        [0.280085, 0.672501, 0.047413],
        [-0.01182, 0.04294, 0.968881],
    ],
    tritanopia: [
        [1.255528, -0.076749, -0.178779],
        [-0.078411, 0.930809, 0.147602],
        [0.004733, 0.691367, 0.3039],
    ],
};

const D65 = { x: 0.95047, y: 1.0, z: 1.08883 } as const;

/**
 * Simulates how an opaque color appears to a viewer with the given dichromacy.
 * @param color Opaque sRGB color.
 * @param type Deficiency to simulate.
 * @returns The simulated sRGB color.
 */
export function simulateCvd(color: Rgb, type: CvdType): Rgb {
    const linear = [channelToLinear(color.r), channelToLinear(color.g), channelToLinear(color.b)] as const;
    const [row0, row1, row2] = CVD_MATRICES[type];
    const apply = (row: readonly [number, number, number]): number =>
        Math.min(1, Math.max(0, row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2]));
    return { r: linearToChannel(apply(row0)), g: linearToChannel(apply(row1)), b: linearToChannel(apply(row2)) };
}

/**
 * Converts an opaque sRGB color to CIE L*a*b* (D65).
 * @param color Opaque sRGB color.
 * @returns Lab coordinates.
 */
export function rgbToLab(color: Rgb): Lab {
    const r = channelToLinear(color.r);
    const g = channelToLinear(color.g);
    const b = channelToLinear(color.b);
    const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / D65.x;
    const y = (0.2126729 * r + 0.7151522 * g + 0.072175 * b) / D65.y;
    const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / D65.z;
    const fx = labCompand(x);
    const fy = labCompand(y);
    const fz = labCompand(z);
    return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/**
 * CIE76 color difference between two opaque colors.
 * Values below ~2.3 are a just-noticeable difference; below ~10 are hard to
 * tell apart at a glance.
 * @param first One color.
 * @param second The other color.
 * @returns Delta E (CIE76).
 */
export function deltaE(first: Rgb, second: Rgb): number {
    const a = rgbToLab(first);
    const b = rgbToLab(second);
    return Math.hypot(a.l - b.l, a.a - b.a, a.b - b.b);
}

function labCompand(t: number): number {
    const epsilon = 216 / 24389;
    const kappa = 24389 / 27;
    return t > epsilon ? Math.cbrt(t) : (kappa * t + 16) / 116;
}
