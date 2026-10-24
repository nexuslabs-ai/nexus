# Shared foundation comparison

New local DialKit option: Dock studio > Framework diagram > Shared foundation · new.
Token flow · current retains the previous diagram. The dock iteration is independent.

## Design and content decisions

The current dock-story layout is the primary reference: full-width 1 / 1.3 / 1
columns, twelve input rows, a full-height centre, five clickable monochrome
framework marks, borderless fills, independent faint lines, and bottom fade
behind the dock. Keep all earlier variants and chapters intact.

The new diagram says Design decisions > Shared foundation > Framework components.
Components and Icons are replaced with actual foundation inputs. The centre
explains three responsibilities: theme engine, token presets, appearance state.
Selecting a framework shows its adapter/output relationship. React and Vue
exist in current source; Svelte, Angular and React Native are explicitly planned.
Native copy distinguishes shared values from native styling and components.

Source: packages/core/src/lib/appearance-model.ts, appearance-dom.ts,
packages/react/src/components/appearance/provider/provider.tsx,
packages/vue/src/components/appearance/appearance.ts, and introduction.mdx FAQ.

## Reference lock

Refero full styles inspected: Linear Changelog
(11d3e58a-87d7-4a9a-bbf5-720f4fd3ffc6, https://linear.app/changelog) and
shadcn (c14c0a94-1037-449e-bf5b-4cb972656ac7, https://ui.shadcn.com).
Borrow only restrained foreground/muted hierarchy and compact explanatory
groups. Preserve the existing Nexus font, themes and surface tokens instead
of importing reference colors or fonts. No decorative imagery is needed.
Reject saturated logos, nested clickable-looking cards and merging connectors.

## Platform guidance

Offline modern-web-guidance search for CSS grid three-column architecture
diagram returned ENOTCACHED. Read the bundled fallback:
.agents/skills/modern-web-guidance/guides/css/css-layout.md, sections 3 and 4.
Use explicit fractional tracks, logical properties, and existing sized container
queries. No JS viewport detection or environment preference queries.
The compact diagram shortens only its decorative bottom fade so labels remain
legible above the dock; full-height surfaces continue underneath it.

## Verification

Verified the old/new DialKit switch in the running preview; both diagrams
remain available independently of the dock variant. Vue click and Angular
keyboard activation update the diagram, integration note and dock selection.
Light/dark themes inspected. At 1920 x 1200, 390 x 844 and the normal preview
size there is no horizontal overflow; integration copy sits above the dock.
The twelve input rows and five frameworks remain fixed. No browser warnings
or errors were reported. Scoped JSX ESLint passed. Screenshot:
shared-foundation-preview.png. All changes remain local and uncommitted.
