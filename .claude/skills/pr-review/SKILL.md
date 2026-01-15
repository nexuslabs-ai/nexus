---
name: pr-review
description: Review pull requests for code quality and architecture. Use when reviewing PRs, checking code changes, or evaluating pull requests.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git:*, gh:*)
user-invocable: true
---

# PR Review

## Purpose

Review pull requests to ensure code quality, architectural soundness, and adherence to project conventions.

## When to Use

- Reviewing any pull request
- Evaluating code changes before merge
- Checking adherence to project standards

## Review Process

1. **Understand the context**
   - Read PR description and linked tickets
   - Understand what problem is being solved
   - Check the scope of changes

2. **Analyze the changes**
   - Review each changed file thoroughly
   - Don't just skim the diff—understand what each function/module does
   - Consider how changes fit into the existing system

3. **Apply your lens**
   - Use your agent's focus areas (architecture vs implementation)
   - Check against your agent's checklist items
   - Apply the Challenge & Propose format for issues

4. **Document findings**
   - Use the output format below
   - Be specific with file:line references
   - Distinguish blocking vs minor issues

## Common Checklist

These items apply regardless of review perspective:

- [ ] No exposed secrets or API keys
- [ ] No console.log or debugging code left in
- [ ] No commented-out code without explanation
- [ ] Imports organized and minimal
- [ ] Follows existing patterns in codebase
- [ ] Changes are within scope of PR description

## Output Format

```markdown
## {Agent Name} Review

### Summary

| Area           | Status   | Notes   |
| -------------- | -------- | ------- |
| {focus area 1} | ✅/⚠️/❌ | {notes} |
| {focus area 2} | ✅/⚠️/❌ | {notes} |
| {focus area 3} | ✅/⚠️/❌ | {notes} |

### Verdict: {VERDICT}

### Observations

{What's done well}

### Challenges & Proposals

{Use Challenge & Propose format from agent for each issue}

### Issues Found

#### Blocking ❌

- {issue with file:line reference}

#### Minor ⚠️

- {issue with file:line reference}

---

_Review perspective: {Agent persona}_
```

## Verdict Options

| Agent                   | Verdicts                                           | When to Use         |
| ----------------------- | -------------------------------------------------- | ------------------- |
| **Principal Architect** | `APPROVED`, `NEEDS DISCUSSION`, `CHANGES REQUIRED` | Architecture review |
| **SDE2**                | `APPROVED`, `MINOR CHANGES`, `CHANGES REQUIRED`    | Code quality review |

### Verdict Guidelines

| Condition                                          | Verdict                               |
| -------------------------------------------------- | ------------------------------------- |
| No issues found                                    | `APPROVED`                            |
| Only minor style/preference issues                 | `MINOR CHANGES` or `NEEDS DISCUSSION` |
| Bugs, missing error handling, architectural issues | `CHANGES REQUIRED`                    |

## Agent-Specific Focus

Each agent applies their own lens when using this skill:

### Principal Architect Focus

- System design and patterns
- Scalability implications
- Data model correctness
- API contract clarity
- Security boundaries
- Extensibility

### SDE2 Focus

- Type safety
- Error handling
- Code structure and readability
- Naming conventions
- Edge cases
- Testability

See agent files for detailed focus areas and checklists.
