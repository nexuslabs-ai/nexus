import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  APPEARANCE_REACTIVITY_ALLOWLIST,
  APPEARANCE_REACTIVITY_SCAN_ROOTS,
} from './appearance-reactivity.config.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..', '..');
const CLASS_RE = /nx:[^\s"'`)}]+/g;
const DIMENSION_RE =
  /(?:^|[^\w-])-?(?:\d+|\d*\.\d+)(?:px|rem|em|%|lh|vw|vh|svw|svh|lvw|lvh|dvw|dvh|ch|ex|cap|ic)\b/i;

const RULES = {
  rawBorderWidth: 'raw-border-width',
  arbitraryTextSize: 'arbitrary-text-size',
  arbitrarySpacing: 'arbitrary-spacing',
  arbitraryRadius: 'arbitrary-radius',
  arbitraryShadow: 'arbitrary-shadow',
  arbitraryBorderWidth: 'arbitrary-border-width',
};

function toPosix(file) {
  return file.split(path.sep).join('/');
}

function rel(file) {
  return toPosix(path.relative(repoRoot, file));
}

function lineFor(source, index) {
  return source.slice(0, index).split('\n').length;
}

function utilityForClassName(className) {
  const withoutPrefix = className.startsWith('nx:')
    ? className.slice(3)
    : className;
  const parts = withoutPrefix.split(':');

  return parts[parts.length - 1];
}

function isDimensionLiteral(value) {
  return DIMENSION_RE.test(value);
}

function bracketValue(utility, prefix) {
  const match = utility.match(new RegExp(`^${prefix}-\\[(.+)\\]$`));
  return match?.[1] ?? null;
}

function classifyClassName(className) {
  const utility = utilityForClassName(className);

  if (/^border(?:-[xytrbl])?$/.test(utility)) {
    return {
      ruleId: RULES.rawBorderWidth,
      message:
        'Use Nexus runtime stroke utilities such as nx:border-default or nx:border-b-default instead of raw border width.',
    };
  }

  if (/^border(?:-[xytrbl])?-(?:[1-9]\d*(?:\.\d+)?)$/.test(utility)) {
    return {
      ruleId: RULES.rawBorderWidth,
      message:
        'Fixed numeric border widths bypass the Appearance stroke control.',
    };
  }

  const arbitraryBorder = utility.match(/^border(?:-[xytrbl])?-\[(.+)\]$/);
  if (arbitraryBorder && isDimensionLiteral(arbitraryBorder[1])) {
    return {
      ruleId: RULES.arbitraryBorderWidth,
      message:
        'Arbitrary border-width literals bypass the Appearance stroke control.',
    };
  }

  const textValue = bracketValue(utility, 'text');
  if (textValue && isDimensionLiteral(textValue)) {
    return {
      ruleId: RULES.arbitraryTextSize,
      message:
        'Arbitrary text-size literals bypass the Appearance typography scale.',
    };
  }

  const spacingValue = utility.match(
    /^(?:p|px|py|pt|pr|pb|pl|gap|gap-x|gap-y)-\[(.+)\]$/
  )?.[1];
  if (spacingValue && isDimensionLiteral(spacingValue)) {
    return {
      ruleId: RULES.arbitrarySpacing,
      message:
        'Arbitrary spacing literals bypass Nexus spacing/density tokens.',
    };
  }

  const radiusValue = utility.match(/^rounded(?:-[a-z]+)?-\[(.+)\]$/)?.[1];
  if (radiusValue && isDimensionLiteral(radiusValue)) {
    return {
      ruleId: RULES.arbitraryRadius,
      message: 'Arbitrary radius literals bypass Nexus radius tokens.',
    };
  }

  if (/^shadow-\[/.test(utility)) {
    return {
      ruleId: RULES.arbitraryShadow,
      message: 'Arbitrary shadow literals bypass Nexus shadow tokens.',
    };
  }

  return null;
}

function normalizeAllowlistEntry(entry) {
  return {
    ...entry,
    file: toPosix(entry.file),
  };
}

function validateAllowlist(allowlist) {
  const failures = [];

  for (const [index, entry] of allowlist.entries()) {
    if (!entry.file || entry.file.includes('*')) {
      failures.push(`allowlist[${index}] must include a concrete file path.`);
    }
    if (!entry.className && !entry.ruleId) {
      failures.push(
        `allowlist[${index}] must include an exact className or ruleId.`
      );
    }
    if (!entry.reason) {
      failures.push(`allowlist[${index}] must include a reason.`);
    }
  }

  return failures;
}

function isAllowed(violation, allowlist = APPEARANCE_REACTIVITY_ALLOWLIST) {
  const normalized = allowlist.map(normalizeAllowlistEntry);

  return normalized.some((entry) => {
    if (entry.file !== violation.file) return false;
    if (entry.className && entry.className !== violation.className)
      return false;
    if (entry.ruleId && entry.ruleId !== violation.ruleId) return false;

    return true;
  });
}

function auditSource(
  file,
  source,
  allowlist = APPEARANCE_REACTIVITY_ALLOWLIST
) {
  const violations = [];

  for (const match of source.matchAll(CLASS_RE)) {
    const className = match[0];
    const classification = classifyClassName(className);

    if (!classification) continue;

    const violation = {
      file,
      line: lineFor(source, match.index ?? 0),
      className,
      ...classification,
    };

    if (!isAllowed(violation, allowlist)) {
      violations.push(violation);
    }
  }

  return violations;
}

function shouldScanFile(file) {
  if (!/\.[cm]?[jt]sx?$/.test(file)) return false;
  if (file.endsWith('.stories.tsx')) return false;
  if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) return false;
  if (file.endsWith('.test.js') || file.endsWith('.test.mjs')) return false;

  return true;
}

function listFiles(root) {
  const files = [];
  const stack = [root];

  while (stack.length) {
    const current = stack.pop();
    if (!current || !existsSync(current)) continue;

    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (shouldScanFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  return files.sort();
}

function auditFiles({
  roots = APPEARANCE_REACTIVITY_SCAN_ROOTS,
  allowlist = APPEARANCE_REACTIVITY_ALLOWLIST,
} = {}) {
  const allowlistFailures = validateAllowlist(allowlist);
  if (allowlistFailures.length) {
    return {
      allowlistFailures,
      violations: [],
      scannedFiles: 0,
    };
  }

  const violations = [];
  let scannedFiles = 0;

  for (const root of roots) {
    const absoluteRoot = path.resolve(repoRoot, root);

    for (const file of listFiles(absoluteRoot)) {
      scannedFiles += 1;
      const relativeFile = rel(file);
      const source = readFileSync(file, 'utf8');
      violations.push(...auditSource(relativeFile, source, allowlist));
    }
  }

  return {
    allowlistFailures: [],
    violations,
    scannedFiles,
  };
}

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = auditFiles();

  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }

  if (result.allowlistFailures.length) {
    for (const failure of result.allowlistFailures) {
      console.error(failure);
    }
    process.exitCode = 1;
    return;
  }

  if (result.violations.length) {
    console.error('Appearance reactivity audit failed:');
    for (const violation of result.violations) {
      console.error(
        `${violation.file}:${violation.line} ${violation.className} (${violation.ruleId}) - ${violation.message}`
      );
    }
    process.exitCode = 1;
    return;
  }

  if (!options.json) {
    console.log(
      `Appearance reactivity audit clean (${result.scannedFiles} files scanned).`
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}

export {
  auditFiles,
  auditSource,
  classifyClassName,
  isAllowed,
  parseArgs,
  utilityForClassName,
  validateAllowlist,
};
