'use client';
import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@nxds/react';
import { useNxdsAppearance } from '@nxds/react/appearance';

import { CodeBlock } from '../CodeBlock';
import { CopyAnnouncerProvider } from '../CopyAnnouncer';

import { HighlightedLines } from './CoexistenceVisualCode';
import { cssConflictExamples } from './css-conflict-examples.mjs';

import './coexistence-code.css';
import './css-comparison.css';

function ComparisonRun({ library, mode, example }) {
  const run = useId();
  const left = useRef(null);
  const right = useRef(null);
  const [reports, setReports] = useState({});
  const [view, setView] = useState('conflicts');
  useEffect(() => {
    function receive(event) {
      if (event.origin !== location.origin) return;
      const data = event.data;
      if (
        !data ||
        data.type !== 'nexus-css-comparison' ||
        data.run !== run ||
        data.library !== library
      )
        return;
      const side =
        event.source === left.current?.contentWindow
          ? 'shadcn'
          : event.source === right.current?.contentWindow
            ? 'nexus'
            : null;
      if (!side || data.integration !== side || !Array.isArray(data.rows))
        return;
      setReports((current) => ({ ...current, [side]: data }));
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [run, library]);
  function source(integration) {
    return `/coexistence-preview/comparison.html?library=${encodeURIComponent(library)}&mode=${mode}&integration=${integration}&run=${encodeURIComponent(run)}&example=${example}`;
  }
  const verified = cssConflictExamples[example];
  const complete = reports.shadcn && reports.nexus;
  const addedButton = reports.shadcn?.addedButton;
  const baselinesMatch =
    complete &&
    reports.shadcn.rows.every(
      (row, index) => row.before === reports.nexus.rows[index]?.before
    );
  const nexusChanges = complete
    ? reports.nexus.rows.filter((row) => row.before !== row.after).length
    : 0;
  const hostChanges = complete
    ? reports.shadcn.rows.filter(
        (row) => row.label.startsWith('Host') && row.before !== row.after
      ).length
    : 0;
  const changes = complete
    ? reports.shadcn.rows
        .map((row, index) => ({
          ...row,
          nexus: reports.nexus.rows[index]?.after,
        }))
        .filter((row) => row.before !== row.after || row.before !== row.nexus)
    : [];
  return (
    <>
      <div className="css-comparison-previews" data-verified={!!verified}>
        <article>
          <header>
            <h3>{library} + shadcn</h3>
            <p>Default shadcn globals + Tailwind Preflight</p>
          </header>
          <iframe
            ref={left}
            title={`${library} with shadcn CSS comparison`}
            src={source('shadcn')}
          />
        </article>
        <article>
          <header>
            <h3>{library} + Nexus</h3>
            <p>Nexus tokens + appearance provider</p>
          </header>
          <iframe
            ref={right}
            title={`${library} with Nexus CSS comparison`}
            src={source('nexus')}
          />
        </article>
      </div>
      <div className="css-comparison-results">
        <div
          className="css-comparison-tabs"
          role="group"
          aria-label="Comparison details"
        >
          <Button
            size="sm"
            variant={view === 'conflicts' ? 'secondary' : 'ghost'}
            aria-pressed={view === 'conflicts'}
            onClick={() => setView('conflicts')}
          >
            CSS findings
          </Button>
          {!verified && (
            <Button
              size="sm"
              variant={view === 'code' ? 'secondary' : 'ghost'}
              aria-pressed={view === 'code'}
              onClick={() => setView('code')}
            >
              Integration code
            </Button>
          )}
        </div>
        {view === 'conflicts' ? (
          <div className="css-findings">
            <h3>Measured against the same host-only screen</h3>
            <p>
              {verified
                ? verified.explanation
                : `Each preview measures the same screen before and after integration. The title, input and Save button are real ${library} components; the content is native HTML.`}
            </p>
            {verified && (
              <pre className="css-exact-rule">
                <code>{verified.css}</code>
              </pre>
            )}
            {!complete ? (
              <p role="status">Measuring both previews…</p>
            ) : reports.shadcn.error ||
              reports.nexus.error ||
              !baselinesMatch ? (
              <p role="alert">
                The previews could not establish matching baselines. No
                comparison is available.
              </p>
            ) : (
              <>
                <p>
                  {changes.length
                    ? `${changes.length} property differences detected.`
                    : 'No differences detected in the checked properties.'}{' '}
                  Unchanged properties are omitted below.
                </p>
                <p>
                  {!verified &&
                    (hostChanges === 0
                      ? 'The checked host title, input and Save-button properties are unchanged.'
                      : `${hostChanges} host component properties changed.`)}{' '}
                  Nexus changed {nexusChanges} of the checked existing-element
                  properties.
                </p>
                {changes.length > 0 && (
                  <div className="css-findings-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Element / property</th>
                          <th>Before</th>
                          <th>+ shadcn</th>
                          <th>+ Nexus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {changes.map((row) => (
                          <tr key={`${row.label}-${row.property}`}>
                            <th>
                              {row.label}
                              <code>{row.property}</code>
                            </th>
                            <td>{row.before}</td>
                            <td data-changed={row.before !== row.after}>
                              {row.after}
                            </td>
                            <td data-changed={row.before !== row.nexus}>
                              {row.nexus}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {addedButton && (
                  <section aria-label="Added shadcn button diagnosis">
                    <h3>Added shadcn action button</h3>
                    <p>
                      This button is new, so it is checked separately from the
                      existing-screen baseline above.
                    </p>
                    <div className="css-findings-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Property</th>
                            <th>Utility intends</th>
                            <th>Computed</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>Text color</th>
                            <td>
                              <code>text-primary-foreground</code>
                              <br />
                              {addedButton.expectedColor}
                            </td>
                            <td>{addedButton.color}</td>
                          </tr>
                          <tr>
                            <th>Background</th>
                            <td>
                              <code>bg-primary</code>
                            </td>
                            <td>{addedButton.background}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {addedButton.unlayeredRules.some(
                      (rule) => rule.color === 'inherit'
                    ) ? (
                      <>
                        <p>
                          The host reset applies an unlayered{' '}
                          <code>color: inherit</code> rule to this button.
                          Unlayered normal declarations outrank Tailwind’s
                          layered utilities, including{' '}
                          <code>.text-primary-foreground</code>. The button
                          inherits {addedButton.inheritedColor} from its parent
                          while <code>.bg-primary</code> still supplies the
                          background.
                        </p>
                        {addedButton.unlayeredRules.map((rule) => (
                          <pre key={rule.selector}>
                            <code>{`${rule.selector} { color: ${rule.color}; }`}</code>
                          </pre>
                        ))}
                        <p>
                          In this Ant Design setup, the rule comes from{' '}
                          <code>antd/dist/reset.css</code>. Putting the host
                          reset in a lower-priority CSS layer, or scoping it
                          away from the added components, resolves this cascade
                          conflict.
                        </p>
                      </>
                    ) : (
                      <p>
                        No unlayered host text-color rule matches this button in
                        this setup.
                      </p>
                    )}
                  </section>
                )}
                <p className="css-findings-note">
                  This tests default global imports in this setup—not every
                  shadcn integration. Tailwind Preflight resets native headings,
                  lists and spacing. Explicit host component styles can remain
                  unchanged. Disabling or scoping those globals can avoid these
                  conflicts.
                </p>
              </>
            )}
          </div>
        ) : (
          <CopyAnnouncerProvider>
            <CodeBlock
              className="coexist-github-code"
              framed
              aria-label="CSS integration comparison code"
            >
              <HighlightedLines sample="css-comparison" />
            </CodeBlock>
          </CopyAnnouncerProvider>
        )}
      </div>
    </>
  );
}
export default function CssComparison() {
  const { resolvedMode } = useNxdsAppearance();
  const [library, setLibrary] = useState('MUI');
  const [example, setExample] = useState('ant-tabs');
  return (
    <div className="css-comparison">
      <div
        className="coexist-demo-controls"
        role="group"
        aria-label="Comparison example"
      >
        {Object.entries({
          ...Object.fromEntries(
            Object.entries(cssConflictExamples).map(([key, value]) => [
              key,
              value.label,
            ])
          ),
          billing: 'Billing',
          article: 'Help article',
          team: 'Team management',
          product: 'Product details',
          original: 'Original settings',
        }).map(([value, label]) => (
          <Button
            key={value}
            variant={example === value ? 'default' : 'outline'}
            aria-pressed={example === value}
            onClick={() => setExample(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      {!cssConflictExamples[example]?.library && (
        <div
          className="coexist-demo-controls"
          role="group"
          aria-label="Comparison host library"
        >
          {['MUI', 'Ant Design'].map((name) => (
            <Button
              key={name}
              variant={library === name ? 'default' : 'outline'}
              aria-pressed={library === name}
              onClick={() => setLibrary(name)}
            >
              {name}
            </Button>
          ))}
        </div>
      )}
      <ComparisonRun
        key={`${library}-${resolvedMode}-${example}`}
        example={example}
        library={cssConflictExamples[example]?.library || library}
        mode={resolvedMode}
      />
    </div>
  );
}
