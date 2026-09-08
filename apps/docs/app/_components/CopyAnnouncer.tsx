'use client';

import * as React from 'react';

const CopyAnnouncerContext = React.createContext<
  ((message: string) => void) | null
>(null);

/**
 * The page's single `role="status"` region. Every CodeBlock publishes its copy
 * confirmation here rather than mounting a live region of its own, so a page of
 * twenty fences registers one region with assistive tech instead of twenty.
 */
export function CopyAnnouncerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // `seq` advances on every announcement so the message child remounts —
  // re-rendering the same text node would not announce a second time.
  const [{ message, seq }, setAnnouncement] = React.useState({
    message: '',
    seq: 0,
  });

  // Stable so publishing does not re-render every CodeBlock reading the context.
  const announce = React.useCallback(
    (next: string) =>
      setAnnouncement((a) => ({ message: next, seq: a.seq + 1 })),
    []
  );

  return (
    <CopyAnnouncerContext.Provider value={announce}>
      {children}
      <span role="status" className="nx:sr-only">
        <span key={seq}>{message}</span>
      </span>
    </CopyAnnouncerContext.Provider>
  );
}

export function useCopyAnnouncer() {
  const announce = React.useContext(CopyAnnouncerContext);
  if (!announce) {
    throw new Error(
      'useCopyAnnouncer must be used inside <CopyAnnouncerProvider>'
    );
  }
  return announce;
}
