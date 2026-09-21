import {
  createNexusThemeContract,
  inspectTheme,
  themeToCss,
} from '@nexus_ds/core';
import { BRAND_COLOR_PRESETS } from '@nexus_ds/core/palette';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createPreviewResult,
  PREVIEW_DEFAULT_STATE,
  updatePreviewResult,
} from './accepted-result';
import { applyPreviewAppearance } from './apply-appearance';
import { connectPreview, type PreviewStatus } from './frame-channel';
import {
  type HostMessage,
  isHostMessage,
  isPreviewMessage,
  PREVIEW_CHANNEL,
  PREVIEW_VERSION,
} from './protocol';

const accepted = createPreviewResult(PREVIEW_DEFAULT_STATE, 1);
const envelope = {
  channel: PREVIEW_CHANNEL,
  version: PREVIEW_VERSION,
  connection: 'frame-1',
  documentId: 'document-1',
};

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('accepted preview result', () => {
  it('serializes the exact inspected theme and reuses its evidence for a mode-only change', () => {
    expect(accepted.render.appearance.themeCss).toBe(
      themeToCss(accepted.inspection.theme)
    );
    const dark = updatePreviewResult(accepted, { mode: 'dark' });
    expect(dark.inspection).toBe(accepted.inspection);
    expect(dark.render).toMatchObject({
      revision: 2,
      appearance: {
        className: 'dark',
        colorScheme: 'dark',
        themeCss: accepted.render.appearance.themeCss,
      },
    });
    const brand = BRAND_COLOR_PRESETS.find((preset) => preset.value === 'rose');
    if (!brand) throw new Error('Missing preset fixture');
    const changed = updatePreviewResult(dark, { brandColor: brand.color });
    expect(changed.inspection.theme).toEqual(
      inspectTheme(createNexusThemeContract(changed.state)).theme
    );
    expect(changed.render.revision).toBe(3);
  });

  it('applies only to the supplied document and keeps a single ordered pair of override styles', () => {
    const doc = document.implementation.createHTMLDocument('Preview');
    const base = doc.createElement('style');
    base.textContent = ':root { color-scheme: light; }';
    doc.head.append(base);
    const hostBefore = document.documentElement.outerHTML;
    applyPreviewAppearance(doc, accepted.render.appearance);
    const dark = updatePreviewResult(accepted, { mode: 'dark' });
    applyPreviewAppearance(doc, dark.render.appearance);
    expect(doc.documentElement.className).toBe('dark');
    expect(
      doc.querySelector('meta[name="color-scheme"]')?.getAttribute('content')
    ).toBe('dark');
    expect(doc.querySelectorAll('style[data-preview-theme]')).toHaveLength(1);
    expect(doc.head.lastElementChild?.hasAttribute('data-preview-prefs')).toBe(
      true
    );
    expect(doc.querySelector('style[data-preview-theme]')?.textContent).toBe(
      themeToCss(dark.inspection.theme)
    );
    expect(document.documentElement.outerHTML).toBe(hostBefore);
  });
});

describe('preview protocol', () => {
  it('accepts actual render data and rejects unsupported versions, incomplete payloads and invalid revisions', () => {
    const message = { ...envelope, type: 'apply', ...accepted.render };
    expect(isHostMessage(message)).toBe(true);
    for (const patch of [
      { version: 2 },
      { connection: '' },
      { documentId: '' },
      { revision: 0 },
      { revision: Infinity },
      { appearance: {} },
    ])
      expect(isHostMessage({ ...message, ...patch })).toBe(false);
    expect(
      isPreviewMessage({ ...envelope, type: 'applied', revision: 1 })
    ).toBe(true);
    expect(
      isPreviewMessage({ ...envelope, type: 'execute', revision: 1 })
    ).toBe(false);
    expect(isPreviewMessage({ ...envelope, type: 'error' })).toBe(false);
  });

  it('binds replies to the current frame, document and latest requested revision, and replays after reload', () => {
    vi.useFakeTimers();
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const frameWindow = frame.contentWindow;
    if (!frameWindow) throw new Error('Missing frame');
    const send = vi
      .spyOn(frameWindow, 'postMessage')
      .mockImplementation(() => {});
    const statuses: PreviewStatus[] = [];
    const exit = vi.fn();
    const connection = connectPreview(
      frame,
      (status) => statuses.push(status),
      exit
    );
    const sent = () =>
      send.mock.calls[send.mock.calls.length - 1]?.[0] as HostMessage;
    const reply = (
      data: object,
      source: Window = frameWindow,
      origin = location.origin
    ) =>
      window.dispatchEvent(
        new MessageEvent('message', { data, source, origin })
      );
    connection.update(accepted.render);
    const current = { ...envelope, connection: sent().connection };
    reply({ ...current, type: 'ready' }, window);
    reply({ ...current, type: 'ready' }, frameWindow, 'https://example.com');
    expect(send).toHaveBeenCalledTimes(1);
    reply({ ...current, type: 'ready' });
    expect(sent()).toMatchObject({ type: 'apply', revision: 1 });
    const dark = updatePreviewResult(accepted, { mode: 'dark' });
    connection.update(dark.render);
    const pending = statuses.length;
    reply({ ...current, type: 'applied', revision: 1 });
    reply({ ...current, type: 'error', revision: 1 });
    reply({
      ...current,
      documentId: 'old-document',
      type: 'applied',
      revision: 2,
    });
    expect(statuses).toHaveLength(pending);
    reply({ ...current, type: 'applied', revision: 2 });
    expect(statuses[statuses.length - 1]).toEqual({
      phase: 'applied',
      revision: 2,
    });
    vi.advanceTimersByTime(9000);
    expect(statuses[statuses.length - 1]?.phase).toBe('applied');
    frame.dispatchEvent(new Event('load'));
    const next = {
      ...current,
      connection: sent().connection,
      documentId: 'document-2',
    };
    reply({ ...current, type: 'applied', revision: 2 });
    expect(statuses[statuses.length - 1]?.phase).toBe('loading');
    reply({ ...next, type: 'ready' });
    expect(sent()).toMatchObject({
      type: 'apply',
      revision: 2,
      documentId: 'document-2',
    });
    reply({ ...next, type: 'applied', revision: 2 });
    reply({ ...next, type: 'exit', revision: 2 });
    expect(exit).toHaveBeenCalledTimes(1);
    connection.update({ ...dark.render, revision: 3 });
    connection.dispose();
    const disposed = statuses.length;
    vi.advanceTimersByTime(9000);
    reply({ ...next, type: 'error', revision: 3 });
    expect(statuses).toHaveLength(disposed);
  });

  it('reports a missing preview instead of waiting forever', () => {
    vi.useFakeTimers();
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const status = vi.fn();
    const connection = connectPreview(frame, status, () => {});
    connection.update(accepted.render);
    vi.advanceTimersByTime(8000);
    expect(status).toHaveBeenLastCalledWith({
      phase: 'error',
      revision: undefined,
    });
    connection.dispose();
  });
});
