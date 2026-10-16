'use client';

import { type FormEvent, useId, useState } from 'react';

import {
  isColor,
  type Mode,
  SEMANTIC_TOKEN_REGISTRY,
  type ThemeContrastCheck,
  type TokenCategory,
  type TokenMap,
} from '@nexus_ds/core';
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nexus_ds/react';

import { Swatch } from '../surfaces/surfaces-view';
import type { LiveTheme } from '../use-live-theme';

import type { PrimitiveColor } from './primitive-colors';

const CATEGORIES: Record<TokenCategory, string> = {
  surface: 'Surfaces',
  text: 'Text',
  border: 'Borders',
  brand: 'Primary and secondary',
  status: 'Status',
  chart: 'Chart',
  focus: 'Focus',
  alpha: 'Alpha and overlays',
};

const bare = (name: string) => name.replace('--nx-color-', '');

/** The failing check that misses its floor by the most. */
function worst(checks: ThemeContrastCheck[]): ThemeContrastCheck | undefined {
  return checks.reduce<ThemeContrastCheck | undefined>(
    (most, check) =>
      !most || check.lc - check.floor < most.lc - most.floor ? check : most,
    undefined
  );
}

interface TokenLedgerProps {
  live: LiveTheme;
  primitives: PrimitiveColor[];
  /** The resolved mode's overrides, keyed by `--nx-color-*` name. */
  overrides: TokenMap;
  /** Sets one token's override; `null` removes it. */
  onOverride: (token: string, value: string | null) => void;
}

/** Every semantic colour in the live theme, with its source and contrast. */
export function TokenLedger({
  live,
  primitives,
  overrides,
  onOverride,
}: TokenLedgerProps) {
  const [open, setOpen] = useState<string | null>(null);
  const primitiveByValue = new Map(
    primitives.map((primitive) => [primitive.value, primitive.name])
  );
  const failures = live.contrast.filter((check) => !check.pass);
  const rows = SEMANTIC_TOKEN_REGISTRY.map(({ name, category }) => {
    const token = `--nx-color-${name}`;
    const value = live.tokens[token] ?? '';
    return {
      token,
      category,
      value,
      primitive: primitiveByValue.get(value),
      overridden: token in overrides,
      failing: failures.filter(
        (check) => check.fg === token || check.bg === token
      ),
    };
  });
  const onPrimitive = rows.filter(
    (row) => !row.overridden && row.primitive
  ).length;
  const overridden = rows.filter((row) => row.overridden).length;

  return (
    <section aria-label="Semantic colour tokens" className="nx:space-y-4">
      <div className="nx:flex nx:flex-wrap nx:gap-2">
        <Badge variant="secondary">
          {onPrimitive} share a primitive&apos;s value
        </Badge>
        <Badge variant="secondary">
          {rows.length - onPrimitive - overridden} computed by the engine
        </Badge>
        {overridden > 0 && (
          <Badge variant="information">{overridden} overridden</Badge>
        )}
        <Badge variant={failures.length ? 'error' : 'success'}>
          {failures.length} of {live.contrast.length} contrast checks fail
        </Badge>
      </div>
      {Object.entries(CATEGORIES).map(([category, label]) => (
        <div key={category} className="nx:space-y-1">
          <h2 className="nx:typography-label-small nx:text-muted-foreground">
            {label}
          </h2>
          <ul className="nx:m-0 nx:list-none nx:p-0">
            {rows
              .filter((row) => row.category === category)
              .map((row) => (
                <li
                  key={row.token}
                  className="nx:border-b-default nx:border-border-default"
                >
                  <LedgerRow
                    {...row}
                    expanded={open === row.token}
                    onToggle={() =>
                      setOpen(open === row.token ? null : row.token)
                    }
                  />
                  {open === row.token && (
                    <OverrideEditor
                      token={row.token}
                      mode={live.mode}
                      primitives={primitives}
                      overridden={row.overridden}
                      onOverride={onOverride}
                    />
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function LedgerRow({
  token,
  value,
  primitive,
  overridden,
  failing,
  expanded,
  onToggle,
}: {
  token: string;
  value: string;
  primitive: string | undefined;
  overridden: boolean;
  failing: ThemeContrastCheck[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const miss = worst(failing);
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className="nx:flex nx:w-full nx:items-center nx:gap-3 nx:border-0 nx:bg-transparent nx:px-2 nx:py-2 nx:text-left nx:text-inherit nx:cursor-pointer nx:hover:bg-background-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
    >
      <Swatch color={value} />
      <span className="nx:min-w-0 nx:flex-1">
        <code className="nx:block nx:typography-code-inline">
          {bare(token)}
        </code>
        <span className="nx:block nx:typography-body-small nx:text-muted-foreground nx:break-all">
          {value}
        </span>
      </span>
      <span className="nx:flex nx:flex-wrap nx:justify-end nx:gap-1">
        {overridden ? (
          <Badge variant="information" fill="light">
            overridden{primitive ? ` · same value as ${primitive}` : ''}
          </Badge>
        ) : (
          <Badge variant={primitive ? 'success' : 'warning'} fill="light">
            {primitive ? `same value as ${primitive}` : 'computed'}
          </Badge>
        )}
        {miss && (
          <Badge variant="error" fill="light">
            Lc {miss.lc.toFixed(1)} &lt; {miss.floor} with{' '}
            {bare(miss.fg === token ? miss.bg : miss.fg)}
          </Badge>
        )}
      </span>
    </button>
  );
}

function OverrideEditor({
  token,
  mode,
  primitives,
  overridden,
  onOverride,
}: {
  token: string;
  mode: Mode;
  primitives: PrimitiveColor[];
  overridden: boolean;
  onOverride: (token: string, value: string | null) => void;
}) {
  const id = useId();
  const palettes = [...new Set(primitives.map(({ palette }) => palette))];
  const [palette, setPalette] = useState(palettes[0] ?? '');
  const [custom, setCustom] = useState('');

  function applyCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isColor(custom)) onOverride(token, custom.trim());
  }

  return (
    <div className="nx:space-y-3 nx:bg-muted nx:px-2 nx:py-3">
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Overrides {bare(token)} in {mode} mode with a plain{' '}
        <code className="nx:typography-code-inline">:root</code> declaration.
        Nexus applies it as written and does not check its contrast.
      </p>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Label htmlFor={`${id}-palette`}>Primitive</Label>
        <Select value={palette} onValueChange={setPalette}>
          <SelectTrigger id={`${id}-palette`} className="nx:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {palettes.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="nx:flex nx:flex-wrap nx:gap-1">
        {primitives
          .filter((primitive) => primitive.palette === palette)
          .map((primitive) => (
            <button
              key={primitive.name}
              type="button"
              title={`${primitive.name} · ${primitive.value}`}
              aria-label={`Use ${primitive.name}`}
              onClick={() => onOverride(token, primitive.value)}
              className="nx:size-6 nx:rounded-sm nx:border-default nx:border-border-default nx:p-0 nx:cursor-pointer nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
              style={{ backgroundColor: primitive.value }}
            />
          ))}
      </div>
      <form className="nx:flex nx:flex-wrap nx:gap-2" onSubmit={applyCustom}>
        <Input
          aria-label={`Custom colour for ${bare(token)}`}
          placeholder="#7c3aed or oklch(…)"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          aria-invalid={custom !== '' && !isColor(custom)}
          className="nx:w-56"
        />
        <Button type="submit" variant="secondary">
          Apply
        </Button>
        {overridden && (
          <Button variant="outline" onClick={() => onOverride(token, null)}>
            Reset to engine value
          </Button>
        )}
      </form>
    </div>
  );
}
