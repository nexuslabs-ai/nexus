import { type CodeSampleLanguage, highlightSample } from '../_lib/code-sample';

import { CodeBlock } from './CodeBlock';

/**
 * Hand-written code sample on a `_pages` route. Tokenised by the same theme the
 * MDX fences use, then handed to the same `pre` those fences render through, so
 * a sample and a fence get the same surface and the same copy control.
 */
export async function CodeSample({
  lang,
  children,
}: {
  lang: CodeSampleLanguage;
  children: string;
}) {
  const html = await highlightSample(lang, children);

  return <CodeBlock dangerouslySetInnerHTML={{ __html: html }} />;
}
