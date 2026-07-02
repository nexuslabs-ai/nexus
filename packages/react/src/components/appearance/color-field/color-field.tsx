import { useState } from 'react';

import { Input } from '../../input';

export interface NexusAppearanceColorFieldProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const HEX_BODY_RE = /^[0-9a-fA-F]{6}$/;

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed)) return trimmed.toLowerCase();
  if (HEX_BODY_RE.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  return null;
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
        <div
          className="nx:size-full nx:rounded-full nx:border-default nx:border-border-default"
          style={{
            backgroundColor: normalizedValue ?? 'transparent',
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
        onBlur={resetDraft}
        aria-label={`${label} hex value`}
        aria-invalid={normalizeHex(draft) === null}
        spellCheck={false}
        className="nx:w-28 nx:font-mono nx:uppercase"
      />
    </div>
  );
}
