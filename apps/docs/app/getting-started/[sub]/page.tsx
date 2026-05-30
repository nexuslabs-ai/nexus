import { SubPageView } from '../../_components/SubPageView';
import { SECTIONS } from '../../_lib/sections';

export function generateStaticParams() {
  return SECTIONS['getting-started'].subs.map((s) => ({ sub: s.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sub: string }>;
}) {
  const { sub } = await params;
  return <SubPageView sectionSlug="getting-started" subSlug={sub} />;
}
