import { useMemo, useState } from 'react';

import {
  createNexusThemeContract,
  deriveTheme,
  type ShadeAnchor,
  SURFACE_TOKENS,
  type SurfaceToken,
  type TokenMap,
} from '@nexus_ds/core';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@nexus_ds/react';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { COMPONENT_TOKEN_MATRIX, filterMatrix } from './component-token-matrix';
import {
  collisionGroupFor,
  COLOR_ATLAS_SURFACE_TOKENS,
  DARK_SURFACE_LADDER,
  formatAnchorLabel,
  LIGHT_SURFACE_LADDER,
} from './ladder-collisions';
import { useResolvedTokenValues } from './use-resolved-token-values';

type LadderMode = 'light' | 'dark';

interface LadderValueRow {
  key: string;
  mode: LadderMode;
  anchor: ShadeAnchor;
  anchorLabel: string;
  value: string;
  tokens: SurfaceToken[];
}

function TokenSwatch({
  token,
  size = 'default',
}: {
  token: string;
  size?: 'default' | 'small';
}) {
  return (
    <span
      aria-hidden="true"
      className={
        size === 'small'
          ? 'nx:block nx:size-3 nx:shrink-0 nx:rounded-sm nx:border-default nx:border-border-default'
          : 'nx:block nx:size-8 nx:shrink-0 nx:rounded-md nx:border-default nx:border-border-default'
      }
      style={{ backgroundColor: `var(--nx-color-${token})` }}
    />
  );
}

function anchorKey(anchor: ShadeAnchor): string {
  return JSON.stringify(anchor);
}

function anchorSortValue(anchor: ShadeAnchor): number {
  if (anchor === 'base') return 0;
  if (typeof anchor === 'number') return anchor;
  return anchor.step;
}

function ladderRowsForMode({
  mode,
  ladder,
  tokenMap,
  surfaceTone,
}: {
  mode: LadderMode;
  ladder: Record<SurfaceToken, ShadeAnchor>;
  tokenMap: TokenMap;
  surfaceTone: Parameters<typeof formatAnchorLabel>[1];
}): LadderValueRow[] {
  const groups = new Map<
    string,
    { anchor: ShadeAnchor; tokens: SurfaceToken[] }
  >();

  for (const token of SURFACE_TOKENS) {
    const anchor = ladder[token];
    const key = anchorKey(anchor);
    const group = groups.get(key) ?? { anchor, tokens: [] };

    group.tokens.push(token);
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => {
      const representativeToken = group.tokens[0];

      return {
        key: `${mode}-${anchorKey(group.anchor)}`,
        mode,
        anchor: group.anchor,
        anchorLabel: formatAnchorLabel(group.anchor, surfaceTone),
        value: representativeToken
          ? (tokenMap[`--nx-color-${representativeToken}`] ?? 'unresolved')
          : 'unresolved',
        tokens: group.tokens,
      };
    })
    .sort((a, b) => anchorSortValue(a.anchor) - anchorSortValue(b.anchor));
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="nx:pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function InspectTab() {
  const { state } = useNexusAppearance();
  const [query, setQuery] = useState('');
  const values = useResolvedTokenValues(COLOR_ATLAS_SURFACE_TOKENS);
  const derivedTheme = useMemo(
    () => deriveTheme(createNexusThemeContract(state)),
    [state]
  );
  const ladderValueRows = useMemo(
    () => [
      ...ladderRowsForMode({
        mode: 'light',
        ladder: LIGHT_SURFACE_LADDER,
        tokenMap: derivedTheme.light,
        surfaceTone: state.surfaceTone,
      }),
      ...ladderRowsForMode({
        mode: 'dark',
        ladder: DARK_SURFACE_LADDER,
        tokenMap: derivedTheme.dark,
        surfaceTone: state.surfaceTone,
      }),
    ],
    [derivedTheme.dark, derivedTheme.light, state.surfaceTone]
  );
  const rows = filterMatrix(COMPONENT_TOKEN_MATRIX, query);

  return (
    <div className="nx:space-y-6">
      <Section title="Light Surface Ladder">
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[760px] nx:border-separate nx:border-spacing-0 nx:text-left">
            <thead>
              <tr className="nx:text-muted-foreground nx:typography-label-small">
                <th className="nx:border-b-default nx:border-border-default nx:py-2 nx:pr-3">
                  Token
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Swatch
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Resolved value
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Light anchor
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Dark anchor
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:py-2 nx:pl-3">
                  Overlap
                </th>
              </tr>
            </thead>
            <tbody>
              {COLOR_ATLAS_SURFACE_TOKENS.map((token) => {
                const collisions = collisionGroupFor(
                  token,
                  LIGHT_SURFACE_LADDER
                );

                return (
                  <tr key={token} className="nx:align-top">
                    <td className="nx:border-b-default nx:border-border-default-alpha nx:py-3 nx:pr-3">
                      <code className="nx:typography-code-inline">{token}</code>
                    </td>
                    <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                      <TokenSwatch token={token} />
                    </td>
                    <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                      <code className="nx:typography-code-inline nx:text-muted-foreground">
                        {values[token] || 'unresolved'}
                      </code>
                    </td>
                    <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                      {formatAnchorLabel(
                        LIGHT_SURFACE_LADDER[token],
                        state.surfaceTone
                      )}
                    </td>
                    <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                      {formatAnchorLabel(DARK_SURFACE_LADDER[token])}
                    </td>
                    <td className="nx:border-b-default nx:border-border-default-alpha nx:py-3 nx:pl-3">
                      {collisions.length > 0 ? (
                        <div className="nx:flex nx:flex-wrap nx:gap-1">
                          <Badge fill="light" variant="information">
                            {collisions.length + 1} share anchor
                          </Badge>
                          {collisions.map((collision) => (
                            <span
                              key={collision}
                              className="nx:rounded-sm nx:bg-muted nx:px-1.5 nx:py-0.5 nx:typography-code-inline"
                            >
                              {collision}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="nx:text-muted-foreground">Unique</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Ladder Values">
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[840px] nx:border-separate nx:border-spacing-0 nx:text-left">
            <thead>
              <tr className="nx:text-muted-foreground nx:typography-label-small">
                <th className="nx:border-b-default nx:border-border-default nx:py-2 nx:pr-3">
                  Mode
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Ladder
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Value
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:py-2 nx:pl-3">
                  Semantic tokens
                </th>
              </tr>
            </thead>
            <tbody>
              {ladderValueRows.map((row) => (
                <tr key={row.key} className="nx:align-top">
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:py-3 nx:pr-3">
                    <Badge
                      fill="light"
                      variant={row.mode === 'dark' ? 'secondary' : 'default'}
                    >
                      {row.mode}
                    </Badge>
                  </td>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                    <code className="nx:typography-code-inline">
                      {row.anchorLabel}
                    </code>
                  </td>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                    <div className="nx:flex nx:items-center nx:gap-2">
                      <span
                        aria-hidden="true"
                        className="nx:block nx:size-5 nx:shrink-0 nx:rounded-sm nx:border-default nx:border-border-default"
                        style={{ backgroundColor: row.value }}
                      />
                      <code className="nx:break-all nx:typography-code-inline nx:text-muted-foreground">
                        {row.value}
                      </code>
                    </div>
                  </td>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:py-3 nx:pl-3">
                    <div className="nx:flex nx:flex-wrap nx:gap-1">
                      {row.tokens.map((token) => (
                        <span
                          key={token}
                          className="nx:rounded-sm nx:bg-muted nx:px-1.5 nx:py-0.5 nx:typography-code-inline"
                        >
                          {token}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Component Token Matrix">
        <div className="nx:mb-4 nx:max-w-sm">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter component, token, file…"
            aria-label="Filter component token matrix"
          />
        </div>
        <div className="nx:overflow-x-auto">
          <table className="nx:w-full nx:min-w-[960px] nx:border-separate nx:border-spacing-0 nx:text-left">
            <thead>
              <tr className="nx:text-muted-foreground nx:typography-label-small">
                <th className="nx:border-b-default nx:border-border-default nx:py-2 nx:pr-3">
                  Component
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Part
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  State
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Semantic tokens
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:px-3 nx:py-2">
                  Source file
                </th>
                <th className="nx:border-b-default nx:border-border-default nx:py-2 nx:pl-3">
                  Storybook check
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.component}-${row.part}-${row.state}`}>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:py-3 nx:pr-3 nx:typography-label-default">
                    {row.component}
                  </td>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                    {row.part}
                  </td>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                    {row.state}
                  </td>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                    <div className="nx:flex nx:flex-wrap nx:gap-1">
                      {row.tokens.map((token) => (
                        <span
                          key={token}
                          className="nx:inline-flex nx:items-center nx:gap-1 nx:rounded-sm nx:bg-muted nx:px-1.5 nx:py-0.5 nx:typography-code-inline"
                        >
                          <TokenSwatch token={token} size="small" />
                          {token}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:px-3 nx:py-3">
                    <code className="nx:typography-code-inline">
                      {row.sourceFile}
                    </code>
                  </td>
                  <td className="nx:border-b-default nx:border-border-default-alpha nx:py-3 nx:pl-3">
                    {row.storybookCheck}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="nx:mt-4 nx:text-muted-foreground">
              No component token rows match this filter.
            </p>
          ) : null}
        </div>
      </Section>
    </div>
  );
}
