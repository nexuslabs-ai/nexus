# Critical Workflow

> **MUST FOLLOW ON EVERY TASK - DO NOT SKIP STEPS**

## Phase-Based Execution

| Step             | Action                            | Output                          |
| ---------------- | --------------------------------- | ------------------------------- |
| **1. Plan**      | Create todo list BEFORE any code  | TodoWrite with all phases       |
| **2. Execute**   | Complete ONE todo item only       | Code changes for that phase     |
| **3. Summarize** | Brief summary + key code snippets | `[file.tsx:42-58](path)` format |
| **4. WAIT**      | STOP for user confirmation        | Do NOT proceed automatically    |
| **5. Repeat**    | Go to step 2 for next phase       | Until all todos complete        |

## Summary Format

After each phase:

- Use tables/bullets for changes made
- Include "Key Code to Review" section with:
  - Actual code snippets
  - File:line links
  - Brief notes on what changed

## Critical Rules

1. **NEVER execute multiple phases without stopping for review**
2. **ALWAYS create TodoWrite before starting implementation**
3. **ALWAYS mark todo as in_progress before starting work**
4. **ALWAYS mark todo as completed immediately after finishing**
5. **ALWAYS provide summary and WAIT after each phase**

## After Significant Changes

Check if these need updates:

- `CLAUDE.md` (root or package-level)
- `.claude/rules/*.md` files
