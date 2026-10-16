'use client';

import { useId } from 'react';

import {
  IconBrandAngular,
  IconBrandReact,
  IconBrandReactNative,
  IconBrandSvelte,
  IconBrandVue,
} from '@tabler/icons-react';
import { useDialKitController } from 'dialkit';

import './framework-section.css';

const frameworks = [
  ['React', IconBrandReact],
  ['Vue', IconBrandVue],
  ['Svelte', IconBrandSvelte],
  ['Angular', IconBrandAngular],
  ['React Native', IconBrandReactNative],
];

const config = {
  layout: {
    type: 'select',
    options: [
      { value: 'foundation', label: 'Shared foundation' },
      { value: 'cards', label: 'Text cards' },
    ],
    default: 'foundation',
  },
  typography: { titleSize: [40, 28, 56, 2], labelSize: [18, 14, 24, 1] },
  spacing: {
    sectionPadding: [64, 32, 112, 8],
    contentGap: [40, 16, 72, 4],
    cardPadding: [24, 16, 48, 4],
  },
  appearance: { iconSize: [40, 24, 64, 4], radius: [12, 0, 24, 2] },
  reset: { type: 'action', label: 'Reset frameworks' },
};

export function FrameworkSection({ docsBase = '' }) {
  const id = useId();
  const dial = useDialKitController('Frameworks studio', config, {
    id: 'nexus-frameworks-studio-v1',
    persist: true,
    onAction(path) {
      if (path === 'reset') dial.resetValues();
    },
  });
  const p = dial.values;
  const foundation = p.layout === 'foundation';
  return (
    <section
      className="home-page-section framework-section"
      data-layout={p.layout}
      aria-labelledby={id}
      style={{
        '--framework-title': `${p.typography.titleSize}px`,
        '--framework-label': `${p.typography.labelSize}px`,
        '--framework-padding': `${p.spacing.sectionPadding}px`,
        '--framework-gap': `${p.spacing.contentGap}px`,
        '--framework-card-padding': `${p.spacing.cardPadding}px`,
        '--framework-icon': `${p.appearance.iconSize}px`,
        '--framework-radius': `${p.appearance.radius}px`,
      }}
    >
      <div className="framework-heading">
        <span className="home-kicker">FRAMEWORKS</span>
        <h2 id={id}>
          One token system.
          <br />
          Many frameworks.
        </h2>
        <p>
          One foundation for color, type, and spacing.
          <br />
          Components that speak your framework.
        </p>
      </div>
      <div className="framework-composition">
        {foundation && (
          <div className="framework-foundation">
            <span className="framework-foundation-name">Nexus core</span>
            <div className="framework-token-list">
              <span>Color</span>
              <span>Typography</span>
              <span>Spacing</span>
              <span>Appearance</span>
            </div>
            <span className="framework-foundation-caption">
              Shared tokens. A consistent interface.
            </span>
          </div>
        )}
        <div className="framework-options">
          {frameworks.map(([name, Icon]) => (
            <article className="framework-option" key={name}>
              <Icon aria-hidden="true" stroke={1.5} />
              <h3>{name}</h3>
              <span
                className="framework-availability"
                data-available={name === 'React'}
              >
                {name === 'React' ? 'Available today' : 'Planned'}
              </span>
            </article>
          ))}
        </div>
      </div>
      <div className="framework-footer">
        <p>Start with React today. More framework bindings are planned.</p>
        <a
          className="home-text-link"
          href={`${docsBase}/getting-started/why-nexus#one-token-system-many-frameworks`}
        >
          Explore the foundation <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
