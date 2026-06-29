import {
  NexusAppearanceProvider,
  useNexusAppearance,
} from '@nexus/react/appearance';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NexusAppearanceSettings } from './appearance-settings';

function FontSizeProbe() {
  const { state } = useNexusAppearance();

  return (
    <output aria-label="font sizes">
      {state.prefs.uiFontSize}/{state.prefs.codeFontSize}
    </output>
  );
}

function getFontSizeInputs() {
  const [uiSize, codeSize] = screen.getAllByRole('spinbutton');
  if (!(uiSize instanceof HTMLInputElement)) {
    throw new TypeError('Expected UI font-size spinbutton');
  }

  if (!(codeSize instanceof HTMLInputElement)) {
    throw new TypeError('Expected code font-size spinbutton');
  }

  return { uiSize, codeSize };
}

describe('NexusAppearanceSettings', () => {
  it('lets font-size fields be edited before committing valid values', () => {
    render(
      <NexusAppearanceProvider storageKey={false}>
        <NexusAppearanceSettings />
        <FontSizeProbe />
      </NexusAppearanceProvider>
    );

    const { uiSize } = getFontSizeInputs();

    fireEvent.change(uiSize, { target: { value: '' } });
    expect(uiSize.value).toBe('');
    expect(screen.getByLabelText('font sizes').textContent).toBe('14/12');

    fireEvent.change(uiSize, { target: { value: '18' } });
    fireEvent.blur(uiSize);

    expect(uiSize.value).toBe('18');
    expect(screen.getByLabelText('font sizes').textContent).toBe('18/12');
  });

  it('resets invalid font-size drafts back to the committed value on blur', () => {
    render(
      <NexusAppearanceProvider storageKey={false}>
        <NexusAppearanceSettings />
      </NexusAppearanceProvider>
    );

    const { codeSize } = getFontSizeInputs();

    fireEvent.change(codeSize, { target: { value: '' } });
    fireEvent.blur(codeSize);

    expect(codeSize.value).toBe('12');
  });

  it('clamps out-of-range font-size drafts before committing them', () => {
    render(
      <NexusAppearanceProvider storageKey={false}>
        <NexusAppearanceSettings />
        <FontSizeProbe />
      </NexusAppearanceProvider>
    );

    const { uiSize, codeSize } = getFontSizeInputs();

    fireEvent.change(uiSize, { target: { value: '99' } });
    fireEvent.blur(uiSize);

    expect(uiSize.value).toBe('32');
    expect(screen.getByLabelText('font sizes').textContent).toBe('32/12');

    fireEvent.change(codeSize, { target: { value: '2' } });
    fireEvent.blur(codeSize);

    expect(codeSize.value).toBe('8');
    expect(screen.getByLabelText('font sizes').textContent).toBe('32/8');
  });
});
