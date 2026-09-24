import { type DemoId, getDemo } from '../../__generated__/demo-index';

import { CodeSample } from './CodeSample';

/** Shows the full source of one demo from `apps/docs/examples/`. */
export async function ComponentSource({ id }: { id: DemoId }) {
  const { source } = await getDemo(id).load();

  return <CodeSample lang="tsx">{source}</CodeSample>;
}
