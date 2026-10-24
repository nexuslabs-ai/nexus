import type { ReactNode } from 'react';

import type { ReactMajor } from '@nxds/catalog';
import Link from 'next/link';

import { cliInstalls, hasReact18Plan, loadInstallPlan } from '../_lib/catalog';
import type { Framework } from '../_lib/frameworks';
import { requirePage } from '../_lib/manifest';

import { CodeSample, CodeSampleCard } from './CodeSample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './nxds';
import { ReactVersionTabs } from './ReactVersionTabs';

type Step = { title: string; body?: ReactNode };

/** Where a copied file goes: the CLI's folder for React, the app's `@/` root otherwise. */
const COPY_TARGET: Record<Framework, ReactNode> = {
  react: (
    <>
      Copy each file to the same path under <code>components/nxds/</code>
    </>
  ),
  vue: (
    <>
      Keep the same folders under your <code>@/</code> root
    </>
  ),
};

/** Where each framework's copied paths are relative to, and React 18's. */
function sourceRoot(framework: Framework, react: ReactMajor) {
  return framework === 'react' && react === 18
    ? 'packages/react-18/src/'
    : `packages/${framework}/src/`;
}

/** The numbered manual steps that install `slug` by hand. */
function ManualSteps({
  slug,
  framework,
  react,
}: {
  slug: string;
  framework: Framework;
  react: ReactMajor;
}) {
  const {
    components,
    packages,
    files: sources,
    styles,
  } = loadInstallPlan(slug, framework, react);

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
        Paths are relative to <code>{sourceRoot(framework, react)}</code>.{' '}
        {COPY_TARGET[framework]}, and the imports between files work without
        edits.
      </p>
    ),
  });

  return (
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
  );
}

/**
 * The Installation section of a component page: Command and Manual tabs, or
 * only the manual steps for a framework the CLI doesn't install. A React
 * component whose files differ on React 18 shows both versions.
 */
export function ComponentInstallation({
  slug,
  framework = 'react',
}: {
  slug: string;
  framework?: Framework;
}) {
  const react19 = <ManualSteps slug={slug} framework={framework} react={19} />;
  const manual =
    framework === 'react' && hasReact18Plan(slug) ? (
      <ReactVersionTabs
        react19={react19}
        react18={<ManualSteps slug={slug} framework={framework} react={18} />}
      />
    ) : (
      react19
    );

  if (!cliInstalls(framework)) return <div className="nx:mb-4">{manual}</div>;

  return (
    <Tabs defaultValue="command" className="nx:mb-4">
      <TabsList variant="underline">
        <TabsTrigger value="command">Command</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="command" className="nx:pt-4">
        <AddCommand name={slug} />
      </TabsContent>
      <TabsContent value="manual">{manual}</TabsContent>
    </Tabs>
  );
}

function sourceLanguage(path: string) {
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.vue')) return 'vue';
  return 'tsx';
}

export function SourceFile({ path, source }: { path: string; source: string }) {
  return (
    <CodeSampleCard
      className="nx:mb-4"
      lang={sourceLanguage(path)}
      code={source}
      header={
        <figcaption className="nx:px-4 nx:py-2 nx:border-b nx:border-border-default nx:typography-code-inline nx:text-muted-foreground">
          {path}
        </figcaption>
      }
    />
  );
}

/**
 * The CLI command that adds `name` with everything it needs, and the setup
 * it assumes.
 */
export function AddCommand({ name }: { name: string }) {
  return (
    <>
      <CodeSample lang="bash">{`npx nxds-cli@latest add ${name}`}</CodeSample>
      <p className="nx:mt-3 nx:typography-body-default nx:text-muted-foreground">
        Run <code>npx nxds-cli@latest init</code> first if nxds isn&rsquo;t set
        up in your app yet. See{' '}
        <Link
          href={requirePage('getting-started', 'install').route}
          className={LINK_CLASS}
        >
          Install
        </Link>
        .
      </p>
    </>
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
        ...styles.map((file) => `@import '../components/nxds/${file}';`),
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
