'use client';

import {
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useId,
  useMemo,
} from 'react';

import {
  deriveNexusAppearanceCss,
  type NexusAppearanceState,
  type NexusResolvedMode,
  nexusRootAttributes,
  nexusRootScope,
  sanitizeNexusAppearance,
} from '@nexus_ds/core';

import { NexusRootContext } from '../../../lib/nexus-root-context';

import {
  NexusAppearanceContext,
  type NexusAppearanceContextValue,
} from './provider';

/** Appearance for an embedded root. The host resolves `system` to light or dark. */
export type NexusRootState = Omit<NexusAppearanceState, 'mode'> & {
  mode: NexusResolvedMode;
};

export interface NexusRootProps extends ComponentProps<'div'> {
  state: NexusRootState;
  /**
   * Receives edits from Nexus appearance controls inside the root; the host
   * resolves a `system` mode before passing the state back. Without it the
   * root is read-only and those controls cannot change it.
   */
  onStateChange?: (state: NexusAppearanceState) => void;
  /** Nonce for the root's `<style>` under a strict `style-src` policy. */
  nonce?: string;
}

/**
 * Scopes Nexus to its subtree. Renders the root element with the appearance
 * attributes and a `<style>` holding its theme and preference CSS, keyed to
 * this root so roots with different appearances can share a page. Writes
 * nothing outside itself: no `<html>` attributes, storage, cookies or meta.
 */
function NexusRoot({
  state,
  onStateChange,
  nonce,
  children,
  ...props
}: NexusRootProps) {
  const key = useId();
  const safeState = useMemo(
    () => ({ ...sanitizeNexusAppearance(state), mode: state.mode }),
    [state]
  );
  const attributes = useMemo(
    () => nexusRootAttributes(safeState, safeState.mode, key),
    [key, safeState]
  );
  const { themeCss, prefsCss } = useMemo(
    () => deriveNexusAppearanceCss(safeState, nexusRootScope(key)),
    [key, safeState]
  );

  const setState = useCallback<Dispatch<SetStateAction<NexusAppearanceState>>>(
    (update) => {
      if (!onStateChange) return;
      onStateChange(
        sanitizeNexusAppearance(
          typeof update === 'function' ? update(safeState) : update
        )
      );
    },
    [onStateChange, safeState]
  );
  const appearance = useMemo<NexusAppearanceContextValue>(
    () => ({
      state: safeState,
      setState,
      resolvedMode: safeState.mode,
      mounted: true,
    }),
    [safeState, setState]
  );

  return (
    <NexusAppearanceContext.Provider value={appearance}>
      <NexusRootContext.Provider value={attributes}>
        <style nonce={nonce}>{`${themeCss}\n${prefsCss}`}</style>
        <div {...attributes} {...props}>
          {children}
        </div>
      </NexusRootContext.Provider>
    </NexusAppearanceContext.Provider>
  );
}

export { NexusRoot };
