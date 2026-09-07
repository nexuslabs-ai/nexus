import css from '@shikijs/langs/css';
import tsx from '@shikijs/langs/tsx';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { NEXUS_CODE_THEME } from '../../code-theme';
import { CODE_BLOCK_SURFACE } from '../_lib/code-block';

const LANGS = { css, tsx };

export type CodeSampleLanguage = keyof typeof LANGS;

// Fine-grained: the full `shiki` entry traces all 261 bundled grammars into
// the route. Built once and reused across every sample in the build.
let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [NEXUS_CODE_THEME],
    langs: Object.values(LANGS),
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export async function highlightSample(lang: CodeSampleLanguage, code: string) {
  return (await getHighlighter()).codeToHtml(code, {
    lang,
    theme: NEXUS_CODE_THEME.name,
    transformers: [
      {
        pre(node) {
          node.properties.class = CODE_BLOCK_SURFACE;
          // Shiki's fill would paint over the Nexus surface, and by this point
          // its `color` is the placeholder `normalizeTheme` swapped in. Every
          // token span carries its own colour, so the `pre` needs no style.
          delete node.properties.style;
        },
      },
    ],
  });
}

/**
 * Hand-written code sample on a `_pages` route, tokenised by the same theme
 * the MDX fences use. Server-only: highlighting runs during the static build,
 * so no highlighter reaches the client.
 */
export async function CodeSample({
  lang,
  children,
}: {
  lang: CodeSampleLanguage;
  children: string;
}) {
  const html = await highlightSample(lang, children);

  // Shiki emits the `pre` — including its own `tabindex` — so the wrapper is
  // `display: contents` and generates no box.
  return (
    <div className="nx:contents" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
