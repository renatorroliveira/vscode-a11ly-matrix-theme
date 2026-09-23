/**
 * Curated foreground/background pairs that the contrast gate verifies.
 * Each pair names workbench color ids; `backdrop` is the opaque surface a
 * translucent background is drawn on. Keep this list as the single place
 * where the theme's accessibility contract is declared. Every kind has a
 * floor and a ceiling (`scripts/color/contrast.ts`); `mark` pairs are the
 * passive structure that must stay below the text tier.
 *
 * The palette is a High Contrast one: most surfaces are black and many
 * background ids are intentionally unset, so those pairs measure against
 * the surface that actually shows through (`editor.background`). Terminal
 * ANSI colors are gated as text so the AAA claim holds even when the user
 * disables `terminal.integrated.minimumContrastRatio`; `ansiBlack` is the
 * one exception because it is the terminal's own background and only ever
 * shows as an inverse-video or background color. Extension ids shipped in
 * the theme (`gitlens.*`, `errorLens.*`, `markdownAlert.*`) are gated with
 * the same kinds as the core ids they mirror.
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

function dimmed(foreground: string, background: string, description: string, backdrop?: string): ContrastPair {
    return backdrop === undefined
        ? { foreground, background, kind: 'dimmed', description }
        : { foreground, background, backdrop, kind: 'dimmed', description };
}

function mark(foreground: string, background: string, description: string): ContrastPair {
    return { foreground, background, kind: 'mark', description };
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
    mark('editorGutter.addedBackground', EDITOR, 'Gutter added marker'),
    mark('editorGutter.modifiedBackground', EDITOR, 'Gutter modified marker'),
    mark('editorGutter.deletedBackground', EDITOR, 'Gutter deleted marker'),
    mark('editorIndentGuide.activeBackground1', EDITOR, 'Active indent guide'),
    mark('editorIndentGuide.background1', EDITOR, 'Indent guides'),
    mark('editorWhitespace.foreground', EDITOR, 'Rendered whitespace'),
    mark('editorRuler.foreground', EDITOR, 'Editor rulers'),
    mark('editorOverviewRuler.commentForeground', EDITOR, 'Overview ruler comment marks'),
    mark('editorOverviewRuler.bracketMatchForeground', EDITOR, 'Overview ruler bracket match marks'),
    mark('editorOverviewRuler.currentContentForeground', EDITOR, 'Overview ruler merge content marks'),
    text('editorInlayHint.foreground', 'editorInlayHint.background', 'Inlay hints', EDITOR),
    text('editor.inlineValuesForeground', 'editor.inlineValuesBackground', 'Inline debug values', EDITOR),
    text('git.blame.editorDecorationForeground', EDITOR, 'Git blame decoration'),
    text('diffEditor.unchangedRegionForeground', 'diffEditor.unchangedRegionBackground', 'Diff unchanged region'),
    text('strongForeground', EDITOR, 'Strong text'),
    text('editorBracketHighlight.foreground1', EDITOR, 'Bracket pair level 1'),
    text('editorBracketHighlight.foreground2', EDITOR, 'Bracket pair level 2'),
    text('editorBracketHighlight.foreground3', EDITOR, 'Bracket pair level 3'),
    text('editorBracketHighlight.unexpectedBracket.foreground', EDITOR, 'Unexpected bracket'),
    ui('editorGutter.foldingControlForeground', EDITOR, 'Folding control'),
    text('editorGutter.itemGlyphForeground', 'editorGutter.itemBackground', 'Gutter item glyph'),
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
    text('markdownAlert.important.foreground', EDITOR, 'Markdown important alert'),
    mark('editorOverviewRuler.findMatchForeground', EDITOR, 'Overview ruler find match marks'),
    ui('debugIcon.breakpointForeground', EDITOR, 'Breakpoint icon'),
    text('editor.foreground', 'chat.findMatchBackground', 'Chat current find match', EDITOR),
    text('editor.foreground', 'chat.findMatchHighlightBackground', 'Chat other find matches', EDITOR),
    ui('mergeEditor.conflict.handledUnfocused.border', EDITOR, 'Merge editor handled conflict outline'),
    ui('mergeEditor.conflict.unhandledUnfocused.border', EDITOR, 'Merge editor unhandled conflict outline'),
    ui('testing.coveredBorder', EDITOR, 'Covered code outline'),
    ui('testing.uncoveredBorder', EDITOR, 'Uncovered code outline'),
    mark('testing.coveredGutterBackground', EDITOR, 'Gutter covered marker'),
    mark('testing.uncoveredGutterBackground', EDITOR, 'Gutter uncovered marker'),
    ui('testing.coveredMinimapBackground', EDITOR, 'Minimap covered marker'),
    ui('testing.uncoveredMinimapBackground', EDITOR, 'Minimap uncovered marker'),
];

const WIDGET_PAIRS: readonly ContrastPair[] = [
    text('editorWidget.foreground', WIDGET, 'Editor widgets'),
    text('editorWidget.foreground', 'editorHoverWidget.background', 'Hover widget'),
    text('editorHoverWidget.highlightForeground', 'editorHoverWidget.background', 'Hover widget match highlight'),
    ui('peekViewEditor.matchHighlightBorder', 'peekViewEditor.background', 'Peek editor match outline'),
    text('editorSuggestWidget.foreground', 'editorSuggestWidget.background', 'Suggest widget'),
    text('editorSuggestWidget.highlightForeground', 'editorSuggestWidget.background', 'Suggest match highlight'),
    text('editorSuggestWidget.selectedForeground', 'editorSuggestWidget.selectedBackground', 'Suggest selected row'),
    text('editorSuggestWidgetStatus.foreground', 'editorSuggestWidget.background', 'Suggest widget status'),
    text('profileBadge.foreground', 'profileBadge.background', 'Profile badge'),
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
    text('descriptionForeground', 'list.hoverBackground', 'Hovered list row description', SIDEBAR),
    text('errorForeground', 'list.hoverBackground', 'Hovered list row error', SIDEBAR),
    text('textLink.foreground', 'list.hoverBackground', 'Hovered list row link', SIDEBAR),
    text('list.invalidItemForeground', 'list.hoverBackground', 'Hovered list row invalid item', SIDEBAR),
    dimmed('list.deemphasizedForeground', 'list.hoverBackground', 'Hovered list row de-emphasized item', SIDEBAR),
    dimmed('disabledForeground', 'list.hoverBackground', 'Hovered list row disabled item', SIDEBAR),
    text('gitDecoration.addedResourceForeground', 'list.hoverBackground', 'Hovered git added', SIDEBAR),
    text('gitDecoration.modifiedResourceForeground', 'list.hoverBackground', 'Hovered git modified', SIDEBAR),
    text('gitDecoration.deletedResourceForeground', 'list.hoverBackground', 'Hovered git deleted', SIDEBAR),
    text('gitDecoration.untrackedResourceForeground', 'list.hoverBackground', 'Hovered git untracked', SIDEBAR),
    text('gitDecoration.conflictingResourceForeground', 'list.hoverBackground', 'Hovered git conflicting', SIDEBAR),
    ui('symbolIcon.functionForeground', 'list.hoverBackground', 'Hovered function symbol icon', SIDEBAR),
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
    text('scmGraph.historyItemHoverDeletionsForeground', SIDEBAR, 'SCM graph deletions count'),
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
    text('tab.inactiveForeground', 'modernTab.hoverBackground', 'Hovered tab', EDITOR),
    text('tab.inactiveForeground', 'modernEditorTab.hoverBackground', 'Hovered editor tab', EDITOR),
    text('tab.activeForeground', 'modernEditorTab.activeHoverBackground', 'Hovered active tab', EDITOR),
    text('tab.selectedForeground', 'tab.activeBackground', 'Selected tab'),
    text('tab.unfocusedActiveForeground', 'tab.unfocusedActiveBackground', 'Unfocused active tab'),
    text('tab.unfocusedInactiveForeground', EDITOR, 'Unfocused inactive tab'),
    ui('tab.border', EDITOR, 'Tab borders'),
    text('breadcrumb.foreground', 'breadcrumb.background', 'Breadcrumbs'),
    text('breadcrumb.focusForeground', 'breadcrumb.background', 'Focused breadcrumb'),
    text('breadcrumb.activeSelectionForeground', 'breadcrumb.background', 'Selected breadcrumb'),
    text('panelTitle.activeForeground', PANEL, 'Active panel title'),
    text('panelTitle.inactiveForeground', PANEL, 'Inactive panel title'),
    text('debugConsole.warningForeground', PANEL, 'Debug console warnings'),
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

const TERMINAL_PAIRS: readonly ContrastPair[] = [
    text('terminal.ansiRed', EDITOR, 'ANSI red'),
    text('terminal.ansiGreen', EDITOR, 'ANSI green'),
    text('terminal.ansiYellow', EDITOR, 'ANSI yellow'),
    text('terminal.ansiBlue', EDITOR, 'ANSI blue'),
    text('terminal.ansiMagenta', EDITOR, 'ANSI magenta'),
    text('terminal.ansiCyan', EDITOR, 'ANSI cyan'),
    text('terminal.ansiWhite', EDITOR, 'ANSI white'),
    text('terminal.ansiBrightBlack', EDITOR, 'ANSI bright black'),
    text('terminal.ansiBrightRed', EDITOR, 'ANSI bright red'),
    text('terminal.ansiBrightGreen', EDITOR, 'ANSI bright green'),
    text('terminal.ansiBrightYellow', EDITOR, 'ANSI bright yellow'),
    text('terminal.ansiBrightBlue', EDITOR, 'ANSI bright blue'),
    text('terminal.ansiBrightMagenta', EDITOR, 'ANSI bright magenta'),
    text('terminal.ansiBrightCyan', EDITOR, 'ANSI bright cyan'),
    text('terminal.ansiBrightWhite', EDITOR, 'ANSI bright white'),
];

const GITLENS_PAIRS: readonly ContrastPair[] = [
    text('gitlens.decorations.addedForegroundColor', SIDEBAR, 'GitLens added decoration'),
    text('gitlens.decorations.branchAheadForegroundColor', SIDEBAR, 'GitLens branch ahead'),
    text('gitlens.decorations.branchBehindForegroundColor', SIDEBAR, 'GitLens branch behind'),
    text('gitlens.decorations.branchDivergedForegroundColor', SIDEBAR, 'GitLens branch diverged'),
    text('gitlens.decorations.branchMissingUpstreamForegroundColor', SIDEBAR, 'GitLens branch missing upstream'),
    text('gitlens.decorations.copiedForegroundColor', SIDEBAR, 'GitLens copied decoration'),
    text('gitlens.decorations.deletedForegroundColor', SIDEBAR, 'GitLens deleted decoration'),
    dimmed('gitlens.decorations.ignoredForegroundColor', SIDEBAR, 'GitLens ignored decoration'),
    text('gitlens.decorations.modifiedForegroundColor', SIDEBAR, 'GitLens modified decoration'),
    text('gitlens.decorations.renamedForegroundColor', SIDEBAR, 'GitLens renamed decoration'),
    text(
        'gitlens.decorations.statusMergingOrRebasingConflictForegroundColor',
        SIDEBAR,
        'GitLens merge conflict status',
    ),
    text('gitlens.decorations.statusMergingOrRebasingForegroundColor', SIDEBAR, 'GitLens merging status'),
    text('gitlens.decorations.statusPausedOperationReadyForegroundColor', SIDEBAR, 'GitLens paused operation status'),
    text('gitlens.decorations.untrackedForegroundColor', SIDEBAR, 'GitLens untracked decoration'),
    text('gitlens.decorations.workspaceCurrentForegroundColor', SIDEBAR, 'GitLens current workspace'),
    text('gitlens.decorations.workspaceRepoMissingForegroundColor', SIDEBAR, 'GitLens missing workspace repo'),
    text('gitlens.decorations.workspaceRepoOpenForegroundColor', SIDEBAR, 'GitLens open workspace repo'),
    text('gitlens.decorations.worktreeHasUncommittedChangesForegroundColor', SIDEBAR, 'GitLens worktree changes'),
    text('gitlens.decorations.worktreeMissingForegroundColor', SIDEBAR, 'GitLens missing worktree'),
    text('gitlens.gutterForegroundColor', 'gitlens.gutterBackgroundColor', 'GitLens gutter blame', EDITOR),
    text(
        'gitlens.gutterUncommittedForegroundColor',
        'gitlens.gutterBackgroundColor',
        'GitLens uncommitted blame',
        EDITOR,
    ),
    text('gitlens.trailingLineForegroundColor', EDITOR, 'GitLens trailing blame'),
    text('gitlens.graphChangesColumnAddedColor', EDITOR, 'GitLens graph additions count'),
    text('gitlens.graphChangesColumnDeletedColor', EDITOR, 'GitLens graph deletions count'),
    ui('gitlens.closedAutolinkedIssueIconColor', EDITOR, 'GitLens closed issue icon'),
    ui('gitlens.closedPullRequestIconColor', EDITOR, 'GitLens closed pull request icon'),
    ui('gitlens.mergedPullRequestIconColor', EDITOR, 'GitLens merged pull request icon'),
    ui('gitlens.openAutolinkedIssueIconColor', EDITOR, 'GitLens open issue icon'),
    ui('gitlens.openPullRequestIconColor', EDITOR, 'GitLens open pull request icon'),
    ui('gitlens.unpublishedChangesIconColor', EDITOR, 'GitLens unpublished changes icon'),
    ui('gitlens.unpublishedCommitIconColor', EDITOR, 'GitLens unpublished commit icon'),
    ui('gitlens.unpulledChangesIconColor', EDITOR, 'GitLens unpulled changes icon'),
    ui('gitlens.launchpadIndicatorAttentionColor', EDITOR, 'GitLens launchpad attention'),
    ui('gitlens.launchpadIndicatorAttentionHoverColor', EDITOR, 'GitLens launchpad attention hover'),
    ui('gitlens.launchpadIndicatorBlockedColor', EDITOR, 'GitLens launchpad blocked'),
    ui('gitlens.launchpadIndicatorBlockedHoverColor', EDITOR, 'GitLens launchpad blocked hover'),
    ui('gitlens.launchpadIndicatorMergeableColor', EDITOR, 'GitLens launchpad mergeable'),
    ui('gitlens.launchpadIndicatorMergeableHoverColor', EDITOR, 'GitLens launchpad mergeable hover'),
    ui('gitlens.timelineAdditionsColor', EDITOR, 'GitLens timeline additions'),
    ui('gitlens.timelineDeletionsColor', EDITOR, 'GitLens timeline deletions'),
    ui('gitlens.graphLane1Color', EDITOR, 'GitLens graph lane 1'),
    ui('gitlens.graphLane2Color', EDITOR, 'GitLens graph lane 2'),
    ui('gitlens.graphLane3Color', EDITOR, 'GitLens graph lane 3'),
    ui('gitlens.graphLane4Color', EDITOR, 'GitLens graph lane 4'),
    ui('gitlens.graphLane5Color', EDITOR, 'GitLens graph lane 5'),
    ui('gitlens.graphLane6Color', EDITOR, 'GitLens graph lane 6'),
    ui('gitlens.graphLane7Color', EDITOR, 'GitLens graph lane 7'),
    ui('gitlens.graphLane8Color', EDITOR, 'GitLens graph lane 8'),
    ui('gitlens.graphLane9Color', EDITOR, 'GitLens graph lane 9'),
    ui('gitlens.graphLane10Color', EDITOR, 'GitLens graph lane 10'),
    ui('gitlens.graphMinimapMarkerHeadColor', EDITOR, 'GitLens minimap head marker'),
    ui('gitlens.graphMinimapMarkerHighlightsColor', EDITOR, 'GitLens minimap highlight marker'),
    ui('gitlens.graphMinimapMarkerLocalBranchesColor', EDITOR, 'GitLens minimap local branch marker'),
    ui('gitlens.graphMinimapMarkerPullRequestsColor', EDITOR, 'GitLens minimap pull request marker'),
    ui('gitlens.graphMinimapMarkerRemoteBranchesColor', EDITOR, 'GitLens minimap remote branch marker'),
    ui('gitlens.graphMinimapMarkerStashesColor', EDITOR, 'GitLens minimap stash marker'),
    ui('gitlens.graphMinimapMarkerTagsColor', EDITOR, 'GitLens minimap tag marker'),
    ui('gitlens.graphMinimapMarkerUpstreamColor', EDITOR, 'GitLens minimap upstream marker'),
    ui('gitlens.graphMinimapMarkerWorktreeColor', EDITOR, 'GitLens minimap worktree marker'),
    ui('gitlens.graphScrollMarkerHeadColor', EDITOR, 'GitLens scroll head marker'),
    ui('gitlens.graphScrollMarkerHighlightsColor', EDITOR, 'GitLens scroll highlight marker'),
    ui('gitlens.graphScrollMarkerLocalBranchesColor', EDITOR, 'GitLens scroll local branch marker'),
    ui('gitlens.graphScrollMarkerMergeTargetColor', EDITOR, 'GitLens scroll merge target marker'),
    ui('gitlens.graphScrollMarkerPinnedColor', EDITOR, 'GitLens scroll pinned marker'),
    ui('gitlens.graphScrollMarkerPullRequestsColor', EDITOR, 'GitLens scroll pull request marker'),
    ui('gitlens.graphScrollMarkerRemoteBranchesColor', EDITOR, 'GitLens scroll remote branch marker'),
    ui('gitlens.graphScrollMarkerStashesColor', EDITOR, 'GitLens scroll stash marker'),
    ui('gitlens.graphScrollMarkerTagsColor', EDITOR, 'GitLens scroll tag marker'),
    ui('gitlens.graphScrollMarkerUpstreamColor', EDITOR, 'GitLens scroll upstream marker'),
    ui('gitlens.graphScrollMarkerWipColor', EDITOR, 'GitLens scroll WIP marker'),
    mark('gitlens.lineHighlightOverviewRulerColor', EDITOR, 'GitLens blame line overview ruler mark'),
];

const EXTENSION_PAIRS: readonly ContrastPair[] = [
    text('errorLens.errorForeground', EDITOR, 'Error Lens error message'),
    text('errorLens.errorForegroundLight', EDITOR, 'Error Lens error message (light variant)'),
    text('errorLens.warningForeground', EDITOR, 'Error Lens warning message'),
    text('errorLens.warningForegroundLight', EDITOR, 'Error Lens warning message (light variant)'),
    text('errorLens.infoForeground', EDITOR, 'Error Lens info message'),
    text('errorLens.infoForegroundLight', EDITOR, 'Error Lens info message (light variant)'),
    text('errorLens.hintForeground', EDITOR, 'Error Lens hint message'),
    text('errorLens.hintForegroundLight', EDITOR, 'Error Lens hint message (light variant)'),
    text('errorLens.statusBarErrorForeground', EDITOR, 'Error Lens status bar error'),
    text('errorLens.statusBarWarningForeground', EDITOR, 'Error Lens status bar warning'),
    text('errorLens.statusBarInfoForeground', EDITOR, 'Error Lens status bar info'),
    text('errorLens.statusBarHintForeground', EDITOR, 'Error Lens status bar hint'),
    ui('errorLens.statusBarIconErrorForeground', EDITOR, 'Error Lens status bar error icon'),
    ui('errorLens.statusBarIconWarningForeground', EDITOR, 'Error Lens status bar warning icon'),
    text('markdownAlert.note.foreground', EDITOR, 'Markdown note alert'),
    text('markdownAlert.tip.foreground', EDITOR, 'Markdown tip alert'),
    text('markdownAlert.warning.foreground', EDITOR, 'Markdown warning alert'),
    text('markdownAlert.caution.foreground', EDITOR, 'Markdown caution alert'),
];

/** Every pair the build gate checks, in report order. */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
    ...EDITOR_PAIRS,
    ...WIDGET_PAIRS,
    ...SIDEBAR_PAIRS,
    ...CHROME_PAIRS,
    ...CONTROL_PAIRS,
    ...TERMINAL_PAIRS,
    ...GITLENS_PAIRS,
    ...EXTENSION_PAIRS,
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
    ansiRedTiers: ['terminal.ansiRed', 'terminal.ansiBrightRed'],
    ansiGreenTiers: ['terminal.ansiGreen', 'terminal.ansiBrightGreen'],
    ansiYellowTiers: ['terminal.ansiYellow', 'terminal.ansiBrightYellow'],
    ansiBlueTiers: ['terminal.ansiBlue', 'terminal.ansiBrightBlue'],
    ansiMagentaTiers: ['terminal.ansiMagenta', 'terminal.ansiBrightMagenta'],
    ansiCyanTiers: ['terminal.ansiCyan', 'terminal.ansiBrightCyan'],
    ansiGreys: ['terminal.ansiBrightBlack', 'terminal.ansiWhite', 'terminal.ansiBrightWhite'],
    coverageBorders: ['testing.coveredBorder', 'testing.uncoveredBorder'],
    coverageGutter: ['testing.coveredGutterBackground', 'testing.uncoveredGutterBackground'],
    coverageMinimap: ['testing.coveredMinimapBackground', 'testing.uncoveredMinimapBackground'],
    mergeConflicts: ['mergeEditor.conflict.handledUnfocused.border', 'mergeEditor.conflict.unhandledUnfocused.border'],
};

/**
 * A stack of backgrounds drawn behind editor text. `layers` are composited
 * in order onto `editor.background`, so a word highlight painted over a line
 * highlight is measured as the viewer sees it.
 */
export interface TokenOverlay {
    readonly layers: readonly string[];
    readonly description: string;
}

/**
 * Overlays on which every syntax token foreground and `editor.foreground`
 * must stay inside the text band. The dimmest token sits near 8:1 on black,
 * so any overlay behind code has almost no luminance budget.
 */
export const TOKEN_OVERLAYS: readonly TokenOverlay[] = [
    { layers: ['chat.findMatchBackground'], description: 'Chat current find match' },
    { layers: ['chat.findMatchHighlightBackground'], description: 'Chat other find matches' },
    { layers: ['mergeEditor.conflictingLines.background'], description: 'Merge editor conflicting lines' },
    { layers: ['mergeEditor.change.background'], description: 'Merge editor changed lines' },
    {
        layers: ['mergeEditor.change.background', 'mergeEditor.change.word.background'],
        description: 'Merge editor changed words on changed lines',
    },
    { layers: ['mergeEditor.changeBase.background'], description: 'Merge editor base changed lines' },
    {
        layers: ['mergeEditor.changeBase.background', 'mergeEditor.changeBase.word.background'],
        description: 'Merge editor base changed words on changed lines',
    },
];
