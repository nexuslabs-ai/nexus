import { describe, expect, it } from 'vitest';

import { CODE_BLOCK_SURFACE } from './code-block';
import { highlightSample } from './code-sample';

const CSS_SOURCE = `:root {
  --nx-color-primary-background: oklch(0.55 0.2 145);
}`;

const TSX_SOURCE = `export function Hello({ name }: { name: string }) {
  return <Button variant="primary">{name}</Button>;
}`;

describe('CodeSample', () => {
  it('tokenises with the same theme the MDX fences use', async () => {
    const html = await highlightSample('tsx', TSX_SOURCE);

    expect(html).toMatch(/var\(--nx-color-/);
    expect(
      new Set(html.match(/var\(--nx-color-[a-z0-9-]+\)/g)).size
    ).toBeGreaterThan(1);
  });

  it('emits no colour outside the token references', async () => {
    for (const lang of ['css', 'tsx'] as const) {
      const html = await highlightSample(
        lang,
        lang === 'css' ? CSS_SOURCE : TSX_SOURCE
      );
      const styles = [...html.matchAll(/style="([^"]*)"/g)].map(
        ([, style]) => style
      );

      expect(styles.length).toBeGreaterThan(0);
      for (const style of styles) {
        expect(style).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      }
    }
  });

  it('leaves the surface to the Nexus tokens', async () => {
    const html = await highlightSample('tsx', TSX_SOURCE);
    const pre = html.slice(0, html.indexOf('>') + 1);

    expect(pre).not.toMatch(/style=/);
    expect(pre).toContain('tabindex="0"');
    expect(pre).toContain(CODE_BLOCK_SURFACE);
  });
});
