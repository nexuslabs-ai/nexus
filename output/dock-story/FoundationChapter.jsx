import {
  IconAdjustmentsHorizontal,
  IconBorderAll,
  IconBrightness,
  IconDeviceDesktop,
  IconLayersIntersect,
  IconShadow,
  IconStack2,
  IconWaveSine,
} from '@tabler/icons-react';

import { tabIcons } from './dock-icons';

import './framework-chapter.css';
import './foundation-chapter.css';

const decisions = [
  ['Brand color', tabIcons.Colors],
  ['Surfaces', IconStack2],
  ['Contrast', IconBrightness],
  ['Typography', tabIcons.Typography],
  ['Spacing', tabIcons.Spacing],
  ['Radius', tabIcons.Radius],
  ['Borders', IconBorderAll],
  ['Shadows', IconShadow],
  ['Motion', IconWaveSine],
  ['Easing', IconAdjustmentsHorizontal],
  ['Breakpoints', IconDeviceDesktop],
  ['Layering', IconLayersIntersect],
];

const capabilities = [
  {
    title: 'Theme engine',
    description: 'Semantic colors. Light and dark.',
    Icon: tabIcons.Colors,
  },
  {
    title: 'Token presets',
    description: 'Shared spacing, type, shape and motion.',
    Icon: IconStack2,
  },
  {
    title: 'Appearance state',
    description: 'One configuration across your apps.',
    Icon: IconAdjustmentsHorizontal,
  },
];

const frameworks = [
  {
    name: 'React',
    status: 'Components',
    integration: 'React provider → React components',
    detail: 'Shared CSS variables and nx: utilities.',
  },
  {
    name: 'Vue',
    status: 'Growing library',
    integration: 'Vue plugin → Vue components',
    detail: 'The same CSS variables and nx: utilities.',
  },
  {
    name: 'Svelte',
    status: 'Planned',
    integration: 'Svelte bindings are planned',
    detail: 'A Svelte adapter for the shared values.',
  },
  {
    name: 'Angular',
    status: 'Planned',
    integration: 'Angular bindings are planned',
    detail: 'An Angular adapter for the shared values.',
  },
  {
    name: 'React Native',
    status: 'Planned',
    integration: 'Native bindings are planned',
    detail: 'Shared values. Native styles and components.',
  },
];

export function FoundationChapter({ framework, onSelect }) {
  const current = frameworks.find(({ name }) => name === framework);

  return (
    <div className="framework-chapter story-chapter-content">
      <div className="framework-flow foundation-flow">
        <div className="framework-token-group">
          <span className="framework-column-label">Design decisions</span>
          <div className="framework-token-list">
            {decisions.map(([name, Icon]) => (
              <div className="framework-token" key={name}>
                <Icon size={24} stroke={1.5} aria-hidden="true" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="framework-core-column">
          <span className="framework-column-label">Shared foundation</span>
          <div className="foundation-core">
            <div className="foundation-core-heading">
              <IconLayersIntersect size={32} stroke={1.25} aria-hidden="true" />
              <strong>Nexus core</strong>
            </div>
            <div className="foundation-capabilities">
              {capabilities.map(({ title, description, Icon }) => (
                <div className="foundation-capability" key={title}>
                  <div className="foundation-capability-title">
                    <Icon size={24} stroke={1.5} aria-hidden="true" />
                    <strong>{title}</strong>
                  </div>
                  <p>{description}</p>
                </div>
              ))}
            </div>
            <div className="foundation-integration" aria-live="polite">
              <strong>{current.integration}</strong>
              <p>{current.detail}</p>
            </div>
          </div>
        </div>
        <div className="framework-output-group">
          <span className="framework-column-label">Framework components</span>
          <div className="framework-destinations">
            {frameworks.map(({ name, status }, index) => {
              const Icon = tabIcons[name];
              return (
                <button
                  type="button"
                  className="framework-destination foundation-destination"
                  data-active={name === framework}
                  aria-pressed={name === framework}
                  onClick={() => onSelect(index)}
                  key={name}
                >
                  <Icon size={40} stroke={1.5} aria-hidden="true" />
                  <strong>{name}</strong>
                  <span className="foundation-status">{status}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
