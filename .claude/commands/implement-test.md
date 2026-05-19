# Implement Test

Implement tests using the Tester agent, focusing on result validation over code coverage.

## Agents Used

| Agent                         | Skill                                                           | When Used |
| ----------------------------- | --------------------------------------------------------------- | --------- |
| [Tester](../agents/tester.md) | [implement-test-guide](../skills/implement-test-guide/SKILL.md) | Always    |

## Input (Optional)

- **$ARGUMENTS**: Testing plan file, GitHub issue number, source file path, or description

```
Examples:
  /implement-test                              → Use conversation context
  /implement-test ./docs/TESTING_PLAN.md       → Follow testing plan
  /implement-test #42                          → Fetch from GitHub issue
  /implement-test src/module.ts                → Write tests for module
  /implement-test "tests for search pipeline"  → Description
```

## Context Detection

Parse `$ARGUMENTS` for:

| Pattern            | Context Source            |
| ------------------ | ------------------------- |
| `*.md` path        | Testing plan or spec file |
| `#123`             | GitHub issue              |
| `*.ts` or `*.tsx`  | Source file to test       |
| String description | Use as requirements       |
| (none)             | Use conversation context  |

## Flow

```
┌─────────────────────────────────────────┐
│           /implement-test               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Detect Context                │
│  • Testing plan? → Read plan            │
│  • GitHub issue? → Fetch issue          │
│  • Source file? → Read file             │
│  • Otherwise → Use conversation         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Spawn Tester Agent             │
│  • Use Agent tool with subagent_type     │
│  • Pass context in prompt               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Tester Executes implement-test skill  │
│  • Understand what to test              │
│  • Design test strategy                 │
│  • Create test plan (TodoWrite)         │
│  • Implement tests phase by phase       │
│  • Verify tests passing                 │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Detect Context

1. **Parse arguments for context:**

   ```
   If .md file → Read testing plan
   If #123 → gh issue view 123 --json number,title,body,labels,state,url
   If .ts/.tsx file → Read source file to understand what to test
   Otherwise → Use conversation history as context
   ```

2. **Identify what area this relates to:**
   - Check `.claude/rules/` for any testing or domain-specific rules
   - Use existing test patterns found in the codebase

3. **Collect context to pass to agent:**
   - What needs tests (code, module, feature)
   - Existing test patterns in codebase
   - Relevant testing rules

### Phase 2: Spawn Tester Agent

**IMPORTANT: You MUST use the Agent tool to spawn the agent. Do NOT execute the skill yourself.**

```
Agent(
  subagent_type: "tester",
  description: "Implement tests for {target}",
  prompt: """
  Implement tests for this target.

  ## Context
  - Source: {testing plan / GitHub issue / source file / conversation}
  - Package: {detected package type}
  - Target: {what needs tests}

  ## Instructions
  1. Understand the code to be tested
  2. Design test strategy (fixtures, mocks, assertions)
  3. Implement tests
  4. Verify all tests passing

  ## Testing Philosophy
  - Result validation over code coverage
  - Real fixtures, not synthetic data
  - Partial matching on what matters
  - Mock only external boundaries
  """
)
```

The Tester agent will:

- Follow the implement-test skill workflow
- Create TodoWrite for tracking
- Implement tests phase by phase
- Verify tests are passing

### Phase 3: Report Completion

After tests are implemented, output:

````markdown
## Tests Implemented

### Target

{What was tested}

### Context

- **Source:** {Testing plan / GitHub issue / Source file / Conversation}

### Test Files Created/Modified

| File                     | Tests | Description         |
| ------------------------ | ----- | ------------------- |
| `path/to/module.test.ts` | 5     | {brief description} |

### Coverage Summary

| Scenario   | Tests |
| ---------- | ----- |
| Happy path | X     |
| Errors     | X     |
| Edge cases | X     |

### Verification

```bash
yarn test path/to/tests
```
````

All tests passing: ✅

### Next Steps

{User can now review tests, run full test suite, etc.}

```

## When to Use /implement-test

| Scenario                              | Use This Command |
| ------------------------------------- | ---------------- |
| Have a testing plan to implement      | ✅ Yes           |
| Need tests for existing module        | ✅ Yes           |
| Building testing infrastructure       | ✅ Yes           |
| Adding coverage to untested code      | ✅ Yes           |
| Implementing feature (code + tests)   | ❌ Use /implement |
| Quick unit test for a function        | Maybe direct     |

## Error Handling

| Error                    | Action                                 |
| ------------------------ | -------------------------------------- |
| Testing plan not found   | Ask user to verify file path           |
| Source file not found    | Ask user to verify file path           |
| GitHub issue not found   | Ask user to verify issue number        |
| Unclear what to test     | Ask user for clarification             |
| Tests failing            | Debug and fix (no skipping tests!)     |
| Flaky tests              | Fix the flakiness, don't add retries   |
```
