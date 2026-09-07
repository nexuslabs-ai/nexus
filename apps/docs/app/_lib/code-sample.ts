import css from '@shikijs/langs/css';
import tsx from '@shikijs/langs/tsx';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { NEXUS_CODE_THEME } from '../../code-theme';

import { CODE_BLOCK_SURFACE } from './code-block';

const LANGS = { css, tsx };

export type CodeSampleLanguage = keyof typeof LANGS;

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
          // Shiki's `background-color` is the placeholder hex `normalizeTheme`
          // swapped in for the token reference. Every span carries its own
          // colour, so dropping the whole attribute loses nothing.
          delete node.properties.style;
        },
      },
    ],
  });
}
