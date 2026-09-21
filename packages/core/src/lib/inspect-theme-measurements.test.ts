import * as apca from 'apca-w3';
import { expect, it, vi } from 'vitest';

import { APCA_PAIRS } from './apca-pairs';
import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
import { deriveTheme, inspectTheme } from './derive-theme';

vi.mock('apca-w3', { spy: true });

const contract = (brandColor: string) =>
  createNexusThemeContract({ ...DEFAULT_NEXUS_APPEARANCE, brandColor });

it('records exactly the ordinary APCA calls in order, then separate final diagnostics', () => {
  const spy = vi.mocked(apca.APCAcontrast);
  spy.mockClear();
  try {
    const input = contract('#1b2a4a');
    deriveTheme(input);
    const ordinaryCalls = spy.mock.calls.map((args) => args.slice(0, 2));
    const ordinaryResults = spy.mock.results.map((result) =>
      Math.abs(result.value as number)
    );
    spy.mockClear();
    const result = inspectTheme(input);
    const measurements = result.trace.filter(
      (event) => event.kind === 'measurement'
    );
    expect(
      measurements.map((event) => [event.foregroundY, event.backgroundY])
    ).toEqual(ordinaryCalls);
    expect(measurements.map((event) => event.lc)).toEqual(ordinaryResults);
    const diagnosticCount = result.diagnostics
      .flatMap((d) => d.evidence)
      .filter((e) => e.kind === 'measurement').length;
    expect(spy).toHaveBeenCalledTimes(ordinaryCalls.length + diagnosticCount);
    expect(diagnosticCount).toBe(APCA_PAIRS.length * 2);
  } finally {
    spy.mockClear();
  }
});
