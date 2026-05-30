import { SubPageView } from '../../_components/SubPageView';
import { SECTIONS } from '../../_lib/sections';
import { ColorShowcase } from '../_components/ColorShowcase';

/**
 * Coexistence: a sub-page with a real hand-built component renders it;
 * everything else falls back to the registry placeholder view. This is
 * the page-by-page migration path — real pages replace placeholders one
 * at a time, no big-bang.
 */
const REAL_PAGES: Record<string, React.ComponentType> = {
  color: ColorShowcase,
};

export function generateStaticParams() {
  return SECTIONS.foundations.subs.map((s) => ({ sub: s.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ sub: string }>;
}) {
  const { sub } = await params;
  const Real = REAL_PAGES[sub];
  if (Real) return <Real />;
  return <SubPageView sectionSlug="foundations" subSlug={sub} />;
}
