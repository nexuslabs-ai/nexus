import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(REPO_ROOT, 'package.json');
const DEFAULT_SOURCE_ROOTS = [
  path.join(REPO_ROOT, 'apps'),
  path.join(REPO_ROOT, 'packages'),
];
const SOURCE_FILE_RE = /\.(?:[cm]js|[cm]ts|jsx|tsx|css|scss|mdx)$/i;
const IGNORED_SOURCE_DIRS = new Set([
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'storybook-static',
]);
const RAW_NUMERIC_VH_RE = /(?<![a-z0-9.])\d+(?:\.\d+)?vh(?![a-z0-9])/gi;
const TAILWIND_SCREEN_HEIGHT_RE =
  /\b(?:nx:)?(?:(?:[a-z0-9-]+|\[[^\]]+\]):)*(?:min-h|h|max-h)-screen\b/g;
const VH_ALLOW_RE = /^\/\/\s*nexus-allow-vh:\s*\S/;

export const BROWSER_FLOOR = Object.freeze({
  chrome: 111,
  edge: 111,
  firefox: 113,
  safari: 15.4,
  samsung: 22,
});

export const EXPECTED_BROWSERSLIST = Object.freeze([
  'Chrome >= 111',
  'Edge >= 111',
  'Firefox >= 113',
  'Safari >= 15.4',
  'Samsung >= 22',
]);

export const FEATURE_POLICIES = Object.freeze([
  {
    id: 'oklch',
    name: 'OKLCH color',
    policy: 'adopt',
    support: {
      chrome: 111,
      edge: 111,
      firefox: 113,
      safari: 15.4,
      samsung: 22,
    },
    guide: 'css',
    note: 'Nexus uses OKLCH as the browser-floor feature and does not emit hex fallbacks.',
  },
  {
    id: 'color-scheme',
    name: 'color-scheme',
    policy: 'adopt',
    support: {
      chrome: 81,
      edge: 81,
      firefox: 96,
      safari: 13,
      samsung: 13,
    },
    guide: 'css / dark-mode',
    note: 'Safe to use for native browser UI theming at the Nexus floor.',
  },
  {
    id: 'accent-color',
    name: 'accent-color',
    policy: 'progressive-enhancement',
    support: {
      chrome: 93,
      edge: 93,
      firefox: 92,
      safari: 15.4,
      samsung: 17,
    },
    guide: 'brand-consistent-forms',
    note: 'Scope to native checkbox/radio/range/progress controls; unsupported or partial implementations fall back to UA defaults.',
  },
  {
    id: 'viewport-height-units',
    name: 'svh / lvh / dvh viewport units',
    policy: 'adopt',
    support: {
      chrome: 108,
      edge: 108,
      firefox: 101,
      safari: 15.4,
      samsung: 21,
    },
    guide: 'css / css-layout',
    note: 'Use svh, lvh, or dvh instead of raw vh according to browser-chrome intent.',
  },
  {
    id: 'backdrop-filter',
    name: 'backdrop-filter',
    policy: 'adopt',
    support: {
      chrome: 76,
      edge: 79,
      firefox: 103,
      safari: 9,
      samsung: 12,
    },
    guide: 'css',
    note: 'Safe for translucent popover/menu surfaces; Tailwind emits the WebKit-prefixed declaration Safari needs.',
  },
  {
    id: 'light-dark',
    name: 'light-dark()',
    policy: 'defer',
    support: {
      chrome: 123,
      edge: 123,
      firefox: 120,
      safari: 17.5,
      samsung: 27,
    },
    guide: 'dark-mode',
    note: 'Use existing .dark semantic-token overrides until this clears the floor.',
  },
  {
    id: 'popover-api',
    name: 'Popover API',
    policy: 'intentional-divergence',
    support: {
      chrome: 114,
      edge: 114,
      firefox: 125,
      safari: 17,
      samsung: 23,
    },
    guide: 'html',
    note: 'Keep Radix primitives for core overlays unless native use is progressive-enhanced.',
  },
  {
    id: 'dialog-closedby',
    name: '<dialog closedby>',
    policy: 'defer',
    support: {
      chrome: 134,
      edge: 134,
      firefox: null,
      safari: null,
      samsung: null,
    },
    guide: 'html',
    note: 'Do not depend on closedby for platform dismiss behavior at the current floor.',
  },
  {
    id: 'anchor-positioning',
    name: 'CSS Anchor Positioning',
    policy: 'fallback',
    support: {
      chrome: 125,
      edge: 125,
      firefox: null,
      safari: null,
      samsung: null,
    },
    guide: 'css-layout',
    note: 'Use Radix positioning or feature-detected enhancement for anchored overlays.',
  },
  {
    id: 'container-style-queries',
    name: 'Container style queries',
    policy: 'fallback',
    support: {
      chrome: 111,
      edge: 111,
      firefox: null,
      safari: 18,
      samsung: 22,
    },
    guide: 'design-token-reactivity',
    note: 'Firefox lacks support; keep data attributes/classes for core token reactivity.',
  },
  {
    id: 'scroll-state-queries',
    name: 'Container scroll-state queries',
    policy: 'progressive-enhancement',
    support: {
      chrome: 133,
      edge: 133,
      firefox: null,
      safari: null,
      samsung: null,
    },
    guide: 'scrollability-affordance-hints',
    note: 'Use non-critical enhancement or IntersectionObserver fallback for required hints.',
  },
  {
    id: 'field-sizing',
    name: 'field-sizing: content',
    policy: 'progressive-enhancement',
    support: {
      chrome: 123,
      edge: 123,
      firefox: null,
      safari: 26.2,
      samsung: null,
    },
    guide: 'form-fields-automatically-fit-contents',
    note: 'Use as progressive enhancement only; fixed-size fields remain the fallback.',
  },
  {
    id: 'scrollbar-color',
    name: 'scrollbar-color / scrollbar-width',
    policy: 'intentional-divergence',
    support: {
      chrome: 121,
      edge: 121,
      firefox: 64,
      safari: 26.2,
      samsung: null,
    },
    guide: 'customize-scrollbar-color-and-thickness',
    note: 'Radix ScrollArea remains the design-system default; native styling is enhancement-only.',
  },
]);

const BROWSER_LABELS = Object.freeze({
  chrome: 'Chrome',
  edge: 'Edge',
  firefox: 'Firefox',
  safari: 'Safari',
  samsung: 'Samsung Internet',
});

export const FEATURE_POLICY_DEFINITIONS = Object.freeze({
  adopt: {
    label: 'Adopt',
    requiresFloorSupport: true,
    reconsiderWhenFloorSafe: false,
  },
  'progressive-enhancement': {
    label: 'Progressive enhancement',
    requiresFloorSupport: false,
    reconsiderWhenFloorSafe: false,
  },
  fallback: {
    label: 'Fallback required',
    requiresFloorSupport: false,
    reconsiderWhenFloorSafe: false,
  },
  'intentional-divergence': {
    label: 'Intentional divergence',
    requiresFloorSupport: false,
    reconsiderWhenFloorSafe: false,
  },
  defer: {
    label: 'Defer',
    requiresFloorSupport: false,
    reconsiderWhenFloorSafe: true,
  },
});

function compareVersions(actual, required) {
  if (required === null) return false;
  return actual >= required;
}

function formatSupportValue(value) {
  return value === null ? 'unsupported' : `${value}+`;
}

function formatSupportSummary(feature) {
  return Object.entries(BROWSER_LABELS)
    .map(([browser, label]) => {
      return `${label} ${formatSupportValue(feature.support[browser])}`;
    })
    .join(', ');
}

function* walkSourceFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_SOURCE_DIRS.has(entry.name)) continue;
      yield* walkSourceFiles(path.join(dir, entry.name));
      continue;
    }

    if (!SOURCE_FILE_RE.test(entry.name)) continue;
    yield path.join(dir, entry.name);
  }
}

function getLocation(content, offset) {
  const before = content.slice(0, offset);
  const line = before.split('\n').length;
  const lineStart = before.lastIndexOf('\n') + 1;

  return {
    line,
    column: offset - lineStart + 1,
  };
}

function hasVhException(lines, line) {
  if (line <= 1) return false;
  return VH_ALLOW_RE.test(lines[line - 2].trim());
}

function getRawViewportHeightRecommendation(match) {
  if (match.endsWith('-screen')) {
    return 'replace screen height with svh, dvh, or lvh based on layout intent';
  }

  return 'replace vh with svh, dvh, or lvh based on layout intent';
}

export function findRawViewportHeightUsages(content, file = '') {
  const lines = content.split('\n');
  const usages = [];
  const patterns = [RAW_NUMERIC_VH_RE, TAILWIND_SCREEN_HEIGHT_RE];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) {
      const location = getLocation(content, match.index);
      if (hasVhException(lines, location.line)) continue;
      usages.push({
        file,
        line: location.line,
        column: location.column,
        match: match[0],
        recommendation: getRawViewportHeightRecommendation(match[0]),
      });
    }
  }

  return usages.sort((a, b) => {
    if (a.line !== b.line) return a.line - b.line;
    return a.column - b.column;
  });
}

export function findRawViewportHeightUsagesInSource(sourceRoots) {
  const usages = [];

  for (const sourceRoot of sourceRoots) {
    for (const file of walkSourceFiles(sourceRoot)) {
      const content = fs.readFileSync(file, 'utf8');
      usages.push(
        ...findRawViewportHeightUsages(content, path.relative(REPO_ROOT, file))
      );
    }
  }

  return usages;
}

export function isFeatureSafeAtFloor(feature, floor = BROWSER_FLOOR) {
  return Object.keys(BROWSER_LABELS).every((browser) => {
    return compareVersions(floor[browser], feature.support[browser]);
  });
}

export function evaluateFeaturePolicies(
  features = FEATURE_POLICIES,
  floor = BROWSER_FLOOR
) {
  return features.map((feature) => {
    const floorSafe = isFeatureSafeAtFloor(feature, floor);
    const policy = FEATURE_POLICY_DEFINITIONS[feature.policy];
    let problem = null;

    if (!policy) {
      problem = `uses unknown policy "${feature.policy}"`;
    } else if (policy.requiresFloorSupport && !floorSafe) {
      problem = `marked ${policy.label.toLowerCase()}, but does not clear the browser floor`;
    }

    if (!problem && policy.reconsiderWhenFloorSafe && floorSafe) {
      problem = `marked ${policy.label.toLowerCase()}, but now clears the browser floor`;
    }

    return {
      ...feature,
      floorSafe,
      problem,
      supportSummary: formatSupportSummary(feature),
    };
  });
}

export function normalizeBrowserslist(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.production)) return value.production;
  return [];
}

export function compareBrowserslist(actual, expected = EXPECTED_BROWSERSLIST) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);

  return {
    missing: expected.filter((target) => !actualSet.has(target)),
    extra: actual.filter((target) => !expectedSet.has(target)),
  };
}

export function auditBrowserSupport(packageJson, options = {}) {
  const browserslist = normalizeBrowserslist(packageJson.browserslist);
  const browserslistDiff = compareBrowserslist(browserslist);
  const features = evaluateFeaturePolicies();
  const featureProblems = features.filter((feature) => feature.problem);
  const rawVhUsages =
    options.rawVhUsages ??
    findRawViewportHeightUsagesInSource(options.sourceRoots ?? []);

  return {
    browserslist,
    browserslistDiff,
    features,
    featureProblems,
    rawVhUsages,
    ok:
      browserslistDiff.missing.length === 0 &&
      browserslistDiff.extra.length === 0 &&
      featureProblems.length === 0 &&
      rawVhUsages.length === 0,
  };
}

function loadPackageJson(file = PACKAGE_JSON) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function printResult(result) {
  process.stdout.write('audit-browser-support: Nexus browser floor\n');
  for (const [browser, label] of Object.entries(BROWSER_LABELS)) {
    process.stdout.write(`  ${label}: ${BROWSER_FLOOR[browser]}+\n`);
  }

  process.stdout.write('\nBrowserslist targets:\n');
  for (const target of result.browserslist) {
    process.stdout.write(`  ${target}\n`);
  }

  process.stdout.write('\nMWG feature policies:\n');
  for (const feature of result.features) {
    const status = feature.floorSafe ? 'floor-safe' : 'outside floor';
    const policy =
      FEATURE_POLICY_DEFINITIONS[feature.policy]?.label ??
      `Unknown policy "${feature.policy}"`;
    process.stdout.write(
      `  ${feature.id}: ${policy} (${status}) — ${feature.guide}\n`
    );
  }

  if (result.ok) {
    process.stdout.write('\naudit-browser-support: all checks passed.\n');
    return;
  }

  if (result.browserslistDiff.missing.length > 0) {
    process.stdout.write('\nMissing Browserslist target(s):\n');
    for (const target of result.browserslistDiff.missing) {
      process.stdout.write(`  ${target}\n`);
    }
  }

  if (result.browserslistDiff.extra.length > 0) {
    process.stdout.write('\nUnexpected Browserslist target(s):\n');
    for (const target of result.browserslistDiff.extra) {
      process.stdout.write(`  ${target}\n`);
    }
  }

  if (result.featureProblems.length > 0) {
    process.stdout.write('\nFeature policy mismatch(es):\n');
    for (const feature of result.featureProblems) {
      process.stdout.write(
        `  ${feature.id}: ${feature.problem}. Support: ${feature.supportSummary}. ${feature.note}\n`
      );
    }
  }

  if (result.rawVhUsages.length > 0) {
    process.stdout.write('\nRaw viewport height usage(s):\n');
    for (const usage of result.rawVhUsages) {
      process.stdout.write(
        `  ${usage.file}:${usage.line}:${usage.column}  "${usage.match}" — ${usage.recommendation}\n`
      );
    }
  }
}

function main() {
  const result = auditBrowserSupport(loadPackageJson(), {
    sourceRoots: DEFAULT_SOURCE_ROOTS,
  });
  printResult(result);
  process.exit(result.ok ? 0 : 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
