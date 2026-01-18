# LinkedIn Post

Generate a LinkedIn post about what was accomplished in this session using the Social Media Manager agent.

## Agent Used

| Agent                                                     | Skill                                             | Purpose                        |
| --------------------------------------------------------- | ------------------------------------------------- | ------------------------------ |
| [Social Media Manager](../agents/social-media-manager.md) | [linkedin-post](../skills/linkedin-post/SKILL.md) | Session-aware content creation |

## Flow

```
┌─────────────────────────────────────────┐
│              /linkedin                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Gather Session Context          │
│  • Conversation history                 │
│  • Git changes                          │
│  • Work accomplished                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Spawn Social Media Manager Agent      │
│  • Use Task tool with subagent_type     │
│  • Pass session context in prompt       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Agent Executes linkedin-post skill     │
│  • Analyze session context              │
│  • Identify story angle                 │
│  • Draft post                           │
│  • Self-review against anti-patterns    │
│  • Present draft with alternatives      │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Gather Session Context

1. **Analyze conversation history:**
   - What was built or fixed?
   - What challenges were overcome?
   - What technologies were used?

2. **Check git changes:**
   ```bash
   git diff --stat HEAD~5
   git log --oneline -5
   ```

### Phase 2: Spawn Social Media Manager Agent

**IMPORTANT: You MUST use the Task tool to spawn the agent. Do NOT execute the skill yourself.**

```
Task(
  subagent_type: "social-media-manager",
  description: "Generate LinkedIn post",
  prompt: """
  Generate a LinkedIn post about what was accomplished in this session.

  ## Session Context
  {summary of conversation - what was built, challenges, outcomes}

  ## Recent Git Activity
  {git log and diff summary}

  ## Instructions
  1. Read the linkedin-post skill at `.claude/skills/linkedin-post/SKILL.md`
  2. Identify the story angle (what's interesting for developers?)
  3. Draft a post following agent principles:
     - Authentic technical voice
     - No buzzwords or hype
     - Focus on insights, not promotion
  4. Self-review against anti-patterns
  5. Present draft with 2-3 alternative angles
  """
)
```

### Phase 3: Iterate

After presenting the draft:

- User may request adjustments
- Resume agent with feedback if changes needed
- Finalize when user approves

## Output Format

```markdown
## LinkedIn Post Draft

{post content}

---

### Alternative Angles

**Option B:** {alternative focus}
**Option C:** {another angle}

---

Would you like me to adjust the tone, length, or focus?
```

## Error Handling

| Error              | Action                           |
| ------------------ | -------------------------------- |
| No session context | Ask user what they want to share |
| Too technical      | Suggest simplifying for audience |
| User rejects draft | Ask for specific feedback        |
