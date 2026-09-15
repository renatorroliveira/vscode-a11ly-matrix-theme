/**
 * Curated foreground/background pairs that the contrast gate verifies.
 * Each pair names workbench color ids; `backdrop` is the opaque surface a
 * translucent background is drawn on. Keep this list as the single place
 * where the theme's accessibility contract is declared.
 *
 * The palette is a High Contrast one: most surfaces are black and many
 * background ids are intentionally unset, so those pairs measure against
 * the surface that actually shows through (`editor.background`). Terminal
 * ANSI colors are not listed because VS Code enforces
 * `terminal.integrated.minimumContrastRatio` on them at render time.
 * @module
 */

import type { ContentKind } from './color/contrast.ts';

/** A foreground/background pair with its WCAG content kind. */
export interface ContrastPair {
    readonly foreground: string;
    readonly background: string;
    readonly backdrop?: string;
    readonly kind: ContentKind;
    readonly description: string;
}

const EDITOR = 'editor.background';
const SIDEBAR = 'sideBar.background';
const TITLE = 'titleBar.activeBackground';
const PANEL = 'panel.background';
const WIDGET = 'editorWidget.background';
const INPUT = 'input.background';

function text(foreground: string, background: string, description: string, backdrop?: string): ContrastPair {
    return backdrop === undefined
        ? { foreground, background, kind: 'text', description }
        : { foreground, background, backdrop, kind: 'text', description };
}

function ui(foreground: string, background: string, description: string, backdrop?: string): ContrastPair {
    return backdrop === undefined
        ? { foreground, background, kind: 'ui', description }
        : { foreground, background, backdrop, kind: 'ui', description };
}

function dimmed(foreground: string, background: string, description: string): ContrastPair {
    return { foreground, background, kind: 'dimmed', description };
}

const EDITOR_PAIRS: readonly ContrastPair[] = [
    text('editor.foreground', EDITOR, 'Editor body text'),
    text('foreground', EDITOR, 'Default workbench text'),
    text('errorForeground', EDITOR, 'Error messages'),
    text('descriptionForeground', EDITOR, 'Secondary description text'),
    dimmed('disabledForeground', EDITOR, 'Disabled controls'),
    text('editorLineNumber.foreground', EDITOR, 'Line numbers'),
    text('editorLineNumber.activeForeground', EDITOR, 'Active line number'),
    text('editorCodeLens.foreground', EDITOR, 'CodeLens annotations'),
    text('editorLink.activeForeground', EDITOR, 'Editor links'),
    text('editor.selectionForeground', 'editor.selectionBackground', 'Selected text'),
    text('editor.selectionForeground', 'editor.inactiveSelectionBackground', 'Inactive selected text'),
    ui('minimap.selectionHighlight', EDITOR, 'Minimap selection marker'),
    ui('editor.findMatchBorder', EDITOR, 'Current find match outline'),
    ui('editor.findMatchHighlightBorder', EDITOR, 'Other find matches outline'),
    ui('editor.lineHighlightBorder', EDITOR, 'Current line outline'),
    ui('editor.wordHighlightBorder', EDITOR, 'Word highlight outline'),
    ui('editor.wordHighlightStrongBorder', EDITOR, 'Write-access highlight outline'),
    ui('editor.wordHighlightTextBorder', EDITOR, 'Textual occurrence highlight outline'),
    ui('editor.selectionHighlightBorder', EDITOR, 'Selection highlight outline'),
    ui('editor.rangeHighlightBorder', EDITOR, 'Range highlight outline'),
    ui('editor.symbolHighlightBorder', EDITOR, 'Symbol highlight outline'),
    ui('searchEditor.findMatchBorder', EDITOR, 'Search editor match outline'),
    ui('editorGroup.focusedEmptyBorder', EDITOR, 'Focused empty editor group outline'),
    ui('editorCursor.foreground', EDITOR, 'Caret'),
    ui('editorBracketMatch.border', EDITOR, 'Bracket match outline'),
    ui('editorGutter.addedBackground', EDITOR, 'Gutter added marker'),
    ui('editorGutter.modifiedBackground', EDITOR, 'Gutter modified marker'),
    ui('editorGutter.deletedBackground', EDITOR, 'Gutter deleted marker'),
    ui('editorIndentGuide.activeBackground1', EDITOR, 'Active indent guide'),
    ui('editorIndentGuide.background1', EDITOR, 'Indent guides'),
    ui('editorWhitespace.foreground', EDITOR, 'Rendered whitespace'),
    ui('editorRuler.foreground', EDITOR, 'Editor rulers'),
    ui('editorError.foreground', EDITOR, 'Error squiggle'),
    ui('editorWarning.foreground', EDITOR, 'Warning squiggle'),
    ui('editorInfo.foreground', EDITOR, 'Info squiggle'),
    ui('focusBorder', EDITOR, 'Focus ring on editor surface'),
    ui('contrastBorder', EDITOR, 'High contrast element outline'),
    ui('contrastActiveBorder', EDITOR, 'High contrast active element outline'),
    text('textLink.foreground', EDITOR, 'Links in text'),
    text('textLink.activeForeground', EDITOR, 'Active links in text'),
    text('textPreformat.foreground', EDITOR, 'Inline code'),
    text('settings.headerForeground', EDITOR, 'Settings headers'),
    text('keybindingLabel.foreground', EDITOR, 'Keybinding labels'),
    text('chat.editedFileForeground', EDITOR, 'Chat edited file label'),
    text('chat.slashCommandForeground', 'chat.slashCommandBackground', 'Chat slash command'),
];

const WIDGET_PAIRS: readonly ContrastPair[] = [
    text('editorWidget.foreground', WIDGET, 'Editor widgets'),
    text('editorWidget.foreground', 'editorHoverWidget.background', 'Hover widget'),
    text('editorHoverWidget.highlightForeground', 'editorHoverWidget.background', 'Hover widget match highlight'),
    ui('peekViewEditor.matchHighlightBorder', 'peekViewEditor.background', 'Peek editor match outline'),
    text('editorSuggestWidget.foreground', 'editorSuggestWidget.background', 'Suggest widget'),
    text('editorSuggestWidget.highlightForeground', 'editorSuggestWidget.background', 'Suggest match highlight'),
    text('editorSuggestWidget.selectedForeground', 'editorSuggestWidget.selectedBackground', 'Suggest selected row'),
    ui('editorSuggestWidget.focusOutline', 'editorSuggestWidget.background', 'Suggest focus outline'),
    text('peekViewResult.fileForeground', 'peekViewResult.background', 'Peek result file names'),
    text('peekViewResult.lineForeground', 'peekViewResult.background', 'Peek result lines'),
    text('peekViewResult.selectionForeground', 'peekViewResult.background', 'Peek selected result'),
    text('peekViewTitleLabel.foreground', 'peekViewTitle.background', 'Peek title'),
    text('peekViewTitleDescription.foreground', 'peekViewTitle.background', 'Peek title description'),
    text('notifications.foreground', 'notifications.background', 'Notification text'),
    text('notificationLink.foreground', 'notifications.background', 'Notification links'),
    ui('notificationsErrorIcon.foreground', 'notifications.background', 'Notification error icon'),
    ui('notificationsWarningIcon.foreground', 'notifications.background', 'Notification warning icon'),
    ui('notificationsInfoIcon.foreground', 'notifications.background', 'Notification info icon'),
    text('quickInput.foreground', 'quickInput.background', 'Quick input text'),
    text('quickInputList.focusHighlightForeground', 'quickInput.background', 'Quick input focused match'),
    text('pickerGroup.foreground', 'quickInput.background', 'Quick input group labels'),
    text('menu.foreground', 'menu.background', 'Menu items'),
    ui('menu.selectionBorder', 'menu.background', 'Menu selected item outline'),
    text('menubar.selectionForeground', TITLE, 'Menubar selected item'),
    ui('menubar.selectionBorder', TITLE, 'Menubar selected item outline'),
];

const SIDEBAR_PAIRS: readonly ContrastPair[] = [
    text('foreground', SIDEBAR, 'Side bar text'),
    text('sideBarTitle.foreground', SIDEBAR, 'Side bar title'),
    text('descriptionForeground', SIDEBAR, 'Side bar descriptions'),
    ui('sideBar.border', SIDEBAR, 'Side bar border'),
    ui('sideBarSectionHeader.border', SIDEBAR, 'Section header border'),
    ui('icon.foreground', SIDEBAR, 'Icons'),
    ui('focusBorder', SIDEBAR, 'Focus ring on side bar'),
    ui('list.focusOutline', SIDEBAR, 'List focus outline'),
    text('foreground', 'list.hoverBackground', 'Hovered list row', SIDEBAR),
    ui('activityBar.foreground', 'modernActivityBarItem.hoverBackground', 'Hovered activity bar item'),
    text('list.highlightForeground', SIDEBAR, 'List filter match'),
    text('list.focusHighlightForeground', SIDEBAR, 'Focused list row filter match'),
    ui('listFilterWidget.outline', SIDEBAR, 'List filter widget outline'),
    text('list.invalidItemForeground', SIDEBAR, 'List invalid items'),
    dimmed('list.deemphasizedForeground', SIDEBAR, 'List de-emphasized items'),
    text('gitDecoration.addedResourceForeground', SIDEBAR, 'Git added'),
    text('gitDecoration.modifiedResourceForeground', SIDEBAR, 'Git modified'),
    text('gitDecoration.deletedResourceForeground', SIDEBAR, 'Git deleted'),
    text('gitDecoration.untrackedResourceForeground', SIDEBAR, 'Git untracked'),
    text('gitDecoration.conflictingResourceForeground', SIDEBAR, 'Git conflicting'),
    text('gitDecoration.stageDeletedResourceForeground', SIDEBAR, 'Git staged deleted'),
    text('gitDecoration.stageModifiedResourceForeground', SIDEBAR, 'Git staged modified'),
    dimmed('gitDecoration.ignoredResourceForeground', SIDEBAR, 'Git ignored'),
    ui('activityBar.foreground', 'activityBar.background', 'Activity bar active icon'),
    ui('activityBar.inactiveForeground', 'activityBar.background', 'Activity bar inactive icon'),
    ui('activityBar.activeBorder', 'activityBar.background', 'Activity bar active indicator'),
    text('activityBarBadge.foreground', 'activityBarBadge.background', 'Activity bar badge'),
    text('badge.foreground', 'badge.background', 'Badges'),
];

const CHROME_PAIRS: readonly ContrastPair[] = [
    text('statusBar.foreground', EDITOR, 'Status bar text'),
    ui('statusBar.border', EDITOR, 'Status bar border'),
    text('statusBar.debuggingForeground', 'statusBar.debuggingBackground', 'Status bar while debugging'),
    text('statusBar.noFolderForeground', EDITOR, 'Status bar without folder'),
    text('statusBarItem.prominentForeground', 'statusBarItem.prominentBackground', 'Prominent status item', EDITOR),
    text('statusBarItem.remoteForeground', 'statusBarItem.remoteBackground', 'Remote status item', EDITOR),
    text('statusBarItem.hoverForeground', 'statusBarItem.hoverBackground', 'Hovered status item'),
    text('statusBarItem.errorForeground', EDITOR, 'Error status item'),
    text('statusBarItem.warningForeground', EDITOR, 'Warning status item'),
    text('tab.activeForeground', 'tab.activeBackground', 'Active tab'),
    text('tab.inactiveForeground', EDITOR, 'Inactive tab'),
    text('tab.inactiveForeground', 'modernTab.hoverBackground', 'Hovered tab'),
    text('tab.activeForeground', 'modernEditorTab.activeHoverBackground', 'Hovered active tab'),
    text('tab.selectedForeground', 'tab.activeBackground', 'Selected tab'),
    text('tab.unfocusedActiveForeground', 'tab.unfocusedActiveBackground', 'Unfocused active tab'),
    text('tab.unfocusedInactiveForeground', EDITOR, 'Unfocused inactive tab'),
    ui('tab.border', EDITOR, 'Tab borders'),
    text('breadcrumb.foreground', 'breadcrumb.background', 'Breadcrumbs'),
    text('breadcrumb.focusForeground', 'breadcrumb.background', 'Focused breadcrumb'),
    text('breadcrumb.activeSelectionForeground', 'breadcrumb.background', 'Selected breadcrumb'),
    text('panelTitle.activeForeground', PANEL, 'Active panel title'),
    text('panelTitle.inactiveForeground', PANEL, 'Inactive panel title'),
    ui('panelTitle.activeBorder', PANEL, 'Active panel indicator'),
    ui('panel.border', PANEL, 'Panel border'),
    text('titleBar.activeForeground', TITLE, 'Title bar'),
    ui('titleBar.border', TITLE, 'Title bar border'),
    text('commandCenter.foreground', TITLE, 'Command center'),
    text('commandCenter.activeForeground', TITLE, 'Active command center'),
    ui('commandCenter.border', TITLE, 'Command center border'),
    ui('tab.selectedBorderTop', EDITOR, 'Selected tab indicator'),
    ui('sash.hoverBorder', EDITOR, 'Hovered sash'),
    ui('toolbar.hoverOutline', EDITOR, 'Hovered toolbar action outline'),
    ui('settings.focusedRowBorder', EDITOR, 'Focused settings row outline'),
    ui('notebook.focusedCellBorder', EDITOR, 'Focused notebook cell outline'),
    ui('window.activeBorder', EDITOR, 'Active window border'),
    ui('window.inactiveBorder', EDITOR, 'Inactive window border'),
    text('terminal.foreground', EDITOR, 'Terminal text'),
    ui('terminal.border', PANEL, 'Terminal border'),
    ui('terminal.findMatchBorder', EDITOR, 'Terminal current find match outline'),
    ui('terminal.findMatchHighlightBorder', EDITOR, 'Terminal other find matches outline'),
    text('terminal.selectionForeground', 'terminal.selectionBackground', 'Terminal selected text'),
    text('terminal.selectionForeground', 'terminal.inactiveSelectionBackground', 'Terminal inactive selected text'),
];

const CONTROL_PAIRS: readonly ContrastPair[] = [
    text('input.foreground', INPUT, 'Input text'),
    text('input.placeholderForeground', INPUT, 'Input placeholder'),
    ui('input.border', INPUT, 'Input border'),
    ui('focusBorder', INPUT, 'Focus ring on inputs'),
    text('input.foreground', 'selection.background', 'Workbench text selection'),
    text('inputOption.activeForeground', 'inputOption.activeBackground', 'Active input option', INPUT),
    ui('inputOption.activeBorder', INPUT, 'Active input option border'),
    ui('inputValidation.errorBorder', 'inputValidation.errorBackground', 'Input error outline'),
    ui('inputValidation.warningBorder', 'inputValidation.warningBackground', 'Input warning outline'),
    ui('inputValidation.infoBorder', 'inputValidation.infoBackground', 'Input info outline'),
    text('checkbox.foreground', 'checkbox.background', 'Checkbox mark'),
    ui('checkbox.border', 'checkbox.background', 'Checkbox border'),
    text('dropdown.foreground', 'dropdown.background', 'Dropdown text'),
    ui('dropdown.border', 'dropdown.background', 'Dropdown border'),
    text('button.foreground', 'button.background', 'Primary button'),
    text('button.foreground', 'button.hoverBackground', 'Primary button hover'),
    ui('button.border', EDITOR, 'Primary button border'),
    text('button.secondaryForeground', EDITOR, 'Secondary button'),
    ui('button.secondaryBorder', EDITOR, 'Secondary button border'),
    text('charts.foreground', EDITOR, 'Chart labels'),
    ui('charts.lines', EDITOR, 'Chart lines'),
    ui('charts.blue', EDITOR, 'Chart blue series'),
    ui('charts.green', EDITOR, 'Chart green series'),
    ui('charts.purple', EDITOR, 'Chart purple series'),
    ui('charts.red', EDITOR, 'Chart red series'),
    ui('charts.yellow', EDITOR, 'Chart yellow series'),
    ui('problemsErrorIcon.foreground', EDITOR, 'Problems error icon'),
    ui('problemsWarningIcon.foreground', EDITOR, 'Problems warning icon'),
    ui('problemsInfoIcon.foreground', EDITOR, 'Problems info icon'),
];

/** Every pair the build gate checks, in report order. */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
    ...EDITOR_PAIRS,
    ...WIDGET_PAIRS,
    ...SIDEBAR_PAIRS,
    ...CHROME_PAIRS,
    ...CONTROL_PAIRS,
];

/**
 * Color groups whose members must stay mutually distinguishable, including
 * under simulated color vision deficiency (WCAG 1.4.1 support check).
 */
export const DISTINGUISHABLE_GROUPS: Readonly<Record<string, readonly string[]>> = {
    gitDecorations: [
        'gitDecoration.addedResourceForeground',
        'gitDecoration.modifiedResourceForeground',
        'gitDecoration.deletedResourceForeground',
        'gitDecoration.untrackedResourceForeground',
        'gitDecoration.conflictingResourceForeground',
    ],
    charts: ['charts.blue', 'charts.green', 'charts.purple', 'charts.red', 'charts.yellow'],
    diagnostics: ['editorError.foreground', 'editorWarning.foreground', 'editorInfo.foreground'],
    accentsVersusAdded: ['contrastBorder', 'focusBorder', 'editor.findMatchBorder', 'charts.green'],
    accentsVersusUntracked: [
        'contrastBorder',
        'focusBorder',
        'editor.findMatchBorder',
        'gitDecoration.untrackedResourceForeground',
    ],
    accentsVersusGutter: ['contrastBorder', 'focusBorder', 'editor.findMatchBorder', 'editorGutter.addedBackground'],
    focusVersusDiagnostics: [
        'focusBorder',
        'editorError.foreground',
        'editorWarning.foreground',
        'editorInfo.foreground',
    ],
};
