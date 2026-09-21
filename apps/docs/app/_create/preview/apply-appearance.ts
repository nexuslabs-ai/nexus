import type { NexusFirstPaintResolution } from '@nexus_ds/core';

/** Called only by the preview entry; its document never belongs to the docs shell. */
export function applyPreviewAppearance(
  doc: Document,
  appearance: NexusFirstPaintResolution
) {
  const root = doc.documentElement;
  root.classList.toggle('dark', appearance.className === 'dark');
  root.style.colorScheme = appearance.colorScheme;
  for (const name of [
    'data-density',
    'data-radius',
    'data-shadow',
    'data-borderwidth',
  ] as const)
    root.setAttribute(name, appearance.dataAttrs[name]);

  const meta =
    doc.querySelector('meta[name="color-scheme"]') ?? doc.createElement('meta');
  meta.setAttribute('name', 'color-scheme');
  meta.setAttribute('content', appearance.metaColorScheme);
  if (!meta.parentNode) doc.head.appendChild(meta);

  for (const [name, css] of [
    ['theme', appearance.themeCss],
    ['prefs', appearance.prefsCss],
  ]) {
    const style =
      doc.querySelector(`style[data-preview-${name}]`) ??
      doc.createElement('style');
    style.setAttribute(`data-preview-${name}`, '');
    style.textContent = css ?? '';
    // Keep runtime overrides after package styles, including development CSS updates.
    doc.head.appendChild(style);
  }
}
