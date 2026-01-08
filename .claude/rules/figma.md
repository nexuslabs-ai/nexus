# Figma-to-Code Parity Rules

> **Workflow:** Follow the CRITICAL WORKFLOW defined in root `CLAUDE.md`.

## Source of Truth

**Always read actual code files** to understand current token structure:

| File | Contains |
|------|----------|
| `packages/tailwind/variables.css` | Primitive tokens (`--nx-*`) |
| `packages/tailwind/nexus.css` | Semantic tokens (`@theme` block) |
| `packages/react/src/components/ui/button.tsx` | Component patterns |

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

| Figma Token | Value | Code Semantic | Code Primitive | Tailwind |
|-------------|-------|---------------|----------------|----------|
| `spacing-0` | 0px | `--spacing-0` | `--nx-size-0` | `nx:p-0` |
| `spacing-1` | 4px | `--spacing-1` | `--nx-size-1` | `nx:p-1` |
| `spacing-2` | 8px | `--spacing-2` | `--nx-size-2` | `nx:p-2` |
| `spacing-3` | 12px | `--spacing-3` | `--nx-size-3` | `nx:p-3` |
| `spacing-4` | 16px | `--spacing-4` | `--nx-size-4` | `nx:p-4` |
| `spacing-5` | 20px | `--spacing-5` | `--nx-size-5` | `nx:p-5` |
| `spacing-6` | 24px | `--spacing-6` | `--nx-size-6` | `nx:p-6` |
| `spacing-8` | 32px | `--spacing-8` | `--nx-size-8` | `nx:p-8` |
| `spacing-10` | 40px | `--spacing-10` | `--nx-size-10` | `nx:p-10` |
| `spacing-12` | 48px | `--spacing-12` | `--nx-size-12` | `nx:p-12` |
| `spacing-14` | 56px | `--spacing-14` | `--nx-size-14` | `nx:p-14` |
| `spacing-16` | 64px | `--spacing-16` | `--nx-size-16` | `nx:p-16` |
| `spacing-20` | 80px | `--spacing-20` | `--nx-size-20` | `nx:p-20` |
| `spacing-24` | 96px | `--spacing-24` | `--nx-size-24` | `nx:p-24` |

### Radius Tokens

| Figma Token | Value | Code Token | Tailwind |
|-------------|-------|------------|----------|
| `sm` | 2px | `--radius-sm` | `nx:rounded-sm` |
| `md` | 4px | `--radius-md` | `nx:rounded-md` |
| `lg` | 6px | `--radius-lg` | `nx:rounded-lg` |
| `xl` | 8px | `--radius-xl` | `nx:rounded-xl` |
| `2xl` | 12px | `--radius-2xl` | `nx:rounded-2xl` |
| `3xl` | 20px | `--radius-3xl` | `nx:rounded-3xl` |
| `full` | 9999px | `--radius-full` | `nx:rounded-full` |

### Color Tokens

| Figma Token | Code Token | Usage |
|-------------|------------|-------|
| `background` | `--color-background` | Page background |
| `foreground` | `--color-foreground` | Primary text |
| `muted` | `--color-muted` | Muted backgrounds |
| `muted-foreground` | `--color-muted-foreground` | Secondary text |
| `primary-background` | `--color-primary-background` | Primary buttons |
| `primary-foreground` | `--color-primary-foreground` | Text on primary |
| `primary-hover` | `--color-primary-hover` | Primary hover state |
| `secondary-background` | `--color-secondary-background` | Secondary buttons |
| `error-background` | `--color-error-background` | Error/destructive |
| `border-default` | `--color-border-default` | Default borders |

### Typography Tokens

| Figma Style | Code Utility |
|-------------|--------------|
| `body/xsmall` | `nx:text-body-xsmall` (12px) |
| `body/small` | `nx:text-body-small` (14px) |
| `body/default` | `nx:text-body-default` (16px) |
| `body/large` | `nx:text-body-large` (18px) |
| `label/small` | `nx:text-label-small` (12px, medium) |
| `label/default` | `nx:text-label-default` (14px, medium) |

## Prop Naming Conventions

### Size Prop Values

Use abbreviated lowercase values:

```typescript
// Correct
size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"

// Incorrect
size?: "2X Small" | "X Small" | "Small" | "Medium" | "Large"
```

| Figma (Correct) | Figma (Avoid) | Code |
|-----------------|---------------|------|
| `2xs` | `2X Small` | `"2xs"` |
| `xs` | `X Small` | `"xs"` |
| `sm` | `Small` | `"sm"` |
| `md` | `Medium` | `"md"` |
| `lg` | `Large` | `"lg"` |
| `xl` | `X-Large` | `"xl"` |
| `2xl` | `2X-Large` | `"2xl"` |

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

### Shape Props

Use camelCase:

```typescript
// Acceptable
shape?: "circle" | "roundedRectangle"

// Also acceptable (shorter)
shape?: "circle" | "rounded"
```

## Component Size Reference

Common component sizes with their spacing token mappings:

| Size | Dimensions | Spacing Token | Use Case |
|------|------------|---------------|----------|
| `2xs` | 20px | `spacing-5` | Compact avatars, badges |
| `xs` | 24px | `spacing-6` | Small avatars, icons |
| `sm` | 32px | `spacing-8` | Small buttons, inputs |
| `md` | 40px | `spacing-10` | Default buttons, inputs |
| `lg` | 48px | `spacing-12` | Large buttons |
| `xl` | 56px | `spacing-14` | Extra large |
| `2xl` | 64px | `spacing-16` | Profile avatars |
| `3xl` | 80px | `spacing-20` | Large profile |
| `4xl` | 96px | `spacing-24` | Hero avatars |

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

| Component | Figma Frame | Code Export | data-slot |
|-----------|-------------|-------------|-----------|
| **Accordion** | | | |
| | `Accordion` | `Accordion` | `accordion` |
| | `AccordionItem` | `AccordionItem` | `accordion-item` |
| | `AccordionTrigger` | `AccordionTrigger` | `accordion-trigger` |
| | `AccordionContent` | `AccordionContent` | `accordion-content` |
| **Dialog** | | | |
| | `Dialog` | `Dialog` | `dialog` |
| | `DialogTrigger` | `DialogTrigger` | `dialog-trigger` |
| | `DialogContent` | `DialogContent` | `dialog-content` |
| | `DialogHeader` | `DialogHeader` | `dialog-header` |
| | `DialogTitle` | `DialogTitle` | `dialog-title` |
| | `DialogDescription` | `DialogDescription` | `dialog-description` |
| | `DialogFooter` | `DialogFooter` | `dialog-footer` |
| | `DialogClose` | `DialogClose` | `dialog-close` |
| **Tabs** | | | |
| | `Tabs` | `Tabs` | `tabs` |
| | `TabsList` | `TabsList` | `tabs-list` |
| | `TabsTrigger` | `TabsTrigger` | `tabs-trigger` |
| | `TabsContent` | `TabsContent` | `tabs-content` |
| **Select** | | | |
| | `Select` | `Select` | `select` |
| | `SelectTrigger` | `SelectTrigger` | `select-trigger` |
| | `SelectContent` | `SelectContent` | `select-content` |
| | `SelectItem` | `SelectItem` | `select-item` |
| | `SelectSeparator` | `SelectSeparator` | `select-separator` |
| **DropdownMenu** | | | |
| | `DropdownMenu` | `DropdownMenu` | `dropdown-menu` |
| | `DropdownMenuTrigger` | `DropdownMenuTrigger` | `dropdown-menu-trigger` |
| | `DropdownMenuContent` | `DropdownMenuContent` | `dropdown-menu-content` |
| | `DropdownMenuItem` | `DropdownMenuItem` | `dropdown-menu-item` |
| | `DropdownMenuSeparator` | `DropdownMenuSeparator` | `dropdown-menu-separator` |

### Frame Naming Anti-Patterns

| ❌ Incorrect | ✅ Correct | Why |
|--------------|------------|-----|
| `Trigger` | `AccordionTrigger` | Missing component prefix |
| `Accordion Trigger` | `AccordionTrigger` | No spaces allowed |
| `accordion-trigger` | `AccordionTrigger` | Must be PascalCase |
| `Close Button` | `DialogClose` | Use shadcn part name |
| `Content Area` | `DialogContent` | Use exact shadcn name |
| `Item` | `AccordionItem` | Missing component prefix |

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
    <AccordionContent>
      Content text/elements
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### Icon Instance Naming

Icon instances in Figma should use PascalCase matching code imports:

| ❌ Incorrect | ✅ Correct | Code Import |
|--------------|------------|-------------|
| `chevron-down` | `IconChevronDown` | `import { IconChevronDown }` |
| `close` | `IconX` | `import { IconX }` |
| `search icon` | `IconSearch` | `import { IconSearch }` |

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
- [ ] Spacing uses `spacing-{n}` tokens
- [ ] Radius uses named tokens (`md`, `lg`, `2xl`, `full`)
- [ ] Colors reference semantic tokens
- [ ] Typography uses named styles (`body/small`, etc.)
- [ ] Compound component frames use PascalCase with component prefix
- [ ] Frame hierarchy mirrors React composition structure
- [ ] Icon instances use PascalCase matching code imports
