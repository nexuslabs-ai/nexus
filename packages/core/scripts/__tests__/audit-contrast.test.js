import { describe, expect, it } from 'vitest';

import { formatLine } from '../audit-contrast.js';

// Pins the textual contract `contrast-auditor` agent's parser relies on:
// 2-space prefix + mark + label padded to 48 + ` Lc ` + 6-char Lc + tail.
// Drift here silently breaks the agent — see .claude/agents/contrast-auditor.md
// § 4 "Parse with streaming-header tracking" for the exact layout.
describe('formatLine', () => {
  it('snapshots the FAIL line layout', () => {
    expect(
      formatLine(false, 'foreground ↔ background', -45.3, 75, 'body')
    ).toMatchInlineSnapshot(
      `"  ✗ foreground ↔ background                          Lc  -45.3   FAIL (< 75, body)"`
    );
  });

  it('snapshots the pass line layout', () => {
    expect(
      formatLine(true, 'muted-foreground ↔ muted', 52.1, 45, 'incidental')
    ).toMatchInlineSnapshot(
      `"  ✓ muted-foreground ↔ muted                         Lc   52.1   (≥ 45, incidental)"`
    );
  });

  it('preserves the 2-space prefix, label region, and Lc anchor', () => {
    const line = formatLine(false, 'a ↔ b', -10, 60, 'ui');
    expect(line.startsWith('  ✗ ')).toBe(true);
    // `  ${mark} ` (4 chars) + label.padEnd(48) + ` Lc ` → ' Lc ' at index 52
    expect(line.indexOf(' Lc ')).toBe(52);
    expect(line).toContain('FAIL (< 60, ui)');
  });
});
