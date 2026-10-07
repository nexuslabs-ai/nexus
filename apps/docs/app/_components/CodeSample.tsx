import { type CodeSampleLanguage, highlightSample } from '../_lib/code-sample';

import { CodeBlock } from './CodeBlock';
import { CodeCollapsible } from './CodeCollapsible';

/** Samples this short show whole; longer ones collapse behind a toggle. */
const COLLAPSE_AFTER_LINES = 6;

/** Drops the block's own border so it sits flush inside a framing card. */
const FRAMED_CLASS = 'nx:rounded-none nx:border-0';

/**
 * A code string rendered outside an MDX fence. Tokenised by the same theme the
 * MDX fences use, then handed to the same `pre` those fences render through, so
 * a sample and a fence get the same surface and the same copy control.
 */
export async function CodeSample({
  lang,
  className,
  children,
}: {
  lang: CodeSampleLanguage;
  className?: string;
  children: string;
}) {
  const html = await highlightSample(lang, children);

  return (
    <CodeBlock
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
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
  const sample = (
    <CodeSample lang={lang} className={FRAMED_CLASS}>
      {children}
    </CodeSample>
  );
  if (children.trimEnd().split('\n').length <= COLLAPSE_AFTER_LINES) {
    return sample;
  }

  return <CodeCollapsible>{sample}</CodeCollapsible>;
}
