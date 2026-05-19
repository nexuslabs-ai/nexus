# Nexus Design System

## Core Operating Principles

These principles are non-negotiable. They apply to ALL work in this codebase.

### Quality Over Speed

**We don't care about token usage or time. Quality is more important than speed at any cost.**

- Never use shortcuts to get things done
- Find the root cause of problems, don't just patch symptoms
- Discuss proper solutions with the user when unsure
- A proper fix is worth 10x the effort of a hack

### Delegate to Agents

**Always delegate specialized work to the appropriate agent.** Do not attempt to do it yourself.

| Task Type              | Delegate To         |
| ---------------------- | ------------------- |
| Code implementation    | sde2                |
| Test implementation    | tester              |
| Architecture decisions | principal-architect |
| Documentation updates  | technical-writer    |
| Dependency analysis    | devops              |

Why delegate?

- Agents have specialized knowledge and context
- Agents enforce domain-specific quality standards
- Attempting tasks outside your expertise leads to shortcuts
- Each agent has a "No Shortcuts Policy" that prevents hacks

### No Shortcuts Policy

When encountering errors, test failures, or challenges:

| Shortcut ❌                     | Proper Approach ✅                 |
| ------------------------------- | ---------------------------------- |
| Weaken assertions to pass tests | Fix the underlying code or fixture |
| Add `.skip` to failing tests    | Understand and fix the root cause  |
| Use `as any` for type errors    | Fix the type properly              |
| Quick patch to satisfy review   | Implement proper solution          |
| Guess when unsure               | ASK the user instead               |

**Remember:** A shortcut today becomes a debugging nightmare tomorrow. We have the time to do it right.

---

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
├── reports/
│   └── deps/           # Generated dependency analysis reports
├── .claude/
│   ├── commands/       # Slash commands (/implement, /pr-review, /pr-fix, /ui-audit, etc.)
│   ├── rules/          # Convention rules (components, testing, tokens, etc.)
│   ├── skills/         # Auto-discovered capabilities (SKILL.md format; the primary skill of a slash command uses the `-guide` suffix — mode/specialization skills like `pr-review-follow-up` do not)
│   │   ├── pr-review-guide/      # PR review framework
│   │   ├── pr-review-follow-up/  # Follow-up review verification
│   │   ├── pr-fix-guide/         # Fix PR review issues
│   │   ├── implement-guide/      # Feature implementation
│   │   ├── implement-test-guide/ # Test implementation
│   │   ├── design-plan/          # Architecture planning
│   │   ├── frontend-design/      # Distinctive frontend interfaces
│   │   ├── ui-audit-guide/       # UI/UX audit via Playwright
│   │   ├── shadcn/               # shadcn component workflows
│   │   ├── update-docs-guide/    # Documentation updates
│   │   └── analyze-deps-guide/   # Dependency analysis and reports
│   └── agents/         # Auto-delegated subagents (single .md files)
│       ├── principal-architect.md  # Architecture, scalability, design
│       ├── sde2.md                 # Implementation, code quality
│       ├── tester.md               # Test strategy, implementation
│       ├── technical-writer.md     # Documentation accuracy
│       └── devops.md               # Infrastructure, CI/CD, dependencies
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

| Package             | CLAUDE.md                                                      | Purpose                            |
| ------------------- | -------------------------------------------------------------- | ---------------------------------- |
| `@nexus/core`       | [packages/core/CLAUDE.md](packages/core/CLAUDE.md)             | Design tokens (W3C DTCG format)    |
| `@nexus/tailwind`   | [packages/tailwind/CLAUDE.md](packages/tailwind/CLAUDE.md)     | Tailwind CSS theme with nx: prefix |
| `@nexus/react`      | [packages/react/CLAUDE.md](packages/react/CLAUDE.md)           | React component library            |
| `@nexus/test-utils` | [packages/test-utils/CLAUDE.md](packages/test-utils/CLAUDE.md) | Shared testing utilities           |
| `@nexus/playground` | [apps/playground/CLAUDE.md](apps/playground/CLAUDE.md)         | Theme demo app                     |

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
