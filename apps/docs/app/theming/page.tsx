import { redirect } from 'next/navigation';

import { getDefaultSub } from '../_lib/sections';

export default function Page() {
  const sub = getDefaultSub('theming');
  redirect(`/theming/${sub}`);
}
