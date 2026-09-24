import { type DemoId, getDemo } from '../../__generated__/demo-index';

/** Renders one demo from `apps/docs/examples/` on a framed stage. */
export async function ComponentPreview({ id }: { id: DemoId }) {
  const { Component } = await getDemo(id).load();

  return (
    <div
      data-slot="component-preview"
      data-demo={id}
      className="nx:my-6 nx:flex nx:min-h-44 nx:items-center nx:justify-center nx:p-8 nx:rounded-md nx:border nx:border-border-default nx:bg-background"
    >
      <Component />
    </div>
  );
}
