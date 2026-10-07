import { type DemoId, getDemo } from '../../__generated__/demo-index';

import { FramedCodeSample } from './CodeSample';

/** One demo from `apps/docs/examples/` on a stage, with its source attached below. */
export async function ComponentDemo({ id }: { id: DemoId }) {
  const { Component, source } = await getDemo(id).load();

  return (
    <div
      data-slot="component-demo"
      data-demo={id}
      className="nx:my-6 nx:overflow-hidden nx:rounded-md nx:border nx:border-border-default nx:bg-container"
    >
      <div className="nx:flex nx:min-h-44 nx:items-center nx:justify-center nx:p-8 nx:border-b nx:border-border-default nx:bg-background">
        <Component />
      </div>
      <FramedCodeSample lang="tsx">{source}</FramedCodeSample>
    </div>
  );
}
