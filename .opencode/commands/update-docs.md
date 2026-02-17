---
description: Update documentation based on codebase changes
agent: technical-writer
---

Update documentation based on codebase changes using the Technical Writer agent.

## Input (Optional)

- **$ARGUMENTS**: Scope or specific files to check

Examples:

- `/update-docs` → Check recent changes (HEAD~5)
- `/update-docs --all` → Full documentation audit

## Instructions

1. Read the update-docs skill at `.claude/skills/update-docs/SKILL.md`
2. Determine scope:
   - Specific path provided → Focus on that area
   - `--all` flag → Full audit
   - No args → Recent changes (HEAD~5)
3. Follow the workflow phases:
   - Phase 1: Analyze changes (git diff for recent, or specified scope)
   - Phase 2: Discover affected documentation files
   - Phase 3: Review and compare docs against code
   - Phase 4: Propose updates
   - Phase 5: Confirm and apply (ask user before applying)
4. Use dynamic discovery, not hardcoded mappings
5. Prioritize: Critical (incorrect) > High (missing APIs) > Medium (missing examples) > Low (wording)

## Arguments

$ARGUMENTS
