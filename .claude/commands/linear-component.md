# Linear Component Workflow

End-to-end workflow: Linear ticket → Component creation → PR → Review

## Required Input

- **Linear Issue ID**: $ARGUMENTS (e.g., `NEX-123`)

If no issue ID provided, ask the user for it.

## Execution Mode Selection

**FIRST:** Ask the user which execution mode they prefer using AskUserQuestion:

| Mode           | Description                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Phased**     | Follow the CRITICAL WORKFLOW defined in root `CLAUDE.md` (stop after each phase, summarize, wait for confirmation) |
| **Continuous** | Execute all phases end-to-end without stopping                                                                     |

If **Continuous** mode selected, only stop if critical errors occur, user input is required, or quality gates fail.

## Workflow

### Phase 1: Read Linear Issue

1. **Fetch issue details** using Linear MCP (per `.claude/rules/linear.md`):

   ```
   mcp__linear__get_issue(id: "{issue_id}", includeRelations: true)
   ```

2. **Extract from description:**
   - Component name (from `## Component` section)
   - Figma URLs (from `## Figma` section)
   - Any requirements (from `## Requirements` section)

3. **Get git branch name** from issue's `branchName` field

4. **Validate** all required fields are present. If missing, ask user.

### Phase 2: Setup

1. **Create git branch:**

   ```bash
   git checkout -b {branchName}
   ```

2. **Update Linear status** to "In Progress" (see `.claude/rules/linear.md` for status flow):

   ```
   mcp__linear__update_issue(id: "{issue_id}", state: "In Progress")
   ```

3. **Add comment** to Linear issue (use emoji conventions from `.claude/rules/linear.md`):
   ```
   mcp__linear__create_comment(issueId: "{issue_id}", body: "🤖 Starting component implementation...")
   ```

### Phase 3: Build Component

Execute the `/component` workflow with extracted details:

1. **Analyze Figma designs** (if URLs provided, see `.claude/rules/figma.md` for token mapping):
   - Use `mcp__figma__get_design_context` for each URL
   - Use `mcp__figma__get_variable_defs` for token mappings
   - Use `mcp__figma__get_screenshot` for visual reference

2. **Create component** following `.claude/rules/components.md`:
   - Install Radix primitives if needed
   - Create `{name}.tsx` with CVA variants
   - Match Figma props and sizes
   - Add JSDoc to custom props
   - Use `nx:` prefix on all classes
   - Add data-slot, data-variant, data-size attributes

3. **Create stories** following `.claude/rules/storybook.md`:
   - Create `{Name}.stories.tsx`
   - Add stories for all variants/sizes from Figma
   - Add play function tests
   - Add AllVariants grid story

4. **Add export** to `packages/react/src/index.ts`

5. **Run quality gates:**

   ```bash
   yarn lint
   yarn typecheck
   yarn test:storybook
   yarn build
   ```

6. **Fix any issues** before proceeding

### Phase 4: Create PR

Follow conventions in `.claude/rules/github.md` for PR and commit format.

1. **Commit changes:**

   ```bash
   git add .
   git commit -m "feat(react): add {ComponentName} component

   - Implements {ComponentName} with all Figma variants
   - Adds Storybook stories with play function tests
   - Follows Nexus design system conventions

   Closes {issue_id}

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
   ```

2. **Push branch:**

   ```bash
   git push -u origin {branchName}
   ```

3. **Create PR** using format from `.claude/rules/github.md`:
   - Title: `feat(react): add {ComponentName} component [{issue_id}]`
   - Body: Use component PR template from rules (includes Figma section)
   - MUST include `[{issue_id}]` in title for Linear auto-linking
   - MUST include `Closes {issue_id}` in body for auto-done on merge

### Phase 5: Code Review (Unbiased)

**IMPORTANT:** Review as if this code was written by someone else. Be critical and thorough.

See `.claude/rules/github.md` for review verdicts and MCP usage.

1. **Get PR files and read actual code:**

   ```
   mcp__github__get_pull_request_files(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

   Then **read the full content** of each created file using the Read tool.

2. **Architecture Review** (check against `.claude/rules/components.md` and `.claude/rules/shadcn-divergences.md`):
   - [ ] Uses CVA for variants (not conditional classes)
   - [ ] Proper props interface with `VariantProps<typeof variants>`
   - [ ] Uses Radix primitives where applicable (not custom implementations)
   - [ ] Follows compound component pattern if needed (e.g., Avatar + AvatarImage + AvatarFallback)
   - [ ] No unnecessary abstractions or over-engineering
   - [ ] Matches shadcn/ui architecture patterns (with Nexus divergences applied)

3. **Code Quality Review:**
   - [ ] All Tailwind classes have `nx:` prefix (scan for any missing)
   - [ ] Semantic tokens only (no raw colors like `blue-500`, `#fff`)
   - [ ] `data-slot`, `data-variant`, `data-size` attributes present
   - [ ] JSDoc on ALL custom props (not just some)
   - [ ] No hardcoded values that should be tokens
   - [ ] No unnecessary dependencies imported
   - [ ] Proper TypeScript types (no `any`, proper generics)
   - [ ] Export order matches convention (component, props type, variants)

4. **Stories Review** (check against `.claude/rules/storybook.md`):
   - [ ] All Figma variants covered
   - [ ] Play function tests for interactions
   - [ ] Chromatic config correct (`themeOnlyModes` for grids, `disableSnapshot` for test-only stories)
   - [ ] No duplicate or redundant stories
   - [ ] Proper a11y (alt text, ARIA labels where needed)

5. **Common Issues to Flag:**
   - Missing `nx:` prefix on any class
   - Using `interface Foo {}` instead of `type Foo = ...` for empty interfaces
   - Missing `asChild` support on interactive components
   - Fixed heights/widths instead of padding for sizing
   - Incomplete token paths (e.g., `nx:bg-primary` instead of `nx:bg-primary-background`)
   - Missing error boundaries or edge case handling
   - Accessibility issues (color contrast, missing labels)

6. **ALWAYS Add PR Review** (required - never skip):

   **If issues found** - add review with line comments:

   ```
   mcp__github__create_pull_request_review(
     owner: "INNOVATIVEGAMER",
     repo: "ds",
     pull_number: {pr_number},
     body: "## 🤖 Automated Code Review\n\n{summary table}\n\n### Issues Found\n{list of issues}",
     event: "COMMENT",  // or "REQUEST_CHANGES" if critical
     comments: [
       { path: "file.tsx", line: 42, body: "Issue description..." }
     ]
   )
   ```

   **If no issues** - add approval review:

   ```
   mcp__github__create_pull_request_review(
     owner: "INNOVATIVEGAMER",
     repo: "ds",
     pull_number: {pr_number},
     body: "## 🤖 Automated Code Review\n\n{summary table}\n\n### Result\n✅ All checks passed. Code follows Nexus conventions and shadcn/ui architecture patterns.\n\n**Reviewed:**\n- Architecture: CVA, Radix primitives, compound components\n- Code Quality: nx: prefix, semantic tokens, data attributes, JSDoc\n- Stories: Variants coverage, play functions, Chromatic config\n- Accessibility: Color contrast, ARIA labels",
     event: "APPROVE"
   )
   ```

7. **Review Summary Table** (include in PR review body):
   | Category | Status | Notes |
   |----------|--------|-------|
   | Architecture | ✅/⚠️/❌ | {notes} |
   | Code Quality | ✅/⚠️/❌ | {notes} |
   | Stories | ✅/⚠️/❌ | {notes} |
   | A11y | ✅/⚠️/❌ | {notes} |

8. **If critical issues found:**
   - Do NOT proceed to handoff
   - Fix the issues first
   - Re-run quality gates
   - Amend commit and force push (since not yet reviewed by humans)

### Phase 6: Handoff

Provide summary to user:

```markdown
## ✅ Component Complete

### Links

- **PR:** {pr_url}
- **Linear:** {linear_url}
- **Storybook:** Run `yarn storybook` to preview

### Files Created

- `packages/react/src/components/ui/{name}.tsx`
- `packages/react/src/components/ui/{Name}.stories.tsx`

### Quality Gates

- ✅ Lint passed
- ✅ TypeScript passed
- ✅ Tests passed
- ✅ Build passed

### Next Steps

1. Review the PR
2. Check Storybook visuals
3. Merge when ready
```

## Error Handling

| Error                  | Action                                   |
| ---------------------- | ---------------------------------------- |
| Linear issue not found | Ask user to verify issue ID              |
| Missing component name | Ask user to provide it                   |
| Missing Figma URL      | Continue without Figma (use shadcn base) |
| Quality gate fails     | Fix issues before creating PR            |
| Git conflicts          | Alert user, provide guidance             |

## Linear Issue Template

For best results, tickets should follow this format:

```markdown
## Package

@nexus/react

## Component

{ComponentName}

## Figma

- {link1}
- {link2}

## Requirements (optional)

- {Any specific requirements}
```
