import type { NexusFirstPaintResolution } from '@nexus_ds/core';

export const PREVIEW_CHANNEL = 'nexus-preview';
export const PREVIEW_VERSION = 1;

interface Envelope {
  channel: typeof PREVIEW_CHANNEL;
  version: typeof PREVIEW_VERSION;
  connection: string;
}

export interface PreviewResult {
  revision: number;
  appearance: NexusFirstPaintResolution;
}

export type HostMessage = Envelope &
  (
    | { type: 'connect' }
    | ({ type: 'apply'; documentId: string } & PreviewResult)
  );

export type PreviewMessage = Envelope & { documentId: string } & (
    | { type: 'ready' }
    | { type: 'applied' | 'error' | 'exit' | 'unloading'; revision: number }
  );

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 128;
}

function isRevision(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isEnvelope(
  value: unknown
): value is Record<string, unknown> & Envelope {
  return (
    isRecord(value) &&
    value.channel === PREVIEW_CHANNEL &&
    value.version === PREVIEW_VERSION &&
    isId(value.connection)
  );
}

export function isPreviewAppearance(
  value: unknown
): value is NexusFirstPaintResolution {
  if (!isRecord(value) || !isRecord(value.dataAttrs)) return false;
  const attrs = value.dataAttrs;
  if (
    !['data-density', 'data-radius', 'data-shadow', 'data-borderwidth'].every(
      (name) => typeof attrs[name] === 'string'
    )
  )
    return false;
  return (
    (value.className === '' || value.className === 'dark') &&
    (value.colorScheme === 'light' || value.colorScheme === 'dark') &&
    (value.metaColorScheme === 'light' ||
      value.metaColorScheme === 'dark' ||
      value.metaColorScheme === 'light dark') &&
    typeof value.themeCss === 'string' &&
    typeof value.prefsCss === 'string' &&
    [
      'tight',
      'compact',
      'default',
      'comfortable',
      'relaxed',
      'spacious',
    ].includes(String(attrs['data-density'])) &&
    ['square', 'subtle', 'smooth', 'round', 'extra-round'].includes(
      String(attrs['data-radius'])
    ) &&
    ['flat', 'quiet', 'soft', 'standard', 'strong'].includes(
      String(attrs['data-shadow'])
    ) &&
    ['fine', 'normal', 'strong'].includes(String(attrs['data-borderwidth']))
  );
}

export function isHostMessage(value: unknown): value is HostMessage {
  if (!isEnvelope(value)) return false;
  if (value.type === 'connect') return true;
  return (
    value.type === 'apply' &&
    isId(value.documentId) &&
    isRevision(value.revision) &&
    isPreviewAppearance(value.appearance)
  );
}

export function isPreviewMessage(value: unknown): value is PreviewMessage {
  if (!isEnvelope(value) || !isId(value.documentId)) return false;
  if (value.type === 'ready') return true;
  return (
    (value.type === 'applied' ||
      value.type === 'error' ||
      value.type === 'exit' ||
      value.type === 'unloading') &&
    isRevision(value.revision)
  );
}
