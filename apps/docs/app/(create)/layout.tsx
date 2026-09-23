import { TopNav } from '../_components/TopNav';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <main>{children}</main>
    </>
  );
}
