import type { ReactNode } from 'react';

import { useNexusAppearance } from '@nexus/react/appearance';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  CONSOLE_APPEARANCE,
  CONSOLE_APPEARANCE_DEFAULT,
} from './appearance-config';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-density');
  document.documentElement.removeAttribute('data-radius');
  document.documentElement.removeAttribute('data-shadow');
  document.documentElement.removeAttribute('data-borderwidth');
  document.documentElement.style.colorScheme = '';
});

describe('CONSOLE_APPEARANCE', () => {
  it('provides the shared default state and root appearance attributes', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CONSOLE_APPEARANCE.NexusAppearanceProvider>
        {children}
      </CONSOLE_APPEARANCE.NexusAppearanceProvider>
    );

    const { result } = renderHook(() => useNexusAppearance(), { wrapper });
    const root = document.documentElement;

    expect(result.current.state).toMatchObject(CONSOLE_APPEARANCE_DEFAULT);
    expect(root.dataset.density).toBe(CONSOLE_APPEARANCE_DEFAULT.density);
    expect(root.dataset.radius).toBe(CONSOLE_APPEARANCE_DEFAULT.corners);
    expect(root.dataset.shadow).toBe(CONSOLE_APPEARANCE_DEFAULT.elevation);
    expect(root.dataset.borderwidth).toBe(CONSOLE_APPEARANCE_DEFAULT.stroke);
  });
});
