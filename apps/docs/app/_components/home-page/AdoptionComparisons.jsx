'use client';

import { useId, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nxds/react';
import { useNxdsAppearance } from '@nxds/react/appearance';

import './adoption-comparisons.css';

function Preview({ title, subtitle, src }) {
  const { resolvedMode } = useNxdsAppearance();
  return (
    <article className="adoption-preview">
      <header>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </header>
      <iframe
        title={title}
        src={`${src}&mode=${resolvedMode}`}
        loading="lazy"
      />
    </article>
  );
}
function ComparisonPair({ reveal, leftLabel, rightLabel, children }) {
  const [position, setPosition] = useState(50);
  if (!reveal) return <div className="adoption-pair">{children}</div>;
  return (
    <div
      className="adoption-reveal"
      style={{ '--reveal-position': `${position}%` }}
    >
      <div className="adoption-reveal-labels">
        <strong>{leftLabel}</strong>
        <strong>{rightLabel}</strong>
      </div>
      <div className="adoption-reveal-stage">
        <div className="adoption-reveal-layers" inert="">
          {children}
        </div>
        <div className="adoption-reveal-divider" aria-hidden="true">
          <span>↔</span>
        </div>
        <input
          className="adoption-reveal-input"
          type="range"
          min="0"
          max="100"
          step="1"
          value={position}
          aria-label={`Compare ${leftLabel} and ${rightLabel}`}
          aria-valuetext={`${position}% ${leftLabel}, ${100 - position}% ${rightLabel}`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
export default function AdoptionComparisons({ reveal = false }) {
  const [library, setLibrary] = useState('MUI');
  const id = useId();
  return (
    <div className="adoption-comparisons">
      <section className="adoption-case" aria-labelledby={`${id}-0`}>
        <div className="adoption-heading">
          <h2 id={`${id}-0`}>Keep your app’s visual identity.</h2>
          <p>
            Your theme already has a language. New components should respect it.
          </p>
        </div>
        <ComparisonPair
          reveal={reveal}
          leftLabel="HeroUI + shadcn"
          rightLabel="HeroUI + Nexus"
        >
          <Preview
            title="HeroUI + shadcn"
            subtitle="Shared global tokens change the host theme"
            src="/coexistence-preview/hero.html?integration=shadcn"
          />
          <Preview
            title="HeroUI + Nexus"
            subtitle="The existing theme stays intact"
            src="/coexistence-preview/hero.html?integration=nexus"
          />
        </ComparisonPair>
        <p className="adoption-caption">
          Real HeroUI v3 components · shadcn’s default global tokens replace the
          accent and muted text colors. Nexus uses its own token names. This
          compares adding the default stylesheets; scoped or customized shadcn
          themes can avoid these collisions.
        </p>
      </section>
      <section className="adoption-case" aria-labelledby={`${id}-1`}>
        <div className="adoption-heading">
          <h2 id={`${id}-1`}>Keep the rest of your app intact.</h2>
          <p>
            Library components, native elements, and your own CSS—all sharing
            one screen.
          </p>
        </div>
        <Tabs value={library} onValueChange={setLibrary}>
          <div className="adoption-switcher">
            <TabsList aria-label="Existing component library">
              {['MUI', 'Ant Design'].map((name) => (
                <TabsTrigger key={name} value={name}>
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {['MUI', 'Ant Design'].map((name) => (
            <TabsContent value={name} key={name}>
              <ComparisonPair
                reveal={reveal}
                leftLabel={`${name} + shadcn`}
                rightLabel={`${name} + Nexus`}
              >
                <Preview
                  title={`${name} + shadcn`}
                  subtitle="Native content picks up Tailwind Preflight"
                  src={`/coexistence-preview/comparison.html?library=${encodeURIComponent(name)}&example=billing&integration=shadcn`}
                />
                <Preview
                  title={`${name} + Nexus`}
                  subtitle="Native content retains its existing styles"
                  src={`/coexistence-preview/comparison.html?library=${encodeURIComponent(name)}&example=billing&integration=nexus`}
                />
              </ComparisonPair>
            </TabsContent>
          ))}
        </Tabs>
        <p className="adoption-caption">
          This example shows native heading and list changes, not a claim that
          all MUI or Ant components break.
        </p>
      </section>
      <section className="adoption-case" aria-labelledby={`${id}-2`}>
        <div className="adoption-heading">
          <h2 id={`${id}-2`}>Expand what your app can do.</h2>
          <p>
            Keep your shadcn components. Introduce Nexus where you need more
            control.
          </p>
        </div>
        <ComparisonPair
          reveal={reveal}
          leftLabel="Your shadcn app"
          rightLabel="Your app + Nexus"
        >
          <Preview
            title="Your shadcn app"
            subtitle="Default and destructive alerts, without custom variants"
            src="/coexistence-preview/adoption.html?integration=shadcn"
          />
          <Preview
            title="Your app + Nexus"
            subtitle="Built-in information, warning, success, and destructive alerts"
            src="/coexistence-preview/adoption.html?integration=nexus"
          />
        </ComparisonPair>
        <p className="adoption-caption">
          Both include destructive alerts. Information, warning, and success use
          the default alert on the shadcn side; Nexus provides dedicated
          variants. shadcn can be extended with your own styles.
        </p>
      </section>
    </div>
  );
}
