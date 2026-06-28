import { leafPathsOf } from '../validate-spacing-modes.js';

// Intentional duplicates. Each needs a real architectural reason.
// Empty after #553 because regular/medium/bold are deleted instead of aliased.
export const DISTINCTNESS_ALLOWLIST = [];

function valueAtPath(obj, dotted) {
  return dotted.split('.').reduce((node, key) => node[key], obj).$value;
}

export function leafValues(modeData) {
  const out = {};
  for (const p of leafPathsOf(modeData)) out[p] = valueAtPath(modeData, p);
  return out;
}

export function diffLeaves(aLeaves, bLeaves) {
  const diffs = [];
  for (const key of new Set([
    ...Object.keys(aLeaves),
    ...Object.keys(bLeaves),
  ])) {
    if (JSON.stringify(aLeaves[key]) !== JSON.stringify(bLeaves[key])) {
      diffs.push(key);
    }
  }
  return diffs.sort();
}

export function comparePairs(family, leavesByMode) {
  const names = Object.keys(leavesByMode).sort();
  const findings = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const diffs = diffLeaves(leavesByMode[names[i]], leavesByMode[names[j]]);
      findings.push({
        family,
        a: names[i],
        b: names[j],
        differingLeaves: diffs.length,
        firstDiffs: diffs.slice(0, 5),
      });
    }
  }
  return findings;
}

function isAllowed(family, a, b, allowlist) {
  return allowlist.some(
    (e) => e.family === family && e.modes.includes(a) && e.modes.includes(b)
  );
}

export function findViolations(findings, allowlist = DISTINCTNESS_ALLOWLIST) {
  return findings.filter(
    (f) => f.differingLeaves === 0 && !isAllowed(f.family, f.a, f.b, allowlist)
  );
}
