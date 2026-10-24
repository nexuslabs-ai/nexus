// Run after editing coexistence-samples.mjs or the syntax theme.
import { writeFile } from 'node:fs/promises';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import tsx from '@shikijs/langs/tsx';
import githubDark from 'shiki/themes/github-dark.mjs';
import { integrationSamples } from '../app/_components/home-page/coexistence-samples.mjs';

const highlighter = await createHighlighterCore({
  themes: [githubDark],
  langs: [tsx],
  engine: createJavaScriptRegexEngine(),
});
const samples = integrationSamples;
const output = Object.fromEntries(
  Object.entries(samples).map(([key, code]) => [
    key,
    highlighter
      .codeToTokens(code, {
        lang: 'tsx',
        theme: 'github-dark',
      })
      .tokens.map((line) =>
        line.map(({ content, color }) => ({ content, color }))
      ),
  ])
);
await writeFile(
  new URL(
    '../app/_components/home-page/coexistence-highlighted.json',
    import.meta.url
  ),
  `${JSON.stringify(output, null, 2)}\n`
);
highlighter.dispose();
