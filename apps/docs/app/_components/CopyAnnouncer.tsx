'use client';

import * as React from 'react';

const CLEAR_DELAY_MS = 2000;

const CopyAnnouncerContext = React.createContext<
  ((message: string) => void) | null
>(null);

/** The page's single `role="status"` region for copy confirmations. */
export function CopyAnnouncerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // `seq` remounts the message node so repeating the same text announces again.
  const [{ message, seq }, setAnnouncement] = React.useState({
    message: '',
    seq: 0,
  });
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const announce = React.useCallback((next: string) => {
    setAnnouncement((a) => ({ message: next, seq: a.seq + 1 }));
    window.clearTimeout(timerRef.current);
    // Blanking without advancing `seq` empties the region without re-announcing.
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
