# PR Review

Unbiased code review for pull requests. Run this in a fresh session for objective review.

## Required Input

- **PR Number or Linear Issue ID**: $ARGUMENTS (e.g., `5` or `NEX-140`)

If no input provided, ask the user for PR number.

## Phase 1: Get PR Context

1. **Determine input type:**
   - If numeric only → PR number
   - If contains `NEX-` → Linear issue ID

2. **If Linear issue ID provided** (per `.claude/rules/linear.md` for MCP conventions):
   - Fetch issue to find linked PR:
     ```
     mcp__linear__get_issue(id: "{issue_id}")
     ```
   - Look for PR link in attachments/links
   - If no PR found, ask user for PR number

3. **Fetch PR details** (see `.claude/rules/github.md` for MCP usage):

   ```
   mcp__github__get_pull_request(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

4. **Extract:**
   - PR title and description
   - Base and head branches
   - Linked Linear issue (from description or commits)
   - PR author

5. **If Linear issue linked, fetch ticket:**

   ```
   mcp__linear__get_issue(id: "{issue_id}")
   ```

   - Understand what was requested
   - Note acceptance criteria

## Phase 2: Read Changed Files

1. **Get list of changed files:**

   ```
   mcp__github__get_pull_request_files(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

2. **For each changed file, read full content** using Read tool:
   - Don't just look at diffs
   - Read entire file for context
   - Understand how changes fit into existing code

3. **Categorize files:**

   | Category   | Files                                    |
   | ---------- | ---------------------------------------- |
   | Components | `packages/react/src/components/**/*.tsx` |
   | Stories    | `*.stories.tsx`                          |
   | Tests      | `*.test.ts(x)`                           |
   | Config     | `*.config.*`, `*.json`, `*.yml`          |
   | Styles     | `*.css`                                  |
   | Docs       | `*.md`, `CLAUDE.md`                      |

## Phase 3: Context-Aware Review

**IMPORTANT:** Review as if this code was written by someone else. Be critical and thorough.

### 3.1 Load Review Rules

Based on changed files, read relevant rule files:

| If Changed         | Read Rules                                               |
| ------------------ | -------------------------------------------------------- |
| Components         | `.claude/rules/components.md`                            |
| Stories            | `.claude/rules/storybook.md`, `.claude/rules/testing.md` |
| Tokens/CSS         | `.claude/rules/tokens.md`                                |
| Figma-related      | `.claude/rules/figma.md`                                 |
| PR/Commits         | `.claude/rules/github.md`                                |
| Linear integration | `.claude/rules/linear.md`                                |
| Any code           | Root `CLAUDE.md` for general conventions                 |

### 3.2 Review Checklist

#### Architecture (for components/features)

- [ ] Follows existing patterns in codebase
- [ ] Uses appropriate abstractions (not over/under-engineered)
- [ ] Correct file structure and naming
- [ ] Proper separation of concerns
- [ ] Uses Radix primitives where applicable (not custom implementations)
- [ ] CVA for variants (not conditional class logic)

#### Code Quality

- [ ] All Tailwind classes have `nx:` prefix
- [ ] `nx:` prefix comes BEFORE pseudo-classes (`nx:hover:` not `hover:nx:`)
- [ ] Semantic tokens only (no raw colors like `blue-500`, `#fff`)
- [ ] Full token paths (`nx:bg-primary-background` not `nx:bg-primary`)
- [ ] `data-slot`, `data-variant`, `data-size` attributes present
- [ ] JSDoc on custom props
- [ ] Proper TypeScript types (no `any`, correct generics)
- [ ] No hardcoded values that should be tokens
- [ ] Export order: component, props type, variants

#### Testing (for stories/tests)

- [ ] All variants/states covered
- [ ] Play functions for interactions
- [ ] Proper imports from `storybook/test` (not `@storybook/test`)
- [ ] Chromatic config appropriate (`themeOnlyModes` for grids, `disableSnapshot` for test-only)
- [ ] Edge cases tested (empty, long content, disabled, etc.)

#### Accessibility

- [ ] Proper ARIA attributes where needed
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Focus states visible
- [ ] Screen reader friendly (alt text, labels)

#### Security

- [ ] No secrets/credentials in code
- [ ] No hardcoded URLs that should be config
- [ ] Input validation where needed
- [ ] No XSS vulnerabilities in dynamic content

#### Performance

- [ ] No unnecessary dependencies added
- [ ] No large imports that could be tree-shaken
- [ ] Memoization where appropriate (but not premature)
- [ ] No obvious performance anti-patterns

### 3.3 Linear Ticket Compliance

If Linear ticket available:

- [ ] All requirements addressed
- [ ] Acceptance criteria met
- [ ] Scope matches ticket (no scope creep)
- [ ] No missing functionality

## Phase 4: Compile Review

1. **Create summary table:**

   | Category          | Status   | Issues  |
   | ----------------- | -------- | ------- |
   | Architecture      | ✅/⚠️/❌ | {count} |
   | Code Quality      | ✅/⚠️/❌ | {count} |
   | Testing           | ✅/⚠️/❌ | {count} |
   | Accessibility     | ✅/⚠️/❌ | {count} |
   | Security          | ✅/⚠️/❌ | {count} |
   | Performance       | ✅/⚠️/❌ | {count} |
   | Ticket Compliance | ✅/⚠️/❌ | {count} |

   Legend: ✅ Pass | ⚠️ Minor issues | ❌ Blocking issues

2. **Collect line-specific comments:**
   - Note file path and line number
   - Write clear, actionable feedback
   - Suggest specific fixes where possible

3. **Determine review verdict:**

   | Condition                | Verdict           |
   | ------------------------ | ----------------- |
   | No issues                | `APPROVE`         |
   | Minor issues only (⚠️)   | `COMMENT`         |
   | Any blocking issues (❌) | `REQUEST_CHANGES` |

## Phase 5: Post Review

1. **Create GitHub review** (see `.claude/rules/github.md` for review verdicts):

   ```
   mcp__github__create_pull_request_review(
     owner: "INNOVATIVEGAMER",
     repo: "ds",
     pull_number: {pr_number},
     body: "{review body - see template below}",
     event: "{APPROVE|COMMENT|REQUEST_CHANGES}",
     comments: [
       { path: "file.tsx", line: 42, body: "Issue description..." },
       ...
     ]
   )
   ```

2. **Review body template:**

   ```markdown
   ## 🤖 Automated Code Review

   ### Summary

   | Category          | Status   | Issues  |
   | ----------------- | -------- | ------- |
   | Architecture      | {status} | {notes} |
   | Code Quality      | {status} | {notes} |
   | Testing           | {status} | {notes} |
   | Accessibility     | {status} | {notes} |
   | Security          | {status} | {notes} |
   | Performance       | {status} | {notes} |
   | Ticket Compliance | {status} | {notes} |

   ### Verdict: {APPROVED|CHANGES REQUESTED|REVIEWED}

   {If issues found:}

   ### Issues Found

   #### Blocking ❌

   - {issue 1}
   - {issue 2}

   #### Minor ⚠️

   - {issue 1}
   - {issue 2}

   {If approved:}

   ### Result

   ✅ All checks passed. Code follows Nexus conventions.

   ---

   _Review performed against: `.claude/rules/components.md`, `.claude/rules/testing.md`, etc._
   ```

3. **If Linear ticket linked, add comment** (use emoji conventions from `.claude/rules/linear.md`):
   ```
   mcp__linear__create_comment(
     issueId: "{issue_id}",
     body: "📋 **PR Review Complete**\n\nVerdict: {verdict}\n\nSee PR for details: {pr_url}"
   )
   ```

## Phase 6: Report to User

```markdown
## 📋 Review Complete

### PR: #{pr_number} - {title}

**Verdict:** {APPROVED|CHANGES REQUESTED|REVIEWED}

### Summary

| Category      | Status  |
| ------------- | ------- |
| Architecture  | {emoji} |
| Code Quality  | {emoji} |
| Testing       | {emoji} |
| Accessibility | {emoji} |
| Security      | {emoji} |
| Performance   | {emoji} |

### Issues Found

{count} blocking, {count} minor

{If issues found:}

### Top Issues to Address

1. {Most critical issue}
2. {Second issue}
3. {Third issue}

### Links

- **PR:** {pr_url}
- **Linear:** {linear_url}
```

## Review Principles

1. **Be objective** - Review as if you didn't write the code
2. **Be specific** - Point to exact lines, suggest fixes
3. **Be constructive** - Explain why, not just what
4. **Prioritize** - Blocking issues vs nice-to-haves
5. **Check conventions** - This codebase has specific rules, follow them
6. **Consider context** - Understand the ticket's goals

## Common Issues to Watch For

### Components

- Missing `nx:` prefix on Tailwind classes
- `hover:nx:` instead of `nx:hover:` (wrong order)
- Using `bg-primary` instead of `bg-primary-background`
- Missing `data-slot` attribute
- Fixed heights instead of padding for sizing
- Missing `asChild` support on interactive elements

### Stories

- Importing from `@storybook/test` instead of `storybook/test`
- Missing play functions for interactive stories
- No `AllVariants` grid story
- Missing Chromatic config for grid stories

### General

- Console.log left in code
- Commented out code
- TODO comments without ticket reference
- Unused imports
- Type assertions (`as any`) without justification
