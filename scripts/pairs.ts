/**
 * Curated foreground/background pairs that the contrast gate verifies.
 * Each pair names workbench color ids; `backdrop` is the opaque surface a
 * translucent background is drawn on. Keep this list as the single place
 * where the theme's accessibility contract is declared.
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
const STATUS = 'statusBar.background';
const TABS = 'editorGroupHeader.tabsBackground';
const TITLE = 'titleBar.activeBackground';

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
    text('editor.foreground', 'editor.selectionBackground', 'Text over selection', EDITOR),
    text('editor.foreground', 'editor.inactiveSelectionBackground', 'Text over inactive selection', EDITOR),
    text('editor.foreground', 'editor.findMatchBackground', 'Text over current find match', EDITOR),
    text('editor.foreground', 'editor.findMatchHighlightBackground', 'Text over other find matches', EDITOR),
    text('editor.foreground', 'editor.lineHighlightBackground', 'Text over current line', EDITOR),
    text('editor.foreground', 'editor.wordHighlightBackground', 'Text over word highlight', EDITOR),
    text('editor.foreground', 'editor.wordHighlightStrongBackground', 'Text over write-access highlight', EDITOR),
    ui('editorCursor.foreground', EDITOR, 'Caret'),
    ui('editorBracketMatch.border', EDITOR, 'Bracket match outline'),
    ui('editorGutter.addedBackground', EDITOR, 'Gutter added marker'),
    ui('editorGutter.modifiedBackground', EDITOR, 'Gutter modified marker'),
    ui('editorGutter.deletedBackground', EDITOR, 'Gutter deleted marker'),
    ui('editorIndentGuide.activeBackground1', EDITOR, 'Active indent guide'),
    ui('focusBorder', EDITOR, 'Focus ring on editor surface'),
    text('textLink.foreground', EDITOR, 'Links in text'),
    text('textLink.activeForeground', EDITOR, 'Active links in text'),
    text('textPreformat.foreground', 'textPreformat.background', 'Inline code', EDITOR),
    text('settings.headerForeground', EDITOR, 'Settings headers'),
    text('keybindingLabel.foreground', EDITOR, 'Keybinding labels'),
    text('chat.editedFileForeground', EDITOR, 'Chat edited file label'),
    text('chat.slashCommandForeground', 'chat.slashCommandBackground', 'Chat slash command', EDITOR),
];

const WIDGET_PAIRS: readonly ContrastPair[] = [
    text('editorWidget.foreground', 'editorWidget.background', 'Editor widgets'),
    text('editorWidget.foreground', 'editorHoverWidget.background', 'Hover widget'),
    text('editorSuggestWidget.foreground', 'editorSuggestWidget.background', 'Suggest widget'),
    text('editorSuggestWidget.highlightForeground', 'editorSuggestWidget.background', 'Suggest match highlight'),
    text('editorSuggestWidget.foreground', 'editorSuggestWidget.selectedBackground', 'Suggest selected row'),
    ui('editorSuggestWidget.focusOutline', 'editorSuggestWidget.background', 'Suggest focus outline'),
    text('peekViewResult.fileForeground', 'peekViewResult.background', 'Peek result file names'),
    text('peekViewResult.lineForeground', 'peekViewResult.background', 'Peek result lines'),
    text('peekViewResult.selectionForeground', 'peekViewResult.selectionBackground', 'Peek selected result', 'peekViewResult.background'),
    text('peekViewTitleLabel.foreground', 'peekViewTitle.background', 'Peek title'),
    text('peekViewTitleDescription.foreground', 'peekViewTitle.background', 'Peek title description'),
    text('notifications.foreground', 'notifications.background', 'Notification text'),
    text('notificationLink.foreground', 'notifications.background', 'Notification links'),
    text('notificationCenterHeader.foreground', 'notificationCenterHeader.background', 'Notification center header'),
    ui('notificationsErrorIcon.foreground', 'notifications.background', 'Notification error icon'),
    ui('notificationsWarningIcon.foreground', 'notifications.background', 'Notification warning icon'),
    ui('notificationsInfoIcon.foreground', 'notifications.background', 'Notification info icon'),
    text('quickInput.foreground', 'quickInput.background', 'Quick input text'),
    text('quickInputList.focusForeground', 'quickInputList.focusBackground', 'Quick input focused row', 'quickInput.background'),
    text('quickInputList.focusHighlightForeground', 'quickInputList.focusBackground', 'Quick input focused match', 'quickInput.background'),
    text('pickerGroup.foreground', 'quickInput.background', 'Quick input group labels'),
    text('menu.foreground', 'menu.background', 'Menu items'),
    text('menu.selectionForeground', 'menu.selectionBackground', 'Menu selected item', 'menu.background'),
    text('menubar.selectionForeground', 'menubar.selectionBackground', 'Menubar selected item', TITLE),
];

const SIDEBAR_PAIRS: readonly ContrastPair[] = [
    text('sideBar.foreground', SIDEBAR, 'Side bar text'),
    text('sideBarTitle.foreground', SIDEBAR, 'Side bar title'),
    text('sideBarSectionHeader.foreground', 'sideBarSectionHeader.background', 'Section headers'),
    text('descriptionForeground', SIDEBAR, 'Side bar descriptions'),
    ui('icon.foreground', SIDEBAR, 'Icons'),
    ui('focusBorder', SIDEBAR, 'Focus ring on side bar'),
    text('list.activeSelectionForeground', 'list.activeSelectionBackground', 'Active list selection', SIDEBAR),
    ui('list.activeSelectionIconForeground', 'list.activeSelectionBackground', 'Active selection icon', SIDEBAR),
    text('list.inactiveSelectionForeground', 'list.inactiveSelectionBackground', 'Inactive list selection', SIDEBAR),
    text('list.hoverForeground', 'list.hoverBackground', 'Hovered list row', SIDEBAR),
    text('list.focusForeground', 'list.focusBackground', 'Focused list row', SIDEBAR),
    ui('list.focusOutline', SIDEBAR, 'List focus outline'),
    text('list.highlightForeground', SIDEBAR, 'List filter match'),
    text('list.errorForeground', SIDEBAR, 'List error items'),
    text('list.warningForeground', SIDEBAR, 'List warning items'),
    text('list.invalidItemForeground', SIDEBAR, 'List invalid items'),
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
    text('activityErrorBadge.foreground', 'activityErrorBadge.background', 'Activity error badge'),
    text('activityWarningBadge.foreground', 'activityWarningBadge.background', 'Activity warning badge'),
    text('badge.foreground', 'badge.background', 'Badges'),
];

const CHROME_PAIRS: readonly ContrastPair[] = [
    text('statusBar.foreground', STATUS, 'Status bar text'),
    text('statusBar.debuggingForeground', 'statusBar.debuggingBackground', 'Status bar while debugging'),
    text('statusBar.noFolderForeground', 'statusBar.noFolderBackground', 'Status bar without folder'),
    text('statusBarItem.prominentForeground', 'statusBarItem.prominentBackground', 'Prominent status item', STATUS),
    text('statusBarItem.remoteForeground', 'statusBarItem.remoteBackground', 'Remote status item'),
    text('statusBarItem.hoverForeground', 'statusBarItem.hoverBackground', 'Hovered status item', STATUS),
    ui('statusBar.focusBorder', STATUS, 'Status bar focus ring'),
    text('tab.activeForeground', 'tab.activeBackground', 'Active tab'),
    text('tab.inactiveForeground', 'tab.inactiveBackground', 'Inactive tab'),
    text('tab.selectedForeground', 'tab.selectedBackground', 'Selected tab'),
    text('tab.hoverForeground', 'tab.hoverBackground', 'Hovered tab', TABS),
    text('tab.unfocusedActiveForeground', 'tab.unfocusedActiveBackground', 'Unfocused active tab'),
    text('tab.unfocusedInactiveForeground', 'tab.unfocusedInactiveBackground', 'Unfocused inactive tab'),
    ui('tab.activeBorderTop', 'tab.activeBackground', 'Active tab indicator'),
    text('breadcrumb.foreground', 'breadcrumb.background', 'Breadcrumbs'),
    text('breadcrumb.focusForeground', 'breadcrumb.background', 'Focused breadcrumb'),
    text('breadcrumb.activeSelectionForeground', 'breadcrumb.background', 'Selected breadcrumb'),
    text('panelTitle.activeForeground', 'panel.background', 'Active panel title'),
    text('panelTitle.inactiveForeground', 'panel.background', 'Inactive panel title'),
    ui('panelTitle.activeBorder', 'panel.background', 'Active panel indicator'),
    text('titleBar.activeForeground', TITLE, 'Title bar'),
    text('titleBar.inactiveForeground', 'titleBar.inactiveBackground', 'Inactive title bar'),
    text('commandCenter.foreground', 'commandCenter.background', 'Command center', TITLE),
    text('commandCenter.activeForeground', 'commandCenter.activeBackground', 'Active command center', TITLE),
    ui('commandCenter.border', TITLE, 'Command center border'),
    text('terminal.foreground', 'terminal.background', 'Terminal text'),
    ui('terminalCursor.foreground', 'terminal.background', 'Terminal caret'),
    text('agentsPanel.foreground', 'agentsPanel.background', 'Agents panel'),
    text('surface.foreground', 'surface.background', 'Surface text'),
    text('agentsChatInput.foreground', 'agentsChatInput.background', 'Agents chat input'),
    text('agentsChatInput.placeholderForeground', 'agentsChatInput.background', 'Agents chat placeholder'),
    ui('agentsChatInput.focusBorder', 'agentsChatInput.background', 'Agents chat focus ring'),
    text('agentsBadge.foreground', 'agentsBadge.background', 'Agents badge'),
    text('agentsUnreadBadge.foreground', 'agentsUnreadBadge.background', 'Agents unread badge'),
    text('agentsNewSessionButton.foreground', 'agentsNewSessionButton.background', 'Agents new session button', 'agentsPanel.background'),
];

const CONTROL_PAIRS: readonly ContrastPair[] = [
    text('input.foreground', 'input.background', 'Input text'),
    text('input.placeholderForeground', 'input.background', 'Input placeholder'),
    ui('input.border', 'input.background', 'Input border'),
    ui('focusBorder', 'input.background', 'Focus ring on inputs'),
    text('inputOption.activeForeground', 'inputOption.activeBackground', 'Active input option', 'input.background'),
    ui('inputOption.activeBorder', 'input.background', 'Active input option border'),
    text('inputValidation.errorForeground', 'inputValidation.errorBackground', 'Input error message'),
    text('inputValidation.warningForeground', 'inputValidation.warningBackground', 'Input warning message'),
    text('inputValidation.infoForeground', 'inputValidation.infoBackground', 'Input info message'),
    text('checkbox.foreground', 'checkbox.background', 'Checkbox mark'),
    ui('checkbox.border', 'checkbox.background', 'Checkbox border'),
    text('dropdown.foreground', 'dropdown.background', 'Dropdown text'),
    ui('dropdown.border', 'dropdown.background', 'Dropdown border'),
    text('button.foreground', 'button.background', 'Primary button'),
    text('button.foreground', 'button.hoverBackground', 'Primary button hover'),
    text('button.secondaryForeground', 'button.secondaryBackground', 'Secondary button', EDITOR),
    ui('button.secondaryBorder', EDITOR, 'Secondary button border'),
    text('extensionButton.prominentForeground', 'extensionButton.prominentBackground', 'Extension install button'),
    text('charts.foreground', EDITOR, 'Chart labels'),
    ui('charts.blue', EDITOR, 'Chart blue series'),
    ui('charts.green', EDITOR, 'Chart green series'),
    ui('charts.orange', EDITOR, 'Chart orange series'),
    ui('charts.purple', EDITOR, 'Chart purple series'),
    ui('charts.red', EDITOR, 'Chart red series'),
    ui('charts.yellow', EDITOR, 'Chart yellow series'),
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
    charts: ['charts.blue', 'charts.green', 'charts.orange', 'charts.purple', 'charts.red', 'charts.yellow'],
    listSeverity: ['list.errorForeground', 'list.warningForeground', 'list.highlightForeground'],
};
