---
name: update-docs
description: Update documentation based on codebase changes. Use when documentation needs updates after code changes, or to ensure docs stay accurate.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
user-invocable: true
---

# Update Docs

## Purpose

Update documentation based on codebase changes, ensuring docs stay accurate and complete.

## When to Use

- After code changes that affect documentation
- When documentation is out of sync with code
- To ensure docs stay accurate after refactoring
- When new features need documentation

## Workflow

### Phase 1: Analyze Changes

1. **Check recent git changes:**

   ```bash
   git diff --name-only HEAD~5
   git diff --stat
   ```

2. **Identify what changed:**
   - Which directories/packages were affected?
   - What type of changes? (new files, modifications, deletions)
   - Any new patterns or APIs introduced?

3. **Ask clarifying questions** if scope is unclear

### Phase 2: Discover Affected Documentation

**Use dynamic discovery, not hardcoded mappings.**

1. **Find nearby CLAUDE.md files:**

   ```bash
   # For each changed directory, look for CLAUDE.md
   find {changed_directory} -name "CLAUDE.md" -type f
   ```

2. **Search rules for mentions:**

   ```bash
   # Search rules that might reference changed areas
   grep -l "{changed_area}" .claude/rules/*.md
   ```

3. **Check root CLAUDE.md** if changes affect:
   - Commands (`.claude/commands/`)
   - Rules (`.claude/rules/`)
   - Agents (`.claude/agents/`)
   - Skills (`.claude/skills/`)
   - Project structure

4. **Common discovery patterns:**

   | Change Type     | Where to Search                                           |
   | --------------- | --------------------------------------------------------- |
   | Package code    | Package's CLAUDE.md, grep rules for package name          |
   | Components      | Grep rules for "component", check testing/storybook rules |
   | Tokens          | Grep rules for "token", check related packages            |
   | Commands/Agents | Root CLAUDE.md slash commands table                       |
   | New patterns    | Grep rules for pattern keywords                           |

### Phase 3: Review and Compare

For each discovered documentation file:

1. **Read the current documentation**
2. **Compare against actual code** to identify:
   - Outdated information
   - Missing documentation for new features
   - Examples that no longer work
   - Incorrect paths or references

3. **Prioritize changes:**
   - **Critical:** Incorrect information
   - **High:** Missing documentation for public APIs
   - **Medium:** Missing examples
   - **Low:** Minor wording improvements

### Phase 4: Propose Updates

For each documentation file that needs changes:

```markdown
### {filename}

**Current:** {what it says}

**Actual:** {what the code does}

**Proposed change:** {specific edit}
```

### Phase 5: Confirm and Apply

1. **Present all proposed changes** to user
2. **Ask for confirmation:** "Apply these changes? (all / select / none)"
3. **Apply approved changes** using Edit tool
4. **Verify changes** are correct

## Output Format

```markdown
## Documentation Updates

### Files Analyzed

- {list of doc files checked}

### Changes Made

| File | Change | Status  |
| ---- | ------ | ------- |
| ...  | ...    | Applied |

### Verification

- [ ] All changes applied
- [ ] Links still work
- [ ] Examples are accurate
```

## Key Principle

**Discover, don't assume.** The codebase structure evolves. Instead of maintaining hardcoded mappings that get stale, use search and discovery to find what documentation exists and what might need updates.
