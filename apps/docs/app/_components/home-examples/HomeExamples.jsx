'use client';
import { useId, useRef, useState } from 'react';

import { Button } from '@nxds/react';

import { DataExample } from './DataExample';
import sources from './example-sources.json';
import { OnboardingExample } from './OnboardingExample';
import { SettingsExample } from './SettingsExample';

import './home-examples.css';

const examples = [
  {
    title: 'Settings',
    description: 'A home for preferences.',
    component: SettingsExample,
    file: 'SettingsExample.jsx',
  },
  {
    title: 'Data workspace',
    description: 'Bring the work into focus.',
    component: DataExample,
    file: 'DataExample.jsx',
  },
  {
    title: 'Onboarding',
    description: 'Make the first step easy.',
    component: OnboardingExample,
    file: 'OnboardingExample.jsx',
  },
];
export function HomeExamples() {
  const id = useId();
  const preview = useRef(null);
  const [selected, setSelected] = useState(0);
  const [code, setCode] = useState(false);
  const [stylesheet, setStylesheet] = useState(false);
  const example = examples[selected];
  const Example = example.component;
  function select(index) {
    setSelected(index);
    setCode(false);
  }
  function explore() {
    setCode(false);
    requestAnimationFrame(() => preview.current?.focus());
  }
  return (
    <section
      className="home-examples"
      id="working-examples"
      aria-labelledby={`${id}-title`}
    >
      <header className="home-examples-intro">
        <span className="example-eyebrow">FROM COMPONENTS TO PRODUCTS</span>
        <h2 id={`${id}-title`}>Start with something real.</h2>
        <p>
          Small pieces. Complete experiences. Try them, take the code, make them
          yours.
        </p>
      </header>
      <div className="home-example-picker" aria-label="Choose an example">
        {examples.map((item, index) => (
          <button
            type="button"
            key={item.title}
            aria-pressed={selected === index}
            onClick={() => select(index)}
          >
            <span className="example-number">0{index + 1}</span>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>
      <div className="home-example-frame">
        <div className="home-example-bar">
          <span>
            <strong>Studio North</strong>
            <span className="example-bar-divider"> / </span>
            {example.title}
          </span>
          <div>
            <Button
              size="sm"
              variant={code ? 'ghost' : 'outline'}
              onClick={explore}
            >
              Explore example
            </Button>
            <Button
              size="sm"
              variant={code ? 'outline' : 'ghost'}
              aria-pressed={code}
              onClick={() => setCode(!code)}
            >
              View code
            </Button>
          </div>
        </div>
        <div
          ref={preview}
          tabIndex={-1}
          className="home-example-preview"
          aria-label={`${example.title} live example`}
        >
          {code ? (
            <div className="example-code">
              <div className="example-toolbar">
                <strong>
                  {stylesheet ? 'home-examples.css' : example.file}
                </strong>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStylesheet(!stylesheet)}
                >
                  {stylesheet ? 'View JSX' : 'View CSS'}
                </Button>
              </div>
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to focus this scrollable source region. */}
              <pre tabIndex={0} role="region" aria-label="Example source code">
                <code>
                  {sources[stylesheet ? 'home-examples.css' : example.file]}
                </code>
              </pre>
            </div>
          ) : (
            <Example key={selected} />
          )}
        </div>
      </div>
      <p className="home-examples-note">
        Built with Nexus components. Fully interactive, right here.
      </p>
    </section>
  );
}
