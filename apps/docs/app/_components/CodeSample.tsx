import { type CodeSampleLanguage, highlightSample } from '../_lib/code-sample';

/**
 * Hand-written code sample on a `_pages` route, tokenised by the same theme
 * the MDX fences use.
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
