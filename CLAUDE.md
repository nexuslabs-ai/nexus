# Nexus Design System

> **CRITICAL WORKFLOW - MUST FOLLOW ON EVERY TASK**
>
> | Step | Action | Output |
> |------|--------|--------|
> | **1. Plan** | Create todo list BEFORE any code | TodoWrite with all phases |
> | **2. Execute** | Complete ONE todo item only | Code changes for that phase |
> | **3. Summarize** | Brief summary + key code snippets | `[file.tsx:42-58](path)` format |
> | **4. WAIT** | STOP for user confirmation | Do NOT proceed automatically |
> | **5. Repeat** | Go to step 2 for next phase | Until all todos complete |
>
> **Summary format:** Tables/bullets + "Key Code to Review" section with actual snippets, file:line links, and brief notes.
>
> **Docs check:** After significant changes, update relevant CLAUDE.md and .claude/rules/*.md files.
>
> **NEVER execute multiple phases without stopping for review.**

A multi-framework design system built as a Yarn/Turbo monorepo, starting with React. Components follow shadcn/ui architecture and patterns.

## Project Structure

```
ds/
├── packages/
│   ├── core/           # Design tokens (private) → see packages/core/CLAUDE.md
│   ├── tailwind/       # Tailwind CSS theme (nx: prefix) → see packages/tailwind/CLAUDE.md
│   ├── react/          # React components → see packages/react/CLAUDE.md
│   └── test-utils/     # Test utilities → see packages/test-utils/CLAUDE.md
├── apps/
│   ├── docs/           # Documentation site (planned)
│   └── playground/     # Theme playground for demos → dynamic theme switching
├── .claude/
│   ├── commands/       # Slash commands (/pr, /test, /component, /skill, /agent)
│   ├── rules/          # Convention rules (components, testing, storybook, tokens)
│   ├── skills/         # Multi-step workflow skills (create-component, etc.)
│   └── agents/         # Analysis agents (explore-codebase, etc.)
└── Root configs        # Shared TS, ESLint, Prettier, Turbo
```

## Tech Stack

- **React** 18/19 with TypeScript 5.9
- **Vite** 7.x for building (library mode)
- **Tailwind CSS** 4.x with `nx:` prefix (CSS-first, collision-free)
- **Turbo** 2.7 for monorepo orchestration
- **CVA** (class-variance-authority) for component variants
- **Radix UI** primitives for accessibility
- **Vitest** 4.x with Storybook addon for story-first testing
- **Storybook** 10 for component documentation and testing
- **Chromatic** for visual regression testing
- **Playwright** for real browser component tests

## Commands

```bash
# Build & Development
yarn build              # Build all packages
yarn dev                # Dev mode (watch)
yarn tokens:tailwind    # Generate @nexus/tailwind package CSS
yarn tokens:modular     # Generate modular CSS for playground
yarn clean              # Clean all builds

# Playground (Theme Demo)
yarn playground         # Start playground dev server

# Quality
yarn lint               # Lint all packages
yarn typecheck          # TypeScript check
yarn format             # Format with Prettier

# Testing (Story-First)
yarn test               # Run all tests (unit + storybook)
yarn test:unit          # Run unit tests only (hooks, utilities)
yarn test:storybook     # Run storybook tests only (components)
yarn test:storybook:watch # Watch mode for component tests
yarn test:storybook:ui  # Interactive Vitest UI
yarn test:coverage      # With coverage report

# Storybook
yarn storybook          # Dev server on port 6006
yarn build-storybook    # Build static site

# Visual Regression (Chromatic)
yarn chromatic          # Run visual tests (local, doesn't fail on changes)
yarn chromatic:ci       # Run visual tests (CI, fails if changes need review)
```

## Package Documentation

| Package | CLAUDE.md | Purpose |
|---------|-----------|---------|
| `@nexus/core` | [packages/core/CLAUDE.md](packages/core/CLAUDE.md) | Design tokens (W3C DTCG format) |
| `@nexus/tailwind` | [packages/tailwind/CLAUDE.md](packages/tailwind/CLAUDE.md) | Tailwind CSS theme with nx: prefix |
| `@nexus/react` | [packages/react/CLAUDE.md](packages/react/CLAUDE.md) | React component library |
| `@nexus/test-utils` | [packages/test-utils/CLAUDE.md](packages/test-utils/CLAUDE.md) | Shared testing utilities |
| `@nexus/playground` | [apps/playground/CLAUDE.md](apps/playground/CLAUDE.md) | Theme demo app |

## Convention Rules

| Rule File | Purpose |
|-----------|---------|
| [.claude/rules/components.md](.claude/rules/components.md) | Component structure, props, exports |
| [.claude/rules/testing.md](.claude/rules/testing.md) | Test structure, patterns, a11y |
| [.claude/rules/storybook.md](.claude/rules/storybook.md) | Story structure, required stories |
| [.claude/rules/tokens.md](.claude/rules/tokens.md) | Token format, naming, workflow |
| [.claude/rules/figma.md](.claude/rules/figma.md) | Figma-to-code parity, token mapping |
| [.claude/rules/skills-agents.md](.claude/rules/skills-agents.md) | Skill/agent structure and conventions |

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/linear` | Implement any Linear ticket (read → context → plan → implement → PR) |
| `/linear-component` | Figma component workflow: Linear ticket → Figma analysis → Component → PR |
| `/pr` | Pre-PR checklist (typecheck, lint, test, build) |
| `/pr-review` | Unbiased PR code review (reads PR → reviews against conventions → posts feedback) |
| `/post-merge` | Post-merge cleanup (verify merged → update Linear → switch to main → delete branch) |
| `/test` | Run tests with options |
| `/component` | Scaffold new component with all files |
| `/update-docs` | Update documentation after changes |
| `/skill` | Create or update skills (explore package → define workflow) |
| `/agent` | Create or update agents (explore scope → define analysis) |
| `/linkedin` | Generate LinkedIn post from session (AI-native design system focus) |
| `/figma-analyze` | Analyze Figma component for code parity |

## Code Style

### Formatting (Prettier)
- Single quotes, semicolons, 2-space indent
- 80 char line width, trailing commas (es5)
- Tailwind class sorting enabled

### Naming
- **Components**: PascalCase (`Button`)
- **Files**: kebab-case (`button.tsx`)
- **Tokens**: camelCase in JSON
- **CSS vars**: kebab-case (`--color-background`, primitives use `--nx-*`)
- **Tailwind classes**: `nx:` prefix (`nx:bg-primary`, `nx:text-foreground`)

### Import Order (ESLint auto-sorts)
1. React/React-DOM
2. External packages
3. Internal aliases (`@/`)
4. Parent/sibling imports
5. CSS imports

## Architecture Philosophy

1. **JSON as Source of Truth**: Design tokens in JSON → CSS
2. **shadcn/ui Patterns**: Components follow shadcn architecture
3. **Framework Agnostic Tokens**: Core package enables future Vue/Svelte support

## Notes

- Node >= 20.19.0 required
- Docs app is placeholder (not implemented)
- See package-specific CLAUDE.md files for detailed patterns
