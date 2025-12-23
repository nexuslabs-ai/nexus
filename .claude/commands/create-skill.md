---
description: Create or update skills based on codebase exploration
argument-hint: [create | update] [skill-name]
---

Create or update skills based on codebase exploration.

## Flow

### 1. Gather Information

Ask the user:

- **Action**: Create new skill or update existing?
- **Package**: Which package to explore? (core, react, test-utils, or root)
- **Workflow**: What workflow should this skill handle?

### 2. Explore Package

Based on the selected package, read:

- Package `CLAUDE.md`
- Relevant files in the package
- Related `.claude/rules/*.md` files

### 3. Identify Patterns

From exploration, identify:

- Key files involved in the workflow
- Steps required to complete the workflow
- Validation/verification criteria
- Dependencies between steps

### 4. Create/Update Skill

Location: `.claude/skills/{skill-name}/SKILL.md`

Follow the structure from `.claude/rules/skills-agents.md`

### 5. Report

Provide summary:

| Item     | Details                                |
| -------- | -------------------------------------- |
| Skill    | `{skill-name}`                         |
| Location | `.claude/skills/{skill-name}/SKILL.md` |
| Package  | `{package}`                            |
| Triggers | {list of trigger phrases}              |
| Steps    | {number of steps}                      |
