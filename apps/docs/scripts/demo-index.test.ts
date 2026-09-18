import { describe, expect, it } from 'vitest';

import { type DemoId, getDemo } from '../__generated__/demo-index';

/**
 * The generated index's own surface. A missing generated file takes this file
 * down at collect time, so the staleness gate lives with the generator tests,
 * which import nothing generated and survive to report the regeneration hint.
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
