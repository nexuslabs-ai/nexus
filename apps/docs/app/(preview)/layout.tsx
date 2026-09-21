import type { Metadata } from 'next';

import '../globals.css';
export const metadata: Metadata = {
  title: 'Nexus component preview',
  robots: { index: false, follow: false },
};
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="nx:bg-background nx:text-foreground">{children}</body>
    </html>
  );
}
