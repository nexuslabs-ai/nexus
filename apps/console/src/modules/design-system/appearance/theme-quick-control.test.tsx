import {
  NexusAppearanceProvider,
  useNexusAppearance,
} from '@nexus/react/appearance';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NexusThemeQuickControl } from './theme-quick-control';

function Probe() {
  const { state } = useNexusAppearance();

  return <output aria-label="mode">{state.mode}</output>;
}

describe('NexusThemeQuickControl', () => {
  it('renders a Light / Dark / System mode segment that updates appearance state', () => {
    render(
      <NexusAppearanceProvider storageKey={false}>
        <NexusThemeQuickControl />
        <Probe />
      </NexusAppearanceProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Theme' }));

    expect(screen.getByRole('group', { name: 'Theme mode' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Light' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'System' })).toBeTruthy();

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByLabelText('mode').textContent).toBe('dark');
  });
});
