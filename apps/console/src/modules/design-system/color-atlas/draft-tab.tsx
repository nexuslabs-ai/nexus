import { useEffect, useMemo, useState } from 'react';

import {
  type NexusSurfaceTone,
  SEMANTIC_TOKEN_REGISTRY,
  type SemanticTokenMeta,
} from '@nexus_ds/core';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  toast,
  ToggleGroup,
  ToggleGroupItem,
} from '@nexus_ds/react';
import {
  type NexusResolvedAppearanceMode,
  useNexusAppearance,
} from '@nexus_ds/react/appearance';

import {
  buildDraftCss,
  buildExportJson,
  buildExportSummary,
  type ColorDraftMode,
  colorDraftModeLabel,
  isColorDraftMode,
  PRIMITIVE_FAMILIES,
  type PrimitiveFamily,
  primitiveValue,
  shadesForFamily,
  validateCustomColor,
} from './color-draft';
import { useColorDraftStore } from './color-draft-store';
import {
  COLOR_ATLAS_SURFACE_TOKENS,
  DARK_SURFACE_LADDER,
  formatAnchorLabel,
  LIGHT_SURFACE_LADDER,
} from './ladder-collisions';
import { useResolvedTokenValues } from './use-resolved-token-values';

type DraftSource = 'primitive' | 'custom';
type ExportMode = 'json' | 'css' | 'summary';

const DEFAULT_TOKEN = 'background-hover';
const DEFAULT_FAMILY: PrimitiveFamily = 'stone';
const LIGHT_DEFAULT_SHADE = '100';
const DARK_DEFAULT_SHADE = '900';
const DEFAULT_SHADE = LIGHT_DEFAULT_SHADE;
const LIGHT_BIASED_SHADES = new Set(['50', '75', '100', '150', '200', '300']);
const DARK_BIASED_SHADES = new Set(['700', '800', '900', '950']);
const MODE_OPTIONS = [
  'light',
  'dark',
  'both',
] as const satisfies readonly ColorDraftMode[];
const MODE_OPTION_LABELS: Record<ColorDraftMode, string> = {
  light: 'Light',
  dark: 'Dark',
  both: 'Both',
};

const CATEGORY_LABELS: Record<string, string> = {
  alpha: 'Alpha',
  border: 'Border',
  brand: 'Brand',
  chart: 'Chart',
  focus: 'Focus',
  status: 'Status',
  surface: 'Surface',
  text: 'Text',
};

function isPrimitiveFamily(value: string): value is PrimitiveFamily {
  return PRIMITIVE_FAMILIES.includes(value as PrimitiveFamily);
}

function isAtlasSurfaceToken(
  value: string
): value is (typeof COLOR_ATLAS_SURFACE_TOKENS)[number] {
  return (COLOR_ATLAS_SURFACE_TOKENS as readonly string[]).includes(value);
}

function currentToneLabel(
  token: string,
  resolvedMode: NexusResolvedAppearanceMode,
  surfaceTone: NexusSurfaceTone
): string | null {
  if (!isAtlasSurfaceToken(token)) return null;

  const ladder =
    resolvedMode === 'dark' ? DARK_SURFACE_LADDER : LIGHT_SURFACE_LADDER;

  return formatAnchorLabel(ladder[token], surfaceTone);
}

function defaultShadeForMode(mode: NexusResolvedAppearanceMode): string {
  return mode === 'dark' ? DARK_DEFAULT_SHADE : LIGHT_DEFAULT_SHADE;
}

function shadeForModeChange(
  mode: ColorDraftMode,
  currentShade: string
): string {
  if (mode === 'dark' && LIGHT_BIASED_SHADES.has(currentShade)) {
    return DARK_DEFAULT_SHADE;
  }

  if (mode === 'light' && DARK_BIASED_SHADES.has(currentShade)) {
    return LIGHT_DEFAULT_SHADE;
  }

  return currentShade;
}

function resolveCssColorValue(value: string): string {
  if (typeof window === 'undefined') return value;

  const variableName = value.match(/^var\((--nx-color-[a-z0-9-]+)\)$/)?.[1];
  if (!variableName) return value;

  return (
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim() || value
  );
}

function groupedTokens() {
  return SEMANTIC_TOKEN_REGISTRY.reduce((groups, token) => {
    const group = groups.get(token.category) ?? [];
    group.push(token);
    groups.set(token.category, group);
    return groups;
  }, new Map<string, SemanticTokenMeta[]>());
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

function DraftSwatch({ value }: { value: string }) {
  return (
    <span
      aria-hidden="true"
      className="nx:block nx:size-10 nx:shrink-0 nx:rounded-md nx:border-default nx:border-border-default"
      style={{ backgroundColor: value }}
    />
  );
}

export function DraftTab() {
  const { resolvedMode, state } = useNexusAppearance();
  const tokenGroups = useMemo(groupedTokens, []);
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [source, setSource] = useState<DraftSource>('primitive');
  const [mode, setMode] = useState<ColorDraftMode>(resolvedMode);
  const [family, setFamily] = useState<PrimitiveFamily>(DEFAULT_FAMILY);
  const [shade, setShade] = useState(() => defaultShadeForMode(resolvedMode));
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState('');
  const [exportMode, setExportMode] = useState<ExportMode>('json');
  const [candidateResolvedValue, setCandidateResolvedValue] = useState('');
  const selectedTokenNames = useMemo(() => [token], [token]);
  const overrides = useColorDraftStore((state) => state.overrides);
  const setOverride = useColorDraftStore((state) => state.setOverride);
  const removeOverride = useColorDraftStore((state) => state.removeOverride);
  const resetAll = useColorDraftStore((state) => state.resetAll);
  const currentValue = useResolvedTokenValues(selectedTokenNames)[token] ?? '';
  const currentLabel = currentToneLabel(token, resolvedMode, state.surfaceTone);
  const activeOverrides = Object.entries(overrides).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const selectedMeta = SEMANTIC_TOKEN_REGISTRY.find(
    (entry) => entry.name === token
  );
  const primitiveDraftValue = primitiveValue(family, shade);
  const validCustomValue = validateCustomColor(customValue);
  const candidateValue =
    source === 'primitive'
      ? primitiveDraftValue
      : (validCustomValue ?? currentValue);
  const candidateLabel =
    source === 'primitive'
      ? `${family}.${shade}`
      : customValue || 'custom value';
  const appearanceKey = JSON.stringify(state);
  const exportText =
    exportMode === 'json'
      ? buildExportJson(overrides)
      : exportMode === 'css'
        ? buildDraftCss(overrides)
        : buildExportSummary(overrides);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const frame = window.requestAnimationFrame(() => {
      setCandidateResolvedValue(resolveCssColorValue(candidateValue));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [appearanceKey, candidateValue]);

  const handleFamilyChange = (value: string) => {
    if (!isPrimitiveFamily(value)) return;

    const nextShades = shadesForFamily(value);
    setFamily(value);
    if (!nextShades.includes(shade)) {
      const fallbackShade =
        mode === 'dark' ? DARK_DEFAULT_SHADE : LIGHT_DEFAULT_SHADE;
      setShade(
        nextShades.includes(fallbackShade)
          ? fallbackShade
          : (nextShades[0] ?? DEFAULT_SHADE)
      );
    }
  };

  const handleModeChange = (value: string) => {
    if (!isColorDraftMode(value)) return;

    setMode(value);
    setShade((currentShade) => shadeForModeChange(value, currentShade));
  };

  const handleApply = () => {
    if (source === 'primitive') {
      setOverride(token, {
        source: 'primitive',
        mode,
        value: primitiveDraftValue,
        label: `${family}.${shade}`,
      });
      setCustomError('');
      return;
    }

    const value = validateCustomColor(customValue);
    if (!value) {
      setCustomError('Enter a valid CSS color value.');
      return;
    }

    setOverride(token, { source: 'custom', mode, value });
    setCustomError('');
  };

  const handleCopy = () => {
    if (!navigator.clipboard) {
      toast.error('Clipboard is not available in this browser.');
      return;
    }

    navigator.clipboard
      .writeText(exportText)
      .then(() => toast.success('Draft copied.'))
      .catch(() => toast.error('Could not copy the draft.'));
  };

  return (
    <div className="nx:space-y-6">
      <Section title="Draft Override">
        <div className="nx:grid nx:gap-4 nx:lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="nx:space-y-4">
            <div className="nx:grid nx:gap-2">
              <label
                htmlFor="color-draft-token"
                className="nx:typography-label-default"
              >
                Semantic token
              </label>
              <NativeSelect
                id="color-draft-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              >
                {[...tokenGroups.entries()].map(([category, tokens]) => (
                  <NativeSelectOptGroup
                    key={category}
                    label={CATEGORY_LABELS[category] ?? category}
                  >
                    {tokens.map((entry) => (
                      <NativeSelectOption key={entry.name} value={entry.name}>
                        {entry.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelectOptGroup>
                ))}
              </NativeSelect>
              {selectedMeta?.description ? (
                <p className="nx:text-muted-foreground">
                  {selectedMeta.description}
                </p>
              ) : null}
            </div>

            <div className="nx:grid nx:gap-2">
              <span className="nx:typography-label-default">Source</span>
              <ToggleGroup
                type="single"
                value={source}
                onValueChange={(value) => {
                  if (value === 'primitive' || value === 'custom') {
                    setSource(value);
                  }
                }}
                aria-label="Draft source"
              >
                <ToggleGroupItem value="primitive">Primitive</ToggleGroupItem>
                <ToggleGroupItem value="custom">Custom</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="nx:grid nx:gap-2">
              <span className="nx:typography-label-default">Theme</span>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={handleModeChange}
                aria-label="Draft theme"
              >
                {MODE_OPTIONS.map((draftMode) => (
                  <ToggleGroupItem key={draftMode} value={draftMode}>
                    {MODE_OPTION_LABELS[draftMode]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {source === 'primitive' ? (
              <div className="nx:grid nx:gap-4 nx:md:grid-cols-2">
                <div className="nx:grid nx:gap-2">
                  <label
                    htmlFor="color-draft-family"
                    className="nx:typography-label-default"
                  >
                    Primitive family
                  </label>
                  <NativeSelect
                    id="color-draft-family"
                    value={family}
                    onChange={(event) => handleFamilyChange(event.target.value)}
                  >
                    {PRIMITIVE_FAMILIES.map((primitiveFamily) => (
                      <NativeSelectOption
                        key={primitiveFamily}
                        value={primitiveFamily}
                      >
                        {primitiveFamily}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="nx:grid nx:gap-2">
                  <label
                    htmlFor="color-draft-shade"
                    className="nx:typography-label-default"
                  >
                    Shade
                  </label>
                  <NativeSelect
                    id="color-draft-shade"
                    value={shade}
                    onChange={(event) => setShade(event.target.value)}
                  >
                    {shadesForFamily(family).map((primitiveShade) => (
                      <NativeSelectOption
                        key={primitiveShade}
                        value={primitiveShade}
                      >
                        {primitiveShade}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            ) : (
              <div className="nx:grid nx:gap-2">
                <label
                  htmlFor="color-draft-custom"
                  className="nx:typography-label-default"
                >
                  Custom CSS color
                </label>
                <Input
                  id="color-draft-custom"
                  value={customValue}
                  onChange={(event) => {
                    setCustomValue(event.target.value);
                    setCustomError('');
                  }}
                  placeholder="#f3f0ea or oklch(0.9 0.01 70)"
                  aria-invalid={customError ? true : undefined}
                />
                {customError ? (
                  <p className="nx:text-error-subtle-foreground">
                    {customError}
                  </p>
                ) : null}
              </div>
            )}

            <div className="nx:flex nx:flex-wrap nx:gap-2">
              <Button onClick={handleApply}>Apply</Button>
              <Button
                variant="outline"
                onClick={() => removeOverride(token)}
                disabled={!overrides[token]}
              >
                Remove token
              </Button>
              <Button
                variant="outline"
                onClick={resetAll}
                disabled={activeOverrides.length === 0}
              >
                Reset Draft
              </Button>
            </div>
          </div>

          <div className="nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:p-4">
            <div className="nx:flex nx:items-start nx:gap-3">
              <DraftSwatch value={`var(--nx-color-${token})`} />
              <div className="nx:min-w-0 nx:space-y-1">
                <p className="nx:typography-label-default">Current</p>
                {currentLabel ? (
                  <code className="nx:block nx:typography-code-inline nx:text-muted-foreground">
                    {currentLabel}
                  </code>
                ) : null}
                <code className="nx:block nx:break-all nx:typography-code-inline nx:text-muted-foreground">
                  {currentValue || 'unresolved'}
                </code>
              </div>
            </div>
            <div className="nx:my-4 nx:h-px nx:bg-border-default-alpha" />
            <div className="nx:flex nx:items-start nx:gap-3">
              <DraftSwatch value={candidateValue} />
              <div className="nx:min-w-0 nx:space-y-1">
                <p className="nx:typography-label-default">Candidate</p>
                <code className="nx:block nx:typography-code-inline nx:text-muted-foreground">
                  {candidateLabel}
                </code>
                <code className="nx:block nx:break-all nx:typography-code-inline nx:text-muted-foreground">
                  {candidateResolvedValue || candidateValue}
                </code>
                <span className="nx:typography-label-small nx:text-muted-foreground">
                  {colorDraftModeLabel(mode)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title={`Active Overrides (${activeOverrides.length})`}>
        {activeOverrides.length === 0 ? (
          <p className="nx:text-muted-foreground">
            No local semantic color overrides are active.
          </p>
        ) : (
          <div className="nx:space-y-2">
            {activeOverrides.map(([overrideToken, override]) => (
              <div
                key={overrideToken}
                className="nx:flex nx:flex-wrap nx:items-center nx:gap-3 nx:rounded-md nx:border-default nx:border-border-default nx:px-3 nx:py-2"
              >
                <DraftSwatch value={override.value} />
                <div className="nx:min-w-0 nx:flex-1">
                  <p className="nx:typography-label-default">
                    {overrideToken}{' '}
                    <span className="nx:text-muted-foreground">
                      ({colorDraftModeLabel(override.mode)})
                    </span>
                  </p>
                  <code className="nx:typography-code-inline nx:text-muted-foreground">
                    {override.label ?? override.value}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeOverride(overrideToken)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Export Draft">
        <div className="nx:mb-3 nx:flex nx:flex-wrap nx:items-center nx:justify-between nx:gap-3">
          <ToggleGroup
            type="single"
            value={exportMode}
            onValueChange={(value) => {
              if (value === 'json' || value === 'css' || value === 'summary') {
                setExportMode(value);
              }
            }}
            aria-label="Export format"
          >
            <ToggleGroupItem value="json">JSON</ToggleGroupItem>
            <ToggleGroupItem value="css">CSS</ToggleGroupItem>
            <ToggleGroupItem value="summary">Summary</ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={activeOverrides.length === 0}
          >
            Export Draft
          </Button>
        </div>
        <pre className="nx:max-h-80 nx:overflow-auto nx:rounded-md nx:bg-muted nx:p-4 nx:typography-code-block nx:text-foreground">
          {exportText}
        </pre>
      </Section>
    </div>
  );
}
