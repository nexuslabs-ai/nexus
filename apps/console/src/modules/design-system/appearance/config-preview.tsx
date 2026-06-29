import type { NexusAppearanceState } from '@nexus/core';
import type { NexusResolvedAppearanceMode } from '@nexus/react/appearance';

function toLines(
  state: NexusAppearanceState,
  resolvedMode: NexusResolvedAppearanceMode
): { key: string; text: string }[] {
  return [
    { key: 'mode', text: `mode: "${state.mode}",` },
    { key: 'resolvedMode', text: `resolvedMode: "${resolvedMode}",` },
    { key: 'brandColor', text: `brandColor: "${state.brandColor}",` },
    { key: 'surfaceTone', text: `surfaceTone: "${state.surfaceTone}",` },
    { key: 'contrast', text: `contrast: ${state.contrast},` },
    { key: 'density', text: `density: "${state.density}",` },
    { key: 'corners', text: `corners: "${state.corners}",` },
    { key: 'elevation', text: `elevation: "${state.elevation}",` },
    { key: 'stroke', text: `stroke: "${state.stroke}",` },
  ];
}

export interface NexusAppearanceConfigPreviewProps {
  state: NexusAppearanceState;
  resolvedMode: NexusResolvedAppearanceMode;
}

export function NexusAppearanceConfigPreview({
  state,
  resolvedMode,
}: NexusAppearanceConfigPreviewProps) {
  const lines = toLines(state, resolvedMode);

  return (
    <pre
      className="nx:overflow-x-auto nx:rounded-lg nx:border-default nx:border-border-default nx:bg-muted nx:p-3 nx:font-mono nx:text-muted-foreground"
      style={{ lineHeight: '1.7' }}
    >
      <code>
        <div>{`const appearance = {`}</div>
        {lines.map((line) => (
          <div key={line.key}>{`  ${line.text}`}</div>
        ))}
        <div>{`};`}</div>
      </code>
    </pre>
  );
}
