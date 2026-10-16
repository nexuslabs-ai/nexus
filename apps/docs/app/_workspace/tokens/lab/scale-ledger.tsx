'use client';

import { type FormEvent, useMemo, useState } from 'react';

import type {
  NexusAppearancePrefs,
  NexusAppearanceState,
  TokenMap,
} from '@nexus_ds/core';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Input,
} from '@nexus_ds/react';

import type { ScaleFamily, ScaleToken } from './lab-data';
import { LEDGER_ROW_CLASS } from './token-ledger';
import { useRootValues } from './use-root-values';

const FAMILIES: Record<ScaleFamily, string> = {
  spacing: 'Spacing',
  radius: 'Radius',
  borderwidth: 'Border width',
  shadow: 'Shadow',
  typography: 'Typography',
  motion: 'Motion',
  'z-index': 'Z-index',
  breakpoint: 'Breakpoints',
};

/** The appearance field that picks each moded family's preset. */
const PRESET_FIELDS: Partial<
  Record<ScaleFamily, 'density' | 'corners' | 'elevation' | 'stroke'>
> = {
  spacing: 'density',
  radius: 'corners',
  borderwidth: 'stroke',
  shadow: 'elevation',
};

/** A CSS property that accepts each token type, to validate an override. */
const VALIDATION_PROPERTIES: Record<string, string> = {
  dimension: 'margin-top',
  color: 'color',
  fontFamily: 'font-family',
  fontWeight: 'font-weight',
  duration: 'transition-duration',
  cubicBezier: 'transition-timing-function',
  number: 'z-index',
};

const bare = (name: string) => name.replace('--nx-', '');

/** The appearance preference that writes a typography primitive, if any. */
function preferenceLabel(
  token: ScaleToken,
  prefs: NexusAppearancePrefs
): string | null {
  if (token.family !== 'typography') return null;
  if (token.group === 'size' || token.group === 'line-height') {
    return `UI font size: ${prefs.uiFontSize}px`;
  }
  if (token.name === '--nx-typography-family-font-sans') return 'UI font';
  if (token.name === '--nx-typography-family-font-mono') return 'code font';
  return null;
}

interface ScaleLedgerProps {
  tokens: ScaleToken[];
  appearance: NexusAppearanceState;
  /** Overrides that apply in both modes, keyed by `--nx-*` name. */
  overrides: TokenMap;
  /** Sets one token's override; `null` removes it. */
  onOverride: (token: string, value: string | null) => void;
}

/** Every non-colour token, with its live value and source. */
export function ScaleLedger({
  tokens,
  appearance,
  overrides,
  onOverride,
}: ScaleLedgerProps) {
  const [open, setOpen] = useState<string | null>(null);
  const runtimeNames = useMemo(
    () =>
      tokens
        .filter((token) => token.fixedValue === null)
        .map(({ name }) => name),
    [tokens]
  );
  const values = useRootValues(runtimeNames, appearance, overrides);

  function sourceLabel(token: ScaleToken): string {
    if (token.family === 'breakpoint') return 'build time';
    if (token.fixedValue !== null) return 'composed';
    const field = PRESET_FIELDS[token.family];
    if (field) return `${field}: ${appearance[field]}`;
    return preferenceLabel(token, appearance.prefs) ?? 'fixed';
  }

  return (
    <section className="nx:space-y-4">
      <h2 className="nx:typography-heading-small">Other tokens</h2>
      <Accordion type="multiple" defaultValue={Object.keys(FAMILIES)}>
        {Object.entries(FAMILIES).map(([family, label]) => {
          const familyTokens = tokens.filter(
            (token) => token.family === family
          );
          const groups = [...new Set(familyTokens.map(({ group }) => group))];
          return (
            <AccordionItem key={family} value={family}>
              <AccordionTrigger>
                {label} · {familyTokens.length}
              </AccordionTrigger>
              <AccordionContent className="nx:space-y-3 nx:text-foreground">
                {groups.map((group) => (
                  <div key={group} className="nx:space-y-1">
                    {groups.length > 1 && (
                      <h4 className="nx:typography-label-small nx:text-muted-foreground">
                        {group}
                      </h4>
                    )}
                    <ul className="nx:m-0 nx:list-none nx:p-0">
                      {familyTokens
                        .filter((token) => token.group === group)
                        .map((token) => (
                          <li
                            key={token.name}
                            className="nx:border-b-default nx:border-border-default"
                          >
                            <ScaleRow
                              token={token}
                              value={
                                token.fixedValue ?? values[token.name] ?? ''
                              }
                              source={sourceLabel(token)}
                              overridden={token.name in overrides}
                              expanded={open === token.name}
                              onToggle={() =>
                                setOpen(open === token.name ? null : token.name)
                              }
                            />
                            {open === token.name &&
                              token.fixedValue === null && (
                                <ScaleEditor
                                  token={token}
                                  overridden={token.name in overrides}
                                  onOverride={onOverride}
                                />
                              )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}

function ScaleRow({
  token,
  value,
  source,
  overridden,
  expanded,
  onToggle,
}: {
  token: ScaleToken;
  value: string;
  source: string;
  overridden: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const content = (
    <>
      <span className="nx:min-w-0 nx:flex-1">
        <code className="nx:block nx:typography-code-inline">
          {bare(token.name)}
        </code>
        <span className="nx:block nx:typography-body-small nx:text-muted-foreground nx:break-all">
          {value}
        </span>
      </span>
      <Badge variant={overridden ? 'information' : 'secondary'} fill="light">
        {overridden ? 'overridden' : source}
      </Badge>
    </>
  );
  if (token.fixedValue !== null) {
    return (
      <div className="nx:flex nx:items-center nx:gap-3 nx:px-2 nx:py-2">
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className={LEDGER_ROW_CLASS}
    >
      {content}
    </button>
  );
}

function ScaleEditor({
  token,
  overridden,
  onOverride,
}: {
  token: ScaleToken;
  overridden: boolean;
  onOverride: (token: string, value: string | null) => void;
}) {
  const [value, setValue] = useState('');
  const property = VALIDATION_PROPERTIES[token.type] ?? 'margin-top';
  const valid = CSS.supports(property, value.trim());

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (valid) onOverride(token.name, value.trim());
  }

  return (
    <form className="nx:space-y-3 nx:bg-muted nx:px-2 nx:py-3" onSubmit={apply}>
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Overrides {bare(token.name)} in both modes with a plain{' '}
        <code className="nx:typography-code-inline">:root</code> declaration. It
        outranks the appearance controls, so changing them no longer moves it.
      </p>
      <div className="nx:flex nx:flex-wrap nx:gap-2">
        <Input
          aria-label={`New value for ${bare(token.name)}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={value !== '' && !valid}
          className="nx:w-56"
        />
        <Button type="submit" variant="secondary">
          Apply
        </Button>
        {overridden && (
          <Button
            variant="outline"
            onClick={() => onOverride(token.name, null)}
          >
            Reset to preset value
          </Button>
        )}
      </div>
    </form>
  );
}
