import type { NexusAppearanceMode } from '@nexus/core';

type NexusResolvedAppearanceMode = 'light' | 'dark';

export function nextMode(
  current: NexusAppearanceMode,
  resolved: NexusResolvedAppearanceMode
): NexusAppearanceMode {
  if (current === 'system') {
    return resolved === 'dark' ? 'light' : 'dark';
  }

  return current === 'dark' ? 'light' : 'dark';
}
