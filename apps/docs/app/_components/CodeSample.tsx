import { type CodeSampleLanguage, highlightSample } from '../_lib/code-sample';

import { CodeBlock } from './CodeBlock';
import { CodeCollapsible } from './CodeCollapsible';

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

/**
 * A `CodeSample` for the inside of a bordered `bg-container` card, collapsed
 * to its first lines when it is long.
 */
export function FramedCodeSample({
  lang,
  children,
}: {
  lang: CodeSampleLanguage;
  children: string;
}) {
  return (
    <CodeCollapsible lines={children.trimEnd().split('\n').length}>
      <CodeSample lang={lang} framed>
        {children}
      </CodeSample>
    </CodeCollapsible>
  );
}
