import { SectionLayout } from '../_components/SectionLayout';
import { getSection } from '../_lib/sections';

export default function Layout({ children }: { children: React.ReactNode }) {
  const section = getSection('components')!;
  return <SectionLayout section={section}>{children}</SectionLayout>;
}
