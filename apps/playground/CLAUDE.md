# Playground App

Theme demonstration app for previewing design token combinations dynamically.

## Purpose

- Demo tool for showing clients theme variations
- Test different color, typography, spacing, and style combinations
- Preview light/dark mode switching in real-time
- Preview components with different icon libraries (Tabler, Lucide, Phosphor)

## Tech Stack

- **Vite** 7.x with React plugin
- **React** 19 with TypeScript
- **Tailwind CSS** 4.x with `nx:` prefix
- **Zustand** 5.x for icon library state
- **Icon Libraries**: @tabler/icons-react, lucide-react, @phosphor-icons/react
- Native HTML elements (no @nexus/react dependency)

## Commands

```bash
yarn dev              # Start dev server
yarn build            # Production build
yarn preview          # Preview production build
```

Note: Theme CSS files are automatically copied by `yarn tokens:modular` from the root.

## Structure

```
apps/playground/
├── public/
│   └── themes/           # Runtime CSS files (copied from core)
│       ├── color.css                # Color primitives (--nx-color-*)
│       ├── base-{palette}.css       # Base themes (5)
│       ├── brands-{brand}.css       # Brand themes (5)
│       ├── size-{mode}.css          # Size/spacing modes (5)
│       ├── typography-{mode}.css    # Typography modes (5)
│       ├── shadow-{mode}.css        # Shadow modes (5)
│       ├── radius-{mode}.css        # Border radius modes (5)
│       ├── borderwidth-{mode}.css   # Border width modes (5)
│       ├── typography-utilities.css # text-* utility classes
│       ├── borderwidth-utilities.css # border-default/thick utilities
│       └── shadow-variables.css     # --nx-shadow-* CSS variables
└── src/
    ├── main.tsx          # React entry
    ├── App.tsx           # Main layout (two-column: content + sidebar)
    ├── App.css           # Imports styles/globals.css
    ├── styles/           # Build-time CSS (copied from core)
    │   ├── globals.css   # Tailwind entry with @theme block
    │   ├── color.css     # Color primitives
    │   ├── typography-utilities.css
    │   └── borderwidth-utilities.css
    ├── hooks/
    │   └── useTheme.ts   # Theme state + CSS loading
    ├── store/
    │   └── iconStore.ts  # Zustand store for icon library selection
    ├── lib/
    │   └── icon-registry.ts # Icon mappings across libraries
    └── components/
        ├── ThemeSwitcher.tsx     # Sidebar with theme controls
        ├── ComponentShowcase.tsx # Component preview sections
        ├── IconShowcase.tsx      # Icon grid with library info
        └── PlaygroundIcon.tsx    # Icon component using selected library
```

## How It Works

1. **Build-time CSS** (`src/styles/`) is processed by Tailwind via Vite
   - `globals.css` imports Tailwind with `prefix(nx)` and `@theme` block
   - Generates `nx:` prefixed utility classes with `var()` references

2. **Runtime CSS** (`public/themes/`) is loaded dynamically by `useTheme` hook
   - Color themes swap when base/brand dropdown changes
   - Token modes swap when size/typography/shadow/radius/border dropdowns change

3. **Dark mode** toggles `.dark` class on `<html>`

```tsx
// useTheme hook manages dynamic CSS loading
useEffect(
  () => loadCSS(`/themes/base-${theme.base}.css`, 'base'),
  [theme.base]
);
useEffect(
  () => loadCSS(`/themes/brands-${theme.brand}.css`, 'brand'),
  [theme.brand]
);
useEffect(
  () => loadCSS(`/themes/size-${theme.size}.css`, 'size'),
  [theme.size]
);
// ... etc for each dimension
```

## Available Theme Dimensions

### Color Themes

| Type  | Options                           |
| ----- | --------------------------------- |
| Base  | slate, neutral, zinc, gray, stone |
| Brand | blue, gray, neutral, slate        |
| Mode  | light, dark                       |

### Design Token Modes

| Dimension    | Options                              | Default |
| ------------ | ------------------------------------ | ------- |
| Size         | vega, lyra, maia, mira, nova         | vega    |
| Typography   | vega, lyra, maia, mira, nova         | vega    |
| Shadow       | vega, lyra, maia, mira, nova         | vega    |
| Radius       | blunt, sharp, subtle, smooth, mellow | subtle  |
| Border Width | vega, lyra, maia, mira, nova         | vega    |

### Icon Libraries

| Library  | Package               | Icon Count | Default |
| -------- | --------------------- | ---------- | ------- |
| Tabler   | @tabler/icons-react   | 5,800+     | ✓       |
| Lucide   | lucide-react          | 1,500+     |         |
| Phosphor | @phosphor-icons/react | 9,000+     |         |

## Setup

```bash
# From root
yarn tokens:modular     # Generate modular CSS AND copy to playground
yarn playground         # Start dev server
```

## ComponentShowcase Sections

The showcase demonstrates all token categories:

| Section            | Tokens Used                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Typography         | `typography-display-*`, `typography-heading-*`, `typography-body-*`, `typography-label-*`, `typography-code-*`       |
| Semantic Colors    | `bg-primary-*`, `bg-secondary-*`, `bg-error-*`, etc.                                                                 |
| Shadows            | `shadow-2xs` to `shadow-2xl`, `shadow-inner`, `shadow-focus-default`                                                 |
| Border Radius      | `rounded-base`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full` |
| Spacing            | `w-1` to `w-16`                                                                                                      |
| Icons              | 14 internal DS icons from selected library                                                                           |
| Buttons            | Semantic colors + `rounded-md` for radius                                                                            |
| Cards & Containers | `bg-container`, `bg-popover`, `bg-muted`, `bg-accent`                                                                |
| Borders            | `border-default`, `border-thick`, `border-border-*` colors                                                           |
| Status Messages    | `*-surface`, `*-text` for success/error/warning/info                                                                 |

## Icon Library Switching

The playground allows previewing icons from different libraries to help teams decide which library to use.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  icon-registry.ts                                           │
│  Maps 14 internal icon names → library-specific components  │
│  e.g., "check" → IconCheck (Tabler) | Check (Lucide)        │
├─────────────────────────────────────────────────────────────┤
│  iconStore.ts (Zustand)                                     │
│  Manages selected library state with selective subscriptions│
├─────────────────────────────────────────────────────────────┤
│  PlaygroundIcon component                                   │
│  <PlaygroundIcon name="check" size={16} />                  │
│  Renders icon from currently selected library               │
└─────────────────────────────────────────────────────────────┘
```

### Available Internal Icons

14 icons are mapped across all three libraries:

| Icon Name                  | Use Case              |
| -------------------------- | --------------------- |
| loader                     | Loading states        |
| chevron-down/up/left/right | Dropdowns, navigation |
| check                      | Success, selection    |
| x                          | Close, dismiss        |
| alert-circle               | Error states          |
| alert-triangle             | Warning states        |
| circle-check               | Success confirmation  |
| info-circle                | Information           |
| search                     | Search inputs         |
| eye / eye-off              | Password visibility   |

### Using PlaygroundIcon

```tsx
import { PlaygroundIcon } from './components/PlaygroundIcon';

// Basic usage
<PlaygroundIcon name="check" size={16} />

// With className
<PlaygroundIcon name="loader" className="nx:animate-spin nx:text-primary-text" />
```

### Why Zustand?

Zustand was chosen over React Context for:

- **Selective subscriptions**: Components only re-render when their specific slice changes
- **No provider wrapping**: Simpler component tree
- **Future scalability**: Easy to add more playground state (e.g., component props)

## Adding Components

Edit [ComponentShowcase.tsx](src/components/ComponentShowcase.tsx) to add more component previews using native HTML with `nx:` prefixed classes:

```tsx
// Use semantic color tokens with nx: prefixed Tailwind utilities
<button className="nx:bg-primary-background nx:text-primary-foreground nx:rounded-md nx:px-4 nx:py-2">
  Button
</button>

// Use typography utilities
<p className="nx:typography-body-default">Body text</p>

// Use shadow utilities
<div className="nx:shadow-lg nx:rounded-lg nx:p-4">Card</div>

// Use border width utilities
<div className="nx:border-default nx:border-border-default nx:rounded">Default border</div>
```

## Technical Notes

**Why two CSS locations?**

| Location         | Purpose                                   | Processed By            |
| ---------------- | ----------------------------------------- | ----------------------- |
| `src/styles/`    | Build-time (Tailwind generates utilities) | Vite + Tailwind         |
| `public/themes/` | Runtime (dynamic theme switching)         | Browser (no processing) |

**Why `@theme` (not `@theme inline`) in globals.css?**

| Directive       | Generated CSS                                                    | Runtime Override |
| --------------- | ---------------------------------------------------------------- | ---------------- |
| `@theme inline` | `.nx\:bg-background { background: #f8fafc; }`                    | Not possible     |
| `@theme`        | `.nx\:bg-background { background: var(--nx-color-background); }` | Works            |

The playground needs `@theme` so Tailwind generates CSS variable references that can be overridden when theme CSS files are loaded dynamically.

**Why `html` selector in theme CSS (not `:root`)?**

Theme CSS files use `html { }` instead of `:root { }` to ensure they override Tailwind's `@theme`-generated `:root` rules via cascade order (same specificity, but loaded later).

## UI Layout

The playground uses a two-column layout:

- **Main content** (left): Scrollable component showcase with sticky header
- **Sidebar** (right): Fixed theme controls panel

ThemeSwitcher sections:

- **Appearance**: Light/dark toggle switch
- **Colors**: Base and brand color dropdowns with color indicators
- **Design Tokens**: Size, typography, shadow, radius, border width
- **Icons**: Library selector with icon count
- **Reset button**: Returns to default theme

## Notes

- All CSS files are committed for standalone deployment
- Playground has no direct code dependency on core package
- CSS is copied via `yarn tokens:modular` from root (regenerate after token changes)
- Icon libraries are playground-only dependencies (not part of @nexus/react)
