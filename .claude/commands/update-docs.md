# Update Docs

Update documentation based on codebase changes using the Technical Writer agent.

## Agent Used

| Agent                                             | Skill                                         | Purpose                         |
| ------------------------------------------------- | --------------------------------------------- | ------------------------------- |
| [Technical Writer](../agents/technical-writer.md) | [update-docs](../skills/update-docs/SKILL.md) | Keep docs accurate and complete |

## Input (Optional)

- **$ARGUMENTS**: Scope or specific files to check

```
Examples:
  /update-docs                           → Check recent changes (HEAD~5)
  /update-docs --all                     → Full documentation audit
```

## Flow

```
┌─────────────────────────────────────────┐
│              /update-docs               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Detect Scope                  │
│  • Specific path? → Focus on that area  │
│  • --all flag? → Full audit             │
│  • Otherwise → Recent changes (HEAD~5)  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Spawn Technical Writer Agent         │
│  • Use Task tool with subagent_type     │
│  • Pass scope in prompt                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Technical Writer Executes Skill        │
│  • Analyze changes                      │
│  • Discover affected docs               │
│  • Compare docs against code            │
│  • Propose updates                      │
│  • Apply approved changes               │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Detect Scope

1. **Parse arguments:**

   ```
   If specific path → Focus documentation check on that area
   If --all flag → Full documentation audit across codebase
   Otherwise → Analyze recent git changes (HEAD~5)
   ```

2. **Build context:**
   - Determine which areas to check
   - Note any user-specified focus

### Phase 2: Spawn Technical Writer Agent

**IMPORTANT: You MUST use the Task tool to spawn the agent. Do NOT execute the skill yourself.**

```
Task(
  subagent_type: "technical-writer",
  description: "Update documentation",
  prompt: """
  Update documentation based on codebase changes.

  ## Scope
  {scope description - recent changes / specific path / full audit}

  ## Instructions
  1. Read the update-docs skill at `.claude/skills/update-docs/SKILL.md`
  2. Follow the workflow phases:
     - Phase 1: Analyze changes (git diff for recent, or specified scope)
     - Phase 2: Discover affected documentation files
     - Phase 3: Review and compare docs against code
     - Phase 4: Propose updates
     - Phase 5: Confirm and apply (ask user before applying)
  3. Use dynamic discovery, not hardcoded mappings
  4. Prioritize: Critical (incorrect) > High (missing APIs) > Medium (missing examples) > Low (wording)
  """
)
```

### Phase 3: Report Completion

After documentation updates are complete, output:

```markdown
## Documentation Updates Complete

### Scope

{What was checked: recent changes / specific path / full audit}

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

### Next Steps

{Any follow-up items or notes for the user}
```

## Error Handling

| Error                | Action                                 |
| -------------------- | -------------------------------------- |
| No changes detected  | Report "Documentation is up to date"   |
| Path not found       | Ask user to verify path                |
| User rejects changes | Skip those changes, continue with rest |
| Conflicting edits    | Ask user which version to keep         |
