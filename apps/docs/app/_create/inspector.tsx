import { Button } from '@nexus_ds/react';

import { type ComponentId, GALLERY } from './gallery';
import evidence from './gallery-evidence.json';
import type { AcceptedPreview } from './preview/accepted-result';

export default function Inspector({
  id,
  accepted,
  onExplore,
}: {
  id: ComponentId;
  accepted: AcceptedPreview;
  onExplore: (token: string) => void;
}) {
  const item = GALLERY.find((entry) => entry.id === id) ?? GALLERY[0];
  const entry = evidence[id];
  const theme =
    accepted.inspection.theme[
      accepted.state.mode === 'dark' ? 'dark' : 'light'
    ];
  const tokens = entry.tokens.filter((name) =>
    Object.hasOwn(theme, `--nx-color-${name}`)
  );
  return (
    <div className="nx:space-y-6" data-slot="create-inspector">
      <div className="nx:space-y-2">
        <h2 className="nx:typography-heading-small">{item.label}</h2>
        <p className="nx:typography-body-small nx:text-muted-foreground">
          Configured example and active {accepted.state.mode} appearance.
        </p>
      </div>
      <pre className="nx:max-h-64 nx:overflow-auto nx:bg-muted nx:p-4 nx:rounded-base nx:typography-code-inline">
        <code>{entry.source}</code>
      </pre>
      <h3 className="nx:typography-label-default">Component color roles</h3>
      <p className="nx:typography-body-small nx:text-muted-foreground">
        Values include roles used across this component’s variants and states.
      </p>
      {tokens.map((name) => (
        <div key={name} className="nx:space-y-2">
          <Button
            className="nx:whitespace-normal nx:break-all nx:text-left"
            variant="link"
            onClick={() => onExplore('runtime:color:' + name)}
          >
            {name}
          </Button>
          <p className="nx:typography-code-inline nx:break-all">
            {theme[`--nx-color-${name}` as keyof typeof theme]}
          </p>
        </div>
      ))}
      {tokens.length === 0 && (
        <p className="nx:text-muted-foreground">
          This composition inherits its appearance from its child components.
          Explore the full catalog for spacing, typography, and layout tokens.
        </p>
      )}
      <Button variant="link" asChild>
        <a href={`/components/${item.group}`} target="_blank" rel="noreferrer">
          Component documentation
        </a>
      </Button>
    </div>
  );
}
