import { codeToHtml } from 'shiki';

import { NEXUS_CODE_THEME } from '../../code-theme';
import { CODE_BLOCK_SURFACE } from '../_lib/code-block';

/**
 * Hand-written code sample on a `_pages` route, tokenised by the same theme
 * the MDX fences use. Server-only: `codeToHtml` runs during the static build,
 * so no highlighter reaches the client.
 */
export async function CodeSample({
  lang,
  children,
}: {
  lang: string;
  children: string;
}) {
  const html = await codeToHtml(children, {
    lang,
    theme: NEXUS_CODE_THEME,
    transformers: [
      {
        pre(node) {
          // Shiki's own surface would paint over the Nexus fill; the theme
          // foreground still has to reach spans that carry no colour.
          node.properties.class = CODE_BLOCK_SURFACE;
          node.properties.style = `color:${NEXUS_CODE_THEME.colors['editor.foreground']}`;
        },
      },
    ],
  });

  // Shiki emits the `pre` — including its own `tabindex` — so the wrapper is
  // `display: contents` and generates no box.
  return (
    <div className="nx:contents" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
