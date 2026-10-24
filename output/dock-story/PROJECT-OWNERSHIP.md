# Create a project: live ownership example

Status: retired. On October 24, the user approved removing the unused active
ProjectExample and ProjectOwnershipControls files. Saved baseline snapshots
remain intact. The current showcase's Create a project card is separate and
unchanged. The implementation notes below are historical.

Approved scope: implement Content, Variants, Composition and matching source for the Create a project card in the ownership chapter. Keep grid/dock geometry and all prior versions. Local preview work only; Dock component/PR is owned by its separate session.

## Draft implementation plan

1. Freeze current chapter, grid and audit sources; record hashes of geometry and dock files. Add an Ownership studio comparison: Project editor (new) / Previous controls. The old rendering path remains unchanged.
2. Add ProjectExample.jsx as a standalone, application-owned composition of public Nexus Card/Field/Input/NativeSelect/Textarea/ChoiceRow/Checkbox/Button primitives. It accepts editable title, description, action label, actual Button/Input variants and optional description/brief/team/date/privacy sections. Keep valid action/title fallbacks for temporarily blank edits. Submission is local and reports the entered project name.
3. Add an optional ReactNode project slot to ShowcaseGrid's Components view. The new ownership chapter deliberately shows this Components board so the target always exists regardless of the first chapter's selected category. Other chapters and boards retain their current path.
4. Keep editing configuration in the chapter parent so tool/chapter changes do not lose edits. Use Nexus controls inside the existing panel. Select labels remain in normal flow. Reset only the project configuration. Preserve provider settings separately.
5. Source imports the actual ProjectExample file through Vite ?raw and appends the exact effective settings plus a ready-to-render default export. No runtime evaluation. It includes its imports and local form behavior. Nexus installation/styles/appearance provider remain host prerequisites; grid/dock are intentionally not exported. Copy errors leave selectable source and explicit feedback.
6. Add source-audit boundaries distinguishing page composition from Nexus primitives. New card interiors use Nexus token utilities. The existing card wrapper still owns slot geometry. No new library component, dependency or dock API.

## Verification

Check source and live aliases, parse/bundle exported JSX and compare it with the same component/config; verify copy/text escaping, button/input props, optional section toggles and local submission. Browser: both themes, phone and large widths, form validity, tool switching, chapter state, reset, previous comparison and unchanged grid/dock bounds. Scoped lint/build; no new application test suite per repository testing policy. Keep source and runtime preview synchronized without modifying the separate Dock worktree/session.

## Guidance and council

The four council lenses (reality, architecture, edges, simplicity) completed. Accepted: force the Components board only in the new ownership version; preserve the legacy branch; keep one ReactNode for chapter controls with each dock's existing fallback; direct Card child retains slot geometry; optional sections are mounted by configuration instead of responsive hiding; canonicalize the raw module import before inserting user data; clear stale submit/copy feedback. The old Colored tiles dock has no panel and intentionally retains the old ownership behavior.

Modern Web Guidance `forms` (retrieved 2026-10-24 via modern-web-guidance): associated labels, native validation, explicit submission and clear local feedback. Compact panel composition follows the user's approved density. No environment branching. Official references: https://react.dev/reference/react-dom/components/input and https://vite.dev/guide/assets.html#importing-asset-as-string. Verify these decisions through local invalid/valid submission, toggle removal, source bundling and keyboard/browser checks.

Editor configuration persists across tools, chapters and comparison switches. Local form input resets when leaving the chapter or switching to the previous version; hidden optional fields reset when re-enabled. Reset restores editor configuration only. Shared appearance and existing grid/dock geometry remain independent.

## Completed and verified

- New iteration: DialKit → Ownership studio → Create a project · new. Previous controls restores the original ProjectCard and chapter controls. Editor settings survived chapter and comparison changes.
- Content edits update the title and action immediately; empty values use meaningful fallbacks. Description content is escaped as text.
- Button outline and Input ghost were exercised in the browser; their actual Nexus classes changed. Optional brief removal and team insertion changed only the project form.
- Whitespace-only submission is rejected; entering a valid name produces local success feedback. No network submission is implemented.
- Copied full JSX was read from the browser clipboard, matched byte-for-byte with ProjectExample.jsx, and bundled against the built public @nxds/react package. Quotes, backslashes, braces, newlines, Unicode, and a literal legacy package name in user content survived export.
- Preview checked at 390×844, 1180×1194, and 2369×1794. No page horizontal overflow; five grid children remain on large screens; the narrow project card scrolls internally. Source panel fits within the phone viewport. Both themes checked. Keyboard focus has a visible outline. No browser console errors captured.
- At 1180×1194, grid bounds remain x32/y415.765625/w1116/h778.234375; dock position remains x32/y1102/w1116/h72, matching the pre-edit baseline.
- Baseline byte comparisons passed for ShowcaseCards.jsx, showcase-grid.css, dock-chapter-journey.css, story-chapters.css, NexusDock.jsx, main.jsx, DialKitToolControls.jsx and DockToolControls.jsx.
- Scoped ESLint and Prettier passed. Vite production build passed for both dock-story and appearance-preview entries; existing large-bundle warning remains.
- Local preview synchronized only with the ownership changes. Separate Dock worktree/session unchanged. No commit, push or PR changes.

Review screenshot: project-ownership-preview.png. New Content editor is open in the preview with default project settings.
