import { Footer } from '../_components/Footer';
import { ThemePicker } from '../_components/ThemePicker';
import { TopNav } from '../_components/TopNav';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <main>{children}</main>
      <ThemePicker />
      <Footer />
    </>
  );
}
