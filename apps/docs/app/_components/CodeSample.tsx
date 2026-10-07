import type { ComponentProps } from 'react';

import { type CodeSampleLanguage, highlightSample } from '../_lib/code-sample';

import { CodeBlock } from './CodeBlock';
import { CodeCard } from './CodeCard';

/**
 * A code string rendered outside an MDX fence. Tokenised by the same theme the
 * MDX fences use, then handed to the same `pre` those fences render through, so
 * a sample and a fence get the same surface and the same copy control.
 */
export async function CodeSample({
  lang,
  framed,
  children,
}: {
  lang: CodeSampleLanguage;
  framed?: boolean;
  children: string;
}) {
  const html = await highlightSample(lang, children);

  return (
    <CodeBlock framed={framed} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/** A `CodeSample` attached beneath `header` in a `CodeCard`. */
export function CodeSampleCard({
  lang,
  code,
  ...props
}: Omit<ComponentProps<typeof CodeCard>, 'lines' | 'children'> & {
  lang: CodeSampleLanguage;
  code: string;
}) {
  return (
    <CodeCard lines={code.trimEnd().split('\n').length} {...props}>
      <CodeSample lang={lang} framed>
        {code}
      </CodeSample>
    </CodeCard>
  );
}
