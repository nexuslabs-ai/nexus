---
name: diagram-contract
description: LaTeX authoring contract for Examlly question and solution diagrams — package stack, boilerplate, style conventions, worked examples, and failure modes. Invoke BEFORE writing any `.tex` source for a diagram referenced by a `{{diagram:key}}` token.
allowed-tools:
  - Read
  - Bash
---

# Diagram Contract — Skill

Shared LaTeX contract for the `diagrams[*].source` field emitted by question-content authors. Invoke this skill whenever you are about to write `.tex` for a new `diagrams` entry.

Every diagram is monochrome (black and white only) and restricted to a fixed package whitelist. The compile service at `http://localhost:3003/compile` is the runtime source of truth — every `.tex` source must compile there before ingest. Use `curl -sS -X POST http://localhost:3003/compile -H 'Content-Type: application/json' -d '{"source": "<tex>"}'` to validate; a 200 with `{"svg": "..."}` means pass.

---

## Preamble — every document

```latex
\documentclass[border=2pt]{standalone}
% \usepackage{...}  — one or more from the package stack below
\begin{document}
  % ... figure body ...
\end{document}
```

- `\documentclass[border=2pt]{standalone}` only. No other class. `standalone` trims to the figure's bounding box.
- No `\title`, `\author`, `\pagestyle`, `\maketitle`, or document-level metadata.
- No `\input`, `\include`, `\write18`, or shell-escape constructs. The compile service blocks external file access.
- No `fontspec`, no XeLaTeX/LuaLaTeX-only features. The compile service runs `pdflatex` or `latex → dvips → ps2pdf`.
- ASCII only. Use `\alpha`, `\degree`, `\ohm`, `\pi` — never Unicode glyphs like `α`, `°`, `Ω`, `π`.
- Keep each document under ~500 lines. At ~40 `\draw` commands, `pgfplots` or a `\foreach` loop is almost always the right tool.
- No custom `\newcommand` / `\def` unless genuinely required.

---

## Package stack

Use only packages from this list. Each has a specific domain — match the domain to the figure. Nothing outside this list is allowed; if the figure needs it, stop and flag.

### Standard (pdflatex) path

| Package      | Use for                                                                                                                        | Boilerplate                                                                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tikz`       | Geometry, ray/optics diagrams, free-body diagrams, logic gates, anything coordinate-based                                      | `\usepackage{tikz}` then `\usetikzlibrary{...}` for needed libraries (`calc`, `angles`, `quotes`, `arrows.meta`, `positioning`, `patterns`, `decorations.pathmorphing`, `decorations.pathreplacing`, `shapes.gates.logic.US`, `intersections`) |
| `circuitikz` | Circuits, electrical diagrams, Wheatstone bridges, potentiometer arrangements                                                  | `\usepackage[siunitx, american]{circuitikz}` — **do not** also load `tikz` (circuitikz loads it already)                                                                                                                                       |
| `chemfig`    | Organic structural formulas, functional groups, reaction schemes (`\schemestart` / `\arrow` / `\schemestop`), mechanism arrows | `\usepackage{chemfig}`                                                                                                                                                                                                                         |
| `pgfplots`   | Axis-based plots: v–t graphs, energy diagrams, probability distributions, titration curves, enzyme kinetics                    | `\usepackage{pgfplots}` then `\pgfplotsset{compat=1.18}` — **never** roll your own axes in raw `tikz` when the plot has numerical axes                                                                                                         |
| `siunitx`    | Physical units: `\qty{6}{\volt}`, `\unit{\meter\per\second}`, `\num{6.022e23}`                                                 | `\usepackage{siunitx}` — use the **v3 API only**; do not use the deprecated `\SI{}{}` form                                                                                                                                                     |
| `amsmath`    | Math inside node labels, axis titles, and anywhere inline math appears                                                         | `\usepackage{amsmath}`                                                                                                                                                                                                                         |

### PSTricks path (auto-selected when `pst-*` is loaded)

| Package    | Use for                                                                      | Boilerplate                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `pst-pdgr` | Medical / genetic pedigree charts (standardized human pedigree nomenclature) | `\usepackage{pst-pdgr}` — **do not mix** with `tikz`, `pgfplots`, or `circuitikz` in the same document (different compile path) |

No package outside this list. If the figure needs one, stop and flag.

---

## Style conventions

- **Named coordinates.** `\coordinate (A) at (0,0);` then `\draw (A) -- (B);`. Enables later edits and angle annotations (`angle = A--B--C`).
- **TikZ libraries over manual math.** `calc` for midpoints (`$(A)!0.5!(B)$`); `angles` for labeled angles; `positioning` for `right=of` / `below=of` node placement.
- **`>=Stealth`** (from `arrows.meta`) for scientific arrows on vectors, rays, force diagrams.
- **Chemistry.** `chemfig` branch angles are indexed 0–7 (0=east, 2=north, 4=west, 6=south). Use explicit bond orientations for anything beyond a linear chain.
- **Circuits.** Measurement instruments on a cross-branch with `\draw (X) to[rmeter, t=G] (Y);` — **`galvanometer` is not a valid bipole**; use `rmeter, t=G` (galvanometer) or `rmeter, t=V` (voltmeter). Batteries: `battery1` (single cell) or `battery2` (two-cell). Resistors: `to[R, l=$R_1$]`. Capacitors: `to[C, l=$C_1$]`.
- **Plots.** Never draw graph axes in raw `tikz` when `pgfplots` would handle them. Use `axis lines=left`; label `xlabel` / `ylabel` with units when physical; use `grid=major` sparingly.
- **Pedigrees.** `pst-pdgr` positions each person with `\rput(x,y){\pstPerson[...]{id}}` inside a `pspicture` environment. Couples: `\pstRelationship[descentnode=AB]{I1}{I2}`. Children: `\pstDescent{AB}{II1}`.
- **Black and white.** Distinguish elements by line style (solid / dashed / dotted), weight (`thick` / `very thick`), patterns (`pattern=north east lines`, `pattern=crosshatch`), and labels. Fills are `black!XX` or `gray!XX`. **Labels carry identity; strokes don't.**
- **Fonts and sizes.** All text readable at ~300 px render width. Avoid font sizes below `\small`; reserve `\tiny` for sub/superscript context.

---

## Description-field enumeration

The `description` field sits alongside `source` in every `diagrams` entry — used by future reviewers, the reconcile skill, and as SVG alt text for accessibility. Enumerate every visually meaningful element, not a summary:

- Every component (resistor, capacitor, ammeter, ray, atom, axis, chromosome, arrow, …) and its role.
- Every label exactly as drawn (`R_1`, `A`, `\theta_i`, `I:1`, …).
- Every numerical value with its unit (6 V, 10 Ω, 30°).
- Relative placement (above/below/left-of, on the horizontal diagonal, at the top-right vertex).
- Connectivity and direction (which nodes are joined, arrow heads, polarity of batteries, bond orientations).

---

## Failure modes to avoid

- **Loading `tikz` and `circuitikz` together** — `circuitikz` already loads `tikz`. Option clashes follow.
- **Using `galvanometer` as a circuitikz bipole** — it does not exist. Use `rmeter, t=G`.
- **Mixing PSTricks (`pst-pdgr`) with `pgfplots` or `tikz`** in one document — different compile paths.
- **`\SI{6}{\volt}` instead of `\qty{6}{\volt}`** — v2 form is deprecated; siunitx v3 is loaded.
- **Freehanding axes in TikZ when `pgfplots` fits** — `pgfplots` handles ticks, labels, and legends for free.
- **Omitting `\pgfplotsset{compat=1.18}`** after loading `pgfplots` — package warns and may render unexpectedly without it.
- **Non-ASCII characters like `°` or `π`** in source — use `\degree` (from siunitx) and `\pi` inside math mode.
- **`\usetikzlibrary{...}` inside `\begin{document}`** — it goes in the preamble.
- **Any color at all** — no `red`, `blue`, `green`, `orange`, `yellow`, `purple`, `cyan`, `magenta`, `brown`, `violet`, `teal`, `pink`, `lime`, `olive` anywhere in the source. Only `black`, `black!XX`, and `gray` shades are permitted.

---

## Worked examples

### Example 1 — `circuitikz` (Wheatstone bridge)

**description:** "Wheatstone bridge with four resistors labeled R_1, R_2, R_3, R_x arranged in a diamond; 6 V battery across the horizontal diagonal; galvanometer across the vertical diagonal."

```latex
\documentclass[border=2pt]{standalone}
\usepackage[siunitx, american]{circuitikz}
\begin{document}
\begin{circuitikz}
  \coordinate (A) at (0,0);
  \coordinate (B) at (2,2);
  \coordinate (C) at (4,0);
  \coordinate (D) at (2,-2);
  \draw (A) to[R, l=$R_1$] (B) to[R, l=$R_2$] (C);
  \draw (A) to[R, l_=$R_3$] (D) to[R, l_=$R_x$] (C);
  \draw (B) to[rmeter, t=G] (D);
  \draw (A) to[battery1, l_=\qty{6}{\volt}, *-*] (C);
\end{circuitikz}
\end{document}
```

### Example 2 — core `tikz` (free-body diagram, line-style distinction)

**description:** "Block on a frictionless inclined plane of angle theta = 30 degrees. Three force vectors originate at the block's centre, distinguished by line style: solid arrow for gravity mg pointing straight down; thick dashed arrow for the normal force N perpendicular to the incline surface; thick dotted arrow for mg\*sin(theta) along the incline pointing down-slope."

```latex
\documentclass[border=2pt]{standalone}
\usepackage{tikz}
\usetikzlibrary{calc, arrows.meta}
\begin{document}
\begin{tikzpicture}[>=Stealth, scale=1.2]
  \coordinate (O) at (0,0);
  \coordinate (B) at (6,0);
  \coordinate (T) at (6,3.46);
  \draw[thick] (O) -- (B) -- (T) -- cycle;
  \node at (5.2,0.3) {$\theta = 30^\circ$};
  \coordinate (P) at (3.5,2.02);
  \fill[black!15] (P) ++(-0.4,-0.2) rectangle ++(0.8,0.4);
  \draw[->, thick]              (P) -- ++(0,-1.8)     node[below]      {$mg$};
  \draw[->, very thick, dashed] (P) -- ++(-0.9,1.56)  node[above left] {$N$};
  \draw[->, very thick, dotted] (P) -- ++(1.30,-0.75) node[right]      {$mg\sin\theta$};
\end{tikzpicture}
\end{document}
```

### Example 3 — `chemfig` (reaction mechanism)

**description:** "Peroxide-initiated anti-Markovnikov addition of HBr to propene. CH_2=CH-CH_3 plus Br radical → CH_3-CH(·)-CH_2Br plus HBr → CH_3-CH_2-CH_2Br."

```latex
\documentclass[border=2pt]{standalone}
\usepackage{chemfig}
\begin{document}
\schemestart
  \chemfig{H_2C=CH-CH_3}
  \arrow{->[\chemfig{Br\cdot}]}
  \chemfig{BrCH_2-\chemabove{CH}{\cdot}-CH_3}
  \arrow{->[\chemfig{HBr}]}
  \chemfig{BrCH_2-CH_2-CH_3}
\schemestop
\end{document}
```

---

## JSON escape + entry shape

Inside a JSON `source` string, every `\` doubles: raw `\documentclass` → `"\\documentclass"`, raw newline → `\n`. Standard JSON string-escape rules apply to the full `.tex` document.

Every `diagrams` entry has this shape:

```jsonc
{
  "description": "...",
  "source": "\\documentclass[border=2pt]{standalone}\n...\n\\end{document}",
  "hash": null,
  "status": "pending",
  "error": null,
}
```

`hash`, `status`, `error` are always the literals shown. The server rewrites `hash` / `status` after compile + upload.

---

## Compile-test before you return

Before handing the `.tex` back to the calling skill, POST it to `http://localhost:3003/compile`. On failure, fix and retry (max 2 retries). If the third attempt also fails, flag the question rather than shipping broken `.tex` — the ingest pipeline rejects the entire batch atomically on any compile failure.
