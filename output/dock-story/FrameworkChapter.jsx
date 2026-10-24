import {
  IconAsterisk,
  IconBorderAll,
  IconClock,
  IconLayersIntersect,
  IconShadow,
  IconWaveSine,
} from '@tabler/icons-react';

import { tabIcons } from './dock-icons';

import './framework-chapter.css';

const frameworks = [
  {
    name: 'React',
    detail: 'React components, powered by the shared foundation.',
  },
  {
    name: 'Vue',
    detail: 'A growing Vue library, using the same theme engine and tokens.',
  },
  {
    name: 'Svelte',
    detail: 'The core is framework independent. Svelte bindings are planned.',
  },
  {
    name: 'Angular',
    detail:
      'Angular integration is shown as a framework direction in this preview.',
  },
  {
    name: 'React Native',
    detail:
      'React Native integration is shown as a framework direction in this preview.',
  },
];

const tokens = [
  ['Theme', tabIcons.Theme],
  ['Colors', tabIcons.Colors],
  ['Typography', tabIcons.Typography],
  ['Spacing', tabIcons.Spacing],
  ['Radius', tabIcons.Radius],
  ['Borders', IconBorderAll],
  ['Shadows', IconShadow],
  ['Components', tabIcons.Components],
  ['Icons', IconAsterisk],
  ['Motion', IconWaveSine],
  ['Duration', IconClock],
  ['Z-index', IconLayersIntersect],
];

export function FrameworkChapter({ framework, onSelect }) {
  const current = frameworks.find(({ name }) => name === framework);

  return (
    <div className="framework-chapter story-chapter-content">
      <div className="framework-flow">
        <div className="framework-token-group">
          <span className="framework-column-label">Design tokens</span>
          <div className="framework-token-list">
            {tokens.map(([name, Icon]) => (
              <div className="framework-token" key={name}>
                <Icon size={24} stroke={1.5} aria-hidden="true" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="framework-core-column">
          <span className="framework-column-label">Shared foundation</span>
          <div className="framework-core">
            <IconLayersIntersect size={40} stroke={1.25} aria-hidden="true" />
            <strong>Nexus core</strong>
            <p>One theme engine. Shared token values.</p>
            <p className="framework-note" aria-live="polite">
              {current.detail}
            </p>
          </div>
        </div>
        <div className="framework-output-group">
          <span className="framework-column-label">Your framework</span>
          <div className="framework-destinations">
            {frameworks.map(({ name }, index) => {
              const Icon = tabIcons[name];
              return (
                <button
                  type="button"
                  className="framework-destination"
                  data-active={name === framework}
                  aria-pressed={name === framework}
                  onClick={() => onSelect(index)}
                  key={name}
                >
                  <Icon size={40} stroke={1.5} aria-hidden="true" />
                  <strong>{name}</strong>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
