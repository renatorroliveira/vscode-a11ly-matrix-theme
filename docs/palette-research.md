# Accent palette research: Matrix Code Green and P3 amber

Decision record for the 0.1.0 accent remodel and the neutral text tier that followed it. The theme moved from VS Code's Dark High Contrast accents
(cyan `#6fc3df` borders, orange `#f38518` focus) to a green primary in the style of hacker terminals and
the Matrix films, with an amber secondary. Every ratio and delta E below was produced by scripts that
import `scripts/color/`; nothing was computed by hand. The chosen values live in `src/palette.ts`.

## Roles

| Role                                                                    | Value     | Ratio on `#000000` | Basis                                                                        |
| ----------------------------------------------------------------------- | --------- | ------------------ | ---------------------------------------------------------------------------- |
| Text primary: body text, code, labels, carets, icons, bright ANSI white | `#d2d2d2` | 13.89              | Light grey under the 14:1 text ceiling (APCA Lc 80); see the section below   |
| Text secondary: line numbers, descriptions, placeholders, inlay hints   | `#b3b3b3` | 10.02              | One step down, delta E 11.3 from the primary, still 8.82:1 on widget panels  |
| Mark passive: indent guides, rulers, rendered whitespace                | `#7c7c7c` | 5.03               | Below every text color so structure never competes with tokens               |
| Mark active: active indent guide, overview ruler comment marks          | `#949494` | 6.92               | Top of the passive band, under the 7:1 text floor                            |
| Primary: highlight outlines, find matches, minimap selection            | `#00ff41` | 15.38              | "Matrix Code Green" fan palette; also Quiet Hacker and Durgonix themes       |
| Primary text: filter and suggest match highlights, bright ANSI green    | `#00f33e` | 13.89              | The primary lowered to the text ceiling, delta E 5.5 from it                 |
| Border: ambient borders, current line outline, normal ANSI green        | `#00ad2c` | 7.01               | Same hue as the primary, lightness lowered until 7:1                         |
| Boundary: input, dropdown and checkbox borders, `contrastBorder`        | `#007a1f` | 3.80               | Same hue at the WCAG 1.4.11 floor so the focus ring changes it by 3.01:1     |
| Secondary: focus rings, active indicators, active text                  | `#ffb000` | 11.46              | P3 amber phosphor, the VT220 amber option that shipped alongside green tubes |
| Fill: text selection (primary text), hovered activity bar items         | `#004913` | 1.96               | Same hue darkened until `text.primary` reaches 7.08:1                        |
| Fill dim: workbench `::selection` (hovers, chat, notifications)         | `#001806` | 1.13               | Same hue darkened until every token and link keeps 7:1                       |

### Neutral text tier and contrast ceilings (2026-09-18)

The 0.1.0 palette used pure white `#ffffff` for body text, line numbers, carets, indent guides, rulers,
inlay hints and 120 more workbench ids, while the syntax floor sat at 7:1. The editor therefore rendered
glyphs at 21:1 beside glyphs at 7:1, a 3.0x luminance spread on one line, and the distribution was
bimodal: 21 editor ids at exactly 21:1, 15 text and token colors in the 7 to 8 bin, the rest scattered.

Three findings drove the change. WCAG 2.x sets a floor and no ceiling. The surround suppression
literature (Chubb, Sperling and Solomon, PNAS 1989; Cannon and Fullenkamp 1991; Xing and Heeger 2001)
shows that the perceived contrast of a lower-contrast element drops when a higher-contrast element
surrounds it, and only in that direction, so the fix is to shrink the spread rather than brighten the dim
colors. The APCA project reports "a level of too much contrast in dark mode" from pupil dilation,
halation and astigmatism and tests Lc 85 to 90 as the dark-mode maximum, with text on `#000000` "ideally
between `#cccccc` and `#e4e4e4`" (13.1:1 to 16.5:1); Material Design's 87% white high-emphasis text lands
in the same place. ISO 9241-303:2011 clause 5.2.4 bounds area luminances between 0.1L and 10L and adopts
the CIE definition of glare as "an unsuitable distribution or range of luminance, or too extreme
contrasts"; it addresses areas rather than glyphs and was used as an outer bound only.

The band is anchored on a 2:1 luminance spread from the fixed 7:1 floor:

| Tier                                                       | Band          | Grey equivalent        | APCA Lc  |
| ---------------------------------------------------------- | ------------- | ---------------------- | -------- |
| Text and tokens, hard limits                               | 7:1 to 14:1   | `#959595` to `#d2d2d2` | 45 to 80 |
| Text and tokens, target                                    | 8:1 to 14:1   | `#a0a0a0` to `#d2d2d2` | 52 to 80 |
| Accent outlines (find, word, bracket, selection highlight) | 7:1 to 15.5:1 | up to `#dddddd`        | up to 87 |
| Passive marks (guides, rulers, whitespace, gutter, ruler)  | 4.5:1 to 7:1  | `#7c7c7c` to `#959595` | 30 to 45 |

Measured effect on the editor (ratios against `#000000`, translucent values flattened first):

| Group                                         | Before: range and spread | After: range and spread |
| --------------------------------------------- | ------------------------ | ----------------------- |
| Syntax tokens (20 distinct colors)            | 7.01 to 21.00, 3.00x     | 8.00 to 13.98, 1.75x    |
| Editor text ids (body, numbers, hints, links) | up to 21.00              | up to 13.98             |
| Highlight outlines                            | up to 21.00              | up to 15.48             |
| Gutter and overview ruler marks               | up to 21.00              | up to 8.82              |

Every replacement kept hue and saturation and moved lightness only, with `capToContrast` (down) or
`nudgeToContrast` (up):

| Before    | Ratio | After     | Ratio | Where                                                                    |
| --------- | ----- | --------- | ----- | ------------------------------------------------------------------------ |
| `#ffffff` | 21.00 | `#d2d2d2` | 13.89 | All body text, carets, icons, badges, inverted selection surfaces        |
| `#ffffff` | 21.00 | `#b3b3b3` | 10.02 | Line numbers, inlay hints, blame, folding controls, ANSI white           |
| `#ffffff` | 21.00 | `#7c7c7c` | 5.03  | Indent guides, column rulers                                             |
| `#ffffff` | 21.00 | `#949494` | 6.92  | Active indent guide, overview ruler comment marks                        |
| `#00ffff` | 16.75 | `#00eaea` | 13.96 | Editor links, ANSI bright cyan                                           |
| `#ffff00` | 19.56 | `#d9d900` | 13.88 | ANSI bright yellow                                                       |
| `#e5e5e5` | 16.67 | `#b3b3b3` | 10.02 | ANSI white                                                               |
| `#cbedcb` | 16.52 | `#a7e1a7` | 13.97 | Search context line prefix token                                         |
| `#ffd700` | 14.97 | `#f7d000` | 13.98 | Bracket pair level 1                                                     |
| `#dcdcaa` | 14.86 | `#d6d69d` | 13.96 | Function tokens                                                          |
| `#ffd370` | 14.80 | `#ffcb58` | 13.94 | Warning squiggle text, warning icons, unicode highlight border           |
| `#d4d4d4` | 14.17 | `#d2d2d2` | 13.89 | Operator and property tokens                                             |
| `#9cdcfe` | 14.08 | `#9adbfe` | 13.94 | Variable and attribute tokens                                            |
| `#00ff41` | 15.38 | `#00f33e` | 13.89 | Filter, suggest and hover match highlight text (outlines keep `#00ff41`) |
| `#569cd6` | 7.12  | `#66a6da` | 8.03  | Keywords, storage, tags, constants (13 rules)                            |
| `#ce9178` | 7.95  | `#ce9279` | 8.01  | Strings                                                                  |
| `#7ca668` | 7.51  | `#83ab70` | 8.02  | Comments                                                                 |
| `#c586c0` | 7.55  | `#c88dc3` | 8.05  | Control keywords                                                         |
| `#959595` | 7.01  | `#a0a0a0` | 8.03  | Tag punctuation, CodeLens                                                |
| `#ff3232` | 5.75  | `#ff7474` | 8.00  | Unexpected bracket                                                       |
| `#f48771` | 8.55  | `#f16b50` | 7.00  | Gutter deleted marker (the squiggle keeps `#f48771`)                     |
| `#c3df6f` | 14.11 | `#81a024` | 6.99  | Overview ruler merge marks                                               |

The same sweep lifted five ids that had been under their floor and outside the pair list: debug console
warnings `#008000` 4.09:1 to `#00ba00`, breakpoint icon `#e51400` 4.43:1 to `#e81400`, overview ruler find
marks `#ab5a00` 4.19:1 to `#b35e00`, SCM graph deletions `#c74e39` 4.58:1 to `#da8c7e`, and the Markdown
important alert `#b180d7` 6.94:1 to `#ba8fdc`. Each got a pair. The debugging status bar background moved
from `#8e4421` to `#643017` so the grey text keeps 7.03:1 there (rule: change the background when the
foreground is shared).

Costs accepted: the theme departs from the Windows High Contrast convention of pure white on black, and
users who want that can still raise `editor.foreground` in their settings. The selection fill drops from
2.996:1 to 1.96:1 against black because a fill carrying 7:1 text of luminance L can reach at most
(L + 0.05) / 7 - 0.05; at L = 0.639 for `#d2d2d2` that is 0.0484, so `#004913`. Secondary text on a
hovered row measures 5.10:1 (before: 5.4:1 with the old fill), unchanged in kind. Colored list labels on a
hovered row improve: untracked `#73c991` goes from 3.50:1 to 5.35:1 and modified `#e2c08d` from 4.06:1 to
6.20:1, still under 7:1 for the duration of the hover.

### Terminal tiers and extension ids gated (2026-09-18)

The text tier left two ungated areas. The sixteen ANSI colors kept the classic xterm values, five of them
under the 7:1 floor, and relied on `terminal.integrated.minimumContrastRatio`. That setting defaults to
4.5:1 (AA, not AAA), can be set to 1 by the user, and a theme should not override it through
`contributes.configurationDefaults` because that would change the user's setting under every other theme
as well. The ANSI colors are now shipped at their target ratio and gated as text against
`editor.background`, with one exception: `ansiBlack` stays `#000000` because it is the terminal's own
background and only renders as an inverse-video or background color; lifting it to grey would break
black-on-colored text in programs that draw it.

The tiers follow the same principle as the rest of the palette: the normal tier sits at the floor and the
bright tier is at least 10:1, so a program that uses bold or bright for emphasis still gets a visible step
without exceeding the 14:1 ceiling. Every value keeps its xterm hue; only lightness moved
(`nudgeToContrast` up, `capToContrast` down):

| Id                  | Before    | Ratio | After     | Ratio |
| ------------------- | --------- | ----- | --------- | ----- |
| `ansiRed`           | `#cd0000` | 3.60  | `#ff5e5e` | 7.01  |
| `ansiBlue`          | `#0000ee` | 2.23  | `#8888ff` | 7.01  |
| `ansiMagenta`       | `#cd00cd` | 4.48  | `#ff29ff` | 7.01  |
| `ansiCyan`          | `#00cdcd` | 10.61 | `#00a6a6` | 7.01  |
| `ansiYellow`        | `#ffb000` | 11.46 | `#c78900` | 7.01  |
| `ansiBrightBlack`   | `#7f7f7f` | 5.24  | `#959595` | 7.01  |
| `ansiBrightRed`     | `#ff0000` | 5.25  | `#ff9696` | 10.05 |
| `ansiBrightBlue`    | `#5c5cff` | 4.43  | `#ababff` | 10.00 |
| `ansiBrightMagenta` | `#ff00ff` | 6.70  | `#ff85ff` | 10.05 |
| `ansiBrightGreen`   | `#00ff41` | 15.38 | `#00f33e` | 13.89 |

`ansiGreen` (`accent.border`, 7.01), `ansiWhite` (`text.secondary`, 10.02), `ansiBrightWhite`
(`text.primary`, 13.89), `ansiBrightCyan` (`#00eaea`, 13.96) and `ansiBrightYellow` (`#d9d900`, 13.88)
were already in band. Cyan and yellow were lowered although they passed the floor: with both tiers between
10:1 and 14:1 the normal and bright colors collapsed under color vision deficiency (amber `#ffb000` vs
`#d9d900` delta E 4.8 under deuteranopia, `#00cdcd` vs `#00eaea` 9.4). Normal yellow therefore no longer
shares the `accent.secondary` role. Each hue's two tiers and the three greys are `DISTINGUISHABLE_GROUPS`
entries; the smallest separation after the change is delta E 10.5 (cyan tiers, normal vision) and 22.4
under any dichromacy for the two hues that had failed.

The pair list also gained the extension ids the theme ships. GitLens decorations, blame text and the
graph's change counts are `text`; icons, launchpad indicators, timeline bars, graph lanes and minimap or
scroll markers are `ui` like chart series; the blame overview ruler mark is `mark`; translucent fills are
not gated. Error Lens messages are `text`, its status bar icons `ui`, and the four remaining Markdown
alert colors are `text`. Of the 74 GitLens ids, 30 sat under 7:1 and 14 under 4.5:1 before the change.
`pnpm audit:contrast --fix` repaired the 17 failing pairs in one pass because every extension id is a hex
literal; two translucent foregrounds were set by hand. The two greys in the blame gutter
(`gitlens.gutterForegroundColor` `#bebebe`, 11.30) and trailing line (`text.secondary`) now match the
core blame decoration.

| Id                                                              | Before      | Ratio | After            | Ratio |
| --------------------------------------------------------------- | ----------- | ----- | ---------------- | ----- |
| `gitlens.decorations.deletedForegroundColor` and 3 siblings     | `#c74e39`   | 4.58  | `#d67d6d`        | 7.01  |
| `gitlens.decorations.branchAheadForegroundColor` and 2 siblings | `#12ff60`   | 15.50 | `#00f350`        | 13.94 |
| `gitlens.graphChangesColumnAddedColor`                          | `#347d39`   | 4.14  | `#46a94d`        | 7.04  |
| `gitlens.graphChangesColumnDeletedColor`                        | `#c93c37`   | 4.19  | `#da7a76`        | 7.03  |
| `gitlens.closedAutolinkedIssueIconColor`, merged PR icon        | `#8945ff`   | 4.36  | `#8c49ff`        | 4.51  |
| `gitlens.timelineDeletionsColor`                                | `#c3202d`   | 3.56  | `#dd2d3b`        | 4.51  |
| Minimap and scroll remote branch markers                        | `#2b5e88`   | 3.06  | `#3779ae`        | 4.51  |
| Minimap and scroll tag markers                                  | `#6b562e`   | 3.00  | `#8c713c`        | 4.54  |
| `gitlens.lineHighlightOverviewRulerColor`                       | `#00bcf299` | 3.76  | `#00bcf2b3`      | 4.87  |
| `gitlens.trailingLineForegroundColor`                           | `#99999999` | 3.13  | `text.secondary` | 10.02 |
| `errorLens.errorForegroundLight`                                | `#e45454`   | 5.69  | `#e97171`        | 7.07  |

The pair list grew from 190 to 294 pairs. The theme keeps its departure from the Windows High Contrast
pure-white convention; the README now explains why and gives a `workbench.colorCustomizations` override
for readers who prefer white.

### Why the fill is `#004913` and the selected text is `text.primary`

Text at 7:1 and a visible fill against black pull in opposite directions: a fill that carries 7:1 text
of luminance L can reach at most (L + 0.05) / 7 - 0.05 against black. With white text that bound was 3:1
and the 0.1.0 fill `#00681b` sat at 2.996:1; with `#d2d2d2` the bound is 1.96:1 and the fill is
`#004913` (text 7.08:1). Text is the hard gate, so the fill gives way. Ratios in this document are never
rounded up. Keeping syntax colors on selected text is not possible at 7:1 either: even the near-black
`#00290a` leaves comments at 5.68:1 and keywords at 5.39:1, so `editor.selectionForeground` and
`terminal.selectionForeground` are `text.primary`. Inactive selection is the fill at 70% alpha, which
composites darker and raises the text ratio to 9.36:1. Colored list labels on a hovered row (git untracked
`#73c991` 5.35:1, modified `#e2c08d` 6.20:1) drop below 7:1 for the duration of the hover; this was
accepted as a tradeoff for a single fill color. The table below is the original white-text sweep.

| Fill candidate | Fill on black | White on fill | Untracked `#73c991` on fill | Modified `#e2c08d` on fill |
| -------------- | ------------- | ------------- | --------------------------- | -------------------------- |
| `#00330d`      | 1.48          | 14.20         | 7.09                        | 8.22                       |
| `#003b00`      | 1.63          | 12.92         | 6.45                        | 7.48                       |
| `#004d13`      | 2.07          | 10.14         | 5.07                        | 5.87                       |
| `#00681b`      | 2.996         | 7.01          | 3.50                        | 4.06                       |
| `#00701d`      | 3.34          | 6.30          | 3.15                        | 3.65                       |

The border tier is not the 4.5:1 minimum for two reasons. At 4.5:1 it lands delta E 3.0 from the gutter
"added" marker `#4b8302`, and at 8.5:1 it lands delta E 5.65 from the amber focus ring under
deuteranopia. The sweep below shows 7:1 is the only band that clears both, provided the chat "lines
added" color is unified onto the standard added green `#89d185` (it was `#54b054`, delta E 8.2 from
the tier).

### Border tier sweep, hue of `#00ff41` (worst-case delta E across normal vision and three dichromacies)

| Tier ratio | Hex       | vs `#89d185` added | vs `#73c991` untracked | vs `#4b8302` gutter | vs `#54b054` chat | vs `#00ff41` primary | vs `#ffb000` amber |
| ---------- | --------- | ------------------ | ---------------------- | ------------------- | ----------------- | -------------------- | ------------------ |
| 4.5        | `#008823` | 29.07              | 25.07                  | 3.03                | 14.93             | 43.93                | 31.35              |
| 6          | `#00a029` | 23.27              | 17.89                  | 8.42                | 8.65              | 34.63                | 20.02              |
| 7          | `#00ad2c` | 21.23              | 15.06                  | 11.59               | 8.15              | 29.70                | 13.97              |
| 8.5        | `#00c031` | 20.13              | 13.33                  | 17.86               | 11.80             | 22.62                | 5.65               |
| 10         | `#00d035` | 21.05              | 14.59                  | 23.53               | 16.60             | 16.76                | 2.73               |

## Green candidates measured

All bright neon greens reach about 15:1 on black; the deciding factor is separation from colors the theme
already uses for meaning. Threshold is delta E 10, worst case across normal vision, protanopia,
deuteranopia and tritanopia.

| Candidate                                 | Hex       | Ratio | Worst semantic separation      | Verdict                                    |
| ----------------------------------------- | --------- | ----- | ------------------------------ | ------------------------------------------ |
| Neon green (Wikipedia, "Hacker Matrix")   | `#39ff14` | 15.49 | 19.76 vs warning `#ffd370`     | Passes, widest margin, less canonical      |
| P1 phosphor green (SuperUser, htmlcolors) | `#33ff33` | 15.49 | 14.43 vs warning               | Passes                                     |
| Pure green / xterm bright green           | `#00ff00` | 15.30 | 20.63 vs warning               | Passes                                     |
| Matrix Code Green "Erin"                  | `#00ff41` | 15.38 | 10.34 vs warning               | **Chosen**: canonical hex, passes          |
| IBM 3278 Reborn (cool-retro-term)         | `#3cff7a` | 15.78 | 10.09 vs warning               | Passes at the edge                         |
| Apple ][ (cool-retro-term)                | `#4dff6b` | 15.83 | 3.45 vs warning (deuteranopia) | Rejected                                   |
| Matrix Theme focus green (UstymUkhman)    | `#88ff88` | 16.71 | 9.13 vs warning (protanopia)   | Rejected                                   |
| Hack The Box bright                       | `#c5f467` | 16.51 | 4.56 vs warning                | Rejected                                   |
| Hack The Box                              | `#9fef00` | 14.82 | 10.27 vs added `#89d185`       | Passes at the edge, yellow-green off-theme |
| Dracula                                   | `#50fa7b` | 15.30 | 7.79 vs warning                | Rejected                                   |
| Spring green                              | `#00ff7f` | 15.61 | 8.58 vs warning                | Rejected                                   |
| GitHub Dark success                       | `#3fb950` | 8.27  | 15.60                          | Passes, too muted for an accent            |
| Nord, One Dark, Everforest, Catppuccin    | various   | 10-14 | 2.3 to 8.3 vs added `#89d185`  | Rejected, indistinguishable from "added"   |
| Matrix mid green                          | `#008f11` | 4.94  | 27.38                          | Rejected, fails 7:1                        |

## Secondary candidates measured

| Family  | Candidate                                    | Hex       | Ratio    | Worst vs `#00ff41` | Worst vs semantics                    | Verdict                                                |
| ------- | -------------------------------------------- | --------- | -------- | ------------------ | ------------------------------------- | ------------------------------------------------------ |
| Amber   | P3 amber phosphor                            | `#ffb000` | 11.46    | 15.79              | 18.21 vs error `#f48771`              | **Chosen**: authentic pairing, single tier serves text |
| Amber   | Amber (Wikipedia)                            | `#ffbf00` | 12.70    | 16.40              | 3.27 vs warning border `#ffcc00`      | Rejected                                               |
| Amber   | cool-retro-term amber                        | `#ff8100` | 8.39     | 17.19              | 9.75 vs error                         | Rejected                                               |
| Amber   | Current orange                               | `#f38518` | 8.18     | 16.46              | 7.08 vs error (tritanopia)            | Rejected                                               |
| Pink    | Hot pink                                     | `#ff0090` | 5.65     | 64.39              | 17.32                                 | Passes as UI only; needs `#ff4fb2` (7.01) for text     |
| Pink    | Dracula pink                                 | `#ff79c6` | 8.80     | 75.71              | 11.12 vs error                        | Passes                                                 |
| Magenta | Web magenta                                  | `#ff00ff` | 6.70     | 119.73             | 1.01 vs info `#59a4f9` (deuteranopia) | Rejected                                               |
| Purple  | Dracula, Tokyo Night, Catppuccin, HTB violet | various   | 3.9-10.3 | 30-94              | 1.8 to 9.3 vs info                    | Rejected                                               |
| Cyan    | Web cyan                                     | `#00ffff` | 16.75    | 15.94 (tritanopia) | 25.49                                 | Passes, least thematic                                 |
| Cyan    | Current cyan                                 | `#6fc3df` | 10.55    | 24.11              | 9.75 vs info (tritanopia)             | Rejected                                               |
| Yellow  | Gold, Trinity glint                          | `#ffd700` | 14.97    | 7.72               | 2.80 vs warning                       | Rejected                                               |

Amber neighbours that are not gated: `#ffb000` is delta E 6.88 from the warning border `#ffcc00`, 8.86 from
the symbol-icon orange `#ee9d28` and 3.52 from the GitLens attention yellow `#d8af1b`. None of these
render as a focus ring or border, and each carries a shape, so color is not their only signal.

## Sources

Matrix palette: schemecolor "Matrix Code Green" (`#00FF41`, `#008F11`, `#003B00`, `#0D0208`),
colorpickerweb "The Hacker Matrix" (`#39FF14` + `#00FF41` on black), Rezmason digital rain configuration
(hue 108 to 144 depending on film), FrameThrower frame analysis of the 1999 film (muted olive greens).
Phosphors: Wikipedia "Phosphor" (P1 525 nm green, P3 602 nm amber, P39 long persistence), "VT220"
(white, green or amber tubes), "Monochrome monitor"; hex approximations from the SuperUser phosphor
thread via retrocomputing.stackexchange and htmlcolors palette 96; cool-retro-term
`ApplicationSettings.qml`. Themes: HackTheBox (`#9FEF00`), UstymUkhman Matrix Theme (`#00CC00`,
`#88FF88`), Quiet Hacker (`#00FF41`), Durgonix (`#00FF41`), Dracula, Monokai, Tokyo Night, Gruvbox, Nord,
One Dark, GitHub Primer primitives 7.15, Solarized, Catppuccin, Everforest, Kanagawa. Color vision
guidance: Okabe and Ito, Color Universal Design (magenta or purple with green is a safe pairing; green
with orange is confusable at low saturation); Claus Wilke, Fundamentals of Data Visualization; Datawrapper
"visualizing data for colorblind readers"; Wikipedia "Color blindness".

### Unfilled hover and overlays behind code (2026-09-22)

An AAA scan found that the hover fill left colored labels on hovered rows under AA: git deleted and
conflicting `#d67d6d` at 3.57:1, invalid items 3.74:1, links 4.06:1, errors 4.36:1 and descriptions 5.10:1.
The `#00330d` alternative still leaves deleted labels at 4.74:1. Deleted and conflicting sit at 7.01:1 on
black, so no fill can hold them at 7:1. `list.hoverBackground`, `modernTab.hoverBackground`,
`modernEditorTab.hoverBackground` and `modernEditorTab.activeHoverBackground` are now transparent and hover
is the High Contrast dashed `contrastActiveBorder` outline; every colored label is paired on the hover
background so a future fill is gated for all of them.

The dimmest syntax token (`#ff7474`) sits at 8.00:1 on black, so an overlay behind code has almost no
luminance budget. The chat find match (`#ea5c00aa`, body text 4.50:1, tokens 2.59:1) and the merge editor
tints (tokens down to 3.95:1) were lowered in alpha, and the two opaque base tints darkened, hue kept, until
the dimmest token measures at least 7:1. The merge editor paints the word tint over the line tint, so the
alpha is split between the two layers (`#9bb9550e` and `#9ccc2c0f`, 7.04:1 stacked). The gate now measures
every token on each overlay stack in `TOKEN_OVERLAYS` (`scripts/pairs.ts`). The unfocused conflict outlines
became opaque (`mark.passive` 5.03:1, `#a36a00` 4.62:1).

Covered and uncovered code shared the `accent.border` outline, so the editor could not show coverage
(WCAG 1.4.1), and the gutter green `#89d185` against salmon `#f48771` was delta E 8.39 under deuteranopia.
Uncovered code now uses the ANSI blue tier (`#8888ff` outline and minimap, `#8585ff` gutter at 6.80:1) and
the covered gutter moves into the mark band (`#45a83f`, 6.93:1); the three pairs are distinguishability
groups.

### Focus appearance, secondary overlays and graph lanes (2026-09-22)

VS Code draws the input, dropdown and checkbox focus ring as a 1px outline over the border pixels, so
WCAG 2.4.13 reduces to a 3:1 change between the ring and the border. Over the 7:1 `accent.border` the amber
ring changed them by only 1.63:1. Keeping 3:1 over a 4.5:1 border needs an amber of at least 13.5:1;
`#ffc94f` (13.72:1) reaches it but lands delta E 1.06 from the Matrix green find outline under
deuteranopia and 1.31 from the warning squiggle, so the amber stays `#ffb000`. The new `accent.boundary`
`#007a1f` (3.80:1) sits at the WCAG 1.4.11 floor instead and the ring changes it by 3.01:1. It is gated
as the `boundary` kind (3:1 floor), together with the ring-over-border pairs. `accent.border` keeps 7:1 for
ambient borders and the terminal. The gutter "added" marker rises to `#5ba002` (6.47:1, hue kept) so it
stays delta E 16.5 from the boundary under every simulation.

Workbench `::selection` (hovers, chat, notifications) keeps the selected text's own color, and code or
links fell to 4.08:1 on `#004913`. It now uses `accent.fillDim` `#001806`, the darkest step of the same hue
at which every token and link keeps 7:1. The editor and terminal selections keep `accent.fill` because they
force `text.primary`.

The remaining overlays behind code (stack frames, hover and linked editing highlights, snippet tabstops,
the GitLens line highlight) were lowered in alpha until the dimmest token keeps 7:1, and are listed in
`TOKEN_OVERLAYS`. Error Lens paints a range tint over its line tint; with any range alpha the stack drops
tokens below 7:1, so the range tints are transparent and the line tint and squiggle mark the range. The
Error Lens message colors were lightened (hue kept) to 7:1 on the line and message tints, and their pairs
now measure that stack. The terminal link hover tint is transparent because the normal ANSI tier sits at
the 7.01:1 floor; the hovered link keeps its underline.

GitLens graph lanes 1 and 5 were delta E 0.71 apart under deuteranopia. The ten lanes keep their hues and
move lightness only; a coordinate search over lightness within the UI band raised the minimum separation
across normal vision and the three simulations to 15.3, and the lanes are now a distinguishability group.

### No light fills, focus versus selection, cross-hue ANSI (2026-09-22)

No light background sits behind text, icons or glyphs any more. The suggest widget's inverted row is
gone: the selected suggestion keeps the widget background and is marked by `accent.primaryText` text,
an `accent.primary` outline and amber matched characters. The chat slash command and the profile badge
use `accent.primaryText` on `accent.fillDim`; gutter items are unfilled with `text.primary` glyphs; the
comment range bar is `mark.passive` with black glyphs (5.03:1), the same pattern as the disabled
checkbox. The terminal sticky scroll hover is transparent because any fill drops the 7:1 normal ANSI tier
below the floor. The SCM graph ref badges are the one exception: VS Code draws the badge fill and the
graph line with the same id, so a dark badge would leave the line under 3:1; the badges keep their light
ref colors with black labels at 7.07:1 or above. Remaining light colors are thumbs, marks, separators and
the progress bar, none of which carry text.

`contrastActiveBorder` (selected and hovered item outlines) moved from amber to `accent.primary`, so a
focused row and a selected row differ in color as well as dashed versus solid outline. Git conflicting
files use `accent.secondary` instead of the deleted color they shared.

Adding `ansiNormal` and `ansiBright` groups showed cross-hue minima of 4.45 (bright green versus bright
yellow under protanopia). With the tier order kept and green fixed to its roles, lightness alone reached
6.32, so yellow (41 to 25 degrees), bright cyan (180 to 166) and bright blue (240 to 234) moved hue; a
coordinate search over hue and lightness brought the minimum to 10.50. `charts.red` moved to `#dc3311` and
git modified and untracked to `#c58a32` and `#6ac68a` (lightness only), clearing the last
distinguishability warnings, including one the identical deleted and conflicting colors had masked.

### Green comments (2026-09-22)

Comments were sage `#83ab70` (8.02:1), whose 26% saturation read as grey next to the Matrix accents. They
now use the Matrix hue at 70% saturation, `#21b947` (8.10:1). The lightness stays at the 8:1 token floor
because every overlay behind code was tuned so the dimmest token keeps 7:1. Full saturation (`#00ba2f`)
made comments louder than the code around them. Documentation tags, `{Type}` expressions and parameter
names in JSDoc, Javadoc, PHPDoc and Doxygen blocks are a brighter step of the same hue, `#27d853` (11.03:1,
delta E 11.3 from the comment body), so a doc block reads as one unit with visible structure. The log
output warn token moved from `#00ba00`, delta E 1.6 from the new comment green, to yellow `#caca00`
(11.96:1). Comments stay upright: italic hurts legibility in many monospace fonts. Python docstrings are
strings in the TextMate grammar and keep the string color.

## Follow-ups

- `scripts/audit/fix.ts` rewrites single- or double-quoted hex literals, but not role references such as
  `text.primary`; a failing role has to be changed in `src/palette.ts` by hand. The gate is unaffected.
- `terminal.ansiBlack` is the only ANSI color outside the gate. A program that draws black text on the
  black terminal background still depends on `terminal.integrated.minimumContrastRatio`.
- Extension ids are gated against `editor.background` and `sideBar.background`. GitLens renders its graph
  in a webview whose background follows the theme's `editor.background`, so the measurement holds today;
  it would need a `backdrop` if GitLens ever introduced its own surface color.
