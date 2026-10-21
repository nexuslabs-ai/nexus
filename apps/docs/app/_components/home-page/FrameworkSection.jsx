'use client';

import { useId, useState } from 'react';

import { Button } from '@nexus_ds/react';
import { useDialKitController } from 'dialkit';

import './framework-section.css';

const frameworks = [
  ['React', '/brand/frameworks/react.svg', '#61dafb'],
  ['Vue', '/brand/frameworks/vue.svg', '#42b883'],
  ['Svelte', '/brand/frameworks/svelte.svg', '#ff3e00'],
  ['Angular', '/brand/frameworks/angular.svg', '#e90464'],
  ['React Native', '/brand/frameworks/react-native.svg', '#61dafb'],
];

const config = {
  layout: {
    type: 'select',
    options: [
      { value: 'foundation', label: 'Shared foundation' },
      { value: 'cards', label: 'Icon cards' },
      { value: 'connected', label: 'Connected foundation' },
      { value: 'playground', label: 'Framework playground · Zag' },
    ],
    default: 'foundation',
  },
  typography: { titleSize: [40, 28, 56, 2] },
  spacing: {
    sectionPadding: [64, 32, 112, 8],
    contentGap: [40, 16, 72, 4],
    cardPadding: [24, 16, 48, 4],
  },
  appearance: { iconSize: [36, 24, 48, 4] },
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
  const foundation = p.layout === 'foundation' || p.layout === 'connected';
  return (
    <section
      className="home-page-section framework-section"
      data-layout={p.layout}
      aria-labelledby={id}
      style={{
        '--framework-title': `calc(var(--nx-typography-size-base) * ${p.typography.titleSize / 16})`,
        '--framework-padding': `calc(var(--nx-spacing-4) * ${p.spacing.sectionPadding / 16})`,
        '--framework-gap': `calc(var(--nx-spacing-4) * ${p.spacing.contentGap / 16})`,
        '--framework-card-padding': `calc(var(--nx-spacing-4) * ${p.spacing.cardPadding / 16})`,
        '--framework-icon': `calc(var(--nx-spacing-4) * ${p.appearance.iconSize / 16})`,
        '--framework-radius': 'var(--nx-radius-lg)',
      }}
    >
      <div className="framework-heading">
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
      {p.layout === 'playground' ? (
        <FrameworkPlayground />
      ) : (
        <div className="framework-composition">
          <div className="framework-options">
            {frameworks.map(([name, icon, color]) => (
              <article className="framework-option" key={name}>
                <span
                  className="framework-icon-tile"
                  style={{ '--framework-brand': color }}
                >
                  <img src={icon} alt={name} width="36" height="36" />
                  {name === 'React Native' && (
                    <span className="framework-native-badge" aria-hidden="true">
                      Native
                    </span>
                  )}
                </span>
              </article>
            ))}
          </div>
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
        </div>
      )}
      <div className="framework-footer">
        <Button asChild>
          <a
            href={`${docsBase}/getting-started/why-nexus#one-token-system-many-frameworks`}
          >
            Explore the foundation <span aria-hidden="true">→</span>
          </a>
        </Button>
      </div>
    </section>
  );
}

const counterSource = `import { useState } from 'react';
import { Button } from '@nexus_ds/react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}`;

function FrameworkPlayground() {
  const [selected, setSelected] = useState('React');
  const [count, setCount] = useState(0);
  return (
    <div className="framework-playground">
      <div
        className="framework-switcher"
        role="group"
        aria-label="Framework example"
      >
        {frameworks.map(([name, icon, color]) => (
          <button
            type="button"
            key={name}
            style={{ '--framework-brand': color }}
            aria-label={name}
            aria-pressed={selected === name}
            onClick={() => setSelected(name)}
          >
            <img src={icon} alt="" width="40" height="40" />
            {name === 'React Native' && (
              <span className="framework-native-badge" aria-hidden="true">
                Native
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="framework-demo-body">
        <div className="framework-source">
          <span className="home-visual-label">
            {selected === 'React' ? 'counter.tsx' : `${selected} · planned`}
          </span>
          {selected === 'React' ? (
            <pre>
              <code>{counterSource}</code>
            </pre>
          ) : (
            <div className="framework-planned">
              <h3>{selected} is on the roadmap.</h3>
              <p>
                The shared token foundation is ready. This framework binding is
                planned; there is no installable component example yet.
              </p>
              <span>Color · Typography · Spacing · Appearance</span>
            </div>
          )}
        </div>
        <div className="framework-live">
          <span className="home-visual-label">Live React preview</span>
          <div className="framework-counter">
            <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>
            <Button variant="ghost" onClick={() => setCount(0)}>
              Reset
            </Button>
          </div>
          <p>
            Real components.
            <br />
            Your appearance settings.
          </p>
        </div>
      </div>
      <div className="framework-demo-caption">
        <strong>Nexus core</strong>
        <span>One foundation beneath every framework.</span>
      </div>
    </div>
  );
}
