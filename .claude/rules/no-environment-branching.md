# No Environment Branching

Nexus does not branch on the user's operating system, browser, browser version, or input device.

Every environment branch is a code path nobody on the team is looking at and CI cannot check. The component's real appearance comes to depend on a machine no reviewer is sitting at. That cost falls on every component, indefinitely.

## The Rule

- No `@media (forced-colors)`.
- No `@supports` feature-detection fallbacks.
- No `prefers-reduced-motion`, `prefers-reduced-transparency`, or any other `prefers-reduced-*` query.
- No `pointer:` / `any-pointer:` media queries.
- No user-agent sniffing.
- No browser-floor policy registry.

A component has **one appearance per variant × size × theme**. That is the whole state space, and it is the state space stories have to cover.

If a platform cannot render something, the fix is to pick a simpler primitive — not to add a second code path behind a query.

## The One Exception

`prefers-color-scheme` stays. Light/dark is a product feature Nexus ships deliberately, not environment branching.

## What This Does Not Cover

These are single code paths, not branches, and are fine:

- **Appearance preferences the user sets explicitly**, such as the `reduceMotion: 'on'` toggle or font smoothing. The user picks them in the product; Nexus does not detect them from the environment.
- **Vendor-prefixed declarations** that a single appearance needs, such as `-webkit-font-smoothing`.
- **Layout primitives** such as `svh` / `dvh` units.
- **Unconditional system colours** on OS-rendered UI, such as `NativeSelect`'s `<option>` using `Canvas` / `CanvasText`.

## Precedence Over Modern Web Guidance

The `modern-web-guidance` skill still recommends `forced-colors` fallbacks, `@supports not selector(:has(*))` fallbacks, and reduced-motion variants. **This rule overrides those recommendations.** Use the skill for everything else.

## Enforcement

`scripts/audit-environment-branching.test.js` fails the unit suite when a banned query or variant appears in `packages/` or `apps/` source.
