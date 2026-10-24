'use client';

import { useId, useState } from 'react';

import { Button } from '@nxds/react';
import { useNxdsAppearance } from '@nxds/react/appearance';
import {
  IconAsterisk,
  IconBorderAll,
  IconBorderRadius,
  IconClock,
  IconColorSwatch,
  IconComponents,
  IconLayersIntersect,
  IconPaint,
  IconShadow,
  IconSpacingHorizontal,
  IconTypography,
  IconWaveSine,
} from '@tabler/icons-react';
import { useDialKitController } from 'dialkit';

import '../home-hero/rotating-headline-journey.css';
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
      { value: 'pipeline', label: 'Horizontal pipeline' },
      { value: 'individual', label: 'Individual connections' },
      { value: 'interactive', label: 'Interactive flow' },
      { value: 'concentric', label: 'Concentric boundaries' },
      { value: 'cards', label: 'Icon cards' },
      { value: 'connected', label: 'Connected foundation' },
      { value: 'playground', label: 'Framework playground · Zag' },
    ],
    default: 'concentric',
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
  const foundation = [
    'foundation',
    'connected',
    'pipeline',
    'individual',
    'interactive',
  ].includes(p.layout);
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
      {p.layout === 'concentric' ? (
        <ConcentricFlow />
      ) : p.layout === 'playground' ? (
        <FrameworkPlayground />
      ) : foundation ? (
        <TokenFlow interactive={p.layout === 'interactive'} />
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
        </div>
      )}
      <div className="framework-footer">
        <Button asChild variant="secondary">
          <a
            href={`${docsBase}/getting-started/why-nexus#one-token-system-many-frameworks`}
          >
            Explore the foundation
          </a>
        </Button>
      </div>
    </section>
  );
}

const tokenGroups = [
  [
    ['Theme', IconPaint, 0],
    ['Colors', IconColorSwatch, 1],
    ['Typography', IconTypography, 2],
    ['Motion', IconWaveSine, 9],
  ],
  [
    ['Spacing', IconSpacingHorizontal, 3],
    ['Radius', IconBorderRadius, 4],
    ['Borders', IconBorderAll, 5],
    ['Duration', IconClock, 10],
  ],
  [
    ['Shadows', IconShadow, 6],
    ['Components', IconComponents, 7],
    ['Icons', IconAsterisk, 8],
    ['Z-index', IconLayersIntersect, 11],
  ],
];

function ConcentricFlow() {
  const { state } = useNxdsAppearance();
  const stopped = state.prefs.reduceMotion;
  return (
    <div className="token-flow concentric-flow" data-paused={stopped}>
      <div className="token-flow-frameworks">
        {frameworks.map(([name, icon, color]) => (
          <div className="token-flow-framework" key={name}>
            <span
              className="framework-icon-tile"
              style={{ '--framework-brand': color }}
            >
              <img src={icon} alt="" width="36" height="36" />
            </span>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <svg
        className="token-flow-wires concentric-connections"
        viewBox="0 0 600 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[60, 180, 300, 420, 540].map((x) => (
          <g key={x}>
            <path d={`M 300 80 C 300 24 ${x} 56 ${x} 0`} />
            <path
              className="token-flow-pulse"
              pathLength="1"
              d={`M 300 80 C 300 24 ${x} 56 ${x} 0`}
            />
          </g>
        ))}
      </svg>
      <div className="concentric-core">
        <strong>Nexus core</strong>
      </div>
      <svg
        className="token-flow-wires concentric-connections"
        viewBox="0 0 600 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[100, 300, 500].map((x) => (
          <g key={x}>
            <path d={`M ${x} 80 C ${x} 24 300 56 300 0`} />
            <path
              className="token-flow-pulse"
              pathLength="1"
              d={`M ${x} 80 C ${x} 24 300 56 300 0`}
            />
          </g>
        ))}
      </svg>
      <div className="concentric-tokens">
        <div className="concentric-chip-grid" aria-label="Shared design tokens">
          {tokenGroups.flat().map(([label, Icon, index]) => (
            <span
              className={`token-flow-chip journey-color-${index}`}
              key={label}
            >
              <Icon size={20} stroke={1.7} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="token-flow-caption">
        <span>Shared tokens flow through Nexus core to every framework.</span>
      </div>
    </div>
  );
}

function TokenFlow({ interactive }) {
  const { state } = useNxdsAppearance();
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState('Theme');
  const selectedColor = tokenGroups
    .flat()
    .find(([label]) => label === selected)[2];
  const stopped = paused || state.prefs.reduceMotion;
  return (
    <div
      className={`token-flow journey-color-${selectedColor}`}
      data-paused={stopped}
    >
      <div className="token-flow-inputs" aria-label="Shared design tokens">
        {tokenGroups.map((group) => (
          <div className="token-flow-group" key={group[0][0]}>
            {group.map(([label, Icon, index]) =>
              interactive ? (
                <button
                  type="button"
                  className={`token-flow-chip journey-color-${index}`}
                  key={label}
                  aria-pressed={selected === label}
                  onClick={() => setSelected(label)}
                >
                  <Icon size={20} stroke={1.7} aria-hidden="true" />
                  {label}
                </button>
              ) : (
                <span
                  className={`token-flow-chip journey-color-${index}`}
                  key={label}
                >
                  <Icon size={20} stroke={1.7} aria-hidden="true" />
                  {label}
                </span>
              )
            )}
            <svg
              className="token-flow-individual-wires"
              viewBox="0 0 40 292"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {[24, 84, 144, 204].map((y, row) => {
                const lane = 32 - row * 8;
                const path = `M 0 ${y} Q ${lane} ${y} ${lane} ${y + 16} V 292`;
                return (
                  <g key={y} data-selected={selected === group[row][0]}>
                    <path d={path} />
                    <path
                      className="token-flow-pulse"
                      pathLength="1"
                      d={path}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        ))}
      </div>
      <svg
        className="token-flow-wires"
        viewBox="0 0 600 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[100, 300, 500].map((x) => (
          <g key={x}>
            <path d={`M ${x} 0 C ${x} 56 300 24 300 80`} />
            <path
              className="token-flow-pulse"
              pathLength="1"
              d={`M ${x} 0 C ${x} 56 300 24 300 80`}
            />
          </g>
        ))}
      </svg>
      <svg
        className="token-flow-horizontal token-flow-horizontal-inputs"
        viewBox="0 0 100 360"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[30, 90, 150, 210, 270, 330].map((y) => (
          <g key={y}>
            <path d={`M 0 ${y} C 60 ${y} 40 180 100 180`} />
            <path
              className="token-flow-pulse"
              pathLength="1"
              d={`M 0 ${y} C 60 ${y} 40 180 100 180`}
            />
          </g>
        ))}
      </svg>
      <div className="token-flow-core">
        <strong>Nexus core</strong>
        <span aria-live={interactive ? 'polite' : undefined}>
          {interactive
            ? `${selected} → every framework`
            : 'One shared foundation'}
        </span>
      </div>
      <svg
        className="token-flow-wires token-flow-outputs"
        viewBox="0 0 600 96"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[60, 180, 300, 420, 540].map((x) => (
          <g key={x}>
            <path d={`M 300 0 C 300 64 ${x} 32 ${x} 96`} />
            <path
              className="token-flow-pulse"
              pathLength="1"
              d={`M 300 0 C 300 64 ${x} 32 ${x} 96`}
            />
          </g>
        ))}
      </svg>
      <svg
        className="token-flow-horizontal token-flow-horizontal-outputs"
        viewBox="0 0 100 360"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[36, 108, 180, 252, 324].map((y) => (
          <g key={y}>
            <path d={`M 0 180 C 60 180 40 ${y} 100 ${y}`} />
            <path
              className="token-flow-pulse"
              pathLength="1"
              d={`M 0 180 C 60 180 40 ${y} 100 ${y}`}
            />
          </g>
        ))}
      </svg>
      <div className="token-flow-frameworks">
        {frameworks.map(([name, icon, color]) => (
          <div className="token-flow-framework" key={name}>
            <span
              className="framework-icon-tile"
              style={{ '--framework-brand': color }}
            >
              <img src={icon} alt="" width="36" height="36" />
            </span>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className="token-flow-caption">
        <span>
          {interactive
            ? 'Select a chip to trace its path.'
            : 'Shared tokens. A consistent interface.'}
        </span>
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          disabled={state.prefs.reduceMotion}
          aria-pressed={stopped}
        >
          {stopped ? 'Play flow' : 'Pause flow'}
        </button>
      </div>
    </div>
  );
}

const counterSource = `import { useState } from 'react';
import { Button } from '@nxds/react';

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
