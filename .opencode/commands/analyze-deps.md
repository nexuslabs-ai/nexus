---
description: Analyze dependencies for updates, breaking changes, and migration paths
agent: devops
---

Analyze dependencies for updates, breaking changes, deprecations, and migration paths.

## Input

- **$ARGUMENTS**: Package name, workspace path, or "all"

Examples:

- `/analyze-deps @radix-ui/react-dialog` → Analyze single package
- `/analyze-deps packages/react` → Analyze workspace dependencies
- `/analyze-deps all` → Analyze all workspaces
- `/analyze-deps` → Defaults to "all"

## Input Detection

| Pattern                               | Scope                                |
| ------------------------------------- | ------------------------------------ |
| Starts with `@` or no `/`             | Single package across all workspaces |
| Contains `/` (e.g., `packages/react`) | Specific workspace                   |
| `all` or empty                        | All workspaces                       |

## Instructions

1. Read the analyze-deps skill at `.claude/skills/analyze-deps/SKILL.md`
2. Determine scope from arguments
3. Follow the 5-phase workflow:
   - Resolve package.json(s)
   - Query npm registry for latest versions
   - Research breaking changes (for major updates)
   - Scan codebase for usage impact
   - Generate report
4. Save report to `reports/deps/{target}-{YYYY-MM-DD}.md`
5. Return summary of findings

## Research Depth

- **Major version bumps**: Full changelog research, migration guides
- **Minor/patch**: Quick scan
- **Deprecated packages**: Find replacement recommendations

## Risk Prioritization

1. 🔴 Security vulnerabilities
2. 🟡 Deprecated packages
3. 🟠 Major version updates
4. 🟢 Minor/patch updates

## Arguments

$ARGUMENTS
