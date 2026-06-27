# Appearance Host Setup

Phase C makes appearance first-paint safe when the host renders the bootstrap
script in the document head before React mounts. The bootstrap is a classic
inline script on purpose: it is parser-blocking across the Nexus browser floor
and does not rely on `blocking="render"`.

## React / Next.js App Router

Create one configured appearance pair and render the script in `<head>`. Put
`suppressHydrationWarning` on `<html>` because the script may set `.dark` and
the appearance `data-*` attributes before React hydrates.

```tsx
// app/appearance.tsx
import { createNexusAppearance } from '@nexus/react/appearance';

export const { NexusAppearanceProvider, NexusAppearanceScript } =
  createNexusAppearance({
    storageKey: 'nexus-appearance',
  });
```

```tsx
// app/layout.tsx
import { NexusAppearanceProvider, NexusAppearanceScript } from './appearance';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <NexusAppearanceScript />
      </head>
      <body>
        <NexusAppearanceProvider>{children}</NexusAppearanceProvider>
      </body>
    </html>
  );
}
```

If the app uses a CSP nonce, pass it to the script component:

```tsx
<NexusAppearanceScript nonce={nonce} />
```

Theme-dependent UI can read `mounted` from `useNexusAppearance()` and render a
neutral fallback until it is `true`. This is only needed for UI that displays
the persisted appearance state itself; ordinary styled components can render
normally because the CSS variables are already present.

## Plain HTML Hosts

Plain HTML hosts can inline the core script string in `<head>` before any
rendered content that depends on Nexus appearance variables.

```ts
import { createNexusAppearanceBootstrapScript } from '@nexus/core';

const script = createNexusAppearanceBootstrapScript({
  storageKey: 'nexus-appearance',
});
```

```html
<head>
  <meta name="color-scheme" content="light dark" />
  <script>
    /* insert createNexusAppearanceBootstrapScript() output here */
  </script>
</head>
```

The script writes:

- `.dark` on `<html>` when the resolved mode is dark
- `data-style`, `data-radius`, `data-shadow`, and `data-borderwidth`
- `color-scheme` on `<html>` plus the `color-scheme` meta content
- `style[data-nexus-appearance-theme]`
- `style[data-nexus-appearance-prefs]`

## Default CSS Source

The static `nexus.css` baseline still uses the non-appearance fallback brand.
Until the shipped baseline is aligned with the appearance default, the bootstrap
embeds the default appearance CSS snapshot so first visit is still flash-free.

This is intentional for Phase C. A later owner decision can align the static
baseline and shrink the first-visit script payload.

## Manual No-Flash QA

Automated unit tests verify the resolver, SSR render safety, style-tag reuse,
snapshot recovery, and provider/bootstrap equivalence. They cannot observe the
browser's first paint.

Before release, check a server-rendered host manually:

1. Store a dark `nexus-appearance` snapshot.
2. Hard-refresh the page.
3. Confirm there is no light flash before hydration.
4. Set appearance mode to `system`, toggle the OS color scheme, and hard-refresh.
5. Confirm the page starts in the OS-selected scheme.
6. Confirm the console has no hydration warning for `<html>` attributes.
