import type { Oklch } from 'culori';

import type { SrgbInts } from './apca';
import type { ApcaPair } from './apca-pairs';
import type {
  DerivedTheme,
  ThemeDerivationInput,
  TokenMap,
} from './derive-theme';
import type { Mode } from './palette';

export type ThemeInspectionStage =
  | 'input'
  | 'surfaces'
  | 'text'
  | 'primary'
  | 'secondary'
  | 'status'
  | 'chart'
  | 'alpha'
  | 'focus'
  | 'gamut'
  | 'constraints'
  | 'output';

export interface PaletteProvenance {
  readonly hex: string;
  readonly shade: string;
  readonly palette?: string;
  readonly grid: 'hue' | 'common';
  readonly source: Readonly<Oklch>;
  readonly cuspChroma?: number;
  readonly cuspFraction?: number;
  readonly target: Readonly<Oklch>;
  readonly clamped: Readonly<Oklch>;
  readonly css: string;
}

export type ThemeTraceDetail =
  | {
      kind: 'decision';
      operation: string;
      values: Readonly<
        Record<string, string | number | boolean | null | readonly string[]>
      >;
    }
  | {
      kind: 'gamut';
      input: Readonly<Oklch>;
      output: Readonly<Oklch>;
      gamut: 'p3' | 'rgb';
    }
  | {
      kind: 'conversion';
      input: string;
      policy: 'opaque' | 'composite';
      rgb: readonly number[];
      quantized: SrgbInts;
      alpha: number;
      backdrop?: SrgbInts;
      result: SrgbInts;
    }
  | {
      kind: 'measurement';
      foreground: string;
      background: string;
      foregroundY: number;
      backgroundY: number;
      lc: number;
      target?: number;
      passed?: boolean;
    }
  | {
      kind: 'palette';
      provenance: PaletteProvenance;
      origin: 'authored-palette-provenance';
    }
  | { kind: 'assignment'; value: string; source: string };

export type ThemeTraceEvent = ThemeTraceDetail & {
  sequence: number;
  mode: Mode;
  stage: ThemeInspectionStage;
  /** CSS custom property when the operation belongs to one semantic token. */
  token?: string;
};

export interface ThemeContrastDiagnostic {
  mode: Mode;
  pair: ApcaPair;
  floor: number;
  requestedTarget: number;
  lc: number;
  meetsFloor: boolean;
  meetsRequestedTarget: boolean;
  /** Post-derivation measurements, never included in the executed solver trace. */
  evidence: ThemeTraceEvent[];
}

export interface ThemeInspection {
  schemaVersion: 1;
  input: ThemeDerivationInput;
  normalizedInput: Required<ThemeDerivationInput>;
  theme: DerivedTheme;
  trace: ThemeTraceEvent[];
  diagnostics: ThemeContrastDiagnostic[];
}

/** Internal, call-local context. Absent on the ordinary derivation path. */
export class ThemeTrace {
  constructor(
    private readonly events: ThemeTraceEvent[],
    readonly mode: Mode,
    readonly stage: ThemeInspectionStage,
    readonly token?: string
  ) {}

  at(stage: ThemeInspectionStage, token?: string): ThemeTrace {
    return new ThemeTrace(this.events, this.mode, stage, token);
  }

  record(detail: ThemeTraceDetail): void {
    this.events.push({
      sequence: this.events.length,
      mode: this.mode,
      stage: this.stage,
      ...(this.token ? { token: this.token } : {}),
      ...detail,
    });
  }

  decision(
    operation: string,
    values: Extract<ThemeTraceDetail, { kind: 'decision' }>['values']
  ): void {
    this.record({ kind: 'decision', operation, values });
  }

  assignments(map: TokenMap, source: string): void {
    for (const [token, value] of Object.entries(map)) {
      this.at(this.stage, token).record({ kind: 'assignment', value, source });
    }
  }
}
