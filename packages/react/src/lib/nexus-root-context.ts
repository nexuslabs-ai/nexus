'use client';

import { createContext, useContext } from 'react';

/** The attributes of a Nexus root (`data-nexus-root`, `data-nx-mode`, …). */
export type NexusRootAttributes = Readonly<Record<`data-${string}`, string>>;

const NO_ROOT: NexusRootAttributes = {};

export const NexusRootContext = createContext<NexusRootAttributes>(NO_ROOT);

/**
 * The nearest Nexus root's attributes. A surface rendered outside the root's
 * DOM subtree — a portal — spreads them so it keeps the root's tokens and
 * mode. Empty outside any root.
 */
export function useNexusRootAttributes(): NexusRootAttributes {
  return useContext(NexusRootContext);
}
