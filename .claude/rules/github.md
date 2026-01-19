# GitHub Integration Rules

## Repository Info

| Field       | Value             |
| ----------- | ----------------- |
| Owner       | `INNOVATIVEGAMER` |
| Repo        | `ds`              |
| Main Branch | `main`            |

## PR Title Format

PR titles MUST include the Linear issue ID in brackets for auto-linking:

```
{type}({scope}): {description} [{issue_id}]
```

**Examples:**

- `feat(react): add Button component [NEX-123]`
- `fix(tailwind): correct spacing token values [NEX-456]`
- `ci: setup GitHub Actions workflow [NEX-140]`

### Commit Type Mapping

| Ticket Type    | Commit Type     |
| -------------- | --------------- |
| Feature        | `feat`          |
| Bug            | `fix`           |
| Infrastructure | `chore` or `ci` |
| Documentation  | `docs`          |
| Refactor       | `refactor`      |

## PR Body Template

Standard PR body structure:

```markdown
## Summary

{bullet points of what changed}

## Linear Issue

Closes {issue_id}

## Test Plan

- [ ] {verification step 1}
- [ ] {verification step 2}

🤖 Generated with Claude Code
```

### Component PR Body

For component PRs, include Figma section:

```markdown
## Summary

- Adds `{ComponentName}` component to @nexus/react
- Implements all variants from Figma design
- Includes Storybook stories with interaction tests

## Linear Issue

Closes {issue_id}

## Figma

{figma_urls}

## Test Plan

- [ ] Visual review in Storybook
- [ ] Verify Figma parity
- [ ] All tests passing

🤖 Generated with Claude Code
```

## Magic Words for Linear Linking

These keywords in PR body trigger Linear automation:

| Keyword            | Effect on Merge     |
| ------------------ | ------------------- |
| `Closes NEX-###`   | Marks issue as Done |
| `Fixes NEX-###`    | Marks issue as Done |
| `Resolves NEX-###` | Marks issue as Done |

**Always use `Closes {issue_id}` in the "Linear Issue" section.**

## Auto-Linking Behavior

When PR title contains `[NEX-###]`:

| Event               | Linear Update                      |
| ------------------- | ---------------------------------- |
| PR opened (draft)   | Issue → In Progress                |
| PR ready for review | Issue → In Review                  |
| PR merged           | Issue → Done (if `Closes` present) |

## MCP Tool Reference

### Creating PRs

```
mcp__github__create_pull_request(
  owner: "INNOVATIVEGAMER",
  repo: "ds",
  title: "{title with [issue_id]}",
  head: "{branch_name}",
  base: "main",
  body: "{PR body}"
)
```

### Fetching PR Details

```
mcp__github__get_pull_request(
  owner: "INNOVATIVEGAMER",
  repo: "ds",
  pull_number: {pr_number}
)
```

Key fields:

- `title` - PR title (extract issue ID from `[NEX-###]`)
- `body` - PR description (extract from `Closes NEX-###`)
- `merged_at` - Merge timestamp (null if not merged)
- `head.ref` - Branch name

### Fetching PR Files

```
mcp__github__get_pull_request_files(
  owner: "INNOVATIVEGAMER",
  repo: "ds",
  pull_number: {pr_number}
)
```

### Creating PR Reviews

```
mcp__github__create_pull_request_review(
  owner: "INNOVATIVEGAMER",
  repo: "ds",
  pull_number: {pr_number},
  body: "{review summary}",
  event: "{APPROVE|COMMENT|REQUEST_CHANGES}",
  comments: [
    { path: "file.tsx", line: 42, body: "Issue..." }
  ]
)
```

### Review Verdicts

| Condition         | Event             |
| ----------------- | ----------------- |
| No issues found   | `APPROVE`         |
| Minor issues only | `COMMENT`         |
| Blocking issues   | `REQUEST_CHANGES` |

## Commit Message Format

```
{type}({scope}): {description}

{body - what was done}

Closes {issue_id}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Example:**

```
feat(react): add Avatar component

- Implements Avatar with all Figma variants
- Adds Storybook stories with play function tests
- Follows Nexus design system conventions

Closes NEX-150

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Branch Operations

### Push with Upstream

```bash
git push -u origin {branch_name}
```

### Delete Remote Branch (post-merge)

```bash
git push origin --delete {branch_name}
```

## PR Review Body Template

```markdown
## 🤖 Automated Code Review

### Summary

| Category      | Status   | Issues  |
| ------------- | -------- | ------- |
| Architecture  | {status} | {notes} |
| Code Quality  | {status} | {notes} |
| Testing       | {status} | {notes} |
| Accessibility | {status} | {notes} |

### Verdict: {APPROVED|CHANGES REQUESTED|REVIEWED}

{issues or approval message}

---

_Review performed against: `.claude/rules/components.md`, `.claude/rules/testing.md`, etc._
```

## Do Not

- Create PRs without `[{issue_id}]` in title (breaks auto-linking)
- Forget `Closes {issue_id}` in PR body (breaks auto-done)
- Use `Fixes` inconsistently (prefer `Closes` for consistency)
- Skip the Test Plan section
- Forget `Co-Authored-By` in commits
