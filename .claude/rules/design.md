# Design Guidelines

## Product Context

Examlly is a web-based tool for teachers and institute admins to create AI-powered question papers. A future persona is students.

**User profile:** Non-technical. These users are educators, not software users. They are often time-poor, unfamiliar with complex UIs, and access the product on mobile devices (phones, tablets) as often as on desktops.

**Design north star:** Every screen should feel effortless to a first-time teacher with no product training.

---

## Thesis

**Monument × Bond Paper.** Examlly announces itself with foundry-class monument at the edges and steps back inside the work — the institute's printed paper becomes the subject. Two registers for brand and artifact, one for the working tool.

- **Monument** — Examlly's brand voice. Confident, spacious, type-driven.
- **Bond Paper** — the institute's printed artifact. Faithful to the DPP format.
- **Workshop** — the working tool. Functional, dense, Inter-only.

---

## Token values & spec

This file owns **behavioral rules** — how to compose, when each register applies, what to never do. It does **not** restate token values.

Single source of truth for token values:

- **`apps/web/src/app/globals.css`** — runtime CSS variables (v3, OKLCH). Authoritative.
- **`docs/DESIGN.md`** — text spec; mirrors globals.css with full token tables (Brand, Surfaces, State, Avatar, Sidebar), typography registers, spacing, radius, shadow philosophy, motion.
- **`docs/design/token-system/*.html`** — visual previews. Open in a browser.

If a value disagrees between this file and DESIGN.md, **DESIGN.md wins**.

### Companion rules

| Concern                                                                        | Rule file                                                         |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| State pills, dot-status, density                                               | `.claude/rules/state-color-density.md`                            |
| Form layout, Dialog usage, Destructive confirmation, Action button hierarchy   | `.claude/rules/forms-and-actions.md`                              |
| Truncation, date/time format, tabular numbers, icon-only button a11y, tooltips | `.claude/rules/data-display.md`                                   |
| Brand voice, vocabulary, narrative structure                                   | `examlly-marketing` repo — `.claude/rules/{tone,storytelling}.md` |

---

## Register Map

| Surface                 | Register   | Type system                    | Why                             |
| ----------------------- | ---------- | ------------------------------ | ------------------------------- |
| Landing / marketing     | Monument   | Clash Display + Inter          | Examlly is the subject          |
| Sign-in / auth          | Monument   | Clash Display + Inter          | Onboarding into Examlly's voice |
| Dashboard hero (entry)  | Monument   | Clash Display + Inter          | Brand moment at entry           |
| Empty states            | Monument   | Clash Display + Inter          | Brand voice inviting action     |
| Dashboard (working)     | Workshop   | Inter only                     | Working tool                    |
| Forms / settings        | Workshop   | Inter only                     | Working tool                    |
| Tables / data views     | Workshop   | Inter only                     | Working tool                    |
| Navigation / sidebar    | Workshop   | Inter only                     | Working tool                    |
| Modals / dialogs        | Workshop   | Inter only                     | Working tool                    |
| Template setup          | Bond Paper | Archivo Black + Source Serif 4 | DPP format is the subject       |
| Question preview / edit | Bond Paper | Archivo Black + Source Serif 4 | DPP content is the subject      |
| Print preview           | Bond Paper | Archivo Black + Source Serif 4 | Final artifact view             |
| DPP history / archive   | Bond Paper | Archivo Black + Source Serif 4 | Institute's record              |

**Decision filter:** _who owns this surface?_ Examlly → Monument. The tool → Workshop. The institute's paper → Bond Paper.

---

## Mobile-First Strategy

Design for mobile viewports first. Scale up to larger screens — not the reverse.

- The base (unprefixed) layout is always the mobile layout
- Wider-screen layouts are layered on top using responsive breakpoint prefixes
- Never design a desktop layout and try to "make it work" on mobile
- Navigation collapses to a sheet/drawer on small screens; full sidebar on medium and above

| Breakpoint       | Meaning                                | Design intent                  |
| ---------------- | -------------------------------------- | ------------------------------ |
| Base (no prefix) | All screen sizes, starting from mobile | Primary layout                 |
| `sm` (640px+)    | Large phones, small tablets            | Minor layout adjustments       |
| `md` (768px+)    | Tablets, small laptops                 | Side-by-side layouts unlock    |
| `lg` (1024px+)   | Desktops                               | Full density, wider containers |

When in doubt: if it doesn't work on a 390px wide phone, the design is not done.

---

## Accessibility Minimums

Non-negotiable floors, not aspirational targets.

| Requirement                   | Standard                                                                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text contrast ratio           | 4.5:1 (WCAG AA)                                                                                                                                                                               |
| UI component contrast         | 3:1 (WCAG AA)                                                                                                                                                                                 |
| Interactive touch target size | 24×24 CSS px minimum, with 24px spacing from adjacent targets (WCAG 2.2 AA). shadcn Button defaults (`h-9` = 36px) comfortably exceed this — do not override component heights at call sites. |
| Keyboard navigation           | All interactive elements must be reachable and operable via keyboard                                                                                                                          |
| Screen reader support         | Meaningful labels on all interactive elements; decorative images marked as such                                                                                                               |
| Focus indicators              | 2px ink outline on all focusable elements                                                                                                                                                     |

---

## UX Patterns

### Three Required States

Every screen that loads data must have all three designed and implemented:

| State       | Purpose               | Requirement                                                                                                    |
| ----------- | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Loading** | Data is being fetched | Skeleton matching the shape of loaded content (column count, row count, dimensions). Never a centered spinner. |
| **Empty**   | No data exists yet    | Concrete reason + primary CTA naming the action. Never bare "No data" or illustration-only.                    |
| **Error**   | Something went wrong  | Plain-language explanation + recovery action (retry, go back). Never raw `error.message`.                      |

A blank white screen is never acceptable. Spinners belong on action buttons during a pending mutation (and only if the action takes more than ~1s) — never on content surfaces, which use Skeleton.

### Error Messaging

Every error message must answer three questions in plain language:

1. **What** happened ("We couldn't save your question paper")
2. **Why** it happened, if known and non-technical ("Check your internet connection")
3. **What to do** next ("Try again" button, link to go back)

**Placement:** Validation errors render inline at the offending field — never in a banner or toast. Transient action errors (failed mutation) render as a toast. Surface-level load errors render full-pane.

### One Primary Action Per Screen

Each page or step has one clearly dominant primary action. Secondary and destructive actions are visually subordinate.

### Calls to Action

CTAs must be descriptive. "Create Question Paper" over "Submit". "Save and Continue" over "Next". The label tells the user what will happen.

---

## Anti-Patterns / Nevers

### Visual Nevers

- **Never color outside brand tokens on brand surfaces.** Product-state colors (error, success, warning, focus, info) are scoped extensions for functional feedback only — never decoration. The avatar palette is the one exception and is scoped strictly to avatar fallbacks (see Avatar Palette section in DESIGN.md).
- **Never use avatar tokens outside avatar fallbacks.** The 5 avatar color pairs are the single scoped-decoration exception in the system; they do not generalize to badges, buttons, backgrounds, or any other surface.
- **Never gradients, drop shadows, soft blurs, glassmorphism.**
- **Never rounded corners over 2px.** The square corner IS the design statement.
- **Never warm cream or yellow tints.** Paper's warmth is grey-warm only.
- **Never `paper-pure` as default background.** It's for reverse contexts only.
- **Never invert whole screens.** Inverted zones are always bounded (banners, buttons).
- **Never arbitrary spacing values.** Use the Tailwind scale or the named carve-out `--spacing-4_5` (18px, codified in `globals.css`). No `p-[18px]`, `gap-[7px]`, `space-y-[14px]`. Don't mix margin and gap to fake custom spacing — pick one. If a new size is genuinely needed, propose extending the Tailwind config; don't ship one-off arbitrary values.

### Typography Nevers

- **Never Clash Display below 28px.**
- **Never Archivo Black on Monument or Workshop surfaces.**
- **Never Source Serif 4 for UI on non-DPP surfaces.**
- **Never mix Clash Display with Archivo Black on the same surface.**
- **Never italic or underline for emphasis.** Use font weight or size.
- **Never UPPERCASE on Workshop chrome.** Table headers, form labels, and button text in the Workshop register stay sentence case. Uppercase + letter-spacing is reserved for Monument labels (`MONUMENT LABEL`), Monument CTA buttons, Bond Paper banners (`CLASS XII · PHYSICS`), Bond Paper metadata, and sidebar group headers (`WORKSHOP`).

### Copy & Tone Nevers

- **Never emoji, "✨", AI-language signaling.**
- **Never vendor-speak:** "delight", "seamless", "solution", "revolutionize", "supercharge", "unlock".

### Density Nevers

- **Never crowded Monument or Bond Paper surfaces.** Empty space is the argument on Monument; structure carries Bond Paper.
- **Workshop surfaces are allowed functional density** — that's a working tool.

### UX Anti-Patterns

| Anti-Pattern                                                | Why It's Wrong Here                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Desktop layout first, mobile as afterthought                | Users are on mobile as often as desktop; mobile regressions are user-facing bugs |
| Blank page on loading or empty state                        | Non-technical users interpret blank pages as broken products                     |
| Technical error messages ("500 Internal Server Error")      | Teachers cannot act on technical errors; plain language required                 |
| Feature-dense screens with many competing actions           | Overwhelming for non-technical users; causes abandonment                         |
| Inconsistent terminology across flows                       | Confuses users; creates false sense of different features                        |
| Inline styles or arbitrary values outside the design system | Breaks consistency; impossible to maintain at scale                              |
| Validation errors only in toasts or page-level banners      | Hard to associate with the offending field on mobile                             |
| Forms longer than 5–6 fields on a single screen             | Overwhelming on mobile; break into steps instead                                 |
