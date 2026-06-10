import { useEffect, useState } from 'react';

import { Input } from '@nexus/react';

interface ColorFieldProps {
  /** Committed hex value, e.g. "#339cff". */
  value: string;
  /** Called only with a valid #rrggbb hex. */
  onChange: (hex: string) => void;
  label: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ColorField({ value, onChange, label }: ColorFieldProps) {
  // Local draft lets the user type a partial hex without the controlled input
  // rejecting keystrokes; we only commit when it's a valid #rrggbb.
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

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
          value={HEX_RE.test(value) ? value : '#000000'}
          onChange={(e) => commit(e.target.value)}
          aria-label={label}
          className="nx:absolute nx:inset-0 nx:cursor-pointer nx:opacity-0"
        />
      </div>
      <Input
        value={draft}
        onChange={(e) => commit(e.target.value)}
        aria-label={`${label} hex value`}
        spellCheck={false}
        className="nx:w-28 nx:font-mono nx:uppercase"
      />
    </div>
  );
}
