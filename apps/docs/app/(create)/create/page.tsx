import { redirect } from 'next/navigation';

import { CreateWorkspace } from '../../_create/create-workspace';

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  if (search.view === 'tokens') {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (key === 'view' || key === 'component' || value === undefined)
        continue;
      for (const item of Array.isArray(value) ? value : [value])
        params.append(key, item);
    }
    redirect('/token' + (params.size ? '?' + params.toString() : ''));
  }
  return <CreateWorkspace />;
}
