# Linear Ticket Implementation

General-purpose workflow for implementing any Linear ticket.

## Required Input

- **Linear Issue ID**: $ARGUMENTS (e.g., `NEX-140`)

If no issue ID provided, ask the user for it.

## Execution Mode Selection

**FIRST:** Ask the user which execution mode they prefer using AskUserQuestion:

| Mode | Description |
|------|-------------|
| **Phased** | Follow CRITICAL WORKFLOW (stop after each phase, summarize, wait for confirmation) |
| **Continuous** | Execute all phases without stopping |

## Phase 1: Read & Classify Ticket

1. **Fetch issue details** using Linear MCP:
   ```
   mcp__linear__get_issue(id: "{issue_id}", includeRelations: true)
   ```

2. **Extract key information:**
   - Title and description
   - Labels (Frontend, Backend, etc.)
   - Project and milestone
   - Parent issue (if sub-task)
   - Blocked by / blocks relations
   - Attachments and links

3. **Classify ticket type:**

   | Type | Detection Keywords | Action |
   |------|-------------------|--------|
   | **Component** | Figma URLs, "component" in title | Redirect to `/linear-component` |
   | **Feature** | "add", "implement", "create", "setup" | Continue with this workflow |
   | **Bug** | "fix", "bug", "issue", "error" | Focus on debugging context |
   | **Infrastructure** | "CI", "workflow", "config", "setup" | Focus on config files |
   | **Documentation** | "docs", "readme", "update docs" | Focus on doc files |
   | **Refactor** | "refactor", "cleanup", "improve" | Focus on affected code |

4. **If Component type detected:**
   - Inform user: "This looks like a component ticket. Redirecting to `/linear-component`..."
   - Execute `/linear-component {issue_id}` workflow instead
   - Stop this workflow

5. **Get git branch name** from issue's `gitBranchName` field

## Phase 2: Gather Context

Based on ticket type, explore relevant parts of codebase:

### For Feature/Infrastructure:
1. **Read project documentation:**
   - Root `CLAUDE.md`
   - Relevant package `CLAUDE.md` files
   - Related rule files in `.claude/rules/`

2. **Search for related code:**
   - Use Explore agent to find similar patterns
   - Identify files that will be modified
   - Check for existing implementations to follow

3. **Identify dependencies:**
   - What packages are affected?
   - Are there build order dependencies?
   - Any external tools/services involved?

### For Bug:
1. **Understand the issue:**
   - Search for error messages in codebase
   - Find the affected code paths
   - Check related tests

2. **Reproduce context:**
   - What commands reproduce the issue?
   - What's the expected vs actual behavior?

### For Refactor:
1. **Map affected code:**
   - Find all usages of code being refactored
   - Identify breaking change potential
   - Check test coverage

## Phase 3: Planning

1. **Create todo list** using TodoWrite:
   - Break down ticket into actionable tasks
   - Include quality gates as final tasks
   - Order by dependencies

2. **For complex tasks** (multi-file, architectural decisions):
   - Use EnterPlanMode
   - Design approach before coding
   - Get user approval on plan

3. **For simple tasks** (single file, clear scope):
   - Proceed directly with todo list

4. **Update Linear status** to "In Progress":
   ```
   mcp__linear__update_issue(id: "{issue_id}", state: "In Progress")
   ```

5. **Create git branch:**
   ```bash
   git checkout -b {gitBranchName}
   ```

6. **Add comment** to Linear issue:
   ```
   mcp__linear__create_comment(issueId: "{issue_id}", body: "🤖 Starting implementation...")
   ```

## Phase 4: Implementation

1. **Follow CRITICAL WORKFLOW** from root `CLAUDE.md`:
   - Execute ONE todo item
   - Summarize with key code snippets
   - Wait for confirmation (if Phased mode)
   - Repeat until done

2. **Follow project conventions:**
   - Check relevant `.claude/rules/*.md` files
   - Match existing patterns in codebase
   - Use semantic tokens, `nx:` prefix for Tailwind

3. **Write tests** where applicable:
   - Components: play functions in stories
   - Utilities/hooks: unit tests with `@nexus/test-utils`
   - Config/scripts: manual verification steps

## Phase 5: Quality Gates

Run all quality checks:

```bash
yarn format:check
yarn lint
yarn typecheck
yarn build
yarn test
```

| Check | Command | Must Pass |
|-------|---------|-----------|
| Format | `yarn format:check` | Yes |
| Lint | `yarn lint` | Yes |
| TypeScript | `yarn typecheck` | Yes |
| Build | `yarn build` | Yes |
| Tests | `yarn test` | Yes |

**If any check fails:**
- Fix the issues
- Re-run failed checks
- Do NOT proceed until all pass

## Phase 6: Create PR

1. **Stage and commit:**
   ```bash
   git add .
   git commit -m "{type}({scope}): {description}

   {body - what was done}

   Closes {issue_id}

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
   ```

   **Commit type mapping:**
   | Ticket Type | Commit Type |
   |-------------|-------------|
   | Feature | `feat` |
   | Bug | `fix` |
   | Infrastructure | `chore` or `ci` |
   | Documentation | `docs` |
   | Refactor | `refactor` |

2. **Push branch:**
   ```bash
   git push -u origin {gitBranchName}
   ```

3. **Create PR** via GitHub MCP:
   ```
   mcp__github__create_pull_request(
     owner: "INNOVATIVEGAMER",
     repo: "ds",
     title: "{type}({scope}): {description}",
     head: "{gitBranchName}",
     base: "main",
     body: "## Summary
     {bullet points of changes}

     ## Linear Issue
     Closes {issue_id}

     ## Test Plan
     - [ ] {verification steps}

     🤖 Generated with Claude Code"
   )
   ```

4. **Update Linear:**
   - Set status to "In Review"
   - Add PR link to issue
   ```
   mcp__linear__update_issue(id: "{issue_id}", state: "In Review", links: [{url: "{pr_url}", title: "GitHub PR"}])
   ```

## Phase 7: Handoff

Provide summary to user:

```markdown
## ✅ Implementation Complete

### Links
- **PR:** {pr_url}
- **Linear:** {linear_url}
- **Branch:** {gitBranchName}

### Changes Made
{list of files changed}

### Quality Gates
| Check | Status |
|-------|--------|
| Format | ✅ |
| Lint | ✅ |
| TypeScript | ✅ |
| Build | ✅ |
| Tests | ✅ |

### Next Steps
1. Run `/pr-review {pr_number}` for unbiased code review
2. Review the PR manually
3. Merge when ready
```

## Error Handling

| Error | Action |
|-------|--------|
| Linear issue not found | Ask user to verify issue ID |
| No git branch name | Generate from title: `{user}/nex-{id}-{slugified-title}` |
| Quality gate fails | Fix issues, do not create PR until passing |
| Git conflicts | Alert user, provide resolution guidance |
| Blocked by other issues | Warn user, ask if should proceed |

## Ticket Template (Recommended)

For best results, Linear tickets should include:

```markdown
## Overview
{What needs to be done and why}

## Requirements
- {Requirement 1}
- {Requirement 2}

## Affected Packages
- @nexus/{package}

## Technical Notes (optional)
- {Any implementation hints}

## Acceptance Criteria
- [ ] {Criteria 1}
- [ ] {Criteria 2}
```
