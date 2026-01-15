# PR Review Skill

> Uses: [SDE2 Agent](../AGENT.md)

## Purpose

Review pull requests from a code quality perspective, focusing on maintainability, correctness, and best practices.

## When to Use

- Reviewing any code changes
- Ensuring code quality standards are met
- Catching common bugs and anti-patterns
- Validating error handling and edge cases

## Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Consistent naming conventions
- [ ] No hardcoded values that should be constants/config
- [ ] Proper error handling (not swallowing errors)
- [ ] No console.log or debugging code
- [ ] No commented-out code without explanation
- [ ] Imports organized and minimal
- [ ] Functions have single responsibility
- [ ] No obvious performance issues (N+1, unnecessary loops)

## Review Process

1. **Read the code thoroughly**
   - Don't just skim the diff
   - Understand what each function/module does

2. **Check for correctness**
   - Are edge cases handled?
   - Are errors properly caught and propagated?
   - Is input validated where needed?

3. **Evaluate maintainability**
   - Would a new team member understand this?
   - Is the code self-documenting?
   - Are there unnecessary abstractions?

4. **Challenge implementation choices**
   - For each non-trivial piece of code, ask:
     - "Is this abstraction at the right level?"
     - "Would this be easy to test?"
     - "Is there unnecessary complexity here?"

5. **Document findings using Challenge & Propose format**

## Output Format

```markdown
## 👨‍💻 SDE2 Code Quality Review

### Summary

| Area           | Status   | Notes   |
| -------------- | -------- | ------- |
| Type Safety    | ✅/⚠️/❌ | {notes} |
| Error Handling | ✅/⚠️/❌ | {notes} |
| Code Structure | ✅/⚠️/❌ | {notes} |
| Naming/Style   | ✅/⚠️/❌ | {notes} |
| Edge Cases     | ✅/⚠️/❌ | {notes} |

### Verdict: {APPROVED|MINOR CHANGES|CHANGES REQUIRED}

### Code Quality Observations

{What's well implemented}

### Challenges & Proposals

{List each challenge using the Challenge & Propose format from AGENT.md}

### Issues Found

#### Blocking ❌

- {issue with file:line reference}

#### Minor ⚠️

- {issue with file:line reference}

---

_Review perspective: Senior Software Engineer (SDE2 level)_
```

## Verdict Guidelines

| Condition                                           | Verdict            |
| --------------------------------------------------- | ------------------ |
| No issues found                                     | `APPROVED`         |
| Only minor style/preference issues                  | `MINOR CHANGES`    |
| Bugs, missing error handling, or significant issues | `CHANGES REQUIRED` |
