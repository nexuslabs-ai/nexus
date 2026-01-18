# Figma Analyze

Analyze an existing Figma component for convention compliance and code implementation readiness using the Designer agent.

## Agent Used

| Agent                             | Skill                                             | Purpose                        |
| --------------------------------- | ------------------------------------------------- | ------------------------------ |
| [Designer](../agents/designer.md) | [figma-analyze](../skills/figma-analyze/SKILL.md) | Design-to-code parity analysis |

## Required Input

- **$ARGUMENTS**: Figma URL (e.g., `https://www.figma.com/design/abc123/File?node-id=1-2`)

If no URL provided, ask the user for the Figma component URL.

## Flow

```
┌─────────────────────────────────────────┐
│         /figma-analyze {url}            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Validate Input                │
│  • Extract fileKey and nodeId from URL  │
│  • Ask for URL if not provided          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Spawn Designer Agent             │
│  • Use Task tool with subagent_type     │
│  • Pass Figma URL in prompt             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Designer Executes figma-analyze skill │
│  • Fetch design context from Figma      │
│  • Check AI readability                 │
│  • Validate token usage                 │
│  • Review state implementation          │
│  • Check compound structure             │
│  • Output analysis report               │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Validate Input

1. **Parse arguments for Figma URL:**

   ```
   If URL provided → Extract fileKey and nodeId
   If no URL → Ask user for Figma component URL
   ```

2. **URL format:**
   ```
   https://www.figma.com/design/{fileKey}/{fileName}?node-id={nodeId}
   ```

### Phase 2: Spawn Designer Agent

**IMPORTANT: You MUST use the Task tool to spawn the Designer agent. Do NOT execute the skill yourself.**

```
Task(
  subagent_type: "designer",
  description: "Analyze Figma component",
  prompt: """
  Analyze a Figma component for convention compliance and implementation readiness.

  ## Figma URL
  {figma_url}

  ## Instructions
  1. Read the figma-analyze skill at `.claude/skills/figma-analyze/SKILL.md`
  2. Read the figma rules at `.claude/rules/figma.md`
  3. Use MCP tools to fetch design context:
     - `mcp__figma__get_design_context` for component data
     - `mcp__figma__get_variable_defs` for token usage
     - `mcp__figma__get_screenshot` if visual reference needed
  4. Follow the skill workflow to analyze:
     - AI Readability (property names, layer names, descriptions)
     - Token Usage (spacing, colors, radius)
     - State Implementation (hover, focus, disabled)
     - Compound Structure (frame names, hierarchy)
  5. Output analysis report with blocking vs nice-to-have recommendations
  """
)
```

### Phase 3: Report Results

The Designer agent will output an analysis report with:

```markdown
## Figma Component Analysis

### Component: {name}

### AI Readability

| Check          | Status   | Notes |
| -------------- | -------- | ----- |
| Property Names | ✅/⚠️/❌ | ...   |
| Layer Names    | ✅/⚠️/❌ | ...   |
| Description    | ✅/⚠️/❌ | ...   |

### Token Usage

| Check   | Status   | Notes |
| ------- | -------- | ----- |
| Spacing | ✅/⚠️/❌ | ...   |
| Colors  | ✅/⚠️/❌ | ...   |
| Radius  | ✅/⚠️/❌ | ...   |

### Issues

#### 🔴 Blocking

- {issues that must be fixed}

#### 🟡 Should Fix

- {issues that should be addressed}

#### 🟢 Approved

- {things that follow conventions}

### Implementation Readiness: {READY / NEEDS FIXES}
```

## What It Checks

| Category                 | Checks                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **AI Readability**       | Property names match code, child layer names standardized, component descriptions present |
| **Token Usage**          | Spacing, colors, radius use Figma variables linked to design tokens                       |
| **State Implementation** | Hover/focus use Interactive Components, disabled/loading use boolean props                |
| **Compound Structure**   | Frame names PascalCase matching exports, hierarchy mirrors React composition              |
| **Custom Additions**     | New props/variants/slots follow naming conventions                                        |

## Error Handling

| Error                  | Action                                          |
| ---------------------- | ----------------------------------------------- |
| Invalid Figma URL      | Ask user to provide valid URL                   |
| Figma access denied    | Check MCP connection, ask user to verify        |
| Component not found    | Ask user to verify node-id                      |
| Unknown base component | Analyze as fully custom, check conventions only |
| No Figma variables     | Flag as blocking — must use token variables     |
