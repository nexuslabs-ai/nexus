# PR Review Skill

> Uses: [Principal Architect Agent](../AGENT.md)

## Purpose

Review pull requests from an architectural perspective, focusing on system design, scalability, and long-term maintainability.

## When to Use

- Reviewing infrastructure or backend code
- Reviewing new features with significant architectural impact
- Reviewing data model changes
- Reviewing API design changes

## Review Modes

### Full Review (Default)

Review all changed files for architectural concerns.

### Follow-up Review

Only triggered when:

- New files were added since last review
- Significant structural changes detected
- Previous review had architectural concerns

In follow-up mode:

- Focus on new files and structural changes only
- Verify previous architectural concerns are addressed
- Don't re-review unchanged architectural decisions

## Review Checklist

- [ ] Architecture follows established patterns in codebase
- [ ] Correct separation of concerns
- [ ] Data model supports future requirements
- [ ] API contracts are clear and consistent
- [ ] Security boundaries properly defined
- [ ] No premature optimization OR missing critical optimization
- [ ] Dependencies justified and appropriate
- [ ] Configuration externalized appropriately

## Review Process

1. **Understand the context**
   - Read PR description and linked tickets
   - Understand what problem is being solved

2. **Analyze the architecture**
   - How does this fit into the existing system?
   - What are the data flows?
   - What are the failure modes?

3. **Challenge decisions**
   - For each significant design decision, ask:
     - "Is this the best approach, or are we accepting the first working solution?"
     - "What would break if we scale 100x?"
     - "Would a senior engineer at Google/Meta/Amazon approve this?"
     - "Is there a simpler way to achieve the same goal?"

4. **Document findings using Challenge & Propose format**

## Output Format

### Full Review Output

```markdown
## Principal Architect Review

### Summary

| Area          | Status   | Notes   |
| ------------- | -------- | ------- |
| System Design | ✅/⚠️/❌ | {notes} |
| Scalability   | ✅/⚠️/❌ | {notes} |
| Data Model    | ✅/⚠️/❌ | {notes} |
| API Design    | ✅/⚠️/❌ | {notes} |
| Security      | ✅/⚠️/❌ | {notes} |

### Verdict: {APPROVED|NEEDS DISCUSSION|CHANGES REQUIRED}

### Architectural Observations

{What's good about the architecture}

### Challenges & Proposals

{List each challenge using the Challenge & Propose format from AGENT.md}

### Blocking Concerns (if any)

{Issues that must be addressed before merge}

---

_Review perspective: Principal Engineer (Google/Meta/Amazon level)_
```

### Follow-up Review Output

```markdown
## Principal Architect Follow-up Review

### Scope

Reviewing: {new files / structural changes / previous concerns}

### Previous Concerns Status

| Concern   | Status           | Notes   |
| --------- | ---------------- | ------- |
| {concern} | ✅ Addressed     | {how}   |
| {concern} | ❌ Still Present | {issue} |

### New Architectural Assessment

| Area               | Status   | Notes        |
| ------------------ | -------- | ------------ |
| New Files          | ✅/⚠️/❌ | {assessment} |
| Structural Changes | ✅/⚠️/❌ | {assessment} |

### New Concerns (if any)

{Any new architectural issues in the changes}

### Verdict: {APPROVED|NEEDS DISCUSSION|CHANGES REQUIRED}

---

_Follow-up review - focused on changes since last review_
```

## Verdict Guidelines

| Condition                                   | Verdict            |
| ------------------------------------------- | ------------------ |
| Architecture is sound, no concerns          | `APPROVED`         |
| Minor architectural questions, non-blocking | `NEEDS DISCUSSION` |
| Significant architectural issues            | `CHANGES REQUIRED` |
