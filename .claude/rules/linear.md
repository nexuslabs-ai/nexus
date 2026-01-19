# Linear Integration Rules

## Issue ID Format

Linear issues in this workspace use the `NEX-###` format (e.g., `NEX-140`).

## Issue ID Extraction

When extracting Linear issue IDs from PRs or user input:

| Source     | Pattern                           | Priority        |
| ---------- | --------------------------------- | --------------- |
| PR Title   | `[NEX-###]`                       | 1st (preferred) |
| PR Body    | `Closes NEX-###`, `Fixes NEX-###` | 2nd             |
| PR Body    | `NEX-###` (standalone)            | 3rd             |
| User Input | Direct input                      | Fallback        |

**Extraction Order:**

1. Check PR title for `[NEX-###]` pattern (new format)
2. Check PR body for magic words: `Closes NEX-###`, `Fixes NEX-###`
3. Check PR body for standalone `NEX-###`
4. If not found, ask user

## Status Flow

Linear issues follow this status progression:

```
Todo → In Progress → In Review → Done
```

> **Note:** Issues start in "Todo" by default (not "Backlog"). Backlog is for unplanned/future work.

### Auto-Updates via GitHub Integration

When GitHub integration is properly configured:

| GitHub Event        | Linear Status | Condition                        |
| ------------------- | ------------- | -------------------------------- |
| PR opened           | → In Progress | Issue ID in PR title `[NEX-###]` |
| PR ready for review | → In Review   | Issue ID linked                  |
| PR merged           | → Done        | `Closes NEX-###` in PR body      |

### Manual Updates

Some status updates still require manual API calls:

| Status      | When to Update Manually                                   |
| ----------- | --------------------------------------------------------- |
| In Progress | When starting work (branch creation doesn't auto-trigger) |
| In Review   | Not needed if PR title has `[NEX-###]`                    |
| Done        | Not needed if PR body has `Closes NEX-###`                |

## MCP Tool Reference

### Fetching Issues

```
mcp__linear__get_issue(id: "{issue_id}", includeRelations: true)
```

Key fields to extract:

- `title`, `description` - Issue details
- `state` - Current status
- `branchName` / `gitBranchName` - Suggested branch name
- `labels` - Issue classification
- `attachments` / `links` - Related URLs (Figma, PRs)

### Updating Issues

```
mcp__linear__update_issue(id: "{issue_id}", state: "In Progress")
```

Valid states: `Backlog`, `Todo`, `In Progress`, `In Review`, `Done`, `Canceled`

### Adding Comments

```
mcp__linear__create_comment(issueId: "{issue_id}", body: "Comment text...")
```

### Adding Links

```
mcp__linear__update_issue(id: "{issue_id}", links: [{url: "{url}", title: "{title}"}])
```

## Comment Conventions

Use consistent emoji prefixes for Linear comments:

| Action          | Prefix | Example                                     |
| --------------- | ------ | ------------------------------------------- |
| Starting work   | `🤖`   | `🤖 Starting implementation...`             |
| PR created      | `🔗`   | `🔗 PR created: {url}`                      |
| Review complete | `📋`   | `📋 PR Review Complete - Verdict: APPROVED` |
| Completed       | `✅`   | `✅ PR merged and ticket completed`         |

## Branch Naming

Use the `branchName` or `gitBranchName` field from Linear issue. Format is typically:

```
{username}/{issue-key}-{slugified-title}
```

Example: `prasad/nex-140-setup-github-actions-ci-workflow`

If not available, generate: `{user}/nex-{id}-{slugified-title}`

## Verification Pattern

When verifying/ensuring status (e.g., in post-merge):

```
mcp__linear__update_issue(id: "{issue_id}", state: "Done")
```

> **Note:** This acts as a fallback. If PR had `Closes NEX-###`, Linear auto-updates.
> The manual call ensures consistency for older PRs or manual merges.

## Do Not

- Manually update to "In Review" if PR title has `[NEX-###]` (auto-handled)
- Manually update to "Done" if PR body has `Closes NEX-###` (auto-handled)
- Forget to extract issue ID from both title AND body
- Use inconsistent comment formatting
