# Nexus Design System

A multi-framework design system built as a Yarn/Turbo monorepo, starting with React. Components follow shadcn/ui architecture and patterns.

## Workflow Instructions

When working on tasks:

1. **Plan first**: Create a clear todo list with steps before starting
2. **Summarize after each step**: Provide a concise summary of what was done after completing each todo/phase
3. **Show key code for review**: In each summary, include a "Key Code to Review" section:
   - Show the actual code snippets (not just file references) for important implementations
   - Include file path and line numbers above each snippet: `[file.tsx:42-58](path/to/file.tsx#L42-L58)`
   - Add brief note explaining what to look for (e.g., "variant logic here", "main state handling")
   - Focus on: core logic, complex conditions, key patterns, anything non-obvious
4. **Wait for confirmation**: Pause after each summary for user review before moving to the next step
5. **Keep summaries brief**: Use tables or bullet points, not lengthy explanations
6. **Keep docs in sync**: After significant changes to a package, proactively check if updates are needed to:
   - Package `CLAUDE.md` (if behavior/structure changed)
   - Related `.claude/rules/*.md` (if conventions changed)
   - Root `CLAUDE.md` (if project-wide patterns changed)

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
- **Vitest** 4.x for testing (70% coverage thresholds)
- **Storybook** 10 for component documentation

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

# Testing
yarn test               # Run all tests
yarn test:watch         # Watch mode
yarn test:coverage      # With coverage report

# Storybook (from packages/react)
yarn storybook          # Dev server on port 6006
yarn build-storybook    # Build static site
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
| [.claude/rules/skills-agents.md](.claude/rules/skills-agents.md) | Skill/agent structure and conventions |

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/pr` | Pre-PR checklist (typecheck, lint, test, build) |
| `/test` | Run tests with options |
| `/component` | Scaffold new component with all files |
| `/update-docs` | Update documentation after changes |
| `/skill` | Create or update skills (explore package → define workflow) |
| `/agent` | Create or update agents (explore scope → define analysis) |
| `/linkedin` | Generate LinkedIn post from session (creativity 1-5) |
| `/twitter` | Generate Twitter/X post (single/thread/hot-take) |

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
