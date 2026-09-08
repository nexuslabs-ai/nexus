'use client';

import * as React from 'react';

const CLEAR_DELAY_MS = 2000;

const CopyAnnouncerContext = React.createContext<
  ((message: string) => void) | null
>(null);

/**
 * The page's single `role="status"` region. Every CodeBlock publishes its copy
 * confirmation here rather than mounting a live region of its own, so a page of
 * twenty fences registers one region with assistive tech instead of twenty.
 *
 * The provider owns how long a message lives. A block that published two
 * seconds ago must not blank the region a sibling has since written to, so the
 * clear timer restarts on every announcement and belongs to the region, not to
 * whichever block spoke last.
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
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // Stable so publishing does not re-render every CodeBlock reading the context.
  const announce = React.useCallback((next: string) => {
    setAnnouncement((a) => ({ message: next, seq: a.seq + 1 }));
    window.clearTimeout(timerRef.current);
    // Blanking without advancing `seq` updates the text node in place, so the
    // region empties without reading a second time.
    timerRef.current = window.setTimeout(
      () => setAnnouncement((a) => ({ ...a, message: '' })),
      CLEAR_DELAY_MS
    );
  }, []);

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
