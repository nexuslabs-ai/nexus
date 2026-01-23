---
name: analyze-deps
description: Analyze dependencies for updates, breaking changes, deprecations, and migration paths. Generates actionable reports with codebase impact assessment.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebSearch
  - WebFetch
  - Write
user-invocable: true
---

# Analyze Dependencies

## Purpose

On-demand dependency analysis that checks for available updates, breaking changes, deprecations, and maps impact against the codebase. Generates actionable reports with migration guidance.

## When to Use

- Auditing dependencies before a major release
- Checking for security vulnerabilities
- Planning dependency upgrades
- Finding deprecated packages that need replacement

## Input Options

```bash
# Single package
/analyze-deps @radix-ui/react-dialog

# Specific workspace
/analyze-deps packages/react

# All workspaces
/analyze-deps all
```

## Analysis Flow

```
Input (package or workspace)
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Resolve package.json(s)          │
│    - Single package → find in deps  │
│    - Workspace → read its pkg.json  │
│    - All → glob all package.jsons   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. npm Registry Fetch               │
│    - Current vs latest versions     │
│    - Classify: patch/minor/major    │
│    - Check deprecation status       │
│    - Get suggested replacements     │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. Changelog & Migration Research   │
│    (Only for packages with updates) │
│    - GitHub releases API            │
│    - CHANGELOG.md fallback          │
│    - WebSearch for migration guides │
│    - Official docs for breaking     │
│      changes                        │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. Codebase Impact Scan             │
│    - Find all imports               │
│    - Trace usage patterns           │
│    - Map against breaking changes   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 5. Generate Report                  │
│    - Markdown file in reports/deps/ │
│    - Upgrade recommendations        │
│    - Risk assessment                │
└─────────────────────────────────────┘
```

## Process

### Phase 1: Resolve Target Dependencies

**Parse input to determine scope:**

| Input Type       | Detection                  | Action                                    |
| ---------------- | -------------------------- | ----------------------------------------- |
| Single package   | Starts with `@` or no `/`  | Find in all package.json dependencies     |
| Workspace path   | Contains `/` (e.g., `packages/react`) | Read that workspace's package.json |
| `all`            | Literal string "all"       | Glob all `**/package.json` files          |

**For single package:**
```bash
# Find which package.json(s) contain this dependency
grep -r "package-name" */package.json
```

**For workspace:**
```bash
# Read the specific package.json
cat packages/react/package.json
```

**For all:**
```bash
# Find all package.json files (exclude node_modules)
find . -name "package.json" -not -path "*/node_modules/*"
```

**Extract dependencies:**
- `dependencies`
- `devDependencies`
- `peerDependencies` (note as peer)

### Phase 2: Query npm Registry

**For each dependency, fetch registry info:**

```bash
npm view {package-name} --json
```

**Extract:**
| Field | Purpose |
|-------|---------|
| `version` | Latest version available |
| `deprecated` | Deprecation message (if any) |
| `time` | Release dates for versions |
| `repository` | GitHub URL for changelog lookup |

**Classify version bump:**

| Type  | Criteria | Risk |
|-------|----------|------|
| Patch | `1.0.0` → `1.0.1` | Low |
| Minor | `1.0.0` → `1.1.0` | Medium |
| Major | `1.0.0` → `2.0.0` | High |

**Emoji usage:** Always use actual Unicode emojis in reports, NOT GitHub shortcodes:
- Use `🔴` not `:red_circle:`
- Use `🟡` not `:yellow_circle:`
- Use `🟢` not `:green_circle:`
- Use `✅` not `:white_check_mark:`

**Flag deprecated packages immediately** — these are priority items.

### Phase 3: Research Breaking Changes

**Only for packages with available updates (prioritize major bumps).**

**Research sources (in order):**

1. **GitHub Releases API**
   ```
   https://api.github.com/repos/{owner}/{repo}/releases
   ```
   - Look for release notes between current and latest version
   - Extract breaking changes, migration notes

2. **CHANGELOG.md**
   ```
   https://raw.githubusercontent.com/{owner}/{repo}/main/CHANGELOG.md
   ```
   - Parse for version headers
   - Extract changes between current and latest

3. **WebSearch for migration guides**
   ```
   "{package-name} v{from} to v{to} migration guide"
   "{package-name} v{to} breaking changes"
   "{package-name} upgrade guide official"
   ```

4. **Official documentation**
   - Check package homepage for upgrade guides
   - Look for migration documentation

**Search priority:**
- Official documentation > GitHub releases > Release notes > Community guides
- Avoid outdated blog posts (check dates)
- Prefer sources from package maintainers

**Document for each package:**
- Breaking changes list
- Migration steps (if found)
- Links to official guides

### Phase 4: Codebase Impact Scan

**Only scan for impact when breaking changes exist.**

If no breaking changes were found in Phase 3, skip this phase entirely. There's no need to list all files using a package when everything is compatible.

**When breaking changes exist:**

```bash
# Find import statements
grep -r "from ['\"]package-name" --include="*.ts" --include="*.tsx"

# Find require statements
grep -r "require(['\"]package-name" --include="*.js" --include="*.ts"
```

**Map against breaking changes only:**
- For each breaking change found in Phase 3
- Check if our codebase uses the affected API
- Only note files that use affected APIs

**Output (only when impact exists):**
```markdown
**Impacted files:**
| File | Line | Impact |
|------|------|--------|
| `packages/react/src/components/modal.tsx` | 12 | Uses deprecated `open` prop |
```

**If no files are impacted by breaking changes:**
```markdown
**Impact:** None. Our codebase does not use any affected APIs.
```

**IMPORTANT:** Do NOT list all files that import the package. Only list files that need changes due to breaking changes or deprecated APIs.

### Phase 5: Generate Report

**Location:** `reports/deps/{target}-{YYYY-MM-DD}.md`

Where `{target}` is:
- Package name (sanitized): `radix-ui-react-dialog`
- Workspace name: `packages-react`
- `all-workspaces` for full scan

**Report structure:**

```markdown
# Dependency Analysis: {target}

Generated: {YYYY-MM-DD HH:mm}
Scope: {description of what was analyzed}

## Summary

| Metric | Count |
|--------|-------|
| Packages analyzed | X |
| Up to date | X |
| Updates available | X |
| Deprecated | X |
| Security issues | X |

## Risk Overview

| Risk | Count | Action |
|------|-------|--------|
| 🔴 High | X | Requires migration planning |
| 🟡 Medium | X | Review changelog before upgrade |
| 🟢 Low | X | Safe to upgrade |

## Updates Available

| Package | Current | Latest | Type | Deprecated | Risk |
|---------|---------|--------|------|------------|------|
| package-a | 1.0.0 | 4.0.0 | major | No | 🔴 High |
| package-b | 2.1.0 | 3.0.0 | major | Yes → use package-b-v2 | 🔴 High |
| package-c | 1.2.0 | 1.5.0 | minor | No | 🟡 Medium |
| package-d | 3.0.0 | 3.0.5 | patch | No | 🟢 Low |

## Up to Date

| Package | Version |
|---------|---------|
| package-e | 2.0.0 |
| package-f | 1.5.0 |

---

## Detailed Analysis

### package-a: 1.0.0 → 4.0.0 (major) 🔴

**Breaking changes:**
- `OldComponent` removed, use `NewComponent` instead
- `legacyProp` renamed to `modernProp`
- Minimum Node version now 18+

**Migration guide:** [Official Migration Guide](link)

**Impacted files:**
| File | Line | Impact |
|------|------|--------|
| `packages/react/src/thing.tsx` | 15 | Uses `OldComponent` |
| `apps/docs/src/example.tsx` | 42 | Uses `legacyProp` |

**Migration steps:**
1. Replace `OldComponent` with `NewComponent` in `thing.tsx`
2. Rename `legacyProp` to `modernProp` in `example.tsx`
3. Verify Node version >= 18 in CI

---

### package-b: 2.1.0 → 3.0.0 (major, deprecated) 🔴

**⚠️ Deprecated:** This package is deprecated. Use `package-b-v2` instead.

**Replacement:** [@scope/package-b-v2](npm-link)

**Migration guide:** [Migration from v2 to v3](link)

**Impacted files:**
| File | Line | Impact |
|------|------|--------|
| `packages/core/src/util.ts` | 8 | Must migrate to new package |

**Migration steps:**
1. Install replacement: `yarn add @scope/package-b-v2`
2. Update imports in `util.ts`
3. Remove old package: `yarn remove package-b`

---

### package-c: 1.2.0 → 1.5.0 (minor) 🟡

**Breaking changes:** None

**Impact:** None. Safe to upgrade.

**Migration steps:**
```bash
yarn upgrade package-c@^1.5.0
```

---

## Recommendations

### 🚨 Immediate Action Required

1. **package-b** — Deprecated, migrate to `package-b-v2`
   - Effort: Low (1 file affected)
   - Risk: Package may stop receiving security updates

### 📋 Plan Migration

2. **package-a** — Major version bump with breaking changes
   - Effort: Medium (2 files affected)
   - Suggest: Create dedicated PR for this migration

### ✅ Safe to Upgrade

3. **package-c** — Minor version (new features, no breaking changes)
4. **package-d** — Patch version (bug fixes only)

---

## Next Steps

- [ ] Address deprecated packages first (security risk)
- [ ] Create migration PR for package-a
- [ ] Batch upgrade patch/minor versions

---

*Report generated by analyze-deps skill*
```

## Error Handling

| Situation | Action |
|-----------|--------|
| npm registry unreachable | Note package as "unable to check", continue with others |
| No changelog found | Note as "changelog not found, manual review needed" |
| GitHub API rate limited | Use WebSearch fallback for breaking changes |
| Package not in registry | Note as "private or unpublished package" |

## Principles

1. **Prioritize by risk** — Security > Deprecated > Major > Minor > Patch
2. **Research thoroughly** — Don't recommend upgrades without understanding impact
3. **Only show impacted files** — Don't list all usage; only files that need changes due to breaking changes
4. **Provide actionable steps** — Every issue should have a clear resolution path
5. **Use official sources** — Prefer maintainer docs over random blog posts
6. **Use Unicode emojis** — Always use actual emoji characters (🔴 🟡 🟢 ✅), not shortcodes
