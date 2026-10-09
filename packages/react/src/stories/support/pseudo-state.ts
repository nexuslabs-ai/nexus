type PseudoClass = 'hover' | 'active';

declare module 'vitest/browser' {
  interface BrowserCommands {
    forcePseudoState(selector: string, states: PseudoClass[]): Promise<void>;
  }
}

let nextTarget = 0;

/**
 * Forces `:hover` / `:active` on `element` through CDP, without real pointer
 * input, then jumps the transitions that state change starts to their end
 * state. Pass an empty list to clear. Runs only in Vitest's Playwright
 * provider.
 */
export async function forcePseudoState(
  element: Element,
  states: PseudoClass[]
) {
  const { commands } = await import('vitest/browser');
  const target = String(nextTarget++);
  element.setAttribute('data-pseudo-target', target);
  try {
    await commands.forcePseudoState(`[data-pseudo-target="${target}"]`, states);
  } finally {
    element.removeAttribute('data-pseudo-target');
  }
  for (const animation of element.getAnimations({ subtree: true })) {
    animation.finish();
  }
}
