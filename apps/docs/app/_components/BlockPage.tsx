import Link from 'next/link';

import { getBlockDocs } from '../../__generated__/demo-index';
import { loadReactSource } from '../_lib/dependencies';
import { type ManifestPage, requirePage } from '../_lib/manifest';

import { ComponentDemo } from './ComponentDemo';
import { SourceFile } from './ComponentInstallation';
import {
  PAGE_HEADING_CLASS,
  SECTION_HEADING_CLASS,
  SectionHeading,
} from './Heading';
import { InlineCode } from './InlineCode';

type BlockManifestPage = Extract<ManifestPage, { kind: 'block' }>;

const BODY_CLASS =
  'nx:mb-4 nx:typography-body-default nx:text-muted-foreground';
const LINK_CLASS =
  'nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2';

/** A block's story tagged `docs` as the preview, then the files to copy. */
export async function BlockPage({ page }: { page: BlockManifestPage }) {
  const { preview, files, components } = getBlockDocs(page.slug);
  const sources = await Promise.all(
    files.map(async (path) => ({ path, source: await loadReactSource(path) }))
  );

  return (
    <>
      <h1 className={PAGE_HEADING_CLASS}>{page.label}</h1>
      <ComponentDemo id={preview} />

      <SectionHeading className={SECTION_HEADING_CLASS}>Source</SectionHeading>
      <p className={BODY_CLASS}>
        Blocks are not part of the package — copy them into your project. Each
        path below is relative to <InlineCode>packages/react/src/</InlineCode>.
        Keep it as it is under your <InlineCode>@/</InlineCode> root and the
        relative imports between the files resolve without an edit.
      </p>
      {components.length > 0 && (
        <p className={BODY_CLASS}>
          It builds on these components; install each from its page first:{' '}
          {components.map((slug, index) => (
            <span key={slug}>
              {index > 0 && ', '}
              <Link href={`/components/${slug}`} className={LINK_CLASS}>
                {requirePage('components', slug).label}
              </Link>
            </span>
          ))}
          .
        </p>
      )}
      {sources.map(({ path, source }) => (
        <SourceFile key={path} path={path} source={source} />
      ))}
    </>
  );
}
