# Nexus Design System

> **CRITICAL:** Follow [.claude/rules/workflow.md](.claude/rules/workflow.md) for every task.

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
│   ├── commands/       # Slash commands (/implement, /pr-review, /linkedin, etc.)
│   ├── rules/          # Convention rules (components, testing, tokens, etc.)
│   ├── skills/         # Auto-discovered capabilities (SKILL.md format)
│   │   ├── pr-review/           # PR review framework
│   │   ├── pr-review-follow-up/ # Follow-up review verification
│   │   ├── implement/           # Linear ticket implementation
│   │   ├── pr-fix/              # Fix PR review issues
│   │   ├── design-plan/         # Architecture planning
│   │   ├── figma-analyze/       # Figma design analysis
│   │   ├── update-docs/         # Documentation updates
│   │   └── linkedin-post/       # LinkedIn content generation
│   └── agents/         # Auto-delegated subagents (single .md files)
│       ├── principal-architect.md  # Architecture, scalability, design
│       ├── sde2.md                 # Implementation, code quality
│       ├── designer.md             # Design-code parity, Figma
│       ├── technical-writer.md     # Documentation accuracy
│       └── social-media-manager.md # Developer advocacy content
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

## Convention Rules

| Rule File                                                                  | Purpose                                        |
| -------------------------------------------------------------------------- | ---------------------------------------------- |
| [.claude/rules/workflow.md](.claude/rules/workflow.md)                     | **Critical workflow (plan→execute→wait)**      |
| [.claude/rules/components.md](.claude/rules/components.md)                 | Component structure, props, exports            |
| [.claude/rules/testing.md](.claude/rules/testing.md)                       | Test structure, patterns, a11y                 |
| [.claude/rules/storybook.md](.claude/rules/storybook.md)                   | Story structure, required stories              |
| [.claude/rules/tokens.md](.claude/rules/tokens.md)                         | Token format, naming, workflow                 |
| [.claude/rules/figma.md](.claude/rules/figma.md)                           | Figma-to-code parity, token mapping            |
| [.claude/rules/shadcn-divergences.md](.claude/rules/shadcn-divergences.md) | Nexus vs shadcn/ui differences                 |
| [.claude/rules/context-engine.md](.claude/rules/context-engine.md)         | Context Engine domain knowledge, AI-first APIs |
| [.claude/rules/linear.md](.claude/rules/linear.md)                         | Linear integration, issue linking, status flow |
| [.claude/rules/github.md](.claude/rules/github.md)                         | PR format, commit conventions, auto-linking    |

## Skills (Auto-Discovered)

Skills are auto-discovered capabilities that Claude loads when your request matches the skill description.

| Skill                                                              | Purpose                                |
| ------------------------------------------------------------------ | -------------------------------------- |
| [pr-review](.claude/skills/pr-review/SKILL.md)                     | PR review framework (common structure) |
| [pr-review-follow-up](.claude/skills/pr-review-follow-up/SKILL.md) | Follow-up review verification          |
| [implement](.claude/skills/implement/SKILL.md)                     | Linear ticket implementation           |
| [pr-fix](.claude/skills/pr-fix/SKILL.md)                           | Fix PR review issues                   |
| [design-plan](.claude/skills/design-plan/SKILL.md)                 | Architecture planning                  |
| [figma-analyze](.claude/skills/figma-analyze/SKILL.md)             | Figma design analysis                  |
| [update-docs](.claude/skills/update-docs/SKILL.md)                 | Documentation updates                  |
| [linkedin-post](.claude/skills/linkedin-post/SKILL.md)             | LinkedIn content generation            |

## Agents (Auto-Delegated)

Agents are specialized personas that Claude auto-delegates to based on task type.

| Agent                                                          | Model  | Skills                                            | Focus                        |
| -------------------------------------------------------------- | ------ | ------------------------------------------------- | ---------------------------- |
| [principal-architect](.claude/agents/principal-architect.md)   | opus   | pr-review, pr-review-follow-up, design-plan       | Architecture, scalability    |
| [sde2](.claude/agents/sde2.md)                                 | opus   | pr-review, pr-review-follow-up, implement, pr-fix | Code quality, implementation |
| [designer](.claude/agents/designer.md)                         | opus   | figma-analyze                                     | Design-code parity           |
| [technical-writer](.claude/agents/technical-writer.md)         | sonnet | update-docs                                       | Documentation accuracy       |
| [social-media-manager](.claude/agents/social-media-manager.md) | sonnet | linkedin-post                                     | Developer advocacy           |

## Slash Commands

| Command          | Agent(s) Used                       | Purpose                                               |
| ---------------- | ----------------------------------- | ----------------------------------------------------- |
| `/implement`     | SDE2 (+ Principal Architect w/flag) | Implement Linear ticket (optional `--with-architect`) |
| `/pr-review`     | Principal Architect + SDE2          | Dual-perspective PR code review                       |
| `/pr-fix`        | SDE2                                | Fix PR review issues (blocking first, then minor)     |
| `/figma-analyze` | Designer                            | Analyze Figma design for code parity                  |
| `/update-docs`   | Technical Writer                    | Update documentation after codebase changes           |
| `/linkedin`      | Social Media Manager                | Generate LinkedIn post from session context           |

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
