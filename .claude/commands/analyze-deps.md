# Analyze Dependencies

Analyze dependencies for updates, breaking changes, deprecations, and migration paths using the DevOps agent.

## Agent Used

| Agent                         | Skill                                           | Purpose                    |
| ----------------------------- | ----------------------------------------------- | -------------------------- |
| [DevOps](../agents/devops.md) | [analyze-deps](../skills/analyze-deps/SKILL.md) | Dependency analysis report |

## Input

- **$ARGUMENTS**: Package name, workspace path, or "all"

```
Examples:
  /analyze-deps @radix-ui/react-dialog   → Analyze single package
  /analyze-deps packages/react           → Analyze workspace dependencies
  /analyze-deps all                      → Analyze all workspaces
  /analyze-deps                          → Defaults to "all"
```

## Input Detection

Parse `$ARGUMENTS` for:

| Pattern                               | Scope                                |
| ------------------------------------- | ------------------------------------ |
| Starts with `@` or no `/`             | Single package across all workspaces |
| Contains `/` (e.g., `packages/react`) | Specific workspace                   |
| `all` or empty                        | All workspaces                       |

## Flow

```
┌─────────────────────────────────────────┐
│    /analyze-deps packages/react         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Parse Input                   │
│  • Determine scope (package/workspace)  │
│  • Resolve target package.json(s)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Spawn DevOps Agent              │
│  • Use Task tool with subagent_type     │
│  • Pass scope in prompt                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   DevOps Executes analyze-deps skill    │
│  • Query npm registry                   │
│  • Research breaking changes            │
│  • Scan codebase impact                 │
│  • Generate report                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Report Generated                │
│  • Saved to reports/deps/{name}-{date}  │
│  • Summary displayed to user            │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Parse Input

1. **Determine analysis scope:**

   ```
   If starts with @ or is plain name → Single package mode
   If contains / → Workspace mode
   If "all" or empty → All workspaces mode
   ```

2. **Resolve target files:**
   - Single package: Find in all package.json files
   - Workspace: Read `{workspace}/package.json`
   - All: Glob `**/package.json` (exclude node_modules)

### Phase 2: Spawn DevOps Agent

**IMPORTANT: You MUST use the Task tool to spawn the DevOps agent. Do NOT execute the skill yourself.**

```
Task(
  subagent_type: "devops",
  description: "Analyze dependencies",
  prompt: """
  Analyze dependencies and generate a report.

  ## Scope
  - Target: {package name | workspace path | all}
  - Mode: {single-package | workspace | all-workspaces}

  ## Instructions
  1. Read the analyze-deps skill at `.claude/skills/analyze-deps/SKILL.md`
  2. Follow the 5-phase workflow:
     - Resolve package.json(s)
     - Query npm registry
     - Research breaking changes (for updates)
     - Scan codebase impact
     - Generate report
  3. Save report to `reports/deps/{target}-{YYYY-MM-DD}.md`
  4. Return summary of findings
  """
)
```

The DevOps agent will:

- Follow the analyze-deps skill workflow
- Research thoroughly using WebSearch for migration guides
- Generate actionable report with file:line references
- Prioritize by risk (security > deprecated > major > minor > patch)

### Phase 3: Report Output

After analysis is complete, output:

```markdown
## 📦 Dependency Analysis Complete

### Scope

{Package: @radix-ui/react-dialog | Workspace: packages/react | All workspaces}

### Summary

| Metric            | Count |
| ----------------- | ----- |
| Packages analyzed | X     |
| Updates available | X     |
| Deprecated        | X     |
| Up to date        | X     |

### Risk Overview

| Risk      | Count | Examples                    |
| --------- | ----- | --------------------------- |
| 🔴 High   | X     | package-a (1.0→4.0, major)  |
| 🟡 Medium | X     | package-b (1.2→1.5, minor)  |
| 🟢 Low    | X     | package-c (3.0→3.0.5 patch) |

### Report Location

`reports/deps/{target}-{YYYY-MM-DD}.md`

### Next Steps

1. Review full report for migration details
2. Address deprecated packages first
3. Plan major version upgrades
```

## Output Files

Reports are saved to `reports/deps/` with naming:

| Scope          | Filename Example                      |
| -------------- | ------------------------------------- |
| Single package | `radix-ui-react-dialog-2026-01-23.md` |
| Workspace      | `packages-react-2026-01-23.md`        |
| All workspaces | `all-workspaces-2026-01-23.md`        |

## Error Handling

| Error                    | Action                                  |
| ------------------------ | --------------------------------------- |
| Package not found        | Note as "not found in any workspace"    |
| Workspace doesn't exist  | Ask user to verify path                 |
| npm registry unreachable | Skip package, note as "unable to check" |
| GitHub API rate limited  | Fall back to WebSearch for changelogs   |

## Important Notes

- **Research depth:** Major version bumps get full changelog research; patches get quick scan
- **Official sources:** Prioritizes maintainer docs over blog posts
- **Actionable output:** Every finding includes specific migration steps where available
