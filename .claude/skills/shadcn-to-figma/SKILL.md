---
name: shadcn-to-figma
description: Generate Figma architecture blueprints from shadcn component code. Use when designers need guidance on structuring components in Figma to match code patterns.
allowed-tools:
  - Read
  - Grep
  - Glob
  - WebFetch
  - Bash
user-invocable: true
---

# shadcn to Figma

## Purpose

Analyze shadcn/ui component code and usage patterns to generate a step-by-step Figma build guide. This helps designers structure components in Figma that align with code implementation.

## When to Use

- Designer needs to create a new component in Figma
- Ensuring Figma component structure matches React composition
- Understanding prop/variant structure before designing
- Creating component sets that mirror code API

## Input

| Format         | Example                                        | Detection                    |
| -------------- | ---------------------------------------------- | ---------------------------- |
| Component name | `Button`, `Accordion`, `Dialog`                | PascalCase or lowercase word |
| shadcn URL     | `https://ui.shadcn.com/docs/components/button` | URL pattern match            |

If input is ambiguous, ask the user to specify the component name.

## Task-Specific Rules

| Context            | Rules to Load                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Always             | [figma.md](../../rules/figma.md), [tokens.md](../../rules/tokens.md)                                   |
| Component analysis | [components.md](../../rules/components.md), [shadcn-divergences.md](../../rules/shadcn-divergences.md) |

## Data Sources

### Primary: shadcn Registry (JSON)

| Data           | URL Pattern                                               | Example       |
| -------------- | --------------------------------------------------------- | ------------- |
| Component code | `https://ui.shadcn.com/r/styles/default/{component}.json` | `button.json` |
| Docs page      | `https://ui.shadcn.com/docs/components/{component}`       | For examples  |

### GitHub Source (Example Code)

Example files are in the shadcn-ui/ui repository:

```
apps/v4/registry/new-york-v4/examples/{component}-{pattern}.tsx
```

Priority examples to fetch:

- `{component}-demo.tsx` — Basic usage
- `{component}-with-icon.tsx` — Icon composition
- `{component}-loading.tsx` — Loading states

Use `gh` CLI:

```bash
gh api repos/shadcn-ui/ui/contents/apps/v4/registry/new-york-v4/examples/{component}-{pattern}.tsx \
  --jq '.content' | base64 --decode
```

## Workflow

### Phase 1: Fetch Component Code

1. **Normalize component name** to lowercase kebab-case:
   - `Button` → `button`
   - `DropdownMenu` → `dropdown-menu`

2. **Fetch main component** from registry:

   ```
   WebFetch: https://ui.shadcn.com/r/styles/default/{component}.json
   ```

   Extract:
   - `files[].content` — Component source code
   - `dependencies` — NPM packages (indicates Radix usage)
   - `registryDependencies` — **Other shadcn components this depends on** (list in Prerequisites)

3. **Check for Nexus implementation** (if exists):
   ```
   Read: packages/react/src/components/ui/{component}.tsx
   ```

### Phase 2: Read Nexus Token System

Read our token files to understand available tokens and map shadcn → Nexus:

```
Read: packages/tailwind/CLAUDE.md              # Token system overview
Read: packages/tailwind/nexus.css              # Semantic tokens (@theme block)
Read: packages/tailwind/variables.css          # Primitive tokens (--nx-*)
Read: packages/tailwind/typography-utilities.css  # Typography classes
Read: .claude/rules/shadcn-divergences.md      # shadcn → Nexus divergences
```

**Key divergences:** Follow the mapping rules in `shadcn-divergences.md`. This file documents all token naming differences between shadcn and Nexus.

For each shadcn color token, find the Nexus equivalent in the CSS files. If no equivalent exists, flag it as "⚠️ Token needed".

### Phase 3: Analyze Code Structure

1. **Identify component type:**
   - **Simple**: Single export → Single component set
   - **Compound**: Multiple exports (Root, Trigger, Content) → Multiple linked components

2. **Extract from CVA variants:**

   ```typescript
   const buttonVariants = cva('...', {
     variants: {
       variant: { default, destructive, outline, ... },
       size: { default, sm, lg, icon }
     }
   })
   ```

3. **Identify props:**
   - Variant props → Figma variant property
   - Boolean props → Figma boolean property
   - Slot props (ReactNode) → Figma instance swap + boolean toggle

### Phase 4: Generate Blueprint

Output using the phased format below.

---

## Output Format

The blueprint guides designers through 6 phases, ending with a verification checklist.

````markdown
## 🎨 Figma Blueprint: {ComponentName}

---

### Phase 1: Understand the Component

| Aspect                   | Value              |
| ------------------------ | ------------------ |
| **Type**                 | Simple / Compound  |
| **Radix Primitive**      | {if applicable}    |
| **shadcn Reference**     | [Link](url)        |
| **Nexus Implementation** | {exists / not yet} |

{If component has dependencies, include:}

**⚠️ Required Components:**

This component depends on: **{Component1}**, **{Component2}**, **{Component3}**

Ensure these components exist in your Figma library before proceeding. If not, build them first.

---

**Component Description** (copy to Figma):

> {What it is} — {Primary use case}. {Key behavior}.
> **Variants:** {list}. **States:** {list}.

{For compound components, include description for each part:}

| Part                       | Description                  |
| -------------------------- | ---------------------------- |
| **{ComponentName}**        | {Root container description} |
| **{ComponentName}Trigger** | {Trigger description}        |
| **{ComponentName}Content** | {Content description}        |

---

### Phase 2: Create Frame Structure

Build this layer hierarchy in Figma.

> **Note:** Output ONLY the structure that matches the component type (simple OR compound, not both).

**Simple Component:**

```
{ComponentName} (Component Set)
└── variant=primary, size=md (Default Frame)
    ├── LeadingIcon (Instance) ← optional slot
    ├── Label (Text) ← primary text
    ├── TrailingIcon (Instance) ← optional slot
    └── Spinner (Instance) ← shown when loading=true
```

**Compound Component:**

```
{ComponentName} (Documentation Frame)
├── {ComponentName}Item (Component Set) ← separate component
│   └── isExpanded=false/true
│       ├── {ComponentName}Trigger (Component) ← separate component
│       │   ├── Label (Text)
│       │   └── Chevron (Instance)
│       └── {ComponentName}Content (Component) ← separate component
│           └── ContentFrame (Frame)
```

> **Important:** Each part exported in code must be a **separate Figma component** (not just a frame). This allows independent composition, just like React.

**Standard Layer Names:**

| Purpose          | Name           |
| ---------------- | -------------- |
| Primary text     | `Label`        |
| Secondary text   | `Description`  |
| Left icon slot   | `LeadingIcon`  |
| Right icon slot  | `TrailingIcon` |
| Expand indicator | `Chevron`      |
| Loading spinner  | `Spinner`      |
| Selection mark   | `Indicator`    |
| Dismiss action   | `CloseButton`  |

**Icon Instance Naming:** Use PascalCase matching code imports (e.g., `IconMail`, `IconChevronDown`, not `mail-icon`).

---

### Phase 3: Set Up Properties

Create these component properties in Figma:

| Property          | Type          | Values                                                | Default |
| ----------------- | ------------- | ----------------------------------------------------- | ------- |
| `variant`         | Variant       | primary, secondary, outline, ghost, destructive, link | primary |
| `size`            | Variant       | sm, md, lg, icon                                      | md      |
| `disabled`        | Boolean       | true/false                                            | false   |
| `loading`         | Boolean       | true/false                                            | false   |
| `hasLeadingIcon`  | Boolean       | true/false                                            | false   |
| `leadingIcon`     | Instance Swap | Icon library                                          | —       |
| `hasTrailingIcon` | Boolean       | true/false                                            | false   |
| `trailingIcon`    | Instance Swap | Icon library                                          | —       |

**State Properties:**

| State    | Implementation                              |
| -------- | ------------------------------------------- |
| Hover    | Background/border color change              |
| Focus    | Focus ring visible                          |
| Active   | Pressed/darker background                   |
| Disabled | `disabled` boolean → reduced opacity        |
| Loading  | `loading` boolean → show Spinner, hide icon |

---

### Phase 4: Apply Design Tokens

Use Figma variables for all values. Map shadcn tokens to Nexus equivalents.

**Spacing & Layout:**

| Element       | Figma Variable      |
| ------------- | ------------------- |
| Padding X     | `spacing/spacing-4` |
| Padding Y     | `spacing/spacing-2` |
| Gap           | `spacing/spacing-2` |
| Border Radius | `radius/md`         |

**Colors (with shadcn → Nexus mapping):**

| Element     | shadcn Token              | Nexus Figma Variable        |
| ----------- | ------------------------- | --------------------------- |
| Background  | `bg-primary`              | `color/primary-background`  |
| Text        | `text-primary-foreground` | `color/primary-foreground`  |
| Hover       | `hover:bg-primary/90`     | `color/primary-hover` ⚡    |
| Active      | `active:bg-primary/80`    | `color/primary-active` ⚡   |
| Border      | `border-input`            | `color/border-default`      |
| Destructive | `bg-destructive`          | `color/error-background` ⚡ |
| Dest. Hover | `hover:bg-destructive/90` | `color/error-hover` ⚡      |

⚡ = Nexus divergence (we use semantic tokens instead of opacity)

{If any token is missing from Nexus, include:}

**⚠️ Tokens Needed:**

- `{token-name}` — {what it's used for}

**Typography:**

| Element    | Figma Style     |
| ---------- | --------------- |
| Body text  | `body/default`  |
| Small text | `body/small`    |
| Label      | `label/default` |

**Auto Layout:**

| Setting   | Value       |
| --------- | ----------- |
| Direction | Horizontal  |
| Align     | Center      |
| Gap       | `spacing-2` |

---

### Phase 5: Build All Variants

**Variant × Size Matrix:**

| Variant     | sm  | default | lg  | icon |
| ----------- | --- | ------- | --- | ---- |
| default     | ○   | ●       | ○   | ○    |
| secondary   | ○   | ○       | ○   | ○    |
| outline     | ○   | ○       | ○   | ○    |
| ghost       | ○   | ○       | ○   | ○    |
| destructive | ○   | ○       | ○   | ○    |
| link        | ○   | ○       | ○   | —    |

● = Start here (default), ○ = Build after, — = Not applicable

---

### Phase 6: Review Examples

Build all usage patterns shown on the shadcn examples page:

**→ [View Examples](https://ui.shadcn.com/create?item={component}-example)**

Review this page and ensure your Figma component supports all patterns shown:

- Basic usage
- With icons (leading, trailing, icon-only)
- Size variations
- Loading states
- Disabled states
- Variant combinations

Create example compositions in Figma that mirror each pattern.

---

### ✅ Verification Checklist

Before handoff, verify:

**Structure:**

- [ ] Frame names use PascalCase matching React exports (`Button`, not `button`)
- [ ] Layer hierarchy mirrors React composition
- [ ] Child layers use standard names (`Label`, `LeadingIcon`, `TrailingIcon`)

**Properties:**

- [ ] Property names match code exactly (`variant`, `size` — not `Style`, `Scale`)
- [ ] Property values are lowercase (`sm`, `md` — not `Small`, `Medium`)
- [ ] Boolean properties use `has*` or `is*` prefix
- [ ] Optional slots have both boolean toggle + instance swap

**Tokens:**

- [ ] All spacing uses `spacing-{n}` variables (no hardcoded px)
- [ ] All colors use semantic tokens (`primary-background`, not `blue-500`)
- [ ] Border radius uses named tokens (`md`, `lg`)

**States:**

- [ ] Hover state shows visual feedback (background/border change)
- [ ] Focus state shows focus ring
- [ ] Active state shows pressed appearance
- [ ] Disabled uses boolean property with reduced opacity
- [ ] Loading shows Spinner, hides icon content

**AI Readability:**

- [ ] Component has description in Figma description field
- [ ] Icon instances use PascalCase names (`IconMail`, not `mail-icon`)
````

---

## Error Handling

| Error                           | Action                                                  |
| ------------------------------- | ------------------------------------------------------- |
| Component not found in registry | Ask user to verify name, suggest similar components     |
| No examples found               | Proceed with main component code only                   |
| Nexus implementation differs    | Note differences, recommend following Nexus conventions |
