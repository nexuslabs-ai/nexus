import { TopNav } from '../_components/TopNav';

export default function WorkspaceGroupLayout({
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
