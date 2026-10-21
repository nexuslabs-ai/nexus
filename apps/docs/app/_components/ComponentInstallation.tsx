import type { ReactNode } from 'react';

import Link from 'next/link';

import { loadInstallPlan, loadReactSource } from '../_lib/dependencies';
import { requirePage } from '../_lib/manifest';

import { CodeSample, CodeSampleCard } from './CodeSample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './nxds';

type Step = { title: string; body?: ReactNode };

/** The Installation section of a component page: Command and Manual tabs. */
export async function ComponentInstallation({ slug }: { slug: string }) {
  const { components, packages, files, styles } = await loadInstallPlan(slug);
  const sources = await Promise.all(
    files.map(async (path) => ({ path, source: await loadReactSource(path) }))
  );

  const steps: Step[] = [];
  if (components.length > 0) {
    steps.push({
      title: 'Install these components first:',
      body: (
        <p className="nx:typography-body-default nx:text-muted-foreground">
          <ComponentLinks slugs={components} />.
        </p>
      ),
    });
  }
  if (packages.length > 0) {
    steps.push({
      title: 'Install the following dependencies:',
      body: <PackagesSample packages={packages} />,
    });
  }
  steps.push({
    title: 'Copy and paste the following code into your project.',
    body: sources.map(({ path, source }) => (
      <SourceFile key={path} path={path} source={source} />
    )),
  });
  if (styles.length > 0) {
    steps.push({
      title: 'Import the styles in your global stylesheet:',
      body: <StylesSample styles={styles} />,
    });
  }
  steps.push({
    title: 'Keep each file at the path shown above it.',
    body: (
      <p className="nx:typography-body-default nx:text-muted-foreground">
        Paths are relative to <code>packages/react/src/</code>. Keep the same
        folders under your <code>@/</code> root, and the imports between files
        work without edits.
      </p>
    ),
  });

  return (
    <Tabs defaultValue="manual" className="nx:mb-4">
      <TabsList variant="underline">
        <TabsTrigger value="command">Command</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      {/* TODO(#798): replace with the registry install command. */}
      <TabsContent value="command">
        <p className="nx:py-4 nx:typography-body-default nx:text-muted-foreground">
          Coming soon.
        </p>
      </TabsContent>
      <TabsContent value="manual">
        <ol className="nx:mt-4 nx:flex nx:flex-col nx:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="nx:flex nx:gap-4">
              <span
                aria-hidden
                className="nx:flex nx:size-7 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-full nx:bg-control-background nx:typography-label-default nx:font-semibold nx:text-foreground"
              >
                {index + 1}
              </span>
              <div className="nx:min-w-0 nx:flex-1 nx:pt-0.5">
                <p className="nx:mb-3 nx:typography-body-default nx:font-medium nx:text-foreground">
                  {step.title}
                </p>
                {step.body}
              </div>
            </li>
          ))}
        </ol>
      </TabsContent>
    </Tabs>
  );
}

export function SourceFile({ path, source }: { path: string; source: string }) {
  return (
    <CodeSampleCard
      className="nx:mb-4"
      lang={path.endsWith('.css') ? 'css' : 'tsx'}
      code={source}
      header={
        <figcaption className="nx:px-4 nx:py-2 nx:border-b nx:border-border-default nx:typography-code-inline nx:text-muted-foreground">
          {path}
        </figcaption>
      }
    />
  );
}

/** The `npm install` command for `name@range` packages. */
export function PackagesSample({ packages }: { packages: readonly string[] }) {
  return (
    <CodeSample lang="bash">{`npm install ${packages.join(' ')}`}</CodeSample>
  );
}

/** The global stylesheet's `@import` for each style file. */
export function StylesSample({ styles }: { styles: readonly string[] }) {
  return (
    <CodeSample lang="css">
      {[
        '/* app/globals.css */',
        ...styles.map((file) => `@import '../${file}';`),
      ].join('\n')}
    </CodeSample>
  );
}

const LINK_CLASS =
  'nx:text-primary-subtle-foreground nx:underline nx:underline-offset-2';

/** Links to each component's page, comma-separated. */
export function ComponentLinks({ slugs }: { slugs: readonly string[] }) {
  return slugs.map((slug, index) => (
    <span key={slug}>
      {index > 0 && ', '}
      <Link href={`/components/${slug}`} className={LINK_CLASS}>
        {requirePage('components', slug).label}
      </Link>
    </span>
  ));
}
