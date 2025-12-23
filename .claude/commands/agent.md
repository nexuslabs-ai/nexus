---
description: Create or update agents for codebase analysis
argument-hint: [create | update] [agent-name]
---

Create or update agents based on codebase exploration.

## Flow

### 1. Gather Information

Ask the user:
- **Action**: Create new agent or update existing?
- **Scope**: What should this agent analyze? (package, feature, patterns)
- **Purpose**: What should the agent discover or report?

### 2. Explore Relevant Context

Based on scope, read:
- Package `CLAUDE.md` files
- `.claude/rules/*.md` files
- Existing patterns in the codebase

### 3. Define Agent Scope

From exploration, identify:
- What files/patterns to analyze
- What questions the agent should answer
- What format for output/report

### 4. Create/Update Agent

Location: `.claude/agents/{agent-name}.md`

Follow the structure from `.claude/rules/skills-agents.md`

### 5. Report

Provide summary:

| Item | Details |
|------|---------|
| Agent | `{agent-name}` |
| Location | `.claude/agents/{agent-name}.md` |
| Scope | {what it analyzes} |
| Triggers | {when to use} |
