import { useState } from 'react';

import { Input } from '@nexus/react';

interface NexusAppearanceColorFieldProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

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
  const committedHex = HEX_RE.test(value) ? value : '#000000';

  const commit = (next: string) => {
    setDraft(next);
    if (HEX_RE.test(next)) onChange(next);
  };

  return (
    <div className="nx:flex nx:items-center nx:gap-2">
      <div className="nx:relative nx:size-7 nx:shrink-0">
        <div
          className="nx:size-full nx:rounded-full nx:border nx:border-border-default"
          style={{
            backgroundColor: HEX_RE.test(value) ? value : 'transparent',
          }}
        />
        <input
          type="color"
          value={committedHex}
          onChange={(event) => commit(event.target.value)}
          aria-label={label}
          className="nx:absolute nx:inset-0 nx:cursor-pointer nx:opacity-0"
        />
      </div>
      <Input
        value={draft}
        onChange={(event) => commit(event.target.value)}
        aria-label={`${label} hex value`}
        aria-invalid={!HEX_RE.test(draft)}
        spellCheck={false}
        className="nx:w-28 nx:font-mono nx:uppercase"
      />
    </div>
  );
}
