import type { ReactNode } from 'react';

import { loadDependencies, loadReactSource } from '../_lib/dependencies';

import { CodeSample, FramedCodeSample } from './CodeSample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './nexus';

type Step = { title: string; body?: ReactNode };

/** The Installation section of a component page: Command and Manual tabs. */
export async function ComponentInstallation({ slug }: { slug: string }) {
  const { install, files, copy, styles } = await loadDependencies(slug);
  const sources = await Promise.all(
    [...files, ...copy].map(async (path) => ({
      path,
      source: await loadReactSource(path),
    }))
  );

  const steps: Step[] = [];
  if (install.length > 0) {
    steps.push({
      title: 'Install the following dependencies:',
      body: (
        <CodeSample lang="bash">
          {`npm install ${install.map(({ name, range }) => `${name}@${range}`).join(' ')}`}
        </CodeSample>
      ),
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
      body: (
        <CodeSample lang="css">
          {[
            '/* app/globals.css */',
            ...styles.map((file) => `@import '../${file}';`),
          ].join('\n')}
        </CodeSample>
      ),
    });
  }
  steps.push({
    title: 'Update the import paths to match your project setup.',
  });

  return (
    <Tabs defaultValue="manual" className="nx:mb-4">
      <TabsList variant="underline">
        <TabsTrigger value="command">Command</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
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

function SourceFile({ path, source }: { path: string; source: string }) {
  return (
    <figure className="nx:mb-4 nx:overflow-hidden nx:rounded-md nx:border nx:border-border-default nx:bg-container">
      <figcaption className="nx:px-4 nx:py-2 nx:border-b nx:border-border-default nx:typography-code-inline nx:text-muted-foreground">
        {path}
      </figcaption>
      <FramedCodeSample lang={path.endsWith('.css') ? 'css' : 'tsx'}>
        {source}
      </FramedCodeSample>
    </figure>
  );
}
