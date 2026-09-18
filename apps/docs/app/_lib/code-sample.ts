import css from '@shikijs/langs/css';
import tsx from '@shikijs/langs/tsx';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { NEXUS_CODE_THEME } from '../../code-theme';

import 'server-only';

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
        root(node) {
          const pre = node.children[0];
          if (pre?.type !== 'element') return;

          // `CodeBlock` owns the `pre` — its surface, its tab stop, its copy
          // control — so the sample contributes only the `code` inside it.
          node.children = pre.children;
        },
      },
    ],
  });
}
