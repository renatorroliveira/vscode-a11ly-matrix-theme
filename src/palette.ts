/**
 * Accent palette of the A11y Matrix Dark theme: Matrix Code Green with a P3
 * amber phosphor secondary, on a pure black surface.
 *
 * Every value was selected by measurement (see `docs/palette-research.md`):
 * text-capable accents reach 7:1 on the surface, and every accent stays at
 * least delta E 10 from the others and from the semantic "added" green under
 * normal vision and under protanopia, deuteranopia and tritanopia simulation.
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

/** Accent colors by role. */
export const accent = {
    /** Matrix Code Green: highlights, find matches, selection fill and bright terminal green. 15.38:1 on black. */
    primary: '#00ff41',
    /** Same hue lowered to 7.01:1: ambient borders, inactive selection and normal terminal green. */
    border: '#00ad2c',
    /** P3 amber phosphor: focus rings, active indicators and active text. 11.46:1 on black. */
    secondary: '#ffb000',
    /** Same green hue darkened until white text reaches 7.01:1: workbench text selection in inputs. */
    selection: '#00681b',
} as const satisfies Readonly<Record<string, HexColor>>;
