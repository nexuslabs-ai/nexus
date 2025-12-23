# Skills & Agents Rules

## When to Create Skills vs Agents

| Type | Use When | Example |
|------|----------|---------|
| **Skill** | Multi-step workflow with file creation/modification | Creating components, migrating code, expanding tokens |
| **Agent** | Autonomous research/analysis task | Auditing codebase, reviewing PRs, exploring patterns |

## Skill Structure

Location: `.claude/skills/{skill-name}/SKILL.md`

```markdown
# {Skill Name}

## Trigger
When user asks: "..." or "..."

## Context Required
- Package: {which package this skill operates on}
- Rules: {which rule files to reference}

## Steps

### 1. {Step Name}
{Description of what to do}

### 2. {Step Name}
{Description}

## Verification
- [ ] {Checklist item}
- [ ] {Checklist item}

## Output
{What the skill produces}
```

## Agent Structure

Location: `.claude/agents/{agent-name}.md`

```markdown
# {Agent Name}

## Purpose
{What this agent does}

## When to Use
- {Trigger condition}
- {Trigger condition}

## Exploration Scope
- {What to analyze}
- {What to look for}

## Output Format
{How to report findings}
```

## Skill Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| `create-{thing}` | `create-component` | Scaffold new items |
| `migrate-{thing}` | `migrate-component` | Adapt external code |
| `expand-{thing}` | `expand-tokens` | Add to existing systems |
| `audit-{thing}` | `audit-component` | Check completeness |

## Agent Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| `explore-{scope}` | `explore-codebase` | Research and discover |
| `review-{thing}` | `review-changes` | Analyze and suggest |
| `analyze-{thing}` | `analyze-patterns` | Find patterns/issues |

## Discovery Process

Before creating a skill/agent:

1. **Explore the target package** - Read CLAUDE.md, key files
2. **Identify the workflow** - What steps are involved?
3. **Find existing patterns** - What rules apply?
4. **Determine complexity** - Skill (actions) or Agent (analysis)?

## Updating Skills/Agents

When updating existing skills/agents:

1. Read current skill/agent file
2. Explore package for changes
3. Identify gaps between documented and actual patterns
4. Update steps/scope accordingly
5. Verify with a test run if possible
