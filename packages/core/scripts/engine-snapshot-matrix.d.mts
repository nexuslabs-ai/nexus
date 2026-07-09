export const MODES: readonly ['light', 'dark'];

export interface EngineSnapshotValue {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

export type SnapshotMap = Record<string, EngineSnapshotValue>;

export function comps(value: string): EngineSnapshotValue;

export function normalizeMap(map: Record<string, string>): SnapshotMap;

export function sameValue(
  a: EngineSnapshotValue,
  b: EngineSnapshotValue
): boolean;

export function deriveMatrix(deps: {
  deriveTheme: unknown;
  createNexusThemeContract: unknown;
  baseAppearance: unknown;
  tones: readonly string[];
}): unknown;

export function compactSnapshot(
  matrix: unknown,
  tones: readonly string[]
): unknown;
