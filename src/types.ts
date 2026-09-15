/**
 * Shared, immutable type definitions for the theme source and build tooling.
 * @module
 */

/** A CSS hex color literal: `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`. */
export type HexColor = `#${string}`;

/** Font style flags accepted by VS Code TextMate token rules. */
export type FontStyle =
  | ''
  | 'italic'
  | 'bold'
  | 'underline'
  | 'strikethrough'
  | `${'italic' | 'bold' | 'underline' | 'strikethrough'} ${string}`;

/** Settings applied to a TextMate scope selection. */
export interface TokenColorSettings {
  readonly foreground?: HexColor;
  readonly background?: HexColor;
  readonly fontStyle?: FontStyle;
}

/** One entry of the `tokenColors` array in a VS Code color theme. */
export interface TokenColorRule {
  readonly name?: string;
  readonly scope: string | readonly string[];
  readonly settings: TokenColorSettings;
}

/** Map of VS Code workbench color identifiers to hex values. */
export type WorkbenchColors = Readonly<Record<string, HexColor>>;

/** The complete VS Code color theme document that is emitted to `themes/`. */
export interface ColorTheme {
  readonly $schema: 'vscode://schemas/color-theme';
  readonly name: string;
  readonly type: 'dark' | 'light' | 'hcDark' | 'hcLight';
  readonly semanticHighlighting: boolean;
  readonly colors: WorkbenchColors;
  readonly tokenColors: readonly TokenColorRule[];
}
