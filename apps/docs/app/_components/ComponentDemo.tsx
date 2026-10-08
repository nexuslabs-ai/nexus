import { type DemoId, getDemo } from '../../__generated__/demo-index';

import { CodeSampleCard } from './CodeSample';

/** One docs story on a stage, with its generated source attached below. */
export async function ComponentDemo({ id }: { id: DemoId }) {
  const { Component, source } = await getDemo(id).load();

  return (
    <CodeSampleCard
      data-slot="component-demo"
      data-demo={id}
      className="nx:my-6"
      lang="tsx"
      code={source}
      header={
        <div className="nx:flex nx:min-h-44 nx:items-center nx:justify-center nx:p-8 nx:border-b nx:border-border-default nx:bg-background">
          <Component />
        </div>
      }
    />
  );
}
