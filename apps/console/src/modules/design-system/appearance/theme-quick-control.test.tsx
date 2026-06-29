import {
  NexusAppearanceProvider,
  useNexusAppearance,
} from '@nexus/react/appearance';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NexusThemeQuickControl } from './theme-quick-control';

import '@testing-library/jest-dom/vitest';

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

    expect(screen.getByRole('group', { name: 'Theme mode' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Light' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'System' })).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(screen.getByLabelText('mode').textContent).toBe('dark');
  });
});
