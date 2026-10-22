# Isolated integration preview

This is a separate document because `NxdsAppearanceProvider` owns document-level
styles and appearance attributes. Do not mount this provider inside the homepage's
React tree. The homepage embeds `/coexistence-preview/index.html` and passes only
an allowlisted library and explicit mode in the URL.

Run `pnpm --filter @nxds/docs generate:coexistence` after editing this preview.
Docs `dev` and `build` generate it automatically. Output under
`apps/docs/public/coexistence-preview/` is ignored and copied by the static docs
export. The homepage loads the frame lazily.

MUI and Ant Design use their published components with their own theme providers.
`ui/input.tsx` and `ui/select.tsx` are copied from
`examples/shadcn-app/components/ui/` (shadcn/ui, MIT); formatting/import ordering
may differ, but component behavior and utility styling are retained. The shadcn
stylesheet and Nexus stylesheet compile separately so unprefixed host utilities
and `nx:` utilities do not share a Tailwind prefix. Host CSS remains inside the
iframe. No lookalike controls or button style overrides are used.

`invitationAppearance` supplies the same preset to the live provider and generated
Appearance snippet. Presets coordinate brand, corners, density, and typography;
they do not claim pixel-for-pixel replication of a different design system.
The submit handler is local and never sends an invitation. Persistence is off.

Guidance: bundled Modern Web Guidance `guides/forms/forms.md` and
`guides/css/design-token-reactivity.md` informed named email fields, visible labels,
local submit feedback, and token ownership. The existing compact role-select
layout is retained. No environment detection is introduced.

App studio also offers Command menu (`example=command`); absent or unknown values
still show the invite form. The host-library buttons open projects directly, while
Nexus CommandDialog filters the same projects and selects into the same workspace
state. Ctrl K and Meta K are handled only within the iframe, without OS detection.
Escape restores focus to the search trigger. Runtime checks cover all three host
libraries, selection, empty results, shortcut opening, and focus restoration.
Guidance for the command interaction: bundled
`guides/ui-behaviors/light-dismiss-a-dialog.md` informed Escape/backdrop dismissal
and accessible naming. This uses the existing Nexus CommandDialog implementation
rather than replacing it with a native dialog or adding feature-detection fallbacks.

App studio's CSS coexistence comparison uses `comparison.html` in two separate
frames. Both start with the same host-only screen, measure computed styles, then
load either the copied shadcn default globals (including Tailwind Preflight) or
Nexus CSS and appearance provider. The parent verifies matching baselines and
shows only changed properties. Newly added components are excluded from the
measurement. Native help HTML is identified separately from actual host controls.

Dark-mode browser verification found 10 property changes with MUI and 4 with Ant,
all on native help headings, paragraphs, or lists. Checked host title, input, and
Save-button properties were unchanged; Nexus changed none of the checked existing
properties. These are results for these imports and measured properties, not a
claim that all shadcn integrations break host components. Scoping or omitting
Preflight can avoid these effects. Both framework selections and the findings
panel were checked against the live iframe reports.

The comparison retains the existing container-responsive layout conventions and
isolated-document token ownership described above. The code panel exposes the
actual global selectors involved rather than adding artificial conflict rules.

The added shadcn button has a separate diagnostic (not a host-baseline row).
Runtime CSSOM inspection traced Ant's unlayered
`input, button, select, optgroup, textarea { color: inherit; }` from reset.css.
It outranks the layered `.text-primary-foreground` utility: dark-mode text resolves
to rgb(238,238,238), although the token intends oklch(0.205 0 0), while the light
background still applies. MUI has no matching unlayered text-color rule in this
setup, and its computed text matches the token. The panel reports actual computed
colors and matching unlayered rules; no deliberate conflict styles were added.
