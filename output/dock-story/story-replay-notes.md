# Follow the story

Local Stories studio comparison. Previous iterations and the dock are preserved.

| Decision                                                | Source                                              | Reason                                                            |
| ------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| Keep a real component beside its observed steps         | https://storybook.js.org/ interaction-testing demo  | Connect the example to the checks without requiring code reading. |
| Select a completed step to inspect its recorded state   | https://docs.cypress.io/app/core-concepts/open-mode | Explain what happened at each point.                              |
| Show expected and received values at failure            | https://playwright.dev/docs/trace-viewer            | Make the hidden callback bug understandable.                      |
| Keep neutral surfaces, typography and the existing dock | Current dock-story prototype and user request       | This is another chapter iteration in the same experience.         |

The demo imports the real Nexus Switch, Button and Label. Local checks inspect
the Switch DOM and observed callback values. The intentional bug is in this
demo's callback adapter, not in the library. Keyboard runs require actual Space
input; they do not synthesize a passing keyboard result. These are local checks,
not Storybook/Vitest or Nexus CI results. The disclosed code is an equivalent
Storybook excerpt.

Modern Web Guidance: attempted offline search for "accessible interactive test
results panel responsive layout live status"; CLI failed with ENOTCACHED.
Consulted bundled `.agents/skills/modern-web-guidance/guides/accessibility/accessibility.md`.
Use native buttons and labels, visible focus, a polite status region, textual
pass/fail feedback, and the existing keyboard-operable dock. Responsive stacking
uses the existing story-canvas container at 740px. No environment queries or
feature-detection branches are introduced. Motion obeys the explicit page
reduceMotion preference.

Verified against the active localhost preview:

- Click: off → on, callback `true`; all checks pass.
- Intentional bug: UI on, callback `false`; final check fails. Fix and rerun passes.
- Recorded-step inspection restores the earlier off state without overwriting the
  live state; Return to live restores on.
- Keyboard waits for actual Space input with focus on the switch, then passes.
- Disabled stays off with zero callbacks.
- Reset during a run cancels later updates; no stale pass results appear.
- Dark and light at 1440 × 1000, narrow at 390 × 844. No horizontal overflow.
  Narrow layouts stack and scroll inside the existing canvas, keeping the switch
  and observed value together above the dock. Existing source-audit overlay is
  unchanged and can overlap the page heading on narrow screens.
- Compact desktop at 1265 × 712: a height query below 600px of available canvas
  space keeps the component, value readout, four steps and recovery explanation
  above the fixed dock. Final visible preview is saved as story-replay-preview.png.
- ESLint and Prettier pass on the new JSX/CSS; preview console has no errors.

The active server uses the older `@nexus_ds/react` source alias from the
`nexus-homepage` checkout. Only the new files and three registration changes are
mirrored there; canonical source uses this checkout's `@nxds/react` alias.
