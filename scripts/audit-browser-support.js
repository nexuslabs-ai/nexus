import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON = path.join(REPO_ROOT, 'package.json');

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

export function auditBrowserSupport(packageJson) {
  const browserslist = normalizeBrowserslist(packageJson.browserslist);
  const browserslistDiff = compareBrowserslist(browserslist);
  const features = evaluateFeaturePolicies();
  const featureProblems = features.filter((feature) => feature.problem);

  return {
    browserslist,
    browserslistDiff,
    features,
    featureProblems,
    ok:
      browserslistDiff.missing.length === 0 &&
      browserslistDiff.extra.length === 0 &&
      featureProblems.length === 0,
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
}

function main() {
  const result = auditBrowserSupport(loadPackageJson());
  printResult(result);
  process.exit(result.ok ? 0 : 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
