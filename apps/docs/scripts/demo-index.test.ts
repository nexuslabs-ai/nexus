import { describe, expect, it } from 'vitest';

import { type DemoId, getDemo } from '../__generated__/demo-index';

/**
 * The generated index's own surface. It lives apart from the generator tests
 * so that a missing or stale generated file fails those with the regeneration
 * hint rather than dying here at collect time on an unresolvable import.
 */
describe('demo-index', () => {
  it('looks a demo up by id and throws on a miss', () => {
    const id: DemoId = 'badge-demo';

    expect(getDemo(id).id).toBe('badge-demo');
    expect(() => getDemo('no-such-demo')).toThrow(/Unknown demo id/);
  });

  it('throws for an inherited prototype key rather than returning it', () => {
    for (const key of ['toString', 'constructor', 'valueOf', '__proto__']) {
      expect(() => getDemo(key)).toThrow(/Unknown demo id/);
    }
  });

  it('keeps DemoId a literal union rather than a widened string', () => {
    // @ts-expect-error - fails to compile once DemoId widens to string.
    const invalid: DemoId = 'no-such-demo';

    expect(() => getDemo(invalid)).toThrow(/Unknown demo id/);
  });
});
