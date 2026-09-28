import * as React from 'react';

/**
 * Changes a story harness's props without any pointer or focus event. An
 * outside click would already dismiss an open editor, so tests that use one
 * cannot tell whether the prop change itself closed it.
 */
export function useStoryEvent(name: string, onEvent: () => void) {
  React.useEffect(() => {
    window.addEventListener(name, onEvent);
    return () => window.removeEventListener(name, onEvent);
  }, [name, onEvent]);
}

export function dispatchStoryEvent(name: string) {
  window.dispatchEvent(new Event(name));
}
