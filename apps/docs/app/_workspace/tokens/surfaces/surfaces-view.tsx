'use client';

import { useId } from 'react';

import {
  DARK_SURFACE_LADDER,
  LIGHT_SURFACE_LADDER,
  SURFACE_TOKENS,
} from '@nexus_ds/core';
import {
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from '@nexus_ds/react';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { PageHeading } from '../../page-heading';
import { useWorkspaceLocation } from '../../use-workspace-location';
import type { LiveTheme } from '../use-live-theme';

import {
  COMPONENT_TOKEN_MATRIX,
  filterComponentTokens,
} from './component-token-matrix';
import { formatAnchorLabel, rungSiblings } from './surface-ladder';

const LADDERS = { light: LIGHT_SURFACE_LADDER, dark: DARK_SURFACE_LADDER };

function useComponentQuery() {
  const { search, navigate } = useWorkspaceLocation();
  return {
    query: search.get('q') ?? '',
    setQuery: (query: string) =>
      navigate(new URLSearchParams(query ? { q: query } : undefined), true),
  };
}

function Swatch({ color }: { color: string | undefined }) {
  return (
    <span
      aria-hidden="true"
      className="nx:block nx:size-4 nx:shrink-0 nx:rounded-sm nx:border-default nx:border-border-default"
      style={{ backgroundColor: color }}
    />
  );
}

function TokenBadge({ token, live }: { token: string; live: LiveTheme }) {
  return (
    <Badge
      variant="secondary"
      fill="outline"
      className="nx:typography-code-inline nx:normal-case"
    >
      <Swatch color={live.tokens[`--nx-color-${token}`]} />
      {token}
    </Badge>
  );
}

export function SurfaceFilters() {
  const id = useId();
  const { query, setQuery } = useComponentQuery();
  return (
    <section aria-label="Filter component tokens" className="nx:space-y-4">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <label htmlFor={`${id}-search`} className="nx:typography-label-small">
          Filter components
        </label>
        <Input
          id={`${id}-search`}
          type="search"
          aria-describedby={`${id}-help`}
          placeholder="Try sidebar or popover-hover…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <p
        id={`${id}-help`}
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        Matches a component, part, state, token, source file, or story.
      </p>
    </section>
  );
}

function SurfaceLadderTable({ live }: { live: LiveTheme }) {
  const headingId = useId();
  const { state } = useNexusAppearance();
  const ladder = LADDERS[live.mode];
  return (
    <section aria-labelledby={headingId} className="nx:space-y-4">
      <h2 id={headingId} className="nx:typography-heading-small">
        Surface ladder · {live.mode}
      </h2>
      <p className="nx:text-muted-foreground nx:max-w-2xl">
        Each surface is anchored to a rung measured from the page background.
        Surfaces on the same rung render the same color.
      </p>
      <Table density="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Light anchor</TableHead>
            <TableHead>Dark anchor</TableHead>
            <TableHead>Shares its {live.mode} rung with</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SURFACE_TOKENS.map((token) => {
            const value = live.tokens[`--nx-color-${token}`];
            const siblings = rungSiblings(token, ladder);
            return (
              <TableRow key={token}>
                <TableRowHeader>
                  <code className="nx:typography-code-inline">{token}</code>
                </TableRowHeader>
                <TableCell>
                  <span className="nx:flex nx:items-center nx:gap-2">
                    <Swatch color={value} />
                    <code className="nx:typography-code-inline nx:text-muted-foreground">
                      {value}
                    </code>
                  </span>
                </TableCell>
                <TableCell>
                  {formatAnchorLabel(
                    LIGHT_SURFACE_LADDER[token],
                    state.surfaceTone
                  )}
                </TableCell>
                <TableCell>
                  {formatAnchorLabel(
                    DARK_SURFACE_LADDER[token],
                    state.surfaceTone
                  )}
                </TableCell>
                <TableCell className="nx:whitespace-normal nx:min-w-64">
                  {siblings.length === 0 ? (
                    <span className="nx:text-muted-foreground">
                      No other surface
                    </span>
                  ) : (
                    <span className="nx:flex nx:flex-wrap nx:gap-1">
                      {siblings.map((sibling) => (
                        <TokenBadge key={sibling} token={sibling} live={live} />
                      ))}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

function ComponentTokenTable({ live }: { live: LiveTheme }) {
  const headingId = useId();
  const { query } = useComponentQuery();
  const rows = filterComponentTokens(query);
  return (
    <section aria-labelledby={headingId} className="nx:space-y-4">
      <h2 id={headingId} className="nx:typography-heading-small">
        Component tokens
      </h2>
      <p className="nx:text-muted-foreground nx:max-w-2xl">
        The semantic colors each component part reads, with the stories that
        show those states.
      </p>
      <p
        role="status"
        className="nx:typography-label-small nx:text-muted-foreground"
      >
        {rows.length} of {COMPONENT_TOKEN_MATRIX.length} component parts
      </p>
      {rows.length === 0 ? (
        <p className="nx:text-muted-foreground">
          No component parts match this filter.
        </p>
      ) : (
        <Table density="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Part</TableHead>
              <TableHead>States</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Stories</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.component}-${row.part}`}>
                <TableRowHeader>{row.component}</TableRowHeader>
                <TableCell>{row.part}</TableCell>
                <TableCell>{row.states}</TableCell>
                <TableCell className="nx:whitespace-normal nx:min-w-64">
                  <span className="nx:flex nx:flex-wrap nx:gap-1">
                    {row.tokens.map((token) => (
                      <TokenBadge key={token} token={token} live={live} />
                    ))}
                  </span>
                </TableCell>
                <TableCell>
                  <code className="nx:typography-code-inline">
                    {row.sourceFile}
                  </code>
                </TableCell>
                <TableCell>{row.stories.join(', ')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

export function SurfacesView({ live }: { live: LiveTheme }) {
  return (
    <div className="nx:space-y-8" data-slot="surface-atlas">
      <header className="nx:space-y-4">
        <p className="nx:typography-label-small nx:text-muted-foreground">
          SURFACE ATLAS
        </p>
        <PageHeading>Every surface has a rung.</PageHeading>
        <p className="nx:text-muted-foreground nx:max-w-2xl">
          See how the opaque surfaces step away from the page, which ones share
          a color, and which components read them. Values follow your current
          appearance.
        </p>
      </header>
      <SurfaceLadderTable live={live} />
      <ComponentTokenTable live={live} />
    </div>
  );
}
