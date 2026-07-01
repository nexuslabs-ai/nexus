import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NexusAppearanceColorField } from './color-field';

describe('NexusAppearanceColorField', () => {
  it('accepts pasted hex values without a leading hash', () => {
    const onChange = vi.fn();

    render(
      <NexusAppearanceColorField
        label="Brand color"
        value="#1d4ed8"
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Brand color hex value'), {
      target: { value: '2563EB' },
    });

    expect(onChange).toHaveBeenCalledWith('#2563eb');
  });

  it('keeps invalid drafts local and restores the committed value on blur', () => {
    const onChange = vi.fn();

    render(
      <NexusAppearanceColorField
        label="Brand color"
        value="#1d4ed8"
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText(
      'Brand color hex value'
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'not-a-color' } });
    expect(input.value).toBe('not-a-color');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(input.value).toBe('#1d4ed8');
  });
});
