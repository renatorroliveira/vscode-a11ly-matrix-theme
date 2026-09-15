import { tokenColors } from './token-colors.ts';
import type { ColorTheme } from './types.ts';
import { workbenchColors } from './workbench-colors.ts';

/** Display label shown in the VS Code theme picker. */
export const THEME_LABEL = 'Ally Dark';

/** Output file name under `themes/`, referenced by `package.json`. */
export const THEME_FILE_NAME = 'ally-dark-color-theme.json';

/** The assembled Ally Dark color theme document. */
export const theme: ColorTheme = {
  $schema: 'vscode://schemas/color-theme',
  name: THEME_LABEL,
  type: 'dark',
  semanticHighlighting: true,
  colors: workbenchColors,
  tokenColors,
};
