/**
 * Palette of the A11y Matrix Dark theme: Matrix Code Green with a P3 amber
 * phosphor secondary and a light grey neutral text tier, on a pure black
 * surface.
 *
 * Every value was selected by measurement (see `docs/palette-research.md`):
 * text-capable accents reach 7:1 on the surface, every accent stays at least
 * delta E 10 from the others and from the semantic "added" green under normal
 * vision and under protanopia, deuteranopia and tritanopia simulation, and no
 * text exceeds 14:1 so the brightest and dimmest glyphs on a line stay within
 * a 2:1 luminance spread (surround suppression, dark-mode halation).
 * @module
 */

import type { HexColor } from './types.ts';

/** The opaque surface every workbench color is measured against. */
export const SURFACE: HexColor = '#000000';

/**
 * The soft green VS Code uses for "added", "success" and "running" states.
 * Accent greens must stay distinguishable from it.
 */
export const SEMANTIC_ADDED_GREEN: HexColor = '#89d185';

/**
 * Neutral text colors. Pure white is never used for text: at 21:1 it sits
 * three times the luminance of a 7:1 syntax color on the same line and
 * suppresses its perceived contrast, and it is the strongest halation case
 * on OLED and high contrast LCD panels.
 */
export const text = {
    /** Body text, code, labels, carets, icons and inverted selection surfaces. 13.89:1 on black, APCA Lc 80. */
    primary: '#d2d2d2',
    /** Line numbers, descriptions, placeholders, inlay hints, blame and other secondary text. 10.02:1 on black. */
    secondary: '#b3b3b3',
} as const satisfies Readonly<Record<string, HexColor>>;

/**
 * Passive structure that is seen but not read: indent guides, rulers,
 * rendered whitespace and overview ruler marks. Kept below every text color
 * (4.5:1 to 7:1) so the marks never compete with the tokens beside them.
 */
export const mark = {
    /** Inactive indent guides, column rulers and rendered whitespace. 5.03:1 on black. */
    passive: '#7c7c7c',
    /** The active indent guide and overview ruler comment marks. 6.92:1 on black. */
    active: '#949494',
} as const satisfies Readonly<Record<string, HexColor>>;

/** Accent colors by role. */
export const accent = {
    /** Matrix Code Green: highlight outlines, find matches, minimap selection and bright terminal green. 15.38:1 on black. */
    primary: '#00ff41',
    /** The primary lowered to the 14:1 text ceiling for highlighted text such as filter matches. 13.89:1 on black. */
    primaryText: '#00f33e',
    /** Same hue lowered to 7.01:1: ambient borders, inactive selection and normal terminal green. */
    border: '#00ad2c',
    /** P3 amber phosphor: focus rings, active indicators and active text. 11.46:1 on black. */
    secondary: '#ffb000',
    /**
     * Same green hue darkened until `text.primary` reaches 7.08:1 on it; the fill itself is then 1.96:1 on black.
     * Text selection in the editor, terminal and inputs, hovered activity bar items and notebook status items.
     * Hovered rows and tabs are unfilled: a fill that carries `text.primary` at 7:1 drops colored labels below it.
     */
    fill: '#004913',
} as const satisfies Readonly<Record<string, HexColor>>;
