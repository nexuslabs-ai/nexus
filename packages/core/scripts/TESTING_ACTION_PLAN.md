# Core Scripts Testing Action Plan

> **Note to Claude Code**: This plan was created when the codebase was evolving. Before implementing, explore the current `packages/core` structure first and update this plan accordingly.

## Pre-Implementation Checklist

Before adding tests, verify the current state:

1. **Explore current folder structure**:

   ```bash
   tree packages/core/tokens -I node_modules
   tree packages/core/scripts -I node_modules
   ```

2. **Check existing tests**:

   ```bash
   ls packages/core/scripts/__tests__/
   ```

3. **Review current scripts**:
   - `generate-css.js` - Production CSS generation
   - `generate-modular.js` - Modular CSS for playground
   - `copy-to-react.js` - Copy to React package
   - `utils.js` - Shared utility functions

4. **Update this plan** if structure has changed significantly

---

## Phase 1: Unit Tests for utils.js (COMPLETED)

**Status**: ✅ Done

**Location**: `packages/core/scripts/__tests__/utils.test.js`

**Tests**: 31 tests covering:

- `formatTokenValue` - dimension/string/number formatting
- `isReference` - DTCG reference detection
- `extractRefPath` - reference path extraction
- `pathToCssVar` - path to CSS variable conversion
- `resolveReference` - reference to `var()` resolution
- `resolveValue` - combined value resolution
- `extractTokens` - DTCG token extraction
- `DEFAULT_CONFIG` - configuration defaults

---

## Phase 2: Integration Tests for Critical Paths

**When to implement**: When core token structure stabilizes

**Priority**: High - these catch parsing issues that break CSS output

### Test File: `scripts/__tests__/integration.test.js`

### Tests to Add:

#### 2.1 Cross-Primitive Reference Resolution

```javascript
describe('Cross-Primitive References', () => {
  it('resolves shadow focus colors from color primitives', () => {
    // Shadow tokens reference {neutral.100} from color.json
    // Verify resolution chain works
  });

  it('resolves spacing references from size primitives', () => {
    // spacing.json references {size-0}, {size-4} etc.
  });

  it('resolves typography properties from typography primitives', () => {
    // styles/typography.json references {family.font-sans}, {size.6xl} etc.
  });
});
```

#### 2.2 Primitive Map Building

```javascript
describe('Primitive Map', () => {
  it('builds map with all primitive categories', () => {
    // Verify color, size, typography, shadow, radius, borderwidth all loaded
  });

  it('uses correct mode files based on config', () => {
    // --size=lyra should load size-lyra.json, not size-vega.json
  });

  it('resolves cross-references in second pass', () => {
    // Shadow color references should resolve to actual color values
  });
});
```

#### 2.3 CSS Generation Structure

```javascript
describe('CSS Output Structure', () => {
  it('generates valid :root block with primitives', () => {
    // Check primitives grouped by category
  });

  it('generates @theme inline block with semantic tokens', () => {
    // Check light mode semantic tokens
  });

  it('generates .dark block with dark mode overrides', () => {
    // Check dark mode semantic tokens
  });

  it('generates @utility blocks for typography', () => {
    // Check text-* utility classes
  });

  it('generates --shadow-* variables', () => {
    // Check shadow CSS variables
  });
});
```

### Test Fixtures

Create minimal fixture files in `scripts/__tests__/fixtures/`:

```
fixtures/
├── primitives/
│   ├── color.json          # Minimal color tokens
│   ├── size/size-test.json
│   └── shadow/shadow-test.json
├── semantic/
│   ├── base-test-light.json
│   └── base-test-dark.json
└── styles/
    ├── typography.json
    └── shadows.json
```

**Important**: Fixtures should be minimal (5-10 tokens each) to keep tests fast and focused.

---

## Phase 3: Schema Validation (Optional)

**When to implement**: When adding new token types or validating external token imports

### Approach

Use `packages/core/tokens.schema.json` to validate:

- Token files have required `$value` and `$type`
- Types match allowed values (color, dimension, typography, shadow, etc.)
- References use valid `{path.to.token}` syntax

### Test File: `scripts/__tests__/validation.test.js`

```javascript
describe('Token Validation', () => {
  it('validates all primitive token files', () => {
    // Load each file and validate against schema
  });

  it('validates all semantic token files', () => {
    // Load each file and validate against schema
  });

  it('rejects invalid token format', () => {
    // Missing $type, missing $value, etc.
  });
});
```

---

## Implementation Notes

### Running Tests

```bash
# Run all core script tests
npx vitest run packages/core/scripts/__tests__

# Watch mode for development
npx vitest watch packages/core/scripts/__tests__

# Run specific test file
npx vitest run packages/core/scripts/__tests__/utils.test.js
```

### Test Configuration

Tests use the root `vitest.config.ts` which includes:

- `packages/**/*.test.{ts,tsx,js}` pattern
- jsdom environment
- 70% coverage thresholds

### Adding New Tests

1. Create test file in `scripts/__tests__/`
2. Import from vitest: `import { describe, expect, it } from 'vitest'`
3. Import functions from utils.js or scripts
4. Run `npx prettier --write` and `npx eslint --fix` after

---

## When to Add Tests

| Trigger               | Action                                        |
| --------------------- | --------------------------------------------- |
| New token type added  | Add unit tests for parsing logic              |
| New CLI argument      | Add test for parseArgs handling               |
| Cross-reference bug   | Add integration test for that resolution path |
| Structure change      | Update fixtures, review failing tests         |
| Before major refactor | Add integration tests as safety net           |

---

## Current Test Coverage

| File                  | Unit Tests  | Integration Tests   |
| --------------------- | ----------- | ------------------- |
| `utils.js`            | ✅ 31 tests | -                   |
| `generate-css.js`     | -           | Pending             |
| `generate-modular.js` | -           | Pending             |
| `copy-to-react.js`    | -           | Not needed (simple) |

---

## Questions to Answer Before Implementing Phase 2

1. Has the folder structure changed from `primitives/`, `semantic/`, `styles/`?
2. Are there new token types beyond color, dimension, typography, shadow?
3. Have CLI arguments changed or expanded?
4. Is the two-pass primitive resolution still used (load → resolve cross-refs)?
5. Are there new composite token types like typography or shadow?

Review `packages/core/CLAUDE.md` for current documentation.
