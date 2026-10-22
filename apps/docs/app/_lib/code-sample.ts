import bash from '@shikijs/langs/bash';
import css from '@shikijs/langs/css';
import tsx from '@shikijs/langs/tsx';
import vue from '@shikijs/langs/vue';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { NXDS_CODE_THEME } from '../../code-theme';

import 'server-only';

const LANGS = { bash, css, tsx, vue };

// Shiki renders `text` unhighlighted without loading a grammar for it.
export type CodeSampleLanguage = keyof typeof LANGS | 'text';

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [NXDS_CODE_THEME],
    langs: Object.values(LANGS),
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export async function highlightSample(lang: CodeSampleLanguage, code: string) {
  return (await getHighlighter()).codeToHtml(code, {
    lang,
    theme: NXDS_CODE_THEME.name,
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
