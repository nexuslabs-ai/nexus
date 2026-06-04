# GitHub Integration Rules

## Repository Info

| Field       | Value                                        |
| ----------- | -------------------------------------------- |
| Owner       | Inferred from `git remote` — do not hardcode |
| Repo        | Inferred from `git remote` — do not hardcode |
| Main Branch | `main`                                       |

**Resolve `{owner}` and `{repo}` at runtime:**

```bash
gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"'
```

## PR Title Format

PR titles use conventional commit format:

```
{type}({scope}): {description}
```

**Examples:**

- `feat(api): add question generation endpoint`
- `fix(auth): correct token refresh logic`
- `ci: setup GitHub Actions workflow`

### Commit Type Mapping

| Change Type    | Commit Type     |
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

## GitHub Issue

Closes #123

## Test Plan

- [ ] {verification step 1}
- [ ] {verification step 2}
```

## Closing Issues via PR

Use `Closes #123` in the PR body — GitHub automatically closes the issue when the PR merges.

| Keyword         | Effect on Merge  |
| --------------- | ---------------- |
| `Closes #123`   | Closes the issue |
| `Fixes #123`    | Closes the issue |
| `Resolves #123` | Closes the issue |

**Always use `Closes #123` in the "GitHub Issue" section.** Prefer `Closes` for consistency.

## Branch Naming

Derive branch name from the GitHub issue:

```
{username}/issue-{number}-{slugified-title}
```

**Example:** `prasad/issue-42-add-question-generation`

Or use the GitHub CLI to generate the branch automatically:

```bash
gh issue develop 42
```

## Issue Labels

| Label              | Usage                            |
| ------------------ | -------------------------------- |
| `bug`              | Something is broken or incorrect |
| `enhancement`      | New feature or improvement       |
| `good first issue` | Suitable for new contributors    |
| `question`         | Further information needed       |
| `documentation`    | Documentation-only changes       |
| `help wanted`      | Extra attention needed           |

## Issue Extraction

When extracting a GitHub issue number from a PR or user input:

| Source     | Pattern                     | Priority        |
| ---------- | --------------------------- | --------------- |
| PR Body    | `Closes #123`, `Fixes #123` | 1st (preferred) |
| PR Body    | `#123` (standalone)         | 2nd             |
| User Input | Direct input                | Fallback        |

**Extraction order:**

1. Check PR body for `Closes #123` or `Fixes #123`
2. Check PR body for standalone `#123`
3. If not found, ask user

## `gh` CLI Reference

All GitHub interactions use the `gh` CLI. Authenticate with `gh auth login`.

### Accounts

Each developer's `gh` CLI is logged in to two accounts:

| Account                    | Role          | Used For                                                           |
| -------------------------- | ------------- | ------------------------------------------------------------------ |
| Your personal GitHub login | Main (active) | Everything except posting reviews — PRs, issues, commits, fetching |
| `nexuslabs-ai-bot`         | Shared bot    | **Posting** PR reviews only (`POST /pulls/{n}/reviews`)            |

**First-time setup:** run `gh auth login` to add the `nexuslabs-ai-bot` bot (ask a teammate for credentials), then `gh auth switch --user <your-personal-account>` so your own account stays active.

When posting a PR review, prefix the command with `GH_TOKEN=$(gh auth token --user nexuslabs-ai-bot)` to post from the bot. This keeps review comments attributed to the bot and avoids GitHub's self-authored-PR rejection of `APPROVE` / `REQUEST_CHANGES`, since the bot is never the PR author.

Every other `gh` command — fetching reviews, reading comments, creating PRs, etc. — uses your personal account as-is, no prefix.

### Fetching Issues

```bash
gh issue view 123 --json number,title,body,labels,state,url
```

Key fields: `title`, `body`, `labels`, `state`, `url`

### Adding Comments to Issues

```bash
gh issue comment 123 --body "Comment text..."
```

### Creating PRs

```bash
gh pr create \
  --title "feat(api): add search endpoint" \
  --body "$(cat <<'EOF'
## Summary
- ...

## GitHub Issue
Closes #123

## Test Plan
- [ ] ...
EOF
)" \
  --base main
```

### Fetching PR Details

```bash
gh pr view {pr_number} --json number,title,body,headRefName,baseRefName,author,url,mergedAt
```

Key fields: `title`, `body` (extract issue number from `Closes #123`), `mergedAt`, `headRefName`

### Fetching PR Diff

```bash
gh pr diff {pr_number}
```

For a structured file list:

```bash
gh pr view {pr_number} --json files
```

### Creating PR Reviews

Posted from the `nexuslabs-ai-bot` bot account (see [Accounts](#accounts)):

```bash
GH_TOKEN=$(gh auth token --user nexuslabs-ai-bot) \
  gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews \
  --method POST \
  --input - <<'EOF'
{
  "body": "{review summary}",
  "event": "{APPROVE|COMMENT|REQUEST_CHANGES}",
  "comments": [
    {"path": "file.tsx", "line": 42, "body": "Issue..."}
  ]
}
EOF
```

### Fetching Reviews & Comments

```bash
# Reviews (verdict + body)
gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews

# Inline comments
gh api repos/{owner}/{repo}/pulls/{pr_number}/comments

# Commits on a PR
gh api repos/{owner}/{repo}/pulls/{pr_number}/commits
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

Closes #{issue_number}
```

**Example:**

```
feat(api): add question generation endpoint

- Implements question generation with AI pipeline
- Adds input validation and error handling
- Includes unit tests for edge cases

Closes #42
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

| Category     | Status   | Issues  |
| ------------ | -------- | ------- |
| Architecture | {status} | {notes} |
| Code Quality | {status} | {notes} |
| Testing      | {status} | {notes} |

### Verdict: {APPROVED|CHANGES REQUESTED|REVIEWED}

{issues or approval message}

---

_Review performed against: `.claude/rules/` guidelines_
```

## Do Not

- Forget `Closes #123` in PR body (breaks auto-close on merge)
- Use `Fixes` inconsistently (prefer `Closes` for consistency)
- Skip the Test Plan section
- Post PR reviews without the `GH_TOKEN=$(gh auth token --user nexuslabs-ai-bot)` prefix (reviews must come from the bot)
