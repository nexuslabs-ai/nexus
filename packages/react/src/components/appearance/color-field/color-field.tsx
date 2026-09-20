import { useState } from 'react';

import { normalizeHex } from '../../../lib/normalize-hex';
import { Input } from '../../input';

export interface NexusAppearanceColorFieldProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
}

export function NexusAppearanceColorField({
  value,
  onChange,
  label,
}: NexusAppearanceColorFieldProps) {
  const [draft, setDraft] = useState(value);
  // Re-sync the draft when the committed value changes, during render (no effect).
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }
  const normalizedValue = normalizeHex(value);
  const committedHex = normalizedValue ?? '#000000';

  const commit = (next: string) => {
    setDraft(next);
    const normalized = normalizeHex(next);
    if (normalized) onChange(normalized);
  };

  const resetDraft = () => setDraft(value);

  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      <div className="nx:relative nx:size-7 nx:shrink-0">
        <input
          type="color"
          value={committedHex}
          onChange={(event) => commit(event.target.value)}
          aria-label={label}
          className="nx:peer nx:absolute nx:inset-0 nx:cursor-pointer nx:opacity-0"
        />
        <div
          aria-hidden="true"
          className="nx:size-full nx:rounded-full nx:border-default nx:border-border-default nx:peer-focus-visible:outline-2 nx:peer-focus-visible:outline-focus-default nx:peer-focus-visible:outline-offset-(--focus-offset)"
          style={{
            backgroundColor: normalizedValue ?? 'transparent',
          }}
        />
      </div>
      <Input
        value={draft}
        onChange={(event) => commit(event.target.value)}
        onBlur={resetDraft}
        aria-label={`${label} hex value`}
        aria-invalid={normalizeHex(draft) === null}
        spellCheck={false}
        className="nx:w-28 nx:font-mono nx:uppercase"
      />
    </div>
  );
}
