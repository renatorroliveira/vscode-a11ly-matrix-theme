# Accessibility for Visual Impairment in React — Reference Guide for Claude Code

> **Scope:** Web UIs built with React 18/19 (function components + hooks), with Next.js notes. Baseline: **WCAG 2.2 Level AA** (AAA noted where relevant), **WAI-ARIA 1.2 / APG**. This is a lookup reference. **Normative = hard requirement (WCAG SC cited). Best practice = recommended.**

---

## 0. Legal / Regulatory Context (brief)

- **WCAG** itself is not law; laws reference it. Build/test to **WCAG 2.2 AA** — it is backward compatible, so conformance satisfies every WCAG 2.1/2.0 AA obligation on the books.
- **ADA (US)** — Title II (state/local government) 2024 DOJ rule (published April 24, 2024) codifies **WCAG 2.1 AA**; entities ≥50,000 population must conform by **April 24, 2026**, smaller entities by **April 24, 2027** (a DOJ Interim Final Rule around April 2026 extended some compliance deadlines by roughly a year — but nondiscrimination obligations and private lawsuits continue during any extension). Title III (private "public accommodations") drives most private litigation; no codified technical standard, but courts reference WCAG 2.1 AA.
- **Section 508 (US federal)** — WCAG 2.0 AA (via the revised 508 refresh / EN alignment). HHS Section 504 rules require WCAG 2.1 AA for many funded healthcare providers by May 11, 2027.
- **EN 301 549 / European Accessibility Act (EAA)** — EAA enforceable since **28 June 2025**; references EN 301 549, which incorporates **WCAG 2.1 AA** and adds ICT hardware/software/documentation requirements.
- **AODA (Ontario, Canada)** — WCAG 2.0 AA.
- **State laws** — California Unruh Act ($4,000/violation statutory damages), Colorado HB21-1110, New York.

WCAG 2.2 (W3C Recommendation, 5 Oct 2023) added 9 SC (2 A, 4 AA, 3 AAA) and removed **4.1.1 Parsing**. New AA: **2.4.11 Focus Not Obscured (Min)**, **2.5.7 Dragging Movements**, **2.5.8 Target Size (Min)**; plus A: 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication. New AAA: 2.4.12, 2.4.13, 3.3.9. WCAG 2.2 has 86 success criteria total (55 at A/AA).

---

## 1. Color & Contrast

### Hard requirements
- **1.4.3 Contrast (Minimum) — AA:** text **4.5:1**; large text **3:1**. Large = ≥18pt (24px) regular OR ≥14pt (18.66px) bold.
- **1.4.11 Non-text Contrast — AA:** **3:1** for UI component states/boundaries (input borders, toggle states), focus indicators, and graphical objects required to understand content (icons, chart lines).
- **1.4.1 Use of Color — A:** color must never be the **only** means of conveying info (errors, required fields, links in body text, chart series). Pair with text/icon/underline/pattern.
- **1.4.6 Contrast (Enhanced) — AAA:** **7:1** normal, **4.5:1** large.

### The formula (WCAG 2.x)
`ratio = (L1 + 0.05) / (L2 + 0.05)` where L1/L2 are relative luminances of lighter/darker colors.
Relative luminance: linearize each sRGB channel (`c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`), then `L = 0.2126*R + 0.7152*G + 0.0722*B`. Range 1:1 → 21:1. The 4.5:1 threshold derives from research: a user with 20/40 acuity needs ~3:1 × 1.5 contrast-sensitivity loss = 4.5:1 (Arditi-Faye); 20/80 → ~7:1 (basis for 1.4.6 AAA).
**Do not round up:** `#777777` = 4.47:1 **fails** 4.5:1. Low contrast is the single most common failure — WebAIM's 2024 Million analysis found low-contrast text on **83.6%** of home pages.

### APCA / WCAG 3 (emerging — NOT a requirement)
APCA (Advanced Perceptual Contrast Algorithm) is perceptually uniform, accounts for font size/weight, and is polarity-aware (swapping fg/bg changes the score). It was **exploratory** in the WCAG 3 draft and, per Adrian Roselli, was **pulled from the July 2023 WCAG 3 working draft** because exploratory content that doesn't gain working-group support within 6 months is removed; WCAG 3 remains an early Working Draft with no target date. **Do not conform to APCA alone for compliance.** If you use APCA (it handles dark mode far better than WCAG 2, which overstates contrast near black), also satisfy WCAG 2 ratios to limit legal risk. Rough APCA levels: Lc 60 ≈ body text, Lc 45 ≈ large/headings, Lc 30 ≈ minimum/placeholder/disabled, Lc 15 ≈ non-text.

### Disabled & placeholder states
- Disabled controls are **exempt** from 1.4.3 (inactive components) — but disabled state must not be the *only* signal, and low-contrast disabled text still hurts low-vision users. Best practice: keep disabled text ≥3:1, or use `aria-disabled` + a visible non-color pattern rather than truly greyed-out.
- **Placeholder text is NOT exempt** — it must meet 4.5:1. Never use a placeholder as the label.

### Tooling
- **axe-core** (Deque) / **@axe-core/react** — runtime DOM contrast checks.
- **Lighthouse** (Chrome DevTools) — contrast audit.
- **WebAIM Contrast Checker** — gold standard manual check.
- **Stark** (Figma/browser), **Polypane**, **Coloracci** — design-time.
- Note: automated tools can only check contrast where colors are computable (not over images/gradients).

### Design-token approach (recommended)
Guarantee contrast at the token layer so components can't drift out of compliance:

```ts
// tokens.ts — semantic tokens, each pair pre-verified ≥4.5:1 (text) / ≥3:1 (UI)
export const light = {
  '--fg': '#1a1a1a',        // on --bg → 16.1:1
  '--bg': '#ffffff',
  '--fg-muted': '#595959',  // on --bg → 7.0:1 (safe for secondary text)
  '--accent': '#0b5fff',    // on --bg → 5.6:1
  '--border': '#767676',    // ≥3:1 for non-text (1.4.11)
} as const;
export const dark = {
  '--fg': '#f2f2f2',        // on --bg → 15.8:1
  '--bg': '#121212',
  '--fg-muted': '#a6a6a6',
  '--accent': '#8ab4ff',
  '--border': '#8c8c8c',
};
```
- **Tailwind:** map semantic tokens to CSS variables (`text-fg`, `bg-bg`) rather than raw palette classes; add a CI contrast test over token pairs. Do NOT hand-pick `text-gray-400` per component.
- **CSS-in-JS:** expose only semantic tokens from the theme; never accept arbitrary color props on primitives.
- Add a unit test that computes contrast for every fg/bg token pair and fails the build below threshold.

**Do / Don't**
- ✅ Convey state with icon+text+color together.
- ✅ Give focus rings and icon buttons ≥3:1 against **all** adjacent backgrounds.
- ❌ Don't put text on busy images without a scrim/backplate.
- ❌ Don't ship `#999` body text on white (2.85:1).

---

## 2. Dark Mode, Forced Colors & User Preferences

### Theme strategy
1. Support `system` (default), `light`, `dark`. Detect system via `prefers-color-scheme`.
2. Let users override; persist to `localStorage` (and mirror to a cookie if you SSR per-request).
3. Set the CSS **`color-scheme`** property (`:root { color-scheme: light dark }` or per-theme) so native form controls, scrollbars, and the UA render correct colors.
4. **Verify contrast in BOTH themes** — WCAG 2 ratios overstate contrast on near-black backgrounds, so dark themes often *look* fine but fail; re-check every token pair.

### Avoiding the flash of wrong theme (FOUC) in React/Next.js
The server doesn't know client theme → default HTML renders light → hydration flips to dark = flash. **Fix: run a tiny blocking inline script in `<head>` before paint** that reads storage/system and sets the class + `color-scheme` on `<html>`.

```tsx
// Next.js App Router: app/layout.tsx
const themeScript = `(function(){try{
  var t = localStorage.getItem('theme') || 'system';
  var d = t === 'dark' || (t === 'system' &&
    matchMedia('(prefers-color-scheme: dark)').matches);
  var r = d ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', d);
  document.documentElement.style.colorScheme = r;
}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
```
- Use `suppressHydrationWarning` on `<html>` because the script mutates it pre-hydration. In React 19 App Router you can also inject via `useServerInsertedHTML` to avoid warnings.
- **Recommended:** use **`next-themes`** (`ThemeProvider`, `enableColorScheme`, `enableSystem`) which injects the blocking script during SSR, syncs across tabs, and prevents flash for both SSR & SSG. Delay rendering theme-toggle UI until mounted to avoid hydration mismatch.
- In pure React (Vite), inject the same script in `index.html`.

### Forced Colors / Windows High Contrast Mode
`@media (forced-colors: active)` — the OS enforces a limited user-chosen palette. The browser **overrides** author colors for text, backgrounds, and borders, **forces `box-shadow` to none**, and neutralizes some background images. It maintains layout but changes colors, and also sets an appropriate `prefers-color-scheme` value from the Canvas lightness. Usage context: Microsoft's Melanie Richards (Edge PM) stated at View Source Conference (Sept 30, 2019) that **"4% of all Windows machines run under WIN HCM"** (also noted in W3C CSSWG minutes); and **more than 50% of low-vision users use High Contrast Mode** per WebAIM's 2018 Survey of Users with Low Vision (a self-selecting, savvy group).

Rules:
- **Don't rely on `box-shadow`/background-color alone** for borders/state — they vanish. Add a real `border` (often `transparent`) that becomes visible in forced colors.
- Use **CSS system color keywords**: `Canvas`, `CanvasText`, `ButtonFace`, `ButtonText`, `LinkText`, `Highlight`, `HighlightText`, `GrayText`, `Field`, `FieldText`.
- Use `forced-color-adjust: none` **only** sparingly (e.g., a color swatch that must keep its color).
- Test: Edge/Chrome DevTools → Rendering → emulate `forced-colors`. Firefox has its own forced-colors mode independent of the OS.

```css
button { background: var(--accent); color: #fff; border: 1px solid transparent; }
@media (forced-colors: active) {
  button { border-color: ButtonText; } /* guarantee a visible edge */
}
```

### Other preference media queries
- **`prefers-contrast`** (`more` | `less` | `custom` | `no-preference`) — Baseline since May 2022. On Windows, forced-colors + prefers-contrast overlap (forced-colors resolves to `custom`); on macOS "Increase contrast" maps to `more`. Use `@media (prefers-contrast: more)` to thicken borders / darken text. (Note: `prefers-contrast: forced` was dropped as a mistake — use `forced-colors: active` for forced palettes.)
- **`prefers-reduced-transparency`** — reduce backdrop-blur/translucency so overlaid text stays legible.
- **`prefers-reduced-motion`** — see §7.

**Do / Don't**
- ✅ Set `color-scheme`; re-audit contrast per theme; add a transparent border for forced colors.
- ❌ Don't make the theme script async (async = flash).
- ❌ Don't hard-code white text with no forced-colors fallback.

---

## 3. Screen Reader Support

### First Rule of ARIA
**Use native HTML first.** *"If you can use a native HTML element or attribute with the semantics and behavior you require already built in, do so"* instead of repurposing a `<div>` + ARIA. Native `<button>`, `<a href>`, `<input>`, `<select>`, `<nav>`, `<main>`, `<dialog>` give you focus, keyboard, and role for free. Five rules of ARIA (summary): (1) prefer native; (2) don't change native semantics; (3) all interactive ARIA must be keyboard operable; (4) don't put `role="presentation"`/`aria-hidden="true"` on a focusable element; (5) every interactive element needs an accessible name.

### Accessible name & description computation
Precedence for **name**: `aria-labelledby` → `aria-label` → native (`<label>`, `alt`, `<caption>`, button text) → `title` (last resort). **Description**: `aria-describedby` (concatenates referenced elements' text). Use `useId()` (React 18+) to wire `htmlFor`/`id`/`aria-describedby` safely across SSR.

```tsx
function Field({ label, hint, error, ...props }: FieldProps) {
  const id = useId(), hintId = useId(), errId = useId();
  return (
    <>
      <label htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
      <input id={id} aria-describedby={`${hint ? hintId : ''} ${error ? errId : ''}`.trim()}
        aria-invalid={!!error} aria-required={props.required} {...props} />
      {hint && <p id={hintId}>{hint}</p>}
      {error && <p id={errId} role="alert">{error}</p>}
    </>
  );
}
```

### Landmarks & headings
- One `<main>`, one `<h1>` per page/view. Don't skip heading levels. Use `<header>/<nav>/<main>/<aside>/<footer>` (map to banner/navigation/main/complementary/contentinfo landmarks). Label duplicate landmarks (`<nav aria-label="Primary">`).

### Images / SVG / icons
- Informative `<img>`: meaningful `alt`. Decorative: `alt=""` (empty, not omitted). **1.1.1 Non-text Content (A).**
- Icon-only button: give the **button** an accessible name (`aria-label`), mark the SVG `aria-hidden="true"` / `focusable="false"`.
- Standalone informative SVG: `role="img"` + `<title>` (referenced via `aria-labelledby`) or `aria-label`.
- ❌ Never leave `alt` describing the file ("image", "IMG_1234").

### Hidden content
- **`aria-hidden="true"`** — removes from a11y tree but **still focusable/visible**; never on focusable elements.
- **Visually-hidden / `.sr-only`** — visible to SR, hidden visually. Use the clip pattern:
```css
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0 0 0 0); clip-path:inset(50%); white-space:nowrap; border:0; }
```
- **`inert`** — removes an entire subtree from focus + a11y tree + interaction. Supported in all major browsers. Use it on background content behind modals (more robust than `aria-hidden` alone, since it also blocks pointer/interaction).

### Live regions (common React failure points)
Live regions announce async changes **without moving focus** — satisfies **4.1.3 Status Messages (AA)**. `role="status"`/`aria-live="polite"` for non-urgent; `role="alert"`/`aria-live="assertive"` for urgent (errors) — use assertive sparingly (~90% polite). `aria-atomic="true"` reads the whole region; default `aria-relevant="additions text"` is usually right.

**The #1 React bug:** the live region element must **already exist in the DOM** and be empty; you then change its *text*. If you conditionally mount the region *with* its text at the same time, the SR fires no "text change" event → silence.

```tsx
// ✅ Reliable global announcer: region always mounted, text set after paint
function useAnnouncer() {
  const [msg, setMsg] = useState('');
  const announce = useCallback((m: string) => {
    setMsg(''); // clear first so identical consecutive messages re-announce
    requestAnimationFrame(() => setMsg(m));
  }, []);
  const Region = () => (
    <div aria-live="polite" aria-atomic="true" className="sr-only">{msg}</div>
  );
  return { announce, Region };
}
```
Pitfalls: (1) don't nest one live region inside another (JAWS double-speaks the parent's atomic content plus the child); (2) render the container always, gate only `textContent`; (3) on route change, **clear** stale live-region text in cleanup so it isn't spoken on the next screen; (4) libraries: `@react-aria/live-announcer` (`announce()`), `react-aria-live`.

### SPA route-change announcements & focus (React Router / Next.js)
Full-page loads announce the new title and reset focus; SPA route changes do neither. On each route change: (a) move focus to a `tabindex="-1"` main heading/region, and (b) update `document.title` and/or announce via a live region.

```tsx
function useRouteAnnounce(mainRef: React.RefObject<HTMLElement>) {
  const { pathname } = useLocation();               // Next.js: usePathname()
  useEffect(() => {
    const t = setTimeout(() => {
      const el = mainRef.current;
      if (el) { el.setAttribute('tabindex', '-1'); el.focus(); }
    }, 100); // let new content render first
    return () => clearTimeout(t);
  }, [pathname, mainRef]);
}
```
- Next.js App Router: set titles via the Metadata API; still add focus management + an announcer, since framework routing doesn't do it.

### Forms
- Every input has a programmatically associated `<label>` (**1.3.1, 3.3.2, 4.1.2**). Placeholder ≠ label.
- Errors: `aria-invalid="true"` + associate message via `aria-describedby` (widely supported) — `aria-errormessage` exists (ARIA 1.2) but AT support is weaker, so pair it with `aria-describedby` or use `role="alert"` on the message. **3.3.1 Error Identification (A)**, **3.3.3 Error Suggestion (AA)**.
- Use `autocomplete` tokens (**1.3.5 Identify Input Purpose, AA**), correct `type`/`inputmode`.
- Group radios/checkboxes in `<fieldset>` + `<legend>`.
- **3.3.8 Accessible Authentication (AA):** don't block paste on password fields; don't require solving puzzles/memory tests.

### Tables
- Data tables: `<table>` + `<caption>` + `<th scope="col|row">`. Don't use tables for layout. Complex tables: `headers`/`id`. Tables are exempt from **1.4.10 Reflow** but provide a responsive/scrollable wrapper.

### Data visualizations / charts
- Don't rely on color alone (1.4.1); use labels/patterns/direct labels. Chart lines/bars needed to understand data need **3:1** (1.4.11).
- Provide a text alternative: accessible summary + a data `<table>` (visually-hidden or toggle). For SVG charts, expose title/desc; consider `role="img"` with a full `aria-label` for simple charts, or a fully marked-up accessible structure for interactive ones.

### Screen reader / browser pairings to test (WebAIM Screen Reader User Survey #10, conducted Dec 2023–Jan 2024, 1,539 valid responses)
- **JAWS** primary for **40.5%**; **NVDA** primary for **37.7%**; **VoiceOver** primary **9.7%** on desktop. NVDA leads Europe/Asia/Africa; JAWS leads North America (55.5% vs 24.0%).
- Most common single pairing: **JAWS + Chrome (~24.7%)**, then **NVDA + Chrome (~21%)**; JAWS+Edge and NVDA+Firefox round out the top four — treat these as the manual-testing baseline.
- **VoiceOver + Safari** (macOS/iOS) — Safari best exposes the AX API. **86%** of SR users are on Windows.
- **Mobile:** 91.3% of respondents use a mobile screen reader; **VoiceOver dominates at 70.6%**, **TalkBack** regular use **34.7%** (pair TalkBack + Chrome on Android). **Narrator + Edge** for extra Windows coverage.

---

## 4. Keyboard Navigation

### Hard requirements
- **2.1.1 Keyboard (A):** all functionality operable by keyboard.
- **2.1.2 No Keyboard Trap (A):** focus can always move away (except intentional modal traps that Esc/close release).
- **2.1.4 Character Key Shortcuts (A):** single-character shortcuts must be remappable, or only active on focus, or have a toggle.
- **2.4.3 Focus Order (A):** logical, meaningful order.
- **2.4.7 Focus Visible (AA):** visible focus indicator (stays AA in 2.2 — the planned promotion to A was reverted).
- **2.4.11 Focus Not Obscured (Minimum) (AA — NEW 2.2):** focused element not *entirely* hidden by sticky headers/footers. Fix commonly `scroll-padding-top: <header height>` on the scroll container. (2.4.12 AAA = not even *partially* obscured.)
- **2.4.13 Focus Appearance (AAA — NEW 2.2):** focus indicator ≥ area of a 2px-thick perimeter and ≥3:1 contrast against the unfocused state.
- **2.5.7 Dragging Movements (AA — NEW 2.2):** any drag operation needs a single-pointer alternative (click/tap buttons).
- **2.5.8 Target Size (Minimum) (AA — NEW 2.2):** interactive targets ≥ **24×24 CSS px** (or have ≥24px spacing / an exception). Add padding to small icon buttons — `padding:4px` on a 16px icon yields a 24px target.

### tabindex rules
- `tabIndex={0}` — add a custom element to natural tab order.
- `tabIndex={-1}` — focusable programmatically only (roving items, focus targets, scroll containers).
- **Never positive `tabindex`** — it wrecks order and is an anti-pattern.

### Focus indicators
- Use **`:focus-visible`** (shows ring for keyboard, not mouse click). Never `outline: none` without a replacement.
```css
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
:focus:not(:focus-visible) { outline: none; }
```
- `outline-offset` keeps the ring off the element (also helps 1.4.11 3:1). Shadows/glows beyond the solid outline aren't counted for contrast. Don't disable default focus styles.

### Skip link (2.4.1 Bypass Blocks, A)
```tsx
<a href="#main" className="sr-only focus:not-sr-only skip-link">Skip to main content</a>
// ...
<main id="main" tabIndex={-1}>…</main>
```

### Modals / dialogs
- **Prefer native `<dialog>` + `showModal()`** — provides focus trap, Esc-to-close, background inert, and `role="dialog"` semantics out of the box (2026 recommended default).
```tsx
function Dialog({ open, onClose, labelledBy, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal(); else if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-labelledby={labelledBy} onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      {children}
    </dialog>
  );
}
```
- If hand-rolling: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`; on open, save `document.activeElement`, move focus into dialog; **trap Tab/Shift+Tab**; set `inert` on background; on close, **restore focus** to the trigger. Use **`focus-trap-react`** or **`react-focus-lock`** (integrates with React concurrency, portals, and `inert`) rather than a fragile hand-written trap. Note: Adrian Roselli's testing shows initial dialog focus target matters — focusing a scrollable content region (`tabindex="0"`) or the heading behaves differently across NVDA/JAWS/VoiceOver; test it.

### Composite widgets — roving tabindex vs aria-activedescendant
- **Roving tabindex:** exactly one item has `tabIndex={0}`, the rest `-1`; arrow keys move focus and shift the `0`. Use for menus, tabs, radiogroups, toolbars, tree, grid.
- **`aria-activedescendant`:** real DOM focus stays on the container/input; the "virtual" focus id updates. **Required for combobox** (focus must stay in the textbox). Note: mobile SR support for activedescendant is weaker.
- Follow **APG** keyboard maps: Tab/Shift+Tab move *between* widgets; arrows move *within*; Enter/Space activate; Esc dismisses; Home/End; type-ahead where applicable.

```tsx
// Roving tabindex tablist skeleton
function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    let n = i;
    if (e.key === 'ArrowRight') n = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowLeft') n = i === 0 ? last : i - 1;
    else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = last;
    else return;
    e.preventDefault(); setActive(n); refs.current[n]?.focus();
  };
  return (
    <div role="tablist">
      {tabs.map((t, i) => (
        <button key={t.id} role="tab" id={`tab-${t.id}`}
          aria-selected={active === i} aria-controls={`panel-${t.id}`}
          tabIndex={active === i ? 0 : -1}
          ref={(el) => { refs.current[i] = el; }}
          onKeyDown={(e) => onKey(e, i)} onClick={() => setActive(i)}>
          {t.label}
        </button>
      ))}
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`} hidden={active !== i} tabIndex={0}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
```

### React specifics
- Focus with `useRef` + `useEffect`; for pre-paint focus use `useLayoutEffect` to avoid flicker.
- **Focus restoration after unmount:** capture trigger before opening; restore in cleanup.
- **Portals:** DOM order differs from the React tree; a portal renders elsewhere in the DOM, so ensure tab order and the focus trap account for it (React event bubbling still follows the React tree, which usually helps).
- **Events:** use **`onKeyDown`** (not deprecated `onKeyPress`). Use `e.key` (`'Enter'`, `'Escape'`, `'ArrowDown'`) not `keyCode`. Call `e.preventDefault()` for handled keys (e.g., Space to avoid scroll).
- Native `<button>` fires click on Enter/Space automatically; custom `role="button"` divs must handle both keys manually (prefer native).
- React 19: `ref` as a prop and cleanup functions returned from ref callbacks make focus management on mount/unmount cleaner; native form actions + `<dialog>` reduce custom JS.

### Native `popover` attribute (progressive enhancement)
The HTML `popover` attribute + `popovertarget` gives declarative show/hide, light-dismiss, top-layer stacking, and wires `aria-expanded` — 0 KB JS. Good for menus/tooltips where you don't need a full focus trap; use `<dialog>`/focus-lock for modals.

---

## 5. Accessible Design Patterns & Component Libraries

### Strategy recommendation
**Default: adopt a headless/accessible primitive library rather than hand-rolling.** Complex widgets (combobox, listbox, menu, grid, date picker) have deep AT edge cases across NVDA/JAWS/VoiceOver/mobile that take enormous effort to get right. Hand-roll only trivial patterns (disclosure, simple tabs) or when you need something no library provides.

### Library comparison (2025–2026)
- **React Aria / React Aria Components (Adobe)** — **deepest accessibility + i18n**, thoroughly tested across AT and platforms; strongest when WCAG conformance is contractual. Trade-off: more verbose, larger surface, heaviest bundle. Actively released through 2025 (multi-select in Select, tree drag-and-drop with full keyboard/SR support, Autocomplete to RC). **Best for accessibility-critical / enterprise.**
- **Radix UI Primitives** — pragmatic, composable, 30+ primitives, great DX; powers **shadcn/ui** (`@radix-ui/react-slot` alone ~131M weekly downloads mid-2026). Accessible for the vast majority of cases. Now maintained by WorkOS; update velocity on some complex components (combobox/multi-select) has slowed. **Best default for building a design system.**
- **Headless UI (Tailwind Labs)** — small (~10 components), gentle learning curve, Tailwind-first. **Best for Tailwind app teams needing common components fast.**
- **Ariakit** — modern React patterns, ARIA-compliant primitives, lower-level building blocks; showcased at React Advanced 2025 for building WCAG-standard custom components. Growing adoption.
- **Base UI (MUI team)** — newer headless primitives, iterating fast on brand-new patterns.
- **shadcn/ui** — copy-in components built on Radix (or Base UI) + Tailwind; you own the code. Accessibility inherited from the underlying primitive — **you must preserve it during customization.**
- **Chakra UI** — styled component library with decent built-in a11y; less "headless."

**Caveat for ALL:** a library gives you accessible *behavior*, but you can still break it — removing focus styles, wrong `aria-label`, bad contrast tokens, nesting interactive elements. Test the composed result.

### Pattern quick-reference (APG)
- **Dialog/modal** → `role="dialog"` + `aria-modal` + focus trap + Esc + restore; native `<dialog>`.
- **Alert dialog** → `role="alertdialog"` + `aria-describedby`; focus the safest/cancel action.
- **Menu button** → `aria-haspopup="menu"` + `aria-expanded`; arrow-key roving; Esc closes and restores focus to button.
- **Combobox/autocomplete** → `role="combobox"` + `aria-expanded` + `aria-controls` + `aria-autocomplete`; `aria-activedescendant` (focus stays in input); options `role="option"` + `aria-selected`.
- **Listbox/select** → `role="listbox"`/`option`, roving or activedescendant; type-ahead.
- **Tabs** → `tablist`/`tab`/`tabpanel`, roving tabindex (see code above).
- **Accordion / Disclosure** → button with `aria-expanded` controlling a region (`aria-controls`).
- **Tooltip** → `role="tooltip"` + `aria-describedby`; must satisfy 1.4.13 (below).
- **Toast/notification** → `role="status"` (polite) or `role="alert"` (assertive); don't steal focus; give pause/dismiss and enough time (2.2.1).
- **Switch** → `role="switch"` + `aria-checked` (or native `<input type="checkbox" role="switch">`).
- **Checkbox/radio groups** → native inputs in `<fieldset>`/`<legend>`; radios use roving/arrow keys.
- **Slider** → `role="slider"` + `aria-valuemin/max/now/text`; arrow keys; native `<input type="range">` preferred.
- **Tree view** → `role="tree"`/`treeitem`, `aria-expanded`, arrow-key nav, roving tabindex.
- **Data grid/table** → `role="grid"` for interactive; arrow-key cell nav; otherwise semantic `<table>`.
- **Breadcrumb** → `<nav aria-label="Breadcrumb">` + ordered list + `aria-current="page"`.
- **Pagination** → `<nav aria-label="Pagination">`; `aria-current="page"`.
- **Carousel** → pause/stop control (2.2.2); tab/arrow nav; announce slide changes politely.
- **Date picker** → grid pattern; extremely hard to hand-roll — use React Aria/Radix.

---

## 6. Magnification Software & Focus/Caret Tracking (CRITICAL for low vision)

Screen magnifiers (ZoomText/Fusion by Freedom Scientific/Vispero, Windows Magnifier, macOS Zoom, MAGic, SuperNova, plus browser zoom) enlarge a slice of the screen and **pan the viewport to follow** the mouse pointer, the **keyboard focus**, and the **text caret (insertion point)**. Ranges of 1×–16× are common (ZoomText up to 36×, up to 60× on some Windows builds); at high zoom only a small fraction of the screen is visible, so *where* the magnifier pans is everything.

### How magnifiers know where to pan (the accessibility APIs)
- **Windows — WinEvents (MSAA/UIA layer):** magnifiers hook **`EVENT_OBJECT_FOCUS` (0x8005)** — "an object has received the keyboard focus" — and **`EVENT_OBJECT_LOCATIONCHANGE` (0x800B)**, which the system fires for the **caret/cursor** among other elements (per Microsoft Learn, "Event Constants (Winuser.h)"). The classic system caret (`OBJID_CARET`) fires LOCATIONCHANGE so the magnifier gets the insertion-point rectangle.
- **Windows — IAccessible2 (rich text in browsers/Office/editors):** the caret is exposed via `IAccessibleText` — event **`IA2_EVENT_TEXT_CARET_MOVED`** ("When the new caret position differs from the old one … this is notified to the accessibility event listeners with an IA2_EVENT_TEXT_CARET_MOVED event"), plus `caretOffset` and `characterExtents` (the on-screen bounding rect the magnifier pans to).
- **macOS — AX API:** `kAXFocusedUIElementChangedNotification` ("the focused accessibility object has changed") and `kAXSelectedTextChangedNotification` ("a different set of text was selected"); pixel position via `kAXBoundsForRangeParameterizedAttribute`.
- These fire **only for real, focusable, native/AT-exposed elements**. Chromium mirrors this: it fires `EVENT_OBJECT_FOCUS` on Windows and `AXFocusedUIElementChanged` on Mac for focus changes.

**Consequence:** A CSS/JS-drawn "fake" caret or a non-focusable custom widget (a `<div>` with click handlers, no `tabindex`, no role) is **invisible to these APIs** → no event fires → the magnified viewport **does not follow** the user. Real-world proof: VS Code's custom-drawn caret historically didn't notify the accessibility API, so Windows Magnifier couldn't follow it while typing — whereas Notepad (real system caret) tracks correctly (Microsoft VS Code issue #29253). (The exact statement "Magnifier consumes EVENT_OBJECT_LOCATIONCHANGE" is a well-supported inference from the WinEvent caret docs + this bug, not a single verbatim Microsoft sentence.)

### Vendor "follow" behavior
- **Windows Magnifier** (Settings → "Have my Magnifier follow"): independent checkboxes for **Mouse pointer, Keyboard focus, Text cursor, and Narrator cursor** — each maps to the APIs above (Microsoft Support).
- **ZoomText/Fusion (Freedom Scientific/Vispero):** "focus, caret, and cursor tracking across browsers, office apps, and custom enterprise tools"; a focus rectangle highlights the keyboard-focus location; cursor enhancements track the text caret. Fusion pairs ZoomText magnification with JAWS.
- **macOS Zoom:** "follow keyboard focus" and panning modes, built on the AX notifications above.

### Browser zoom / reflow ≠ magnifier panning
Browser zoom (and **WCAG 1.4.10 Reflow**) **re-lays-out** the page into one column at ~320 CSS px (≈400% on a 1280px screen); it follows nothing — the page just gets bigger. OS magnifier panning does **not** reflow; it magnifies pixels and moves the viewport via the a11y APIs. **A page can pass Reflow yet still fail a magnifier user if focus/caret aren't exposed** (and vice versa). TPGi notes screen magnification can reach very high levels (up to ~700%), far beyond browser zoom.

### Related low-vision SC
- **1.4.4 Resize Text (AA):** text scalable to **200%** without loss of content/function (no horizontal scroll needed).
- **1.4.10 Reflow (AA):** usable at **320 CSS px width** (vertical) / 256px height (horizontal) — equivalent to 400% zoom on 1280px — with no 2-D scrolling (except data tables, maps, complex figures). Sticky headers that eat viewport height at 400% are a common failure.
- **1.4.12 Text Spacing (AA):** no loss when users override line-height 1.5×, paragraph spacing 2×, letter spacing 0.12em, word spacing 0.16em.
- **1.4.13 Content on Hover or Focus (AA):** hover/focus content must be **Dismissible** (Esc without moving pointer/focus), **Hoverable** (pointer can move onto it without it vanishing), **Persistent** (stays until dismissed / trigger removed / info invalid). The native `title` attribute **fails** this. Critical for magnifier users who pan onto tooltips (the W3C Low Vision TF describes the tooltip disappearing when a magnifier user scrolls to read it as a key barrier).

### React Do / Don't for magnifier & low-vision users
**DO**
- ✅ Keep a **real DOM focus** at all times; move focus to genuinely focusable elements (native or `tabindex`).
- ✅ Keep the caret in a **real editable element** (`<input>`, `<textarea>`, `contenteditable`) — never simulate a caret.
- ✅ Make focus indicators **thick and offset** (`outline` + `outline-offset`) so they're findable in a magnified slice; ensure ≥3:1 (1.4.11) and consider 2.4.13.
- ✅ Ensure tooltips/popovers stay near their trigger and are hoverable+persistent (1.4.13); make sure they don't render off-screen where a magnified user can't find them, and flip to stay in the viewport.
- ✅ Use fluid/responsive layouts that reflow (1.4.10); test at 200% and 400% zoom.
- ✅ Respect the user's system cursor; allow scrolling containers to be reached — Adrian Roselli recommends giving keyboard-only scrollable regions `tabindex="0"` + an accessible name so keyboard/magnifier users can reach and track them.

**DON'T**
- ❌ Don't **steal or move focus unexpectedly** (auto-advancing fields, focusing on scroll) — it yanks the magnified viewport away from the user's **point of regard** (the exact loss-of-place problem the W3C Low Vision TF calls out: *"if the place where they are reading … changes much, they lose their place"*).
- ❌ Don't hide the pointer or replace it with a custom cursor low-vision users can't find.
- ❌ Don't fight the user's scroll: avoid aggressive `scrollIntoView` on every render, scroll-jacking, or `scroll-behavior` surprises.
- ❌ Don't cause **layout shifts** (CLS) — content jumping loses the magnified user's place.
- ❌ Don't leave `overflow: hidden` on `body` except while a modal is open (restore after).
- ❌ Don't build canvas-only UIs without an accessible DOM overlay (canvas exposes nothing to the a11y APIs).
- ❌ Don't animate/transform content in ways that move focused elements out from under the magnifier.
- ❌ Be careful with **virtualized lists**: offscreen rows aren't in the DOM, so focus can be lost when a focused row unmounts during scroll — manage focus and `aria-activedescendant` carefully.

Primary sources: W3C **Accessibility Requirements for People with Low Vision** and Low Vision Task Force wiki (point of regard, resize content, tracking); MDN; Microsoft Learn (WinEvents, Magnifier support); IAccessible2 spec; Apple Developer (AX notifications); Freedom Scientific/Vispero; TPGi; Adrian Roselli.

---

## 7. Motion, Animation & Visual Load

- **2.3.1 Three Flashes or Below Threshold (A):** nothing flashes more than **3 times/second** (seizure risk). Hard requirement.
- **2.2.2 Pause, Stop, Hide (A):** any auto-updating/moving/scrolling/blinking content lasting >5s and shown alongside other content must have a pause/stop/hide control (carousels, marquees, auto-advancing).
- **2.3.3 Animation from Interactions (AAA):** allow disabling non-essential motion triggered by interaction.
- **`prefers-reduced-motion`** — honor it for parallax, autoplay, large transitions:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms!important; animation-iteration-count:1!important;
    transition-duration:.01ms!important; scroll-behavior:auto!important; }
}
```
```tsx
const prefersReduced = useSyncExternalStore(
  (cb) => { const m = matchMedia('(prefers-reduced-motion: reduce)'); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
  () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  () => false, // SSR default
);
```
- Don't autoplay video/carousels; if you must, provide controls. Avoid essential info conveyed only through motion.

---

## 8. Testing & Tooling for React

### Static / lint
- **`eslint-plugin-jsx-a11y`** (~18.7M weekly downloads) — catches missing `alt`, invalid ARIA, non-interactive handlers at author time. Enable `recommended` (or `strict`). Highest effort-to-value; always on. Static-only, so pair with runtime axe.

### Unit / component
- **`jest-axe`** / **`vitest-axe`** (wrap axe-core) — assert `toHaveNoViolations()` on rendered components, especially complex widgets.
- **React Testing Library** — query by **role/name** (`getByRole('button', { name: /save/i })`). Accessible-first queries double as a11y checks: if you can't query by role/name, AT users can't find it either.
```tsx
it('has no a11y violations', async () => {
  const { container } = render(<Dialog open labelledBy="t"><h2 id="t">Title</h2></Dialog>);
  expect(await axe(container)).toHaveNoViolations();
});
```

### Browser / E2E
- **`@axe-core/react`** — logs violations to the console in dev at runtime.
- **`@axe-core/playwright`** / **cypress-axe** — run axe in E2E across real pages/flows.
- **Storybook a11y addon** (axe under the hood) — per-component checks + visualize violations; run in CI via `@storybook/test-runner`.

### Manual & audit
- **Lighthouse** (CI via `lhci`), **WAVE** (WebAIM), **Accessibility Insights** (Microsoft, incl. guided "Assessment" + Tab-stop visualizer), **axe DevTools** extension.
- **Automated tools have a ceiling.** Deque's analysis of 2,000+ audits (~13,000 pages, ~300,000 issues) found axe-core "reliably detects 57% of real-world accessibility issues **by volume**." (A commonly cited "30–40%" reflects the share of WCAG *success criteria* that can be auto-tested, a different metric.) Either way, **manual passes are mandatory.**

### Manual testing checklist (every feature)
1. **Keyboard-only:** unplug the mouse. Tab through everything; logical order; visible focus; no traps; Esc closes overlays; all actions reachable.
2. **Screen reader:** NVDA+Firefox/Chrome, JAWS+Chrome, VoiceOver+Safari (+ TalkBack for mobile). Check names, roles, states, live announcements, route changes.
3. **200% & 400% zoom:** no content loss, no 2-D scroll (1.4.4 / 1.4.10).
4. **Text spacing:** apply the 1.4.12 bookmarklet; no clipping.
5. **Forced colors / High Contrast:** borders/state visible; nothing disappears.
6. **Magnifier pass:** Windows Magnifier (follow focus + caret) or macOS Zoom — tab & type; confirm the viewport follows focus and caret and nothing steals/jumps focus.
7. **Reduced motion:** enable the OS setting; confirm animation is reduced.

### CI integration
- Run `eslint-plugin-jsx-a11y` + `jest/vitest-axe` on every PR; `@axe-core/playwright` + Lighthouse CI on preview deploys; Storybook test-runner for the component library. Fail the build on new violations; baseline existing ones.

---

## 9. Rules for Claude Code (apply automatically)

**Prioritized rules when writing ANY React UI:**
1. **Native first.** Use `<button>`, `<a href>`, `<label>+<input>`, `<nav>/<main>`, `<dialog>` before any `<div>`+ARIA. (ARIA Rule 1)
2. **Every interactive element has an accessible name** (visible text, `aria-label`, or `aria-labelledby`). (4.1.2)
3. **Every input has an associated `<label>`** via `htmlFor`/`id` (use `useId()`); placeholder is never the label. (1.3.1/3.3.2)
4. **Keyboard operable & visible focus:** never `outline:none` without a `:focus-visible` replacement; support Tab/arrows/Enter/Space/Esc per APG. (2.1.1/2.4.7)
5. **Don't steal or unexpectedly move focus;** keep a real DOM focus and a real caret (magnifier + SR depend on it). Restore focus after modals/unmount.
6. **Color is never the only signal;** meet 4.5:1 text / 3:1 UI & focus via semantic design tokens. (1.4.1/1.4.3/1.4.11)
7. **Icon-only buttons:** `aria-label` on the button, `aria-hidden` on the icon; target ≥24×24px. (2.5.8)
8. **Modals:** native `<dialog>` or `role="dialog"`+`aria-modal`+focus trap+`inert` background+Esc+focus restore.
9. **Announce async changes** with an always-mounted live region (set text after mount); don't nest live regions. (4.1.3)
10. **SPA route changes:** move focus to the main heading + update title/announce.
11. **Honor user preferences:** `prefers-color-scheme` (+ `color-scheme`, no theme flash), `prefers-reduced-motion`, `forced-colors` (transparent border fallback), `prefers-contrast`.
12. **Complex widgets (combobox, listbox, menu, grid, date picker): use React Aria/Radix**, don't hand-roll.
13. **Images:** meaningful `alt` or `alt=""`; charts get a text/table alternative. (1.1.1)
14. **Reflow:** fluid layouts usable at 320px/400%; no fixed pixel widths that force horizontal scroll. (1.4.10)
15. **Provide non-drag & non-hover-only alternatives** (2.5.7 / 1.4.13); tooltips dismissible+hoverable+persistent.
16. **Use `onKeyDown` + `e.key`**, never `onKeyPress`; `preventDefault` handled keys.

**Pre-commit / pre-PR accessibility checklist:**
- [ ] `eslint-plugin-jsx-a11y` passes (no new warnings).
- [ ] `jest/vitest-axe` passes on new/changed components.
- [ ] All new inputs have labels; all interactive elements have accessible names.
- [ ] Keyboard-only pass on the changed flow (order, focus visible, no trap, Esc works).
- [ ] Contrast verified for new colors (both themes) ≥4.5:1 / ≥3:1.
- [ ] Focus is managed for new overlays/routes (trap, restore, announce).
- [ ] New animations behind `prefers-reduced-motion`; no >3 flashes/sec.
- [ ] Checked at 400% zoom / forced-colors for the changed screen.
- [ ] Quick screen reader smoke test (NVDA or VoiceOver) on the new component.

---

## 10. Glossary

- **A11y** — accessibility (11 letters between a and y).
- **Accessible name** — the computed label AT announces for an element.
- **Accessibility tree** — browser-built structure (from DOM+ARIA) consumed by AT and magnifiers.
- **APCA** — Advanced Perceptual Contrast Algorithm; candidate WCAG 3 contrast method (not normative).
- **APG** — ARIA Authoring Practices Guide (patterns + keyboard maps).
- **ARIA** — Accessible Rich Internet Applications; roles/states/properties.
- **AT** — assistive technology (screen readers, magnifiers, switch devices).
- **AX API** — Apple's macOS/iOS accessibility API.
- **Caret / point of regard** — text insertion point / the spot the user is currently reading.
- **Forced colors** — OS-enforced limited palette (Windows High Contrast).
- **IAccessible2 / MSAA / UIA** — Windows accessibility APIs.
- **Landmark** — region role (banner, nav, main, complementary, contentinfo).
- **Live region** — element whose changes AT announces without focus moving.
- **Reflow** — layout adapting to a narrow viewport / high zoom without 2-D scroll (1.4.10).
- **Roving tabindex** — one focusable item at a time in a composite widget.
- **SC** — Success Criterion (a testable WCAG requirement).
- **sr-only / visually-hidden** — visible to AT, hidden visually.
- **WCAG** — Web Content Accessibility Guidelines (POUR: Perceivable, Operable, Understandable, Robust).

---

## 11. Primary Sources
- W3C WCAG 2.2 (`w3.org/TR/WCAG22/`) + Understanding docs; WAI-ARIA 1.2; ARIA APG (`w3.org/WAI/ARIA/apg/`).
- W3C Accessibility Requirements for People with Low Vision (`w3c.github.io/low-vision-a11y-tf/requirements.html`) + Low Vision Task Force wiki.
- MDN (`developer.mozilla.org`): forced-colors, prefers-contrast, prefers-reduced-transparency, :focus-visible, inert, popover, dialog, color-scheme.
- WebAIM: Contrast article & Checker; Screen Reader User Survey #10 (2024); WebAIM Million 2024; 2018 Survey of Users with Low Vision.
- Deque (axe, Deque University), TPGi (magnification/reflow), Adrian Roselli, Scott O'Hara, Sara Soueidan, Hidde de Vries, Eric Eggert.
- Adobe React Aria docs (`react-spectrum.adobe.com/react-aria`); Radix UI; Headless UI; Ariakit; Base UI.
- Microsoft Learn (WinEvents "Event Constants"; Windows Magnifier support page); Apple Developer (AX notifications: `kAXFocusedUIElementChangedNotification`, `kAXSelectedTextChangedNotification`); IAccessible2 spec (Linux Foundation).
- React docs (`react.dev`) accessibility; `next-themes` (`github.com/pacocoursey/next-themes`).

---

### Note on source reliability
Where I could not find a single authoritative primary quote (e.g., that Windows Magnifier *specifically* consumes `EVENT_OBJECT_LOCATIONCHANGE`), the claim is presented as a well-supported inference from the WinEvent/IAccessible2 caret documentation plus corroborating bug reports (VS Code #29253). Apple does not publish an explicit "macOS Zoom pans using these AX notifications" statement; the AX notification docs establish the API surface and Zoom's "follow keyboard focus" is the consumer-facing feature. APCA and WCAG 3 are **draft/exploratory** — treat all APCA guidance as forward-looking, not a compliance requirement. WebAIM survey figures are self-selected respondents (1,539 in Survey #10), not a census.