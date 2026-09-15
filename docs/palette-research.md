# Accent palette research: Matrix Code Green and P3 amber

Decision record for the 0.1.0 accent remodel. The theme moved from VS Code's Dark High Contrast accents
(cyan `#6fc3df` borders, orange `#f38518` focus) to a green primary in the style of hacker terminals and
the Matrix films, with an amber secondary. Every ratio and delta E below was produced by scripts that
import `scripts/color/`; nothing was computed by hand. The chosen values live in `src/palette.ts`.

## Roles

| Role                                                               | Value     | Ratio on `#000000` | Basis                                                                        |
| ------------------------------------------------------------------ | --------- | ------------------ | ---------------------------------------------------------------------------- |
| Primary: highlights, find matches, minimap selection, bright green | `#00ff41` | 15.38              | "Matrix Code Green" fan palette; also Quiet Hacker and Durgonix themes       |
| Border: ambient borders, current line outline, normal green        | `#00ad2c` | 7.01               | Same hue as the primary, lightness lowered until 7:1                         |
| Secondary: focus rings, active indicators, active text             | `#ffb000` | 11.46              | P3 amber phosphor, the VT220 amber option that shipped alongside green tubes |
| Fill: text selection (white text) and hovered rows, tabs, items    | `#00681b` | 2.996              | Same hue darkened until white text reaches 7.01:1                            |

### Why the fill is `#00681b` and the selected text is white

White text at 7:1 and a visible fill against black pull in opposite directions: 21 / 7 = 3, so a fill
that carries 7:1 white text can reach at most 3:1 against black, and no 8-bit green hex lands on both
sides at once (a brute-force search of every hex with red < 64, green 64 to 159 and blue < 96 found none).
`#00681b` is the closest point: white 7.0095:1, fill 2.996:1, just under the WCAG 1.4.11 AA floor for a
component state. Text is the hard gate, so the fill gives way. Ratios in this document are never rounded
up; earlier drafts showed the fill as 3.00 and were wrong. Keeping syntax colors on selected text is not
possible at 7:1 either: even the near-black `#00290a` leaves comments at 5.68:1 and keywords at 5.39:1,
so `editor.selectionForeground` and `terminal.selectionForeground` are white. Inactive selection is the
fill at 70% alpha, which composites darker and raises the white-text ratio. Colored list labels on a
hovered row (git untracked `#73c991` 3.50:1, modified `#e2c08d` 4.06:1) drop below 7:1 for the duration
of the hover; this was accepted as a tradeoff for a single fill color.

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

## Follow-ups

- The focus ring changes hue against the border but its luminance ratio to the border tier is 1.63:1,
  short of the 3:1 change WCAG 2.4.13 (Focus Appearance, AAA) asks for. VS Code's own Dark High Contrast
  theme has the same property. Reaching 3:1 would need a border tier near 4.5:1, which collides with the
  gutter "added" marker, or a much brighter secondary.
- Colored list labels on hovered rows fall below 7:1 on the fill (table above). A darker hover fill such
  as `#00330d` would keep them at 7:1 at the cost of a second palette role and a 1.48:1 hover fill.
- `scripts/audit/fix.ts` matches double-quoted values, while `src/` uses single quotes and now role
  references, so `--fix` cannot rewrite accent ids. The gate itself is unaffected.
