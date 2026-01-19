# Figma-to-Code Parity Rules

## Source of Truth

**Always read actual code files** to understand current token structure:

| File                                          | Contains                         |
| --------------------------------------------- | -------------------------------- |
| `packages/tailwind/variables.css`             | Primitive tokens (`--nx-*`)      |
| `packages/tailwind/nexus.css`                 | Semantic tokens (`@theme` block) |
| `packages/react/src/components/ui/button.tsx` | Component patterns               |

The tables below are reference examples. If they conflict with actual code, **code wins**.

## Token Architecture

The design system uses a three-layer token architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: PRIMITIVES (variables.css)                            │
│  --nx-size-5: 20px                                              │
│  --nx-radius-md: 4px                                            │
│  --nx-color-slate-500: #64748b                                  │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: SEMANTIC (nexus.css @theme)                           │
│  --spacing-5: var(--nx-size-5)                                  │
│  --radius-md: var(--nx-radius-md)                               │
│  --color-muted: var(--nx-color-slate-100)                       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: TAILWIND UTILITIES (with nx: prefix)                  │
│  nx:p-5  →  padding: var(--spacing-5)                           │
│  nx:rounded-md  →  border-radius: var(--radius-md)              │
│  nx:bg-muted  →  background: var(--color-muted)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Figma Token Mapping

### Spacing Tokens

Figma uses `spacing-{n}` which maps to code's `--spacing-{n}`:

| Figma Token  | Value | Code Semantic  | Code Primitive | Tailwind  |
| ------------ | ----- | -------------- | -------------- | --------- |
| `spacing-0`  | 0px   | `--spacing-0`  | `--nx-size-0`  | `nx:p-0`  |
| `spacing-1`  | 4px   | `--spacing-1`  | `--nx-size-1`  | `nx:p-1`  |
| `spacing-2`  | 8px   | `--spacing-2`  | `--nx-size-2`  | `nx:p-2`  |
| `spacing-3`  | 12px  | `--spacing-3`  | `--nx-size-3`  | `nx:p-3`  |
| `spacing-4`  | 16px  | `--spacing-4`  | `--nx-size-4`  | `nx:p-4`  |
| `spacing-5`  | 20px  | `--spacing-5`  | `--nx-size-5`  | `nx:p-5`  |
| `spacing-6`  | 24px  | `--spacing-6`  | `--nx-size-6`  | `nx:p-6`  |
| `spacing-8`  | 32px  | `--spacing-8`  | `--nx-size-8`  | `nx:p-8`  |
| `spacing-10` | 40px  | `--spacing-10` | `--nx-size-10` | `nx:p-10` |
| `spacing-12` | 48px  | `--spacing-12` | `--nx-size-12` | `nx:p-12` |
| `spacing-14` | 56px  | `--spacing-14` | `--nx-size-14` | `nx:p-14` |
| `spacing-16` | 64px  | `--spacing-16` | `--nx-size-16` | `nx:p-16` |
| `spacing-20` | 80px  | `--spacing-20` | `--nx-size-20` | `nx:p-20` |
| `spacing-24` | 96px  | `--spacing-24` | `--nx-size-24` | `nx:p-24` |

### Radius Tokens

| Figma Token | Value  | Code Token      | Tailwind          |
| ----------- | ------ | --------------- | ----------------- |
| `sm`        | 2px    | `--radius-sm`   | `nx:rounded-sm`   |
| `md`        | 4px    | `--radius-md`   | `nx:rounded-md`   |
| `lg`        | 6px    | `--radius-lg`   | `nx:rounded-lg`   |
| `xl`        | 8px    | `--radius-xl`   | `nx:rounded-xl`   |
| `2xl`       | 12px   | `--radius-2xl`  | `nx:rounded-2xl`  |
| `3xl`       | 20px   | `--radius-3xl`  | `nx:rounded-3xl`  |
| `full`      | 9999px | `--radius-full` | `nx:rounded-full` |

### Color Tokens

| Figma Token            | Code Token                     | Usage               |
| ---------------------- | ------------------------------ | ------------------- |
| `background`           | `--color-background`           | Page background     |
| `foreground`           | `--color-foreground`           | Primary text        |
| `muted`                | `--color-muted`                | Muted backgrounds   |
| `muted-foreground`     | `--color-muted-foreground`     | Secondary text      |
| `primary-background`   | `--color-primary-background`   | Primary buttons     |
| `primary-foreground`   | `--color-primary-foreground`   | Text on primary     |
| `primary-hover`        | `--color-primary-hover`        | Primary hover state |
| `secondary-background` | `--color-secondary-background` | Secondary buttons   |
| `error-background`     | `--color-error-background`     | Error/destructive   |
| `border-default`       | `--color-border-default`       | Default borders     |

### Typography Tokens

| Figma Style     | Code Utility                                 |
| --------------- | -------------------------------------------- |
| `body/xsmall`   | `nx:typography-body-xsmall` (12px)           |
| `body/small`    | `nx:typography-body-small` (14px)            |
| `body/default`  | `nx:typography-body-default` (16px)          |
| `body/large`    | `nx:typography-body-large` (18px)            |
| `label/small`   | `nx:typography-label-small` (12px, medium)   |
| `label/default` | `nx:typography-label-default` (14px, medium) |

## Prop Naming Conventions

### Size Prop Values

Use abbreviated lowercase values:

```typescript
// Correct
size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"

// Incorrect
size?: "2X Small" | "X Small" | "Small" | "Medium" | "Large"
```

| Figma (Correct) | Figma (Avoid) | Code    |
| --------------- | ------------- | ------- |
| `2xs`           | `2X Small`    | `"2xs"` |
| `xs`            | `X Small`     | `"xs"`  |
| `sm`            | `Small`       | `"sm"`  |
| `md`            | `Medium`      | `"md"`  |
| `lg`            | `Large`       | `"lg"`  |
| `xl`            | `X-Large`     | `"xl"`  |
| `2xl`           | `2X-Large`    | `"2xl"` |

### Variant Prop Values

Use lowercase descriptive names:

```typescript
// Correct
variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive"

// Incorrect
variant?: "Default" | "Primary" | "Secondary"
```

### Boolean Props

Use `has*` or `is*` prefix for boolean variant props:

```typescript
// Correct - Figma boolean property
hasImage?: boolean  // Instead of State=Image/Fallback

// Code handles internally
{hasImage ? <img /> : <Fallback />}
```

### Figma Slot Props → React Optional Props

Figma requires **two separate props** to handle optional slots:

1. A boolean toggle (`hasLeftIcon`)
2. The slot content (`leftIcon`)

In React, **simplify to a single optional prop**. The prop's presence acts as the boolean:

```typescript
// ❌ Don't mirror Figma's two-prop pattern
interface Props {
  hasLeftIcon?: boolean;
  leftIcon?: React.ReactNode;
}

// ✅ Simplify to single optional prop
interface Props {
  leftIcon?: React.ReactNode;
}

// Check presence in component
{
  leftIcon && leftIcon;
}
```

**Common slot patterns to simplify:**

| Figma Props                  | React Prop              |
| ---------------------------- | ----------------------- |
| `hasLeftIcon` + `leftIcon`   | `leftIcon?: ReactNode`  |
| `hasRightIcon` + `rightIcon` | `rightIcon?: ReactNode` |
| `hasAvatar` + `avatar`       | `avatar?: ReactNode`    |
| `hasIcon` + `icon`           | `icon?: ReactNode`      |
| `hasPrefix` + `prefix`       | `prefix?: ReactNode`    |
| `hasSuffix` + `suffix`       | `suffix?: ReactNode`    |
| `hasLeading` + `leading`     | `leading?: ReactNode`   |
| `hasTrailing` + `trailing`   | `trailing?: ReactNode`  |

### Shape Props

Use camelCase:

```typescript
// Acceptable
shape?: "circle" | "roundedRectangle"

// Also acceptable (shorter)
shape?: "circle" | "rounded"
```

## Figma ↔ Code Divergence Patterns

This section documents fundamental differences in how Figma and React handle common patterns. Understanding these is critical for both designers building components and developers implementing them.

### States & Interactivity

| State    | Figma Approach                            | React/Code Approach                    |
| -------- | ----------------------------------------- | -------------------------------------- |
| Hover    | Separate variant OR Interactive Component | CSS pseudo-class (`:hover`)            |
| Focus    | Separate variant with focus ring          | CSS pseudo-class (`:focus-visible`)    |
| Active   | Separate variant                          | CSS pseudo-class (`:active`)           |
| Disabled | Boolean property + visual changes         | `disabled` prop + `:disabled` selector |
| Loading  | Boolean property + spinner slot           | `loading` prop + conditional render    |
| Error    | Boolean property + error styling          | `error` prop OR validation state       |

**Guidance:** For hover/focus/active, prefer Figma's Interactive Components feature when states only differ in color/shadow. Use explicit variants when states have different layouts or content. In code, use CSS pseudo-classes for styling; the `disabled` prop maps directly to the HTML attribute.

### Slots & Optional Content

| Pattern        | Figma Approach                      | React Approach                    |
| -------------- | ----------------------------------- | --------------------------------- |
| Optional icon  | `hasIcon` (boolean) + `icon` (swap) | `icon?: ReactNode`                |
| Optional slot  | `hasSlot` (boolean) + `slot` (swap) | `slotName?: ReactNode`            |
| Multiple slots | Multiple boolean + swap pairs       | Multiple optional props           |
| Empty state    | Variant or boolean toggle           | Conditional render (`{x && <X>}`) |

**Guidance:** Figma requires two props (boolean toggle + instance swap) because it cannot conditionally show/hide layers based on content presence. React simplifies to a single optional prop—presence indicates visibility. See "Figma Slot Props → React Optional Props" above for the full mapping table.

### Polymorphism & Composition

| Pattern      | Figma Approach                         | React Approach                     |
| ------------ | -------------------------------------- | ---------------------------------- |
| asChild      | N/A (not representable)                | Radix Slot pattern for composition |
| Render as    | Separate component or documentation    | `as` prop or polymorphic component |
| Nested slots | Instance swap with component instances | `children` or named slot props     |
| Compound     | Multiple linked component sets         | Multiple exports composed together |

**Guidance:** The `asChild` pattern is code-only and allows any element to receive component styles. In Figma, document this capability but don't try to represent it visually. For compound components, mirror the React composition hierarchy in Figma's layer structure (see "Compound Component Frame Naming" below).

### Responsive & Layout

| Pattern        | Figma Approach                 | React Approach                         |
| -------------- | ------------------------------ | -------------------------------------- |
| Responsive     | Separate frames per breakpoint | Tailwind responsive prefixes (`md:`)   |
| Fluid width    | "Fill container" constraint    | `w-full` or flex-grow                  |
| Fixed vs fluid | Constraints panel              | Explicit width utilities or `flex-1`   |
| Spacing        | Auto layout gap + padding      | Gap/padding utilities (`nx:gap-4`)     |
| Stack vs wrap  | Auto layout direction          | `flex-col` vs `flex-row` + `flex-wrap` |

**Guidance:** Figma uses constraints and auto layout; code uses Tailwind utilities. Both should use the same spacing tokens (`spacing-4` → `nx:gap-4`). Document responsive behavior in Figma using separate frames for breakpoints, but code handles it with responsive prefixes on a single component.

## AI Readability

This section ensures Figma components can be reliably parsed by AI tools for code generation.

### Property Names

Figma component property names **must exactly match** code prop names:

| Code Prop     | Figma Property | ❌ Avoid                        |
| ------------- | -------------- | ------------------------------- |
| `variant`     | `variant`      | Style, Type, Appearance         |
| `size`        | `size`         | Scale, Dimension, ComponentSize |
| `disabled`    | `disabled`     | isDisabled, Inactive            |
| `orientation` | `orientation`  | Direction, Layout               |

### Child Layer Naming

Standardized names for internal layers enable AI to map Figma structure to code slots:

| Layer Purpose        | Figma Name     | Maps to Code                   |
| -------------------- | -------------- | ------------------------------ |
| Primary text content | `Label`        | `children` (text)              |
| Secondary text       | `Description`  | `description` prop             |
| Icon before label    | `LeadingIcon`  | `leftIcon` / `leadingIcon`     |
| Icon after label     | `TrailingIcon` | `rightIcon` / `trailingIcon`   |
| Standalone icon      | `Icon`         | `icon` prop                    |
| Loading indicator    | `Spinner`      | Loading state indicator        |
| Visual indicator     | `Indicator`    | Active/selected dot, checkmark |
| Avatar/image slot    | `Avatar`       | `avatar` prop                  |
| Badge/count          | `Badge`        | `badge` prop                   |
| Chevron/arrow        | `Chevron`      | Expand/collapse indicator      |
| Close button         | `CloseButton`  | Dismiss action                 |
| Overlay/backdrop     | `Overlay`      | Modal backdrop                 |

### Component Descriptions

Every Figma component must have a description that helps both designers and AI understand its purpose. Use design language, not code terminology.

**Description Template:**

```
{What it is} — {Primary use case}. {Key behavior or interaction note}.

Variants: {list main variants}
States: {list interactive states}
```

### Description Examples

**Simple Components:**

| Component    | Description                                                                                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Button**   | Primary action trigger — Use for form submissions, confirmations, and key user actions. Supports icons for added context. **Variants:** primary, secondary, outline, ghost, destructive, link. **States:** default, hover, focus, active, disabled, loading. |
| **Badge**    | Status indicator — Highlights counts, labels, or states inline with other content. Use sparingly to draw attention to important information. **Variants:** default, secondary, outline, destructive.                                                         |
| **Avatar**   | User representation — Displays profile images or initials as a visual identifier. Falls back to initials or placeholder when no image is available. **Sizes:** 2xs through 4xl. **Shapes:** circle, rounded.                                                 |
| **Input**    | Text entry field — Collects single-line user input. Pair with Label above and HelperText below for context. **States:** default, focus, filled, error, disabled.                                                                                             |
| **Checkbox** | Binary selection — Allows users to toggle an option on or off. Use in forms or settings where multiple independent choices are available. **States:** unchecked, checked, indeterminate, disabled.                                                           |
| **Switch**   | Instant toggle — Immediately activates or deactivates a setting. Use for preferences that take effect without requiring a save action. **States:** off, on, disabled.                                                                                        |
| **Tooltip**  | Contextual hint — Reveals additional information on hover or focus. Keep content brief and helpful. Appears adjacent to trigger element.                                                                                                                     |
| **Skeleton** | Loading placeholder — Indicates content is being fetched. Mimics the shape of incoming content to reduce layout shift.                                                                                                                                       |

**Compound Component Parts:**

| Part                    | Description                                                                                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DialogContent**       | Modal container — Centers important content and actions that require user attention. Dims the background to focus user on the dialog. Use for confirmations, forms, or critical information. |
| **DialogHeader**        | Modal title area — Contains the dialog title and optional close button. Establishes context for the dialog content below.                                                                    |
| **DialogFooter**        | Modal action area — Houses primary and secondary action buttons. Place the primary action on the right, cancel/secondary on the left.                                                        |
| **AccordionItem**       | Expandable section — Contains a trigger and collapsible content. Use to organize related information that doesn't need to be visible simultaneously.                                         |
| **AccordionTrigger**    | Section header — Clickable area that expands or collapses the associated content. Shows current state via chevron rotation.                                                                  |
| **AccordionContent**    | Revealed content — Hidden by default, appears when the trigger is activated. Contains detailed information related to the trigger label.                                                     |
| **TabsList**            | Navigation bar — Horizontal group of tab triggers. Indicates which section is currently active.                                                                                              |
| **TabsTrigger**         | Section selector — Individual tab button that switches visible content. Shows active state when its content is displayed.                                                                    |
| **TabsContent**         | Tab panel — Content area associated with a specific tab. Only one panel is visible at a time.                                                                                                |
| **SelectTrigger**       | Dropdown button — Displays current selection and opens the options menu when clicked. Shows placeholder when no selection is made.                                                           |
| **SelectContent**       | Options container — Floating panel containing selectable items. Appears below or above the trigger based on available space.                                                                 |
| **SelectItem**          | Option entry — Single selectable choice within the dropdown. Shows checkmark when selected.                                                                                                  |
| **DropdownMenuTrigger** | Menu activator — Button or element that opens the dropdown menu on click. Often an icon button with more options.                                                                            |
| **DropdownMenuContent** | Menu container — Floating panel with action items. Appears on trigger click and dismisses on selection or outside click.                                                                     |
| **DropdownMenuItem**    | Action option — Single clickable item in the menu. Can include icons, shortcuts, and destructive styling.                                                                                    |
| **ToastProvider**       | Notification area — Container region where toast messages appear. Typically positioned at a screen corner.                                                                                   |
| **Toast**               | Temporary message — Brief notification that appears and auto-dismisses. Use for success confirmations, errors, or updates. **Variants:** default, success, error, warning.                   |

### State Implementation

Choose the right approach for interactive states:

| Approach                   | When to Use                                     | Example                                                 |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| **Interactive Components** | States differ only in color, shadow, or opacity | Button hover (background color change)                  |
| **Explicit Variants**      | States have different content or layout         | Loading state (shows spinner), Error state (shows icon) |
| **Boolean Property**       | State is independently toggleable               | `disabled`, `loading`, `hasError`                       |

**Rule of thumb:** If swapping to a state requires adding/removing elements, use explicit variants or boolean properties. If it's purely visual, use Interactive Components.

## Component Size Reference

Common component sizes with their spacing token mappings:

| Size  | Dimensions | Spacing Token | Use Case                |
| ----- | ---------- | ------------- | ----------------------- |
| `2xs` | 20px       | `spacing-5`   | Compact avatars, badges |
| `xs`  | 24px       | `spacing-6`   | Small avatars, icons    |
| `sm`  | 32px       | `spacing-8`   | Small buttons, inputs   |
| `md`  | 40px       | `spacing-10`  | Default buttons, inputs |
| `lg`  | 48px       | `spacing-12`  | Large buttons           |
| `xl`  | 56px       | `spacing-14`  | Extra large             |
| `2xl` | 64px       | `spacing-16`  | Profile avatars         |
| `3xl` | 80px       | `spacing-20`  | Large profile           |
| `4xl` | 96px       | `spacing-24`  | Hero avatars            |

## MCP Tools Reference

When analyzing Figma with MCP tools:

### get_variable_defs

Returns token values used in the component. Compare each token:

- Does the name match a semantic token in `nexus.css`?
- Does the value match the primitive in `variables.css`?

### get_design_context

Returns generated TypeScript props. Verify:

- Prop names follow conventions (lowercase, abbreviated)
- Boolean props use `has*`/`is*` pattern
- Enum values are lowercase

### get_metadata

Returns component variant structure. Check:

- Frame names use `prop=value` format
- All expected variants are present

## Compound Component Frame Naming

For shadcn/Radix compound components, Figma frame names **must match** the code export names. This ensures seamless Figma-to-code conversion.

### Naming Convention

```
{ComponentName}{PartName}
```

- **PascalCase** for all frame names
- **No spaces or separators** between component and part name
- Frame name should exactly match the React export

### Common Compound Components

| Component        | Figma Frame             | Code Export             | data-slot                 |
| ---------------- | ----------------------- | ----------------------- | ------------------------- |
| **Accordion**    |                         |                         |                           |
|                  | `Accordion`             | `Accordion`             | `accordion`               |
|                  | `AccordionItem`         | `AccordionItem`         | `accordion-item`          |
|                  | `AccordionTrigger`      | `AccordionTrigger`      | `accordion-trigger`       |
|                  | `AccordionContent`      | `AccordionContent`      | `accordion-content`       |
| **Dialog**       |                         |                         |                           |
|                  | `Dialog`                | `Dialog`                | `dialog`                  |
|                  | `DialogTrigger`         | `DialogTrigger`         | `dialog-trigger`          |
|                  | `DialogContent`         | `DialogContent`         | `dialog-content`          |
|                  | `DialogHeader`          | `DialogHeader`          | `dialog-header`           |
|                  | `DialogTitle`           | `DialogTitle`           | `dialog-title`            |
|                  | `DialogDescription`     | `DialogDescription`     | `dialog-description`      |
|                  | `DialogFooter`          | `DialogFooter`          | `dialog-footer`           |
|                  | `DialogClose`           | `DialogClose`           | `dialog-close`            |
| **Tabs**         |                         |                         |                           |
|                  | `Tabs`                  | `Tabs`                  | `tabs`                    |
|                  | `TabsList`              | `TabsList`              | `tabs-list`               |
|                  | `TabsTrigger`           | `TabsTrigger`           | `tabs-trigger`            |
|                  | `TabsContent`           | `TabsContent`           | `tabs-content`            |
| **Select**       |                         |                         |                           |
|                  | `Select`                | `Select`                | `select`                  |
|                  | `SelectTrigger`         | `SelectTrigger`         | `select-trigger`          |
|                  | `SelectContent`         | `SelectContent`         | `select-content`          |
|                  | `SelectItem`            | `SelectItem`            | `select-item`             |
|                  | `SelectSeparator`       | `SelectSeparator`       | `select-separator`        |
| **DropdownMenu** |                         |                         |                           |
|                  | `DropdownMenu`          | `DropdownMenu`          | `dropdown-menu`           |
|                  | `DropdownMenuTrigger`   | `DropdownMenuTrigger`   | `dropdown-menu-trigger`   |
|                  | `DropdownMenuContent`   | `DropdownMenuContent`   | `dropdown-menu-content`   |
|                  | `DropdownMenuItem`      | `DropdownMenuItem`      | `dropdown-menu-item`      |
|                  | `DropdownMenuSeparator` | `DropdownMenuSeparator` | `dropdown-menu-separator` |

### Frame Naming Anti-Patterns

| ❌ Incorrect        | ✅ Correct         | Why                      |
| ------------------- | ------------------ | ------------------------ |
| `Trigger`           | `AccordionTrigger` | Missing component prefix |
| `Accordion Trigger` | `AccordionTrigger` | No spaces allowed        |
| `accordion-trigger` | `AccordionTrigger` | Must be PascalCase       |
| `Close Button`      | `DialogClose`      | Use shadcn part name     |
| `Content Area`      | `DialogContent`    | Use exact shadcn name    |
| `Item`              | `AccordionItem`    | Missing component prefix |

### Figma Layer Hierarchy

Figma auto layout hierarchy should mirror React composition:

```
Accordion (frame)
├── AccordionItem (frame)
│   ├── AccordionTrigger (frame)
│   │   ├── Text
│   │   └── ChevronIcon
│   └── AccordionContent (frame)
│       └── Content text/elements
```

This maps directly to React:

```tsx
<Accordion>
  <AccordionItem>
    <AccordionTrigger>
      Text
      <ChevronIcon />
    </AccordionTrigger>
    <AccordionContent>Content text/elements</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Compound Component Organization

Each part of a compound component should be a **separate Figma component** (not just a frame), enabling:

| Part Type | Figma Component Type | Why                                   |
| --------- | -------------------- | ------------------------------------- |
| Root      | Component Set        | Contains variants (type, orientation) |
| Item      | Component Set        | Contains states (expanded, collapsed) |
| Trigger   | Component            | Reusable, swappable in Item instances |
| Content   | Component            | Reusable, can contain any content     |

**Key principle:** If a part is exported separately in code, it should be a separate Figma component. This allows designers to compose parts independently, just like developers compose React components.

### Icon Instance Naming

Icon instances in Figma should use PascalCase matching code imports:

| ❌ Incorrect   | ✅ Correct        | Code Import                  |
| -------------- | ----------------- | ---------------------------- |
| `chevron-down` | `IconChevronDown` | `import { IconChevronDown }` |
| `close`        | `IconX`           | `import { IconX }`           |
| `search icon`  | `IconSearch`      | `import { IconSearch }`      |

## Do Not

- Use verbose size names (`Small` instead of `sm`)
- Use uppercase in prop values (`Primary` instead of `primary`)
- Use `State=Image/Fallback` pattern (use `hasImage` boolean)
- Reference primitive tokens directly in Figma (use semantic names)
- Mix token systems (Figma spacing + hardcoded px values)
- Use generic frame names without component prefix (`Trigger` instead of `AccordionTrigger`)
- Use spaces or kebab-case in frame names (use PascalCase)

## Checklist Before Implementation

- [ ] All size values are abbreviated (`xs`, `sm`, `md`, etc.)
- [ ] Boolean states use `has*` or `is*` props
- [ ] Figma slot pairs (`has*` + slot) simplified to single optional prop in code
- [ ] Spacing uses `spacing-{n}` tokens
- [ ] Radius uses named tokens (`md`, `lg`, `2xl`, `full`)
- [ ] Colors reference semantic tokens
- [ ] Typography uses named styles (`body/small`, etc.)
- [ ] Compound component frames use PascalCase with component prefix
- [ ] Frame hierarchy mirrors React composition structure
- [ ] Icon instances use PascalCase matching code imports
