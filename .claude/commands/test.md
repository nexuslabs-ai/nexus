---
description: Run tests with options (watch, coverage, specific file)
argument-hint: [watch | coverage | file-path]
---

Run the test suite with various options.

Option: $ARGUMENTS

## Commands

| Option | Command | Description |
|--------|---------|-------------|
| (none) | `yarn test` | Run all tests |
| watch | `yarn test:watch` | Watch mode for development |
| coverage | `yarn test:coverage` | Generate coverage report |
| {file-path} | `yarn test <path>` | Run tests for specific file |

## Coverage Thresholds

The project requires 70% coverage for:
- Statements
- Branches
- Functions
- Lines

## After Running

Report the results:

| Metric | Result |
|--------|--------|
| Test files | X passed |
| Tests | X passed |
| Duration | Xms |
| Coverage | X% (if coverage mode) |

If tests fail, analyze the failures and suggest fixes.
