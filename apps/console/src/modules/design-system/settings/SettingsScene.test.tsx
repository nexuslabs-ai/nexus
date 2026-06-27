import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CONSOLE_APPEARANCE } from '../../../app/appearance-config';

import { SettingsScene } from './SettingsScene';

describe('SettingsScene', () => {
  it('renders the package appearance settings inside the console provider', () => {
    render(
      <CONSOLE_APPEARANCE.NexusAppearanceProvider>
        <SettingsScene />
      </CONSOLE_APPEARANCE.NexusAppearanceProvider>
    );

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeVisible();
    expect(screen.getByText('Brand color')).toBeVisible();
  });
});
